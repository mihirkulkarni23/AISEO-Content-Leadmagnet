const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const crawlerService = {
  async getInternalLinks(url) {
    const response = await fetch(`${API_BASE_URL}/internal-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch internal links');
    }

    return data.links;
  },

  async getWebsiteContent(urls) {
    const response = await fetch(`${API_BASE_URL}/website-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch website content');
    }

    return data.results;
  },

  async getKeywords(contents, countryCode) {
    const response = await fetch(`${API_BASE_URL}/keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents, countryCode }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch keywords');
    }

    return data.csv;
  },

  async getNewKeywords(csvInput) {
    const response = await fetch(`${API_BASE_URL}/new-keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvInput }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch new keywords');
    }

    // Clean the CSV data before returning it
    let cleanedCsv = data.csv;
    
    // Remove any markdown code block formatting
    cleanedCsv = cleanedCsv.replace(/^```plaintext\n/, '').replace(/^```csv\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
    
    // Remove any text before the CSV header
    const lines = cleanedCsv.split('\n').filter(line => line.trim());
    const headerIndex = lines.findIndex(line => 
      line.toLowerCase().includes('keyword') && 
      line.toLowerCase().includes('content_type') && 
      line.toLowerCase().includes('searchintent')
    );
    
    if (headerIndex !== -1) {
      cleanedCsv = lines.slice(headerIndex).join('\n');
    } else {
      // If we can't find the header by keywords, try to find the first line that looks like a CSV header
      // (contains commas and doesn't start with special characters)
      const csvHeaderIndex = lines.findIndex(line => 
        line.includes(',') && 
        !line.startsWith('```') && 
        !/^(Result:|Output:|Here|The|This|Answer:|Response:|Data:|Content:)/i.test(line)
      );
      
      if (csvHeaderIndex !== -1) {
        cleanedCsv = lines.slice(csvHeaderIndex).join('\n');
      }
    }
    
    // Trim whitespace
    cleanedCsv = cleanedCsv.trim();
    
    console.log('Cleaned CSV:', cleanedCsv);
    return cleanedCsv;
  },

  async getContentIdeas(keyword) {
    const response = await fetch(`${API_BASE_URL}/content-ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch content ideas');
    }

    // Clean the headlines data before returning it
    if (data.headlines) {
      console.log('Original headlines data:', data.headlines);
      
      // If headlines is a string (JSON), parse it
      if (typeof data.headlines === 'string') {
        try {
          // Remove any markdown code block formatting
          let cleaned = data.headlines.replace(/^```json\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
          
          // Find the first occurrence of a JSON object (starting with {)
          const jsonStartIndex = cleaned.indexOf('{');
          if (jsonStartIndex !== -1) {
            cleaned = cleaned.substring(jsonStartIndex);
          } else {
            // If we can't find a JSON object, try to find the first line that doesn't look like a prefix
            const lines = cleaned.split('\n').filter(line => line.trim());
            const dataStartIndex = lines.findIndex(line => 
              !line.startsWith('```') && 
              !/^(Result:|Output:|Here|The|This|Answer:|Response:|Data:|Content:)/i.test(line)
            );
            
            if (dataStartIndex !== -1) {
              cleaned = lines.slice(dataStartIndex).join('\n');
            }
          }
          
          // Trim whitespace
          cleaned = cleaned.trim();
          
          console.log('Cleaned headlines data:', cleaned);
          data.headlines = JSON.parse(cleaned);
        } catch (error) {
          console.error('Error parsing headlines data:', error);
        }
      }
    }

    return data;
  },
}; 