import React, { useState, useEffect } from 'react';
import { Tab, ErrorInfo } from './types';
import WebsiteInfo from './components/WebsiteInfo';
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import CookieManagerTab from "./components/CookieManagerTab";
import SecurityTab from "./components/SecurityTab";
import HelpTab from "./components/HelpTab";
import ErrorModal from "./components/ErrorModal";
import { CookieManager } from "./lib/CookieManager";
import { getChromeAPI } from "./lib/chromeMock";
import Landing from './pages/Landing';
import { Website, Settings, Cookie } from "./types";


export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('cookies');
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [settings, setSettings] = useState<Settings>({
    encryptionEnabled: true,
    encryptionMethod: "aes256" as "aes256" | "aes128",
    passwordEnabled: false,
    validateSecurity: true,
    detectXSS: true,
    enforceSameOrigin: true,
  });

  const cookieManager = new CookieManager();
  
  const handleError = (err: Error | any) => {
    // More detailed error logging to help debug
    console.error('Error object type:', typeof err);
    
    if (err && typeof err === 'object') {
      console.error('Error properties:', Object.keys(err));
      try {
        console.error('Error stringified:', JSON.stringify(err, (key, value) => {
          if (value instanceof Error) {
            return {
              name: value.name,
              message: value.message,
              stack: value.stack,
            };
          }
          return value;
        }, 2));
      } catch (e) {
        console.error('Could not stringify error:', e);
      }
    }
    
    // Standard format for error info
    let errorTitle = "Error";
    let errorMessage = "";
    let errorDetails = "";
    
    // Extract meaningful information based on error type
    if (err instanceof Error) {
      // Standard JS Error objects
      errorTitle = err.name || "Error";
      errorMessage = err.message || "An unexpected error occurred";
      errorDetails = err.stack || "";
    } else if (err && typeof err === 'object') {
      // Custom error objects (like those thrown from our code)
      errorTitle = err.title || err.name || "Error";
      errorMessage = err.message || String(err) || "An unexpected error occurred";
      errorDetails = err.details || err.stack || JSON.stringify(err, null, 2);
    } else {
      // Simple string or other primitive values
      errorMessage = String(err);
    }
    
    // Set simple error message for the banner
    setError(errorMessage);
    
    // Set detailed error info for the modal
    setErrorInfo({
      title: errorTitle,
      message: errorMessage,
      details: errorDetails,
      timestamp: Date.now()
    });
    
    setShowErrorModal(true);
  };


  // Initialize message handlers and website data fetching
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => handleError(e.error);
    window.addEventListener('error', errorHandler);

    try {
      const chrome = getChromeAPI();
      if (chrome && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs: any[]) => {
          try {
            const currentTab = tabs[0];
            if (currentTab?.url) {
              const url = new URL(currentTab.url);
              
              if (chrome.cookies) {
                chrome.cookies.getAll({ domain: url.hostname }, (cookies: any[]) => {
                  setCurrentWebsite({
                    url: url.hostname,
                    name: url.hostname,
                    favicon: currentTab.favIconUrl || "",
                    cookies: cookies.map((c: any) => ({
                      name: c.name,
                      value: c.value,
                      domain: c.domain,
                      path: c.path,
                      secure: c.secure,
                      httpOnly: c.httpOnly,
                      sameSite: c.sameSite,
                      expirationDate: c.expirationDate,
                    })),
                    status: cookies.length > 0 ? "available" : "no_cookies"
                  });
                  setIsLoading(false);
                });
              } else {
                console.warn("Chrome cookies API not available");
                setIsLoading(false);
              }
            } else {
              setIsLoading(false);
            }
          } catch (error) {
            handleError(error instanceof Error ? error : new Error(String(error)));
            setIsLoading(false);
          }
        });
      } else {
        console.warn("Chrome tabs API not available");
        setIsLoading(false);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
      setIsLoading(false);
    }
    
    return () => window.removeEventListener('error', errorHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExportCookies = async () => {
    if (!currentWebsite) return;

    try {
      setIsLoading(true);
      const result = await cookieManager.exportCookies(currentWebsite.url, settings);

      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `cookies-${currentWebsite.url}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (error) {
      console.error('Export failed:', error);
      handleError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCookies = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';

      fileInput.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (!files || files.length === 0) return;

        const file = files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            setIsLoading(true);
            const content = e.target?.result as string;
            
            // Validate JSON first
            let data;
            try {
              data = JSON.parse(content);
              console.log('Parsed import data:', {
                keys: Object.keys(data),
                encrypted: data?.encrypted,
                dataType: data?.data ? typeof data.data : 'undefined'
              });
            } catch (parseError) {
              throw {
                title: 'Invalid JSON Format',
                message: 'The file does not contain valid JSON data',
                details: parseError instanceof Error ? parseError.message : 'Unable to parse file content as JSON'
              };
            }
            
            // Validate expected structure
            if (!data || typeof data !== 'object') {
              throw {
                title: 'Invalid Cookie File',
                message: 'The imported file does not have the expected structure',
                details: 'Expected an object with data and encrypted properties'
              };
            }
            
            // Ensure we have the data field
            if (data.data === undefined) {
              throw {
                title: 'Missing Cookie Data',
                message: 'The imported file is missing cookie data',
                details: 'The file should contain a "data" field with cookie information'
              };
            }
            
            const result = await cookieManager.importCookies(data, settings);

            if (result.success) {
              // Show success notification
              setError('Successfully imported cookies. The page will reload to apply changes.');
            } else {
              handleError({
                title: "Import Partially Successful",
                message: `Imported ${result.metadata.imported} of ${result.metadata.total} cookies`,
                details: `Some cookies couldn't be imported due to validation errors.`
              });
            }
          } catch (error) {
            console.error('Import error:', error);
            handleError(error);
          } finally {
            setIsLoading(false);
          }
        };

        reader.readAsText(file);
      };

      fileInput.click();
    } catch (error) {
      console.error('File selection error:', error);
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({
      ...settings,
      ...newSettings
    });

    console.log("Settings updated:", { ...settings, ...newSettings });

    try {
      const chrome = getChromeAPI();
      if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ settings: { ...settings, ...newSettings } });
      }
    } catch (error) {
      console.warn("Failed to save settings to chrome storage:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <TabNavigation
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
        {activeTab === "cookies" && (
          <CookieManagerTab
            website={currentWebsite}
            isLoading={isLoading}
            onExport={handleExportCookies}
            onImport={handleImportCookies}
          />
        )}

        {activeTab === "security" && (
          <SecurityTab
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}

        {activeTab === "help" && (
          <HelpTab />
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>
      <ErrorModal
        show={showErrorModal}
        error={errorInfo}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
}