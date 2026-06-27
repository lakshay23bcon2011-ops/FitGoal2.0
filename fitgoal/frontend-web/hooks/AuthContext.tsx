'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../utils/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  goal: 'bulk' | 'cut' | 'maintain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWater: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<UserProfile> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('fitgoal_token');
        const storedUser = localStorage.getItem('fitgoal_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token against backend /me
          try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
              const freshUser = res.data.data;
              setUser(freshUser);
              localStorage.setItem('fitgoal_user', JSON.stringify(freshUser));
            }
          } catch (err) {
            console.error('Failed to verify token on boot:', err);
            // If the endpoint fails with auth, it gets caught in interceptor and removes token
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Route protection
  useEffect(() => {
    if (!loading) {
      const publicPaths = ['/login', '/register'];
      const isPublicPath = publicPaths.includes(pathname || '');

      if (!token && !isPublicPath) {
        router.push('/login');
      } else if (token && isPublicPath) {
        router.push('/');
      }
    }
  }, [token, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: loggedUser } = res.data.data;
        localStorage.setItem('fitgoal_token', token);
        localStorage.setItem('fitgoal_user', JSON.stringify(loggedUser));
        setToken(token);
        setUser(loggedUser);
        router.push('/');
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<UserProfile> & { password: string }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { token, user: registeredUser } = res.data.data;
        localStorage.setItem('fitgoal_token', token);
        localStorage.setItem('fitgoal_user', JSON.stringify(registeredUser));
        setToken(token);
        setUser(registeredUser);
        router.push('/');
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fitgoal_token');
    localStorage.removeItem('fitgoal_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        const updatedUser = res.data.data;
        localStorage.setItem('fitgoal_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        throw new Error(res.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
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
