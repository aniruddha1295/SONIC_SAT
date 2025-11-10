"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface RegisteredIP {
  id: string;
  name: string;
  description: string;
  cid: string;
  creator: string;
  createdAt: string;
  duration: number;
  size: number;
  tokenId?: string;
  transactionHash?: string;
}

interface IPContextType {
  registeredIPs: RegisteredIP[];
  addRegisteredIP: (ip: RegisteredIP) => void;
  removeRegisteredIP: (id: string) => void;
  getRegisteredIP: (id: string) => RegisteredIP | undefined;
}

const IPContext = createContext<IPContextType | undefined>(undefined);

export function IPProvider({ children }: { children: ReactNode }) {
  const [registeredIPs, setRegisteredIPs] = useState<RegisteredIP[]>([]);

  const addRegisteredIP = (ip: RegisteredIP) => {
    setRegisteredIPs(prev => [...prev, ip]);
    // Also save to localStorage for persistence
    const stored = localStorage.getItem('sonic-registered-ips');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('sonic-registered-ips', JSON.stringify([...existing, ip]));
  };

  const removeRegisteredIP = (id: string) => {
    setRegisteredIPs(prev => prev.filter(ip => ip.id !== id));
    // Also remove from localStorage
    const stored = localStorage.getItem('sonic-registered-ips');
    if (stored) {
      const existing = JSON.parse(stored);
      const filtered = existing.filter((ip: RegisteredIP) => ip.id !== id);
      localStorage.setItem('sonic-registered-ips', JSON.stringify(filtered));
    }
  };

  const getRegisteredIP = (id: string) => {
    return registeredIPs.find(ip => ip.id === id);
  };

  // Load from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('sonic-registered-ips');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRegisteredIPs(parsed);
      } catch (error) {
        console.error('Error loading registered IPs from localStorage:', error);
      }
    }
  }, []);

  return (
    <IPContext.Provider value={{
      registeredIPs,
      addRegisteredIP,
      removeRegisteredIP,
      getRegisteredIP
    }}>
      {children}
    </IPContext.Provider>
  );
}

export function useIP() {
  const context = useContext(IPContext);
  if (context === undefined) {
    throw new Error('useIP must be used within an IPProvider');
  }
  return context;
}
