// app/lib/error-handler.ts

export class AppError extends Error {
    constructor(message: string, public statusCode: number = 500) {
      super(message);
      this.name = 'AppError';
    }
  }
  
  export function handleError(error: unknown): AppError {
    console.error('An error occurred:', error);
    
    if (error instanceof AppError) {
      return error;
    }
    
    return new AppError('An unexpected error occurred');
  }