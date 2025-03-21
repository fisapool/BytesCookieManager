import { ErrorInfo, OperationType } from "../types";

export class ErrorManager {
  private errors: ErrorInfo[] = [];
  private readonly MAX_ERROR_HISTORY = 10;
  
  /**
   * Handles an error and logs it appropriately
   */
  async handleError(error: unknown, operation: OperationType): Promise<ErrorInfo> {
    const errorInfo = this.formatError(error, operation);
    
    // Add to error history
    this.addToErrorHistory(errorInfo);
    
    // Log to console for debugging
    console.error(`[FISABytes] Error during ${operation}:`, errorInfo);
    
    return errorInfo;
  }
  
  /**
   * Gets error history
   */
  getErrorHistory(): ErrorInfo[] {
    return [...this.errors];
  }
  
  /**
   * Clears error history
   */
  clearErrorHistory(): void {
    this.errors = [];
  }
  
  /**
   * Formats an error into a standardized error info object
   */
  private formatError(error: unknown, operation: OperationType): ErrorInfo {
    let title = `Error during ${operation}`;
    let message = "An unexpected error occurred";
    let details = "";
    
    if (error instanceof Error) {
      // Standard JS Error object
      title = error.name;
      message = error.message;
      details = error.stack || "";
      
      // Extract more details from specific error types
      if ("code" in error && typeof error.code === "string") {
        details = `Error Code: ${error.code}\n${details}`;
      }
      
      if ("cause" in error && error.cause) {
        details = `Caused by: ${error.cause instanceof Error ? error.cause.message : String(error.cause)}\n${details}`;
      }
    } else if (typeof error === "string") {
      // String error
      message = error;
    } else if (error && typeof error === "object") {
      // Custom error object with properties
      console.log('Formatting object error:', error);
      
      // Check for title/message/details properties
      if ("title" in error && typeof error.title === "string") {
        title = error.title;
      }
      
      if ("message" in error && typeof error.message === "string") {
        message = error.message;
      } else if ("msg" in error && typeof error.msg === "string") {
        message = error.msg;
      }
      
      if ("details" in error && typeof error.details === "string") {
        details = error.details;
      } else if ("detail" in error && typeof error.detail === "string") {
        details = error.detail;
      } else if ("stack" in error && typeof error.stack === "string") {
        details = error.stack;
      } else {
        // If no details property, stringify the whole object
        try {
          details = JSON.stringify(error, null, 2);
        } catch (e) {
          details = "Error could not be serialized: " + String(e);
        }
      }
    } else {
      // For any other type, convert to string
      message = String(error);
    }
    
    return {
      title,
      message,
      details,
      timestamp: Date.now(),
      operation
    };
  }
  
  /**
   * Adds an error to the error history, maintaining maximum size
   */
  private addToErrorHistory(error: ErrorInfo): void {
    this.errors.unshift(error);
    
    // Trim to max size
    if (this.errors.length > this.MAX_ERROR_HISTORY) {
      this.errors = this.errors.slice(0, this.MAX_ERROR_HISTORY);
    }
  }
}
