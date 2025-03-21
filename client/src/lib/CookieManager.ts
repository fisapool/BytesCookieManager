import { CookieEncryption } from "./CookieEncryption";
import { CookieValidator } from "./CookieValidator";
import { ErrorManager } from "./ErrorManager";
import { getChromeAPI } from "./chromeMock";
import { 
  Cookie, 
  ExportResult, 
  ImportResult, 
  EncryptedData,
  Settings
} from "../types";

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
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = customName || `cookies-${domain}-${timestamp}`;
    
    // Add encryption key specific to this extension
    const encryptionKey = 'FISABYTES-SECURE-KEY-2024';
    
    try {
      const chrome = getChromeAPI();
      
      // Get cookies using a Promise wrapper around the Chrome API
      const getCookiesPromise = new Promise<Cookie[]>((resolve) => {
        chrome.cookies.getAll({ domain }, (cookies: any[]) => {
          // Convert to our internal format
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

      // Validate cookies
      const validationResults = await Promise.all(
        cookieData.map(cookie => this.validator.validateCookie(cookie, settings))
      );

      // Filter out invalid cookies
      const validCookies = cookieData.filter((_, index) => 
        validationResults[index].isValid
      );

      // Encrypt valid cookies if encryption is enabled
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
      await this.errorManager.handleError(error, "export");
      throw error;
    }
  }

  async importCookies(encryptedData: EncryptedData, settings: Settings): Promise<ImportResult> {
    try {
      const chrome = getChromeAPI();
      
      // Decrypt cookies if they are encrypted
      let cookies: Cookie[];
      if (encryptedData.encrypted) {
        cookies = await this.security.decryptCookies(encryptedData, settings);
      } else {
        cookies = encryptedData.data as Cookie[];
      }

      // Validate each cookie
      const validationResults = await Promise.all(
        cookies.map(cookie => this.validator.validateCookie(cookie, settings))
      );

      // Filter valid cookies
      const validCookies = cookies.filter((_, index) => 
        validationResults[index].isValid
      );

      // Set cookies using Chrome API
      const results = await Promise.all(
        validCookies.map(async cookie => {
          try {
            // Skip special cookies with __Host- prefix for security
            if (cookie.name.startsWith("__Host-")) {
              return { success: false, cookie, error: "Special cookie with __Host- prefix cannot be imported" };
            }
            
            // Convert to Chrome cookie format
            const chromeCookie = {
              url: `http${cookie.secure ? "s" : ""}://${cookie.domain}${cookie.path}`,
              name: cookie.name,
              value: cookie.value,
              domain: cookie.domain,
              path: cookie.path,
              secure: cookie.secure,
              httpOnly: cookie.httpOnly,
              sameSite: cookie.sameSite as any, // Use 'any' for development
              expirationDate: cookie.expirationDate,
              storeId: "0"
            };
            
            // Use a Promise wrapper around the Chrome API
            const setCookiePromise = new Promise<void>((resolve, reject) => {
              chrome.cookies.set(chromeCookie, (cookie: any) => {
                if (cookie) {
                  resolve();
                } else {
                  reject(new Error("Failed to set cookie"));
                }
              });
            });
            
            await setCookiePromise;
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

      return {
        success: successCount > 0,
        metadata: {
          total: cookies.length,
          valid: validCookies.length,
          imported: successCount,
          timestamp: Date.now(),
          domain: domain
        }
      };
    } catch (error) {
      await this.errorManager.handleError(error, "import");
      throw error;
    }
  }
}
