'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { parseRegistrationNumber } from '@/lib/studentParser';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage immediately on mount
  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem('bvcec-user-email') || localStorage.getItem('nextgen-user-email');
      const storedName = localStorage.getItem('bvcec-user-name') || localStorage.getItem('nextgen-user-name');
      const storedId = localStorage.getItem('bvcec-user-id') || localStorage.getItem('nextgen-user-id');
      const storedRole = localStorage.getItem('bvcec-user-role') || localStorage.getItem('nextgen-user-role') || 'STUDENT';
      const storedRoll = localStorage.getItem('bvcec-user-roll') || localStorage.getItem('nextgen-user-studentid');
      const storedPoints = localStorage.getItem('nextgen-user-points');
      const storedSection = localStorage.getItem('bvcec-user-section') || 'CSE-A';

      if (storedEmail || storedName || storedId) {
        const parsed = storedEmail ? parseRegistrationNumber(storedEmail) : {};
        setUser({
          id: storedId,
          email: storedEmail || '',
          fullName: storedName || parsed.fullName || 'User',
          name: storedName || parsed.fullName || 'User',
          role: storedRole,
          studentId: storedRoll || parsed.studentId || '',
          rollNumber: storedRoll || parsed.rollNumber || '',
          branchName: parsed.branchName || 'Computer Science and Engineering',
          branchShort: parsed.branchShort || 'CSE',
          department: (parsed.department || 'Computer Science and Engineering').replace(/\s*\([^)]*Section[^)]*\)/gi, ''),
          batchYear: parsed.batchYear || '2029',
          section: storedSection,
          organization: parsed.college || 'Bonam Venkatachalam Engineering College',
          points: parseInt(storedPoints || '0', 10),
        });
      }
    } catch (e) {
      console.warn('UserContext initialization warning:', e);
    } finally {
      setIsLoading(false);
    }

    // Background refresh from server
    const currentId = localStorage.getItem('bvcec-user-id') || localStorage.getItem('nextgen-user-id');
    if (currentId) {
      fetch(`/api/user/me?userId=${currentId}`, { cache: 'force-cache' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && data.user) {
            const u = data.user;
            setUser((prev) => ({
              ...prev,
              ...u,
              name: u.fullName || prev?.name,
              points: u.totalPoints ?? prev?.points ?? 0,
            }));
          }
        })
        .catch(() => {});
    }
  }, []);

  const updateUser = useCallback((newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('bvcec-user-id');
      localStorage.removeItem('bvcec-user-email');
      localStorage.removeItem('bvcec-user-name');
      localStorage.removeItem('bvcec-user-role');
      localStorage.removeItem('bvcec-user-roll');
      localStorage.removeItem('bvcec-user-section');
      localStorage.removeItem('nextgen-user-id');
      localStorage.removeItem('nextgen-user-email');
      localStorage.removeItem('nextgen-user-name');
      localStorage.removeItem('nextgen-user-role');
      localStorage.removeItem('nextgen-user-points');
      setUser(null);
    } catch (e) {}
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    return { user: null, isLoading: false, updateUser: () => {}, logout: () => {} };
  }
  return context;
}

