import React from 'react';
import { CardRarity } from '../../../models/unified/Card';
import { RARITY_THEMES } from '../../../constants/rarityThemes';
import styles from './CardImage.module.css';

export interface CardImageProps {
  src?: string;
  alt: string;
  rarity: CardRarity;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  rarity,
  size = 'medium',
  className = ''
}) => {
  const theme = RARITY_THEMES[rarity];
  
  const imageClass = [
    styles.cardImage,
    styles[size],
    className
  ].filter(Boolean).join(' ');

  const placeholderClass = [
    styles.placeholder,
    styles[rarity.toLowerCase()]
  ].join(' ');

  return (
    <div 
      className={imageClass}
      style={{
        '--border-color': theme.borderColor,
        '--glow-color': theme.glowColor,
        '--gradient-start': theme.gradientStart,
        '--gradient-end': theme.gradientEnd
      } as React.CSSProperties}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt}
          className={styles.image}
          loading="lazy"
        />
      ) : (
        <div className={placeholderClass}>
          <div className={styles.placeholderIcon}>
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={styles.placeholderSvg}
            >
              <path 
                d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M6 8H6.01M4 4H20C21.105 4 22 4.895 22 6V18C22 19.105 21.105 20 20 20H4C2.895 20 2 19.105 2 18V6C2 4.895 2.895 4 4 4Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.placeholderText}>
            Coming Soon
          </div>
        </div>
      )}
    </div>
  );
};
