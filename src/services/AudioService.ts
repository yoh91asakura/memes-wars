// AudioService - Professional game audio system
// Handles sound effects, music, audio feedback with Web Audio API

export type SoundEffect = 
  | 'roll_single' | 'roll_ten' | 'roll_epic' | 'roll_legendary'
  | 'card_draw' | 'card_equip' | 'card_remove' | 'deck_shuffle'
  | 'combat_start' | 'combat_hit' | 'combat_victory' | 'combat_defeat'
  | 'reward_coins' | 'reward_tickets' | 'reward_level_up'
  | 'ui_click' | 'ui_hover' | 'ui_error' | 'ui_success'
  | 'transition_whoosh' | 'sparkle_magic' | 'explosion_big'
  | 'achievement_unlock' | 'stage_complete' | 'boss_appear';

export type MusicTrack = 
  | 'menu_theme' | 'roll_ambient' | 'combat_theme' | 'victory_fanfare';

export interface AudioSettings {
  masterVolume: number;
  soundEffectsVolume: number;
  musicVolume: number;
  enabled: boolean;
  muteWhenInactive: boolean;
}

export interface AudioContext {
  context: AudioContext;
  masterGain: GainNode;
  sfxGain: GainNode;
  musicGain: GainNode;
}

export class AudioService {
  private audioContext: AudioContext | null = null;
  private audioNodes: AudioContext | null = null;
  private soundBuffers: Map<SoundEffect, AudioBuffer> = new Map();
  private musicBuffers: Map<MusicTrack, AudioBuffer> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private currentMusic: AudioBufferSourceNode | null = null;
  private settings: AudioSettings = {
    masterVolume: 0.7,
    soundEffectsVolume: 0.8,
    musicVolume: 0.4,
    enabled: true,
    muteWhenInactive: false
  };

  // Procedural sound generation patterns
  private static readonly SOUND_PATTERNS = {
    roll_single: { freq: 440, duration: 0.3, type: 'pluck' },
    roll_ten: { freq: 523, duration: 0.8, type: 'cascade' },
    roll_epic: { freq: 659, duration: 1.0, type: 'magic' },
    roll_legendary: { freq: 880, duration: 1.5, type: 'divine' },
    card_draw: { freq: 330, duration: 0.2, type: 'swipe' },
    card_equip: { freq: 494, duration: 0.4, type: 'lock' },
    card_remove: { freq: 277, duration: 0.3, type: 'release' },
    deck_shuffle: { freq: 196, duration: 0.6, type: 'shuffle' },
    combat_start: { freq: 220, duration: 2.0, type: 'horn' },
    combat_hit: { freq: 660, duration: 0.1, type: 'impact' },
    combat_victory: { freq: 523, duration: 2.5, type: 'fanfare' },
    combat_defeat: { freq: 147, duration: 1.5, type: 'decline' },
    reward_coins: { freq: 698, duration: 0.8, type: 'sparkle' },
    reward_tickets: { freq: 587, duration: 0.5, type: 'ding' },
    reward_level_up: { freq: 880, duration: 2.0, type: 'ascend' },
    ui_click: { freq: 800, duration: 0.1, type: 'click' },
    ui_hover: { freq: 600, duration: 0.05, type: 'soft' },
    ui_error: { freq: 200, duration: 0.5, type: 'buzz' },
    ui_success: { freq: 500, duration: 0.3, type: 'chime' },
    transition_whoosh: { freq: 300, duration: 0.7, type: 'sweep' },
    sparkle_magic: { freq: 1200, duration: 0.4, type: 'sparkle' },
    explosion_big: { freq: 100, duration: 1.0, type: 'explosion' },
    achievement_unlock: { freq: 440, duration: 3.0, type: 'celebration' },
    stage_complete: { freq: 659, duration: 1.8, type: 'triumph' },
    boss_appear: { freq: 110, duration: 2.5, type: 'ominous' }
  };

  /**
   * Initialize audio system
   */
  public async initialize(): Promise<boolean> {
    try {
      // Create Web Audio Context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create audio nodes
      this.audioNodes = {
        context: this.audioContext,
        masterGain: this.audioContext.createGain(),
        sfxGain: this.audioContext.createGain(),
        musicGain: this.audioContext.createGain()
      };

      // Connect audio graph
      this.audioNodes.sfxGain.connect(this.audioNodes.masterGain);
      this.audioNodes.musicGain.connect(this.audioNodes.masterGain);
      this.audioNodes.masterGain.connect(this.audioContext.destination);

      // Apply initial settings
      this.updateVolume();

      // Generate procedural sound buffers
      await this.generateSoundEffects();

      // Load settings from localStorage
      this.loadSettings();

      // Handle page visibility for muting
      this.setupVisibilityHandling();

      console.log('AudioService initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioService:', error);
      return false;
    }
  }

  /**
   * Play sound effect
   */
  public playSFX(effect: SoundEffect, options: {
    volume?: number;
    pitch?: number;
    delay?: number;
  } = {}): void {
    if (!this.isEnabled() || !this.audioNodes || !this.audioContext) return;

    try {
      const buffer = this.soundBuffers.get(effect);
      if (!buffer) {
        // Generate sound on-demand if not cached
        this.generateSingleSound(effect).then(() => {
          this.playSFX(effect, options);
        });
        return;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioNodes.sfxGain);

      // Apply options
      const volume = (options.volume ?? 1) * this.settings.soundEffectsVolume;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

      if (options.pitch) {
        source.playbackRate.setValueAtTime(options.pitch, this.audioContext.currentTime);
      }

      const startTime = this.audioContext.currentTime + (options.delay ?? 0);
      source.start(startTime);

      // Track active sources
      this.activeSources.add(source);
      source.onended = () => {
        this.activeSources.delete(source);
      };

    } catch (error) {
      console.error('Failed to play sound effect:', error);
    }
  }

  /**
   * Play background music
   */
  public playMusic(track: MusicTrack, options: {
    loop?: boolean;
    fadeIn?: number;
    volume?: number;
  } = {}): void {
    if (!this.isEnabled() || !this.audioNodes || !this.audioContext) return;

    try {
      // Stop current music
      this.stopMusic(options.fadeIn ? options.fadeIn : 0);

      const buffer = this.musicBuffers.get(track);
      if (!buffer) {
        console.warn(`Music track not found: ${track}`);
        return;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.loop = options.loop ?? true;
      source.connect(gainNode);
      gainNode.connect(this.audioNodes.musicGain);

      // Set initial volume for fade-in
      const targetVolume = (options.volume ?? 1) * this.settings.musicVolume;
      if (options.fadeIn) {
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(targetVolume, this.audioContext.currentTime + options.fadeIn);
      } else {
        gainNode.gain.setValueAtTime(targetVolume, this.audioContext.currentTime);
      }

      source.start();
      this.currentMusic = source;

    } catch (error) {
      console.error('Failed to play music:', error);
    }
  }

  /**
   * Stop background music
   */
  public stopMusic(fadeOut: number = 0.5): void {
    if (!this.currentMusic || !this.audioContext) return;

    try {
      if (fadeOut > 0) {
        const gainNode = this.currentMusic.gain || this.audioNodes?.musicGain;
        if (gainNode) {
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOut);
        }
        setTimeout(() => {
          this.currentMusic?.stop();
          this.currentMusic = null;
        }, fadeOut * 1000);
      } else {
        this.currentMusic.stop();
        this.currentMusic = null;
      }
    } catch (error) {
      console.error('Failed to stop music:', error);
    }
  }

  /**
   * Generate procedural sound effects using Web Audio API
   */
  private async generateSoundEffects(): Promise<void> {
    if (!this.audioContext) return;

    const promises = Object.entries(AudioService.SOUND_PATTERNS).map(async ([effect, pattern]) => {
      try {
        const buffer = await this.generateSoundBuffer(pattern);
        this.soundBuffers.set(effect as SoundEffect, buffer);
      } catch (error) {
        console.error(`Failed to generate sound for ${effect}:`, error);
      }
    });

    await Promise.all(promises);
    console.log(`Generated ${this.soundBuffers.size} procedural sound effects`);
  }

