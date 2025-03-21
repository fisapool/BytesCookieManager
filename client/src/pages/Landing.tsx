
import React from 'react';
import '../index.css';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-animate">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in">
            FISABytes
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Premium Cookie Management Solution
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Installation Guide
          </h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                <span className="text-white text-lg">1</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Download Extension</h3>
                <p className="text-blue-100">Click the button below to download the extension package</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                <span className="text-white text-lg">2</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Open Chrome Extensions</h3>
                <p className="text-blue-100">Navigate to chrome://extensions/ in your Chrome browser</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                <span className="text-white text-lg">3</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Enable Developer Mode</h3>
                <p className="text-blue-100">Toggle "Developer mode" in the top right corner</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                <span className="text-white text-lg">4</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Install Extension</h3>
                <p className="text-blue-100">Click "Load unpacked" and select the extracted extension folder</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => window.location.href = '/download-extension'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              Download Extension
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
