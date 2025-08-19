import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../models/Card';
import { TCGCard } from '../../organisms/TCGCard';
import styles from './CardHoverPreview.module.css';

export interface CardHoverPreviewProps {
  card: Card | null;
  mousePosition: { x: number; y: number };
  isVisible: boolean;
}

export const CardHoverPreview: React.FC<CardHoverPreviewProps> = ({
  card,
  mousePosition,
  isVisible
}) => {
  if (!card || !isVisible) return null;

  // Calculate position to keep preview on screen
  const previewWidth = 300;
  const previewHeight = 400;
  const margin = 20;

  let left = mousePosition.x + 20;
  let top = mousePosition.y - previewHeight / 2;

  // Adjust if preview would go off screen
  if (left + previewWidth > window.innerWidth - margin) {
    left = mousePosition.x - previewWidth - 20;
  }
  
  if (top < margin) {
    top = margin;
  } else if (top + previewHeight > window.innerHeight - margin) {
    top = window.innerHeight - previewHeight - margin;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={styles.cardHoverPreview}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          left: `${left}px`,
          top: `${top}px`,
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        <div className={styles.previewCard}>
          <TCGCard
            card={card}
            size="large"
            variant="detail"
            animated={false}
            showStats={true}
            showEmojis={true}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};