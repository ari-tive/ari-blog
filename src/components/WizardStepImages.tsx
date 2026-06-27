"use client";

import { useState } from "react";
import { PostImage } from "@/lib/types";
import { Plus, X, Check, Image as ImageIcon } from "lucide-react";

interface Props {
  images: PostImage[];
  onChange: (images: PostImage[]) => void;
}

export default function WizardStepImages({ images, onChange }: Props) {
  const [url, setUrl] = useState("");

  function addImage() {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (images.some((img) => img.url === trimmed)) return;
    const newImages = [
      ...images,
      { url: trimmed, isThumbnail: images.length === 0 },
    ];
    onChange(newImages);
    setUrl("");
  }

  function removeImage(index: number) {
    const removed = images[index];
    const remaining = images.filter((_, i) => i !== index);
    if (removed.isThumbnail && remaining.length > 0) {
      remaining[0] = { ...remaining[0], isThumbnail: true };
    }
    onChange(remaining);
  }

  function setThumbnail(index: number) {
    onChange(
      images.map((img, i) => ({ ...img, isThumbnail: i === index }))
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
          placeholder="Paste image URL..."
          className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
        />
        <button
          type="button"
          onClick={addImage}
          disabled={!url.trim()}
          className="px-4 py-3 rounded-lg bg-white/10 border border-border text-foreground text-sm hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
          <ImageIcon size={32} className="mb-3 opacity-40" />
          <p className="text-sm">No images added yet</p>
          <p className="text-xs mt-1">Add image URLs above — optional for a post</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {images.map((img, i) => (
            <div
              key={img.url}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                img.isThumbnail
                  ? "border-foreground/40 bg-white/5"
                  : "border-border"
              }`}
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 shrink-0">
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              <p className="flex-1 text-xs text-muted-foreground truncate font-mono">
                {img.url}
              </p>

              <div className="flex items-center gap-2 shrink-0">
                {img.isThumbnail ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs text-foreground">
                    <Check size={14} />
                    Thumbnail
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setThumbnail(i)}
                    className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    Set as thumbnail
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
