import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

if (!process.env.KEYWORDEVERYWHERE_API_KEY) {
    throw new Error('KEYWORDEVERYWHERE_API_KEY environment variable is not set');
}

const KEYWORDEVERYWHERE_API_KEY = process.env.KEYWORDEVERYWHERE_API_KEY;

const getKeywordData = async (keywords) => {
    try {
        console.log('\n=== Starting KeywordEverywhere API Call ===');
        console.log('Keywords to process:', keywords);
        
        // Create URLSearchParams with the keywords array
        const params = new URLSearchParams();
        params.append('dataSource', 'gkp');
        params.append('country', 'us');
        params.append('currency', 'USD');
        
        // Add each keyword to the params array
        keywords.forEach(keyword => {
            params.append('kw[]', keyword);
        });

        console.log('API Request URL:', 'https://api.keywordseverywhere.com/v1/get_keyword_data');
        console.log('API Request Headers:', {
            'Accept': 'application/json',
            'Authorization': `Bearer ${KEYWORDEVERYWHERE_API_KEY}`
        });

        const response = await axios.post('https://api.keywordseverywhere.com/v1/get_keyword_data', 
            params,
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${KEYWORDEVERYWHERE_API_KEY}`
                }
            }
        );
        
        // Extract only the required metrics and format CPC
        const simplifiedData = response.data.data.map(item => ({
            keyword: item.keyword,
            vol: item.vol,
            cpc: `${item.cpc.currency}${item.cpc.value}`,
            competition: item.competition
        }));

        console.log('Simplified KeywordEverywhere API Response:', simplifiedData);
        return simplifiedData;
    } catch (error) {
        console.error('Error in getKeywordData:', error.response ? error.response.data : error.message);
        return null;
    }
};

const cleanResponse = (response) => {
    console.log('\n=== Cleaning Response ===');
    console.log('Original response:', response);
    
    // Remove any markdown code block formatting
    let cleaned = response.replace(/^```csv\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
    
    // Remove any markdown table formatting
    cleaned = cleaned.replace(/^\|.*\|\n/, '').replace(/\n\|.*\|$/, '');
    
    // Remove any remaining markdown characters
    cleaned = cleaned.replace(/\|/g, '');
    
    // Remove any text before the CSV header
    const lines = cleaned.split('\n');
    const headerIndex = lines.findIndex(line => line.toLowerCase().includes('new keyword,cluster,search intent,funnel type'));
    if (headerIndex !== -1) {
        cleaned = lines.slice(headerIndex).join('\n');
    }
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    console.log('Cleaned response:', cleaned);
    return cleaned;
};

const parseCSVInput = (csvString) => {
    // Split the response into lines and remove empty lines
    const lines = csvString.split('\n').filter(line => line.trim());
    
    // Skip the header line and parse each data line
    const keywords = lines.slice(1).map(line => {
        const [keyword, cluster, searchIntent, volume, competition, cpc] = line.split(',').map(item => item.trim());
        return {
            keyword,
            cluster,
            searchIntent,
            volume: volume === 'N/A' ? null : parseInt(volume),
            competition: competition === 'N/A' ? null : parseFloat(competition),
            cpc: cpc === 'N/A' ? null : cpc
        };
    });

    return keywords;
};

const parseCSVOutput = (response) => {
    // Split the response into lines and remove empty lines
    const lines = response.split('\n').filter(line => line.trim());
    
    // Skip the header line and parse each data line
    const keywords = lines.slice(1).map(line => {
        const [newKeyword, cluster, searchIntent, funnelType] = line.split(',').map(item => item.trim());
        return {
            newKeyword,
            cluster,
            searchIntent,
            funnelType
        };
    });

    return keywords;
};

const analyzeCluster = async (clusterData) => {
    try {
        console.log('\n=== Starting Cluster Analysis ===');
        console.log('Cluster Data:', clusterData);

        const systemPrompt = `
        You are an expert SEO keyword strategist. You will receive a list of original keywords in CSV format, each with the following fields: keyword, searchIntent, volume, competition, cpc, cluster, funnel_type.

        For each original keyword, generate 3–5 new, unique, and semantically relevant keyword variations based on strict SEO guidelines. Use the original keyword and its cluster as context for the expansion. Every new keyword must be aligned with the brand's offerings and semantically related to the original term.

        Rules:

        Search Intent Expansion:
        - Navigational → Expand into related informational or commercial queries using terms like: guide, tutorial, review, features. Strictly avoid "vs" or "comparison" unless a real competitor is explicitly included in the original keyword.
        - Informational → Expand into long-tail, question-based, or "how to" variations.
        - Commercial → Use terms like: review, features, pricing, alternatives, top, best, in [year]. Avoid "vs" unless the original keyword includes competitor names.
        - Transactional → Include strong action-intent terms such as: buy, subscribe, free trial, download, order now.

        Volume-Based Rules:
        - If volume > 20 → Favor 3–4 word keywords with strong commercial or informational intent.
        - If volume ≤ 20 → Generate longer-tail, highly specific keywords targeting niche use cases or pain points.

        Keyword Constraints:
        - All generated keywords must be unique within the same cluster.
        - Avoid unnatural or redundant repetition of words in a single keyword (e.g., "cheap cheap birthday cakes").
        - Do not generate irrelevant or invented keywords. All must be semantically relevant to the original and cluster.

        Search Intent and Funnel Type Re-Evaluation:
        - For each new keyword, reassess the search intent and funnel_type based on its wording and purpose.
        - Do not simply copy the original intent or funnel type.
        - Use the following mapping guidelines:
          - TOP = Discovery/search queries (e.g., "What is keto cake")
          - MIDDLE = Consideration, informational or comparison (e.g., "How to choose a keto cake")
          - BOTTOM = Action-oriented or purchase-ready (e.g., "Buy keto cake near me")

        Response Format:
        - The response must begin with the header and be followed only by valid CSV rows.
        - Use this header exactly once: New Keyword,Cluster,Search Intent,Funnel Type
        - Return results in CSV format.
        - Do not include any introductory text, explanations, csv markdown, labels, or additional notes.
        `;

        // Format cluster data as CSV string
        const csvInput = 'keyword,cluster,searchIntent,volume,competition,cpc\n' +
            clusterData.map(item => 
                `${item.keyword},${item.cluster},${item.searchIntent},${item.volume || 'N/A'},${item.competition || 'N/A'},${item.cpc || 'N/A'}`
            ).join('\n');

        console.log('Sending request to OpenAI...');
        const completion = await openai.chat.completions.create({
            model: "o3-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: csvInput }
            ]
        });

        // Log token usage
        console.log('\n=== OpenAI Token Usage ===');
        const totalTokens = completion.usage.total_tokens;
        
        // Calculate cost based on current o3-mini pricing
        // o3-mini pricing: $0.0005 per 1K input tokens, $0.0015 per 1K output tokens
        const inputCost = (completion.usage.prompt_tokens / 1000) * 0.0005;
        const outputCost = (completion.usage.completion_tokens / 1000) * 0.0015;
        const totalCost = inputCost + outputCost;
        
        console.log(`Total tokens for analyzeCluster: ${totalTokens}`);
        console.log(`Total price for analyzeCluster: $${totalCost.toFixed(4)}`);

        const cleanedResponse = cleanResponse(completion.choices[0].message.content);
        console.log('Attempting to parse cleaned response...');
        
        const generatedKeywords = parseCSVOutput(cleanedResponse);
        console.log('Parsed generated keywords:', generatedKeywords);
        
        return generatedKeywords;
    } catch (error) {
        console.error('Error in analyzeCluster:', error);
        throw error;
    }
};

const filterAndMapKeywords = async (csvData) => {
    try {
        console.log('\n=== Starting Keyword Filtering and Mapping ===');
        
        const systemPrompt = `
        You are an expert SEO analyst tasked with filtering and mapping keywords from a provided CSV dataset. 
        Follow these exact steps to process the data, keeping in mind that the target audience is small business owners who prioritize relevance, low competition, and conversion-focused keywords.

        The input dataset contains the following columns: keyword, searchIntent, volume, competition, cpc, cluster, funnel_type.

        Common Example for Reference: We'll use the following keyword as a common example throughout the instructions: 
        "Custom Cakes for Birthdays Chicago" (5 words), searchIntent=Transactional, volume=40, competition=0.3, cpc=2.5, cluster=Bakery Services, funnel_type=BOTTOM.

        Important Note: The example data (e.g., "Custom Cakes for Birthdays Chicago") is only for instructional purposes and must not appear in the final output. 
        The output must be derived exclusively from the actual dataset provided via the API payload.

        Rule 1: Select Only Long-Tail Keywords.
        Action: Include only keywords that are 3 or more words long.
        Example: Include "Custom Cakes for Birthdays Chicago" (5 words). Exclude "Cakes Chicago" (2 words).
        Why: Long-tail keywords are specific and less competitive, making them ideal for small businesses.
        Additional Rule: If applicable, prioritize keywords containing location modifiers (e.g., city names) for local businesses.

        Rule 2: Prioritize Intent-Driven Keywords.
        Action: Filter keywords based on their searchIntent:
        - Informational/Commercial Intent: Include for blogs, guides, FAQs, or educational content.
          Example: "How to Choose a Wedding Cake" → content_type=Blog.
        - Transactional Intent: Include for service pages, product pages, or lead generation content.
          Example: "Order Gluten-Free Cupcakes Online" → content_type=Product Page.
        Why: Small businesses need conversions, so transactional intent is prioritized.

        Rule 3: Ensure Cluster Diversity.
        Action: Include keywords from all unique cluster categories in the dataset.
        Example: If clusters include Bakery Services, Bakery Products, and Bakery Guides, ensure representation from each.
        Why: Diverse clusters ensure topic breadth.
        Exception: Exclude entire clusters if no qualifying keywords are found.

        Rule 4: Retain Only Low-Competition Keywords.
        Action:
        - Retain keywords with competition < 0.5.
        - For competition between 0.5–0.7, retain only if the keyword is hyper-specific to the business niche and has clear transactional intent (e.g., "Emergency Plumbing Service Austin").
        - Exclude all keywords with competition > 0.7.
        Why: Small businesses lack domain authority to rank for highly competitive terms.
        Fallback Clause: If fewer than 10 keywords match all rules, this rule may be relaxed slightly to allow keywords up to 0.7 competition, provided they meet all other criteria.

        Rule 5: Balance Funnel Stages.
        Action: Aim for a mix of funnel_type:
        - Approximately 70% BOTTOM funnel (conversion-focused)
        - Approximately 30% TOP funnel (awareness-focused)
        Example:
        - BOTTOM: "Custom Cakes for Birthdays Chicago"
        - TOP: "How to Decorate a Birthday Cake"
        Note: Maintain flexibility—do not force the ratio at the cost of keyword relevance.

        Rule 6: Remove Overlapping Keywords.
        Action: Remove keywords with similar meaning/intent within the same cluster.
        Include: More specific, higher-converting term.
        Exclude: Broader or redundant variations.
        Example: Include: "Custom Cakes for Birthdays Chicago"; Exclude: "Custom Birthday Cakes Chicago".
        Tie-Breaker Criteria: Favor lower competition and stronger transactional intent.

        Rule 7: Assign Content Types Based on Intent.
        Action: Map each keyword to a content_type based on searchIntent:
        - Informational: Blog, Guide, FAQ (e.g., "How to Choose a Wedding Cake" → Blog)
        - Commercial: Comparison, Product Page (e.g., "Best Gluten-Free Cupcakes Online" → Comparison)
        - Transactional: Service Page, Quote Form, Case Study (e.g., "Custom Cakes for Birthdays Chicago" → Service Page)
        Why: Proper mapping aligns keywords with the content's conversion goals.

        Response Format:
        Response must begin directly with the CSV header.
        Strictly generate exactly 10 rows of keyword data in CSV format only.
        The CSV must only contain the following columns in order: keyword, content_type, searchIntent, volume, competition, cpc, cluster, funnel_type.
        Include all values, even if they are zero.
        Do not include any introductory text, explanations, csv markdown, labels, or additional notes.

        Output Constraints:
        Return exactly 10 keywords, filtered and sorted by:
        1. Transactional intent (priority)
        2. Higher search volume
        3. Lower competition

        If fewer than 10 valid keywords are found, allow controlled relaxation of Rule 4 to reach 10 entries.
        Do not include any instructional example keywords in the output (e.g., "Custom Cakes for Birthdays Chicago").
        Focus on relevance, not arbitrary thresholds.
        For example, do not exclude keywords with low volume if they are highly relevant and have low competition.
        `;

        console.log('Sending request to OpenAI for keyword filtering...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Input data: ${csvData}` }
            ]
        });

        // Log token usage
        console.log('\n=== OpenAI Token Usage ===');
        console.log('Prompt tokens:', completion.usage.prompt_tokens);
        console.log('Completion tokens:', completion.usage.completion_tokens);
        console.log('Total tokens:', completion.usage.total_tokens);
        
        // Calculate cost based on current gpt-4o pricing
        // gpt-4o pricing: $0.01 per 1K input tokens, $0.03 per 1K output tokens
        const inputCost = (completion.usage.prompt_tokens / 1000) * 0.01;
        const outputCost = (completion.usage.completion_tokens / 1000) * 0.03;
        const totalCost = inputCost + outputCost;
        
        console.log(`Total tokens for filterAndMapKeywords: ${completion.usage.total_tokens}`);
        console.log(`Total price for filterAndMapKeywords: $${totalCost.toFixed(4)}`);

        const filteredOutput = cleanResponse(completion.choices[0].message.content);
        console.log('Filtered and mapped keywords:', filteredOutput);
        
        return filteredOutput;
    } catch (error) {
        console.error('Error in filterAndMapKeywords:', error);
        throw error;
    }
};

