"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'buyer' | 'seller' | null;

interface RoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isRoleSelected: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load role from localStorage on mount (client-side only)
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('userRole') as UserRole;
      if (savedRole) {
        setUserRole(savedRole);
      }
    }
  }, [isClient]);

  // Save role to localStorage when it changes (client-side only)
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      if (userRole) {
        localStorage.setItem('userRole', userRole);
      } else {
        localStorage.removeItem('userRole');
      }
    }
  }, [userRole, isClient]);

  const isRoleSelected = userRole !== null;

  return (
    <RoleContext.Provider value={{ userRole, setUserRole, isRoleSelected }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
