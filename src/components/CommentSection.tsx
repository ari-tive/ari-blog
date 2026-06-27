"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, X } from "lucide-react";

const ADMIN_EMAIL = "nv2008223@gmail.com";

function formatDate(ts: { seconds: number }) {
  return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showAuthMsg, setShowAuthMsg] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment))
      );
    });
  }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setShowAuthMsg(true);
      setTimeout(() => setShowAuthMsg(false), 2000);
      return;
    }
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userName = userSnap.exists()
        ? userSnap.data().username
        : "Anonymous";
      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: user.uid,
        userName,
        userPhoto: user.photoURL || null,
        content: text.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "posts", postId), {
        commentCount: increment(1),
      });
      setText("");
    } catch {
      // fail silently
    } finally {
      setSending(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "posts", postId, "comments", deleteId));
    } catch {
      // fail silently
    } finally {
      setDeleteId(null);
    }
  }

  function canDelete(comment: Comment): boolean {
    if (!user) return false;
    if (user.email === ADMIN_EMAIL) return true;
    return comment.userId === user.uid;
  }

  return (
    <section className="mt-16">
      <h3
        className="text-2xl sm:text-3xl text-foreground mb-2"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Conversation
      </h3>
      <p className="text-sm text-muted-foreground mb-8">
        {comments.length} {comments.length === 1 ? "thought" : "thoughts"} so far
      </p>

      <form onSubmit={submit} className="mb-10 relative">
        <div className="liquid-glass-solid p-4 rounded-xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.03] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
        {showAuthMsg && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap z-10">
            You need to sign in to use this
          </div>
        )}
      </form>

      <div className="flex flex-col gap-4">
        {comments.map((c) => (
          <div key={c.id} className="liquid-glass-solid p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              {c.userPhoto ? (
                <img
                  src={c.userPhoto}
                  alt={c.userName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-foreground">
                  {c.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">
                  {c.userName}
                </p>
                {c.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </p>
                )}
              </div>
              {canDelete(c) && (
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
                  title="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {c.content}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No thoughts yet. Be the first.
          </p>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="liquid-glass-solid relative z-10 w-full max-w-sm p-8 animate-zoom-in-95">
            <button
              onClick={() => setDeleteId(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
            <h2
              className="text-xl text-foreground mb-3"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Delete this comment?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded-full border border-border text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
