import { Cookie, EncryptedData, Settings, SecurityError } from "../types";

export class CookieEncryption {
  private readonly encoder: TextEncoder;
  private readonly decoder: TextDecoder;
  
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  /**
   * Encrypts a collection of cookies
   */
  async encryptCookies(cookies: Cookie[], settings: Settings): Promise<EncryptedData> {
    try {
      const serializedData = JSON.stringify(cookies);
      
      if (settings.encryptionEnabled) {
        // Generate a random encryption key
        const key = await this.generateEncryptionKey(settings.encryptionMethod);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Encrypt the data
        const encryptedBuffer = await this.encryptData(
          serializedData,
          key,
          iv,
          settings.encryptionMethod
        );
        
        // Convert binary data to base64 for storage
        const encryptedBase64 = this.arrayBufferToBase64(encryptedBuffer);
        const ivBase64 = this.arrayBufferToBase64(iv);
        
        // Export the key for storage
        const exportedKey = await this.exportCryptoKey(key);
        const keyBase64 = this.arrayBufferToBase64(exportedKey);
        
        return {
          data: {
            ciphertext: encryptedBase64,
            iv: ivBase64,
            key: keyBase64
          },
          encrypted: true,
          metadata: {
            algorithm: settings.encryptionMethod,
            timestamp: Date.now(),
            version: "2.0"
          }
        };
      } else {
        // Return unencrypted data
        return {
          data: cookies,
          encrypted: false,
          metadata: {
            timestamp: Date.now(),
            version: "2.0"
          }
        };
      }
    } catch (error) {
      throw new SecurityError(
        "Encryption failed",
        { cause: error instanceof Error ? error : new Error(String(error)) }
      );
    }
  }

  /**
   * Decrypts a collection of cookies
   */
  async decryptCookies(encryptedData: EncryptedData, settings: Settings): Promise<Cookie[]> {
    try {
      if (!encryptedData.encrypted) {
        // Data is not encrypted, cast and return
        return encryptedData.data as Cookie[];
      }
      
      // Extract encryption components
      const { ciphertext, iv, key } = encryptedData.data as {
        ciphertext: string;
        iv: string;
        key: string;
      };
      
      // Convert from base64
      const encryptedBuffer = this.base64ToArrayBuffer(ciphertext);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      const keyBuffer = this.base64ToArrayBuffer(key);
      
      // Import the key
      const cryptoKey = await this.importCryptoKey(
        keyBuffer,
        encryptedData.metadata?.algorithm || settings.encryptionMethod
      );
      
      // Decrypt the data
      const decryptedBuffer = await this.decryptData(
        encryptedBuffer,
        cryptoKey,
        ivBuffer
      );
      
      // Parse the JSON data
      const decryptedString = this.decoder.decode(decryptedBuffer);
      return JSON.parse(decryptedString);
    } catch (error) {
      throw new SecurityError(
        "Decryption failed",
        { cause: error instanceof Error ? error : new Error(String(error)) }
      );
    }
  }

  /**
   * Generates a cryptographic key for encryption
   */
  private async generateEncryptionKey(method: string): Promise<CryptoKey> {
    // Determine key length based on encryption method
    const keyLength = method === "aes256" ? 256 : 128;
    
    return crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: keyLength
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts data with the provided key
   */
  private async encryptData(
    data: string,
    key: CryptoKey,
    iv: Uint8Array,
    method: string
  ): Promise<ArrayBuffer> {
    const encodedData = this.encoder.encode(data);
    
    return crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128 // Standard tag length for AES-GCM
      },
      key,
      encodedData
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
        name: "AES-GCM",
        iv: iv,
        tagLength: 128
      },
      key,
      encryptedData
    );
  }

  /**
   * Exports a CryptoKey to raw format
   */
  private async exportCryptoKey(key: CryptoKey): Promise<ArrayBuffer> {
    return crypto.subtle.exportKey("raw", key);
  }

  /**
   * Imports a raw key buffer to a CryptoKey
   */
  private async importCryptoKey(
    keyBuffer: ArrayBuffer,
    method: string
  ): Promise<CryptoKey> {
    const keyLength = method === "aes256" ? 256 : 128;
    
    return crypto.subtle.importKey(
      "raw",
      keyBuffer,
      {
        name: "AES-GCM",
        length: keyLength
      },
      false, // not extractable
      ["decrypt"]
    );
  }

  /**
   * Converts an ArrayBuffer to a Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts a Base64 string to an ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
