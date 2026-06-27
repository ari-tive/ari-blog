"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { Post } from "@/lib/types";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import PostWizard from "./PostWizard";

const displayFont = { fontFamily: "'Instrument Serif', serif" };
const ADMIN_EMAIL = "nv2008223@gmail.com";

function formatDate(ts: Timestamp | { seconds: number }) {
  return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminClient() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin) return;
    fetchPosts();
  }, [isAdmin]);

  async function fetchPosts() {
    setLoadingPosts(true);
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post)));
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoadingPosts(false);
    }
  }

  function openCreate() {
    setEditingPost(null);
    sessionStorage.removeItem("ariblog_post_draft");
    setShowWizard(true);
    setError("");
  }

  function openEdit(post: Post) {
    setEditingPost(post);
    setShowWizard(true);
    setError("");
  }

  function closeWizard() {
    setShowWizard(false);
    setEditingPost(null);
  }

  async function handleWizardSaved() {
    closeWizard();
    await fetchPosts();
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "posts", deleteId));
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
    } catch {
      setError("Failed to delete post");
    } finally {
      setDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8">
        <h1 className="text-3xl text-foreground mb-4" style={displayFont}>
          Admin
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to access the admin panel.
        </p>
        <button
          onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
          className="px-6 py-3 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.03] transition-transform"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8">
        <h1 className="text-3xl text-foreground mb-4" style={displayFont}>
          Access Denied
        </h1>
        <p className="text-muted-foreground text-sm">
          You don&apos;t have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl sm:text-4xl text-foreground" style={displayFont}>
          Admin
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.03] transition-transform"
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {error && !showWizard && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {loadingPosts ? (
        <p className="text-muted-foreground">Loading posts...</p>
      ) : posts.length === 0 ? (
        <div className="liquid-glass-solid p-8 rounded-2xl text-center">
          <p className="text-muted-foreground">
            No posts yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="liquid-glass flex items-center justify-between p-8 gap-5"
              style={{ borderRadius: 0 }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-lg text-foreground truncate"
                    style={displayFont}
                  >
                    {post.title}
                  </h2>
                  {post.visibility === "private" && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-muted-foreground shrink-0">
                      Private
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1.5">
                  <span>/{post.slug}</span>
                  {post.createdAt && <span>{formatDate(post.createdAt)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(post)}
                  className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(post.id)}
                  className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <PostWizard
          editingPost={editingPost}
          onClose={closeWizard}
          onSaved={handleWizardSaved}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="liquid-glass-solid relative z-10 w-full max-w-sm p-8 animate-zoom-in-95">
            <h2 className="text-xl text-foreground mb-3" style={displayFont}>
              Delete this post?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone. The post and its comments will be
              permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded-full border border-border text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
