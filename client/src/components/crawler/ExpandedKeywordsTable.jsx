import { useState, useEffect } from 'react';

function ExpandedKeywordsTable({ csvData }) {
  const [keywords, setKeywords] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (csvData) {
      console.log('Received CSV Data:', csvData);
      // Parse CSV data
      const rows = csvData.split('\n').filter(line => line.trim());
      console.log('All Rows:', rows);
      
      // Find the header row (the first row that contains the expected CSV header)
      const headerRowIndex = rows.findIndex(row => 
        row.includes('keyword') && 
        row.includes('content_type') && 
        row.includes('searchIntent') && 
        row.includes('volume') && 
        row.includes('competition') && 
        row.includes('cpc')
      );
      
      if (headerRowIndex === -1) {
        console.error('Could not find CSV header row');
        return;
      }

      const headers = rows[headerRowIndex].split(',').map(header => header.trim());
      console.log('Headers:', headers);
      
      // Get all rows after the header
      const dataRows = rows.slice(headerRowIndex + 1);
      const data = dataRows.map(row => {
        const values = row.split(',').map(value => value.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
      
      console.log('Processed Data:', data);
      setKeywords(data);
    }
  }, [csvData]);

  if (!csvData || keywords.length === 0) {
    console.log('No data to display:', { csvData, keywords });
    return null;
  }

  const getCompetitionLevel = (competition) => {
    const compValue = typeof competition === 'string' ? parseFloat(competition) : competition;
    if (compValue < 0.3) return 'LOW';
    if (compValue < 0.7) return 'MEDIUM';
    return 'HIGH';
  };

  const getCompetitionColor = (competition) => {
    const level = getCompetitionLevel(competition);
    switch (level) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (value, type) => {
    if (value === '0' || value === '0.00' || value === '$0.00') {
      switch (type) {
        case 'volume':
          return '0';
        case 'cpc':
          return '$0.00';
        case 'competition':
          return '0';
        default:
          return value;
      }
    }
    return value;
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <svg className="w-4 h-4 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          AI-Powered High-Impact Keywords
        </h2>
        <button 
          className="text-teal-600 hover:text-teal-800 border border-teal-200 hover:bg-teal-50 transition-colors duration-200 py-1 px-3 rounded-md text-sm font-medium flex items-center" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Click to view keywords
          <svg 
            className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className={`mt-4 flex flex-wrap gap-4 ${isExpanded ? '' : 'hidden'}`}>
        {keywords.map((keyword, index) => (
          <div 
            key={index} 
            className="group relative"
          >
            <div className="bg-gray-50 rounded-lg px-4 py-3 hover:bg-teal-50 transition-colors duration-200 cursor-pointer border border-gray-100 hover:border-teal-200">
              <div className="text-gray-900 font-medium mb-1">{keyword.keyword}</div>
              {/* <div className="flex items-center text-xs space-x-3">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-gray-600">{formatValue(keyword.volume, 'volume')}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">{formatValue(keyword.cpc, 'cpc')}</span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCompetitionColor(keyword.competition)}`}>
                    {formatValue(getCompetitionLevel(keyword.competition), 'competition')}
                  </span>
                </div>
              </div> */}
            </div>
            
            {/* Tooltip on hover */}
            {/* <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-10 w-48 p-4 bg-white rounded-md shadow-lg border border-gray-200 text-sm -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full pointer-events-none">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-t border-l border-gray-200"></div>
              <div className="text-xs text-gray-500 mb-1">Search Volume</div>
              <div className="text-gray-900 font-semibold mb-2">{formatValue(keyword.volume, 'volume')} monthly searches</div>
              <div className="text-xs text-gray-500 mb-1">CPC (Cost Per Click)</div>
              <div className="text-gray-900 font-semibold mb-2">{formatValue(keyword.cpc, 'cpc')} per click</div>
              <div className="text-xs text-gray-500 mb-1">Competition</div>
              <div className={`text-sm font-semibold ${
                getCompetitionLevel(keyword.competition) === "LOW" ? "text-green-700" : 
                getCompetitionLevel(keyword.competition) === "MEDIUM" ? "text-yellow-700" : "text-red-700"
              }`}>
                {formatValue(getCompetitionLevel(keyword.competition), 'competition')} competition
              </div>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpandedKeywordsTable;