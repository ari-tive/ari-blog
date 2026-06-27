"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function LikeButton({ postId, initialCount }: { postId: string; initialCount: number }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [showAuthMsg, setShowAuthMsg] = useState(false);

  useEffect(() => {
    if (!user) {
      setLiked(false);
      return;
    }
    const ref = doc(db, "posts", postId, "likes", user.uid);
    getDoc(ref).then((snap) => setLiked(snap.exists()));
  }, [user, postId]);

  async function toggle() {
    if (!user) {
      setShowAuthMsg(true);
      setTimeout(() => setShowAuthMsg(false), 2000);
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const ref = doc(db, "posts", postId, "likes", user.uid);
      const postRef = doc(db, "posts", postId);
      if (liked) {
        await deleteDoc(ref);
        await updateDoc(postRef, { likeCount: increment(-1) });
        setLiked(false);
        setCount((c) => c - 1);
      } else {
        await setDoc(ref, { userId: user.uid, createdAt: new Date() });
        await updateDoc(postRef, { likeCount: increment(1) });
        setLiked(true);
        setCount((c) => c + 1);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={toggle}
        disabled={loading}
        title={liked ? "Unlike" : "Like"}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm ${
          liked
            ? "border-white/30 bg-white/10 text-foreground"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
        } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.03] cursor-pointer"}`}
      >
        <Heart size={18} className={liked ? "fill-current" : ""} />
        <span>{count}</span>
      </button>
      {showAuthMsg && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap z-10">
          You need to sign in to use this
        </div>
      )}
    </div>
  );
}
