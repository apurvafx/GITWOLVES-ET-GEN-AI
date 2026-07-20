import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
  token: string | null;
  role: 'admin' | 'employee' | null;
  companyId: string | null;
  username: string | null;
  companyName: string | null;
  theme: 'light';
  login: (token: string, role: 'admin' | 'employee', companyId: string, username: string, companyName: string) => void;
  logout: () => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('vigilops_token'));
  const [role, setRole] = useState<'admin' | 'employee' | null>(
    localStorage.getItem('vigilops_role') as 'admin' | 'employee' | null
  );
  const [companyId, setCompanyId] = useState<string | null>(localStorage.getItem('vigilops_company_id'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('vigilops_username'));
  const [companyName, setCompanyName] = useState<string | null>(localStorage.getItem('vigilops_company_name'));
  const theme: 'light' = 'light';

  useEffect(() => {
    // Lock HTML theme permanently to light studio mode
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.style.backgroundColor = '#e8e8e5';
    localStorage.setItem('vigilops_theme', 'light');
  }, []);

  const login = (
    newToken: string,
    newRole: 'admin' | 'employee',
    newCompanyId: string,
    newUsername: string,
    newCompanyName: string
  ) => {
    localStorage.setItem('vigilops_token', newToken);
    localStorage.setItem('vigilops_role', newRole);
    localStorage.setItem('vigilops_company_id', newCompanyId);
    localStorage.setItem('vigilops_username', newUsername);
    localStorage.setItem('vigilops_company_name', newCompanyName);

    setToken(newToken);
    setRole(newRole);
    setCompanyId(newCompanyId);
    setUsername(newUsername);
    setCompanyName(newCompanyName);
  };

  const logout = () => {
    localStorage.removeItem('vigilops_token');
    localStorage.removeItem('vigilops_role');
    localStorage.removeItem('vigilops_company_id');
    localStorage.removeItem('vigilops_username');
    localStorage.removeItem('vigilops_company_name');

    setToken(null);
    setRole(null);
    setCompanyId(null);
    setUsername(null);
    setCompanyName(null);
  };

  const toggleTheme = () => {
    // Light theme locked permanently by user choice
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        companyId,
        username,
        companyName,
        theme,
        login,
        logout,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
