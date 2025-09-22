import { useState } from 'react';
import { Type, Send, CheckCircle, AlertTriangle } from 'lucide-react';

// API endpoint for the single review functionality
const SINGLE_REVIEW_API_ENDPOINT = 'http://localhost:5000/work/single';

export default function TextInput() {
  const [textInput, setTextInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for handling API responses and errors
  const [status, setStatus] = useState({ message: null, type: null });
  const [analysisResult, setAnalysisResult] = useState(null);

  const isFormValid = textInput.trim() !== '';

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    // Reset status and previous results on new submission
    setStatus({ message: null, type: null });
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('review', textInput);

    try {
      const response = await fetch(SINGLE_REVIEW_API_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        setStatus({ message: 'Analysis successful!', type: 'success' });
        setTextInput(''); 
      } else {
        const errorText = await response.text();
        setStatus({ message: `Error: ${errorText}`, type: 'error' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus({ message: 'A network error occurred. The server might not be running.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 text-gray-800 font-sans p-4 lg:p-8">
      {/* Main Dashboard Container */}
      <div className="relative z-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Text Analysis Dashboard</h1>
          <p className="text-gray-600">Enter a single review for sentiment analysis.</p>
        </header>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Panel: Input and Controls */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 border border-teal-400 h-full">
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                    <Type className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Review Analyzer</h2>
                    <p className="text-sm text-gray-500">Input your text below</p>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center text-gray-600 text-sm font-medium mb-2 transition-colors group-focus-within:text-teal-600">
                    Review Content
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter your review..."
                    rows={8}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 resize-none"
                  />
                  <div className="mt-2 text-right text-xs text-gray-500">
                    {textInput.length} characters
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                    isFormValid && !isSubmitting
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transform shadow-teal-500/25'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Analyze Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Results and Status */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Message Widget */}
            {status.message && (
                <div className={`bg-white rounded-2xl p-4 border flex items-center text-sm ${
                    status.type === 'success' ? 'text-green-800 border-green-200 bg-green-50' : 'text-red-800 border-red-200 bg-red-50'
                }`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0"/> : <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />}
                    <span>{status.message}</span>
                </div>
            )}

            {/* Analysis Result Widget */}
            <div className="bg-white rounded-2xl p-6 border border-teal-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analysis Result</h3>
              {analysisResult ? (
                <div className="animate-fade-in">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-100 p-4 rounded-md border border-gray-200">
                    {JSON.stringify(analysisResult, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Results will be displayed here after analysis.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

