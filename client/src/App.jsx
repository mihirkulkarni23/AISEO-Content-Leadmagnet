import './App.css'
import Navbar from './components/Navbar'
import { useState, useEffect, useRef } from 'react'
import { crawlerService } from './services/crawlerService'
import HeroSection from './components/sections/HeroSection'
import KeywordsAnalysisSection from './components/sections/KeywordsAnalysisSection'
import ExpandedKeywordsSection from './components/sections/ExpandedKeywordsSection'
import HeadlinesSection from './components/sections/HeadlinesSection'
import StrategicContentCTA from './components/sections/StrategicContentCTA'
import ErrorSection from './components/sections/ErrorSection'

function App() {
  const [loading, setLoading] = useState(false)
  const [expandedLoading, setExpandedLoading] = useState(false)
  const [headlinesLoading, setHeadlinesLoading] = useState(false)
  const [keywordsData, setKeywordsData] = useState(null)
  const [expandedKeywordsData, setExpandedKeywordsData] = useState(null)
  const [headlinesData, setHeadlinesData] = useState([])
  const [websiteContent, setWebsiteContent] = useState(null)
  const [internalLinks, setInternalLinks] = useState([])
  const [error, setError] = useState(null)
  const [expandedError, setExpandedError] = useState(null)
  const [headlinesError, setHeadlinesError] = useState(null)
  
  const resultsRef = useRef(null)

  // Auto-scroll to results when analysis starts
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [loading])

  // Function to handle state updates from InternalLinksCrawler
  const handleDataUpdate = (data) => {
    // Clear previous data if we're getting new data
    if (data.keywordsData || data.websiteContent || data.internalLinks) {
      setKeywordsData(null)
      setExpandedKeywordsData(null)
      setHeadlinesData([])
      setWebsiteContent(null)
      setInternalLinks([])
      setError(null)
      setExpandedError(null)
      setHeadlinesError(null)
    }

    if (data.keywordsData) {
      setKeywordsData(data.keywordsData)
      // Once we get keywordsData, fetch expanded keywords
      fetchExpandedKeywords(data.keywordsData)
    }
    if (data.websiteContent) setWebsiteContent(data.websiteContent)
    if (data.internalLinks) setInternalLinks(data.internalLinks)
    if (data.error !== undefined) setError(data.error)
  }

  // Function to fetch expanded keywords
  const fetchExpandedKeywords = async (csvInput) => {
    try {
      setExpandedLoading(true)
      setExpandedError(null)
      const expandedCsv = await crawlerService.getNewKeywords(csvInput)
      setExpandedKeywordsData(expandedCsv)
      // Once we get expanded keywords, fetch headlines for the first two keywords
      if (expandedCsv) {
        const rows = expandedCsv.split('\n').filter(line => line.trim())
        if (rows.length > 2) { // Check if we have at least two keywords (header + data)
          const headers = rows[0].split(',').map(header => header.trim())
          const keywordIndex = headers.indexOf('keyword')
          if (keywordIndex !== -1) {
            // Get first two keywords
            const firstKeyword = rows[1].split(',')[keywordIndex].trim()
            const secondKeyword = rows[2].split(',')[keywordIndex].trim()
            // Set expanded loading to false before starting headlines fetch
            setExpandedLoading(false)
            // Start headlines loading
            setHeadlinesLoading(true)
            // Fetch headlines for both keywords
            await Promise.all([
              fetchHeadlines(firstKeyword),
              fetchHeadlines(secondKeyword)
            ])
            setHeadlinesLoading(false)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching expanded keywords:', err)
      setExpandedError(err.message)
    } finally {
      setExpandedLoading(false)
      setHeadlinesLoading(false)
    }
  }

  // Function to fetch headlines for a keyword
  const fetchHeadlines = async (keyword) => {
    try {
      setHeadlinesError(null)
      const data = await crawlerService.getContentIdeas(keyword)
      setHeadlinesData(prev => [...prev, { keyword, ...data }])
    } catch (err) {
      console.error('Error fetching headlines:', err)
      setHeadlinesError(err.message)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection 
        loading={loading}
        onLoadingChange={setLoading}
        onDataUpdate={handleDataUpdate}
      />
      
      {/* Content below gradient container */}
      <div ref={resultsRef} className="container mx-auto px-4 py-8">
        <KeywordsAnalysisSection 
          loading={loading}
          keywordsData={keywordsData}
        />
        
        <ExpandedKeywordsSection 
          expandedLoading={expandedLoading}
          expandedKeywordsData={expandedKeywordsData}
        />

        <HeadlinesSection 
          headlinesLoading={headlinesLoading}
          headlinesData={headlinesData}
          expandedLoading={expandedLoading}
        />
        
        {/* Only show StrategicContentCTA after headlines are loaded and displayed */}
        {!headlinesLoading && headlinesData.length > 0 && (
          <StrategicContentCTA />
        )}
        
        <ErrorSection 
          error={error}
          expandedError={expandedError}
          headlinesError={headlinesError}
        />
      </div>
    </div>
  )
}

export default App