
import React from 'react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            FISABytes Cookie Manager
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A lightweight Chrome extension for easy cookie management
          </p>
          
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900">Installation Steps</h2>
            <ol className="mt-4 text-left max-w-2xl mx-auto space-y-4">
              <li>1. Download the extension files from this page</li>
              <li>2. Open Chrome and go to chrome://extensions/</li>
              <li>3. Enable "Developer mode" in the top right</li>
              <li>4. Click "Load unpacked" and select the downloaded folder</li>
            </ol>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900">How to Import Cookies</h2>
            <ol className="mt-4 text-left max-w-2xl mx-auto space-y-4">
              <li>1. Click the FISABytes icon in your browser toolbar</li>
              <li>2. Click the "Import Cookies" button</li>
              <li>3. Select your cookie file (.json format)</li>
              <li>4. Wait for the success message</li>
            </ol>
          </div>

          <div className="mt-10">
            <a
              href="/download/extension.zip"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Download Extension
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
