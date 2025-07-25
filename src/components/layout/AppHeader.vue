<template>
  <header class="weather-app__header">
    <h1 class="weather-app__title">Weather app</h1>
    <p class="weather-app__subtitle">Current weather in Gliwice and Hamburg</p>
  </header>
</template>

<style lang="scss" scoped>
.weather-app {
  &__header {
    @apply text-center mb-8;
  }

  &__title {
    @apply text-4xl font-bold text-white mb-2;
  }

  &__subtitle {
    @apply text-blue-100;
  }
}
</style>