import React from 'react';

const StrategicContentCTA = () => {
  return (
    <div className="max-w-6xl mx-auto mt-12 relative">
      {/* Blurred content in background */}
      <div className="bg-white rounded-lg shadow-lg p-6 filter blur-sm pointer-events-none relative overflow-hidden">
        {/* Decorative elements for visual appeal */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-100 rounded-full opacity-50"></div>
        <div className="absolute -left-16 bottom-0 w-40 h-40 bg-indigo-100 rounded-full opacity-50"></div>
        
        <div className="mb-8 relative z-10">
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-teal-700">Advanced Content Strategy Blueprint</h3>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800">Audience Intelligence</h4>
                </div>
                <p className="text-gray-500 ml-10">Advanced psychographic analysis for precise targeting</p>
                <div className="ml-10 mt-3 flex">
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">Premium</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800">Competitor Gap Matrix</h4>
                </div>
                <p className="text-gray-500 ml-10">Identify untapped content opportunities for quick wins</p>
                <div className="ml-10 mt-3 flex">
                  <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">Exclusive</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-5 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800">12-Month Content Roadmap</h4>
                </div>
                <p className="text-gray-500 ml-10">Strategic publication schedule with optimization cycles</p>
                <div className="ml-10 mt-3 flex">
                  <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">Strategic</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 mt-8 pt-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800">Conversion Rate Optimization Strategy</h4>
              </div>
              
              <div className="ml-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 shadow-sm">
                  <p className="text-gray-500">Strategic content upgrades and lead magnets</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 shadow-sm">
                  <p className="text-gray-500">Advanced CTA placement and testing framework</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced CTA overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/40 flex items-center justify-center">
        <div className="bg-gradient-to-r from-indigo-600 to-teal-500 rounded-xl shadow-2xl p-8 text-white max-w-3xl mx-4 border-2 border-white/20 relative">
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl">
              <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center mt-6">
            <span className="px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-4 inline-block">PREMIUM STRATEGY</span>
            <h3 className="text-3xl font-bold mb-3">Unlock your complete SEO content roadmap</h3>
            <p className="text-white/90 text-lg mb-6 max-w-2xl">
              Get expert-level insights and a comprehensive strategic plan tailored to your specific business goals, target audience, and market position.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mt-2 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-teal-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white">Custom keyword strategy</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-teal-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white">Competitor analysis</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-teal-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white">12-month content plan</span>
              </div>
            </div>
            
            <a 
              href="https://bizblaze.co/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 border-2 border-white rounded-lg text-lg font-medium bg-white text-indigo-700 hover:bg-indigo-50 transition-colors duration-200 shadow-lg"
            >
              Get in touch
              <svg className="ml-2 -mr-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
            
            <p className="mt-4 text-white/70 text-sm">
              We're ready to help you build a winning content strategy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicContentCTA; 