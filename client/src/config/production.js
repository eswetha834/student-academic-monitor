// Production configuration
export const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'https://your-backend-url.herokuapp.com',
    timeout: 10000,
  },
  app: {
    name: 'EDUMONITOR',
    version: '1.0.0',
    environment: 'production',
  },
  features: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
  },
  database: {
    url: process.env.REACT_APP_MONGO_URL,
  }
};

// Export for use in components
export default config;
