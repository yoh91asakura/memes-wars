import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardManagementStore, cardManagementSelectors } from '../../../stores/CardManagementStore';
import { useCardFiltersStore, cardFiltersSelectors } from '../../../stores/CardFiltersStore';
import { CardGrid } from '../../organisms/CardGrid';
import { CardFilters } from '../../molecules/CardFilters';
import { FilterControls } from '../../molecules/FilterControls';
import { ImageUploader } from '../../molecules/ImageUploader';
import { CardPreview } from '../../molecules/CardPreview';
import { SyncIndicator } from '../../molecules/SyncIndicator';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Modal } from '../../atoms/Modal';
import { Tooltip } from '../../atoms/Tooltip';
import { Card } from '../../../models/Card';
import { CardImage } from '../../../models/CardImage';
import { UploadResult } from '../../../services/ImageUploadService';
import { SyncStatus } from '../../../models/SyncStatus';
import './CardManagementPage.css';

interface CardManagementPageProps {
  playerId: string;
  className?: string;
  testId?: string;
}

type ModalState = 'none' | 'filters' | 'upload' | 'preview' | 'stats' | 'settings';

export const CardManagementPage: React.FC<CardManagementPageProps> = ({
  playerId,
  className = '',
  testId
}) => {
  // Store hooks
  const cardStore = useCardManagementStore();
  const filtersStore = useCardFiltersStore();
  
  // Local state
  const [modalState, setModalState] = useState<ModalState>('none');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [customImages, setCustomImages] = useState<CardImage[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs for keyboard shortcuts
  const pageRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Memoized selectors
  const collection = cardStore.currentCollection;
  const filteredCards = cardStore.filteredCards;
  const loading = cardManagementSelectors.getIsLoading(cardStore);
  const hasError = cardManagementSelectors.getHasError(cardStore);
  const selectedCards = cardManagementSelectors.getSelectedCards(cardStore);
  const statistics = cardStore.statistics;
  const currentFilters = filtersStore.currentFilters;
  const hasActiveFilters = filtersStore.hasActiveFilters();
  const filterCount = filtersStore.getFilterCount();

  // Mock sync status for now
  const mockSyncStatus: SyncStatus = {
    playerId,
    status: 'idle',
    pendingChanges: 0,
    conflicts: [],
    lastSync: new Date().toISOString(),
    lastError: null,
    currentOperation: null,
    conflictResolutionStrategy: 'client'
  };

  // Initialize data
  useEffect(() => {
    if (playerId && playerId !== cardStore.currentPlayerId) {
      cardStore.setPlayerId(playerId);
      cardStore.loadCollection(playerId);
      cardStore.loadStatistics(playerId);
      filtersStore.loadPresets();
    }
  }, [playerId, cardStore, filtersStore]);

  // Apply filters when they change
  useEffect(() => {
    if (Object.keys(currentFilters).length > 0) {
      // Here we would normally apply filters to the card list
      // For now, we'll just use the existing filtered cards
      console.log('Applying filters:', currentFilters);
    }
  }, [currentFilters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't handle shortcuts when modal is open or input is focused
      if (modalState !== 'none' || document.activeElement?.tagName === 'INPUT') {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'f':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            searchInputRef.current?.focus();
          }
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleRefresh();
          }
          break;
        case 'escape':
          event.preventDefault();
          cardStore.clearSelection();
          setSelectedCard(null);
          break;
        case '1':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            cardStore.setViewMode('grid');
          }
          break;
        case '2':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            cardStore.setViewMode('list');
          }
          break;
        case '3':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            cardStore.setViewMode('gallery');
          }
          break;
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleSelectAll();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [modalState, cardStore]);

  // Handlers
  const handleCardClick = useCallback((card: Card) => {
    setSelectedCard(card);
    if (cardStore.selection.selectionMode !== 'none') {
      cardStore.selectCard(card.id);
    }
  }, [cardStore]);

  const handleCardDoubleClick = useCallback((card: Card) => {
    setSelectedCard(card);
    setModalState('preview');
  }, []);

  const handleRefresh = useCallback(async () => {
    await cardStore.reloadCollection();
    await cardStore.refreshStatistics();
  }, [cardStore]);

  const handleSelectAll = useCallback(() => {
    const visibleCardIds = filteredCards.map(card => card.id);
    cardStore.selectMultipleCards(visibleCardIds);
  }, [filteredCards, cardStore]);

  const handleFiltersChange = useCallback((filters: any) => {
    filtersStore.setFilters(filters);
  }, [filtersStore]);

  const handleSearchSubmit = useCallback(async (searchTerm: string) => {
    const startTime = performance.now();
    
    try {
      await cardStore.searchCards(playerId, searchTerm);
      const executionTime = performance.now() - startTime;
      const resultCount = cardStore.searchResult?.totalMatches || 0;
      
      // Add to filter history
      filtersStore.addToHistory({ searchText: searchTerm }, resultCount, executionTime);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [playerId, cardStore, filtersStore]);

  const handleUploadComplete = useCallback((result: UploadResult) => {
    console.log('Upload completed:', result);
    // Refresh the card that was updated
    if (selectedCard) {
      cardStore.refreshCard(selectedCard.id);
    }
    setModalState('none');
  }, [selectedCard, cardStore]);

  const handleUploadError = useCallback((error: Error) => {
    console.error('Upload failed:', error);
    cardStore.setError(`Upload failed: ${error.message}`);
  }, [cardStore]);

  const handleSyncTrigger = useCallback(async () => {
    // Mock sync for now
    console.log('Sync triggered');
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // View configuration
  const viewConfig = useMemo(() => ({
    showFilters: !sidebarCollapsed,
    showStats: statistics !== null,
    enableVirtualization: filteredCards.length > 100,
    compactMode: sidebarCollapsed
  }), [sidebarCollapsed, statistics, filteredCards.length]);

  if (loading && !collection) {
    return (
      <div className="card-management-page card-management-page--loading">
        <div className="card-management-page__loading">
          <Icon name="loader" size="xl" className="card-management-page__spinner" />
          <Text variant="h4">Loading Collection...</Text>
          <Text variant="body" color="muted">Please wait while we fetch your cards</Text>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="card-management-page card-management-page--error">
        <div className="card-management-page__error">
          <Icon name="alert-circle" size="xl" color="error" />
          <Text variant="h4" color="error">Failed to Load Collection</Text>
          <Text variant="body" color="muted">{cardStore.loading.error}</Text>
          <Button variant="primary" onClick={handleRefresh}>
            <Icon name="refresh-cw" size="sm" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={pageRef}
      className={`card-management-page ${isFullscreen ? 'card-management-page--fullscreen' : ''} ${className}`.trim()}
      data-testid={testId}
    >
      {/* Header */}
      <header className="card-management-page__header">
        <div className="card-management-page__title">
          <div className="card-management-page__title-content">
            <Text variant="h2" weight="bold">Card Management</Text>
            <div className="card-management-page__subtitle">
              <Text variant="subtitle" color="muted">
                {collection?.cards.length || 0} cards
                {hasActiveFilters && ` • ${filteredCards.length} filtered`}
                {filterCount > 0 && ` • ${filterCount} filter${filterCount !== 1 ? 's' : ''}`}
              </Text>
            </div>
          </div>
          
          {selectedCards.length > 0 && (
            <div className="card-management-page__selection-info">
              <Text variant="subtitle" weight="medium">
                {selectedCards.length} selected
              </Text>
              <Button variant="ghost" size="sm" onClick={cardStore.clearSelection}>
                <Icon name="x" size="sm" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Header Actions */}
        <div className="card-management-page__header-actions">
          <Tooltip content="Toggle filters sidebar">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className={sidebarCollapsed ? 'card-management-page__action--active' : ''}
            >
              <Icon name="sidebar" size="sm" />
            </Button>
          </Tooltip>
          
          <Tooltip content="Collection statistics">
            <Button variant="ghost" size="sm" onClick={() => setModalState('stats')}>
              <Icon name="bar-chart" size="sm" />
              Stats
            </Button>
          </Tooltip>
          
          <Tooltip content="Upload custom image">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalState('upload')}
              disabled={!selectedCard}
            >
              <Icon name="upload" size="sm" />
              Upload
            </Button>
          </Tooltip>
          
          <Tooltip content="Refresh collection">
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading}>
              <Icon name="refresh-cw" size="sm" className={loading ? 'spinning' : ''} />
              Refresh
            </Button>
          </Tooltip>
          
          <Tooltip content="Toggle fullscreen">
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              <Icon name={isFullscreen ? "minimize" : "maximize"} size="sm" />
            </Button>
          </Tooltip>
        </div>
      </header>

      {/* Main Content */}
      <div className="card-management-page__content">
        {/* Sidebar */}
        <AnimatePresence>
          {viewConfig.showFilters && (
            <motion.aside
              className="card-management-page__sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-management-page__sidebar-content">
                {/* Filters */}
                <div className="card-management-page__filters-section">
                  <CardFilters
                    onFiltersChange={handleFiltersChange}
                    initialFilters={currentFilters}
                    presets={filtersStore.presets}
                    compactMode={viewConfig.compactMode}
                  />
                </div>

                {/* Filter Controls */}
                <div className="card-management-page__filter-controls-section">
                  <FilterControls
                    presets={filtersStore.presets}
                    activePresetId={filtersStore.activePresetId}
                    currentFilters={currentFilters}
                    onPresetSelect={filtersStore.applyPreset}
                    onPresetSave={filtersStore.savePreset}
                    onPresetUpdate={filtersStore.updatePreset}
                    onPresetDelete={filtersStore.deletePreset}
                    onPresetDuplicate={(preset) => filtersStore.savePreset(preset)}
                  />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <main className="card-management-page__main">
          <CardGrid
            cards={filteredCards}
            loading={loading}
            onCardClick={handleCardClick}
            searchable={true}
            enableVirtualization={viewConfig.enableVirtualization}
            variant="collection"
            cardSize={cardStore.view.cardSize}
            className="card-management-page__grid"
          />
        </main>
      </div>

      {/* Sync Indicator */}
      <SyncIndicator
        syncStatus={mockSyncStatus}
        onSyncTrigger={handleSyncTrigger}
        variant="floating"
        position="bottom-right"
        showDetailedStatus={true}
      />

      {/* Modals */}
      
      {/* Upload Modal */}
      <Modal
        isOpen={modalState === 'upload'}
        onClose={() => setModalState('none')}
        title="Upload Custom Image"
        size="md"
      >
        {selectedCard && (
          <ImageUploader
            cardId={selectedCard.id}
            playerId={playerId}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={modalState === 'preview'}
        onClose={() => setModalState('none')}
        title="Card Preview"
        size="lg"
      >
        {selectedCard && (
          <CardPreview
            card={selectedCard}
            customImages={customImages}
            onImageUpload={() => setModalState('upload')}
            variant="modal"
          />
        )}
      </Modal>

      {/* Statistics Modal */}
      <Modal
        isOpen={modalState === 'stats'}
        onClose={() => setModalState('none')}
        title="Collection Statistics"
        size="md"
      >
        {statistics && (
          <div className="card-management-page__stats">
            <div className="card-management-page__stat-grid">
              <div className="card-management-page__stat-item">
                <Text variant="h3" weight="bold">{statistics.totalCards}</Text>
                <Text variant="caption" color="muted">Total Cards</Text>
              </div>
              
              <div className="card-management-page__stat-item">
                <Text variant="h3" weight="bold">{statistics.averageLuck.toFixed(1)}</Text>
                <Text variant="caption" color="muted">Average Luck</Text>
              </div>
              
              <div className="card-management-page__stat-item">
                <Text variant="h3" weight="bold">{statistics.completionPercentage.toFixed(1)}%</Text>
                <Text variant="caption" color="muted">Collection Complete</Text>
              </div>
            </div>
            
            <div className="card-management-page__rarity-breakdown">
              <Text variant="h5" weight="semibold">Rarity Breakdown</Text>
              {Object.entries(statistics.byRarity).map(([rarity, count]) => (
                <div key={rarity} className="card-management-page__rarity-item">
                  <Text variant="body">{rarity}</Text>
                  <Text variant="body" weight="medium">{count}</Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Keyboard Shortcuts Help */}
      <div className="card-management-page__shortcuts-hint">
        <Text variant="caption" color="muted">
          Press ? for keyboard shortcuts
        </Text>
      </div>
    </div>
  );
};

export default CardManagementPage;