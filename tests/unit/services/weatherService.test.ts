import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentWeather, getForecast } from '../../../src/services/weatherService';
import type { WeatherResponse, ForecastResponse } from '../../../src/types';

vi.mock('../../../src/services/config', () => ({
  getApiConfig: () => ({
    key: 'test-api-key',
    baseUrl: 'https://api.weatherapi.com/v1',
    timeout: 5000,
  }),
  getFeatureFlags: () => ({
    caching: false,
  }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('weatherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentWeather', () => {
    const mockWeatherResponse: WeatherResponse = {
      location: {
        name: 'London',
        region: 'City of London, Greater London',
        country: 'United Kingdom',
        lat: 51.52,
        lon: -0.11,
        tz_id: 'Europe/London',
        localtime_epoch: 1609459200,
        localtime: '2021-01-01 12:00',
      },
      current: {
        last_updated_epoch: 1609459200,
        last_updated: '2021-01-01 12:00',
        temp_c: 10,
        temp_f: 50,
        is_day: 1,
        condition: {
          text: 'Partly cloudy',
          icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          code: 1003,
        },
        wind_mph: 6.9,
        wind_kph: 11.2,
        wind_degree: 230,
        wind_dir: 'SW',
        pressure_mb: 1012,
        pressure_in: 29.88,
        precip_mm: 0,
        precip_in: 0,
        humidity: 82,
        cloud: 75,
        feelslike_c: 9,
        feelslike_f: 48,
        vis_km: 10,
        vis_miles: 6,
        uv: 2,
        gust_mph: 10.1,
        gust_kph: 16.2,
      },
    };

    it('should fetch weather data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse,
      });

      const result = await getCurrentWeather('London');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.weatherapi.com/v1/current.json?key=test-api-key&q=London&aqi=no',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
      expect(result).toEqual(mockWeatherResponse);
    });

    it('should handle URL encoding for city names with spaces', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse,
      });

      await getCurrentWeather('New York');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.weatherapi.com/v1/current.json?key=test-api-key&q=New%20York&aqi=no',
        expect.any(Object)
      );
    });

    it('should throw error when API key is missing', async () => {
      vi.doMock('../../../src/services/config', () => ({
        getApiConfig: () => ({
          key: '',
          baseUrl: 'https://api.weatherapi.com/v1',
          timeout: 5000,
        }),
        getFeatureFlags: () => ({
          caching: true,
        }),
      }));

      vi.resetModules();
      const { getCurrentWeather: getCurrentWeatherWithEmptyKey } = await import('../../../src/services/weatherService');
      
      await expect(getCurrentWeatherWithEmptyKey('London')).rejects.toThrow('Weather API key is not configured');
      
      vi.doMock('../../../src/services/config', () => ({
        getApiConfig: () => ({
          key: 'test-api-key',
          baseUrl: 'https://api.weatherapi.com/v1',
          timeout: 5000,
        }),
        getFeatureFlags: () => ({
          caching: true,
        }),
      }));
    });

    it('should handle API error responses', async () => {
      const errorResponse = {
        error: {
          code: 1006,
          message: 'No matching location found.',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      await expect(getCurrentWeather('InvalidCity')).rejects.toThrow(
        'No matching location found.'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getCurrentWeather('London')).rejects.toThrow('Network error');
    });

    it('should handle AbortController timeout', async () => {
      const mockAbortController = {
        signal: { aborted: false },
        abort: vi.fn()
      };
      
      global.AbortController = vi.fn(() => mockAbortController);
      
      mockFetch.mockImplementationOnce((url, options) => {
        expect(options.signal).toBeDefined();
        return Promise.resolve({
          ok: true,
          json: async () => mockWeatherResponse,
        });
      });

      const result = await getCurrentWeather('London');
      expect(result).toEqual(mockWeatherResponse);
    });

    it('should return cached data when caching is enabled', async () => {
      vi.doMock('../../../src/services/config', () => ({
        getApiConfig: () => ({
          key: 'test-api-key',
          baseUrl: 'https://api.weatherapi.com/v1',
          timeout: 5000,
        }),
        getFeatureFlags: () => ({
          caching: true,
        }),
      }));
      
      vi.resetModules();
      const { getCurrentWeather: getCurrentWeatherWithCache } = await import('../../../src/services/weatherService');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse,
      });

      const result1 = await getCurrentWeatherWithCache('London');
      expect(result1).toEqual(mockWeatherResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const result2 = await getCurrentWeatherWithCache('London');
      expect(result2).toEqual(mockWeatherResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getForecast', () => {
    const mockForecastResponse: ForecastResponse = {
      location: {
        name: 'London',
        region: 'City of London, Greater London',
        country: 'United Kingdom',
        lat: 51.52,
        lon: -0.11,
        tz_id: 'Europe/London',
        localtime_epoch: 1609459200,
        localtime: '2021-01-01 12:00',
      },
      current: {
        last_updated_epoch: 1609459200,
        last_updated: '2021-01-01 12:00',
        temp_c: 10,
        temp_f: 50,
        is_day: 1,
        condition: {
          text: 'Partly cloudy',
          icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          code: 1003,
        },
        wind_mph: 6.9,
        wind_kph: 11.2,
        wind_degree: 230,
        wind_dir: 'SW',
        pressure_mb: 1012,
        pressure_in: 29.88,
        precip_mm: 0,
        precip_in: 0,
        humidity: 82,
        cloud: 75,
        feelslike_c: 9,
        feelslike_f: 48,
        vis_km: 10,
        vis_miles: 6,
        uv: 2,
        gust_mph: 10.1,
        gust_kph: 16.2,
      },
      forecast: {
        forecastday: [
          {
            date: '2021-01-01',
            date_epoch: 1609459200,
            day: {
              maxtemp_c: 15,
              maxtemp_f: 59,
              mintemp_c: 5,
              mintemp_f: 41,
              avgtemp_c: 10,
              avgtemp_f: 50,
              maxwind_mph: 8.9,
              maxwind_kph: 14.4,
              totalprecip_mm: 0,
              totalprecip_in: 0,
              totalsnow_cm: 0,
              avgvis_km: 10,
              avgvis_miles: 6,
              avghumidity: 80,
              daily_will_it_rain: 0,
              daily_chance_of_rain: 10,
              daily_will_it_snow: 0,
              daily_chance_of_snow: 0,
              condition: {
                text: 'Partly cloudy',
                icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
                code: 1003,
              },
              uv: 2,
            },
          },
        ],
      },
    };

    it('should fetch forecast data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastResponse,
      });

      const result = await getForecast('London', 3);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.weatherapi.com/v1/forecast.json?key=test-api-key&q=London&days=3&aqi=no&alerts=no',
        expect.objectContaining({
          signal: expect.any(Object),
        })
      );
      expect(result).toEqual(mockForecastResponse);
    });

    it('should use default days parameter when not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastResponse,
      });

      await getForecast('London');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.weatherapi.com/v1/forecast.json?key=test-api-key&q=London&days=5&aqi=no&alerts=no',
        expect.any(Object)
      );
    });

    it('should handle forecast API errors', async () => {
      const errorResponse = {
        error: {
          code: 1006,
          message: 'No matching location found.',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      await expect(getForecast('InvalidCity')).rejects.toThrow(
        'Failed to fetch forecast data: No matching location found.'
      );
    });

    it('should return cached forecast data when caching is enabled', async () => {
      vi.doMock('../../../src/services/config', () => ({
        getApiConfig: () => ({
          key: 'test-api-key',
          baseUrl: 'https://api.weatherapi.com/v1',
          timeout: 5000,
        }),
        getFeatureFlags: () => ({
          caching: true,
        }),
      }));
      
      vi.resetModules();
      const { getForecast: getForecastWithCache } = await import('../../../src/services/weatherService');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastResponse,
      });

      const result1 = await getForecastWithCache('London', 3);
      expect(result1).toEqual(mockForecastResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const result2 = await getForecastWithCache('London', 3);
      expect(result2).toEqual(mockForecastResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not use cache for different parameters when caching is enabled', async () => {
      vi.doMock('../../../src/services/config', () => ({
        getApiConfig: () => ({
          key: 'test-api-key',
          baseUrl: 'https://api.weatherapi.com/v1',
          timeout: 5000,
        }),
        getFeatureFlags: () => ({
          caching: true,
        }),
      }));
      
      vi.resetModules();
      const { getForecast: getForecastWithCache } = await import('../../../src/services/weatherService');

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockForecastResponse,
      });

      await getForecastWithCache('London', 3);
      await getForecastWithCache('London', 5);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});