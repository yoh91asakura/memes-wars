import styled, { css } from 'styled-components';
import { StyledTextProps } from './Text.types';

const getVariantStyles = (variant: string) => {
  const variantMap = {
    h1: css`
      font-size: ${({ theme }) => theme.typography.sizes['5xl']};
      font-weight: ${({ theme }) => theme.typography.weights.bold};
      line-height: ${({ theme }) => theme.typography.lineHeights.tight};
      margin: 0;
    `,
    h2: css`
      font-size: ${({ theme }) => theme.typography.sizes['4xl']};
      font-weight: ${({ theme }) => theme.typography.weights.bold};
      line-height: ${({ theme }) => theme.typography.lineHeights.tight};
      margin: 0;
    `,
    h3: css`
      font-size: ${({ theme }) => theme.typography.sizes['3xl']};
      font-weight: ${({ theme }) => theme.typography.weights.semibold};
      line-height: ${({ theme }) => theme.typography.lineHeights.snug};
      margin: 0;
    `,
    h4: css`
      font-size: ${({ theme }) => theme.typography.sizes['2xl']};
      font-weight: ${({ theme }) => theme.typography.weights.semibold};
      line-height: ${({ theme }) => theme.typography.lineHeights.snug};
      margin: 0;
    `,
    h5: css`
      font-size: ${({ theme }) => theme.typography.sizes.xl};
      font-weight: ${({ theme }) => theme.typography.weights.medium};
      line-height: ${({ theme }) => theme.typography.lineHeights.normal};
      margin: 0;
    `,
    h6: css`
      font-size: ${({ theme }) => theme.typography.sizes.lg};
      font-weight: ${({ theme }) => theme.typography.weights.medium};
      line-height: ${({ theme }) => theme.typography.lineHeights.normal};
      margin: 0;
    `,
    subtitle: css`
      font-size: ${({ theme }) => theme.typography.sizes.lg};
      font-weight: ${({ theme }) => theme.typography.weights.normal};
      line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
      margin: 0;
    `,
    body: css`
      font-size: ${({ theme }) => theme.typography.sizes.base};
      font-weight: ${({ theme }) => theme.typography.weights.normal};
      line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
      margin: 0;
    `,
    caption: css`
      font-size: ${({ theme }) => theme.typography.sizes.sm};
      font-weight: ${({ theme }) => theme.typography.weights.normal};
      line-height: ${({ theme }) => theme.typography.lineHeights.normal};
      margin: 0;
    `,
    overline: css`
      font-size: ${({ theme }) => theme.typography.sizes.xs};
      font-weight: ${({ theme }) => theme.typography.weights.medium};
      line-height: ${({ theme }) => theme.typography.lineHeights.tight};
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0;
    `,
  };
  
  return variantMap[variant as keyof typeof variantMap] || variantMap.body;
};

const getWeightStyles = (weight: string) => {
  const weightMap = {
    normal: css`font-weight: ${({ theme }) => theme.typography.weights.normal};`,
    medium: css`font-weight: ${({ theme }) => theme.typography.weights.medium};`,
    semibold: css`font-weight: ${({ theme }) => theme.typography.weights.semibold};`,
    bold: css`font-weight: ${({ theme }) => theme.typography.weights.bold};`,
    extrabold: css`font-weight: ${({ theme }) => theme.typography.weights.extrabold};`,
  };
  
  return weightMap[weight as keyof typeof weightMap] || weightMap.normal;
};

const getAlignStyles = (align: string) => {
  const alignMap = {
    left: css`text-align: left;`,
    center: css`text-align: center;`,
    right: css`text-align: right;`,
    justify: css`text-align: justify;`,
  };
  
  return alignMap[align as keyof typeof alignMap] || alignMap.left;
};

const getColorStyles = (color: string) => {
  const colorMap = {
    primary: css`color: ${({ theme }) => theme.colors.text.primary};`,
    secondary: css`color: ${({ theme }) => theme.colors.text.secondary};`,
    muted: css`color: ${({ theme }) => theme.colors.text.tertiary};`,
    inverse: css`color: ${({ theme }) => theme.colors.text.inverse};`,
    accent: css`color: ${({ theme }) => theme.colors.text.accent};`,
    success: css`color: ${({ theme }) => theme.colors.success[600]};`,
    warning: css`color: ${({ theme }) => theme.colors.warning[600]};`,
    error: css`color: ${({ theme }) => theme.colors.error[600]};`,
    inherit: css`color: inherit;`,
  };
  
  return colorMap[color as keyof typeof colorMap] || colorMap.primary;
};

export const StyledText = styled.span<StyledTextProps>`
  /* Base styles */
  font-family: ${({ theme }) => theme.typography.fonts.sans};
  
  /* Variant styles */
  ${({ $variant }) => getVariantStyles($variant)}
  
  /* Weight styles */
  ${({ $weight }) => getWeightStyles($weight)}
  
  /* Alignment styles */
  ${({ $align }) => getAlignStyles($align)}
  
  /* Color styles */
  ${({ $color }) => getColorStyles($color)}
  
  /* Truncate styles */
  ${({ $truncate }) => $truncate && css`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `}
  
  /* Uppercase styles */
  ${({ $uppercase }) => $uppercase && css`
    text-transform: uppercase;
  `}
  
  /* Italic styles */
  ${({ $italic }) => $italic && css`
    font-style: italic;
  `}
`;
