<template>
  <div class="loading-spinner">
    <IconLoader class="loading-spinner__icon" />
  </div>
</template>

<script setup lang="ts">
import { IconLoader } from '@tabler/icons-vue';
</script>

<style lang="scss" scoped>
.loading-spinner {
  @apply flex justify-center items-center p-8;

  &__icon {
    @apply animate-spin h-12 w-12 text-blue-500;
  }
}
</style>