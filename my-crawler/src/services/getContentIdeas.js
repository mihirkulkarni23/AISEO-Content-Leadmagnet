import OpenAI from 'openai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY environment variable is not set');
}

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

async function getPerplexityData(systemPrompt, userPrompt) {
    const options = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            top_p: 0.9,
            presence_penalty: 0,
            frequency_penalty: 1,
            stream: false,
        }),
    };

    try {
        console.log('Making API request to Perplexity...');
        const response = await fetch('https://api.perplexity.ai/chat/completions', options);
        
        if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            const responseText = data.choices[0].message.content.trim();
            
            // Log token usage for Perplexity API
            console.log('\n=== Perplexity AI Token Usage ===');
            if (data.usage) {
                const promptTokens = data.usage.prompt_tokens;
                const completionTokens = data.usage.completion_tokens;
                const totalTokens = data.usage.total_tokens;
                
                // Calculate cost based on Perplexity pricing
                // Perplexity pricing: $1 per million tokens for both input and output
                // Plus a base request cost of $0.005
                const inputTokenCost = (promptTokens / 1_000_000) * 1;
                const outputTokenCost = (completionTokens / 1_000_000) * 1;
                const requestCost = 5 / 1000; // $0.005 base request cost
                
                const totalCost = inputTokenCost + outputTokenCost + requestCost;
                
                console.log(`Total tokens for getPerplexityData: ${totalTokens}`);
                console.log(`Total price for getPerplexityData: $${totalCost.toFixed(6)}`);
            } else {
                console.log('Token usage information not available from Perplexity API');
            }
            
            console.log('Raw AI Response:', responseText);
            return responseText;
        }
        return { error: 'No valid response received from API', rawResponse: data };
    } catch (err) {
        console.error('Error while fetching data from Perplexity API:', err);
        throw err;
    }
}

// Function to get content ideas for a keyword
async function getContentIdeas(keyword) {
    const systemPrompt = `Research the keyword across Reddit, YouTube, news outlets, and top-ranking websites. Provide a structured summary that includes the following:

Key themes from Reddit discussions:
Identify relevant subreddits where this topic is discussed and provide a summary of each subreddit, including member count and focus areas.
Summarize recurring questions, pain points, and trends in user discussions.

YouTube trends:
Analyze popular video topics related to the keyword.
Identify commonly used tags and recurring audience questions in the comments section.

News & industry updates:
Highlight recent trends, controversies, or innovations related to the keyword in the news or industry reports.

Recent research papers:
Include findings from recent studies or reviews on the topic.
Summarize key insights from peer-reviewed articles.

Top websites:
Examine content from top-ranking websites for this keyword.
Identify gaps in competitor content and suggest opportunities for differentiation.
Include key SEO metrics (domain authority, backlinks) of top competitors.

Social media insights:
Explore discussions or trends on platforms like Instagram, Twitter, or TikTok.

Long-tail keywords:
List specific long-tail keywords with search volume or rising trends.

Call-to-action suggestions:
Recommend actionable CTAs tailored to audience pain points.

Research Instructions:
Source Credibility: Prioritize reputable sources such as academic articles, industry reports, and established topic-related websites. Cross-reference information for accuracy.
Contextual Relevance: Ensure insights are specifically relevant to topic and avoid tangential information.
Audience Engagement: Pay attention to how users engage with content (likes, shares, comments) to gauge interest levels and identify potential content gaps.
Diverse Perspectives: Capture a range of viewpoints in Reddit discussions and YouTube comments to provide a well-rounded understanding of consumer sentiment.
Quantitative Data: Include quantitative data (like statistics or metrics) where applicable to support claims and enhance credibility.
Avoid Jargon: Use straightforward language that is accessible to a broad audience; avoid overly technical terms unless they are essential and clearly explained.

Formatting Instructions:
Use bullet points with actionable insights for each section.
Avoid introductory text or conclusions; focus solely on presenting findings.
Ensure niche-specific details are highlighted without generic advice. Do not include any citations.`;

    const userPrompt = `Keyword: ${keyword}

Please provide the research in the following exact format:

Key themes from Reddit discussions:
- Subreddits: [list subreddits with member counts]
- Focus on: [list focus areas]
- [bullet points for discussions]

YouTube trends:
- Popular video topics: [list topics]
- Common tags: [list tags]
- Audience questions: [list questions]

News & industry updates:
- [bullet points for updates]

Recent research papers:
- [bullet points for papers]

Top websites:
- [bullet points for websites]

Social media insights:
- Instagram: [list insights]
- Twitter: [list insights]
- TikTok: [list insights]

Long-tail keywords:
- [bullet points for keywords]

Call-to-action suggestions:
- [bullet points for CTAs]`;

    return await getPerplexityData(systemPrompt, userPrompt);
}

