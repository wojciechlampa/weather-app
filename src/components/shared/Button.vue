<template>
  <button
    @click="$emit('click')"
    :disabled="isLoading || disabled"
    :type="type"
    :class="[
      'button',
      `button--${variant}`,
      {
        'button--loading': isLoading,
        'button--icon-only': iconOnly
      }
    ]"
  >
    <span v-if="isLoading" class="button__loading-content">
      <component :is="loadingIcon" class="button__loading-icon" />
      {{ loadingText }}
    </span>
    <span v-else class="button__content">
      <component v-if="icon" :is="icon" class="button__icon" :class="{ 'button__icon--only': iconOnly }" />
      <span v-if="!iconOnly">{{ text }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  text?: string;
  loadingText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
  icon?: Component;
  loadingIcon?: Component;
  iconOnly?: boolean;
}

withDefaults(defineProps<Props>(), {
  text: '',
  loadingText: 'Loading...',
  isLoading: false,
  disabled: false,
  variant: 'primary',
  type: 'button',
  iconOnly: false,
});

defineEmits<{
  click: [];
}>();
</script>

<style lang="scss" scoped>
.button {
  @apply font-semibold py-2 px-6 rounded-lg transition-colors duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;

  &--primary {
    @apply bg-blue-500 text-white hover:bg-blue-600;
    @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  }

  &--secondary {
    @apply bg-white text-blue-600 border border-blue-500 hover:bg-blue-50;
    @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  }

  &--ghost {
    @apply bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100;
    @apply focus:outline-none focus:ring-2 focus:ring-gray-300;
  }

  &--loading {
    @apply pointer-events-none;
  }

  &--icon-only {
    @apply p-2 w-auto h-auto;
  }

  &__content {
    @apply flex items-center justify-center;
  }

  &__loading-content {
    @apply flex items-center justify-center;
  }

  &__icon {
    @apply w-5 h-5 mr-2;

    &--only {
      @apply mr-0;
    }
  }

  &__loading-icon {
    @apply animate-spin w-5 h-5 mr-2;
  }
}
</style>