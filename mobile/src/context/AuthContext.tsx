import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';
import { TOKEN_KEY, USER_KEY } from '../api/client';
import type { User } from '../types';

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Validate token with server in background
          try {
            const res = await authApi.getMe();
            if (res.success && res.data) {
              setUser(res.data);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.data));
            }
          } catch {
            // Token expired or invalid
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.warn('Error restoring mobile auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Login gagal.');
    }

    const { user: authUser, token: authToken } = res.data;

    // Mobile App is dedicated to Dosen, Tendik, and Pimpinan
    if (authUser.role === 'admin') {
      throw new Error('Akun Administrator khusus untuk Web Admin.');
    }

    await AsyncStorage.setItem(TOKEN_KEY, authToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser));

    setToken(authToken);
    setUser(authUser);

    return authUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {}

    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.data));
      }
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
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
