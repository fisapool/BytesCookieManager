
export class ErrorManager {
  async handleError(error: Error, context: string): Promise<void> {
    console.error(`Error in ${context}:`, error);
  }
}