const processClusters = async (csvInput) => {
    try {
        console.log('\n=== Starting Cluster Processing ===');
        
        // Parse input CSV
        const keywords = parseCSVInput(csvInput);
        console.log('Parsed input keywords:', keywords);

        // Group keywords by cluster
        const clusters = {};
        keywords.forEach(keyword => {
            if (!clusters[keyword.cluster]) {
                clusters[keyword.cluster] = [];
            }
            clusters[keyword.cluster].push(keyword);
        });

        // Analyze each cluster
        const results = [];
        for (const [clusterName, clusterData] of Object.entries(clusters)) {
            try {
                const generatedKeywords = await analyzeCluster(clusterData);
                results.push(...generatedKeywords);
            } catch (error) {
                console.error(`Error processing cluster ${clusterName}:`, error);
            }
        }

        // Get all generated keywords
        const allGeneratedKeywords = results.map(r => r.newKeyword);
        
        // Get metrics for all generated keywords
        console.log('Fetching metrics for generated keywords...');
        const metrics = await getKeywordData(allGeneratedKeywords);

        // Combine results with metrics
        const finalResults = results.map(result => {
            const metric = metrics?.find(m => m.keyword.toLowerCase() === result.newKeyword.toLowerCase());
            return {
                newKeyword: result.newKeyword,
                cluster: result.cluster,
                searchIntent: result.searchIntent,
                funnelType: result.funnelType,
                vol: metric?.vol || 0,
                competition: metric?.competition || 0,
                cpc: metric?.cpc || '0'
            };
        });

        // Format initial CSV output
        const csvHeader = 'New Keyword,Cluster,Search Intent,Funnel Type,Search Volume,Competition,CPC\n';
        const csvRows = finalResults.map(result => 
            `${result.newKeyword},${result.cluster},${result.searchIntent},${result.funnelType},${result.vol},${result.competition},${result.cpc}`
        ).join('\n');

        const initialCsvOutput = csvHeader + csvRows;

        // Pass the initial output through the filtering and mapping process
        const finalFilteredOutput = await filterAndMapKeywords(initialCsvOutput);

        return finalFilteredOutput;
    } catch (error) {
        console.error('Error in processClusters:', error);
        throw error;
    }
};

export default processClusters; 


// Example usage
// (async () => {
//     try {
//         console.log('\n=== Starting Main Process ===');
//         const inputCSV = `keyword,cluster,searchIntent,volume,competition,cpc
// Edwiser RemUI,LMS Themes,Navigational,20,0.12,$1.25
// Edwiser Bridge,LMS Integrations,Navigational,30,0.05,$0.00
// Edwiser RapidGrader,Grading Tools,Transactional,N/A,N/A,$0.00`;

//         const result = await processClusters(inputCSV);
//         console.log('Final result:', result);
//     } catch (error) {
//         console.error('Failed to process clusters:', error);
//     }
// })(); 