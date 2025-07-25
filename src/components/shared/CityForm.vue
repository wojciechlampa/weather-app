<template>
  <div class="city-form">
    <form @submit.prevent="handleSubmit" class="city-form__form">
      <div class="city-form__input-group">
        <input
          v-model="cityName"
          type="text"
          placeholder="Enter city name"
          class="city-form__input"
          :class="{ 'city-form__input--error': hasError }"
        />
        <Button
          type="submit"
          text="Add City"
          variant="secondary"
          :disabled="!cityName.trim()"
        />
      </div>
      <div v-if="hasError" class="city-form__error">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from './Button.vue';

interface CityFormProps {
  cities: string[];
}

const { cities } = defineProps<CityFormProps>();
const emit = defineEmits<{
  (e: 'addCity', cityName: string): void;
}>();

const cityName = ref('');
const hasError = ref(false);
const errorMessage = ref('');

const handleSubmit = () => {
  const trimmedName = cityName.value.trim();
  
  if (!trimmedName) {
    showError('Please enter a city name');
    return;
  }
  
  if (cities.includes(trimmedName)) {
    showError('City already exists');
    return;
  }
  
  emit('addCity', trimmedName);
  cityName.value = '';
  clearError();
};

const showError = (message: string) => {
  errorMessage.value = message;
  hasError.value = true;
  setTimeout(clearError, 3000);
};

const clearError = () => {
  hasError.value = false;
  errorMessage.value = '';
};
</script>

<style lang="scss" scoped>
.city-form {
  @apply w-full max-w-md mx-auto mb-6;
  
  &__form {
    @apply space-y-2;
  }
  
  &__input-group {
    @apply flex gap-2;
  }
  
  &__input {
    @apply flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
    
    &--error {
      @apply border-red-500 focus:ring-red-500;
    }
    
    &::placeholder {
      @apply text-gray-400;
    }
  }
  
  &__error {
    @apply text-red-500 text-sm text-center;
  }
}
</style>