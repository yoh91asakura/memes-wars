// Card Image Utilities
// Handles image URLs, fallbacks, and placeholder management

export const getCardImageUrl = (cardId: string): string => {
  return `/images/cards/${cardId}.jpg`;
};

export const getCardImageUrlWithFallback = (cardId: string): string => {
  // Primary image path
  const primaryUrl = getCardImageUrl(cardId);
  return primaryUrl;
};

export const getPlaceholderImageUrl = (): string => {
  return '/images/cards/placeholder.jpg';
};

// Check if image exists (for future optimization)
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Generate placeholder based on card data if no image available
export const generateCardPlaceholder = (cardName: string, emoji: string): string => {
  // For now, we'll use a data URL with the emoji as fallback
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#4a6741');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);
    
    // Emoji in center
    ctx.font = '120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(emoji, 200, 350);
    
    // Card name at bottom
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(cardName, 200, 550);
  }
  
  return canvas.toDataURL();
};