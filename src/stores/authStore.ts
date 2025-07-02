import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'gestor' | 'funcionario';
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

// Sample users for demo purposes
const SAMPLE_USERS = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@deposito.com',
    password: 'admin123',
    role: 'gestor' as const,
  },
  {
    id: '2',
    name: 'Funcionário',
    email: 'funcionario@deposito.com',
    password: 'func123',
    role: 'funcionario' as const,
  },
];

// Function to verify credentials
export const verifyCredentials = (email: string, password: string) => {
  const user = SAMPLE_USERS.find(
    (user) => user.email === email && user.password === password
  );
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);