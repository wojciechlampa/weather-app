import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import WeatherCard from '../../../src/components/shared/WeatherCard.vue';
import LoadingSpinner from '../../../src/components/shared/LoadingSpinner.vue';
import Button from '../../../src/components/shared/Button.vue';

vi.mock('../../../src/components/shared/LoadingSpinner.vue', () => ({
  default: {
    name: 'LoadingSpinner',
    template: '<div class="loading-spinner">Loading...</div>'
  }
}));

vi.mock('../../../src/components/shared/Button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    props: {
      icon: { type: Object, default: null },
      variant: { type: String, default: 'primary' },
      iconOnly: { type: Boolean, default: false }
    },
    emits: ['click']
  }
}));

vi.mock('@tabler/icons-vue', () => ({
  IconAlertCircle: { name: 'IconAlertCircle', template: '<svg class="icon-alert"></svg>' },
  IconCloud: { name: 'IconCloud', template: '<svg class="icon-cloud"></svg>' },
  IconWind: { name: 'IconWind', template: '<svg class="icon-wind"></svg>' },
  IconX: { name: 'IconX', template: '<svg class="icon-x"></svg>' }
}));

describe('WeatherCard', () => {
  const defaultProps = {
    cityName: 'London',
    temperature: 20,
    condition: 'Partly cloudy',
    icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
    humidity: 65,
    windSpeed: 15.5,
    windDirection: 'SW',
    isLoading: false,
    error: null
  };

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, isLoading: true },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true);
      expect(wrapper.find('.weather-card__weather-content').exists()).toBe(false);
      expect(wrapper.classes()).toContain('weather-card--loading');
    });

    it('should not show weather content when loading', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, isLoading: true },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__temperature').exists()).toBe(false);
      expect(wrapper.find('.weather-card__condition').exists()).toBe(false);
    });
  });

  describe('error state', () => {
    it('should show error message when error prop is provided', () => {
      const errorMessage = 'Failed to fetch weather data';
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, error: errorMessage, isLoading: false },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__error-content').exists()).toBe(true);
      expect(wrapper.find('.weather-card__error-message').text()).toBe(errorMessage);
      expect(wrapper.classes()).toContain('weather-card--error');
    });

    it('should not show weather content when in error state', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, error: 'Error occurred', isLoading: false },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__weather-content').exists()).toBe(false);
      expect(wrapper.find('.weather-card__temperature').exists()).toBe(false);
    });

    it('should show city name even in error state', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, error: 'Error occurred', isLoading: false },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__title').text()).toBe('London');
    });
  });

  describe('normal weather display', () => {
    it('should display city name correctly', () => {
      const wrapper = mount(WeatherCard, {
        props: defaultProps,
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__title').text()).toBe('London');
    });

    it('should display temperature rounded to nearest integer', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, temperature: 20.7 },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__temperature').text()).toBe('21°C');
    });

    it('should display weather condition', () => {
      const wrapper = mount(WeatherCard, {
        props: defaultProps,
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__condition').text()).toBe('Partly cloudy');
    });

    it('should display humidity percentage', () => {
      const wrapper = mount(WeatherCard, {
        props: defaultProps,
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__metric--humidity .weather-card__metric-value').text()).toBe('65%');
    });

    it('should display wind speed rounded with direction', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, windSpeed: 15.7, windDirection: 'NW' },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__metric--wind .weather-card__metric-value').text()).toBe('16 km/h NW');
    });
  });

  describe('weather icon handling', () => {
    it('should display weather icon with full URL when icon starts with http', () => {
      const iconUrl = 'https://cdn.weatherapi.com/weather/64x64/day/116.png';
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, icon: iconUrl },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      const img = wrapper.find('.weather-card__weather-icon');
      expect(img.attributes('src')).toBe(iconUrl);
      expect(img.attributes('alt')).toBe('Partly cloudy');
    });

    it('should prepend https: to icon URL when it starts with //', () => {
      const relativeIconUrl = '//cdn.weatherapi.com/weather/64x64/day/116.png';
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, icon: relativeIconUrl },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      const img = wrapper.find('.weather-card__weather-icon');
      expect(img.attributes('src')).toBe('https://cdn.weatherapi.com/weather/64x64/day/116.png');
    });

    it('should handle empty icon gracefully', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, icon: '' },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      const img = wrapper.find('.weather-card__weather-icon');
      expect(img.attributes('src')).toBe('');
    });
  });

  describe('remove functionality', () => {
    it('should emit remove event when remove button is clicked', async () => {
      const wrapper = mount(WeatherCard, {
        props: defaultProps,
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      const removeButton = wrapper.findComponent(Button);
      await removeButton.trigger('click');

      expect(wrapper.emitted('remove')).toBeTruthy();
      expect(wrapper.emitted('remove')?.[0]).toEqual(['London']);
    });

    it('should pass correct props to remove button', () => {
      const wrapper = mount(WeatherCard, {
        props: defaultProps,
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      const removeButton = wrapper.findComponent(Button);
      expect(removeButton.props('variant')).toBe('ghost');
      expect(removeButton.props('iconOnly')).toBe(true);
    });

    it('should not show remove button in loading state', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, isLoading: true },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.findComponent(Button).exists()).toBe(false);
    });

    it('should show remove button even in error state', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, error: 'Error occurred', isLoading: false },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.findComponent(Button).exists()).toBe(true);
    });
  });

  describe('CSS classes', () => {
    it('should have base weather-card class', () => {
      const wrapper = mount(WeatherCard, {
        props: defaultProps,
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.classes()).toContain('weather-card');
    });

    it('should have loading modifier class when loading', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, isLoading: true },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.classes()).toContain('weather-card--loading');
    });

    it('should have error modifier class when error exists', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, error: 'Error occurred', isLoading: false },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.classes()).toContain('weather-card--error');
    });

    it('should not have modifier classes in normal state', () => {
      const wrapper = mount(WeatherCard, {
        props: defaultProps,
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.classes()).not.toContain('weather-card--loading');
      expect(wrapper.classes()).not.toContain('weather-card--error');
    });
  });

  describe('edge cases', () => {
    it('should handle zero temperature', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, temperature: 0 },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__temperature').text()).toBe('0°C');
    });

    it('should handle negative temperature', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, temperature: -5.3 },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__temperature').text()).toBe('-5°C');
    });

    it('should handle very high wind speed', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, windSpeed: 150.8 },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__metric--wind .weather-card__metric-value').text()).toBe('151 km/h SW');
    });

    it('should handle empty condition text', () => {
      const wrapper = mount(WeatherCard, {
        props: { ...defaultProps, condition: '' },
        global: {
          components: { LoadingSpinner, Button }
        }
      });

      expect(wrapper.find('.weather-card__condition').text()).toBe('');
    });
  });
});