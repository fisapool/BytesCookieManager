import { 
  Cookie, 
  ValidationResult, 
  ValidationErrorInfo,
  ValidationWarning,
  Settings,
  ValidationError
} from "../types";

export class CookieValidator {
  private static readonly REQUIRED_FIELDS = ["domain", "name", "value", "path"];
  private static readonly DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9])*$/;
  private static readonly MAX_COOKIE_SIZE = 4096;
  private static readonly MAX_DOMAIN_LENGTH = 255;
  private static readonly SUSPICIOUS_PATTERNS = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onclick/i,
    /onerror/i,
    /onload/i,
    /%3Cscript/i // URL encoded
  ];

  async validateCookie(cookie: Cookie, settings: Settings): Promise<ValidationResult> {
    const errors: ValidationErrorInfo[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Basic validation
      this.validateRequiredFields(cookie, errors);
      this.validateDomain(cookie.domain, errors);
      this.validateValue(cookie.value, warnings);

      // Enhanced security checks
      if (settings.validateSecurity) {
        this.validateSecurityFlags(cookie, warnings);
      }
      
      if (settings.detectXSS) {
        this.validateNoSuspiciousContent(cookie.value, errors);
      }
      
      // Size validation
      this.validateSize(cookie, warnings);
      
      // Format validation
      this.validateFormat(cookie, errors);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: this.generateMetadata(cookie)
      };
    } catch (error) {
      throw new ValidationError("Validation failed", error);
    }
  }

  private validateRequiredFields(cookie: Cookie, errors: ValidationErrorInfo[]): void {
    CookieValidator.REQUIRED_FIELDS.forEach(field => {
      if (!cookie[field as keyof Cookie]) {
        errors.push({
          field,
          code: "MISSING_REQUIRED_FIELD",
          message: `Missing required field: ${field}`,
          severity: "error"
        });
      }
    });
  }

  private validateDomain(domain: string, errors: ValidationErrorInfo[]): void {
    if (!CookieValidator.DOMAIN_REGEX.test(domain)) {
      errors.push({
        field: "domain",
        code: "INVALID_DOMAIN_FORMAT",
        message: "Invalid domain format",
        severity: "error"
      });
    }
    
    if (domain.length > CookieValidator.MAX_DOMAIN_LENGTH) {
      errors.push({
        field: "domain",
        code: "DOMAIN_TOO_LONG",
        message: `Domain exceeds maximum length of ${CookieValidator.MAX_DOMAIN_LENGTH} characters`,
        severity: "error"
      });
    }
  }

  private validateValue(value: string, warnings: ValidationWarning[]): void {
    if (value.length > CookieValidator.MAX_COOKIE_SIZE) {
      warnings.push({
        field: "value",
        code: "VALUE_TOO_LONG",
        message: `Cookie value exceeds recommended length of ${CookieValidator.MAX_COOKIE_SIZE} characters`,
        severity: "warning"
      });
    }
  }

  private validateNoSuspiciousContent(value: string, errors: ValidationErrorInfo[]): void {
    // Check for suspicious patterns that might indicate XSS attempts
    if (CookieValidator.SUSPICIOUS_PATTERNS.some(pattern => pattern.test(value))) {
      errors.push({
        field: "value",
        code: "SUSPICIOUS_CONTENT",
        message: "Cookie value contains potentially unsafe content",
        severity: "error"
      });
    }
  }

  private generateMetadata(cookie: Cookie): any {
    return {
      created: Date.now(),
      size: JSON.stringify(cookie).length,
      hasSecureFlag: cookie.secure || false,
      hasHttpOnlyFlag: cookie.httpOnly || false,
      sameSite: cookie.sameSite || "unspecified",
      expires: cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toISOString() : "session"
    };
  }

  private validateFormat(cookie: Cookie, errors: ValidationErrorInfo[]): void {
    // Check path format
    if (cookie.path && !cookie.path.startsWith("/")) {
      errors.push({
        field: "path",
        code: "INVALID_PATH_FORMAT",
        message: "Path must start with '/'",
        severity: "error"
      });
    }
    
    // Ensure cookie name doesn't contain invalid characters
    if (/[^\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]/.test(cookie.name)) {
      errors.push({
        field: "name",
        code: "INVALID_NAME_CHARS",
        message: "Cookie name contains invalid characters",
        severity: "error"
      });
    }
    
    // Validate special prefix requirements
    if (cookie.name.startsWith("__Host-") && (!cookie.secure || cookie.domain !== "")) {
      errors.push({
        field: "name",
        code: "HOST_PREFIX_REQUIREMENTS",
        message: "Cookies with __Host- prefix must be secure and have no domain specified",
        severity: "error"
      });
    }
    
    if (cookie.name.startsWith("__Secure-") && !cookie.secure) {
      errors.push({
        field: "name",
        code: "SECURE_PREFIX_REQUIREMENTS",
        message: "Cookies with __Secure- prefix must have the secure flag",
        severity: "error"
      });
    }
  }

  private validateSecurityFlags(cookie: Cookie, warnings: ValidationWarning[]): void {
    // Domain has HTTPS and cookie is not secure
    if (cookie.domain.includes("https://") && !cookie.secure) {
      warnings.push({
        field: "secure",
        code: "MISSING_SECURE_FLAG",
        message: "Secure flag is recommended for cookies on HTTPS domains",
        severity: "warning"
      });
    }

    // Recommend httpOnly for sensitive cookies
    if (!cookie.httpOnly) {
      warnings.push({
        field: "httpOnly",
        code: "MISSING_HTTPONLY_FLAG",
        message: "HttpOnly flag is recommended for security",
        severity: "warning"
      });
    }

    // Check SameSite attribute
    if (!cookie.sameSite || cookie.sameSite === "none") {
      warnings.push({
        field: "sameSite",
        code: "WEAK_SAME_SITE",
        message: "Consider using Strict or Lax SameSite policy for better security",
        severity: "warning"
      });
    }
  }

  private validateSize(cookie: Cookie, warnings: ValidationWarning[]): void {
    const size = JSON.stringify(cookie).length;
    if (size > CookieValidator.MAX_COOKIE_SIZE) {
      warnings.push({
        field: "size",
        code: "COOKIE_TOO_LARGE",
        message: `Cookie size (${size} bytes) exceeds recommended limit of ${CookieValidator.MAX_COOKIE_SIZE} bytes`,
        severity: "warning"
      });
    }
  }
}
