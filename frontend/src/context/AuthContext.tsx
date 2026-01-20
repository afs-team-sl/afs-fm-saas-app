import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  tenantId: string | null;
  role: string | null;
  userId: string | null; // <--- අලුතින් එක් කළා
  login: (token: string, tenantId: string, role: string, userId: string) => void; // <--- parameters 4ක්
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [tenantId, setTenantId] = useState<string | null>(localStorage.getItem('tenant_id'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('user_id')); // <--- අලුතින් එක් කළා

  const login = (newToken: string, newTenantId: string, newRole: string, newUserId: string) => {
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('tenant_id', newTenantId);
    localStorage.setItem('user_role', newRole);
    localStorage.setItem('user_id', newUserId); // <--- ලෝකල් සේව් කරනවා
    
    setToken(newToken);
    setTenantId(newTenantId);
    setRole(newRole);
    setUserId(newUserId);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setTenantId(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, tenantId, role, userId, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};