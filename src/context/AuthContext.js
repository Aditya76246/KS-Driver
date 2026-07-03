import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [token, raw] = await Promise.all([
        SecureStore.getItemAsync('accessToken'),
        AsyncStorage.getItem('user'),
      ]);

      if (token && raw) {
        const parsed = JSON.parse(raw);
        setAccessToken(token);
        setUser(parsed);
        setUserRole(parsed.role ?? null);
        setIsAuthenticated(true);
      }
    } catch {
      await clearStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const clearStorage = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
      AsyncStorage.removeItem('user'),
    ]);
  };

  const login = useCallback(async ({ accessToken, refreshToken, user: userData, selectedRole }) => {
    const userWithRole = { ...userData, role: selectedRole ?? userData.role ?? null };

    await Promise.all([
      SecureStore.setItemAsync('accessToken', accessToken),
      SecureStore.setItemAsync('refreshToken', refreshToken),
      AsyncStorage.setItem('user', JSON.stringify(userWithRole)),
    ]);

    setAccessToken(accessToken);
    setUser(userWithRole);
    setUserRole(userWithRole.role);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {});
      }
    } finally {
      await clearStorage();
      setAccessToken(null);
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        userRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        setUserRole,
        // legacy aliases
        isLoggedIn: isAuthenticated,
        setIsLoggedIn: setIsAuthenticated,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
