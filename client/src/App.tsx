import { useState, useEffect } from "react";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import CookieManagerTab from "./components/CookieManagerTab";
import SecurityTab from "./components/SecurityTab";
import HelpTab from "./components/HelpTab";
import ErrorModal from "./components/ErrorModal";
import { Tab, Website, ErrorInfo, Settings, Cookie } from "./types";
import { CookieManager } from "./lib/CookieManager";
import { getChromeAPI } from "./lib/chromeMock";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("cookies");
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    encryptionEnabled: true,
    encryptionMethod: "aes256",
    passwordEnabled: false,
    validateSecurity: true,
    detectXSS: true,
    enforceSameOrigin: true,
  });

  const cookieManager = new CookieManager();

  useEffect(() => {
    // Get current tab to detect website
    const chrome = getChromeAPI();
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      try {
        const currentTab = tabs[0];
        if (currentTab?.url) {
          const url = new URL(currentTab.url);
          
          // Get all cookies for the current domain
          chrome.cookies.getAll({ domain: url.hostname }, (cookies) => {
            setCurrentWebsite({
              url: url.hostname,
              name: url.hostname,
              favicon: currentTab.favIconUrl || "",
              cookies: cookies.map((c) => ({
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
        }
      } catch (error) {
        console.error("Error loading tab data:", error);
        handleError({
          title: "Tab Access Error",
          message: "Unable to access tab information",
          details: error instanceof Error ? error.message : String(error)
        });
        setIsLoading(false);
      }
    });
  }, []);

  const handleError = (error: ErrorInfo) => {
    setErrorInfo(error);
    setShowErrorModal(true);
  };

  const handleExportCookies = async () => {
    if (!currentWebsite) return;

    try {
      setIsLoading(true);
      const result = await cookieManager.exportCookies(currentWebsite.url, settings);
      
      // Create a download for the exported cookies
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // In development, just create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `cookies-${currentWebsite.url}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Show success message
      // This would typically update a status component
    } catch (error) {
      console.error('Export failed:', error);
      handleError({
        title: "Export Failed",
        message: "Unable to export cookies",
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCookies = async () => {
    try {
      // Create file input element
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
            const data = JSON.parse(content);
            
            const result = await cookieManager.importCookies(data, settings);
            
            // Update UI with import results
            if (result.success) {
              // Show success notification
            } else {
              // Show partial success or error
              handleError({
                title: "Import Partially Successful",
                message: `Imported ${result.metadata.imported} of ${result.metadata.total} cookies`,
                details: `Some cookies couldn't be imported due to validation errors.`
              });
            }
          } catch (error) {
            console.error('Import error:', error);
            handleError({
              title: "Import Failed",
              message: "Unable to import cookies from file",
              details: error instanceof Error ? error.message : String(error)
            });
          } finally {
            setIsLoading(false);
          }
        };
        
        reader.readAsText(file);
      };
      
      fileInput.click();
    } catch (error) {
      console.error('File selection error:', error);
      handleError({
        title: "Import Error",
        message: "Unable to open file selector",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({
      ...settings,
      ...newSettings
    });
    
    // For development, just console log the settings
    console.log("Settings updated:", { ...settings, ...newSettings });
    
    // In a real extension environment this would use chrome.storage
    const chrome = getChromeAPI();
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ settings: { ...settings, ...newSettings } });
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Header />
      
      <main className="p-4">
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
      </main>
      
      <ErrorModal
        show={showErrorModal}
        error={errorInfo}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
}

export default App;
