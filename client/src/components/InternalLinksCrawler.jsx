import { useState } from 'react'
import { crawlerService } from '../services/crawlerService'
import UrlInputForm from './crawler/UrlInputForm'
import LoadingMessages from './crawler/LoadingMessages'

function InternalLinksCrawler({ 
  showOnlyLoader = false, 
  loading = false, 
  onLoadingChange,
  onDataUpdate = () => {}, // Default to empty function if not provided
  inputFormOnly = false // New prop to control rendering just the form
}) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e, manualUrls = null, countryCode = 'us') => {
    e.preventDefault()
    setError(null)
    onLoadingChange(true)
    
    // Clear previous data
    onDataUpdate({ 
      keywordsData: null,
      websiteContent: null,
      internalLinks: [],
      error: null
    })
    
    try {
      let allUrls = [url];
      let links = [];
      
      if (manualUrls && manualUrls.length > 0) {
        allUrls = manualUrls;
        links = manualUrls.slice(1);
        onDataUpdate({ internalLinks: links })
      } else {
        const internalLinksResponse = await crawlerService.getInternalLinks(url)
        // Ensure links is an array
        links = Array.isArray(internalLinksResponse) ? internalLinksResponse : [];
        onDataUpdate({ internalLinks: links })
        allUrls = [url, ...links]
      }

      const content = await crawlerService.getWebsiteContent(allUrls)
      console.log('Website Content Response:', content) // Debug log
      
      if (!content || Object.keys(content).length === 0) {
        const errorMsg = 'No content received from the server';
        setError(errorMsg);
        onDataUpdate({ error: errorMsg });
        throw new Error(errorMsg);
      }

      onDataUpdate({ websiteContent: content })

      const contents = Object.entries(content).map(([website, content]) => {
        if (!content) {
          console.warn(`No content for website: ${website}`)
          return null
        }
        return {
          content,
          website
        }
      }).filter(Boolean) // Remove any null entries

      console.log('Processed Contents:', contents) // Debug log

      if (contents.length === 0) {
        const errorMsg = 'No valid content to analyze';
        setError(errorMsg);
        onDataUpdate({ error: errorMsg });
        throw new Error(errorMsg);
      }

      const keywords = await crawlerService.getKeywords(contents, countryCode)
      onDataUpdate({ keywordsData: keywords })

    } catch (err) {
      console.error('Error in handleSubmit:', err) // Debug log
      setError(err.message)
      onDataUpdate({ error: err.message })
    } finally {
      onLoadingChange(false)
    }
  }

  if (showOnlyLoader) {
    return loading ? (
      <div className="bg-white rounded-lg shadow-md p-6">
        <LoadingMessages />
      </div>
    ) : null;
  }

  // Only render the form and error message
  return (
    <div className="space-y-8">
      <UrlInputForm
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
      
      {/* {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )} */}
    </div>
  );
}

export default InternalLinksCrawler