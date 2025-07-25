interface AppConfig {
  api: {
    key: string;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  ui: {
    refreshInterval: number;
    animationDuration: number;
    theme: 'light' | 'dark' | 'auto';
  };
  features: {
    autoRefresh: boolean;
    caching: boolean;
    animations: boolean;
  };
}

const createConfig = (): AppConfig => {
  const isDevelopment = import.meta.env.DEV;
  
  return {
    api: {
      key: import.meta.env.VITE_WEATHER_API_KEY || '',
      baseUrl: import.meta.env.VITE_WEATHER_API_BASE_URL || 'https://api.weatherapi.com/v1',
      timeout: isDevelopment ? 10000 : 5000,
      retryAttempts: isDevelopment ? 5 : 3,
    },
    ui: {
      refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL as string) || 300000,
      animationDuration: 300,
      theme: (import.meta.env.VITE_THEME as 'light' | 'dark' | 'auto') || 'auto',
    },
    features: {
      autoRefresh: import.meta.env.VITE_AUTO_REFRESH !== 'false',
      caching: import.meta.env.VITE_ENABLE_CACHE !== 'false',
      animations: import.meta.env.VITE_ENABLE_ANIMATIONS !== 'false',
    },
  };
};

export const config = createConfig();

export const getApiConfig = () => config.api;
export const getUIConfig = () => config.ui;
export const getFeatureFlags = () => config.features;