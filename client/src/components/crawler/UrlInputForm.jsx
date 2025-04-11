import { useState } from 'react';
import { countries } from '../../data/countries';
import { IoAdd, IoAddOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";

function UrlInputForm({ url, onUrlChange, onSubmit, isLoading }) {
  const [useManualUrls, setUseManualUrls] = useState(false);
  const [additionalUrls, setAdditionalUrls] = useState(['']);
  const [selectedCountry, setSelectedCountry] = useState('us');
  
  const handleAdditionalUrlChange = (index, value) => {
    const newUrls = [...additionalUrls];
    newUrls[index] = value;
    setAdditionalUrls(newUrls);
  };
  
  const addUrlField = () => {
    if (additionalUrls.length < 4) {
      setAdditionalUrls([...additionalUrls, '']);
    }
  };
  
  const removeUrlField = (index) => {
    const newUrls = additionalUrls.filter((_, i) => i !== index);
    setAdditionalUrls(newUrls);
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (useManualUrls) {
      const allUrls = [url, ...additionalUrls.filter(u => u.trim() !== '')];
      onSubmit(e, allUrls, selectedCountry);
    } else {
      onSubmit(e, null, selectedCountry);
    }
  };
  
  return (
    <form onSubmit={handleFormSubmit} className="bg-white rounded-xl p-6 lg:p-8 shadow-2xl max-w-md mx-auto flex flex-col relative overflow-y-auto max-h-[calc(100vh-120px)] hover:scrollbar-thin scrollbar-none hover:scrollbar-thumb-gray-300/50 hover:scrollbar-track-transparent">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Boost Traffic with AI Content
      </h2>
      
      <p className="text-gray-600 mb-6">
        Let AI find your best keywords and content opportunities in minutes.
      </p>

      <div className="space-y-4 flex-grow">
        <div>
          <label htmlFor="websiteUrl" className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
            <span>👉 Start with your website</span>
          </label>
          <input
            type="url"
            id="websiteUrl"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="www.yourwebsite.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
            <span>🌎 Who are you targeting?</span>
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={useManualUrls}
              onChange={(e) => setUseManualUrls(e.target.checked)}
              className="w-4 h-4 text-teal-400 focus:ring-teal-400 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700 text-sm group-hover:text-gray-900">🎯 Got specific pages in mind?</span>
          </label>
        </div>
        
        {useManualUrls && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span>✨ Add your priority pages</span>
              <span className="text-gray-400">(up to 4)</span>
            </p>
            <div className="space-y-2">
              {additionalUrls.map((additionalUrl, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={additionalUrl}
                    onChange={(e) => handleAdditionalUrlChange(index, e.target.value)}
                    placeholder={`Page ${index + 1}`}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeUrlField(index)}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors group"
                      title="Remove URL"
                    >
                      <RiDeleteBin6Line className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              ))}
              
              {additionalUrls.length < 4 && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={addUrlField}
                    className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600 transition-colors group"
                    title="Add New URL"
                  >
                    <IoAddOutline className="w-5 h-5 group-hover:scale-110 transition-transform stroke-[2.5]" />
                  </button>
                  <span className="text-sm text-gray-500">Add another page</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Analyzing...' : 'Get Content Ideas'}
      </button>
    </form>
  );
}

export default UrlInputForm; 