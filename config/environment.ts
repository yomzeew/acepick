interface EnvironmentConfig {
  baseUrl: string;
  enableLogging: boolean;
  enableAnalytics: boolean;
  socketPath: string;
  apiTimeout: number;
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    baseUrl: 'https://www.acepickdev.com',
    enableLogging: true,
    enableAnalytics: false,
    socketPath: '/chat',
    apiTimeout: 30000,
  },
  staging: {
    baseUrl: 'https://staging.acepickdev.com',
    enableLogging: true,
    enableAnalytics: true,
    socketPath: '/chat',
    apiTimeout: 30000,
  },
  production: {
    baseUrl: 'https://www.acepickdev.com',
    enableLogging: false,
    enableAnalytics: true,
    socketPath: '/chat',
    apiTimeout: 30000,
  },
};

const currentEnv = process.env.NODE_ENV || 'development';
export const config: EnvironmentConfig = environments[currentEnv] || environments.development;

// Helper functions
export const isDevelopment = () => currentEnv === 'development';
export const isProduction = () => currentEnv === 'production';
export const isStaging = () => currentEnv === 'staging';

// Logging utility
export const logger = {
  log: (...args: any[]) => {
    if (config.enableLogging) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (config.enableLogging) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (config.enableLogging) {
      console.error(...args);
    }
  },
};
