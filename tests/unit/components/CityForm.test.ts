import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CityForm from '../../../src/components/shared/CityForm.vue';
import Button from '../../../src/components/shared/Button.vue';

vi.mock('../../../src/components/shared/Button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'type', 'text', 'variant'],
    emits: ['click']
  }
}));

describe('CityForm', () => {
  const defaultProps = {
    cities: ['London', 'Paris']
  };

  describe('rendering', () => {
    it('should render form with input and button', () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      expect(wrapper.find('input').exists()).toBe(true);
      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter city name');
      expect(wrapper.findComponent(Button).exists()).toBe(true);
    });

    it('should not show error message initially', () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      expect(wrapper.find('.city-form__error').exists()).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should disable submit button when input is empty', async () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const button = wrapper.findComponent(Button);
      expect(button.props('disabled')).toBe(true);
    });

    it('should enable submit button when input has value', async () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const input = wrapper.find('input');
      await input.setValue('New York');

      const button = wrapper.findComponent(Button);
      expect(button.props('disabled')).toBe(false);
    });

    it('should disable submit button when input has only whitespace', async () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const input = wrapper.find('input');
      await input.setValue('   ');

      const button = wrapper.findComponent(Button);
      expect(button.props('disabled')).toBe(true);
    });
  });

  describe('form submission', () => {
    it('should emit addCity event with trimmed city name on valid submission', async () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const input = wrapper.find('input');
      await input.setValue('  New York  ');

      const form = wrapper.find('form');
      await form.trigger('submit.prevent');

      expect(wrapper.emitted('addCity')).toBeTruthy();
      expect(wrapper.emitted('addCity')?.[0]).toEqual(['New York']);
    });

    it('should clear input after successful submission', async () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const input = wrapper.find('input');
      await input.setValue('New York');

      const form = wrapper.find('form');
      await form.trigger('submit.prevent');

      expect(input.element.value).toBe('');
    });

    it('should show error when submitting empty city name', async () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const form = wrapper.find('form');
      await form.trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.city-form__error').exists()).toBe(true);
      expect(wrapper.find('.city-form__error').text()).toBe('Please enter a city name');
      expect(wrapper.find('input').classes()).toContain('city-form__input--error');
    });

    it('should show error when submitting duplicate city', async () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const input = wrapper.find('input');
      await input.setValue('London');
      const form = wrapper.find('form');
      await form.trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.city-form__error').exists()).toBe(true);
      expect(wrapper.find('.city-form__error').text()).toBe('City already exists');
      expect(wrapper.find('input').classes()).toContain('city-form__input--error');
    });

    it('should not emit addCity event for invalid submissions', async () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const form = wrapper.find('form');
      await form.trigger('submit.prevent');

      expect(wrapper.emitted('addCity')).toBeFalsy();
    });
  });

  describe('error handling', () => {
    it('should clear error message after 3 seconds', async () => {
      vi.useFakeTimers();
      
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const form = wrapper.find('form');
      await form.trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.city-form__error').exists()).toBe(true);

      vi.advanceTimersByTime(3000);
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.city-form__error').exists()).toBe(false);
      expect(wrapper.find('input').classes()).not.toContain('city-form__input--error');

      vi.useRealTimers();
    });

    it('should clear error when valid input is entered after error', async () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      const form = wrapper.find('form');
      await form.trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.city-form__error').exists()).toBe(true);

      const input = wrapper.find('input');
      await input.setValue('New York');
      await form.trigger('submit.prevent');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.city-form__error').exists()).toBe(false);
      expect(wrapper.find('input').classes()).not.toContain('city-form__input--error');
    });
  });

  describe('accessibility', () => {
    it('should have proper form structure', () => {
      const wrapper = mount(CityForm, {
        props: defaultProps,
        global: {
          components: { Button }
        }
      });

      expect(wrapper.find('form').exists()).toBe(true);
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    });
  });

  describe('case sensitivity', () => {
    it('should treat city names as case sensitive for duplicate checking', async () => {
      const wrapper = mount(CityForm, {
        props: { cities: ['London'] },
        global: {
          components: { Button }
        }
      });

      const input = wrapper.find('input');
      await input.setValue('london');
      const form = wrapper.find('form');
      await form.trigger('submit.prevent');

      expect(wrapper.emitted('addCity')).toBeTruthy();
      expect(wrapper.emitted('addCity')?.[0]).toEqual(['london']);
    });
  });
});