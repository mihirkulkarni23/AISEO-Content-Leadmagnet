import express from 'express';
import {
    getInternalLinksHandler,
    getWebsiteContentHandler,
    processMultipleContentsHandler,
    getNewKeywordsHandler,
    getContentIdeasAndHeadlinesHandler
} from '../controllers/crawlerController.js';

const router = express.Router();

// Route to get internal links from a website
router.post('/internal-links', getInternalLinksHandler);

// Route to get website content
router.post('/website-content', getWebsiteContentHandler);

// Route to get keywords from content
router.post('/keywords', processMultipleContentsHandler);

// Route to get new keywords based on existing clusters
router.post('/new-keywords', getNewKeywordsHandler);

// Route to get content ideas and headlines for a keyword
router.post('/content-ideas', getContentIdeasAndHeadlinesHandler);

export default router; 