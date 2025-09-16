
"use client";

import { supabase } from "@/lib/supabase/client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
    if (sessionAuth === 'true') {
        setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .eq('password', password) // In a real app, password should be hashed.
        .single();
    setIsLoading(false);
    
    if (data && !error) {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAdminAuthenticated');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
