import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterPreset, CardFilterCriteria } from '../../../models/CardFilter';
import { FilterPresetFactory, FilterPresetManager } from '../../../models/CardFilter';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Input } from '../../atoms/Input';
import { Modal } from '../../atoms/Modal';
import { Tooltip } from '../../atoms/Tooltip';
import { ConfirmDialog } from '../../atoms/ConfirmDialog';
import './FilterControls.css';

interface FilterControlsProps {
  presets: FilterPreset[];
  activePresetId?: string | null;
  currentFilters: CardFilterCriteria;
  onPresetSelect: (preset: FilterPreset) => void;
  onPresetSave: (preset: FilterPreset) => void;
  onPresetUpdate: (presetId: string, updates: Partial<FilterPreset>) => void;
  onPresetDelete: (presetId: string) => void;
  onPresetDuplicate?: (preset: FilterPreset) => void;
  canCreatePresets?: boolean;
  canEditPresets?: boolean;
  canDeletePresets?: boolean;
  maxPresets?: number;
  className?: string;
  testId?: string;
}

type DialogState = 'none' | 'save' | 'edit' | 'delete';

interface SavePresetData {
  name: string;
  description: string;
  icon: string;
  isPublic: boolean;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  presets = [],
  activePresetId = null,
  currentFilters = {},
  onPresetSelect,
  onPresetSave,
  onPresetUpdate,
  onPresetDelete,
  onPresetDuplicate,
  canCreatePresets = true,
  canEditPresets = true,
  canDeletePresets = true,
  maxPresets = 20,
  className = '',
  testId
}) => {
  const [dialogState, setDialogState] = useState<DialogState>('none');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [saveData, setSaveData] = useState<SavePresetData>({
    name: '',
    description: '',
    icon: 'filter',
    isPublic: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter presets based on search
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return presets;
    
    const query = searchQuery.toLowerCase();
    return presets.filter(preset => 
      preset.name.toLowerCase().includes(query) ||
      preset.description.toLowerCase().includes(query)
    );
  }, [presets, searchQuery]);

  // Check if current filters have been modified from active preset
  const hasUnsavedChanges = useMemo(() => {
    if (!activePresetId) return Object.keys(currentFilters).length > 0;
    
    const activePreset = presets.find(p => p.id === activePresetId);
    if (!activePreset) return true;
    
    return JSON.stringify(currentFilters) !== JSON.stringify(activePreset.criteria);
  }, [activePresetId, currentFilters, presets]);

  // Get selected preset for editing
  const selectedPreset = useMemo(() => {
    return selectedPresetId ? presets.find(p => p.id === selectedPresetId) : null;
  }, [selectedPresetId, presets]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: FilterPreset) => {
    onPresetSelect(preset);
  }, [onPresetSelect]);

  // Open save dialog
  const handleSaveDialogOpen = useCallback(() => {
    setSaveData({
      name: '',
      description: '',
      icon: 'filter',
      isPublic: false
    });
    setDialogState('save');
  }, []);

  // Handle save preset
  const handleSavePreset = useCallback(() => {
    if (!saveData.name.trim()) return;
    
    const newPreset = FilterPresetFactory.create(
      saveData.name,
      saveData.description,
      currentFilters,
      saveData.icon,
      saveData.isPublic
    );
    
    onPresetSave(newPreset);
    setDialogState('none');
    setSaveData({ name: '', description: '', icon: 'filter', isPublic: false });
  }, [saveData, currentFilters, onPresetSave]);

  // Open edit dialog
  const handleEditDialogOpen = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    
    setSelectedPresetId(presetId);
    setSaveData({
      name: preset.name,
      description: preset.description,
      icon: preset.icon || 'filter',
      isPublic: preset.isPublic || false
    });
    setDialogState('edit');
  }, [presets]);

  // Handle edit preset
  const handleEditPreset = useCallback(() => {
    if (!selectedPresetId || !saveData.name.trim()) return;
    
    onPresetUpdate(selectedPresetId, {
      name: saveData.name,
      description: saveData.description,
      icon: saveData.icon,
      isPublic: saveData.isPublic
    });
    
    setDialogState('none');
    setSelectedPresetId(null);
    setSaveData({ name: '', description: '', icon: 'filter', isPublic: false });
  }, [selectedPresetId, saveData, onPresetUpdate]);

  // Open delete confirmation
  const handleDeleteDialogOpen = useCallback((presetId: string) => {
    setSelectedPresetId(presetId);
    setDialogState('delete');
  }, []);

  // Handle delete preset
  const handleDeletePreset = useCallback(() => {
    if (!selectedPresetId) return;
    
    onPresetDelete(selectedPresetId);
    setDialogState('none');
    setSelectedPresetId(null);
  }, [selectedPresetId, onPresetDelete]);

  // Handle duplicate preset
  const handleDuplicatePreset = useCallback((preset: FilterPreset) => {
    if (!onPresetDuplicate) return;
    
    const duplicatedPreset = FilterPresetFactory.duplicate(preset);
    onPresetDuplicate(duplicatedPreset);
  }, [onPresetDuplicate]);

  // Handle update active preset with current filters
  const handleUpdateActivePreset = useCallback(() => {
    if (!activePresetId) return;
    
    onPresetUpdate(activePresetId, { criteria: currentFilters });
  }, [activePresetId, currentFilters, onPresetUpdate]);

  // Available icons for presets
  const availableIcons = [
    'filter', 'star', 'heart', 'bookmark', 'tag', 'search', 'grid',
    'list', 'eye', 'zap', 'target', 'award', 'flag', 'diamond'
  ];

  return (
    <div className={`filter-controls ${className}`.trim()} data-testid={testId}>
      {/* Header */}
      <div className="filter-controls__header">
        <div className="filter-controls__title">
          <Text variant="h5" weight="semibold">Filter Presets</Text>
          <Text variant="caption" color="muted">
            {presets.length}/{maxPresets}
          </Text>
        </div>

        {/* Quick Actions */}
        <div className="filter-controls__quick-actions">
          {hasUnsavedChanges && activePresetId && canEditPresets && (
            <Tooltip content="Update current preset">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdateActivePreset}
                className="filter-controls__update-button"
              >
                <Icon name="save" size="sm" />
              </Button>
            </Tooltip>
          )}
          
          {canCreatePresets && presets.length < maxPresets && (
            <Tooltip content="Save current filters as preset">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveDialogOpen}
                disabled={Object.keys(currentFilters).length === 0}
              >
                <Icon name="plus" size="sm" />
                Save
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Search */}
      {presets.length > 5 && (
        <div className="filter-controls__search">
          <Input
            placeholder="Search presets..."
            value={searchQuery}
            onChange={setSearchQuery}
            leftIcon="search"
            size="sm"
          />
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && activePresetId && (
        <div className="filter-controls__warning">
          <Icon name="alert-triangle" size="sm" color="warning" />
          <Text variant="caption" color="warning">
            You have unsaved changes to "{presets.find(p => p.id === activePresetId)?.name}"
          </Text>
        </div>
      )}

      {/* Presets List */}
      <div className="filter-controls__list">
        <AnimatePresence>
          {filteredPresets.length === 0 ? (
            <motion.div
              key="empty"
              className="filter-controls__empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Icon name="filter" size="xl" color="muted" />
              <Text variant="body" color="muted" align="center">
                {presets.length === 0 ? 'No saved presets' : 'No presets match your search'}
              </Text>
              {presets.length === 0 && canCreatePresets && (
                <Button variant="ghost" size="sm" onClick={handleSaveDialogOpen}>
                  <Icon name="plus" size="sm" />
                  Create your first preset
                </Button>
              )}
            </motion.div>
          ) : (
            filteredPresets.map((preset) => (
              <motion.div
                key={preset.id}
                className={`filter-controls__item ${activePresetId === preset.id ? 'filter-controls__item--active' : ''}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  className="filter-controls__preset-button"
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div className="filter-controls__preset-icon">
                    <Icon name={preset.icon || 'filter'} size="sm" />
                  </div>
                  
                  <div className="filter-controls__preset-info">
                    <Text variant="subtitle" weight="medium">
                      {preset.name}
                    </Text>
                    {preset.description && (
                      <Text variant="caption" color="muted" className="filter-controls__preset-description">
                        {preset.description}
                      </Text>
                    )}
                  </div>
                  
                  {preset.isPublic && (
                    <div className="filter-controls__preset-badge">
                      <Icon name="globe" size="xs" />
                    </div>
                  )}
                </button>

                {/* Preset Actions */}
                <div className="filter-controls__preset-actions">
                  {onPresetDuplicate && (
                    <Tooltip content="Duplicate preset">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDuplicatePreset(preset)}
                      >
                        <Icon name="copy" size="xs" />
                      </Button>
                    </Tooltip>
                  )}
                  
                  {canEditPresets && !preset.isDefault && (
                    <Tooltip content="Edit preset">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEditDialogOpen(preset.id)}
                      >
                        <Icon name="edit" size="xs" />
                      </Button>
                    </Tooltip>
                  )}
                  
                  {canDeletePresets && !preset.isDefault && (
                    <Tooltip content="Delete preset">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteDialogOpen(preset.id)}
                        className="filter-controls__delete-button"
                      >
                        <Icon name="trash" size="xs" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Save/Edit Preset Modal */}
      <Modal
        isOpen={dialogState === 'save' || dialogState === 'edit'}
        onClose={() => setDialogState('none')}
        title={dialogState === 'save' ? 'Save Filter Preset' : 'Edit Filter Preset'}
        size="sm"
      >
        <div className="filter-controls__modal-content">
          <div className="filter-controls__form-field">
            <Text variant="caption" weight="medium" className="filter-controls__form-label">
              Name *
            </Text>
            <Input
              value={saveData.name}
              onChange={(value) => setSaveData(prev => ({ ...prev, name: value }))}
              placeholder="Enter preset name..."
              maxLength={50}
            />
          </div>

          <div className="filter-controls__form-field">
            <Text variant="caption" weight="medium" className="filter-controls__form-label">
              Description
            </Text>
            <Input
              value={saveData.description}
              onChange={(value) => setSaveData(prev => ({ ...prev, description: value }))}
              placeholder="Optional description..."
              maxLength={150}
            />
          </div>

          <div className="filter-controls__form-field">
            <Text variant="caption" weight="medium" className="filter-controls__form-label">
              Icon
            </Text>
            <div className="filter-controls__icon-selector">
              {availableIcons.map((iconName) => (
                <button
                  key={iconName}
                  className={`filter-controls__icon-option ${saveData.icon === iconName ? 'filter-controls__icon-option--active' : ''}`}
                  onClick={() => setSaveData(prev => ({ ...prev, icon: iconName }))}
                >
                  <Icon name={iconName} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <div className="filter-controls__form-actions">
            <Button variant="ghost" onClick={() => setDialogState('none')}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={dialogState === 'save' ? handleSavePreset : handleEditPreset}
              disabled={!saveData.name.trim()}
            >
              {dialogState === 'save' ? 'Save Preset' : 'Update Preset'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={dialogState === 'delete'}
        onClose={() => setDialogState('none')}
        onConfirm={handleDeletePreset}
        title="Delete Filter Preset"
        message={
          selectedPreset 
            ? `Are you sure you want to delete "${selectedPreset.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this preset?'
        }
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default FilterControls;