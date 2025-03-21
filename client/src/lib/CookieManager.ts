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
      // Generate filename based on timestamp in BytesCookies format
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = customName || `cookies-${timestamp}.json`;

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
      const BATCH_SIZE = 50;
      const validCookies = [];
      
      for (let i = 0; i < cookieData.length; i += BATCH_SIZE) {
        const batch = cookieData.slice(i, i + BATCH_SIZE);
        const batchValidationResults = await Promise.all(
          batch.map(cookie => this.validator.validateCookie(cookie, settings))
        );
        
        validCookies.push(
          ...batch.filter((_, index) => batchValidationResults[index].isValid)
        );
      }

      let exportData: EncryptedData;
      if (settings.encryptionEnabled) {
        exportData = await this.security.encryptCookies(validCookies, settings);
      } else {
        // Create export data in BytesCookies format (compatible with fisapool/BytesCookies)
        exportData = {
          data: {
            url: `https://${domain}/`,
            cookies: validCookies
          },
          encrypted: false,
          metadata: {
            timestamp: Date.now(),
            domain: domain,
            version: "1.0"
          }
        };
      }

      return {
        success: true,
        data: exportData,
        metadata: {
          total: cookieData.length,
          valid: validCookies.length,
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
      // Validate input data first
      if (!importData) {
        throw {
          title: 'Invalid Import Data',
          message: 'No data provided for import',
          details: 'The import operation requires cookie data in a valid format.'
        };
      }
      
      // Log the structure of the data to help with debugging
      console.log('Import data structure:', {
        keys: importData ? Object.keys(importData) : [],
        isEncrypted: Boolean(importData.encrypted),
        hasData: Boolean(importData.data),
        hasCookies: Boolean(importData.cookies),
        isDataArray: importData.data ? Array.isArray(importData.data) : false,
        isCookiesArray: importData.cookies ? Array.isArray(importData.cookies) : false
      });
      
      const chrome = getChromeAPI();
      
      if (!chrome?.cookies?.set) {
        // In development mode, simulate successful import
        if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('replit')) {
          console.log('DEV MODE: Simulating cookie import for:', importData);
          
          // Return a mock successful import result
          let importedCookies: Cookie[] = [];
          
          if (importData.encrypted) {
            // Just simulate decryption by returning sample cookies
            importedCookies = [
              {
                name: "imported_session",
                value: "imported-value-12345",
                domain: "example.com",
                path: "/",
                secure: true,
                httpOnly: true,
                sameSite: "strict",
                expirationDate: Date.now() / 1000 + 86400
              }
            ];
          } else if (Array.isArray(importData.data)) {
            importedCookies = importData.data as Cookie[];
          } else if (Array.isArray(importData.cookies)) {
            importedCookies = importData.cookies as Cookie[];
          } else if (Array.isArray(importData)) {
            importedCookies = importData as Cookie[];
          }
          
          // In development, we'll just return success without actually setting any cookies
          return {
            success: true,
            metadata: {
              total: importedCookies.length,
              valid: importedCookies.length,
              imported: importedCookies.length,
              timestamp: Date.now(),
              domain: importedCookies.length > 0 ? importedCookies[0].domain : "example.com"
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

      let cookies: Cookie[];
      try {
        if (importData.encrypted) {
          console.log('Attempting to decrypt encrypted cookie data...');
          cookies = await this.security.decryptCookies(importData, settings);
          console.log('Decryption successful, got', cookies.length, 'cookies');
        } else {
          // Support multiple formats of cookie data
          if (Array.isArray(importData)) {
            // Direct array of cookies
            cookies = importData as Cookie[];
          } else if (importData.cookies && Array.isArray(importData.cookies)) {
            // Format: { cookies: [...] } (used by BytesCookies)
            cookies = importData.cookies as Cookie[];
          } else if (importData.data && Array.isArray(importData.data)) {
            // Format: { data: [...] } (our format)
            cookies = importData.data as Cookie[];
          } else if (importData.url && Array.isArray(importData.cookies)) {
            // Format: { url: "...", cookies: [...] } (another common format)
            cookies = importData.cookies as Cookie[];
          } else {
            console.error('Could not find cookie data in the import file:', importData);
            throw {
              title: 'Invalid Cookie Format',
              message: 'Could not find cookie data in the import file',
              details: 'The file should contain cookies in one of these formats:\n' +
                       '- Array of cookies directly\n' +
                       '- { data: [...cookies] }\n' + 
                       '- { cookies: [...cookies] }\n' + 
                       '- { url: "...", cookies: [...cookies] }'
            };
          }
          
          console.log('Using unencrypted cookie data, got', cookies.length, 'cookies');
        }
      } catch (decryptError) {
        console.error('Decryption error details:', decryptError);
        throw {
          title: 'Processing Failed',
          message: 'Failed to process cookie data',
          details: decryptError instanceof Error ? decryptError.message : 
                   (typeof decryptError === 'object' && decryptError !== null) ? 
                   JSON.stringify(decryptError, null, 2) : 'Unable to decrypt or parse cookie data'
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
          cookies.map(cookie => this.validator.validateCookie(cookie, settings))
        );
      } catch (validationError) {
        throw {
          title: 'Validation Error',
          message: 'Failed to validate cookies',
          details: validationError instanceof Error ? validationError.message : 'Cookie validation process failed'
        };
      }

      const validCookies = cookies.filter((_, index) => 
        validationResults[index].isValid
      );

      if (validCookies.length === 0) {
        throw {
          title: 'No Valid Cookies',
          message: 'None of the cookies passed validation',
          details: 'All cookies were rejected due to validation rules'
        };
      }

      const results = await Promise.all(
        validCookies.map(async cookie => {
          try {
            if (cookie.name.startsWith("__Host-")) {
              return { success: false, cookie, error: "Special cookie with __Host- prefix cannot be imported" };
            }

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
                  reject(new Error("Failed to set cookie"));
                }
              });
            });

            return { success: true, cookie };
          } catch (error) {
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