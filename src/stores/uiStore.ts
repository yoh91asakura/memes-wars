// UI Store - Manages application UI state, modals, notifications, and navigation
// Handles all user interface state that doesn't belong to other domains

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UnifiedCard } from '../models/unified/Card';
import { createStoreMiddleware } from './middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
  createdAt: string;
}

export interface Modal {
  id: string;
  type: 'card-detail' | 'deck-builder' | 'settings' | 'confirmation' | 'achievement' | 'roll-result';
  title: string;
  data?: any;
  closable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose?: () => void;
}

export interface UIStore {
  // Navigation State
  currentPage: string;
  previousPage?: string;
  isNavigating: boolean;
  
  // Modal System
  activeModals: Modal[];
  modalHistory: string[];
  
  // Notification System
  notifications: Notification[];
  maxNotifications: number;
  
  // Loading States
  loadingStates: Record<string, boolean>;
  
  // Layout & Theme
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  
  // Component States
  cardDetailCard: UnifiedCard | null;
  searchQuery: string;
  activeTab: string;
  
  // Navigation Actions
  navigateTo: (page: string) => void;
  goBack: () => void;
  setNavigating: (navigating: boolean) => void;
  
  // Modal Actions
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  updateModal: (modalId: string, updates: Partial<Modal>) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  markNotificationAsRead: (notificationId: string) => void;
  
  // Loading Actions
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  
  // Layout Actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFullscreen: () => void;
  
  // Component Actions
  setCardDetail: (card: UnifiedCard | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  
  // Utilities
  reset: () => void;
}


export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
          // Initial state
          currentPage: 'home',
          isNavigating: false,
          activeModals: [],
          modalHistory: [],
          notifications: [],
          maxNotifications: 5,
          loadingStates: {},
          theme: 'auto',
          sidebarCollapsed: false,
          fullscreen: false,
          cardDetailCard: null,
          searchQuery: '',
          activeTab: 'collection',
          
          // Navigation Actions
          navigateTo: (page: string) => {
            const state = get();
            set({
              previousPage: state.currentPage,
              currentPage: page,
              isNavigating: true
            });
            
            // Reset navigation state after animation
            setTimeout(() => {
              set({ isNavigating: false });
            }, 300);
          },
          
          goBack: () => {
            const state = get();
            if (state.previousPage) {
              get().navigateTo(state.previousPage);
            }
          },
          
          setNavigating: (navigating: boolean) => {
            set({ isNavigating: navigating });
          },
          
          // Modal Actions
          openModal: (modalData: Omit<Modal, 'id'>) => {
            const modalId = `modal-${Date.now()}-${Math.random()}`;
            const modal: Modal = {
              ...modalData,
              id: modalId,
              closable: modalData.closable !== false,
              size: modalData.size || 'md'
            };
            
            const state = get();
            set({
              activeModals: [...state.activeModals, modal],
              modalHistory: [...state.modalHistory, modalId]
            });
            
            return modalId;
          },
          
          closeModal: (modalId: string) => {
            const state = get();
            const modal = state.activeModals.find(m => m.id === modalId);
            
            if (modal && modal.onClose) {
              modal.onClose();
            }
            
            set({
              activeModals: state.activeModals.filter(m => m.id !== modalId),
              modalHistory: state.modalHistory.filter(id => id !== modalId)
            });
          },
          
          closeAllModals: () => {
            const state = get();
            
            // Call onClose for all modals
            state.activeModals.forEach(modal => {
              if (modal.onClose) {
                modal.onClose();
              }
            });
            
            set({
              activeModals: [],
              modalHistory: []
            });
          },
          
          updateModal: (modalId: string, updates: Partial<Modal>) => {
            const state = get();
            set({
              activeModals: state.activeModals.map(modal =>
                modal.id === modalId ? { ...modal, ...updates } : modal
              )
            });
          },
          
          // Notification Actions
          addNotification: (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
            const notificationId = `notification-${Date.now()}-${Math.random()}`;
            const notification: Notification = {
              ...notificationData,
              id: notificationId,
              duration: notificationData.duration || 5000,
              persistent: notificationData.persistent || false,
              createdAt: new Date().toISOString()
            };
            
            const state = get();
            const newNotifications = [notification, ...state.notifications].slice(0, state.maxNotifications);
            
            set({ notifications: newNotifications });
            
            // Auto-remove non-persistent notifications
            if (!notification.persistent && notification.duration) {
              setTimeout(() => {
                get().removeNotification(notificationId);
              }, notification.duration);
            }
            
            return notificationId;
          },
          
          removeNotification: (notificationId: string) => {
            const state = get();
            set({
              notifications: state.notifications.filter(n => n.id !== notificationId)
            });
          },
          
          clearNotifications: () => {
            set({ notifications: [] });
          },
          
          markNotificationAsRead: (notificationId: string) => {
            // Could extend notification interface to include read status
            get().removeNotification(notificationId);
          },
          
          // Loading Actions
          setLoading: (key: string, loading: boolean) => {
            const state = get();
            set({
              loadingStates: {
                ...state.loadingStates,
                [key]: loading
              }
            });
          },
          
          isLoading: (key: string) => {
            const state = get();
            return state.loadingStates[key] || false;
          },
          
          // Layout Actions
          setTheme: (theme: 'light' | 'dark' | 'auto') => {
            set({ theme });
            
            // Apply theme to document
            if (typeof document !== 'undefined') {
              if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
              } else {
                document.documentElement.setAttribute('data-theme', theme);
              }
            }
          },
          
          toggleSidebar: () => {
            const state = get();
            set({ sidebarCollapsed: !state.sidebarCollapsed });
          },
          
          setSidebarCollapsed: (collapsed: boolean) => {
            set({ sidebarCollapsed: collapsed });
          },
          
          toggleFullscreen: () => {
            const state = get();
            const newFullscreen = !state.fullscreen;
            
            set({ fullscreen: newFullscreen });
            
            // Handle browser fullscreen API
            if (typeof document !== 'undefined') {
              if (newFullscreen) {
                document.documentElement.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
            }
          },
          
          // Component Actions
          setCardDetail: (card: UnifiedCard | null) => {
            set({ cardDetailCard: card });
          },
          
          setSearchQuery: (query: string) => {
            set({ searchQuery: query });
          },
          
          setActiveTab: (tab: string) => {
            set({ activeTab: tab });
          },
          
          // Utilities
          reset: () => {
            set({
              currentPage: 'home',
              previousPage: undefined,
              isNavigating: false,
              activeModals: [],
              modalHistory: [],
              notifications: [],
              loadingStates: {},
              theme: 'auto',
              sidebarCollapsed: false,
              fullscreen: false,
              cardDetailCard: null,
              searchQuery: '',
              activeTab: 'collection'
            });
          }
        }),
    {
      name: 'ui-store'
    }
  )
);