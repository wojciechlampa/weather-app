import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '../../../src/components/shared/Button.vue';

const MockIcon = {
  name: 'MockIcon',
  template: '<svg class="mock-icon"><use href="#icon"></use></svg>'
};

const MockLoadingIcon = {
  name: 'MockLoadingIcon', 
  template: '<svg class="mock-loading-icon"><use href="#loading"></use></svg>'
};

describe('Button', () => {
  describe('basic rendering', () => {
    it('should render button with default props', () => {
      const wrapper = mount(Button);

      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.classes()).toContain('button');
      expect(wrapper.classes()).toContain('button--primary');
      expect(wrapper.attributes('type')).toBe('button');
    });

    it('should render text when provided', () => {
      const wrapper = mount(Button, {
        props: { text: 'Click me' }
      });

      expect(wrapper.text()).toContain('Click me');
    });

    it('should not render text when iconOnly is true', () => {
      const wrapper = mount(Button, {
        props: { text: 'Click me', iconOnly: true }
      });

      expect(wrapper.text()).not.toContain('Click me');
    });
  });

  describe('variants', () => {
    it('should apply primary variant class by default', () => {
      const wrapper = mount(Button);
      expect(wrapper.classes()).toContain('button--primary');
    });

    it('should apply secondary variant class', () => {
      const wrapper = mount(Button, {
        props: { variant: 'secondary' }
      });
      expect(wrapper.classes()).toContain('button--secondary');
    });

    it('should apply ghost variant class', () => {
      const wrapper = mount(Button, {
        props: { variant: 'ghost' }
      });
      expect(wrapper.classes()).toContain('button--ghost');
    });
  });

  describe('button types', () => {
    it('should set button type to button by default', () => {
      const wrapper = mount(Button);
      expect(wrapper.attributes('type')).toBe('button');
    });

    it('should set button type to submit', () => {
      const wrapper = mount(Button, {
        props: { type: 'submit' }
      });
      expect(wrapper.attributes('type')).toBe('submit');
    });

    it('should set button type to reset', () => {
      const wrapper = mount(Button, {
        props: { type: 'reset' }
      });
      expect(wrapper.attributes('type')).toBe('reset');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      const wrapper = mount(Button, {
        props: { disabled: true }
      });

      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('should be disabled when isLoading is true', () => {
      const wrapper = mount(Button, {
        props: { isLoading: true }
      });

      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('should be disabled when both disabled and isLoading are true', () => {
      const wrapper = mount(Button, {
        props: { disabled: true, isLoading: true }
      });

      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('should not be disabled by default', () => {
      const wrapper = mount(Button);
      expect(wrapper.attributes('disabled')).toBeUndefined();
    });
  });

  describe('loading state', () => {
    it('should show loading content when isLoading is true', () => {
      const wrapper = mount(Button, {
        props: { 
          isLoading: true,
          loadingText: 'Loading...',
          loadingIcon: MockLoadingIcon,
          text: 'Submit'
        }
      });

      expect(wrapper.find('.button__loading-content').exists()).toBe(true);
      expect(wrapper.find('.button__content').exists()).toBe(false);
      expect(wrapper.text()).toContain('Loading...');
      expect(wrapper.classes()).toContain('button--loading');
    });

    it('should show normal content when isLoading is false', () => {
      const wrapper = mount(Button, {
        props: { 
          isLoading: false,
          text: 'Submit'
        }
      });

      expect(wrapper.find('.button__loading-content').exists()).toBe(false);
      expect(wrapper.find('.button__content').exists()).toBe(true);
      expect(wrapper.text()).toContain('Submit');
      expect(wrapper.classes()).not.toContain('button--loading');
    });

    it('should use default loading text when not provided', () => {
      const wrapper = mount(Button, {
        props: { 
          isLoading: true,
          loadingIcon: MockLoadingIcon
        }
      });

      expect(wrapper.text()).toContain('Loading...');
    });

    it('should render loading icon when provided', () => {
      const wrapper = mount(Button, {
        props: { 
          isLoading: true,
          loadingIcon: MockLoadingIcon
        }
      });

      expect(wrapper.find('.button__loading-icon').exists()).toBe(true);
      expect(wrapper.findComponent(MockLoadingIcon).exists()).toBe(true);
    });
  });

  describe('icon functionality', () => {
    it('should render icon when provided', () => {
      const wrapper = mount(Button, {
        props: { 
          icon: MockIcon,
          text: 'Click me'
        }
      });

      expect(wrapper.find('.button__icon').exists()).toBe(true);
      expect(wrapper.findComponent(MockIcon).exists()).toBe(true);
    });

    it('should not render icon when not provided', () => {
      const wrapper = mount(Button, {
        props: { text: 'Click me' }
      });

      expect(wrapper.find('.button__icon').exists()).toBe(false);
    });

    it('should apply icon-only class when iconOnly is true', () => {
      const wrapper = mount(Button, {
        props: { 
          icon: MockIcon,
          iconOnly: true
        }
      });

      expect(wrapper.classes()).toContain('button--icon-only');
      expect(wrapper.find('.button__icon--only').exists()).toBe(true);
    });

    it('should not apply icon-only modifier class to icon when iconOnly is false', () => {
      const wrapper = mount(Button, {
        props: { 
          icon: MockIcon,
          iconOnly: false,
          text: 'Click me'
        }
      });

      expect(wrapper.classes()).not.toContain('button--icon-only');
      expect(wrapper.find('.button__icon--only').exists()).toBe(false);
    });
  });

  describe('click events', () => {
    it('should emit click event when clicked', async () => {
      const wrapper = mount(Button);

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('should emit click event multiple times', async () => {
      const wrapper = mount(Button);

      await wrapper.trigger('click');
      await wrapper.trigger('click');
      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toHaveLength(3);
    });

    it('should not emit click when disabled', async () => {
      const wrapper = mount(Button, {
        props: { disabled: true }
      });

      await wrapper.trigger('click');

      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('should not emit click when loading', async () => {
      const wrapper = mount(Button, {
        props: { isLoading: true }
      });

      await wrapper.trigger('click');

      expect(wrapper.attributes('disabled')).toBeDefined();
      expect(wrapper.classes()).toContain('button--loading');
    });
  });

  describe('complex scenarios', () => {
    it('should handle icon-only button with loading state', () => {
      const wrapper = mount(Button, {
        props: { 
          icon: MockIcon,
          iconOnly: true,
          isLoading: true,
          loadingIcon: MockLoadingIcon
        }
      });

      expect(wrapper.classes()).toContain('button--icon-only');
      expect(wrapper.classes()).toContain('button--loading');
      expect(wrapper.find('.button__loading-content').exists()).toBe(true);
      expect(wrapper.find('.button__content').exists()).toBe(false);
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('should handle button with icon and text', () => {
      const wrapper = mount(Button, {
        props: { 
          icon: MockIcon,
          text: 'Save Changes',
          variant: 'secondary'
        }
      });

      expect(wrapper.classes()).toContain('button--secondary');
      expect(wrapper.find('.button__icon').exists()).toBe(true);
      expect(wrapper.text()).toContain('Save Changes');
      expect(wrapper.classes()).not.toContain('button--icon-only');
    });

    it('should handle all props together', () => {
      const wrapper = mount(Button, {
        props: { 
          text: 'Submit Form',
          variant: 'primary',
          type: 'submit',
          icon: MockIcon,
          disabled: false,
          isLoading: false
        }
      });

      expect(wrapper.classes()).toContain('button--primary');
      expect(wrapper.attributes('type')).toBe('submit');
      expect(wrapper.text()).toContain('Submit Form');
      expect(wrapper.find('.button__icon').exists()).toBe(true);
      expect(wrapper.attributes('disabled')).toBeUndefined();
    });
  });
});