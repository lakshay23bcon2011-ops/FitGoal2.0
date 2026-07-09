import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  goal: string;
  targetCalories: number;
  // ... other fields
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('fitgoal_token');
      const storedUser = await SecureStore.getItemAsync('fitgoal_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Optionally verify token with backend
        try {
           const response = await api.get('/auth/me');
           if (response.data.success) {
             setUser(response.data.data);
             await SecureStore.setItemAsync('fitgoal_user', JSON.stringify(response.data.data));
           }
        } catch (err) {
           console.log('Token verification failed', err);
           await logout();
        }
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    await SecureStore.setItemAsync('fitgoal_token', newToken);
    await SecureStore.setItemAsync('fitgoal_user', JSON.stringify(userData));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('fitgoal_token');
    await SecureStore.deleteItemAsync('fitgoal_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
