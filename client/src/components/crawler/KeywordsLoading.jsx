import { useState, useEffect } from 'react';

const messages = [
  "Crawling your website content...",
  "Analyzing page structure and content...",
  "Identifying key topics and themes...",
  "Extracting potential keywords...",
  "Analyzing search intent and relevance...",
  "Calculating keyword metrics...",
  "Almost ready with your keyword insights..."
];

function KeywordsLoading() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-8 group">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-teal-200 rounded-full animate-spin"></div>
        
        {/* Inner ring */}
        <div className="absolute inset-3 border-4 border-teal-500 rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
        
        {/* Document icon with animations */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-12 h-12 text-teal-500 animate-pulse group-hover:scale-110 transition-transform duration-300" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            style={{ animation: 'pulse 2s infinite' }}
          >
            <path 
              fillRule="evenodd" 
              d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" 
              clipRule="evenodd" 
              className="animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
            <path 
              fillRule="evenodd" 
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" 
              clipRule="evenodd"
              className="animate-pulse"
              style={{ animationDelay: '0.4s' }}
            />
          </svg>
        </div>
      </div>
      
      <div className="text-center max-w-md">
        <p className={`text-gray-600 text-lg transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {messages[currentMessage]}
        </p>
      </div>
    </div>
  );
}

export default KeywordsLoading; 