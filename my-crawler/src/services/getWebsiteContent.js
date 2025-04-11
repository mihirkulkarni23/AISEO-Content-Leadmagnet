import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Configuration from environment variables with validation
const MAX_CONCURRENCY = parseInt(process.env.MAX_CONCURRENCY) || 20;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 30000;
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES) || 3;
const MAX_REQUESTS_PER_MINUTE = parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 200;
const CONTENT_PREVIEW_LENGTH = parseInt(process.env.CONTENT_PREVIEW_LENGTH) || 200;
const USER_SESSION_TIMEOUT = parseInt(process.env.USER_SESSION_TIMEOUT) || 3600000; // 1 hour timeout for user sessions
const SESSION_CLEANUP_INTERVAL = parseInt(process.env.SESSION_CLEANUP_INTERVAL) || 300000; // 5 minutes

// Validate required environment variables
const requiredEnvVars = [
    'MAX_CONCURRENCY',
    'REQUEST_TIMEOUT',
    'MAX_RETRIES',
    'MAX_REQUESTS_PER_MINUTE',
    'CONTENT_PREVIEW_LENGTH'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.warn(`Warning: ${varName} environment variable is not set, using default value`);
    }
});

// Validate configuration
if (MAX_CONCURRENCY < 1 || REQUEST_TIMEOUT < 1000 || MAX_RETRIES < 1 || MAX_REQUESTS_PER_MINUTE < 1) {
    throw new Error('Invalid configuration parameters');
}

// Helper function to validate URL
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

// Store for active crawlers and their associated resources
const activeCrawlers = new Map();
// Store for request queues to enable proper cleanup
const activeRequestQueues = new Map();
// User session management
const userSessions = new Map();

// Function to create a unique session ID for each user request
const createSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Setup periodic cleanup of expired sessions
setInterval(async () => {
    const now = Date.now();
    const expiredSessions = [];
    
    // Identify expired sessions
    for (const [sid, data] of userSessions.entries()) {
        if (now - data.startTime > USER_SESSION_TIMEOUT) {
            expiredSessions.push(sid);
        }
    }
    
    // Clean up expired sessions
    for (const sid of expiredSessions) {
        await cleanupSession(sid);
    }
}, SESSION_CLEANUP_INTERVAL);

// Function to clean up session resources
const cleanupSession = async (sessionId) => {
    try {
        // Stop any active crawler
        await stopCrawler(sessionId);
        
        // Clean up request queue
        const requestQueue = activeRequestQueues.get(sessionId);
        if (requestQueue) {
            await requestQueue.drop();
            activeRequestQueues.delete(sessionId);
        }
        
        // Remove session data
        userSessions.delete(sessionId);
        
        console.log(`Session ${sessionId} cleaned up successfully`);
    } catch (error) {
        console.error(`Error cleaning up session ${sessionId}:`, error);
    }
};

// Function to stop an active crawler
const stopCrawler = async (sessionId) => {
    const crawler = activeCrawlers.get(sessionId);
    if (crawler) {
        try {
            // Abort the crawler gracefully
            await crawler.abort();
            
            // Ensure browser resources are released
            if (crawler.browserPool) {
                await crawler.browserPool.destroy();
            }
            
            activeCrawlers.delete(sessionId);
            console.log(`Crawler for session ${sessionId} stopped and resources released`);
            return true;
        } catch (error) {
            console.error(`Error stopping crawler for session ${sessionId}:`, error);
            return false;
        }
    }
    return false;
};

