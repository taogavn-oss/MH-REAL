'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

export interface JwtPayload {
  sub: string;
  employeeCode: string;
  roleCode: string;
  roleId: string;
}

export interface User {
  userId: string;
  employeeCode: string;
  role: 'HQ' | 'AM' | 'SM' | 'SUB_SM';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const mapPayloadToUser = (payload: JwtPayload): User => ({
    userId: payload.sub,
    employeeCode: payload.employeeCode,
    role: payload.roleCode as User['role'],
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedToken = Cookies.get('token');
      if (storedToken) {
        try {
          const decoded = jwtDecode<JwtPayload>(storedToken);
          setUser(mapPayloadToUser(decoded));
          setToken(storedToken);
        } catch {
          Cookies.remove('token');
        }
      }
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const login = (newToken: string) => {
    Cookies.set('token', newToken, { expires: 1 }); // 1 day
    const decoded = jwtDecode<JwtPayload>(newToken);
    const mappedUser = mapPayloadToUser(decoded);
    setUser(mappedUser);
    setToken(newToken);
    
    // Role-based redirect
    switch (mappedUser.role) {
      case 'HQ': router.push('/hq/dashboard'); break;
      case 'AM': router.push('/am/dashboard'); break;
      case 'SM': 
      case 'SUB_SM': router.push('/store/dashboard'); break;
      default: router.push('/');
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
