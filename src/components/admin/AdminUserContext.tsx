'use client';

import { createContext, useContext, ReactNode } from 'react';
import { UserRole } from '@prisma/client';

interface AdminUserContextType {
  userId: string;
  userRole: UserRole;
}

const AdminUserContext = createContext<AdminUserContextType | null>(null);

export function AdminUserProvider({ 
  children, 
  userId, 
  userRole 
}: { 
  children: ReactNode; 
  userId: string; 
  userRole: UserRole;
}) {
  return (
    <AdminUserContext.Provider value={{ userId, userRole }}>
      {children}
    </AdminUserContext.Provider>
  );
}

export function useAdminUser() {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error('useAdminUser must be used within AdminUserProvider');
  }
  return context;
}

