import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardFilterCriteria, FilterPreset } from '../../../models/CardFilter';
import { FilterPresetFactory } from '../../../models/CardFilter';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Input } from '../../atoms/Input';
import { Checkbox } from '../../atoms/Checkbox';
import { Select } from '../../atoms/Select';
import { RangeSlider } from '../../atoms/RangeSlider';
import './CardFilters.css';

interface CardFiltersProps {
  onFiltersChange: (filters: CardFilterCriteria) => void;
  initialFilters?: CardFilterCriteria;
  availableRarities?: string[];
  availableTypes?: string[];
  availableFamilies?: string[];
  presets?: FilterPreset[];
  showPresets?: boolean;
  compactMode?: boolean;
  className?: string;
  testId?: string;
}

export const CardFilters: React.FC<CardFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
  availableRarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic', 'Divine', 'Infinity', 'Beyond'],
  availableTypes = ['Meme', 'Reaction', 'Template', 'Format', 'Meta'],
  availableFamilies = ['Animal', 'People', 'Cartoon', 'Gaming', 'Tech', 'Sports', 'Food', 'Music'],
  presets = [],
  showPresets = true,
  compactMode = false,
  className = '',
  testId
}) => {
  const [isExpanded, setIsExpanded] = useState(!compactMode);
  const [activeFilters, setActiveFilters] = useState<CardFilterCriteria>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Default presets if none provided
  const defaultPresets = useMemo(() => {
    if (presets.length > 0) return presets;
    
    return [
      FilterPresetFactory.createDefault('all', 'All Cards', 'Show all cards'),
      FilterPresetFactory.createDefault('rare', 'Rare & Above', 'Show Rare, Epic, Legendary, and higher rarity cards'),
      FilterPresetFactory.createDefault('favorites', 'Favorites', 'Show only favorited cards'),
      FilterPresetFactory.createDefault('recent', 'Recently Added', 'Show cards added in the last 7 days')
    ];
  }, [presets]);

  // Apply preset
  const applyPreset = useCallback((preset: FilterPreset) => {
    setActiveFilters(preset.criteria);
    setActivePreset(preset.id);
    onFiltersChange(preset.criteria);
  }, [onFiltersChange]);

  // Update filters
  const updateFilters = useCallback((updates: Partial<CardFilterCriteria>) => {
    const newFilters = { ...activeFilters, ...updates };
    setActiveFilters(newFilters);
    setActivePreset(null); // Clear preset when manual changes made
    onFiltersChange(newFilters);
  }, [activeFilters, onFiltersChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const emptyFilters: CardFilterCriteria = {};
    setActiveFilters(emptyFilters);
    setActivePreset(null);
    onFiltersChange(emptyFilters);
  }, [onFiltersChange]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== undefined && value !== null;
    });
  }, [activeFilters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilters.searchText?.trim()) count++;
    if (activeFilters.rarity?.length) count++;
    if (activeFilters.type?.length) count++;
    if (activeFilters.family?.length) count++;
    if (activeFilters.costRange) count++;
    if (activeFilters.favorite !== undefined) count++;
    if (activeFilters.locked !== undefined) count++;
    return count;
  }, [activeFilters]);

  // Handle search text change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    updateFilters({ searchText: value });
  }, [updateFilters]);

  // Handle multi-select changes
  const handleMultiSelectChange = useCallback((field: keyof CardFilterCriteria, values: string[]) => {
    updateFilters({ [field]: values });
  }, [updateFilters]);

  // Handle cost range change
  const handleCostRangeChange = useCallback((min: number, max: number) => {
    updateFilters({ costRange: { min, max } });
  }, [updateFilters]);

  // Sync with external filter changes
  useEffect(() => {
    if (JSON.stringify(activeFilters) !== JSON.stringify(initialFilters)) {
      setActiveFilters(initialFilters);
    }
  }, [initialFilters]);

  return (
    <div className={`card-filters ${compactMode ? 'card-filters--compact' : ''} ${className}`.trim()} data-testid={testId}>
      {/* Filter Header */}
      <div className="card-filters__header">
        <div className="card-filters__title">
          <Text variant="h4" weight="semibold">Filters</Text>
          {activeFilterCount > 0 && (
            <div className="card-filters__badge">
              <Text variant="caption" color="white">{activeFilterCount}</Text>
            </div>
          )}
        </div>

        <div className="card-filters__controls">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="card-filters__clear"
            >
              <Icon name="close" size="sm" />
              Clear
            </Button>
          )}
          
          {compactMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="card-filters__toggle"
            >
              <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size="sm" />
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="card-filters__content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Presets */}
            {showPresets && defaultPresets.length > 0 && (
              <div className="card-filters__section">
                <Text variant="subtitle" weight="medium" className="card-filters__section-title">
                  Quick Filters
                </Text>
                <div className="card-filters__presets">
                  {defaultPresets.map(preset => (
                    <Button
                      key={preset.id}
                      variant={activePreset === preset.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="card-filters__preset"
                    >
                      <Icon name={preset.icon || 'filter'} size="sm" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="card-filters__section">
              <Text variant="subtitle" weight="medium" className="card-filters__section-title">
                Search
              </Text>
              <Input
                placeholder="Search cards by name, description, or abilities..."
                value={activeFilters.searchText || ''}
                onChange={handleSearchChange}
                leftIcon="search"
                className="card-filters__search"
              />
            </div>

            {/* Basic Filters */}
            <div className="card-filters__section">
              <Text variant="subtitle" weight="medium" className="card-filters__section-title">
                Categories
              </Text>
              
              <div className="card-filters__grid">
                {/* Rarity Filter */}
                <div className="card-filters__field">
                  <Text variant="caption" color="muted" className="card-filters__label">
                    Rarity
                  </Text>
                  <Select
                    multiple
                    placeholder="All rarities"
                    value={activeFilters.rarity || []}
                    onChange={(values) => handleMultiSelectChange('rarity', values as string[])}
                    options={availableRarities.map(rarity => ({
                      value: rarity,
                      label: rarity
                    }))}
                    className="card-filters__select"
                  />
                </div>

                {/* Type Filter */}
                <div className="card-filters__field">
                  <Text variant="caption" color="muted" className="card-filters__label">
                    Type
                  </Text>
                  <Select
                    multiple
                    placeholder="All types"
                    value={activeFilters.type || []}
                    onChange={(values) => handleMultiSelectChange('type', values as string[])}
                    options={availableTypes.map(type => ({
                      value: type,
                      label: type
                    }))}
                    className="card-filters__select"
                  />
                </div>

                {/* Family Filter */}
                <div className="card-filters__field">
                  <Text variant="caption" color="muted" className="card-filters__label">
                    Family
                  </Text>
                  <Select
                    multiple
                    placeholder="All families"
                    value={activeFilters.family || []}
                    onChange={(values) => handleMultiSelectChange('family', values as string[])}
                    options={availableFamilies.map(family => ({
                      value: family,
                      label: family
                    }))}
                    className="card-filters__select"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="card-filters__section">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="card-filters__advanced-toggle"
              >
                <Icon name={showAdvanced ? 'chevron-up' : 'chevron-down'} size="sm" />
                Advanced Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  className="card-filters__advanced"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Cost Range */}
                  <div className="card-filters__field card-filters__field--range">
                    <Text variant="caption" color="muted" className="card-filters__label">
                      Cost Range: {activeFilters.costRange?.min || 0} - {activeFilters.costRange?.max || 10}
                    </Text>
                    <RangeSlider
                      min={0}
                      max={10}
                      value={[activeFilters.costRange?.min || 0, activeFilters.costRange?.max || 10]}
                      onChange={([min, max]) => handleCostRangeChange(min, max)}
                      className="card-filters__range-slider"
                    />
                  </div>

                  {/* Boolean Filters */}
                  <div className="card-filters__checkboxes">
                    <Checkbox
                      label="Favorites only"
                      checked={activeFilters.favorite === true}
                      onChange={(checked) => updateFilters({ favorite: checked ? true : undefined })}
                      className="card-filters__checkbox"
                    />
                    
                    <Checkbox
                      label="Exclude locked cards"
                      checked={activeFilters.locked === false}
                      onChange={(checked) => updateFilters({ locked: checked ? false : undefined })}
                      className="card-filters__checkbox"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sort Options */}
            <div className="card-filters__section">
              <Text variant="subtitle" weight="medium" className="card-filters__section-title">
                Sort
              </Text>
              <div className="card-filters__sort">
                <Select
                  placeholder="Sort by"
                  value={activeFilters.sortBy || 'name'}
                  onChange={(value) => updateFilters({ sortBy: value as 'name' | 'rarity' | 'luck' })}
                  options={[
                    { value: 'name', label: 'Name' },
                    { value: 'rarity', label: 'Rarity' },
                    { value: 'luck', label: 'Luck' },
                    { value: 'recent', label: 'Recently Added' },
                    { value: 'usage', label: 'Most Used' }
                  ]}
                  className="card-filters__sort-field"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ 
                    sortOrder: activeFilters.sortOrder === 'asc' ? 'desc' : 'asc' 
                  })}
                  className="card-filters__sort-order"
                >
                  <Icon name={activeFilters.sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} size="sm" />
                  {activeFilters.sortOrder === 'desc' ? 'Desc' : 'Asc'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardFilters;