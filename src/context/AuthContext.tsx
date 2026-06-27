"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  username: string | null;
  usernameLoading: boolean;
  setUsername: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  username: null,
  usernameLoading: true,
  setUsername: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsernameState] = useState<string | null>(null);
  const [usernameLoading, setUsernameLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setUsernameState(null);
        setLoading(false);
        setUsernameLoading(false);
        return;
      }
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        setUsernameState(snap.data().username);
      } else {
        setUsernameState(null);
      }
      setLoading(false);
      setUsernameLoading(false);
    });
    return () => unsub();
  }, []);

  async function setUsername(name: string) {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      username: name,
      usernameLower: name.toLowerCase(),
      createdAt: serverTimestamp(),
    });
    setUsernameState(name);
  }

  return (
    <AuthContext.Provider value={{ user, loading, username, usernameLoading, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
