import { useState, useEffect } from 'react';

const messages = [
  "Researching trending topics in your industry...",
  "Analyzing current market trends and patterns...",
  "Gathering insights from top-performing content...",
  "Generating attention-grabbing headlines...",
  "Optimizing for click-through rates...",
  "Adding emotional triggers and power words...",
  "Almost ready with your research-backed headlines..."
];

function HeadlinesLoading() {
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
        
        {/* Headlines icon with animations */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-12 h-12 text-teal-500 animate-pulse group-hover:scale-110 transition-transform duration-300" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            style={{ animation: 'pulse 2s infinite' }}
          >
            <path 
              fillRule="evenodd" 
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" 
              clipRule="evenodd" 
              className="animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
            <path 
              fillRule="evenodd" 
              d="M3 5a2 2 0 012-2h1V1a1 1 0 112 0v2h1a2 2 0 012 2v2a1 1 0 11-2 0V5H4v2a1 1 0 11-2 0V5z" 
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

export default HeadlinesLoading; 