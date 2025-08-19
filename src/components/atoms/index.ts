// Atomic components - Basic building blocks of the UI
export { Badge } from './Badge';
export { Button } from './Button';
export { Icon } from './Icon';
export { Input } from './Input';
export { Spinner } from './Spinner';
export { Text } from './Text';

// Types
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonShape } from './Button';
export type { TextProps, TextVariant, TextWeight, TextAlign, TextColor } from './Text';

// Base component props interface
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}