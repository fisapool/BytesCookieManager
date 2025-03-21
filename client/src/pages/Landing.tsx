
import React from 'react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <img src="/img/logo-128.png" alt="FISABytes Logo" className="mx-auto h-24 w-24" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            FISABytes Cookie Manager
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A lightweight Chrome extension for seamless cookie management
          </p>
          
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Simple Installation</h2>
            <ol className="text-left space-y-4 text-gray-700">
              <li className="flex items-center">
                <span className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white mr-3">1</span>
                Download the extension files from this page
              </li>
              <li className="flex items-center">
                <span className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white mr-3">2</span>
                Open Chrome and navigate to chrome://extensions/
              </li>
              <li className="flex items-center">
                <span className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white mr-3">3</span>
                Enable "Developer mode" in the top right
              </li>
              <li className="flex items-center">
                <span className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white mr-3">4</span>
                Click "Load unpacked" and select the downloaded folder
              </li>
            </ol>
            
            <div className="mt-8 flex justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                Download Extension
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-blue-500 text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold mb-2">Easy Management</h3>
              <p className="text-gray-600">Simple import and export of cookies with just one click</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-blue-500 text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure</h3>
              <p className="text-gray-600">All operations happen locally in your browser</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-blue-500 text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">Lightweight and optimized for performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
