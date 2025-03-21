// Chrome extension type definitions
interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
  favIconUrl?: string;
}

interface ChromeRuntime {
  id?: string;
  getManifest: () => any;
  onMessage: {
    addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
    removeListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
  };
  sendMessage: (message: any, callback?: (response: any) => void) => boolean;
  // Add lastError property which may be set during API operations
  lastError?: {
    message: string;
  };
}

interface ChromeAPI {
  runtime: ChromeRuntime;
  cookies: {
    getAll: (details: any, callback: (cookies: any[]) => void) => void;
    set: (details: any, callback?: (cookie: any) => void) => void;
    remove: (details: any, callback?: () => void) => void;
  };
  tabs: {
    query: (queryInfo: any, callback: (tabs: ChromeTab[]) => void) => void;
    reload: (tabId: number) => void;
  };
  storage: {
    sync: {
      get: (keys: any, callback?: (items: any) => void) => void;
      set: (items: any, callback?: () => void) => void;
    };
  };
  downloads: {
    download: (options: any, callback?: (downloadId: string) => void) => void;
  };
}

// Add Chrome API types to window
declare global {
  interface Window {
    chrome?: ChromeAPI;
  }
  var chrome: ChromeAPI | undefined;
}

// Determine if we're in a Chrome extension environment
export const isExtensionEnvironment = (): boolean => {
  try {
    return typeof window !== 'undefined' && 
           typeof window.chrome !== 'undefined' && 
           typeof window.chrome.runtime !== 'undefined' && 
           typeof window.chrome.runtime.id !== 'undefined';
  } catch (error) {
    console.warn('Error checking extension environment:', error);
    return false;
  }
};

// Get the Chrome object or mock in development
export const getChromeAPI = () => {
  try {
    if (isExtensionEnvironment()) {
      return window.chrome;
    }
    return chromeMock;
  } catch (error) {
    console.warn('Error getting Chrome API:', error);
    return chromeMock;
  }
};

// Mock implementation of Chrome extension APIs for development environment
export const chromeMock: ChromeAPI = {
  runtime: {
    id: "mock-extension-id",
    getManifest: () => {
      return {
        name: "FISABytes",
        version: "2.0.0",
        description: "Enhanced cookie management with better security and encryption"
      };
    },
    onMessage: {
      addListener: () => {},
      removeListener: () => {}
    },
    sendMessage: (message: any, callback?: (response: any) => void) => {
      try {
        if (callback) {
          callback({ status: 'success' });
        }
        return true;
      } catch (error) {
        console.error('Error in mock sendMessage:', error);
        if (callback) {
          callback({ status: 'error', error: error });
        }
        return false;
      }
    }
  },
  cookies: {
    getAll: (details: any, callback: (cookies: any[]) => void) => {
      try {
        console.log('Mock getAll cookies for domain:', details.domain);
        callback([
          {
            name: "session",
            value: "mock-session-value",
            domain: details.domain || "example.com",
            path: "/",
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            expirationDate: Date.now() / 1000 + 86400
          },
          {
            name: "preferences",
            value: "theme=dark",
            domain: details.domain || "example.com",
            path: "/",
            secure: false,
            httpOnly: false,
            sameSite: "lax",
            expirationDate: Date.now() / 1000 + 86400
          }
        ]);
      } catch (error) {
        console.error('Error in mock cookies.getAll:', error);
        // Set the lastError property for the mock
        chromeMock.runtime.lastError = { message: String(error) };
        callback([]);
      }
    },
    set: (details: any, callback?: (cookie: any) => void) => {
      try {
        console.log('Mock setting cookie:', details.name, 'for domain:', details.domain || 'unknown');
        
        // Validate cookie details to match real Chrome behavior
        if (!details.url && !details.domain) {
          throw new Error('Either url or domain must be specified');
        }
        
        if (!details.name || !details.value) {
          throw new Error('Name and value must be specified');
        }
        
        // Special cookie validation to match Chrome behavior
        if (details.name.startsWith('__Host-') && (!details.secure || details.domain)) {
          chromeMock.runtime.lastError = {
            message: 'Host cookies must be secure and must not specify a domain'
          };
          
          if (callback) {
            callback(null);
          }
          return;
        }
        
        if (details.name.startsWith('__Secure-') && !details.secure) {
          chromeMock.runtime.lastError = {
            message: 'Secure cookie must be marked as secure'
          };
          
          if (callback) {
            callback(null);
          }
          return;
        }
        
        // Simulate successful cookie setting
        if (callback) {
          callback(details);
        }
        
        // Clear any previous lastError
        chromeMock.runtime.lastError = undefined;
      } catch (error) {
        console.error('Error in mock cookies.set:', error);
        // Set the lastError property for the mock
        chromeMock.runtime.lastError = { message: String(error) };
        if (callback) {
          callback(null);
        }
      }
    },
    remove: (details: any, callback?: () => void) => {
      try {
        console.log('Mock removing cookie:', details.name, 'from domain:', details.domain || 'unknown');
        
        // Validate details
        if (!details.name) {
          throw new Error('Name must be specified');
        }
        
        if (!details.url && !details.domain) {
          throw new Error('Either url or domain must be specified');
        }
        
        if (callback) {
          callback();
        }
        
        // Clear any previous lastError
        chromeMock.runtime.lastError = undefined;
      } catch (error) {
        console.error('Error in mock cookies.remove:', error);
        // Set the lastError property for the mock
        chromeMock.runtime.lastError = { message: String(error) };
        if (callback) {
          callback();
        }
      }
    }
  },
  tabs: {
    query: (queryInfo: any, callback: (tabs: ChromeTab[]) => void) => {
      try {
        console.log('Mock tabs.query with info:', queryInfo);
        callback([{
          id: 1,
          url: "https://example.com",
          title: "Example Website",
          favIconUrl: "https://example.com/favicon.ico"
        }]);
      } catch (error) {
        console.error('Error in mock tabs.query:', error);
        chromeMock.runtime.lastError = { message: String(error) };
        callback([]);
      }
    },
    reload: (tabId: number) => {
      try {
        console.log(`Mock: Reloading tab with id ${tabId}`);
      } catch (error) {
        console.error('Error in mock tabs.reload:', error);
        chromeMock.runtime.lastError = { message: String(error) };
      }
    }
  },
  storage: {
    sync: {
      get: (keys: any, callback?: (items: any) => void) => {
        try {
          console.log('Mock storage.sync.get for keys:', keys);
          if (callback) {
            callback({
              settings: {
                encryptionEnabled: true,
                encryptionMethod: "aes256",
                passwordEnabled: false,
                validateSecurity: true,
                detectXSS: true,
                enforceSameOrigin: true
              }
            });
          }
        } catch (error) {
          console.error('Error in mock storage.sync.get:', error);
          chromeMock.runtime.lastError = { message: String(error) };
          if (callback) {
            callback({});
          }
        }
      },
      set: (items: any, callback?: () => void) => {
        try {
          console.log("Mock storage.sync.set:", items);
          if (callback) {
            callback();
          }
        } catch (error) {
          console.error('Error in mock storage.sync.set:', error);
          chromeMock.runtime.lastError = { message: String(error) };
          if (callback) {
            callback();
          }
        }
      }
    }
  },
  downloads: {
    download: (options: any, callback?: (downloadId: string) => void) => {
      try {
        console.log("Mock download requested:", options);
        if (callback) {
          callback("mock-download-id");
        }
      } catch (error) {
        console.error('Error in mock download:', error);
        chromeMock.runtime.lastError = { message: String(error) };
        if (callback) {
          callback("");
        }
      }
    }
  }
};