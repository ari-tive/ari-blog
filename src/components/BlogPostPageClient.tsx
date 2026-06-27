"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import BlogPostClient from "./BlogPostClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const displayFont = { fontFamily: "'Instrument Serif', serif" };

export default function BlogPostPageClient({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const q = query(
          collection(db, "posts"),
          where("slug", "==", slug),
          limit(1)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          setPost(null);
          setLoading(false);
          return;
        }

        const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as Post;

        if (!data.visibility || data.visibility === "public") {
          setPost(data);
        } else if (user && data.allowList?.includes(user.uid)) {
          setPost(data);
        } else {
          setAccessDenied(true);
        }
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="pt-24 sm:pt-32 pb-16 px-4 max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="liquid-glass-solid p-8 rounded-2xl text-center">
          <h1
            className="text-2xl text-foreground mb-3"
            style={displayFont}
          >
            This post is private
          </h1>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have access to view this post.
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-24 sm:pt-32 pb-16 px-4 max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="liquid-glass-solid p-8 rounded-2xl text-center">
          <h1
            className="text-2xl text-foreground mb-3"
            style={displayFont}
          >
            Post not found
          </h1>
          <p className="text-sm text-muted-foreground">
            The post you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return <BlogPostClient post={post} />;
}
