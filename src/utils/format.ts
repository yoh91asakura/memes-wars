// Format Utilities - String formatting, number formatting, and display utilities

export class NumberFormat {
  // Format large numbers with suffixes (1K, 1M, 1B, etc.)
  static compact(value: number, decimals: number = 1): string {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
    const tier = Math.log10(Math.abs(value)) / 3 | 0;
    
    if (tier === 0) return value.toString();
    
    const suffix = suffixes[tier] || `e${tier * 3}`;
    const scale = Math.pow(10, tier * 3);
    const scaled = value / scale;
    
    return scaled.toFixed(decimals) + suffix;
  }

  // Format numbers with thousand separators
  static thousands(value: number, separator: string = ','): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  // Format percentage
  static percent(value: number, decimals: number = 1): string {
    return (value * 100).toFixed(decimals) + '%';
  }

  // Format currency
  static currency(value: number, currency: string = '$', decimals: number = 2): string {
    return `${currency}${value.toFixed(decimals)}`;
  }

  // Format decimal with fixed precision
  static decimal(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  // Format time duration in seconds to readable format
  static duration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `0:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  // Format time duration with units
  static durationWithUnits(seconds: number): string {
    if (seconds < 60) {
      return `${Math.floor(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  // Format file size in bytes to readable format
  static fileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
  }

  // Format ordinal numbers (1st, 2nd, 3rd, etc.)
  static ordinal(value: number): string {
    const j = value % 10;
    const k = value % 100;
    
    if (j === 1 && k !== 11) return value + 'st';
    if (j === 2 && k !== 12) return value + 'nd';
    if (j === 3 && k !== 13) return value + 'rd';
    
    return value + 'th';
  }

  // Clamp number to range
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  // Linear interpolation
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  // Map value from one range to another
  static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }
}

export class StringFormat {
  // Truncate string with ellipsis
  static truncate(text: string, maxLength: number, ellipsis: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - ellipsis.length) + ellipsis;
  }

  // Title case formatting
  static titleCase(text: string): string {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // Camel case to sentence
  static camelToSentence(text: string): string {
    return text
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Snake case to sentence
  static snakeToSentence(text: string): string {
    return text
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  }

  // Kebab case to sentence
  static kebabToSentence(text: string): string {
    return text
      .replace(/-/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  }

  // Pluralize word based on count
  static pluralize(word: string, count: number, plural?: string): string {
    if (count === 1) return word;
    
    if (plural) return plural;
    
    // Simple pluralization rules
    if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
    if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
      return word + 'es';
    }
    
    return word + 's';
  }

  // Generate initials from name
  static initials(name: string, maxLength: number = 2): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, maxLength);
  }

  // Format template string with variables
  static template(template: string, variables: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables.hasOwnProperty(key) ? String(variables[key]) : match;
    });
  }

  // Escape HTML
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Capitalize first letter
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Generate slug from text
  static slug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}

