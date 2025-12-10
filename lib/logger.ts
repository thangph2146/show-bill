const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[Logger]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[Logger]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('[Logger]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error('[Logger]', ...args);
    }
  },
  request: (method: string, url: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`[Logger] ${method} ${url}`);
      if (data) {
        console.log('[Logger] Request Payload:', JSON.stringify(data, null, 2));
      }
    }
  },
};

