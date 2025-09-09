// PersistenceService - Centralized data persistence management
// Handles game save/load, backup, and data integrity

import { useCurrencyStore } from '../stores/currencyStore';
import { useStageStore } from '../stores/stageStore';
import { useCardsStore } from '../stores/cardsStore';
import { usePlayerStore } from '../stores/playerStore';

export interface GameSaveData {
  version: string;
  timestamp: number;
  currencies: any;
  stages: any;
  cards: any;
  player: any;
  metadata: {
    playTime: number;
    lastSaved: number;
    gameVersion: string;
  };
}

export class PersistenceService {
  private static readonly SAVE_KEY = 'memes-wars-game-save';
  private static readonly BACKUP_KEY = 'memes-wars-backup-save';
  private static readonly VERSION = '1.0.0';

  /**
   * Save all game data to localStorage
   */
  static saveGame(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const saveData: GameSaveData = {
          version: this.VERSION,
          timestamp: Date.now(),
          currencies: useCurrencyStore.getState(),
          stages: useStageStore.getState(),
          cards: useCardsStore.getState(),
          player: usePlayerStore.getState(),
          metadata: {
            playTime: this.getPlayTime(),
            lastSaved: Date.now(),
            gameVersion: this.VERSION
          }
        };

        // Create backup of previous save
        const existingSave = localStorage.getItem(this.SAVE_KEY);
        if (existingSave) {
          localStorage.setItem(this.BACKUP_KEY, existingSave);
        }

        // Save new data
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
        
        console.log('Game saved successfully:', {
          timestamp: new Date(saveData.timestamp).toLocaleString(),
          dataSize: JSON.stringify(saveData).length
        });

        resolve(true);
      } catch (error) {
        console.error('Failed to save game:', error);
        resolve(false);
      }
    });
  }

  /**
   * Load game data from localStorage
   */
  static loadGame(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const saveDataString = localStorage.getItem(this.SAVE_KEY);
        if (!saveDataString) {
          console.log('No save data found');
          resolve(false);
          return;
        }

        const saveData: GameSaveData = JSON.parse(saveDataString);
        
        // Validate save data
        if (!this.validateSaveData(saveData)) {
          console.error('Invalid save data format');
          resolve(false);
          return;
        }

        // Load data into stores (they should handle the persistence internally)
        console.log('Game loaded successfully:', {
          version: saveData.version,
          lastSaved: new Date(saveData.metadata.lastSaved).toLocaleString(),
          playTime: this.formatPlayTime(saveData.metadata.playTime)
        });

        resolve(true);
      } catch (error) {
        console.error('Failed to load game:', error);
        
        // Attempt to load backup
        return this.loadBackup().then(resolve);
      }
    });
  }

  /**
   * Load backup save data
   */
  static loadBackup(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const backupDataString = localStorage.getItem(this.BACKUP_KEY);
        if (!backupDataString) {
          console.log('No backup data found');
          resolve(false);
          return;
        }

        const backupData: GameSaveData = JSON.parse(backupDataString);
        
        if (!this.validateSaveData(backupData)) {
          console.error('Invalid backup data format');
          resolve(false);
          return;
        }

        console.log('Backup loaded successfully:', {
          version: backupData.version,
          lastSaved: new Date(backupData.metadata.lastSaved).toLocaleString()
        });

        resolve(true);
      } catch (error) {
        console.error('Failed to load backup:', error);
        resolve(false);
      }
    });
  }

  /**
   * Export game save as downloadable file
   */
  static exportSave(): void {
    try {
      const saveData: GameSaveData = {
        version: this.VERSION,
        timestamp: Date.now(),
        currencies: useCurrencyStore.getState(),
        stages: useStageStore.getState(),
        cards: useCardsStore.getState(),
        player: usePlayerStore.getState(),
        metadata: {
          playTime: this.getPlayTime(),
          lastSaved: Date.now(),
          gameVersion: this.VERSION
        }
      };

      const dataStr = JSON.stringify(saveData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `memes-wars-save-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      console.log('Save file exported successfully');
    } catch (error) {
      console.error('Failed to export save:', error);
    }
  }

  /**
   * Import game save from file
   */
  static importSave(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const saveData: GameSaveData = JSON.parse(event.target?.result as string);
          
          if (!this.validateSaveData(saveData)) {
            console.error('Invalid imported save data');
            resolve(false);
            return;
          }

          // Create backup of current save before importing
          this.saveGame().then(() => {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            console.log('Save file imported successfully');
            resolve(true);
          });
        } catch (error) {
          console.error('Failed to parse imported save file:', error);
          resolve(false);
        }
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Clear all save data (reset game)
   */
  static clearSave(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Create final backup before clearing
        const existingSave = localStorage.getItem(this.SAVE_KEY);
        if (existingSave) {
          localStorage.setItem(`${this.BACKUP_KEY}-final`, existingSave);
        }

        localStorage.removeItem(this.SAVE_KEY);
        localStorage.removeItem(this.BACKUP_KEY);
        
        console.log('Save data cleared successfully');
        resolve(true);
      } catch (error) {
        console.error('Failed to clear save data:', error);
        resolve(false);
      }
    });
  }

  /**
   * Get save file information
   */
  static getSaveInfo(): {
    exists: boolean;
    size?: number;
    lastSaved?: Date;
    version?: string;
    playTime?: number;
  } {
    try {
      const saveDataString = localStorage.getItem(this.SAVE_KEY);
      if (!saveDataString) {
        return { exists: false };
      }

      const saveData: GameSaveData = JSON.parse(saveDataString);
      
      return {
        exists: true,
        size: saveDataString.length,
        lastSaved: new Date(saveData.metadata.lastSaved),
        version: saveData.version,
        playTime: saveData.metadata.playTime
      };
    } catch (error) {
      console.error('Failed to get save info:', error);
      return { exists: false };
    }
  }

  /**
   * Auto-save functionality (call periodically)
   */
  static autoSave(): void {
    const lastAutoSave = localStorage.getItem('last-auto-save');
    const now = Date.now();
    
    // Auto-save every 5 minutes
    if (!lastAutoSave || (now - parseInt(lastAutoSave)) > 5 * 60 * 1000) {
      this.saveGame().then(success => {
        if (success) {
          localStorage.setItem('last-auto-save', now.toString());
          console.log('Auto-save completed');
        }
      });
    }
  }

  /**
   * Validate save data structure
   */
  private static validateSaveData(data: any): data is GameSaveData {
    return (
      data &&
      typeof data === 'object' &&
      data.version &&
      data.timestamp &&
      data.currencies &&
      data.stages &&
      data.cards &&
      data.player &&
      data.metadata
    );
  }

  /**
   * Get total play time
   */
  private static getPlayTime(): number {
    const startTime = localStorage.getItem('game-start-time');
    if (!startTime) {
      localStorage.setItem('game-start-time', Date.now().toString());
      return 0;
    }
    return Date.now() - parseInt(startTime);
  }

  /**
   * Format play time for display
   */
  private static formatPlayTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

// Auto-save setup
if (typeof window !== 'undefined') {
  // Auto-save on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      PersistenceService.autoSave();
    }
  });

  // Auto-save on page unload
  window.addEventListener('beforeunload', () => {
    PersistenceService.saveGame();
  });

  // Periodic auto-save (every 5 minutes)
  setInterval(() => {
    PersistenceService.autoSave();
  }, 5 * 60 * 1000);
}

export default PersistenceService;