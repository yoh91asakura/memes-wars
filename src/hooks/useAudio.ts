// useAudio - React hook for game audio integration
import { useEffect, useRef, useCallback } from 'react';
import AudioService, { type SoundEffect, type MusicTrack, type AudioSettings } from '../services/AudioService';

interface UseAudioReturn {
  playSFX: (effect: SoundEffect, options?: { volume?: number; pitch?: number; delay?: number }) => void;
  playMusic: (track: MusicTrack, options?: { loop?: boolean; fadeIn?: number; volume?: number }) => void;
  stopMusic: (fadeOut?: number) => void;
  stopAllSounds: () => void;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  getSettings: () => AudioSettings;
  isEnabled: boolean;
  isInitialized: boolean;
}

export const useAudio = (): UseAudioReturn => {
  const audioServiceRef = useRef<AudioService | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Initialize audio service
  useEffect(() => {
    const initializeAudio = async () => {
      if (!audioServiceRef.current) {
        audioServiceRef.current = new AudioService();
        const success = await audioServiceRef.current.initialize();
        isInitializedRef.current = success;
        
        if (success) {
          console.log('Audio system initialized via useAudio hook');
        } else {
          console.warn('Audio system failed to initialize');
        }
      }
    };

    initializeAudio();

    // Cleanup on unmount
    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.dispose();
        audioServiceRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  const playSFX = useCallback((effect: SoundEffect, options?: { 
    volume?: number; 
    pitch?: number; 
    delay?: number 
  }) => {
    if (audioServiceRef.current && isInitializedRef.current) {
      audioServiceRef.current.playSFX(effect, options);
    }
  }, []);

  const playMusic = useCallback((track: MusicTrack, options?: { 
    loop?: boolean; 
    fadeIn?: number; 
    volume?: number 
  }) => {
    if (audioServiceRef.current && isInitializedRef.current) {
      audioServiceRef.current.playMusic(track, options);
    }
  }, []);

  const stopMusic = useCallback((fadeOut?: number) => {
    if (audioServiceRef.current && isInitializedRef.current) {
      audioServiceRef.current.stopMusic(fadeOut);
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    if (audioServiceRef.current && isInitializedRef.current) {
      audioServiceRef.current.stopAllSounds();
    }
  }, []);

  const updateSettings = useCallback((settings: Partial<AudioSettings>) => {
    if (audioServiceRef.current && isInitializedRef.current) {
      audioServiceRef.current.updateSettings(settings);
    }
  }, []);

  const getSettings = useCallback((): AudioSettings => {
    if (audioServiceRef.current && isInitializedRef.current) {
      return audioServiceRef.current.getSettings();
    }
    return {
      masterVolume: 0.7,
      soundEffectsVolume: 0.8,
      musicVolume: 0.4,
      enabled: true,
      muteWhenInactive: false
    };
  }, []);

  const isEnabled = audioServiceRef.current?.isEnabled() ?? false;
  const isInitialized = isInitializedRef.current;

  return {
    playSFX,
    playMusic,
    stopMusic,
    stopAllSounds,
    updateSettings,
    getSettings,
    isEnabled,
    isInitialized
  };
};

export default useAudio;