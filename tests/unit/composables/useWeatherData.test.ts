import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useWeatherData } from '../../../src/composables/useWeatherData';

vi.mock('../../../src/services/weatherService', () => ({
  getCurrentWeather: vi.fn(),
  getForecast: vi.fn(),
}));

const { getCurrentWeather: mockGetCurrentWeather, getForecast: mockGetForecast } = vi.mocked(
  await import('../../../src/services/weatherService')
);

vi.mock('../../../src/services/config', () => ({
  getApiConfig: () => ({
    retryAttempts: 3,
  }),
  getUIConfig: () => ({
    refreshInterval: 300000,
    animationDuration: 300,
    theme: 'auto',
  }),
}));

const createTestComponent = (options: any) => {
  return defineComponent({
    setup() {
      const result = useWeatherData(options);
      return result;
    },
    template: '<div></div>'
  });
};

describe('useWeatherData', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('initialization', () => {
    it('should initialize with correct default state', async () => {
      const cities = ['London', 'Paris'];
      const TestComponent = createTestComponent({ cities });
      const wrapper = mount(TestComponent);

      expect(wrapper.vm.weatherData).toHaveLength(2);
      expect(wrapper.vm.weatherData[0]).toEqual({
        cityName: 'London',
        temperature: 0,
        condition: '',
        icon: '',
        humidity: 0,
        windSpeed: 0,
        windDirection: '',
        isLoading: true,
        error: null,
      });
      expect(wrapper.vm.forecastData['London']).toEqual({
        cityName: 'London',
        forecast: [],
        isLoading: true,
        error: null,
      });
      expect(wrapper.vm.lastUpdated).toBe('');
      expect(wrapper.vm.hasErrors).toBe(false);
      expect(wrapper.vm.allLoaded).toBe(false);
    });
  });

  describe('reactive properties', () => {
    it('should provide weather data reactive array', () => {
      const cities = ['London'];
      const TestComponent = createTestComponent({ cities });
      const wrapper = mount(TestComponent);

      expect(Array.isArray(wrapper.vm.weatherData)).toBe(true);
      expect(wrapper.vm.weatherData).toHaveLength(1);
    });

    it('should provide forecast data reactive object', () => {
      const cities = ['London'];
      const TestComponent = createTestComponent({ cities });
      const wrapper = mount(TestComponent);

      expect(typeof wrapper.vm.forecastData).toBe('object');
      expect(wrapper.vm.forecastData['London']).toBeDefined();
    });

    it('should provide computed properties', () => {
      const cities = ['London'];
      const TestComponent = createTestComponent({ cities });
      const wrapper = mount(TestComponent);

      expect(typeof wrapper.vm.hasErrors).toBe('boolean');
      expect(typeof wrapper.vm.allLoaded).toBe('boolean');
      expect(typeof wrapper.vm.isLoading).toBe('boolean');
    });

    it('should provide method functions', () => {
      const cities = ['London'];
      const TestComponent = createTestComponent({ cities });
      const wrapper = mount(TestComponent);

      expect(typeof wrapper.vm.refresh).toBe('function');
      expect(typeof wrapper.vm.startAutoRefresh).toBe('function');
      expect(typeof wrapper.vm.stopAutoRefresh).toBe('function');
    });
  });

  describe('data structure validation', () => {
    it('should initialize weather data with correct structure for multiple cities', () => {
      const cities = ['London', 'Paris', 'Tokyo'];
      const TestComponent = createTestComponent({ cities });
      const wrapper = mount(TestComponent);

      expect(wrapper.vm.weatherData).toHaveLength(3);
      
      cities.forEach((city, index) => {
        expect(wrapper.vm.weatherData[index].cityName).toBe(city);
        expect(wrapper.vm.weatherData[index]).toHaveProperty('temperature');
        expect(wrapper.vm.weatherData[index]).toHaveProperty('condition');
        expect(wrapper.vm.weatherData[index]).toHaveProperty('icon');
        expect(wrapper.vm.weatherData[index]).toHaveProperty('humidity');
        expect(wrapper.vm.weatherData[index]).toHaveProperty('windSpeed');
        expect(wrapper.vm.weatherData[index]).toHaveProperty('windDirection');
        expect(wrapper.vm.weatherData[index]).toHaveProperty('isLoading');
        expect(wrapper.vm.weatherData[index]).toHaveProperty('error');
      });
    });

    it('should initialize forecast data with correct structure', () => {
      const cities = ['London', 'Paris'];
      const TestComponent = createTestComponent({ cities });
      const wrapper = mount(TestComponent);

      cities.forEach(city => {
        expect(wrapper.vm.forecastData[city]).toHaveProperty('cityName');
        expect(wrapper.vm.forecastData[city]).toHaveProperty('forecast');
        expect(wrapper.vm.forecastData[city]).toHaveProperty('isLoading');
        expect(wrapper.vm.forecastData[city]).toHaveProperty('error');
        expect(Array.isArray(wrapper.vm.forecastData[city].forecast)).toBe(true);
      });
    });
  });

  describe('options handling', () => {
    it('should accept custom refresh interval', () => {
      const cities = ['London'];
      const TestComponent = createTestComponent({ cities, refreshInterval: 60000 });
      const wrapper = mount(TestComponent);

      expect(wrapper.vm.weatherData).toHaveLength(1);
    });

    it('should accept custom retry attempts', () => {
      const cities = ['London'];
      const TestComponent = createTestComponent({ cities, retryAttempts: 5 });
      const wrapper = mount(TestComponent);

      expect(wrapper.vm.weatherData).toHaveLength(1);
    });
  });
});