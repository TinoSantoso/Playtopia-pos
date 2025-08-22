import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'owner@playground.com',
    password: 'owner123',
    name: 'Owner Admin',
    role: 'owner'
  },
  {
    id: '2',
    email: 'manager@playground.com',
    password: 'manager123',
    name: 'Manager Smith',
    role: 'manager'
  },
  {
    id: '3',
    email: 'cashier@playground.com',
    password: 'cashier123',
    name: 'Cashier Jones',
    role: 'cashier'
  },
  {
    id: '4',
    email: 'supervisor@playground.com',
    password: 'super123',
    name: 'Supervisor Brown',
    role: 'supervisor'
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('playground_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('playground_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('playground_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to check permissions
export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    owner: 4,
    manager: 3,
    supervisor: 2,
    cashier: 1
  };

  const userLevel = roleHierarchy[userRole];
  const minRequiredLevel = Math.min(...requiredRoles.map(role => roleHierarchy[role]));
  
  return userLevel >= minRequiredLevel;
};