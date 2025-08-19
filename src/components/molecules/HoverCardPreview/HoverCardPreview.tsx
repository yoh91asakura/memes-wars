import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedCard } from '../../../models/unified/Card';
import { Card } from '../Card/Card';
import './HoverCardPreview.css';

interface HoverCardPreviewProps {
  card: UnifiedCard | null;
  position: { x: number; y: number } | null;
  isVisible: boolean;
  onClose?: () => void;
}

export const HoverCardPreview: React.FC<HoverCardPreviewProps> = ({
  card,
  position,
  isVisible,
  onClose
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Calculate optimal position to avoid viewport edges
  const getOptimalPosition = () => {
    if (!position || !previewRef.current) return { x: 0, y: 0 };

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const preview = {
      width: 280, // Approximate width of full card
      height: 400 // Approximate height of full card
    };

    let x = position.x + 20; // Offset from cursor
    let y = position.y - preview.height / 2;

    // Adjust X position if it would go off-screen
    if (x + preview.width > viewport.width) {
      x = position.x - preview.width - 20;
    }

    // Adjust Y position if it would go off-screen
    if (y < 0) {
      y = 10;
    } else if (y + preview.height > viewport.height) {
      y = viewport.height - preview.height - 10;
    }

    return { x, y };
  };

  const optimalPosition = getOptimalPosition();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        if (onClose) onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && card && (
        <motion.div
          ref={previewRef}
          className="hover-card-preview"
          initial={{ opacity: 0, scale: 0.8, x: optimalPosition.x, y: optimalPosition.y }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            x: optimalPosition.x, 
            y: optimalPosition.y 
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div className="hover-card-preview__content">
            <Card
              card={card}
              variant="tcg"
              size="md"
              interactive={false}
              showStats={true}
              showAbility={true}
              showInventory={true}
            />
          </div>
          
          {/* Position indicator for debugging */}
          <div className="hover-card-preview__indicator" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HoverCardPreview;