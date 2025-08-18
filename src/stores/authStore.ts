/**
 * Store d'authentification pour Meme Wars
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types temporaires pour éviter les erreurs d'import
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

// interface LoginResponse {
//   user: User;
//   token: string;
//   expiresIn: number;
//   permissions: string[];
// } // Commented out to avoid unused interface warning

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  permissions: string[];
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  showLogin: () => void;
  showRegister: () => void;
  hideModals: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  showLoginModal: false,
  showRegisterModal: false,
  permissions: [],
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      login: async (email: string) => {
        set({ isLoading: true });
        try {
          // TODO: Implement actual login
          console.log('Login:', { email });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          // TODO: Implement actual register
          console.log('Register:', userData);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({
          user: null,
          isAuthenticated: false,
          permissions: [],
          showLoginModal: false,
          showRegisterModal: false,
        });
      },

      checkAuth: async () => {
        set({ isInitialized: true });
      },

      showLogin: () => {
        set({ showLoginModal: true, showRegisterModal: false });
      },

      showRegister: () => {
        set({ showRegisterModal: true, showLoginModal: false });
      },

      hideModals: () => {
        set({ showLoginModal: false, showRegisterModal: false });
      },
    }),
    {
      name: 'meme-wars-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
);
