// Tab Type
export type Tab = "cookies" | "security" | "help";

// Cookie Type
export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: "no_restriction" | "lax" | "strict" | "unspecified" | "none";
  expirationDate?: number;
}

// Website Information
export interface Website {
  url: string;
  name: string;
  favicon: string;
  cookies: Cookie[];
  status: "available" | "no_cookies" | "error";
}

// Security Settings
export interface Settings {
  encryptionEnabled: boolean;
  encryptionMethod: "aes256" | "aes128";
  passwordEnabled: boolean;
  validateSecurity: boolean;
  detectXSS: boolean;
  enforceSameOrigin: boolean;
}

// Status Message
export interface StatusMessage {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

// Error Information
export interface ErrorInfo {
  title: string;
  message: string;
  details?: string;
  timestamp?: number;
  operation?: OperationType;
}

export type OperationType = "export" | "import" | "validation" | "encryption" | "decryption" | "general";

// Validation Related Types
export interface ValidationErrorInfo {
  field: string;
  code: string;
  message: string;
  severity: "error" | "critical";
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  severity: "warning";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorInfo[];
  warnings: ValidationWarning[];
  metadata: any;
}

// Cookie Export/Import Types
export interface EncryptedData {
  data: any;
  encrypted: boolean;
  metadata?: {
    algorithm?: string;
    timestamp?: number;
    domain?: string;
    version?: string;
  };
}

export interface ExportResult {
  success: boolean;
  data: EncryptedData;
  metadata: {
    total: number;
    valid: number;
    timestamp: number;
    domain?: string;
  };
}

export interface ImportResult {
  success: boolean;
  metadata: {
    total: number;
    valid: number;
    imported: number;
    timestamp: number;
    domain?: string;
  };
}

// Custom Errors
export class ValidationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ValidationError";
    if (cause) this.cause = cause;
  }
}

export class SecurityError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SecurityError";
  }
}
