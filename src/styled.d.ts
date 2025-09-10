// styled-components theme declarations
import 'styled-components';
import { Theme } from './shared/styles/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}