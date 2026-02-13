import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { clearApolloCache } from '../config/apolloClient';

// Types
export interface User {
  id: number;
  cedula: string;
  nombre: string;
  email: string;
  rol: 'CLIENTE' | 'REPARTIDOR' | 'SUPERVISOR' | 'GERENTE' | 'ADMIN';
  zoneId?: string;
  fleetType?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  role: string;
  zone_id?: string;
  fleet_type?: string;
}

interface JwtPayload {
  role?: string;
  sub?: string;
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (cedula: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Decode JWT payload (without verification)
function decodeJwt(token: string): JwtPayload {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = useCallback(async (cedula: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    try {
      // Use proxy to avoid CORS issues
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cedula, password }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Credenciales inválidas');
      }

      const responseText = await res.text();
      let accessToken: string;
      let role: string;
      let zoneId: string | undefined;
      let fleetType: string | undefined;

      // Try to parse as JSON first, fallback to plain token
      try {
        const data = JSON.parse(responseText) as AuthResponse;
        accessToken = data.access_token;
        role = data.role;
        zoneId = data.zone_id;
        fleetType = data.fleet_type;
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
          setRefreshToken(data.refresh_token);
        }
      } catch {
        // Response is plain token, decode JWT to get role
        accessToken = responseText.trim();
        const payload = decodeJwt(accessToken);
        role = payload.role || 'CLIENTE';
      }
      
      // Store token
      localStorage.setItem('token', accessToken);
      setToken(accessToken);

      // Create user object
      const userData: User = {
        id: 1,
        cedula,
        nombre: getRoleName(role),
        email: `${role.toLowerCase()}@logiflow.com`,
        rol: role as User['rol'],
        zoneId,
        fleetType,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      setIsLoading(false);
      throw err; // Propagar el error para que LoginPage lo maneje
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    clearApolloCache();
  }, []);

  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.rol);
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper
function getRoleName(role: string): string {
  const names: Record<string, string> = {
    CLIENTE: 'Cliente',
    REPARTIDOR: 'Repartidor',
    SUPERVISOR: 'Supervisor',
    GERENTE: 'Gerente',
    ADMIN: 'Administrador',
  };
  return names[role] || role;
}

export default AuthContext;
