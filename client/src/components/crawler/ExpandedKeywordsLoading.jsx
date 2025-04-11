import { useState, useEffect } from 'react';

const messages = [
  "Analyzing primary keywords...",
  "Generating related keyword variations...",
  "Expanding keyword combinations...",
  "Calculating search volume and difficulty...",
  "Analyzing competition levels...",
  "Identifying long-tail opportunities...",
  "Almost ready with your expanded keywords..."
];

function ExpandedKeywordsLoading() {
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
        
        {/* Keywords icon with animations */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-12 h-12 text-teal-500 animate-pulse group-hover:scale-110 transition-transform duration-300" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            style={{ animation: 'pulse 2s infinite' }}
          >
            <path 
              fillRule="evenodd" 
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
              clipRule="evenodd" 
              className="animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
            <path 
              fillRule="evenodd" 
              d="M5 8a1 1 0 011-1h1V6a1 1 0 012 0v1h1a1 1 0 110 2H9v1a1 1 0 11-2 0V9H6a1 1 0 01-1-1z" 
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

export default ExpandedKeywordsLoading; 