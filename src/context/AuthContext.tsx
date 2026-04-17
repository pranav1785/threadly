"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type User,
} from "@/lib/firebase";
import type { UserProfile, RetailerProfile, UserRole } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  retailerProfile: RetailerProfile | null;
  role: UserRole | null;
  loading: boolean;
  signInWithGoogle: (role: UserRole) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [retailerProfile, setRetailerProfile] = useState<RetailerProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (u: User) => {
    try {
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        setRole(data.role);
        if (data.role === "retailer") {
          const rSnap = await getDoc(doc(db, "retailers", u.uid));
          if (rSnap.exists()) setRetailerProfile(rSnap.data() as RetailerProfile);
        }
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await fetchProfile(u);
      else { setProfile(null); setRole(null); setRetailerProfile(null); }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const createUserProfile = async (u: User, role: UserRole, name?: string) => {
    const profile: UserProfile = {
      uid: u.uid,
      email: u.email!,
      displayName: name || u.displayName || "User",
      photoURL: u.photoURL || undefined,
      role,
      createdAt: new Date(),
      preferences: [],
    };
    await setDoc(doc(db, "users", u.uid), { ...profile, createdAt: serverTimestamp() }, { merge: true });
    setProfile(profile);
    setRole(role);
  };

  const signInWithGoogle = async (selectedRole: UserRole) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      const snap = await getDoc(doc(db, "users", u.uid));
      if (!snap.exists()) {
        await createUserProfile(u, selectedRole);
      } else {
        await fetchProfile(u);
      }
      toast.success("Welcome to Threadly!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign in failed";
      toast.error(msg);
      throw e;
    }
  };

  const signInEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign in failed";
      toast.error(msg);
      throw e;
    }
  };

  const signUpEmail = async (email: string, password: string, name: string, selectedRole: UserRole) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user, selectedRole, name);
      toast.success("Account created! Welcome to Threadly!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign up failed";
      toast.error(msg);
      throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setRole(null);
    setRetailerProfile(null);
    toast.success("Signed out");
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, retailerProfile, role, loading,
      signInWithGoogle, signInEmail, signUpEmail, logout, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
