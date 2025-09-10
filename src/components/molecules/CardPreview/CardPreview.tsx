import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../models/Card';
import { CardImage } from '../../../models/CardImage';
import { TCGCard } from '../../organisms/TCGCard';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Badge } from '../../atoms/Badge';
import { Tooltip } from '../../atoms/Tooltip';
import './CardPreview.css';

interface CardPreviewProps {
  card: Card;
  customImages?: CardImage[];
  onImageSelect?: (imageId: string | null) => void;
  onImageUpload?: () => void;
  onImageDelete?: (imageId: string) => void;
  onImageEdit?: (imageId: string) => void;
  selectedImageId?: string | null;
  showUploadButton?: boolean;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
  variant?: 'modal' | 'sidebar' | 'fullscreen';
  className?: string;
  testId?: string;
}

type ViewMode = 'card' | 'original' | 'variants';

export const CardPreview: React.FC<CardPreviewProps> = ({
  card,
  customImages = [],
  onImageSelect,
  onImageUpload,
  onImageDelete,
  onImageEdit,
  selectedImageId = null,
  showUploadButton = true,
  showDeleteButton = true,
  showEditButton = true,
  variant = 'modal',
  className = '',
  testId
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Get the primary custom image
  const primaryImage = useMemo(() => {
    if (selectedImageId) {
      return customImages.find(img => img.id === selectedImageId);
    }
    return customImages[0] || null;
  }, [customImages, selectedImageId]);

  // Get available variants for the primary image
  const availableVariants = useMemo(() => {
    if (!primaryImage?.variants) return [];
    
    return Object.entries(primaryImage.variants).map(([name, variant]) => ({
      name,
      ...variant,
      label: name.charAt(0).toUpperCase() + name.slice(1)
    }));
  }, [primaryImage]);

  // Get current display image based on view mode
  const currentImage = useMemo(() => {
    if (viewMode === 'card') return null;
    
    if (viewMode === 'original') {
      return primaryImage;
    }
    
    if (viewMode === 'variants' && selectedVariant && primaryImage?.variants) {
      return {
        ...primaryImage,
        url: primaryImage.variants[selectedVariant].url,
        dimensions: primaryImage.variants[selectedVariant].dimensions
      };
    }
    
    return primaryImage;
  }, [viewMode, primaryImage, selectedVariant]);

  // Handle image selection
  const handleImageSelect = useCallback((imageId: string | null) => {
    onImageSelect?.(imageId);
    setViewMode('card');
  }, [onImageSelect]);

  // Handle variant selection
  const handleVariantSelect = useCallback((variantName: string) => {
    setSelectedVariant(variantName);
  }, []);

  // Handle mouse move for zoom effect
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [isZoomed]);

  // Handle image download
  const handleImageDownload = useCallback(async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format dimensions
  const formatDimensions = (width: number, height: number) => `${width} × ${height}`;

  return (
    <div 
      className={`card-preview card-preview--${variant} ${className}`.trim()} 
      data-testid={testId}
    >
      {/* Header */}
      <div className="card-preview__header">
        <div className="card-preview__title">
          <Text variant="h4" weight="semibold">
            {card.name}
          </Text>
          {customImages.length > 0 && (
            <Badge variant="primary" size="sm">
              {customImages.length} custom image{customImages.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="card-preview__view-modes">
          <Button
            variant={viewMode === 'card' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('card')}
          >
            <Icon name="card" size="sm" />
            Card
          </Button>
          
          {primaryImage && (
            <>
              <Button
                variant={viewMode === 'original' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('original')}
              >
                <Icon name="image" size="sm" />
                Original
              </Button>
              
              {availableVariants.length > 0 && (
                <Button
                  variant={viewMode === 'variants' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('variants');
                    if (!selectedVariant && availableVariants[0]) {
                      setSelectedVariant(availableVariants[0].name);
                    }
                  }}
                >
                  <Icon name="layers" size="sm" />
                  Variants ({availableVariants.length})
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card-preview__content">
        <AnimatePresence mode="wait">
          {/* Card View */}
          {viewMode === 'card' && (
            <motion.div
              key="card"
              className="card-preview__card-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <TCGCard
                card={card}
                variant="detail"
                size="large"
                animated
                showStats
                showEmojis
                customImageUrl={primaryImage?.url}
                className="card-preview__tcg-card"
              />
              
              {/* Custom Images Selector */}
              {customImages.length > 0 && (
                <div className="card-preview__image-selector">
                  <Text variant="subtitle" weight="medium" className="card-preview__selector-title">
                    Custom Images
                  </Text>
                  
                  <div className="card-preview__image-options">
                    <button
                      className={`card-preview__image-option ${!selectedImageId ? 'card-preview__image-option--active' : ''}`}
                      onClick={() => handleImageSelect(null)}
                    >
                      <div className="card-preview__image-option-preview card-preview__image-option-preview--default">
                        <Icon name="image-off" size="lg" />
                      </div>
                      <Text variant="caption">Default</Text>
                    </button>
                    
                    {customImages.map((image) => (
                      <button
                        key={image.id}
                        className={`card-preview__image-option ${selectedImageId === image.id ? 'card-preview__image-option--active' : ''}`}
                        onClick={() => handleImageSelect(image.id)}
                      >
                        <div className="card-preview__image-option-preview">
                          <img src={image.url} alt={`Custom ${image.id}`} />
                        </div>
                        <Text variant="caption" className="card-preview__image-option-name">
                          {formatDimensions(image.dimensions.width, image.dimensions.height)}
                        </Text>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Image View */}
          {(viewMode === 'original' || viewMode === 'variants') && currentImage && (
            <motion.div
              key={viewMode}
              className="card-preview__image-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Variants Selector */}
              {viewMode === 'variants' && availableVariants.length > 0 && (
                <div className="card-preview__variants-selector">
                  <Text variant="subtitle" weight="medium">Image Variants</Text>
                  <div className="card-preview__variants-grid">
                    {availableVariants.map((variant) => (
                      <button
                        key={variant.name}
                        className={`card-preview__variant-option ${selectedVariant === variant.name ? 'card-preview__variant-option--active' : ''}`}
                        onClick={() => handleVariantSelect(variant.name)}
                      >
                        <div className="card-preview__variant-preview">
                          <img src={variant.url} alt={variant.label} />
                        </div>
                        <Text variant="caption">{variant.label}</Text>
                        <Text variant="caption" color="muted">
                          {formatDimensions(variant.dimensions.width, variant.dimensions.height)}
                        </Text>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Display */}
              <div 
                className={`card-preview__image-container ${isZoomed ? 'card-preview__image-container--zoomed' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <img
                  ref={imageRef}
                  src={currentImage.url}
                  alt="Preview"
                  className="card-preview__image"
                  style={isZoomed ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: 'scale(2)'
                  } : undefined}
                />
                
                {isZoomed && (
                  <div className="card-preview__zoom-indicator">
                    <Icon name="search" size="sm" />
                    <Text variant="caption">Zoom: 200%</Text>
                  </div>
                )}
              </div>

              {/* Image Info */}
              <div className="card-preview__image-info">
                <div className="card-preview__image-stats">
                  <div className="card-preview__stat">
                    <Icon name="image" size="sm" />
                    <Text variant="caption" color="muted">
                      {formatDimensions(currentImage.dimensions.width, currentImage.dimensions.height)}
                    </Text>
                  </div>
                  
                  {currentImage.fileSize && (
                    <div className="card-preview__stat">
                      <Icon name="file" size="sm" />
                      <Text variant="caption" color="muted">
                        {formatFileSize(currentImage.fileSize)}
                      </Text>
                    </div>
                  )}
                  
                  {currentImage.uploadedAt && (
                    <div className="card-preview__stat">
                      <Icon name="calendar" size="sm" />
                      <Text variant="caption" color="muted">
                        {new Date(currentImage.uploadedAt).toLocaleDateString()}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="card-preview__image-actions">
                  <Tooltip content="Download image">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleImageDownload(currentImage.url, `${card.name}-${currentImage.id}.png`)}
                    >
                      <Icon name="download" size="sm" />
                    </Button>
                  </Tooltip>
                  
                  {showEditButton && (
                    <Tooltip content="Edit image metadata">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onImageEdit?.(currentImage.id)}
                      >
                        <Icon name="edit" size="sm" />
                      </Button>
                    </Tooltip>
                  )}
                  
                  {showDeleteButton && (
                    <Tooltip content="Delete image">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onImageDelete?.(currentImage.id)}
                        className="card-preview__delete-button"
                      >
                        <Icon name="trash" size="sm" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {showUploadButton && (
        <div className="card-preview__footer">
          <Button variant="primary" onClick={onImageUpload}>
            <Icon name="upload" size="sm" />
            Upload New Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardPreview;