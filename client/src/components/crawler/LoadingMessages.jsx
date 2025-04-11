import { useState, useEffect } from 'react';

const messages = [
  "Extracting content from your website...",
  "Analyzing content structure...",
  "Identifying key topics and themes...",
  "Processing internal links...",
  "Analyzing keyword opportunities...",
  "Generating keyword suggestions...",
  "Almost there..."
];

function LoadingMessages() {
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
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-teal-200 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-teal-500 rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
      </div>
      <div className="text-center">
        <p className={`text-gray-600 text-lg transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {messages[currentMessage]}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          This may take a few moments...
        </p>
      </div>
    </div>
  );
}

export default LoadingMessages; 