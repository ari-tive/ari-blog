"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export default function UsernameOnboarding() {
  const { setUsername } = useAuth();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    setError("");

    if (!USERNAME_REGEX.test(trimmed)) {
      setError("3–20 characters, letters, numbers, and underscores only");
      return;
    }

    setSubmitting(true);
    try {
      const q = query(
        collection(db, "users"),
        where("usernameLower", "==", trimmed.toLowerCase())
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setError("Username already taken");
        return;
      }
      await setUsername(trimmed);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="liquid-glass-solid w-full max-w-sm p-8 animate-zoom-in-95">
        <h2
          className="text-2xl mb-2 text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Choose a username
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          This will be your identity on the site. It cannot be changed later.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="username"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={!value.trim() || submitting}
            className="w-full py-3 rounded-lg bg-white text-black text-sm font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