// Function to scrape and clean content using Readability for multiple URLs with enhanced resource management
const scrapeCleanContent = async (urls, followLinks = false, sessionId = null, abortSignal = null) => {
    // Create a new session if none provided
    if (!sessionId) {
        sessionId = createSessionId();
    } else {
        // If session exists but has a running crawler, stop it first
        await stopCrawler(sessionId);
    }

    // Initialize session data
    const sessionData = {
        results: {},
        processingTimes: {},
        errors: new Set(),
        processedUrls: new Set(),
        startTime: Date.now(),
        isAborted: false
    };
    userSessions.set(sessionId, sessionData);

    // Set up abort signal listener if provided
    if (abortSignal) {
        abortSignal.addEventListener('abort', async () => {
            sessionData.isAborted = true;
            await stopCrawler(sessionId);
        }, { once: true });
    }

    // Create and store the request queue for this session
    const requestQueue = await RequestQueue.open(`queue_${sessionId}`);
    activeRequestQueues.set(sessionId, requestQueue);

    // Validate and deduplicate URLs before adding to queue
    const uniqueUrls = [...new Set(urls)];
    for (const url of uniqueUrls) {
        if (!isValidUrl(url)) {
            sessionData.errors.add(`Invalid URL provided: ${url}`);
            continue;
        }
        if (!sessionData.processedUrls.has(url)) {
            await requestQueue.addRequest({ 
                url,
                userData: { 
                    followLinks,
                    sessionId
                }
            });
            sessionData.processedUrls.add(url);
        }
    }

    const crawler = new PlaywrightCrawler({
        maxConcurrency: MAX_CONCURRENCY,
        maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
        requestHandlerTimeoutSecs: REQUEST_TIMEOUT / 1000, // Convert to seconds
        maxRequestRetries: MAX_RETRIES,
        requestQueue,
        browserPoolOptions: {
            preLaunchHooks: [(pageId, launchContext) => {
                launchContext.launchOptions = {
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    args: ['--disable-dev-shm-usage', '--no-sandbox']
                };
            }]
        },
        async requestHandler({ page, request, log }) {
            const { sessionId } = request.userData;
            const sessionData = userSessions.get(sessionId);
            
            if (!sessionData) {
                log.error(`Session ${sessionId} not found`);
                return;
            }

            // Check if the operation should be aborted
            if (sessionData.isAborted) {
                log.info(`Skipping ${request.url} - session has been aborted`);
                return;
            }

            try {
                const startTime = new Date().toISOString();
                sessionData.processingTimes[request.url] = { start: startTime };
                log.info(`Starting to process: ${request.url} at ${startTime}`);

                // Add timeout for page operations
                const htmlContent = await Promise.race([
                    page.content(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout while fetching page content')), REQUEST_TIMEOUT)
                    )
                ]);

                const dom = new JSDOM(htmlContent, { url: request.url });
                const reader = new Readability(dom.window.document);
                const article = reader.parse();

                if (article && article.textContent) {
                    const cleanText = article.textContent.replace(/\s+/g, ' ').trim();
                    sessionData.results[request.url] = cleanText;
                    const endTime = new Date().toISOString();
                    sessionData.processingTimes[request.url].end = endTime;
                    log.info(`Finished processing: ${request.url} at ${endTime}`);
                } else {
                    sessionData.errors.add(`Could not extract readable content from: ${request.url}`);
                    log.warning(`Could not extract readable content from: ${request.url}`);
                }
            } catch (error) {
                sessionData.errors.add(`Error processing ${request.url}: ${error.message}`);
                log.error(`Error processing ${request.url}:`, error);
            }
        },
        async failedRequestHandler({ request, log, error }) {
            const { sessionId } = request.userData;
            const sessionData = userSessions.get(sessionId);
            
            if (!sessionData) {
                log.error(`Session ${sessionId} not found`);
                return;
            }

            // Only add to errors if we haven't successfully processed this URL before
            if (!sessionData.results[request.url]) {
                sessionData.errors.add(`Failed to scrape ${request.url}: ${error.message}`);
                log.error(`Failed to scrape ${request.url}:`, error);
            }
        }
    });

    // Store the crawler in active crawlers map
    activeCrawlers.set(sessionId, crawler);

    try {
        await crawler.run();
    } catch (error) {
        console.error(`Crawler execution error for session ${sessionId}:`, error);
        sessionData.errors.add(`Crawler execution error: ${error.message}`);
    } finally {
        // Clean up browser resources
        if (crawler.browserPool) {
            await crawler.browserPool.destroy();
        }
        
        // Remove from active crawlers
        activeCrawlers.delete(sessionId);
    }

    return {
        sessionId,
        results: sessionData.results,
        processingTimes: sessionData.processingTimes,
        errors: Array.from(sessionData.errors)
    };
};

// Export functions for external use
export { 
    scrapeCleanContent, 
    createSessionId,
    stopCrawler,
    cleanupSession
};