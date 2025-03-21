// Mock implementation of Chrome extension APIs for development environment
export const chromeMock = {
  runtime: {
    getManifest: () => {
      return {
        name: "FISABytes",
        version: "2.0.0",
        description: "Enhanced cookie management with better security and encryption"
      };
    },
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => {
        // Mock implementation
      },
      removeListener: (callback: (message: any, sender: any, sendResponse: any) => void) => {
        // Mock implementation
      }
    },
    sendMessage: (message: any, callback?: (response: any) => void) => {
      // Mock implementation
      if (callback) {
        callback({ status: 'success' });
      }
      return true;
    }
  },
  cookies: {
    getAll: (details: any, callback: (cookies: any[]) => void) => {
      // Return mock cookies for development
      callback([
        {
          name: "session",
          value: "mock-session-value",
          domain: "example.com",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "strict",
          expirationDate: Date.now() / 1000 + 86400 // 1 day from now
        },
        {
          name: "preferences",
          value: "theme=dark",
          domain: "example.com",
          path: "/",
          secure: false,
          httpOnly: false,
          sameSite: "lax",
          expirationDate: Date.now() / 1000 + 2592000 // 30 days from now
        }
      ]);
    },
    set: (details: any, callback?: (cookie: any) => void) => {
      // Mock implementation
      if (callback) {
        callback(details);
      }
    },
    remove: (details: any, callback?: () => void) => {
      // Mock implementation
      if (callback) {
        callback();
      }
    }
  },
  tabs: {
    query: (queryInfo: any, callback: (tabs: any[]) => void) => {
      // Return mock active tab for development
      callback([
        {
          id: 1,
          url: "https://example.com",
          title: "Example Website",
          favIconUrl: "https://example.com/favicon.ico"
        }
      ]);
    }
  },
  storage: {
    sync: {
      get: (keys: any, callback?: (items: any) => void) => {
        // Return mock storage data
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
      },
      set: (items: any, callback?: () => void) => {
        // Just log the items being stored in development
        console.log("Storage.sync.set:", items);
        if (callback) {
          callback();
        }
      }
    }
  },
  downloads: {
    download: (options: any, callback?: (downloadId: string) => void) => {
      // In development, we'll just log the download request
      console.log("Download requested:", options);
      if (callback) {
        callback("mock-download-id");
      }
    }
  }
};

// Declare global chrome variable for TypeScript
declare global {
  interface Window {
    chrome?: any;
  }
  const chrome: any | undefined;
}

// Determine if we're in a Chrome extension environment
export const isExtensionEnvironment = (): boolean => {
  return typeof window !== 'undefined' && typeof window.chrome !== 'undefined' && 
         typeof window.chrome.runtime !== 'undefined' && !!window.chrome.runtime.id;
};

// Get the Chrome object or mock in development
export const getChromeAPI = () => {
  if (isExtensionEnvironment()) {
    return window.chrome;
  }
  return chromeMock;
};