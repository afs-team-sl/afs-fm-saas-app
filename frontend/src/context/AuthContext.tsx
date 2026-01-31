import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  tenantId: string | null; // Can be null for SUPER_ADMIN
  role: string | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  login: (token: string, tenantId: string | null, role: string, userId: string, firstName: string, lastName: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [tenantId, setTenantId] = useState<string | null>(localStorage.getItem('tenant_id'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('user_id'));
  const [firstName, setFirstName] = useState<string | null>(localStorage.getItem('user_first_name'));
  const [lastName, setLastName] = useState<string | null>(localStorage.getItem('user_last_name'));

  const login = (
    newToken: string,
    newTenantId: string | null, // Allow null for SUPER_ADMIN
    newRole: string,
    newUserId: string,
    newFirstName: string,
    newLastName: string
  ) => {
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user_role', newRole);
    localStorage.setItem('user_id', newUserId);
    localStorage.setItem('user_first_name', newFirstName);
    localStorage.setItem('user_last_name', newLastName);
    
    // Handle null tenantId for SUPER_ADMIN
    if (newTenantId) {
      localStorage.setItem('tenant_id', newTenantId);
    } else {
      localStorage.removeItem('tenant_id');
    }
    
    setToken(newToken);
    setTenantId(newTenantId);
    setRole(newRole);
    setUserId(newUserId);
    setFirstName(newFirstName);
    setLastName(newLastName);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setTenantId(null);
    setRole(null);
    setUserId(null);
    setFirstName(null);
    setLastName(null);
  };

  return (
    <AuthContext.Provider value={{ token, tenantId, role, userId, firstName, lastName, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};