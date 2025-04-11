import { PlaywrightCrawler, RequestQueue } from 'crawlee';

// Configuration
const MAX_DEPTH = 2;
const MAX_PAGES = 10;
const TOTAL_PAGES = 5;
const MAX_CONCURRENCY = 10; // Increased for better concurrency
const MAX_REQUESTS_PER_MINUTE = 100; // Increased for better throughput
const REQUEST_TIMEOUT = 60000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds delay between retries
const USER_SESSION_TIMEOUT = 3600000; // 1 hour timeout for user sessions
const SESSION_CLEANUP_INTERVAL = 300000; // Clean up sessions every 5 minutes

// Validate configuration
if (MAX_DEPTH < 0 || MAX_PAGES < 1 || TOTAL_PAGES < 1 || MAX_CONCURRENCY < 1 || MAX_REQUESTS_PER_MINUTE < 1) {
    throw new Error('Invalid configuration parameters');
}

const nonContentKeywords = [
    'pricing', 'price',
    'login', 'signin', 'sign-in', 'signin', 'signon', 'sign-on',
    'register', 'signup', 'sign-up', 'signup',
    'help', 'support',
    'contact', 'contactus', 'contact-us',
    'about', 'aboutus', 'about-us',
    'terms', 'privacy',
    'cart', 'checkout',
    'account', 'my-account',
    'faq', 'careers'
];

// Helper function to detect non-content URLs
const isNonContentUrl = (url) => {
    const urlLower = url.toLowerCase();
    // Check for exact matches and variations
    return nonContentKeywords.some(keyword => {
        // Check for exact keyword match
        if (urlLower.includes(keyword)) {
            // Additional check to avoid false positives
            // For example, "sign-on" should match but "signature" should not
            const parts = urlLower.split(/[\/\-]/);
            return parts.some(part => part === keyword || part.startsWith(keyword + '-') || part.endsWith('-' + keyword));
        }
        return false;
    });
};

// Enhanced URL normalization
const normalizeUrl = (url) => {
    try {
        // Add https:// if no protocol is specified
        let urlToNormalize = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            urlToNormalize = 'https://' + url;
        }
        
        const normalizedUrl = new URL(urlToNormalize);
        // Remove www. prefix and normalize to lowercase
        let normalized = normalizedUrl.toString().toLowerCase();
        normalized = normalized.replace(/^https?:\/\/www\./, 'https://');
        
        // Remove trailing slash except for root URLs
        if (normalized.endsWith('/') && normalized.length > normalizedUrl.origin.length + 1) {
            normalized = normalized.slice(0, -1);
        }
        return normalized;
    } catch (e) {
        return null;
    }
};

