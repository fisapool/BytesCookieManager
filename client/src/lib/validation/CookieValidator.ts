
import { ValidationResult, Cookie, Settings, ValidationErrorInfo, ValidationWarning } from '../../types';

export class CookieValidator {
  private static readonly REQUIRED_FIELDS = ['domain', 'name', 'value', 'path'];
  private static readonly DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9])*$/;
  private static readonly MAX_COOKIE_SIZE = 4096;
  private static readonly MAX_DOMAIN_LENGTH = 255;
  private static readonly SUSPICIOUS_PATTERNS = [
    /<script>/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /alert\(/i,
    /eval\(/i,
    /document\.cookie/i
  ];

  async validateCookie(cookie: Cookie, settings: Settings): Promise<ValidationResult> {
    const errors: ValidationErrorInfo[] = [];
    const warnings: ValidationWarning[] = [];

    // Perform validation checks
    this.validateRequiredFields(cookie, errors);
    
    if (cookie.domain) {
      this.validateDomain(cookie.domain, errors);
    }
    
    if (cookie.value) {
      this.validateValue(cookie.value, warnings);
      
      // Only perform security checks if enabled
      if (settings.validateSecurity) {
        this.validateNoSuspiciousContent(cookie.value, errors);
      }
    }

    this.validateFormat(cookie, errors);
    this.validateSecurityFlags(cookie, warnings);
    this.validateSize(cookie, warnings);

    // Generate metadata for reporting
    const metadata = this.generateMetadata(cookie);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  private validateRequiredFields(cookie: Cookie, errors: ValidationErrorInfo[]): void {
    for (const field of CookieValidator.REQUIRED_FIELDS) {
      if (!cookie[field as keyof Cookie]) {
        errors.push({
          field,
          code: 'MISSING_REQUIRED_FIELD',
          message: `The ${field} field is required`,
          severity: 'error'
        });
      }
    }
  }

  private validateDomain(domain: string, errors: ValidationErrorInfo[]): void {
    if (domain.length > CookieValidator.MAX_DOMAIN_LENGTH) {
      errors.push({
        field: 'domain',
        code: 'DOMAIN_TOO_LONG',
        message: `Domain exceeds the maximum length of ${CookieValidator.MAX_DOMAIN_LENGTH} characters`,
        severity: 'error'
      });
    }

    if (!CookieValidator.DOMAIN_REGEX.test(domain)) {
      errors.push({
        field: 'domain',
        code: 'INVALID_DOMAIN_FORMAT',
        message: 'Domain format is invalid',
        severity: 'error'
      });
    }
  }

  private validateValue(value: string, warnings: ValidationWarning[]): void {
    if (value.length > 1000) {
      warnings.push({
        field: 'value',
        code: 'LARGE_VALUE',
        message: 'Cookie value is unusually large',
        severity: 'warning'
      });
    }

    if (/[<>'"]/.test(value)) {
      warnings.push({
        field: 'value',
        code: 'SPECIAL_CHARS',
        message: 'Cookie value contains special characters that may need escaping',
        severity: 'warning'
      });
    }
  }

  private validateNoSuspiciousContent(value: string, errors: ValidationErrorInfo[]): void {
    for (const pattern of CookieValidator.SUSPICIOUS_PATTERNS) {
      if (pattern.test(value)) {
        errors.push({
          field: 'value',
          code: 'SUSPICIOUS_CONTENT',
          message: 'Cookie value contains potentially malicious content',
          severity: 'critical'
        });
        break;
      }
    }
  }

  private generateMetadata(cookie: Cookie): any {
    return {
      size: JSON.stringify(cookie).length,
      expires: cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toISOString() : 'session',
      isSecure: cookie.secure,
      isHttpOnly: cookie.httpOnly
    };
  }

  private validateFormat(cookie: Cookie, errors: ValidationErrorInfo[]): void {
    if (cookie.name.startsWith('__Secure-') && !cookie.secure) {
      errors.push({
        field: 'secure',
        code: 'SECURE_PREFIX_VIOLATION',
        message: 'Cookies with __Secure- prefix must have the secure flag',
        severity: 'error'
      });
    }

    if (cookie.name.startsWith('__Host-') && (!cookie.secure || cookie.domain || cookie.path !== '/')) {
      errors.push({
        field: 'secure',
        code: 'HOST_PREFIX_VIOLATION',
        message: 'Cookies with __Host- prefix must have the secure flag, no domain specified, and path set to /',
        severity: 'error'
      });
    }
  }

  private validateSecurityFlags(cookie: Cookie, warnings: ValidationWarning[]): void {
    if (!cookie.secure) {
      warnings.push({
        field: 'secure',
        code: 'NOT_SECURE',
        message: 'Cookie is not marked as secure and will be sent over HTTP',
        severity: 'warning'
      });
    }

    if (!cookie.httpOnly) {
      warnings.push({
        field: 'httpOnly',
        code: 'NOT_HTTP_ONLY',
        message: 'Cookie is accessible via JavaScript (not httpOnly)',
        severity: 'warning'
      });
    }

    if (!cookie.sameSite || cookie.sameSite === 'none' || cookie.sameSite === 'no_restriction') {
      warnings.push({
        field: 'sameSite',
        code: 'WEAK_SAME_SITE',
        message: 'Cookie has weak or no SameSite restrictions',
        severity: 'warning'
      });
    }
  }

  private validateSize(cookie: Cookie, warnings: ValidationWarning[]): void {
    const size = JSON.stringify(cookie).length;
    if (size > CookieValidator.MAX_COOKIE_SIZE / 2) {
      warnings.push({
        field: 'size',
        code: 'LARGE_COOKIE',
        message: `Cookie size (${size} bytes) is approaching the maximum limit`,
        severity: 'warning'
      });
    }
  }
}
