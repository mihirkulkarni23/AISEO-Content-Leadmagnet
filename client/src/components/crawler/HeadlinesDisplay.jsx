import React, { useState } from 'react';

function HeadlinesDisplay({ headlines }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!headlines) return null;

  const renderSection = (title, content) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      </div>
      <p className="text-gray-600 whitespace-pre-wrap">{content}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <svg className="w-4 h-4 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Recommended Content Outline
        </h2>
        <button 
          className="text-teal-600 hover:text-teal-800 border border-teal-200 hover:bg-teal-50 transition-colors duration-200 py-1 px-3 rounded-md text-sm font-medium flex items-center" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Show content outline
          <svg 
            className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className={`space-y-6 ${isExpanded ? '' : 'hidden'}`}>
        {renderSection('Title', headlines.title)}
        {renderSection('Meta Description', headlines.meta)}
        {renderSection('Main Heading', headlines.Heading)}
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Subheadings</h3>
          <ul className="space-y-3">
            {Object.entries(headlines.h2).map(([key, value]) => (
              <li key={key} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm font-medium mr-3 mt-1">
                  {key}
                </span>
                <div className="flex-1">
                  <p className="text-gray-600">{value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HeadlinesDisplay; 