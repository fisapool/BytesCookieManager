
import { ErrorInfo, OperationType } from '../../types';

export class ErrorManager {
  private errors: ErrorInfo[] = [];
  private readonly MAX_ERROR_HISTORY = 10;

  /**
   * Handles an error and logs it appropriately
   */
  async handleError(error: unknown, operation: OperationType): Promise<ErrorInfo> {
    const formattedError = this.formatError(error, operation);
    console.error(`Error in ${operation}:`, formattedError);
    
    // Add to error history
    this.addToErrorHistory(formattedError);
    
    return formattedError;
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
    if (error instanceof Error) {
      return {
        title: `Error in ${operation}`,
        message: error.message || 'An unknown error occurred',
        details: error.stack,
        timestamp: Date.now(),
        operation
      };
    } 
    
    // Handle plain objects or strings
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, any>;
      return {
        title: errorObj.title || `Error in ${operation}`,
        message: errorObj.message || 'An unknown error occurred',
        details: errorObj.details || JSON.stringify(error, null, 2),
        timestamp: Date.now(),
        operation
      };
    }
    
    // Handle primitive values
    return {
      title: `Error in ${operation}`,
      message: String(error),
      timestamp: Date.now(),
      operation
    };
  }

  /**
   * Adds an error to the error history, maintaining maximum size
   */
  private addToErrorHistory(error: ErrorInfo): void {
    this.errors.unshift(error);
    
    if (this.errors.length > this.MAX_ERROR_HISTORY) {
      this.errors = this.errors.slice(0, this.MAX_ERROR_HISTORY);
    }
  }
}
