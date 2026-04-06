import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FirebaseService, isDemoMode } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing demo session
    if (isDemoMode) {
      const saved = localStorage.getItem('pray4me_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Refresh user data from demo storage
        FirebaseService.getUser(parsed.id).then(u => {
          if (u) {
            setUser(u);
            localStorage.setItem('pray4me_current_user', JSON.stringify(u));
          }
        });
      }
      setLoading(false);
      return;
    }

    // Firebase auth state listener
    const { auth } = require('../services/firebase');
    const { onAuthStateChanged } = require('firebase/auth');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let appUser = await FirebaseService.getUser(firebaseUser.uid);
        if (!appUser) {
          appUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Muslim',
            photoURL: firebaseUser.photoURL,
            duasMadeCount: 0,
            duasRequestedCount: 0,
            joinedAt: Date.now(),
            authProvider: 'google'
          };
          await FirebaseService.createOrUpdateUser(appUser);
        }
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    try {
      const result = await FirebaseService.signInWithGoogle();
      if (isDemoMode) {
        setUser(result);
        localStorage.setItem('pray4me_current_user', JSON.stringify(result));
      }
      return result;
    } catch (err) {
      console.error('Sign in failed:', err);
      throw err;
    }
  }, []);

  const logOut = useCallback(async () => {
    await FirebaseService.signOut();
    setUser(null);
    localStorage.removeItem('pray4me_current_user');
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const updated = await FirebaseService.getUser(user.id);
    if (updated) {
      setUser(updated);
      if (isDemoMode) {
        localStorage.setItem('pray4me_current_user', JSON.stringify(updated));
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
