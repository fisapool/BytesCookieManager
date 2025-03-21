
import { EncryptedData, Cookie, Settings } from '../../types';

export class CookieEncryption {
  private readonly encoder: TextEncoder;
  private readonly decoder: TextDecoder;
  private readonly extensionKey = 'FISABYTES-SECURE-KEY-2024';

  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  /**
   * Encrypts a collection of cookies
   */
  async encryptCookies(cookies: Cookie[], settings: Settings): Promise<EncryptedData> {
    try {
      // In development mode or if encryption is disabled, return unencrypted data
      if (!settings.encryptionEnabled) {
        // Return data in BytesCookies format
        return {
          data: {
            url: cookies.length > 0 ? `https://${cookies[0].domain}/` : 'https://example.com/',
            cookies: cookies
          },
          encrypted: false,
          metadata: {
            timestamp: Date.now(),
            version: '1.0'
          }
        };
      }

      // For actual encryption in production
      // Wrap the cookies in BytesCookies format before encrypting
      const cookieData = {
        url: cookies.length > 0 ? `https://${cookies[0].domain}/` : 'https://example.com/',
        cookies: cookies
      };
      
      const dataString = JSON.stringify(cookieData);
      const dataBuffer = this.encoder.encode(dataString);
      
      // Generate encryption key based on method
      const key = await this.generateEncryptionKey(settings.encryptionMethod);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(16));
      
      // Encrypt the data
      const encryptedBuffer = await this.encryptData(dataBuffer, key, iv);
      
      // Convert to base64 for storage
      const encryptedBase64 = this.arrayBufferToBase64(encryptedBuffer);
      const ivBase64 = this.arrayBufferToBase64(iv);
      
      return {
        data: {
          cipher: encryptedBase64,
          iv: ivBase64
        },
        encrypted: true,
        metadata: {
          algorithm: settings.encryptionMethod,
          timestamp: Date.now(),
          version: '1.0'
        }
      };
    } catch (error) {
      console.error('Encryption error:', error);
      // Fallback to unencrypted in case of error
      return {
        data: {
          url: cookies.length > 0 ? `https://${cookies[0].domain}/` : 'https://example.com/',
          cookies: cookies
        },
        encrypted: false,
        metadata: {
          timestamp: Date.now(),
          version: '1.0'
        }
      };
    }
  }

  /**
   * Decrypts a collection of cookies
   */
  async decryptCookies(encryptedData: EncryptedData, settings: Settings): Promise<Cookie[]> {
    try {
      // If data is not encrypted, handle different possible formats
      if (!encryptedData.encrypted) {
        if (Array.isArray(encryptedData.data)) {
          // Direct array of cookies
          return encryptedData.data as Cookie[];
        } else if (typeof encryptedData.data === 'object' && encryptedData.data !== null) {
          // Check for nested formats
          if (encryptedData.data.cookies && Array.isArray(encryptedData.data.cookies)) {
            // Format: { cookies: [...] } (BytesCookies format)
            return encryptedData.data.cookies as Cookie[];
          } else if (encryptedData.data.url && encryptedData.data.cookies && Array.isArray(encryptedData.data.cookies)) {
            // Format: { url: "...", cookies: [...] }
            return encryptedData.data.cookies as Cookie[];
          }
        }
        
        console.error('Unknown unencrypted data format:', encryptedData.data);
        throw new Error('Data is not encrypted but has invalid format');
      }

      const { cipher, iv } = encryptedData.data as { cipher: string, iv: string };
      
      // Convert from base64
      const encryptedBuffer = this.base64ToArrayBuffer(cipher);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      
      // Generate key based on the algorithm used for encryption
      const algorithm = encryptedData.metadata?.algorithm || settings.encryptionMethod;
      const key = await this.generateEncryptionKey(algorithm);
      
      // Decrypt the data
      const decryptedBuffer = await this.decryptData(encryptedBuffer, key, ivBuffer);
      
      // Convert back to string and parse as JSON
      const decryptedString = this.decoder.decode(decryptedBuffer);
      const parsedData = JSON.parse(decryptedString);
      
      // Handle different possible formats in the decrypted data
      if (Array.isArray(parsedData)) {
        // Direct array of cookies
        return parsedData;
      } else if (typeof parsedData === 'object' && parsedData !== null) {
        // Check for nested formats
        if (parsedData.cookies && Array.isArray(parsedData.cookies)) {
          // Format: { cookies: [...] } (BytesCookies format)
          return parsedData.cookies;
        } else if (parsedData.url && parsedData.cookies && Array.isArray(parsedData.cookies)) {
          // Format: { url: "...", cookies: [...] }
          return parsedData.cookies;
        }
      }
      
      console.error('Unknown decrypted data format:', parsedData);
      throw new Error('Decrypted data has an invalid format');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error(`Failed to decrypt cookie data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates a cryptographic key for encryption
   */
  private async generateEncryptionKey(method: string): Promise<CryptoKey> {
    try {
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        this.encoder.encode(this.extensionKey),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: this.encoder.encode('FISABYTES-SALT-2024'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: 'AES-GCM',
          length: method === 'aes256' ? 256 : 128
        },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Key generation error:', error);
      // Fallback for development or testing environments
      return crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: method === 'aes256' ? 256 : 128
        },
        true,
        ['encrypt', 'decrypt']
      );
    }
  }

  /**
   * Encrypts data with the provided key
   */
  private async encryptData(
    data: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<ArrayBuffer> {
    return crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
  }

  /**
   * Decrypts data with the provided key
   */
  private async decryptData(
    encryptedData: ArrayBuffer,
    key: CryptoKey,
    iv: ArrayBuffer
  ): Promise<ArrayBuffer> {
    return crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedData
    );
  }

  /**
   * Converts an ArrayBuffer to a Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts a Base64 string to an ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
