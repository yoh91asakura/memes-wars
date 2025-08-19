import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: Record<string, string>;
      success: Record<string, string>;
      warning: Record<string, string>;
      error: Record<string, string>;
      gray: Record<string, string>;
      text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        accent: string;
      };
      background: {
        primary: string;
        secondary: string;
      };
    };
    typography: {
      sizes: Record<string, string>;
      weights: Record<string, string | number>;
      lineHeights: Record<string, string | number>;
      fonts: {
        sans: string;
      };
    };
    spacing: Record<string, string>;
    shadows: {
      sm: string;
      md: string;
      lg: string;
      rarityGlow: Record<string, string>;
    };
    borderRadius: Record<string, string>;
    animations: {
      durations: Record<string, string>;
      easings: Record<string, string>;
    };
    zIndex: Record<string, number | string>;
  }
}
