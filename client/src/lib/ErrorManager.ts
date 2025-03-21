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
      message = error;
    } else {
      details = JSON.stringify(error, null, 2);
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
