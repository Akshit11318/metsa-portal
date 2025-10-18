import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiUrl, API_ENDPOINTS } from '@/lib/api';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'core' | 'member';
  core?: string;
  year: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, year?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string, year: string = '2025') => {
        try {
          const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, year }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            set({
              user: data.data.user,
              token: data.data.token,
              isAuthenticated: true,
            });
            return true;
          } else {
            console.error('Login failed:', data.message);
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: async () => {
        const token = get().token;

        try {
          // Call logout API
          if (token) {
            await fetch(getApiUrl(API_ENDPOINTS.LOGOUT), {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear local state regardless of API call result
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },
    }),
    {
      name: 'metsa-auth-storage',
    }
  )
);
