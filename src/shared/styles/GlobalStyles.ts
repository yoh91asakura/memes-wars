import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* CSS Reset and Base Styles */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    font-family: ${({ theme }) => theme.typography.fonts.sans};
    line-height: ${({ theme }) => theme.typography.lineHeights.normal};
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    font-size: ${({ theme }) => theme.typography.sizes.base};
    font-weight: ${({ theme }) => theme.typography.weights.normal};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.primary};
    line-height: ${({ theme }) => theme.typography.lineHeights.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Remove default margins and paddings */
  h1, h2, h3, h4, h5, h6,
  p, blockquote, pre,
  dl, dd, ol, ul,
  figure, fieldset, legend {
    margin: 0;
    padding: 0;
  }

  /* Reset list styles */
  ol, ul {
    list-style: none;
  }

  /* Reset form elements */
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }

  button {
    border: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.text.accent};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  /* Focus styles */
  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }

  /* Skip to content link for accessibility */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: ${({ theme }) => theme.colors.gray[900]};
    color: ${({ theme }) => theme.colors.text.inverse};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
    text-decoration: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    z-index: ${({ theme }) => theme.zIndex.skipLink};
    transition: top ${({ theme }) => theme.animations.durations.fast} ${({ theme }) => theme.animations.easings.easeOut};

    &:focus {
      top: 6px;
    }
  }

  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Animation preferences */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    * {
      border-color: currentColor !important;
    }
  }

  /* Dark mode preferences */
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
    }
  }

  /* Typography scale */
  h1 {
    font-size: ${({ theme }) => theme.typography.sizes['3xl']};
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    line-height: ${({ theme }) => theme.typography.lineHeights.tight};
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.sizes['2xl']};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeights.tight};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeights.snug};
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    line-height: ${({ theme }) => theme.typography.lineHeights.snug};
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.sizes.base};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    line-height: ${({ theme }) => theme.typography.lineHeights.normal};
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    line-height: ${({ theme }) => theme.typography.lineHeights.normal};
  }

  /* Utility classes */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }

  .font-bold { font-weight: ${({ theme }) => theme.typography.weights.bold}; }
  .font-semibold { font-weight: ${({ theme }) => theme.typography.weights.semibold}; }
  .font-medium { font-weight: ${({ theme }) => theme.typography.weights.medium}; }

  .text-sm { font-size: ${({ theme }) => theme.typography.sizes.sm}; }
  .text-base { font-size: ${({ theme }) => theme.typography.sizes.base}; }
  .text-lg { font-size: ${({ theme }) => theme.typography.sizes.lg}; }
  .text-xl { font-size: ${({ theme }) => theme.typography.sizes.xl}; }

  /* Card rarity glow animations */
  @keyframes rarityGlow {
    0%, 100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }

  .rarity-glow-common { box-shadow: ${({ theme }) => theme.shadows.rarityGlow.common}; }
  .rarity-glow-uncommon { box-shadow: ${({ theme }) => theme.shadows.rarityGlow.uncommon}; }
  .rarity-glow-rare { box-shadow: ${({ theme }) => theme.shadows.rarityGlow.rare}; }
  .rarity-glow-epic { box-shadow: ${({ theme }) => theme.shadows.rarityGlow.epic}; }
  .rarity-glow-legendary { box-shadow: ${({ theme }) => theme.shadows.rarityGlow.legendary}; }
  .rarity-glow-mythic { 
    box-shadow: ${({ theme }) => theme.shadows.rarityGlow.mythic};
    animation: rarityGlow 2s ease-in-out infinite;
  }
  .rarity-glow-cosmic { 
    box-shadow: ${({ theme }) => theme.shadows.rarityGlow.cosmic};
    animation: rarityGlow 1.5s ease-in-out infinite;
  }

  /* Loading animation */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  /* Pulse animation */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Bounce animation */
  @keyframes bounce {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  .animate-bounce {
    animation: bounce 1s infinite;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.gray[100]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[400]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.gray[500]};
  }

  /* App root container */
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

export default GlobalStyles;
