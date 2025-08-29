export class Logger {
  private context: string;
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  constructor(context: string) {
    this.context = context;
  }

  static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    Logger.logLevel = level;
  }

  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level as keyof typeof levels] >= levels[Logger.logLevel];
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] ${level.toUpperCase()} [${this.context}] ${message}`;
    
    if (data !== undefined) {
      return `${baseMessage} ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`;
    }
    
    return baseMessage;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      const errorData = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error;
      
      console.error(this.formatMessage('error', message, errorData));
    }
  }
}