// Enhanced URL validation
const isValidUrl = (url) => {
    try {
        const normalizedUrl = normalizeUrl(url);
        if (!normalizedUrl) return false;
        
        // Check for valid protocol
        const protocol = new URL(normalizedUrl).protocol;
        if (!['http:', 'https:'].includes(protocol)) return false;
        
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

// Function to get internal links with enhanced session management
export const getInternalLinks = async (startUrls, sessionId = null, abortSignal = null) => {
    // Create a new session if none provided
    if (!sessionId) {
        sessionId = createSessionId();
    } else {
        // If session exists but has a running crawler, stop it first
        await stopCrawler(sessionId);
    }

    // Initialize session data
    const sessionData = {
        visitedPages: new Set(),
        internalLinks: new Set(),
        errors: new Set(),
        startTime: Date.now(),
        shouldStopCrawling: false,
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

    // Validate and add start URLs to queue
    for (const url of startUrls) {
        if (!isValidUrl(url)) {
            sessionData.errors.add(`Invalid URL provided: ${url}`);
            continue;
        }
        await requestQueue.addRequest({ 
            url,
            userData: { 
                depth: 0,
                sessionId
            }
        });
    }

    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: MAX_PAGES,
        maxConcurrency: MAX_CONCURRENCY,
        maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
        requestHandlerTimeoutSecs: REQUEST_TIMEOUT,
        maxRequestRetries: MAX_RETRIES,
        minConcurrency: 1,
        requestQueue,
        browserPoolOptions: {
            preLaunchHooks: [(pageId, launchContext) => {
                launchContext.launchOptions = {
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    timeout: REQUEST_TIMEOUT,
                    args: ['--disable-dev-shm-usage', '--no-sandbox']
                };
            }]
        },
        // Add hooks for crawler lifecycle events
        async failedRequestHandler({ request, log, error }) {
            const { sessionId } = request.userData;
            const sessionData = userSessions.get(sessionId);
            
            if (!sessionData) {
                log.error(`Session ${sessionId} not found`);
                return;
            }

            const normalizedUrl = normalizeUrl(request.url);
            log.error(`Request ${normalizedUrl || request.url} failed:`, error);
            sessionData.errors.add(`Failed request: ${normalizedUrl || request.url} - ${error.message}`);
        },
        async requestHandler({ request, page, enqueueLinks, log }) {
            const { sessionId, depth } = request.userData;
            const sessionData = userSessions.get(sessionId);
            
            if (!sessionData) {
                log.error(`Session ${sessionId} not found`);
                return;
            }

            // Check if the crawler should be stopped
            if (sessionData.isAborted || sessionData.shouldStopCrawling) {
                log.info('Stopping crawler - either manually aborted or target number of links reached');
                return;
            }

            try {
                const currentUrl = normalizeUrl(request.url);
                if (!currentUrl) {
                    log.error(`Invalid URL encountered: ${request.url}`);
                    sessionData.errors.add(`Invalid URL: ${request.url}`);
                    return;
                }

                if (depth > MAX_DEPTH) {
                    log.info(`Skipping ${currentUrl} - max depth ${MAX_DEPTH} reached`);
                    return;
                }

                if (isNonContentUrl(currentUrl)) {
                    log.info(`Skipping non-content page: ${currentUrl}`);
                    return;
                }

                // Only check visited pages if we're not at depth 0 (initial URL)
                if (depth > 0 && sessionData.visitedPages.has(currentUrl)) {
                    log.info(`Skipping already visited URL: ${currentUrl}`);
                    return;
                }

                sessionData.visitedPages.add(currentUrl);
                log.info(`Processing ${currentUrl} at depth ${depth}`);

                // Enhanced page loading with better error handling
                try {
                    await page.goto(currentUrl, {
                        waitUntil: 'networkidle',
                        timeout: REQUEST_TIMEOUT
                    });
                } catch (error) {
                    if (error.message.includes('ERR_EMPTY_RESPONSE')) {
                        log.warning(`Empty response received for ${currentUrl}, retrying after delay...`);
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                        return;
                    }
                    throw error;
                }

                // Add timeout for page operations with better error handling
                const links = await Promise.race([
                    page.$$eval('a', anchors => anchors.map(anchor => anchor.href)),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout while extracting links')), REQUEST_TIMEOUT)
                    )
                ]);

                const baseUrl = new URL(currentUrl).origin;

                // Process links found on the page with enhanced validation
                for (const link of links) {
                    try {
                        if (sessionData.isAborted || sessionData.shouldStopCrawling) break;

                        const normalizedLink = normalizeUrl(link);
                        if (!normalizedLink) {
                            log.warning(`Invalid link found: ${link}`);
                            continue;
                        }

                        const url = new URL(normalizedLink);
                        if (
                            url.origin === baseUrl &&
                            !isNonContentUrl(url.href) &&
                            !url.hash &&
                            !sessionData.visitedPages.has(url.href)
                        ) {
                            sessionData.internalLinks.add(url.href);
                            log.info(`Added internal link: ${url.href}`);
                            
                            if (sessionData.internalLinks.size >= TOTAL_PAGES) {
                                sessionData.shouldStopCrawling = true;
                                log.info('Target number of links reached, stopping crawler');
                                break;
                            }
                        }
                    } catch (e) {
                        log.warning(`Error processing link: ${link}`, e);
                        sessionData.errors.add(`Link processing error: ${link}`);
                    }
                }

                // Only enqueue links if we haven't reached the total pages limit
                if (!sessionData.isAborted && !sessionData.shouldStopCrawling && sessionData.internalLinks.size < TOTAL_PAGES) {
                    const filteredLinks = links.filter(link => {
                        try {
                            if (!isValidUrl(link)) return false;
                            const url = new URL(link);
                            return (
                                url.origin === baseUrl &&
                                !isNonContentUrl(url.href) &&
                                !url.hash &&
                                !sessionData.visitedPages.has(url.href)
                            );
                        } catch (e) {
                            log.warning(`Error filtering link: ${link}`, e);
                            return false;
                        }
                    });

                    // Enqueue links with priority to reach our target faster
                    await enqueueLinks({
                        urls: filteredLinks,
                        userData: {
                            depth: depth + 1,
                            sessionId
                        }
                    });
                }
            } catch (error) {
                log.error(`Error in requestHandler for ${request.url}:`, error);
                sessionData.errors.add(`Request handler error: ${request.url} - ${error.message}`);
                
                // Add specific handling for common errors
                if (error.message.includes('net::ERR_CONNECTION_TIMED_OUT')) {
                    log.warning(`Connection timeout for ${request.url}, will retry`);
                } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
                    log.warning(`Connection refused for ${request.url}, will retry`);
                }
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
        internalLinks: Array.from(sessionData.internalLinks),
        errors: Array.from(sessionData.errors)
    };
};

// Export functions for external use
export { 
    createSessionId,
    stopCrawler,
    cleanupSession
};