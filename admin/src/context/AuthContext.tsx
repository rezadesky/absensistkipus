import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/auth';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/api/client';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          if (response.data.role !== 'admin') {
            throw new Error('Akses ditolak. Hanya administrator yang dapat mengakses Admin Web.');
          }
          setUser(response.data);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
        } else {
          throw new Error('Gagal memvalidasi sesi');
        }
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const response = await authApi.login(email, password);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login gagal.');
    }

    const { user: authUser, token: authToken } = response.data;

    // Strict Admin Role Check on Backend Verified User
    if (authUser.role !== 'admin') {
      throw new Error('Akses ditolak. Akun Anda (' + authUser.role + ') tidak memiliki hak akses Administrator.');
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    setToken(authToken);

    return authUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
        await authApi.logout();
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data));
      }
    } catch {
      // Keep existing state if offline
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
