import { useState, useEffect } from 'react';
import { Settings } from '../types';
import { getChromeAPI } from '../lib/chromeMock';

interface HeaderProps {
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const [version, setVersion] = useState<string>("2.0");
  
  useEffect(() => {
    // Get manifest version for display
    try {
      const chrome = getChromeAPI();
      if (chrome && chrome.runtime && typeof chrome.runtime.getManifest === 'function') {
        const manifestData = chrome.runtime.getManifest();
        if (manifestData && manifestData.version) {
          setVersion(manifestData.version);
        }
      }
    } catch (error) {
      console.error("Error fetching manifest version:", error);
    }
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <img src="/img/logo-48.png" alt="FISABytes Logo" className="w-8 h-8" />
        <div>
          <h1 className="text-xl font-semibold text-gray-800">FISABytes</h1>
          <p className="text-xs text-gray-500">Cookie Manager v{version}</p>
        </div>
      </div>
      
      <button
        onClick={onSettingsClick}
        className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
        aria-label="Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </header>
  );
};

export default Header;
