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
        exportData = {
          data: validCookies,
          encrypted: false,
          metadata: {
            timestamp: Date.now(),
            domain: domain
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
      if (formattedError.severity === 'critical') {
        console.error('Critical export error:', formattedError);
      }
      // Ensure we're throwing a properly formatted error object
      throw typeof error === 'object' && error !== null ? error : {
        title: 'Export Failed',
        message: String(error),
        details: 'An unexpected error occurred during cookie export'
      };
    }
  }

  async importCookies(encryptedData: EncryptedData, settings: Settings): Promise<ImportResult> {
    try {
      const chrome = getChromeAPI();
      
      if (!chrome?.cookies?.set) {
        throw {
          title: 'Browser API Unavailable',
          message: 'Cookie API is not accessible',
          details: 'This extension requires access to the Chrome cookie API.'
        };
      }

      let cookies: Cookie[];
      try {
        if (encryptedData.encrypted) {
          cookies = await this.security.decryptCookies(encryptedData, settings);
        } else {
          if (!Array.isArray(encryptedData.data)) {
            throw {
              title: 'Invalid Cookie Data',
              message: 'The imported data is not in the correct format',
              details: 'The cookie data must be an array of valid cookie objects'
            };
          }
          cookies = encryptedData.data as Cookie[];
        }
      } catch (decryptError) {
        throw {
          title: 'Decryption Failed',
          message: 'Failed to process cookie data',
          details: decryptError instanceof Error ? decryptError.message : 'Unable to decrypt or parse cookie data'
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
      const formattedError = await this.errorManager.handleError(error, "import");
      if (formattedError.severity === 'critical') {
        console.error('Critical import error:', formattedError);
      }
      // Ensure we're throwing a properly formatted error object
      throw typeof error === 'object' && error !== null ? error : {
        title: 'Import Failed',
        message: String(error),
        details: 'An unexpected error occurred during cookie import'
      };
    }
  }
}