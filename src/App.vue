<template>
  <div class="weather-app">
    <div class="weather-app__container">
      <AppHeader />

      <main class="weather-app__main">
        <CityForm :cities="cities" @add-city="addCity" />
        
        <div v-if="weatherData && weatherData.length > 0" class="weather-app__content">
          <WeatherList 
            :weather-items="weatherData" 
            :forecast-data="forecastData" 
            @remove-city="removeCity"
          />
        </div>
        
        <div v-else-if="isLoading" class="weather-app__loading-state">
          <LoadingSpinner />
        </div>
        
        <div v-else class="weather-app__empty-state">No weather data available</div>
      </main>

      <div class="weather-app__button-wrapper">
        <Button 
          text="Refresh Weather"
          loading-text="Refreshing..."
          :is-loading="isLoading"
          :icon="IconRefresh"
          :loading-icon="IconLoader"
          variant="primary"
          @click="refresh" 
        />
      </div>

      <AppFooter :last-updated="lastUpdated" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import WeatherList from './components/shared/WeatherList.vue';
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import Button from './components/shared/Button.vue';
import CityForm from './components/shared/CityForm.vue';
import LoadingSpinner from './components/shared/LoadingSpinner.vue';
import { IconRefresh, IconLoader } from '@tabler/icons-vue';
import { getCurrentWeather, getForecast } from './services/weatherService';
import type { WeatherData, CityForecast } from './types';

const cities = ref(['Gliwice', 'Hamburg']);
const weatherData = ref<WeatherData[]>([]);
const forecastData = ref<Record<string, CityForecast>>({});
const isLoading = ref(false);
const lastUpdated = ref('');

const initializeWeatherData = () => {
  weatherData.value = cities.value.map(city => ({
    cityName: city,
    temperature: 0,
    condition: '',
    icon: '',
    humidity: 0,
    windSpeed: 0,
    windDirection: '',
    isLoading: true,
    error: null,
  }));

  forecastData.value = Object.fromEntries(
    cities.value.map(city => [
      city,
      {
        cityName: city,
        forecast: [],
        isLoading: true,
        error: null,
      }
    ])
  );
};

const fetchWeatherForCity = async (cityName: string, index: number) => {
  try {
    const weatherResponse = await getCurrentWeather(cityName);
    const forecastResponse = await getForecast(cityName, 5);
    
    weatherData.value[index] = {
      cityName: weatherResponse.location.name,
      temperature: weatherResponse.current.temp_c,
      condition: weatherResponse.current.condition.text,
      icon: weatherResponse.current.condition.icon,
      humidity: weatherResponse.current.humidity,
      windSpeed: weatherResponse.current.wind_kph,
      windDirection: weatherResponse.current.wind_dir,
      isLoading: false,
      error: null,
    };

    const actualCityName = weatherResponse.location.name;
    forecastData.value[actualCityName] = {
      cityName: actualCityName,
      forecast: forecastResponse.forecast.forecastday.map(day => ({
        date: day.date,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        chanceOfRain: day.day.daily_chance_of_rain,
      })),
      isLoading: false,
      error: null,
    };
  } catch (error) {
    weatherData.value[index] = {
      ...weatherData.value[index],
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to fetch weather',
    };
    
    const actualCityName = weatherData.value[index].cityName || cityName;
    if (forecastData.value[actualCityName]) {
      forecastData.value[actualCityName].isLoading = false;
      forecastData.value[actualCityName].error = error instanceof Error ? error.message : 'Failed to fetch forecast';
    }
  }
};

const fetchAllWeatherData = async () => {
  isLoading.value = true;
  initializeWeatherData();
  
  const promises = cities.value.map((city, index) => fetchWeatherForCity(city, index));
  await Promise.allSettled(promises);
  
  lastUpdated.value = new Date().toLocaleString();
  isLoading.value = false;
};

const refresh = () => {
  fetchAllWeatherData();
};

const addCity = (cityName: string) => {
  if (cityName && !cities.value.includes(cityName)) {
    cities.value.push(cityName);
  }
};

const removeCity = (cityName: string) => {
  let index = cities.value.indexOf(cityName);
  
  if (index === -1) {
    const weatherIndex = weatherData.value.findIndex(item => item.cityName === cityName);
    if (weatherIndex > -1 && weatherIndex < cities.value.length) {
      index = weatherIndex;
    }
  }
  
  if (index > -1) {
    cities.value.splice(index, 1);
  }
};

watch(cities, () => {
  fetchAllWeatherData();
}, { deep: true });

fetchAllWeatherData();
</script>

<style lang="scss" scoped>
.weather-app {
  @apply min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600;

  &__container {
    @apply container mx-auto px-4 py-8;
  }

  &__main {
    @apply space-y-6;
  }

  &__loading-state {
    @apply text-center py-8;
  }

  &__empty-state {
    @apply text-center py-8 text-white;
  }

  &__button-wrapper {
    @apply text-center mt-8;
  }

  &__forecast-section {
    @apply mt-8 space-y-6;
  }
}
</style>
