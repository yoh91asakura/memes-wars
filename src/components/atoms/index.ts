// Atomic components - Basic building blocks of the UI
export { Badge } from './Badge';
export { Button } from './Button';
export { Icon } from './Icon';
export { Input } from './Input';
export { Spinner } from './Spinner';
export { Text } from './Text';
export { PhaseContainer } from './PhaseContainer';

// New TCG Card atoms
export { CardImage } from './CardImage';
export { StatBadge } from './StatBadge';
export { RarityIndicator } from './RarityIndicator';
export { EmojiChip } from './EmojiChip';

// Types
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonShape } from './Button';
export type { TextProps, TextVariant, TextWeight, TextAlign, TextColor } from './Text';
export type { CardImageProps } from './CardImage';
export type { StatBadgeProps } from './StatBadge';
export type { RarityIndicatorProps } from './RarityIndicator';
export type { EmojiChipProps } from './EmojiChip';
export type { PhaseContainerProps } from './PhaseContainer';

// Base component props interface
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}
