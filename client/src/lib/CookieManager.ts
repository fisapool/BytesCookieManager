import { CookieEncryption } from './security/CookieEncryption';
import { CookieValidator } from './validation/CookieValidator';
import { ErrorManager } from './errors/ErrorManager';
import { ExportResult, EncryptedData, ImportResult, Cookie, Settings } from '../types';

const getChromeAPI = () => (typeof chrome !== 'undefined' ? chrome : undefined);

export class CookieManager {
  private readonly security: CookieEncryption;
  private readonly validator: CookieValidator;
  private readonly errorManager: ErrorManager;

  constructor() {
    this.security = new CookieEncryption();
    this.validator = new CookieValidator();
    this.errorManager = new ErrorManager();
  }

  async exportCookies(domain: string, settings: Settings, customName?: string): Promise<ExportResult> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = customName || `cookies-${domain}-${timestamp}`;

      const encryptionKey = 'FISABYTES-SECURE-KEY-2024';
      const chrome = getChromeAPI();

      const getCookiesPromise = new Promise<Cookie[]>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject({
            title: 'Cookie Export Failed',
            message: 'Could not retrieve cookies within the timeout period',
            details: 'The browser took too long to respond. This might happen if there are too many cookies or if the browser is busy.'
          });
        }, 10000); // Increased timeout to 10 seconds

        if (!chrome?.cookies?.getAll) {
          clearTimeout(timeout);
          
          // In development mode, provide mock cookie data
          if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('replit')) {
            console.log('DEV MODE: Using mock cookies for domain:', domain);
            
            // Sample development cookies
            const mockCookies: Cookie[] = [
              {
                name: "session_id",
                value: "sample-session-12345",
                domain: domain,
                path: "/",
                secure: true,
                httpOnly: true,
                sameSite: "strict",
                expirationDate: Date.now() / 1000 + 86400 // 1 day
              },
              {
                name: "user_preferences",
                value: "theme=dark&lang=en",
                domain: domain,
                path: "/",
                secure: false,
                httpOnly: false,
                sameSite: "lax",
                expirationDate: Date.now() / 1000 + 2592000 // 30 days
              },
              {
                name: "tracking_id",
                value: "user-id-987654321",
                domain: domain,
                path: "/analytics",
                secure: true,
                httpOnly: false,
                sameSite: "none",
                expirationDate: Date.now() / 1000 + 86400 // 1 day
              }
            ];
            
            resolve(mockCookies);
            return;
          }
          
          // In production, show the actual error
          reject({
            title: 'Browser API Unavailable',
            message: 'Cookie API is not accessible',
            details: 'This extension requires access to the Chrome cookie API.'
          });
          return;
        }

        chrome.cookies.getAll({ domain }, (cookies: any[]) => {
          clearTimeout(timeout);
          if (!cookies) {
            resolve([]);
            return;
          }
          
          const cookieData: Cookie[] = cookies.map((c: any) => ({
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path,
            secure: c.secure,
            httpOnly: c.httpOnly, 
            sameSite: c.sameSite,
            expirationDate: c.expirationDate,
          }));
          resolve(cookieData);
        });
      });

      const cookieData = await getCookiesPromise;
      
      // Convert to browser format
      const browserFormat = {
        "url": `https://${domain}/`,
        "cookies": cookieData.map(cookie => ({
          "domain": cookie.domain,
          "hostOnly": !cookie.domain.startsWith('.'),
          "httpOnly": cookie.httpOnly,
          "name": cookie.name,
          "path": cookie.path,
          "sameSite": cookie.sameSite,
          "secure": cookie.secure,
          "session": !cookie.expirationDate,
          "storeId": "0",
          "value": cookie.value,
          ...(cookie.expirationDate ? { "expirationDate": cookie.expirationDate } : {})
        }))
      };

      // Create a valid EncryptedData object that contains the browser format
      const encryptedData: EncryptedData = {
        data: browserFormat,  // Store the browser format in the data field
        encrypted: false,     // Indicate that this data is not encrypted
        metadata: {
          timestamp: Date.now(),
          domain: domain
        }
      };

      return {
        success: true,
        data: encryptedData,  // Return the properly typed EncryptedData object
        metadata: {
          total: cookieData.length,
          valid: cookieData.length,
          timestamp: Date.now(),
          domain: domain
        }
      };
    } catch (error) {
      const formattedError = await this.errorManager.handleError(error, "export");
      // Log the error but don't check for severity as it's not in the type
      console.error('Export error:', formattedError);
      // Ensure we're throwing a properly formatted error object
      throw typeof error === 'object' && error !== null ? error : {
        title: 'Export Failed',
        message: String(error),
        details: 'An unexpected error occurred during cookie export'
      };
    }
  }

  async importCookies(importData: any, settings: Settings): Promise<ImportResult> {
    try {
      // Create a detailed log for the import operation
      console.log('Starting cookie import operation with settings:', {
        encryptionEnabled: settings.encryptionEnabled,
        encryptionMethod: settings.encryptionMethod,
        validateSecurity: settings.validateSecurity
      });
      
      // Validate input data first with more detailed messages
      if (!importData) {
        throw {
          title: 'Invalid Import Data',
          message: 'No data provided for import',
          details: 'The import operation requires cookie data in a valid format.'
        };
      }
      
      // Log the structure of the data to help with debugging
      try {
        console.log('Import data structure:', {
          hasData: Boolean(importData.data || importData.cookies),
          isEncrypted: Boolean(importData.encrypted),
          dataType: importData.data ? typeof importData.data : 
                   importData.cookies ? 'cookies array' : 'undefined',
          isArray: importData.data ? Array.isArray(importData.data) : 
                  importData.cookies ? Array.isArray(importData.cookies) : false,
          metadataKeys: importData.metadata ? Object.keys(importData.metadata) : 'no metadata'
        });
      } catch (logError) {
        console.error('Error logging data structure:', logError);
      }
      
      const chrome = getChromeAPI();
      
      // Check if we have browser format or EncryptedData format
      let cookies: Cookie[] = [];
      
      // Handle browser format (with cookies array)
      if (importData.cookies && Array.isArray(importData.cookies)) {
        cookies = importData.cookies.map((browserCookie: any) => ({
          name: browserCookie.name,
          value: browserCookie.value,
          domain: browserCookie.domain,
          path: browserCookie.path,
          secure: browserCookie.secure,
          httpOnly: browserCookie.httpOnly,
          sameSite: browserCookie.sameSite,
          expirationDate: browserCookie.expirationDate
        }));
      }
      // Handle EncryptedData format (with data field)
      else if (importData.data) {
        if (importData.encrypted) {
          console.log('Attempting to decrypt encrypted cookie data...');
          cookies = await this.security.decryptCookies(importData, settings);
          console.log('Decryption successful, got', cookies.length, 'cookies');
        } else if (importData.data.cookies && Array.isArray(importData.data.cookies)) {
          // Handle EncryptedData with browser format inside
          cookies = importData.data.cookies.map((browserCookie: any) => ({
            name: browserCookie.name,
            value: browserCookie.value,
            domain: browserCookie.domain,
            path: browserCookie.path,
            secure: browserCookie.secure,
            httpOnly: browserCookie.httpOnly,
            sameSite: browserCookie.sameSite,
            expirationDate: browserCookie.expirationDate
          }));
        } else if (Array.isArray(importData.data)) {
          // Handle old format where data is directly an array of cookies
          cookies = importData.data as Cookie[];
        } else {
          throw {
            title: 'Invalid Cookie Data',
            message: 'The imported data is not in a recognized format',
            details: `Expected an array of cookies or a browser format object`
          };
        }
      } else {
        throw {
          title: 'Missing Cookie Data',
          message: 'The imported file has no cookie data',
          details: 'Could not find cookies array or data property in the imported file'
        };
      }
      
      if (!chrome?.cookies?.set) {
        // In development mode, simulate successful import
        if (process.env.NODE_ENV === 'development' || 
            (typeof window !== 'undefined' && window.location.hostname.includes('replit'))) {
          console.log('DEV MODE: Simulating cookie import');
          
          // Return a mock successful import result
          return {
            success: true,
            metadata: {
              total: cookies.length,
              valid: cookies.length,
              imported: cookies.length,
              timestamp: Date.now(),
              domain: cookies.length > 0 ? cookies[0].domain : "example.com"
            }
          };
        }
        
        // In production, show the actual error
        throw {
          title: 'Browser API Unavailable',
          message: 'Cookie API is not accessible',
          details: 'This extension requires access to the Chrome cookie API.'
        };
      }

      // Validate cookies array and ensure it's properly formatted
      if (!Array.isArray(cookies)) {
        throw {
          title: 'Invalid Cookie Format',
          message: 'Cookies data is not in the expected format',
          details: `Expected an array of cookies, but got ${typeof cookies}`
        };
      }

      if (cookies.length === 0) {
        throw {
          title: 'No Cookies Found',
          message: 'The imported file contains no cookies',
          details: 'Please check that you selected the correct file'
        };
      }

      let validationResults;
      try {
        validationResults = await Promise.all(
          cookies.map((cookie: Cookie) => this.validator.validateCookie(cookie, settings))
        );
      } catch (validationError) {
        throw {
          title: 'Validation Error',
          message: 'Failed to validate cookies',
          details: validationError instanceof Error ? validationError.message : 'Cookie validation process failed'
        };
      }

      const validCookies = cookies.filter((_, index: number) => 
        validationResults[index].isValid
      );

      if (validCookies.length === 0) {
        throw {
          title: 'No Valid Cookies',
          message: 'None of the cookies passed validation',
          details: 'All cookies were rejected due to validation rules'
        };
      }

      console.log(`Importing ${validCookies.length} valid cookies out of ${cookies.length} total`);
      
      // Track cookies that couldn't be set
      const failedCookies: { cookie: Cookie, reason: string }[] = [];
      
      const results = await Promise.all(
        validCookies.map(async cookie => {
          try {
            // Skip special cookies that require specific security settings
            if (cookie.name.startsWith("__Host-")) {
              failedCookies.push({ 
                cookie, 
                reason: "Special cookie with __Host- prefix cannot be imported" 
              });
              return { success: false, cookie, error: "Special cookie with __Host- prefix cannot be imported" };
            }
            
            if (cookie.name.startsWith("__Secure-") && !cookie.secure) {
              failedCookies.push({ 
                cookie, 
                reason: "Secure-prefixed cookies must have the secure flag" 
              });
              return { success: false, cookie, error: "Secure-prefixed cookies must have the secure flag" };
            }

            // Ensure cookie has all required properties
            const chromeCookie = {
              url: `http${cookie.secure ? "s" : ""}://${cookie.domain}${cookie.path}`,
              name: cookie.name,
              value: cookie.value,
              domain: cookie.domain,
              path: cookie.path,
              secure: cookie.secure,
              httpOnly: cookie.httpOnly,
              sameSite: cookie.sameSite as any,
              expirationDate: cookie.expirationDate,
              storeId: "0"
            };

            await new Promise<void>((resolve, reject) => {
              chrome?.cookies?.set(chromeCookie, (cookie: any) => {
                if (cookie) {
                  resolve();
                } else {
                  // Chrome extensions API sets lastError when an API call fails
                  // But it's not in our type definition, so we need to use any
                  const chromeRuntime = chrome.runtime as any;
                  const error = chromeRuntime.lastError || new Error("Failed to set cookie");
                  reject(error);
                }
              });
            });

            return { success: true, cookie };
          } catch (error) {
            // Track the failure
            failedCookies.push({ 
              cookie, 
              reason: error instanceof Error ? error.message : String(error) 
            });
            
            return { 
              success: false, 
              cookie, 
              error: error instanceof Error ? error.message : String(error)
            };
          }
        })
      );

      const successCount = results.filter(r => r.success).length;
      const domain = cookies.length > 0 ? cookies[0].domain : "unknown";
      
      // Log details about failed cookies if any
      if (failedCookies.length > 0) {
        console.warn(`${failedCookies.length} cookies could not be imported:`);
        failedCookies.forEach(fc => {
          console.warn(` - ${fc.cookie.name}: ${fc.reason}`);
        });
      }

      const result = {
        success: successCount > 0,
        metadata: {
          total: cookies.length,
          valid: validCookies.length,
          imported: successCount,
          timestamp: Date.now(),
          domain: domain
        }
      };
      
      console.log('Import result:', result);

      if (result.success && typeof chrome !== 'undefined' && chrome?.tabs) {
        // Get the active tab and reload it if possible
        try {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
            if (tabs && tabs.length > 0 && tabs[0]?.id) {
              chrome.tabs.reload(tabs[0].id);
            }
          });
        } catch (error) {
          console.warn('Failed to reload tab:', error);
        }
      }

      return result;
    } catch (error) {
      // Format the error using our error manager
      const formattedError = await this.errorManager.handleError(error, "import");
      
      // Log the formatted error for debugging
      console.error('Import error (formatted):', formattedError);
      
      // Create a properly structured error object
      const errorObject = {
        title: formattedError.title || 'Import Failed',
        message: formattedError.message || String(error) || 'Unknown error occurred during import',
        details: formattedError.details || 'An unexpected error occurred during cookie import'
      };
      
      // Log the final error object that will be thrown
      console.error('Throwing error object:', errorObject);
      
      // Throw the structured error object - this ensures it gets properly parsed in App.tsx
      throw errorObject;
    }
  }
}