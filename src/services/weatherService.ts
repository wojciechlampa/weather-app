import type { WeatherResponse, WeatherError, ForecastResponse } from '../types';
import { getApiConfig, getFeatureFlags } from './config';

const { key: API_KEY, baseUrl: BASE_URL, timeout: API_TIMEOUT } = getApiConfig();
const { caching } = getFeatureFlags();

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const getCachedData = <T>(key: string): T | null => {
  if (!caching) return null;
  
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
};

const setCachedData = <T>(key: string, data: T): void => {
  if (caching) {
    cache.set(key, { data, timestamp: Date.now() });
  }
};

export async function getCurrentWeather(city: string): Promise<WeatherResponse> {
  if (!API_KEY) {
    throw new Error('Weather API key is not configured');
  }

  const cacheKey = `weather:${city}`;
  const cached = getCachedData<WeatherResponse>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData: WeatherError = await response.json();
      throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch weather data');
  }
}

export async function getForecast(city: string, days: number = 5): Promise<ForecastResponse> {
  if (!API_KEY) {
    throw new Error('Weather API key is not configured');
  }

  const cacheKey = `forecast:${city}:${days}`;
  const cached = getCachedData<ForecastResponse>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData: WeatherError = await response.json();
      throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch forecast data: ${error.message}`);
    }
    throw new Error('Failed to fetch forecast data: Unknown error');
  }
}