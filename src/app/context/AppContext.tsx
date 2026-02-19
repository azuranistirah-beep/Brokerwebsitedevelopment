import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  demo_balance: number;
  role: string;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateBalance: (amount: number) => void;
  updateDemoBalance: (amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        // Fetch user data from server
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/user/profile`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        // Fetch user profile
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/user/profile`,
          {
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true };
        }
      }

      return { success: false, error: 'Failed to fetch user profile' };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateBalance = (amount: number) => {
    if (user) {
      setUser({ ...user, balance: user.balance + amount });
    }
  };

  const updateDemoBalance = (amount: number) => {
    if (user) {
      setUser({ ...user, demo_balance: user.demo_balance + amount });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateBalance,
        updateDemoBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
