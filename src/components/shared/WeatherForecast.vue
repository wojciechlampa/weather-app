<template>
  <div class="weather-forecast">
    <div v-if="isLoading" class="weather-forecast__loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="weather-forecast__error">
      <IconAlertCircle class="weather-forecast__error-icon" />
      <p class="weather-forecast__error-message">{{ error }}</p>
    </div>

    <div v-else class="weather-forecast__grid">
      <div
        v-for="item in forecast"
        :key="item.date"
        class="weather-forecast__item"
      >
        <div class="weather-forecast__date">
          {{ formatDate(item.date) }}
        </div>
        <img
          :src="item.icon"
          :alt="item.condition"
          class="weather-forecast__icon"
        />
        <div class="weather-forecast__temps">
          <span class="weather-forecast__temp-max">{{ Math.round(item.maxTemp) }}°</span>
          <span class="weather-forecast__temp-min">{{ Math.round(item.minTemp) }}°</span>
        </div>
        <div class="weather-forecast__condition">{{ item.condition }}</div>
        <div class="weather-forecast__rain">
          <IconDroplet class="weather-forecast__rain-icon" />
          {{ item.chanceOfRain }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertCircle, IconDroplet } from '@tabler/icons-vue';
import LoadingSpinner from './LoadingSpinner.vue';
import type { ForecastItem } from '../../types';

interface Props {
  forecast: ForecastItem[];
  isLoading: boolean;
  error: string | null;
}

defineProps<Props>();

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
};
</script>

<style lang="scss" scoped>
.weather-forecast {
  @apply bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/20;
  @apply w-full max-w-4xl mx-auto;

  &__title {
    @apply text-2xl font-bold text-white mb-6 text-center;
  }

  &__loading {
    @apply flex flex-col items-center justify-center py-8;

    &-text {
      @apply text-blue-100 mt-4;
    }
  }

  &__error {
    @apply flex flex-col items-center justify-center py-8 text-red-300;

    &-icon {
      @apply w-8 h-8 mb-2;
    }

    &-message {
      @apply text-center;
    }
  }

  &__grid {
    @apply grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4;
  }

  &__item {
    @apply bg-white/5 rounded-lg p-4 text-center border border-white/10;
    @apply hover:bg-white/10 transition-colors duration-200;
  }

  &__date {
    @apply text-white font-semibold mb-2 text-sm;
  }

  &__icon {
    @apply w-12 h-12 mx-auto mb-2;
  }

  &__temps {
    @apply flex justify-center gap-2 mb-2;

    .weather-forecast__temp-max {
      @apply text-white font-bold text-lg;
    }

    .weather-forecast__temp-min {
      @apply text-blue-200 text-lg;
    }
  }

  &__condition {
    @apply text-blue-100 text-xs mb-2 leading-tight;
  }

  &__rain {
    @apply flex items-center justify-center gap-1 text-blue-200 text-xs;

    &-icon {
      @apply w-3 h-3;
    }
  }
}
</style>