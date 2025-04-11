import { useState } from 'react';

function WebsiteContent({ content }) {
  const [expandedSections, setExpandedSections] = useState({});

  if (!content) return null;

  const toggleSection = (url) => {
    setExpandedSections(prev => ({
      ...prev,
      [url]: !prev[url]
    }));
  };

  return (
    <div className="space-y-4">
      {Object.entries(content).map(([url, text]) => (
        <div key={url} className="bg-gray-50 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
            onClick={() => toggleSection(url)}
          >
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 font-medium truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {url}
            </a>
            <button className="text-gray-500 hover:text-gray-700">
              <svg 
                className={`w-5 h-5 transform transition-transform duration-200 ${expandedSections[url] ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {expandedSections[url] && (
            <div className="p-4 border-t border-gray-200">
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap">{text}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default WebsiteContent; 