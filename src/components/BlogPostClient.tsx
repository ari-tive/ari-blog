"use client";

import { useState, useRef, useEffect } from "react";
import { Post } from "@/lib/types";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";
import Link from "next/link";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";

const displayFont = { fontFamily: "'Instrument Serif', serif" };

function formatDate(ts: { seconds: number }) {
  return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPostClient({ post }: { post: Post }) {
  const images = post.images || [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setTimeout(() => {
      const track = trackRef.current;
      if (track && track.scrollWidth > track.parentElement!.clientWidth) {
        setShouldAutoScroll(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [images]);

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function lightboxPrev() {
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + images.length) % images.length : null
    );
  }

  function lightboxNext() {
    setLightboxIndex((i) =>
      i !== null ? (i + 1) % images.length : null
    );
  }

  const doubledImages = [...images, ...images];

  return (
    <article className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-8 max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 sm:mb-10"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1
        className="text-3xl sm:text-5xl md:text-6xl text-foreground tracking-tight leading-[1.05] mb-4 sm:mb-5"
        style={displayFont}
      >
        {post.title}
      </h1>

      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6 sm:mb-8">
        <span>{formatDate(post.createdAt)}</span>
      </div>

      <div className="editorial-rule mb-8 sm:mb-10" />

      {images.length > 0 && (
        <div className="mb-8 sm:mb-10 -mx-4 sm:-mx-8 px-4 sm:px-8 overflow-hidden">
          {shouldAutoScroll ? (
            <div className="overflow-hidden">
              <div ref={trackRef} className="gallery-track">
                {doubledImages.map((img, i) => (
                  <button
                    key={`${img.url}-${i}`}
                    type="button"
                    onClick={() => openLightbox(i % images.length)}
                    className="shrink-0 rounded-xl overflow-hidden bg-white/5 cursor-zoom-in hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="max-h-64 sm:max-h-80 w-auto object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div ref={trackRef} className="flex gap-4 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => openLightbox(i)}
                  className="shrink-0 rounded-xl overflow-hidden bg-white/5 cursor-zoom-in hover:opacity-90 transition-opacity"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="max-h-64 sm:max-h-80 w-auto object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-base sm:text-lg text-foreground/90 leading-[1.8] space-y-6">
        {post.body.split("\n").map((paragraph, i) =>
          paragraph.trim() ? (
            <p key={i}>{paragraph}</p>
          ) : (
            <div key={i} className="h-2" />
          )
        )}
      </div>

      <div className="editorial-rule my-10 sm:my-12" />

      <div className="flex items-center mb-10 sm:mb-12">
        <LikeButton postId={post.id} initialCount={post.likeCount || 0} />
      </div>

      {post.footer && (
        <div className="mb-10 sm:mb-12">
          <div className="editorial-rule mb-6" />
          <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
            {post.footer}
          </p>
        </div>
      )}

      <CommentSection postId={post.id} />

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-white/70 hover:text-white transition-colors z-10"
          >
            <X size={24} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                lightboxPrev();
              }}
              className="absolute left-2 sm:left-4 p-2 rounded-full text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <img
            src={images[lightboxIndex].url}
            alt=""
            className="max-w-[95vw] sm:max-w-[90vw] max-h-[85vh] sm:max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                lightboxNext();
              }}
              className="absolute right-2 sm:right-4 p-2 rounded-full text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
