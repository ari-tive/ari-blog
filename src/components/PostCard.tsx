"use client";

import Link from "next/link";
import { Post } from "@/lib/types";
import { ImageOff } from "lucide-react";

const displayFont = { fontFamily: "'Instrument Serif', serif" };

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s/g, "")
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/>\s/g, "")
    .replace(/[-*+]\s/g, "")
    .replace(/\d+\.\s/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function formatDate(ts: { seconds: number }): string {
  const d = new Date(ts.seconds * 1000);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

function previewText(body: string): string {
  const clean = stripMarkdown(body);
  if (clean.length <= 25) return clean;
  return clean.slice(0, 25) + "...";
}

export default function PostCard({ post }: { post: Post }) {
  const thumbnail = post.images?.find((img) => img.isThumbnail)?.url;

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="liquid-glass rounded-2xl overflow-hidden relative flex items-center gap-3 sm:gap-5 p-4 sm:p-5 hover:scale-[1.01] transition-transform duration-300">
        {post.createdAt && (
          <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xs text-muted-foreground/60">
            {formatDate(post.createdAt)}
          </span>
        )}

        <div className="w-16 h-16 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <ImageOff size={24} className="text-muted-foreground/30 sm:hidden" />
          )}
          {thumbnail ? null : (
            <ImageOff size={32} className="text-muted-foreground/30 hidden sm:block" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="text-base sm:text-xl text-foreground truncate group-hover:text-white transition-colors leading-snug"
            style={displayFont}
          >
            {post.title}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">
            {post.body ? previewText(post.body) : ""}
          </p>
        </div>
      </article>
    </Link>
  );
}
