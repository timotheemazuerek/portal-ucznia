import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Auth, User, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase-config'; // Path to your firebase-config.ts

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithEmail?: (email: string, pass: string) => Promise<User | null>; // Placeholder for TischnerID
  loginWithGoogle?: () => Promise<User | null>; // Example social login
  logout?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  // Placeholder for TischnerID email/password login
  const loginWithEmail = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(userCredential.user);
      setLoading(false);
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in with email and password", error);
      setLoading(false);
      // Consider how to propagate error to UI
      return null;
    }
  };

  // Example Google Login
  const loginWithGoogle = async (): Promise<User | null> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setCurrentUser(userCredential.user);
      setLoading(false);
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in with Google", error);
      setLoading(false)
      return null;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null); // Explicitly set to null
      setLoading(false);
    } catch (error) {
      console.error("Error signing out", error);
      setLoading(false);
      // Consider how to propagate error to UI
    }
  };

  const value = {
    currentUser,
    loading,
    loginWithEmail,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
