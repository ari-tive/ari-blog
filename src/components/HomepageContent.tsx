"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import Hero from "@/components/Hero";
import PostsGrid from "@/components/PostsGrid";

export default function HomepageContent({ posts }: { posts: Post[] }) {
  const [settled, setSettled] = useState(false);
  const [postsVisible, setPostsVisible] = useState(false);

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
