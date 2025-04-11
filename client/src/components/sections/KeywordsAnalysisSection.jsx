import KeywordsTable from '../crawler/KeywordsTable'
import KeywordsLoading from '../crawler/KeywordsLoading'

const KeywordsAnalysisSection = ({ loading, keywordsData }) => {
  if (loading) {
    return <KeywordsLoading />;
  }

  if (!keywordsData) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto border-t-4 border-teal-500">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center mr-3">
          <svg className="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 64 64">
            <path d="M26.5,16.7c-2.6,0-5.3,1-7.3,3c-2,2-3,4.6-3,7.3c0,2.6,1,5.3,3,7.3c2,2,4.6,3,7.3,3c2.6,0,5.3-1,7.3-3c2-2,3-4.6,3-7.3    c0-2.6-1-5.3-3-7.3C31.7,17.8,29.1,16.7,26.5,16.7z M26.5,35.3c-2.1,0-4.2-0.8-5.9-2.4c-1.6-1.6-2.4-3.7-2.4-5.9    c0-2.1,0.8-4.2,2.4-5.9c1.6-1.6,3.7-2.4,5.9-2.4c2.1,0,4.2,0.8,5.9,2.4h-6.9v10.8h7.7c-0.2,0.3-0.5,0.7-0.8,1    C30.7,34.5,28.6,35.3,26.5,35.3z M34.2,29.9h-6.8v-6.8h6.3c0.6,1.2,1,2.5,1,3.9C34.8,28,34.6,29,34.2,29.9z" />
            <path d="M38.5,21.2c-0.6-1.3-1.5-2.5-2.6-3.6c-2.6-2.6-6-3.9-9.5-3.9c-3.4,0-6.9,1.3-9.5,3.9c-2.6,2.6-3.9,6-3.9,9.5    c0,2.6,0.8,5.2,2.3,7.5L3.1,46.7l3.6,3.6l0.7-0.7L19,38.1c2.3,1.5,4.9,2.3,7.5,2.3c3.4,0,6.9-1.3,9.5-3.9c1.3-1.3,2.3-2.9,3-4.6    h21.9V21.2H38.5z M17.4,36.9L6.8,47.5L6,46.7l10.6-10.6L17.4,36.9z M34.5,35.1c-2.2,2.2-5.1,3.3-8.1,3.3c-2.9,0-5.8-1.1-8.1-3.3    c-2.2-2.2-3.3-5.1-3.3-8.1c0-2.9,1.1-5.8,3.3-8.1c2.2-2.2,5.1-3.3,8.1-3.3c2.9,0,5.8,1.1,8.1,3.3c2.2,2.2,3.3,5.1,3.3,8.1    C37.8,30,36.7,32.9,34.5,35.1z M58.9,29.9H39.5c0.2-1,0.3-1.9,0.3-2.9c0-1.3-0.2-2.6-0.6-3.9h19.6V29.9z" />
            <rect height="2" width="12.2" x="38.9" y="33.3" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Keyword Insights</h2>
      </div>
      <p className="text-gray-600 mb-5 pl-12">These keywords have been identified across your website content. Each one represents potential search traffic and visibility opportunities for your business.</p>
      <div className="border-t border-gray-100 pt-4">
        <KeywordsTable csvData={keywordsData} />
      </div>
    </div>
  )
}

export default KeywordsAnalysisSection 