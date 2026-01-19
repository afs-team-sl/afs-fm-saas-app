import React, { createContext, useContext, useState } from 'react';

// 1. අපේ Context එකේ තියෙන්න ඕන දත්ත වර්ග (Types)
interface AuthContextType {
  token: string | null;
  tenantId: string | null;
  role: string | null;
  login: (token: string, tenantId: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // පද්ධතිය පටන් ගද්දීම LocalStorage එකේ තියෙන දත්ත ඇදලා ගන්නවා
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [tenantId, setTenantId] = useState<string | null>(localStorage.getItem('tenant_id'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));

  // ලොගින් වෙද්දී දත්ත 3ම සේව් කරනවා 🛡️
  const login = (newToken: string, newTenantId: string, newRole: string) => {
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('tenant_id', newTenantId);
    localStorage.setItem('user_role', newRole);
    
    setToken(newToken);
    setTenantId(newTenantId);
    setRole(newRole);
  };

  // ලොග් අවුට් වෙද්දී ඔක්කොම සුද්ධ කරනවා
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('user_role');
    
    setToken(null);
    setTenantId(null);
    setRole(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, tenantId, role, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};