import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardUtils } from '../../../models';
import { CardFrame } from '../../molecules/CardFrame';
import { CardHeader } from '../../molecules/CardHeader';
import { CardFooter } from '../../molecules/CardFooter';
import { EmojiInventory } from '../../molecules/EmojiInventory';
import { PassiveAbilities } from '../../molecules/PassiveAbilities';
import { CardImage } from '../../atoms/CardImage';
import styles from './TCGCard.module.css';

export interface TCGCardProps {
  card: Card;
  size?: 'small' | 'medium' | 'large';
  variant?: 'collection' | 'battle' | 'detail';
  onClick?: (card: Card) => void;
  selected?: boolean;
  animated?: boolean;
  showStats?: boolean;
  showEmojis?: boolean;
  imageUrl?: string;
  className?: string;
  testId?: string;
}

export const TCGCard: React.FC<TCGCardProps> = ({
  card,
  size = 'medium',
  variant = 'collection',
  onClick,
  selected = false,
  animated = true,
  showStats = true,
  showEmojis = true,
  imageUrl,
  className = '',
  testId
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  const cardClass = [
    styles.tcgCard,
    styles[size],
    styles[variant],
    onClick && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  // Animation variants based on size
  const getAnimationProps = () => {
    if (!animated) return {};
    
    const baseScale = size === 'small' ? 1.03 : size === 'large' ? 1.01 : 1.02;
    const baseY = size === 'small' ? -2 : size === 'large' ? -6 : -4;
    
    return {
      whileHover: onClick ? { 
        scale: baseScale, 
        y: baseY,
        transition: { duration: 0.2, ease: 'easeOut' }
      } : undefined,
      whileTap: onClick ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : undefined,
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: 'easeOut' }
    };
  };


  return (
    <motion.div
      className={cardClass}
      onClick={handleClick}
      data-testid={testId}
      {...getAnimationProps()}
    >
        <CardFrame
          rarity={CardUtils.getRarityName(card.rarity).toLowerCase()}
          animated={animated}
          size={size}
          variant={variant}
          selected={selected}
          className={styles.cardFrame}
        >
        {/* Header Section - Name & Rarity */}
        <div className={styles.headerSection}>
          <CardHeader
            name={card.name}
            rarity={card.rarity}
            compact={size === 'small'}
            alignment="center"
          />
        </div>

        {/* Main Image Section */}
        <div className={styles.imageSection}>
          {!imageUrl && card.emoji ? (
            <div className={styles.emojiDisplay}>
              <span className={styles.mainEmoji}>{card.emoji}</span>
            </div>
          ) : (
            <CardImage
              src={imageUrl}
              alt={`${card.name} artwork`}
              rarity={CardUtils.getRarityName(card.rarity).toLowerCase()}
              size={size}
              className={styles.cardImage}
            />
          )}
        </div>

        {/* Emoji Inventory Section */}
        {showEmojis && card.emojis && card.emojis.length > 0 && (
          <div className={styles.emojiSection}>
            <EmojiInventory
              emojis={card.emojis}
              maxDisplay={size === 'small' ? 4 : size === 'large' ? 8 : 6}
              layout="list"
              size={size}
              showTooltips={variant === 'detail'}
            />
          </div>
        )}

        {/* Passive Abilities Section */}
        {card.cardEffects && card.cardEffects.length > 0 && (
          <div className={styles.passivesSection}>
            <PassiveAbilities
              cardEffects={card.cardEffects}
              size={size}
              showDetails={variant === 'detail'}
            />
          </div>
        )}

        {/* Footer Section - Stats */}
        {showStats && (
          <div className={styles.footerSection}>
            <CardFooter
              health={card.hp || 100}
              luck={card.luck || 0}
              layout="horizontal"
              size={size}
              variant={size === 'small' ? 'compact' : 'default'}
            />
          </div>
        )}
      </CardFrame>
    </motion.div>
  );
};
