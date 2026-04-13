"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { StudentProfile, TrackedScholarship } from "./types";

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  tracked: TrackedScholarship[];
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (profile: StudentProfile) => Promise<void>;
  trackScholarship: (scholarshipId: string, status: TrackedScholarship["status"], notes?: string) => Promise<void>;
  removeTracked: (scholarshipId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [tracked, setTracked] = useState<TrackedScholarship[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen for auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadProfile(u.uid);
        await loadTracked(u.uid);
      } else {
        setProfile(null);
        setTracked([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loadProfile = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "profiles", uid));
      if (snap.exists()) {
        setProfile(snap.data() as StudentProfile);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const loadTracked = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "tracked", uid));
      if (snap.exists()) {
        setTracked((snap.data().scholarships || []) as TrackedScholarship[]);
      }
    } catch (err) {
      console.error("Error loading tracked:", err);
    }
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
    setTracked([]);
  };

  const saveProfile = async (p: StudentProfile) => {
    if (!user) return;
    await setDoc(doc(db, "profiles", user.uid), { ...p }, { merge: true });
    setProfile(p);
  };

  const trackScholarship = async (scholarshipId: string, status: TrackedScholarship["status"], notes?: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    const existing = tracked.find((t) => t.scholarshipId === scholarshipId);
    let updated: TrackedScholarship[];

    if (existing) {
      updated = tracked.map((t) =>
        t.scholarshipId === scholarshipId
          ? { ...t, status, dateUpdated: now, notes: notes ?? t.notes }
          : t
      );
    } else {
      updated = [
        ...tracked,
        { scholarshipId, status, dateAdded: now, dateUpdated: now, notes: notes || "" },
      ];
    }

    await setDoc(doc(db, "tracked", user.uid), { scholarships: updated });
    setTracked(updated);
  };

  const removeTracked = async (scholarshipId: string) => {
    if (!user) return;
    const updated = tracked.filter((t) => t.scholarshipId !== scholarshipId);
    await setDoc(doc(db, "tracked", user.uid), { scholarships: updated });
    setTracked(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, tracked, loading, signUp, signIn, signOut, saveProfile, trackScholarship, removeTracked }}
    >
      {children}
    </AuthContext.Provider>
  );
}
