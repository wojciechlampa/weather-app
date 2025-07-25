import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('createConfig', () => {
    it('should create config with default values when no env vars are set', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_WEATHER_API_KEY', '');
      vi.stubEnv('VITE_WEATHER_API_BASE_URL', '');
      vi.stubEnv('VITE_REFRESH_INTERVAL', '');
      vi.stubEnv('VITE_THEME', '');
      vi.stubEnv('VITE_AUTO_REFRESH', '');
      vi.stubEnv('VITE_ENABLE_CACHE', '');
      vi.stubEnv('VITE_ENABLE_ANIMATIONS', '');

      const { config } = await import('../../../src/services/config');

      expect(config.api.key).toBe('');
      expect(config.api.baseUrl).toBe('https://api.weatherapi.com/v1');
      expect(config.api.timeout).toBe(5000);
      expect(config.api.retryAttempts).toBe(3);
      expect(config.ui.refreshInterval).toBe(300000);
      expect(config.ui.animationDuration).toBe(300);
      expect(config.ui.theme).toBe('auto');
      expect(config.features.autoRefresh).toBe(true);
      expect(config.features.caching).toBe(true);
      expect(config.features.animations).toBe(true);
    });

    it('should create config with custom env values', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_WEATHER_API_KEY', 'custom-api-key');
      vi.stubEnv('VITE_WEATHER_API_BASE_URL', 'https://custom-api.com/v1');
      vi.stubEnv('VITE_REFRESH_INTERVAL', '60000');
      vi.stubEnv('VITE_THEME', 'dark');
      vi.stubEnv('VITE_AUTO_REFRESH', 'false');
      vi.stubEnv('VITE_ENABLE_CACHE', 'false');
      vi.stubEnv('VITE_ENABLE_ANIMATIONS', 'false');

      const { config } = await import('../../../src/services/config');

      expect(config.api.key).toBe('custom-api-key');
      expect(config.api.baseUrl).toBe('https://custom-api.com/v1');
      expect(config.ui.refreshInterval).toBe(60000);
      expect(config.ui.theme).toBe('dark');
      expect(config.features.autoRefresh).toBe(false);
      expect(config.features.caching).toBe(false);
      expect(config.features.animations).toBe(false);
    });

    it('should use development values when in dev mode', async () => {
      vi.stubEnv('DEV', true);
      vi.stubEnv('VITE_WEATHER_API_KEY', 'dev-api-key');

      const { config } = await import('../../../src/services/config');

      expect(config.api.key).toBe('dev-api-key');
      expect(config.api.timeout).toBe(10000);
      expect(config.api.retryAttempts).toBe(5);
    });

    it('should handle invalid refresh interval', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_REFRESH_INTERVAL', 'invalid-number');

      const { config } = await import('../../../src/services/config');

      expect(config.ui.refreshInterval).toBe(300000);
    });

    it('should handle invalid theme value', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_THEME', 'invalid-theme');

      const { config } = await import('../../../src/services/config');

      expect(config.ui.theme).toBe('invalid-theme');
    });
  });

  describe('getApiConfig', () => {
    it('should return api configuration', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_WEATHER_API_KEY', 'test-key');
      vi.stubEnv('VITE_WEATHER_API_BASE_URL', '');

      const { getApiConfig } = await import('../../../src/services/config');
      const apiConfig = getApiConfig();

      expect(apiConfig.key).toBe('test-key');
      expect(apiConfig.baseUrl).toBe('https://api.weatherapi.com/v1');
      expect(apiConfig.timeout).toBe(5000);
      expect(apiConfig.retryAttempts).toBe(3);
    });
  });

  describe('getUIConfig', () => {
    it('should return UI configuration', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_REFRESH_INTERVAL', '120000');
      vi.stubEnv('VITE_THEME', 'light');

      const { getUIConfig } = await import('../../../src/services/config');
      const uiConfig = getUIConfig();

      expect(uiConfig).toEqual({
        refreshInterval: 120000,
        animationDuration: 300,
        theme: 'light',
      });
    });
  });

  describe('getFeatureFlags', () => {
    it('should return feature flags', async () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_AUTO_REFRESH', 'false');
      vi.stubEnv('VITE_ENABLE_CACHE', 'true');
      vi.stubEnv('VITE_ENABLE_ANIMATIONS', 'false');

      const { getFeatureFlags } = await import('../../../src/services/config');
      const features = getFeatureFlags();

      expect(features).toEqual({
        autoRefresh: false,
        caching: true,
        animations: false,
      });
    });

    it('should default feature flags to true when not explicitly set to false', async () => {
      vi.stubEnv('DEV', false);

      const { getFeatureFlags } = await import('../../../src/services/config');
      const features = getFeatureFlags();

      expect(features.autoRefresh).toBe(true);
      expect(features.caching).toBe(true);
      expect(features.animations).toBe(true);
    });
  });
});