// Function to clean headlines response
function cleanHeadlinesResponse(response) {
    console.log('\n=== Cleaning Headlines Response ===');
    console.log('Original response:', response);
    
    // Remove any markdown code block formatting
    let cleaned = response.replace(/^```json\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
    
    // Find the first occurrence of a JSON object (starting with {)
    const jsonStartIndex = cleaned.indexOf('{');
    if (jsonStartIndex !== -1) {
        cleaned = cleaned.substring(jsonStartIndex);
    }
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    console.log('Cleaned headlines response:', cleaned);
    return cleaned;
}

// Function to get headlines using ChatGPT
async function getHeadlines(keyword, researchData) {
    const systemPrompt = `Act as an SEO content strategist specializing in EEAT (Expertise, Authoritativeness, Trustworthiness).
Your goal is to generate click-worthy, keyword-rich H1 and H2 headlines using only the provided keyword and research highlights.
Deliver output in strict JSON structure with the following keys:
{  
  "title": "[Primary keyword + compelling benefit, <60 chars]",  
  "meta": "[Keyword + urgency/benefit, 150-160 chars]",  
  "Heading": "[H1: Rephrase title with specificity and LSI keyword]",  
  "h2": {  
    "1": "[Problem/Myth + Emotionally Charged Term + LSI Keyword]",  
    "2": "[Data/Statistic (+ Optional Source) + Key Insight]",  
    "3": "[Actionable Solution with Timeframe/Benefit]"
  }  
}  

Critical Guidelines:
Keyword Strategy:
title must start with the primary keyword and include at least 1 LSI keyword from the research.
Use power words (e.g., "critical," "danger," "proven") in H2s where research supports urgency.
User Intent & Structure:
Follow the problem → proof → solution → trust flow.
H2.3 must include a clear timeframe (e.g., "7-Day") or measurable benefit (e.g., "Double Your Energy").
Technical SEO:
title length: <60 characters.
Front-load keywords in H1/H2s (primary keyword within first 30 characters).
title/meta must include primary keyword and evoke curiosity or urgency.

Do not include citations, "Source," "Study," or similar terms unless explicitly requested. Focus solely on presenting data/statistics without attribution.

No fluff: Avoid definitions, introductions, or jargon.`;

    const userPrompt = `Keyword: ${keyword}

Research Data:
${JSON.stringify(researchData, null, 2)}

Generate headlines based on this research data.`;

    try {
        console.log('Making API request to ChatGPT...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7
        });

        // Log token usage for OpenAI API
        console.log('\n=== OpenAI Token Usage ===');
        const totalTokens = completion.usage.total_tokens;
        
        // Calculate cost based on current GPT-4o pricing
        // GPT-4o pricing: $0.01 per 1K input tokens, $0.03 per 1K output tokens
        const inputCost = (completion.usage.prompt_tokens / 1000) * 0.01;
        const outputCost = (completion.usage.completion_tokens / 1000) * 0.03;
        const totalCost = inputCost + outputCost;
        
        console.log(`Total tokens for getHeadlines: ${totalTokens}`);
        console.log(`Total price for getHeadlines: $${totalCost.toFixed(4)}`);

        if (completion.choices && completion.choices[0] && completion.choices[0].message) {
            let content = completion.choices[0].message.content.trim();
            
            // Clean the response to remove any extra text before the JSON data
            content = cleanHeadlinesResponse(content);
            
            const headlines = JSON.parse(content);
            console.log('Generated Headlines:', JSON.stringify(headlines, null, 2));
            return headlines;
        } else {
            throw new Error('No valid response received from ChatGPT API');
        }
    } catch (error) {
        console.error('Error generating headlines:', error);
        throw error;
    }
}

// Function to get both content ideas and headlines
async function getContentIdeasAndHeadlines(keyword) {
    try {
        // First get the research data from Perplexity
        const researchData = await getContentIdeas(keyword);
        
        // Then generate headlines using the research data
        const headlines = await getHeadlines(keyword, researchData);
        
        return {
            research: researchData,
            headlines: headlines
        };
    } catch (error) {
        console.error('Error in getContentIdeasAndHeadlines:', error);
        throw error;
    }
}

export { getContentIdeasAndHeadlines };

// Sample run code
// const runSample = async () => {
//     try {
//         console.log('Starting content ideas and headlines generation for "arabica coffee beans"...');
//         const result = await getContentIdeasAndHeadlines('arabica coffee beans');
//         console.log('\nGenerated Content Ideas and Headlines:');
//         console.log(JSON.stringify(result, null, 2));
//     } catch (error) {
//         console.error('Error in sample run:', error);
//     }
// };

// Uncomment the line below to run the sample
// runSample();
