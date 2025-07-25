declare module '@tabler/icons-vue' {
  import { FunctionalComponent, SVGAttributes } from 'vue';

  interface SVGProps extends Partial<SVGAttributes> {
    size?: 24 | number | string;
    strokeWidth?: number | string;
  }

  type Icon = FunctionalComponent<SVGProps>;

  export const IconLoader: Icon;
  export const IconAlertCircle: Icon;
  export const IconCloud: Icon;
  export const IconWind: Icon;
  export const IconDroplet: Icon;
  export const IconRefresh: Icon;
  export const IconX: Icon;
  
  // Allow any other icon to be imported
  const icons: Record<string, Icon>;
  export default icons;
}