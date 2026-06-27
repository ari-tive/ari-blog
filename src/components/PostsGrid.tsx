"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import PostCard from "./PostCard";

const progressMessages = [
  "%num% pieces and we're cooking.",
  "%num% pieces collected. W grind.",
  "%num% pieces so far. No cap.",
  "%num% pieces secured.",
  "%num% pieces in the bag.",
  "%num% pieces unlocked.",
  "%num% pieces. We ball.",
  "%num% pieces stacked up.",
  "%num% pieces. Light work.",
  "%num% pieces and counting.",
  "%num% pieces. Kinda cracked.",
  "%num% pieces. Big W.",
  "%num% pieces. Lowkey impressive.",
  "%num% pieces. Highkey insane.",
  "%num% pieces. Keep it rolling.",
  "%num% pieces. Speedrun vibes.",
  "%num% pieces. The grind never stops.",
  "%num% pieces. Built different.",
  "%num% pieces. Peak efficiency.",
  "%num% pieces. Bro is farming.",
  "%num% pieces. Absolutely locked in.",
  "%num% pieces. The streak lives on.",
  "%num% pieces. Tiny flex.",
  "%num% pieces. Massive flex.",
  "%num% pieces. Not too shabby.",
  "%num% pieces. Looking clean.",
  "%num% pieces. We take those.",
  "%num% pieces. Mission progressing.",
  "%num% pieces. NPCs could never.",
  "%num% pieces. Certified grindset.",
  "%num% pieces. Chat, is this real?",
  "%num% pieces. Main character energy.",
  "%num% pieces. The lore expands.",
  "%num% pieces. That's kinda wild.",
  "%num% pieces. W collection.",
  "%num% pieces. Momentum is real.",
  "%num% pieces. The inventory grows.",
  "%num% pieces. We stay winning.",
  "%num% pieces. Touching greatness.",
  "%num% pieces. Still hungry.",
  "%num% pieces. Bro is unstoppable.",
  "%num% pieces. We're so back.",
  "%num% pieces. Zero skill issue.",
  "%num% pieces. Max aura.",
  "%num% pieces. Drip added to inventory.",
  "%num% pieces. We're eating good.",
  "%num% pieces. Collecting like it's Pokémon.",
  "%num% pieces. More loot acquired.",
  "%num% pieces. One step closer.",
  "%num% pieces. The collection arc continues.",
];

function getRandomMessage(num: number): string {
  const msg = progressMessages[Math.floor(Math.random() * progressMessages.length)];
  return msg.replace("%num%", String(num));
}

export default function PostsGrid({ posts }: { posts: Post[] }) {
  const [progressText, setProgressText] = useState(`${posts.length} pieces so far.`);

  useEffect(() => {
    setProgressText(getRandomMessage(posts.length));
  }, [posts.length]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">
          No posts yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <section className="px-4 sm:px-8 py-16 sm:py-20 max-w-2xl mx-auto">
      <div className="mb-10 sm:mb-12">
        <h2
          className="text-3xl sm:text-5xl text-foreground tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Recent writing
        </h2>
        <p className="text-muted-foreground text-sm mt-3">
          {progressText}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {posts.map((post, i) => (
          <div
            key={post.id}
            className="animate-fade-rise"
            style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: "forwards" }}
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
