import { getInternalLinks } from '../handlers/getInternalLinks.js';
import { scrapeCleanContent } from '../services/getWebsiteContent.js';
import processClusters from '../services/getNewKeywords.js';
import { processMultipleContents } from '../services/getKeywords.js';
import { getContentIdeasAndHeadlines } from '../services/getContentIdeas.js';

export const getInternalLinksHandler = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'Please provide a single URL' });
        }

        const result = await getInternalLinks([url]);
        res.json(result);
    } catch (error) {
        console.error('Error in getInternalLinksHandler:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getWebsiteContentHandler = async (req, res) => {
    try {
        const { urls } = req.body;
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of URLs' });
        }

        // Process only the provided URLs, don't follow links
        const result = await scrapeCleanContent(urls, false);
        res.json(result);
    } catch (error) {
        console.error('Error in getWebsiteContentHandler:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getNewKeywordsHandler = async (req, res) => {
    try {
        const { csvInput } = req.body;
        if (!csvInput || typeof csvInput !== 'string') {
            return res.status(400).json({ error: 'Please provide a CSV string input' });
        }

        const result = await processClusters(csvInput);
        res.json({ csv: result });
    } catch (error) {
        console.error('Error in getNewKeywordsHandler:', error);
        res.status(500).json({ error: error.message });
    }
};

export const processMultipleContentsHandler = async (req, res) => {
    try {
        const { contents, countryCode } = req.body;
        if (!contents || !Array.isArray(contents) || contents.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of content objects with content and website properties' });
        }

        const result = await processMultipleContents(contents, countryCode);
        res.json({ csv: result });
    } catch (error) {
        console.error('Error in processMultipleContentsHandler:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getContentIdeasAndHeadlinesHandler = async (req, res) => {
    try {
        const { keyword } = req.body;
        if (!keyword || typeof keyword !== 'string') {
            return res.status(400).json({ error: 'Please provide a keyword string' });
        }

        const result = await getContentIdeasAndHeadlines(keyword);
        res.json(result);
    } catch (error) {
        console.error('Error in getContentIdeasAndHeadlinesHandler:', error);
        res.status(500).json({ error: error.message });
    }
}; 