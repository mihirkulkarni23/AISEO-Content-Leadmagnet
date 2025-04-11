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

const getKeywordData = async (keywords, countryCode = 'us') => {
    try {
        console.log('\n=== Starting KeywordEverywhere API Call ===');
        console.log('Keywords to process:', keywords);
        console.log('Country code:', countryCode);
        
        // Create URLSearchParams with the keywords array
        const params = new URLSearchParams();
        params.append('dataSource', 'gkp');
        params.append('country', countryCode);
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

const cleanJsonResponse = (response) => {
    console.log('\n=== Cleaning Response ===');
    console.log('Original response:', response);
    const cleaned = response.trim();
    console.log('Cleaned response:', cleaned);
    return cleaned;
};

const parseCSVResponse = (response) => {
    // Split the response into lines and remove empty lines
    const lines = response.split('\n').filter(line => line.trim());

    // Skip the header row if it matches the expected format
    const dataLines = lines.filter(line => {
        const [first, second] = line.split(',').map(item => item.trim());
        return !(first === 'Keyword' && second === 'Search Intent');
    });
    
    // Parse each line into keyword and search intent
    const keywords = dataLines.map(line => {
        const [keyword, searchIntent] = line.split(',').map(item => item.trim());
        return {
            originalKeyword: keyword,
            searchIntent: searchIntent
        };
    });

    return keywords;
};

const identifyKeywords = async (content, website) => {
    try {
        console.log('\n=== Starting Keyword Identification ===');
        console.log('Website:', website);
        console.log('Content length:', content.length);

        const systemPrompt = 
        `You are an SEO expert analyzing content from the website '${website}'.
        1. Analyze the provided content and identify 3–5 core keywords from the website content that represent its primary topics, products, or services. Focus on keywords that:
            - Are specific to the website's domain and offerings 
            - Have commercial or informational value
            - Are relevant to the website's target audience (keywords that the intended customers are likely to use)
            - Strictly exclude generic terms (like 'products', 'services', 'information') and any keywords that are not directly and specifically related to the website's core offerings and content.
            - Exclude irrelevant terms (avoid keywords that, even if related to a general topic, do not align with the specific focus of the website).

        2. Assign the most appropriate search intent category to each keyword. Utilize the following intent categories:
            - Informational: Keywords used when users are seeking information (Examples: 'what are the benefits of...', 'how to...', 'types of...', 'guide to...')
            - Commercial: Keywords used when users are comparing products/services (Examples: 'best [product type] 2024', '[brand A] vs [brand B]', '[product type] reviews', 'top rated [service]')
            - Transactional: Keywords used when users are ready to purchase (Examples: 'buy [product]', '[product name] for sale', 'discount on [product]', 'where to buy [service]', 'order [product online]')
            - Navigational: Keywords used when users are looking for specific brands/products (Examples: '[brand name] official website', '[product name] features', '[service name] pricing', '[brand name] customer support')

        3. Strictly provide the final output in CSV-like format with the following columns: "Keyword", "Search Intent". Do not include any markdown formatting, explanation, or additional text.
        `;

        // const systemPrompt = `
        // You are an SEO expert analyzing content from the website "${website}".

        // Analyze the content and identify 3-5 strategic keywords representing the page's core topic, covering distinct search intents and semantic variations. Keywords must:
        // Be specific to the website's domain (e.g., "best organic dog food brands" for a site selling organic pet food, not generic terms like "dog food").        
        // Are specific enough to avoid ambiguity.
        // Can later be expanded into long-tail variations.
        // Reflect commercial, informational, transactional, or navigational value.
        // Align with the target audience's search behavior.

        // Strictly exclude:
        // Single-word terms.            
        // Generic phrases ("products", "services").
        // Brand+generic combos (unless the brand is owned by the website).
        // Duplicate or overlapping concepts (e.g., "affordable shoes" vs. "cheap shoes").
        // Keywords unrelated to the website's core offerings.

        // Represent unique semantic concepts (no synonyms or overlapping variants).

        // Assign search intent to each keyword using these categories:
        // Informational: User seeks knowledge (e.g., "how to groom a husky").
        // Commercial: User compares options (e.g., "best hiking boots 2024").
        // Transactional: User is ready to purchase (e.g., "buy vegan leather backpack").
        // Navigational: User seeks a specific brand/page (e.g., "BrandX official store").
        
        // Output Format:
        // Provide the final output in a CSV-like format with the following columns: "Original Keyword", "Search Intent".
        // No markdown, explanations, or headers.
        // Ensure keywords map to the website's content hierarchy (e.g., product pages → transactional intent, guides → informational).        
        // `;
        
        const userPrompt = `Website: ${website}\nContent: ${content}`;

        console.log('Sending request to OpenAI...');
        const completion = await openai.chat.completions.create({
            model: "o3-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
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
        
        console.log(`Total tokens for identifyKeywords: ${totalTokens}`);
        console.log(`Total price for identifyKeywords: $${totalCost.toFixed(4)}`);

        console.log('OpenAI Response:', completion.choices[0].message.content);

        const cleanedResponse = cleanJsonResponse(completion.choices[0].message.content);
        console.log('Attempting to parse cleaned response...');
        
        const keywordsData = parseCSVResponse(cleanedResponse);
        console.log('Parsed keywords:', keywordsData);

        // Get KeywordEverywhere data for all keywords at once
        console.log('Fetching metrics from KeywordEverywhere...');
        const metrics = await getKeywordData(keywordsData.map(k => k.originalKeyword));

        const result = {
            website,
            keywords: keywordsData,
            metrics
        };
        
        console.log('\n=== Final Result ===');
        console.log(JSON.stringify(result, null, 2));
        
        return result;
    } catch (error) {
        console.error('Error in identifyKeywords:', error);
        throw error;
    }
};

const optimizeKeywords = async (csvData) => {
    try {
        const systemPrompt = `
        You are an SEO Specialist. The goal is to create actionable and correctly formatted keyword data for use in SEO and marketing campaigns.

        Your task is to organize and optimize keyword data for marketing purposes. Follow these steps:

        Data Cleaning: Identify and remove duplicate keywords from the input data. Filter out keywords that meet all of the following criteria: volume = 0, CPC = $0.00, and competition = 0.
        Semantic Clustering: Group the remaining keywords into semantically related clusters based on their meaning and the user's likely intent. Ensure there are no more than 5 distinct clusters. Assign a clear and descriptive name to each cluster.
        Funnel Stage Mapping: Use the existing searchIntent column as a primary indicator but also apply your understanding of the keywords. For each semantic cluster, determine the most appropriate marketing funnel stage: TOP (Awareness), MIDDLE (Consideration), or BOTTOM (Decision).
        Output Format: Strictly present the output in CSV format with a header row. The header row must include the following column names in this specific order: keyword, searchIntent, volume, competition, cpc, cluster, funnel_type. After the header row, include the corresponding data rows. Do not include any additional text, markdown, or explanations. Ensure there are no more than 5 distinct clusters in the output.`;

        const userPrompt = `Keyword Data:\n${csvData}`;

        const completion = await openai.chat.completions.create({
            model: "o3-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        // Log token usage and cost calculation
        const totalTokens = completion.usage.total_tokens;
        const inputCost = (completion.usage.prompt_tokens / 1000) * 0.0005;
        const outputCost = (completion.usage.completion_tokens / 1000) * 0.0015;
        const totalCost = inputCost + outputCost;
        
        console.log(`Total tokens for optimizeKeywords: ${totalTokens}`);
        console.log(`Total price for optimizeKeywords: $${totalCost.toFixed(4)}`);

        console.log('OpenAI Response:', completion.choices[0].message.content);

        return completion.choices[0].message.content.trim();

    } catch (error) {
        console.error('Error in optimizeKeywords:', error);
        throw error;
    }
};

const processMultipleContents = async (contents, countryCode = 'us') => {
    try {
        console.log('\n=== Starting Multiple Content Processing ===');
        console.log(`Processing ${contents.length} content entries...`);
        console.log('Country code:', countryCode);

        const results = [];
        for (const { content, website } of contents) {
            try {
                const result = await identifyKeywords(content, website);
                results.push(result);
            } catch (error) {
                console.error(`Error processing website ${website}:`, error);
                results.push({
                    website,
                    error: error.message
                });
            }
        }

        // Get all keywords and metrics
        const allKeywords = results.flatMap(r => r.keywords || []);
        const allMetrics = await getKeywordData(allKeywords.map(k => k.originalKeyword), countryCode);

        console.log(allMetrics);
        
        // Create CSV header and rows
        const csvHeader = 'keyword,searchIntent,volume,competition,cpc\n';
        const csvRows = allKeywords.map(keyword => {
            const metric = allMetrics.find(m => m.keyword.toLowerCase() === keyword.originalKeyword.toLowerCase());
            return `${keyword.originalKeyword},${keyword.searchIntent},${metric?.vol || 0},${metric?.competition || 0},${metric?.cpc || '0'}`;
        }).join('\n');
        
        const csvOutput = csvHeader + csvRows;

        console.log('\n=== Initial CSV Output ===');
        console.log(csvOutput);

        // Process the CSV output through the optimization prompt
        const optimizedOutput = await optimizeKeywords(csvOutput);
        
        console.log('\n=== Optimized CSV Output ===');
        console.log(optimizedOutput);

        return optimizedOutput;
    } catch (error) {
        console.error('Error in processMultipleContents:', error);
        throw error;
    }
};

export { processMultipleContents }; 


// Example usage
// (async () => {
//     try {
//         console.log('\n=== Starting Main Process ===');
//         const contents = [
//             {
//                 content: "loved by 10000+ users like you 💖 Create an engaging LMS site with Edwiser RemUI. It's not just a theme, it's an EXPERIENCE! Create an all-in-one e-commerce and marketing platform for your LMS with Edwiser Bridge Create 45+ forms like enrollment, contact, support, inquiry… and more, with the ONLY drag and drop form builder for your LMS. Spend less time struggling with the grading interface of your LMS to swiftly evaluate student performance with Edwiser RapidGrader Easily capture learner engagement information and trends, get access to multiple built-in reports with Edwiser Reports Keep a check on system vitals, get to know what's causing problems to help you fix issues immediately with Edwiser Site Monitor Let's help each other make the journey of your LMS transformation smoother and better! We use cookies to help us offer you the best online experience. By continuing to use our website and/or clicking OK, you're agreeing to our use of cookies in accordance with our cookies policy. More Info",
//                 website: "https://edwiser.org"
//             }
//         ];
        
//         const csvResult = await processMultipleContents(contents);
//         console.log('Final CSV result:', csvResult);
//     } catch (error) {
//         console.error('Failed to process contents:', error);
//     }
// })(); 