  /**
   * Generate single sound buffer
   */
  private async generateSoundBuffer(pattern: any): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const duration = pattern.duration;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    switch (pattern.type) {
      case 'pluck':
        this.generatePluckSound(data, pattern, sampleRate);
        break;
      case 'cascade':
        this.generateCascadeSound(data, pattern, sampleRate);
        break;
      case 'magic':
        this.generateMagicSound(data, pattern, sampleRate);
        break;
      case 'divine':
        this.generateDivineSound(data, pattern, sampleRate);
        break;
      case 'impact':
        this.generateImpactSound(data, pattern, sampleRate);
        break;
      case 'fanfare':
        this.generateFanfareSound(data, pattern, sampleRate);
        break;
      case 'sparkle':
        this.generateSparkleSound(data, pattern, sampleRate);
        break;
      case 'celebration':
        this.generateCelebrationSound(data, pattern, sampleRate);
        break;
      default:
        this.generateBasicTone(data, pattern, sampleRate);
    }

    return buffer;
  }

  /**
   * Generate various procedural sound types
   */
  private generatePluckSound(data: Float32Array, pattern: any, sampleRate: number): void {
    const freq = pattern.freq;
    const decay = 0.95;
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-5 * t);
      const sine = Math.sin(2 * Math.PI * freq * t);
      data[i] = sine * envelope * 0.3;
    }
  }

  private generateCascadeSound(data: Float32Array, pattern: any, sampleRate: number): void {
    const baseFreq = pattern.freq;
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const progress = t / pattern.duration;
      
      // Multiple frequencies cascading down
      let sample = 0;
      for (let n = 0; n < 5; n++) {
        const delay = n * 0.1;
        if (t > delay) {
          const freq = baseFreq * (1 + n * 0.2);
          const localT = t - delay;
          const envelope = Math.exp(-8 * localT);
          sample += Math.sin(2 * Math.PI * freq * localT) * envelope * 0.15;
        }
      }
      data[i] = sample;
    }
  }

  private generateMagicSound(data: Float32Array, pattern: any, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-2 * t) * (1 + 0.5 * Math.sin(10 * t));
      
      // Multiple harmonics with slight detuning
      let sample = 0;
      sample += Math.sin(2 * Math.PI * pattern.freq * t) * 0.4;
      sample += Math.sin(2 * Math.PI * pattern.freq * 1.5 * t) * 0.2;
      sample += Math.sin(2 * Math.PI * pattern.freq * 2.1 * t) * 0.15;
      
      data[i] = sample * envelope;
    }
  }

  private generateDivineSound(data: Float32Array, pattern: any, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-1.5 * t) * (1 + 0.3 * Math.sin(5 * t));
      
      // Rich harmonic content
      let sample = 0;
      sample += Math.sin(2 * Math.PI * pattern.freq * t) * 0.3;
      sample += Math.sin(2 * Math.PI * pattern.freq * 2 * t) * 0.2;
      sample += Math.sin(2 * Math.PI * pattern.freq * 3 * t) * 0.1;
      sample += Math.sin(2 * Math.PI * pattern.freq * 4 * t) * 0.05;
      
      // Add shimmer
      sample += Math.sin(2 * Math.PI * pattern.freq * 8 * t) * 0.1 * Math.sin(20 * t);
      
      data[i] = sample * envelope;
    }
  }

  private generateImpactSound(data: Float32Array, pattern: any, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-20 * t);
      
      // Low frequency thump with noise
      const noise = (Math.random() - 0.5) * 0.5;
      const thump = Math.sin(2 * Math.PI * pattern.freq * t);
      
      data[i] = (thump + noise) * envelope * 0.8;
    }
  }

  private generateFanfareSound(data: Float32Array, pattern: any, sampleRate: number): void {
    const notes = [1, 5/4, 3/2, 2]; // Major chord progression
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const progress = t / pattern.duration;
      const envelope = Math.exp(-0.8 * t) * (1 + 0.2 * Math.sin(8 * t));
      
      let sample = 0;
      notes.forEach((ratio, index) => {
        const delay = index * 0.2;
        if (t > delay) {
          const freq = pattern.freq * ratio;
          const localT = t - delay;
          sample += Math.sin(2 * Math.PI * freq * localT) * 0.25;
        }
      });
      
      data[i] = sample * envelope;
    }
  }

  private generateSparkleSound(data: Float32Array, pattern: any, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Multiple brief tones with random timing
      let sample = 0;
      const sparkles = 8;
      
      for (let s = 0; s < sparkles; s++) {
        const sparkleTime = (s / sparkles) * pattern.duration;
        const timeDiff = Math.abs(t - sparkleTime);
        
        if (timeDiff < 0.05) {
          const localT = timeDiff;
          const freq = pattern.freq * (1 + Math.random() * 0.5);
          const envelope = Math.exp(-50 * localT);
          sample += Math.sin(2 * Math.PI * freq * localT) * envelope * 0.3;
        }
      }
      
      data[i] = sample;
    }
  }

  private generateCelebrationSound(data: Float32Array, pattern: any, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const progress = t / pattern.duration;
      
      // Rising melody with harmonics
      const pitch = 1 + progress * 0.5; // Rise in pitch
      const envelope = Math.exp(-1 * t) * (1 + 0.4 * Math.sin(12 * t));
      
      let sample = 0;
      sample += Math.sin(2 * Math.PI * pattern.freq * pitch * t) * 0.4;
      sample += Math.sin(2 * Math.PI * pattern.freq * pitch * 1.5 * t) * 0.2;
      sample += Math.sin(2 * Math.PI * pattern.freq * pitch * 2 * t) * 0.1;
      
      // Add sparkle overlay
      if (Math.random() < 0.02) {
        sample += (Math.random() - 0.5) * 0.3;
      }
      
      data[i] = sample * envelope;
    }
  }

  private generateBasicTone(data: Float32Array, pattern: any, sampleRate: number): void {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-3 * t);
      const sine = Math.sin(2 * Math.PI * pattern.freq * t);
      data[i] = sine * envelope * 0.5;
    }
  }

  /**
   * Generate single sound on demand
   */
  private async generateSingleSound(effect: SoundEffect): Promise<void> {
    const pattern = AudioService.SOUND_PATTERNS[effect];
    if (!pattern) return;

    try {
      const buffer = await this.generateSoundBuffer(pattern);
      this.soundBuffers.set(effect, buffer);
    } catch (error) {
      console.error(`Failed to generate sound for ${effect}:`, error);
    }
  }

  /**
   * Update volume settings
   */
  private updateVolume(): void {
    if (!this.audioNodes) return;

    this.audioNodes.masterGain.gain.setValueAtTime(
      this.settings.masterVolume, 
      this.audioContext?.currentTime || 0
    );
    this.audioNodes.sfxGain.gain.setValueAtTime(
      this.settings.soundEffectsVolume, 
      this.audioContext?.currentTime || 0
    );
    this.audioNodes.musicGain.gain.setValueAtTime(
      this.settings.musicVolume, 
      this.audioContext?.currentTime || 0
    );
  }

  /**
   * Audio settings management
   */
  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.updateVolume();
    this.saveSettings();
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private saveSettings(): void {
    localStorage.setItem('audio-settings', JSON.stringify(this.settings));
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('audio-settings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
        this.updateVolume();
      } catch (error) {
        console.error('Failed to load audio settings:', error);
      }
    }
  }

  /**
   * Utility methods
   */
  public isEnabled(): boolean {
    return this.settings.enabled && !!this.audioContext;
  }

  public stopAllSounds(): void {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        // Source might already be stopped
      }
    });
    this.activeSources.clear();
    
    this.stopMusic();
  }

  private setupVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (this.settings.muteWhenInactive) {
        if (document.hidden) {
          this.audioNodes?.masterGain.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
        } else {
          this.updateVolume();
        }
      }
    });
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.stopAllSounds();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.soundBuffers.clear();
    this.musicBuffers.clear();
    this.activeSources.clear();
    this.audioContext = null;
    this.audioNodes = null;
  }
}

export default AudioService;