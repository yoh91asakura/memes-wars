// SaveManager - Game save/load management interface
// Provides UI for save, load, export, import, and clear operations

import React, { useState, useRef, useEffect } from 'react';
import { PersistenceService } from '../../../services/PersistenceService';
import { Button } from '../../atoms/Button';
import './SaveManager.css';

export interface SaveManagerProps {
  className?: string;
  onSaveComplete?: (success: boolean) => void;
  onLoadComplete?: (success: boolean) => void;
  showAutoSaveStatus?: boolean;
}

export const SaveManager: React.FC<SaveManagerProps> = ({
  className = '',
  onSaveComplete,
  onLoadComplete,
  showAutoSaveStatus = true
}) => {
  const [saveInfo, setSaveInfo] = useState<any>(null);
  const [isOperating, setIsOperating] = useState(false);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load save info on component mount
  useEffect(() => {
    const loadSaveInfo = () => {
      const info = PersistenceService.getSaveInfo();
      setSaveInfo(info);
    };

    loadSaveInfo();
    
    // Update save info every 30 seconds
    const interval = setInterval(loadSaveInfo, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Monitor auto-save status
  useEffect(() => {
    if (!showAutoSaveStatus) return;

    const checkAutoSave = () => {
      const lastAutoSave = localStorage.getItem('last-auto-save');
      if (lastAutoSave) {
        const timeSinceAutoSave = Date.now() - parseInt(lastAutoSave);
        setAutoSaveStatus(timeSinceAutoSave < 10000 ? 'saved' : 'idle');
      }
    };

    checkAutoSave();
    const interval = setInterval(checkAutoSave, 5000);
    
    return () => clearInterval(interval);
  }, [showAutoSaveStatus]);

  const handleSave = async () => {
    setIsOperating(true);
    setLastOperation('Saving game...');
    
    try {
      const success = await PersistenceService.saveGame();
      setLastOperation(success ? 'Game saved successfully!' : 'Failed to save game');
      
      if (success) {
        const info = PersistenceService.getSaveInfo();
        setSaveInfo(info);
      }
      
      onSaveComplete?.(success);
    } catch (error) {
      setLastOperation('Error occurred while saving');
    } finally {
      setIsOperating(false);
      
      // Clear operation message after 3 seconds
      setTimeout(() => setLastOperation(null), 3000);
    }
  };

  const handleLoad = async () => {
    setIsOperating(true);
    setLastOperation('Loading game...');
    
    try {
      const success = await PersistenceService.loadGame();
      setLastOperation(success ? 'Game loaded successfully!' : 'No save data found');
      onLoadComplete?.(success);
    } catch (error) {
      setLastOperation('Error occurred while loading');
    } finally {
      setIsOperating(false);
      
      setTimeout(() => setLastOperation(null), 3000);
    }
  };

  const handleExport = () => {
    setLastOperation('Exporting save file...');
    PersistenceService.exportSave();
    setLastOperation('Save file downloaded!');
    
    setTimeout(() => setLastOperation(null), 3000);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsOperating(true);
    setLastOperation('Importing save file...');
    
    try {
      const success = await PersistenceService.importSave(file);
      setLastOperation(success ? 'Save file imported successfully!' : 'Failed to import save file');
      
      if (success) {
        const info = PersistenceService.getSaveInfo();
        setSaveInfo(info);
      }
    } catch (error) {
      setLastOperation('Error occurred while importing');
    } finally {
      setIsOperating(false);
      
      setTimeout(() => setLastOperation(null), 3000);
    }
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all save data? This action cannot be undone.')) {
      return;
    }

    setIsOperating(true);
    setLastOperation('Clearing save data...');
    
    try {
      const success = await PersistenceService.clearSave();
      setLastOperation(success ? 'Save data cleared successfully!' : 'Failed to clear save data');
      
      if (success) {
        setSaveInfo({ exists: false });
      }
    } catch (error) {
      setLastOperation('Error occurred while clearing save data');
    } finally {
      setIsOperating(false);
      
      setTimeout(() => setLastOperation(null), 3000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPlayTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={`save-manager ${className}`}>
      <h3>Game Save Management</h3>

      {/* Save Info Display */}
      {saveInfo?.exists && (
        <div className="save-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Last Saved:</span>
              <span className="value">{saveInfo.lastSaved?.toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="label">Save Size:</span>
              <span className="value">{formatFileSize(saveInfo.size)}</span>
            </div>
            <div className="info-item">
              <span className="label">Version:</span>
              <span className="value">{saveInfo.version}</span>
            </div>
            <div className="info-item">
              <span className="label">Play Time:</span>
              <span className="value">{formatPlayTime(saveInfo.playTime)}</span>
            </div>
          </div>
        </div>
      )}

      {!saveInfo?.exists && (
        <div className="no-save-info">
          <p>No save data found</p>
        </div>
      )}

      {/* Auto-save Status */}
      {showAutoSaveStatus && (
        <div className={`auto-save-status ${autoSaveStatus}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {autoSaveStatus === 'saving' && 'Auto-saving...'}
            {autoSaveStatus === 'saved' && 'Auto-saved'}
            {autoSaveStatus === 'idle' && 'Auto-save enabled'}
          </span>
        </div>
      )}

      {/* Operation Status */}
      {lastOperation && (
        <div className="operation-status">
          {isOperating && <div className="spinner" />}
          <span>{lastOperation}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="save-actions">
        <div className="primary-actions">
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={isOperating}
          >
            Save Game
          </Button>
          
          <Button
            onClick={handleLoad}
            variant="secondary"
            disabled={isOperating || !saveInfo?.exists}
          >
            Load Game
          </Button>
        </div>

        <div className="secondary-actions">
          <Button
            onClick={handleExport}
            variant="secondary"
            size="sm"
            disabled={!saveInfo?.exists}
          >
            Export Save
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            size="sm"
            disabled={isOperating}
          >
            Import Save
          </Button>
          
          <Button
            onClick={handleClear}
            variant="danger"
            size="sm"
            disabled={isOperating || !saveInfo?.exists}
          >
            Clear Data
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
    </div>
  );
};