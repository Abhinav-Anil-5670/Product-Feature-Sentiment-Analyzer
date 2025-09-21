import { useState, useRef } from 'react';
import { Upload, Link, Type, Send } from 'lucide-react';

export default function Form() {
  const [textInput, setTextInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const isFormValid = textInput.trim() || linkInput.trim() || file;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', { textInput, linkInput, file });
      setIsSubmitting(false);
      // Reset form
      setTextInput('');
      setLinkInput('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Form Container */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-800 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
              Submit Content
            </h1>
            <p className="text-gray-400 text-sm">
              Share your text, files, or links with us
            </p>
          </div>

          <div className="space-y-6">
            {/* Text Input */}
            <div className="group">
              <label className="flex items-center text-gray-300 text-sm font-medium mb-2 transition-colors group-focus-within:text-blue-400">
                <Type className="w-4 h-4 mr-2" />
                Text Content
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your text here..."
                rows={4}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 resize-none hover:bg-gray-800/70"
              />
            </div>

            {/* File Upload */}
            <div className="group">
              <label className="flex items-center text-gray-300 text-sm font-medium mb-2 transition-colors group-focus-within:text-purple-400">
                <Upload className="w-4 h-4 mr-2" />
                File Upload
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-purple-500 transition-all duration-200 cursor-pointer group-hover:bg-gray-800/30"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="text-green-400">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110" />
                    <p className="text-sm">Drop a file here or click to browse</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Any file type accepted
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Link Input */}
            <div className="group">
              <label className="flex items-center text-gray-300 text-sm font-medium mb-2 transition-colors group-focus-within:text-green-400">
                <Link className="w-4 h-4 mr-2" />
                Website Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 pl-12 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 hover:bg-gray-800/70"
                />
                <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] hover:shadow-lg shadow-blue-500/25'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit</span>
                </>
              )}
            </button>

            {/* Form Status */}
            {!isFormValid && (
              <p className="text-center text-gray-500 text-sm">
                Fill at least one field to submit
              </p>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}