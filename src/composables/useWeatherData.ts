import { ref, reactive, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue';
import { getCurrentWeather, getForecast } from '../services/weatherService';
import { getApiConfig, getUIConfig } from '../services/config';
import type { WeatherData, CityForecast, WeatherResponse, ForecastResponse } from '../types';

interface UseWeatherDataOptions {
  cities: readonly string[];
  refreshInterval?: number;
  retryAttempts?: number;
}

interface UseWeatherDataReturn {
  weatherData: Ref<WeatherData[]>;
  forecastData: Record<string, CityForecast>;
  isLoading: Ref<boolean>;
  lastUpdated: Ref<string>;
  hasErrors: ComputedRef<boolean>;
  allLoaded: ComputedRef<boolean>;
  refresh: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

export function useWeatherData(options: UseWeatherDataOptions): UseWeatherDataReturn {
  const apiConfig = getApiConfig();
  const uiConfig = getUIConfig();
  
  const { 
    cities, 
    refreshInterval = uiConfig.refreshInterval, 
    retryAttempts = apiConfig.retryAttempts 
  } = options;
  
  const isLoading = ref(false);
  const lastUpdated = ref('');
  
  const weatherData = ref<WeatherData[]>(
    cities.map(city => ({
      cityName: city,
      temperature: 0,
      condition: '',
      icon: '',
      humidity: 0,
      windSpeed: 0,
      windDirection: '',
      isLoading: true,
      error: null,
    }))
  );

  const forecastData = reactive<Record<string, CityForecast>>(
    Object.fromEntries(
      cities.map(city => [
        city,
        {
          cityName: city,
          forecast: [],
          isLoading: true,
          error: null,
        }
      ])
    )
  );

  const hasErrors = computed(() => 
    weatherData.value.some(item => item.error) || 
    Object.values(forecastData).some(item => item.error)
  );

  const allLoaded = computed(() => 
    !weatherData.value.some(item => item.isLoading) && 
    !Object.values(forecastData).some(item => item.isLoading)
  );

  let refreshTimer: NodeJS.Timeout | null = null;

  const updateWeatherItem = (weatherItem: WeatherData, response: WeatherResponse) => {
    Object.assign(weatherItem, {
      cityName: response.location.name,
      temperature: response.current.temp_c,
      condition: response.current.condition.text,
      icon: response.current.condition.icon,
      humidity: response.current.humidity,
      windSpeed: response.current.wind_kph,
      windDirection: response.current.wind_dir,
      isLoading: false,
      error: null,
    });
  };

  const updateForecastData = (city: string, response: ForecastResponse) => {
    const cityForecast = forecastData[city];
    if (cityForecast) {
      cityForecast.forecast = response.forecast.forecastday.map(day => ({
        date: day.date,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        chanceOfRain: day.day.daily_chance_of_rain,
      }));
      cityForecast.isLoading = false;
      cityForecast.error = null;
    }
  };

  const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retryAttempts) throw error;
      
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, attempt + 1);
    }
  };

  const fetchWeatherData = async (showLoading = true) => {
    if (showLoading) {
      isLoading.value = true;
      weatherData.value.forEach(item => {
        item.isLoading = true;
        item.error = null;
      });
      Object.values(forecastData).forEach(item => {
        item.isLoading = true;
        item.error = null;
      });
    }

    const weatherPromises = cities.map(async (city, index) => {
      const weatherItem = weatherData.value[index];
      
      try {
        const result = await retryWithBackoff(() => getCurrentWeather(city));
        updateWeatherItem(weatherItem, result);
      } catch (error) {
        weatherItem.isLoading = false;
        weatherItem.error = error instanceof Error ? error.message : 'Failed to fetch weather';
      }
    });

    const forecastPromises = cities.map(async (city) => {
      try {
        const result = await retryWithBackoff(() => getForecast(city, 5));
        updateForecastData(city, result);
      } catch (error) {
        const cityForecast = forecastData[city];
        if (cityForecast) {
          cityForecast.isLoading = false;
          cityForecast.error = error instanceof Error ? error.message : 'Failed to fetch forecast';
        }
      }
    });

    await Promise.allSettled([...weatherPromises, ...forecastPromises]);
    
    lastUpdated.value = new Date().toLocaleString();
    isLoading.value = false;
  };

  const startAutoRefresh = () => {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => fetchWeatherData(false), refreshInterval);
  };

  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  const refresh = () => fetchWeatherData(true);

  onMounted(() => {
    fetchWeatherData();
    startAutoRefresh();
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    weatherData,
    forecastData,
    isLoading,
    lastUpdated,
    hasErrors,
    allLoaded,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
  };
}