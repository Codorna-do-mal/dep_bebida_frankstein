import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, testConnection, retryConnection } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'gestor' | 'funcionario';
  auth_user_id?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  connectionError: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  clearConnectionError: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      connectionError: false,

      checkConnection: async () => {
        const connected = await testConnection();
        set({ connectionError: !connected });
        
        if (!connected) {
          // Try to reconnect
          const reconnected = await retryConnection();
          set({ connectionError: !reconnected });
          return reconnected;
        }
        
        return true;
      },

      clearConnectionError: () => {
        set({ connectionError: false });
      },

      login: async (email: string, password: string) => {
        set({ loading: true, connectionError: false });
        
        try {
          // Check connection first
          const connected = await get().checkConnection();
          if (!connected) {
            set({ loading: false });
            return { success: false, error: 'Erro de conexão com o banco de dados. Verifique sua conexão com a internet.' };
          }

          // Authenticate with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            set({ loading: false });
            return { success: false, error: authError.message };
          }

          if (!authData.user) {
            set({ loading: false });
            return { success: false, error: 'Falha na autenticação' };
          }

          // Get user data from our users table
          let { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .single();

          if (userError || !userData) {
            // If user doesn't exist in our table, try to find by email
            const { data: userByEmail, error: emailError } = await supabase
              .from('users')
              .select('*')
              .eq('email', email)
              .single();

            if (emailError || !userByEmail) {
              await supabase.auth.signOut();
              set({ loading: false });
              return { success: false, error: 'Usuário não encontrado no sistema' };
            }

            // Update the user record with auth_user_id
            const { error: updateError } = await supabase
              .from('users')
              .update({ auth_user_id: authData.user.id })
              .eq('id', userByEmail.id);

            if (updateError) {
              console.error('Error updating user auth_user_id:', updateError);
            }

            userData = userByEmail;
          }

          // Check if user is active
          if (!userData.is_active) {
            await supabase.auth.signOut();
            set({ loading: false });
            return { success: false, error: 'Usuário inativo. Entre em contato com o administrador.' };
          }

          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            auth_user_id: userData.auth_user_id || authData.user.id,
          };

          set({ 
            isAuthenticated: true, 
            user, 
            loading: false,
            connectionError: false
          });

          return { success: true };
        } catch (error: any) {
          console.error('Login error:', error);
          set({ loading: false });
          
          // Check if it's a connection error
          if (error.message?.includes('Failed to fetch') || 
              error.message?.includes('NetworkError')) {
            set({ connectionError: true });
            return { success: false, error: 'Erro de conexão com o banco de dados. Verifique sua conexão com a internet.' };
          }
          
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro interno do servidor' 
          };
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ isAuthenticated: false, user: null, connectionError: false });
      },

      checkAuth: async () => {
        try {
          // Check connection first
          const connected = await get().checkConnection();
          if (!connected) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            set({ isAuthenticated: false, user: null, connectionError: false });
            return;
          }

          // Get user data from our users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          if (error || !userData || !userData.is_active) {
            await supabase.auth.signOut();
            set({ isAuthenticated: false, user: null, connectionError: false });
            return;
          }

          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            auth_user_id: userData.auth_user_id,
          };

          set({ isAuthenticated: true, user, connectionError: false });
        } catch (error: any) {
          console.error('Auth check error:', error);
          
          // Check if it's a connection error
          if (error.message?.includes('Failed to fetch') || 
              error.message?.includes('NetworkError')) {
            set({ connectionError: true });
          }
          
          set({ isAuthenticated: false, user: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user 
      }),
    }
  )
);

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const { checkAuth } = useAuthStore.getState();
  
  if (event === 'SIGNED_OUT' || !session) {
    useAuthStore.setState({ isAuthenticated: false, user: null, connectionError: false });
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await checkAuth();
  }
});