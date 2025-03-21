export class LogoDetector {
  private readonly DEFAULT_COLORS = [
    "#4F46E5", // primary-500
    "#8b5cf6", // secondary-500 
    "#f59e0b", // warning-500
    "#10b981", // success-500
    "#ef4444", // error-500
    "#6b7280", // gray-500
    "#1d4ed8", // primary-700
    "#2563eb"  // primary-600
  ];

  /**
   * Attempts to get a logo for a domain using various methods
   */
  async getLogoForDomain(domain: string, fallbackUrl?: string): Promise<{ url?: string, initial: string, color: string }> {
    try {
      const initial = this.getDomainInitial(domain);
      const color = this.getRandomColor(domain);
      
      // For development environment, skip external URL fetching to avoid CORS issues
      // and just return the initial with color
      if (import.meta.env.DEV) {
        return {
          initial,
          color
        };
      }
      
      // In a real extension environment, we would try these methods
      // But for now, we'll just comment them out to avoid console errors
      
      /*
      // 1. Try fallback URL if provided (e.g., from tab favicon)
      if (fallbackUrl && await this.isValidImageUrl(fallbackUrl)) {
        return { 
          url: fallbackUrl, 
          initial,
          color
        };
      }
      
      // 2. Try standard favicon paths
      const faviconUrl = `https://${domain}/favicon.ico`;
      if (await this.isValidImageUrl(faviconUrl)) {
        return { 
          url: faviconUrl, 
          initial,
          color
        };
      }
      
      // 3. Try Google's favicon service
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      if (await this.isValidImageUrl(googleFaviconUrl)) {
        return { 
          url: googleFaviconUrl, 
          initial,
          color
        };
      }
      */
      
      // 4. Fallback to initial letter with color
      return {
        initial,
        color
      };
    } catch (error) {
      console.error("Error detecting logo:", error);
      // Final fallback
      return {
        initial: this.getDomainInitial(domain),
        color: this.DEFAULT_COLORS[0]
      };
    }
  }
  
  /**
   * Gets the initial letter from a domain for the fallback
   */
  private getDomainInitial(domain: string): string {
    // Extract domain without subdomain for initial
    const parts = domain.split('.');
    let mainDomain;
    
    if (parts.length >= 2) {
      mainDomain = parts[parts.length - 2];
    } else {
      mainDomain = parts[0];
    }
    
    return mainDomain.charAt(0).toUpperCase();
  }
  
  /**
   * Gets a consistent color based on the domain name
   */
  private getRandomColor(domain: string): string {
    // Use domain name to generate consistent color
    const hash = Array.from(domain).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
      0
    );
    const index = Math.abs(hash) % this.DEFAULT_COLORS.length;
    return this.DEFAULT_COLORS[index];
  }
  
  /**
   * Checks if a URL is a valid image
   */
  private async isValidImageUrl(url: string): Promise<boolean> {
    try {
      // Use fetch to check if URL is valid and is an image
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && (contentType?.startsWith('image/') || false);
    } catch (error) {
      return false;
    }
  }
}
