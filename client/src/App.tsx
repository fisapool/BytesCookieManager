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
    console.error('Error encountered:', typeof err);
    
    // Standard format for error info
    let errorTitle = "Error";
    let errorMessage = "An unexpected error occurred";
    let errorDetails = "";
    
    try {
      // Handle null/undefined errors
      if (err === null || err === undefined) {
        errorTitle = "Unknown Error";
        errorMessage = "An unknown error occurred (null or undefined)";
        errorDetails = "No error details available";
      }
      // Handle standard JS Error objects
      else if (err instanceof Error) {
        errorTitle = err.name || "Error";
        errorMessage = err.message || "An unexpected error occurred";
        errorDetails = err.stack || "";
        
        console.error('Error stack:', err.stack);
      } 
      // Handle custom error objects (the most common case for our app)
      else if (err && typeof err === 'object') {
        // Log error object properties for debugging
        console.error('Error object properties:', Object.keys(err));
        
        // Try to log a safe string version of the error
        try {
          const safeReplacer = (key: string, value: any) => {
            if (value instanceof Error) {
              return {
                name: value.name,
                message: value.message,
                stack: value.stack,
              };
            }
            // Handle circular references
            return value;
          };
          
          // Limit string size to avoid console overload
          const errorStr = JSON.stringify(err, safeReplacer, 2).substring(0, 1000);
          console.error('Error details:', errorStr + (errorStr.length >= 1000 ? '...' : ''));
        } catch (stringifyError) {
          console.error('Failed to stringify error:', stringifyError);
          console.error('Raw error object:', err);
        }
        
        // Extract meaningful information from the error object
        errorTitle = err.title || err.name || "Error";
        
        // Handle the [object Object] case specifically
        if (err.message === "[object Object]" || err.message && err.message.includes("[object Object]")) {
          errorMessage = "Invalid error format detected";
          console.error('Detected [object Object] in error message');
          
          // Try to extract better information
          if (err.details) {
            errorMessage = "Error details: " + String(err.details).substring(0, 100);
          } else {
            // Build a better message from available properties
            const props = Object.keys(err).filter(k => 
              typeof err[k] !== 'object' && 
              typeof err[k] !== 'function' &&
              k !== 'title' && 
              k !== 'name'
            );
            
            if (props.length > 0) {
              errorMessage = "Error information: " + 
                props.map(p => `${p}=${String(err[p]).substring(0, 30)}`).join(', ');
            }
          }
        } else {
          errorMessage = err.message || String(err) || "An unexpected error occurred";
        }
        
        // Get detailed information
        errorDetails = err.details || err.stack || "";
        
        // If we still don't have details, try to create some
        if (!errorDetails) {
          try {
            errorDetails = JSON.stringify(err, null, 2);
          } catch (detailError) {
            errorDetails = "Could not stringify error details: " + String(detailError);
          }
        }
      } 
      // Handle primitive error values (strings, numbers, etc.)
      else {
        errorMessage = String(err);
      }
    } catch (handlingError) {
      // If our error handling itself fails, provide a fallback
      console.error('Error occurred while handling another error:', handlingError);
      errorTitle = "Error Handling Failure";
      errorMessage = "Failed to process error information";
      errorDetails = "An error occurred while trying to handle another error. Original error type: " + typeof err;
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
    
    // Always show the error modal for better user experience
    setShowErrorModal(true);
    
    // Log the final processed error
    console.error(`Error processed - Title: ${errorTitle}, Message: ${errorMessage}`);
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
      console.log('Starting cookie export for:', currentWebsite.url);
      
      const result = await cookieManager.exportCookies(currentWebsite.url, settings);
      
      // Verify the export data format before creating the file
      if (!result.data) {
        throw {
          title: 'Export Format Error',
          message: 'Failed to generate valid export data',
          details: 'The cookie manager returned an invalid data structure.'
        };
      }
      
      // Log the export data structure for debugging
      console.log('Export data structure:', {
        hasData: Boolean(result.data.data),
        dataType: typeof result.data.data,
        isArray: Array.isArray(result.data.data),
        cookieCount: Array.isArray(result.data.data) ? result.data.data.length : 0,
        encrypted: Boolean(result.data.encrypted)
      });
      
      // Verify that we have cookies to export
      if (Array.isArray(result.data.data) && result.data.data.length === 0) {
        throw {
          title: 'No Cookies to Export',
          message: 'No cookies were found for this website',
          details: 'There might be no cookies set for this domain, or they might not be accessible.'
        };
      }
      
      // Create a safe JSON string with proper error handling
      let jsonString;
      try {
        jsonString = JSON.stringify(result.data, null, 2);
      } catch (stringifyError) {
        console.error('JSON stringify error:', stringifyError);
        throw {
          title: 'Export Serialization Failed',
          message: 'Could not convert cookies to JSON format',
          details: stringifyError instanceof Error ? stringifyError.message : 'Error creating JSON string from cookie data'
        };
      }

      // Create and download the file
      try {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `cookies-${currentWebsite.url}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Show success message
        setError('Cookies exported successfully. Check your downloads folder.');
        console.log('Export completed successfully for', currentWebsite.url);
      } catch (downloadError) {
        console.error('File download error:', downloadError);
        throw {
          title: 'Export Download Failed',
          message: 'Could not download the cookie file',
          details: downloadError instanceof Error ? downloadError.message : 'Error creating or downloading the export file'
        };
      }

    } catch (error) {
      console.error('Export failed:', error);
      handleError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCookies = async () => {
    try {
      console.log('Starting cookie import process');
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';

      fileInput.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (!files || files.length === 0) {
          console.log('No file selected');
          return;
        }

        const file = files[0];
        console.log('Selected file:', file.name, 'Size:', file.size, 'bytes');
        
        if (file.size === 0) {
          handleError({
            title: 'Empty File',
            message: 'The selected file is empty',
            details: 'Please select a valid cookie export file'
          });
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
          handleError({
            title: 'File Too Large',
            message: 'The selected file exceeds the size limit',
            details: 'Cookie files should be under 5MB. This file might not be a valid cookie export.'
          });
          return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            setIsLoading(true);
            const content = e.target?.result as string;
            
            if (!content || content.trim() === '') {
              throw {
                title: 'Empty File Content',
                message: 'The file does not contain any data',
                details: 'The selected file appears to be empty'
              };
            }
            
            // Validate JSON first with more detailed error handling
            let data;
            try {
              data = JSON.parse(content);
              console.log('JSON parsed successfully');
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              throw {
                title: 'Invalid JSON Format',
                message: 'The file does not contain valid JSON data',
                details: parseError instanceof Error 
                  ? parseError.message 
                  : 'The file content could not be parsed as JSON. Make sure it\'s a valid cookie export file.'
              };
            }
            
            // Log more details about the parsed data for debugging
            console.log('Import data structure:', {
              hasData: 'data' in data,
              hasEncrypted: 'encrypted' in data,
              dataType: data?.data ? typeof data.data : 'undefined',
              isArray: data?.data ? Array.isArray(data.data) : false,
              cookieCount: data?.data && Array.isArray(data.data) ? data.data.length : 0,
              metadata: data?.metadata ? 'present' : 'missing'
            });
            
            // Validate expected structure with more detailed checks
            if (!data || typeof data !== 'object') {
              throw {
                title: 'Invalid Cookie File',
                message: 'The imported file does not have the expected structure',
                details: 'Expected an object with data and encrypted properties'
              };
            }
            
            // Check for required properties
            if (!('data' in data)) {
              throw {
                title: 'Missing Cookie Data',
                message: 'The imported file is missing the cookie data field',
                details: 'The file should contain a "data" field with cookie information'
              };
            }
            
            if (!('encrypted' in data)) {
              console.warn('Import file is missing "encrypted" field, assuming false');
              data.encrypted = false;
            }
            
            // Verify data is an array or handle encrypted data
            if (!data.encrypted && (!Array.isArray(data.data) || data.data.length === 0)) {
              throw {
                title: 'Invalid Cookie Data',
                message: Array.isArray(data.data) && data.data.length === 0 
                  ? 'The file contains an empty cookie array' 
                  : 'The cookie data is not in the expected format',
                details: 'Expected an array of cookie objects'
              };
            }
            
            console.log('Attempting to import cookies');
            const result = await cookieManager.importCookies(data, settings);

            if (result.success) {
              console.log('Import successful:', result);
              // Show success notification
              setError(`Successfully imported ${result.metadata.imported} of ${result.metadata.total} cookies. The page will reload to apply changes.`);
            } else {
              handleError({
                title: "Import Partially Successful",
                message: `Imported ${result.metadata.imported} of ${result.metadata.total} cookies`,
                details: `Some cookies couldn't be imported due to validation errors.`
              });
            }
          } catch (error) {
            console.error('Import processing error:', error);
            handleError(error);
          } finally {
            setIsLoading(false);
          }
        };

        reader.onerror = (error) => {
          console.error('File read error:', error);
          handleError({
            title: 'File Read Error',
            message: 'Failed to read the selected file',
            details: 'The file might be corrupted or inaccessible'
          });
          setIsLoading(false);
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