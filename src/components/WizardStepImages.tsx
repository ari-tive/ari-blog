"use client";

import { useState, useRef } from "react";
import { PostImage } from "@/lib/types";
import { X, Check, Image as ImageIcon, Upload, Loader2 } from "lucide-react";

interface Props {
  images: PostImage[];
  onChange: (images: PostImage[]) => void;
}

export default function WizardStepImages({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large — 5MB limit");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      if (images.some((img) => img.url === data.url)) return;
      onChange([
        ...images,
        { url: data.url, isThumbnail: images.length === 0 },
      ]);
    } catch {
      setError("Upload failed — check your connection");
    } finally {
      setUploading(false);
    }
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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-3 py-10 rounded-xl border border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Upload size={20} />
        )}
        <span className="text-sm">
          {uploading ? "Uploading..." : "Click to upload an image"}
        </span>
      </button>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
          <ImageIcon size={32} className="mb-3 opacity-40" />
          <p className="text-sm">No images added yet</p>
          <p className="text-xs mt-1">Upload images above — optional for a post</p>
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
