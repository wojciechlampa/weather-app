<template>
  <div class="weather-list">
    <div v-for="weatherItem in weatherItems" :key="weatherItem.cityName" class="weather-list__item">
      <WeatherCard
        :city-name="weatherItem.cityName"
        :temperature="weatherItem.temperature"
        :condition="weatherItem.condition"
        :icon="weatherItem.icon"
        :humidity="weatherItem.humidity"
        :wind-speed="weatherItem.windSpeed"
        :wind-direction="weatherItem.windDirection"
        :is-loading="weatherItem.isLoading"
        :error="weatherItem.error"
        @remove="handleRemove"
      />
      
      <WeatherForecast
        :forecast="forecastData[weatherItem.cityName]?.forecast || []"
        :is-loading="forecastData[weatherItem.cityName]?.isLoading || false"
        :error="forecastData[weatherItem.cityName]?.error || null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import WeatherCard from './WeatherCard.vue';
import WeatherForecast from './WeatherForecast.vue';
import type { WeatherListProps } from '../../types';

const { weatherItems, forecastData } = defineProps<WeatherListProps>();

const emit = defineEmits<{
  (e: 'removeCity', cityName: string): void;
}>();

const handleRemove = (cityName: string) => {
  emit('removeCity', cityName);
};
</script>

<style lang="scss" scoped>
.weather-list {
  @apply flex flex-col justify-center items-center gap-6;

  &__item {
    @apply flex flex-col lg:flex-row gap-4 w-full max-w-6xl;
    
    @screen lg {
      .weather-card {
        @apply flex-shrink-0 w-80;
      }
      
      .weather-forecast {
        @apply flex-1;
      }
    }
  }
}
</style>