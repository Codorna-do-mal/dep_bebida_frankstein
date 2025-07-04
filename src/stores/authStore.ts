
import { create } from 'zustand';
import { supabase, testConnection, retryConnection } from '../lib/supabase';

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

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  connectionError: false,

  checkConnection: async () => {
    const connected = await testConnection();
    set({ connectionError: !connected });
    if (!connected) {
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
      const connected = await get().checkConnection();
      if (!connected) {
        set({ loading: false });
        return { success: false, error: 'Erro de conexão com o banco de dados. Verifique sua conexão com a internet.' };
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError || !authData.user) {
        set({ loading: false });
        return { success: false, error: authError?.message || 'Falha na autenticação' };
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (userError || !userData || !userData.is_active) {
        await supabase.auth.signOut();
        set({ loading: false });
        return { success: false, error: 'Usuário não encontrado ou inativo no sistema' };
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        auth_user_id: userData.auth_user_id,
      };

      set({ isAuthenticated: true, user, loading: false, connectionError: false });
      return { success: true };

    } catch (error: any) {
      console.error('Login error:', error);
      set({ loading: false });
      return { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' };
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ isAuthenticated: false, user: null, connectionError: false });
        return;
      }

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
      set({ isAuthenticated: false, user: null });
    }
  },
}));

// Escuta eventos de alteração de auth
supabase.auth.onAuthStateChange(async (event, session) => {
  const { checkAuth, logout } = useAuthStore.getState();

  if (event === 'SIGNED_OUT' || !session) {
    await logout();
  } else if (['SIGNED_IN', 'TOKEN_REFRESHED'].includes(event)) {
    await checkAuth();
  }
});