import React from 'react';
import { BaseComponentProps } from '../../types';
import './Icon.css';

interface IconProps extends BaseComponentProps {
  name?: string;
  emoji?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted' | 'inherit';
  spin?: boolean;
  pulse?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  emoji,
  size = 'md',
  color = 'inherit',
  spin = false,
  pulse = false,
  className = '',
  testId,
}) => {
  const iconClass = [
    'icon',
    `icon--${size}`,
    `icon--${color}`,
    spin && 'icon--spin',
    pulse && 'icon--pulse',
    className
  ].filter(Boolean).join(' ');

  // If emoji is provided, render as emoji
  if (emoji) {
    return (
      <span 
        className={iconClass}
        data-testid={testId}
        role="img"
        aria-label={name || emoji}
      >
        {emoji}
      </span>
    );
  }

  // Common game icons as emoji fallbacks
  const getEmojiForName = (iconName: string): string => {
    const iconMap: Record<string, string> = {
      // UI Icons
      'menu': '☰',
      'close': '✕',
      'search': '🔍',
      'home': '🏠',
      'user': '👤',
      'settings': '⚙️',
      'help': '❓',
      'info': 'ℹ️',
      
      // Game Icons
      'cards': '🃏',
      'roll': '🎲',
      'craft': '🛠️',
      'battle': '⚔️',
      'deck': '📚',
      'collection': '📦',
      'stats': '📊',
      'trophy': '🏆',
      'star': '⭐',
      'heart': '❤️',
      'diamond': '💎',
      'coin': '🪙',
      'gem': '💠',
      
      // Actions
      'play': '▶️',
      'pause': '⏸️',
      'stop': '⏹️',
      'next': '⏭️',
      'prev': '⏮️',
      'refresh': '🔄',
      'add': '➕',
      'remove': '➖',
      'edit': '✏️',
      'delete': '🗑️',
      'save': '💾',
      
      // Status
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'loading': '⏳',
      'online': '🟢',
      'offline': '🔴',
      
      // Social
      'share': '📤',
      'like': '👍',
      'dislike': '👎',
      'comment': '💬',
      'message': '✉️',
      
      // Meme themed
      'doge': '🐕',
      'pepe': '🐸',
      'cat': '🐱',
      'fire': '🔥',
      'rocket': '🚀',
      'moon': '🌙',
      'party': '🎉',
      'magic': '✨',
    };
    
    return iconMap[iconName] || '❓';
  };

  const iconEmoji = name ? getEmojiForName(name) : '❓';

  return (
    <span 
      className={iconClass}
      data-testid={testId}
      role="img"
      aria-label={name || 'icon'}
    >
      {iconEmoji}
    </span>
  );
};
