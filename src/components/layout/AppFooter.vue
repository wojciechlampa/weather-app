<template>
  <footer class="weather-app__footer">
    <p class="weather-app__footer-text">
      Made by
      <a href="mailto:w.lampa@designcrown.co.uk" class="weather-app__footer-link">Wojciech Lampa</a>
    </p>
    <p class="weather-app__footer-updated">Last updated: {{ lastUpdated }}</p>
  </footer>
</template>

<script setup lang="ts">
interface Props {
  lastUpdated: string;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.weather-app {
  &__footer {
    @apply text-center mt-12 text-blue-100 text-sm;

    &-link {
      @apply underline hover:text-white;
    }

    &-updated {
      @apply mt-1;
    }
  }
}
</style>