export class DateFormat {
  // Format date relative to now (e.g., "2 hours ago", "just now")
  static relative(date: Date | string | number): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 30) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return '1 week ago';
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths === 1) return '1 month ago';
    if (diffMonths < 12) return `${diffMonths} months ago`;
    if (diffYears === 1) return '1 year ago';
    return `${diffYears} years ago`;
  }

  // Format date for display
  static display(date: Date | string | number, includeTime: boolean = false): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return d.toLocaleDateString('en-US', options);
  }

  // Format date for input fields
  static input(date: Date | string | number): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // Format time for display
  static time(date: Date | string | number, use24Hour: boolean = false): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour12: !use24Hour,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format countdown timer
  static countdown(targetDate: Date | string | number): string {
    const now = new Date();
    const target = new Date(targetDate);
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) return '00:00:00';

    const diffSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export class GameFormat {
  // Format player rank
  static rank(rank: number): string {
    return `#${NumberFormat.thousands(rank)}`;
  }

  // Format experience points
  static experience(xp: number): string {
    return `${NumberFormat.compact(xp)} XP`;
  }

  // Format health/mana bars
  static healthBar(current: number, max: number): { percentage: number; text: string; color: string } {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const text = `${Math.floor(current)}/${Math.floor(max)}`;
    
    let color = '#10b981'; // Green
    if (percentage < 25) color = '#ef4444'; // Red
    else if (percentage < 50) color = '#f59e0b'; // Yellow
    
    return { percentage, text, color };
  }

  // Format damage numbers for display
  static damage(damage: number, isCritical: boolean = false): { text: string; color: string; size: string } {
    const text = Math.floor(damage).toString();
    const color = isCritical ? '#fbbf24' : '#ef4444';
    const size = isCritical ? '1.5em' : '1em';
    
    return { text, color, size };
  }

  // Format card rarity
  static rarity(rarity: string): { text: string; color: string; emoji: string } {
    const rarityData: Record<string, { color: string; emoji: string }> = {
      common: { color: '#9ca3af', emoji: '⚪' },
      uncommon: { color: '#10b981', emoji: '🟢' },
      rare: { color: '#3b82f6', emoji: '🔵' },
      epic: { color: '#8b5cf6', emoji: '🟣' },
      legendary: { color: '#f59e0b', emoji: '🟡' },
      mythic: { color: '#ef4444', emoji: '🔴' },
      cosmic: { color: '#06b6d4', emoji: '🌟' },
      divine: { color: '#ec4899', emoji: '✨' },
      infinity: { color: '#000000', emoji: '♾️' }
    };

    const data = rarityData[rarity.toLowerCase()] || rarityData.common;
    return {
      text: StringFormat.titleCase(rarity),
      color: data.color,
      emoji: data.emoji
    };
  }

  // Format match result
  static matchResult(result: 'win' | 'loss' | 'draw'): { text: string; color: string; emoji: string } {
    const resultData = {
      win: { text: 'Victory', color: '#10b981', emoji: '🏆' },
      loss: { text: 'Defeat', color: '#ef4444', emoji: '💀' },
      draw: { text: 'Draw', color: '#6b7280', emoji: '🤝' }
    };

    return resultData[result];
  }

  // Format level progress
  static levelProgress(currentXP: number, requiredXP: number, level: number): {
    percentage: number;
    text: string;
    levelText: string;
  } {
    const percentage = Math.min(100, (currentXP / requiredXP) * 100);
    const text = `${NumberFormat.compact(currentXP)} / ${NumberFormat.compact(requiredXP)}`;
    const levelText = `Level ${level}`;

    return { percentage, text, levelText };
  }

  // Format achievement progress
  static achievementProgress(current: number, max: number): {
    percentage: number;
    text: string;
    isComplete: boolean;
  } {
    const percentage = Math.min(100, (current / max) * 100);
    const text = `${NumberFormat.compact(current)} / ${NumberFormat.compact(max)}`;
    const isComplete = current >= max;

    return { percentage, text, isComplete };
  }

  // Format leaderboard position with change indicator
  static leaderboardPosition(
    position: number,
    previousPosition?: number
  ): { text: string; change: string; changeColor: string } {
    const text = NumberFormat.ordinal(position);
    
    if (previousPosition === undefined) {
      return { text, change: '', changeColor: '#6b7280' };
    }

    const change = previousPosition - position;
    let changeText = '';
    let changeColor = '#6b7280';

    if (change > 0) {
      changeText = `+${change}`;
      changeColor = '#10b981';
    } else if (change < 0) {
      changeText = `${change}`;
      changeColor = '#ef4444';
    } else {
      changeText = '→';
    }

    return { text, change: changeText, changeColor };
  }
}

export class ValidationFormat {
  // Validate and format email
  static email(email: string): { isValid: boolean; formatted: string; error?: string } {
    const formatted = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(formatted)) {
      return { isValid: false, formatted, error: 'Invalid email format' };
    }
    
    return { isValid: true, formatted };
  }

  // Validate and format username
  static username(username: string): { isValid: boolean; formatted: string; error?: string } {
    const formatted = username.trim();
    
    if (formatted.length < 3) {
      return { isValid: false, formatted, error: 'Username must be at least 3 characters' };
    }
    
    if (formatted.length > 20) {
      return { isValid: false, formatted, error: 'Username must be less than 20 characters' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(formatted)) {
      return { isValid: false, formatted, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }
    
    return { isValid: true, formatted };
  }

  // Validate deck name
  static deckName(name: string): { isValid: boolean; formatted: string; error?: string } {
    const formatted = name.trim();
    
    if (formatted.length === 0) {
      return { isValid: false, formatted, error: 'Deck name is required' };
    }
    
    if (formatted.length > 50) {
      return { isValid: false, formatted, error: 'Deck name must be less than 50 characters' };
    }
    
    return { isValid: true, formatted };
  }
}

// Utility functions for common formatting tasks
export function formatters() {
  return {
    number: NumberFormat,
    string: StringFormat,
    date: DateFormat,
    game: GameFormat,
    validation: ValidationFormat
  };
}

// Export default formatters instance
export const format = formatters();