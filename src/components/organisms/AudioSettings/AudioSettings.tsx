// AudioSettings - UI component for managing game audio
import React, { useState, useEffect } from 'react';
import { Button } from '../../atoms/Button';
import { Text } from '../../atoms/Text';
import { useAudio } from '../../../hooks/useAudio';
import type { AudioSettings as AudioSettingsType } from '../../../services/AudioService';
import './AudioSettings.css';

export interface AudioSettingsProps {
  className?: string;
  onClose?: () => void;
  testId?: string;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  className = '',
  onClose,
  testId = 'audio-settings'
}) => {
  const { updateSettings, getSettings, playSFX, isEnabled, isInitialized } = useAudio();
  const [settings, setSettings] = useState<AudioSettingsType>(getSettings());

  // Sync with audio service settings
  useEffect(() => {
    setSettings(getSettings());
  }, [getSettings]);

  const handleSettingChange = (key: keyof AudioSettingsType, value: number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettings({ [key]: value });

    // Play feedback sound for volume changes
    if (key === 'soundEffectsVolume' && typeof value === 'number' && value > 0) {
      playSFX('ui_success', { volume: value });
    }
  };

  const handleTestSound = () => {
    playSFX('ui_success');
  };

  const handleResetSettings = () => {
    const defaultSettings: AudioSettingsType = {
      masterVolume: 0.7,
      soundEffectsVolume: 0.8,
      musicVolume: 0.4,
      enabled: true,
      muteWhenInactive: false
    };
    
    setSettings(defaultSettings);
    updateSettings(defaultSettings);
    playSFX('ui_click');
  };

  if (!isInitialized) {
    return (
      <div className={`audio-settings loading ${className}`} data-testid={testId}>
        <div className="audio-settings-content">
          <Text variant="h3" className="settings-title">Audio Settings</Text>
          <div className="loading-message">
            <Text>Initializing audio system...</Text>
          </div>
          <div className="setting-group">
            <div className="setting-item">
              <div className="setting-label">
                <Text variant="body" weight="medium">Enable Audio</Text>
                <Text variant="caption" color="muted">
                  Audio system is loading...
                </Text>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <Text variant="body" weight="medium">Master Volume</Text>
                <Text variant="caption" color="muted">
                  Please wait...
                </Text>
              </div>
              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={0.7}
                  disabled={true}
                  className="volume-slider"
                  data-testid="master-volume-slider"
                />
                <Text variant="caption" className="volume-value">
                  70%
                </Text>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <Text variant="body" weight="medium">Sound Effects</Text>
                <Text variant="caption" color="muted">
                  Loading...
                </Text>
              </div>
              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={0.8}
                  disabled={true}
                  className="volume-slider"
                  data-testid="sfx-volume-slider"
                />
                <Text variant="caption" className="volume-value">
                  80%
                </Text>
              </div>
            </div>
          </div>
          {onClose && (
            <Button 
              onClick={onClose} 
              variant="secondary" 
              size="sm"
              data-testid="close-audio-settings"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`audio-settings ${className}`} data-testid={testId}>
      <div className="audio-settings-content">
        {/* Header */}
        <div className="settings-header">
          <Text variant="h3" className="settings-title">Audio Settings</Text>
          <div className="audio-status">
            <span className={`status-indicator ${isEnabled ? 'enabled' : 'disabled'}`}>
              {isEnabled ? '🔊' : '🔇'}
            </span>
            <Text variant="caption" color="muted">
              {isEnabled ? 'Audio Enabled' : 'Audio Disabled'}
            </Text>
          </div>
        </div>

        {/* Main Toggle */}
        <div className="setting-group">
          <div className="setting-item">
            <div className="setting-label">
              <Text variant="body" weight="medium">Enable Audio</Text>
              <Text variant="caption" color="muted">
                Turn game audio on or off
              </Text>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                data-testid="enable-audio-toggle"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Volume Controls */}
        {settings.enabled && (
          <div className="setting-group">
            <Text variant="h4" className="group-title">Volume Controls</Text>
            
            {/* Master Volume */}
            <div className="setting-item">
              <div className="setting-label">
                <Text variant="body" weight="medium">Master Volume</Text>
                <Text variant="caption" color="muted">
                  Overall audio level ({Math.round(settings.masterVolume * 100)}%)
                </Text>
              </div>
              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.masterVolume}
                  onChange={(e) => handleSettingChange('masterVolume', parseFloat(e.target.value))}
                  className="volume-slider"
                  data-testid="master-volume-slider"
                />
                <Text variant="caption" className="volume-value">
                  {Math.round(settings.masterVolume * 100)}%
                </Text>
              </div>
            </div>

            {/* Sound Effects Volume */}
            <div className="setting-item">
              <div className="setting-label">
                <Text variant="body" weight="medium">Sound Effects</Text>
                <Text variant="caption" color="muted">
                  UI clicks, combat sounds, rewards ({Math.round(settings.soundEffectsVolume * 100)}%)
                </Text>
              </div>
              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.soundEffectsVolume}
                  onChange={(e) => handleSettingChange('soundEffectsVolume', parseFloat(e.target.value))}
                  className="volume-slider"
                  data-testid="sfx-volume-slider"
                />
                <Text variant="caption" className="volume-value">
                  {Math.round(settings.soundEffectsVolume * 100)}%
                </Text>
                <Button 
                  onClick={handleTestSound}
                  variant="secondary" 
                  size="sm"
                  className="test-sound-btn"
                  data-testid="test-sound-button"
                >
                  🔊 Test
                </Button>
              </div>
            </div>

            {/* Music Volume */}
            <div className="setting-item">
              <div className="setting-label">
                <Text variant="body" weight="medium">Background Music</Text>
                <Text variant="caption" color="muted">
                  Ambient music and themes ({Math.round(settings.musicVolume * 100)}%)
                </Text>
              </div>
              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.musicVolume}
                  onChange={(e) => handleSettingChange('musicVolume', parseFloat(e.target.value))}
                  className="volume-slider"
                  data-testid="music-volume-slider"
                />
                <Text variant="caption" className="volume-value">
                  {Math.round(settings.musicVolume * 100)}%
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Additional Options */}
        {settings.enabled && (
          <div className="setting-group">
            <Text variant="h4" className="group-title">Options</Text>
            
            <div className="setting-item">
              <div className="setting-label">
                <Text variant="body" weight="medium">Mute When Inactive</Text>
                <Text variant="caption" color="muted">
                  Automatically mute audio when tab is in background
                </Text>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.muteWhenInactive}
                  onChange={(e) => handleSettingChange('muteWhenInactive', e.target.checked)}
                  data-testid="mute-inactive-toggle"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="settings-actions">
          <Button 
            onClick={handleResetSettings}
            variant="secondary"
            size="sm"
            data-testid="reset-audio-settings"
          >
            🔄 Reset to Default
          </Button>
          
          {onClose && (
            <Button 
              onClick={onClose} 
              variant="primary"
              size="sm"
              data-testid="close-audio-settings"
            >
              ✅ Done
            </Button>
          )}
        </div>

        {/* Audio Info */}
        <div className="audio-info">
          <Text variant="caption" color="muted">
            🎵 Using Web Audio API for procedural sound generation
          </Text>
          {!isEnabled && (
            <Text variant="caption" color="warning">
              ⚠️ Audio is disabled. Enable to hear game sounds.
            </Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;