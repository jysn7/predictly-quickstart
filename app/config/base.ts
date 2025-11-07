export const baseConfig = {
  apiKey: process.env.BASE_API_KEY || '',
  projectId: process.env.BASE_PROJECT_ID || '',
  apiUrl: process.env.BASE_API_URL || 'https://api.base.app',
  environment: process.env.NODE_ENV || 'development',
};

export const isValidConfig = () => {
  return baseConfig.apiKey && baseConfig.projectId;
};