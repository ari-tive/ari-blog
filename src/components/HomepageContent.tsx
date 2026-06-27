"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  documentId,
} from "firebase/firestore";
import Hero from "@/components/Hero";
import PostsGrid from "@/components/PostsGrid";

export default function HomepageContent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [settled, setSettled] = useState(false);
  const [postsVisible, setPostsVisible] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const publicQ = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(publicQ);
        let allPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));

        allPosts = allPosts.filter((p) => {
          if (!p.visibility || p.visibility === "public") return true;
          if (!user) return false;
          return p.allowList?.includes(user.uid) ?? false;
        });

        setPosts(allPosts);
      } catch {
        setPosts([]);
      }
    }
    fetchPosts();
  }, [user]);

  useEffect(() => {
    if (sessionStorage.getItem("hero-seen")) {
      setSettled(true);
      setPostsVisible(true);
      return;
    }

    const settleTimer = setTimeout(() => {
      setSettled(true);
      sessionStorage.setItem("hero-seen", "1");
    }, 2000);
    const postsTimer = setTimeout(() => setPostsVisible(true), 2600);
    return () => {
      clearTimeout(settleTimer);
      clearTimeout(postsTimer);
    };
  }, []);

  return (
    <>
      <Hero settled={settled} />
      {posts.length > 0 && (
        <div
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: postsVisible ? 1 : 0,
            transform: postsVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <PostsGrid posts={posts} />
        </div>
      )}
      {posts.length === 0 && settled && (
        <div
          className="transition-opacity duration-700"
          style={{ opacity: postsVisible ? 1 : 0 }}
        >
          <PostsGrid posts={posts} />
        </div>
      )}
    </>
  );
}
