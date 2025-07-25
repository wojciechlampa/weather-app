<template>
  <div :class="[
    'weather-card',
    {
      'weather-card--loading': isLoading,
      'weather-card--error': error
    }
  ]">
    <div v-if="isLoading" class="weather-card__loading-state">
      <LoadingSpinner />
    </div>

    <div v-else class="weather-card__content">
      <div class="weather-card__header">
        <div class="weather-card__header-content">
          <h3 class="weather-card__title">{{ cityName }}</h3>
          <Button 
            :icon="IconX"
            variant="ghost"
            icon-only
            @click="$emit('remove', cityName)"
          />
        </div>
      </div>

      <div v-if="error" class="weather-card__error-content">
        <div class="weather-card__error-icon">
          <IconAlertCircle class="weather-card__icon" />
        </div>
        <p class="weather-card__error-message">{{ error }}</p>
      </div>

      <div v-else class="weather-card__weather-content">
        <div class="weather-card__temperature-display">
          <img :src="weatherIcon" :alt="condition" class="weather-card__weather-icon" />
          <div class="weather-card__temperature-info">
            <div class="weather-card__temperature">{{ Math.round(temperature) }}°C</div>
            <div class="weather-card__condition">{{ condition }}</div>
          </div>
        </div>

        <div class="weather-card__metrics">
          <div class="weather-card__metric weather-card__metric--humidity">
            <div class="weather-card__metric-label">
              <IconCloud class="weather-card__metric-icon" />
              <span>Humidity</span>
            </div>
            <div class="weather-card__metric-value">{{ humidity }}%</div>
          </div>

          <div class="weather-card__metric weather-card__metric--wind">
            <div class="weather-card__metric-label">
              <IconWind class="weather-card__metric-icon" />
              <span>Wind</span>
            </div>
            <div class="weather-card__metric-value">{{ Math.round(windSpeed) }} km/h {{ windDirection }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';
import Button from './Button.vue';
import { IconAlertCircle, IconCloud, IconWind, IconX } from '@tabler/icons-vue';

const props = defineProps<{
  cityName: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  isLoading: boolean;
  error: string | null;
}>();

defineEmits<{
  (e: 'remove', cityName: string): void;
}>();

const weatherIcon = computed(() => {
  if (!props.icon) return '';
  return props.icon.startsWith('http') ? props.icon : `https:${props.icon}`;
});
</script>

<style lang="scss" scoped>
.weather-card {
  @apply bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-auto;

  &--loading {
    @apply opacity-90;
  }

  &--error {
    @apply border-2 border-red-200 bg-red-50;

    .weather-card__title {
      @apply text-red-800 text-lg font-semibold;
    }
  }

  &__loading-state {
    @apply text-center;
  }

  &__loading-text {
    @apply text-gray-600 mt-2;
  }

  &__header {
    @apply mb-4;
  }

  &__header-content {
    @apply flex items-center justify-between mb-2;
  }

  &__title {
    @apply text-xl font-bold text-gray-800 flex-1;
  }

  &__error-content {
    @apply text-center;
  }

  &__error-icon {
    @apply text-red-500 mb-4;
  }

  &__error-message {
    @apply text-red-600 text-sm;
  }

  &__weather-content {
    @apply text-center;
  }

  &__icon {
    @apply w-12 h-12 mx-auto;
  }

  &__temperature-display {
    @apply flex items-center justify-center mb-2;
  }

  &__weather-icon {
    @apply w-16 h-16 mr-2;
  }

  &__temperature-info {
    @apply text-center;
  }

  &__temperature {
    @apply text-3xl font-bold text-gray-800;
  }

  &__condition {
    @apply text-sm text-gray-600;
  }

  &__metrics {
    @apply grid grid-cols-2 gap-4 text-sm;
  }

  &__metric {
    @apply rounded-lg p-3;

    &--humidity {
      @apply bg-blue-50;

      .weather-card__metric-icon {
        @apply text-blue-500;
      }
    }

    &--wind {
      @apply bg-green-50;

      .weather-card__metric-icon {
        @apply text-green-500;
      }
    }

    &-label {
      @apply flex items-center mb-1;

      span {
        @apply text-gray-600;
      }
    }

    &-icon {
      @apply w-4 h-4 mr-2;
    }

    &-value {
      @apply font-semibold text-gray-800;
    }
  }
}
</style>