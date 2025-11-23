/**
 * Production-safe logger utility
 * In production, only errors are logged
 * In development, all logs are shown
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (level === 'error') return true; // Always log errors
    if (isDevelopment) return true; // Log everything in development
    return false; // Only errors in production
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: unknown[]): void {
    // Always log errors
    console.error('[ERROR]', ...args);
  }
}

export const logger = new Logger();

