"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { db } from "@/lib/firebase";
import { Post, PostImage } from "@/lib/types";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import WizardStepImages from "./WizardStepImages";

const displayFont = { fontFamily: "'Instrument Serif', serif" };
const STORAGE_KEY = "ariblog_post_draft";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Draft {
  title: string;
  body: string;
  footer: string;
  images: PostImage[];
}

const emptyDraft: Draft = {
  title: "",
  body: "",
  footer: "",
  images: [],
};

function loadDraft(editingPost: Post | null): Draft {
  if (editingPost) {
    return {
      title: editingPost.title,
      body: editingPost.body,
      footer: editingPost.footer || "",
      images: editingPost.images || [],
    };
  }
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return { ...emptyDraft, ...JSON.parse(saved) };
  } catch {}
  return emptyDraft;
}

function saveDraft(draft: Draft) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {}
}

function clearDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

interface Props {
  editingPost: Post | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function PostWizard({ editingPost, onClose, onSaved }: Props) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(() => loadDraft(editingPost));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function updateDraft(partial: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function next() {
    setError("");
    setStep(2);
  }

  function back() {
    setError("");
    setStep(1);
  }

  async function publish() {
    if (!draft.title.trim() || !draft.body.trim()) {
      setError("Title and body are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const postData = {
        title: draft.title.trim(),
        slug: slugify(draft.title),
        body: draft.body.trim(),
        footer: draft.footer.trim() || null,
        images: draft.images,
      };

      if (editingPost) {
        await updateDoc(doc(db, "posts", editingPost.id), postData);
      } else {
        await addDoc(collection(db, "posts"), {
          ...postData,
          createdAt: serverTimestamp(),
          likeCount: 0,
        });
      }

      clearDraft();
      onSaved();
    } catch (e) {
      console.error("Publish error:", e);
      setError(`Failed to publish post: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[66] flex items-start justify-center p-4 pt-20 overflow-y-auto">
        <div className="liquid-glass-solid relative z-10 w-full max-w-3xl p-8 animate-zoom-in-95 mb-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-foreground" style={displayFont}>
              {editingPost ? "Edit Post" : "New Post"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    s === step
                      ? "bg-white text-black"
                      : s < step
                        ? "bg-white/20 text-foreground"
                        : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                <span
                  className={`text-sm ${
                    s === step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s === 1 ? "Images" : "Write"}
                </span>
                {s < 2 && (
                  <div className="w-12 h-px bg-border mx-1" />
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {/* Step 1: Images */}
          {step === 1 && (
            <WizardStepImages
              images={draft.images}
              onChange={(images) => updateDraft({ images })}
            />
          )}

          {/* Step 2: Write */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Title
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => updateDraft({ title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  placeholder="Post title"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Body{" "}
                  <span className="normal-case tracking-normal text-muted-foreground/60">
                    (markdown)
                  </span>
                </label>
                <textarea
                  value={draft.body}
                  onChange={(e) => updateDraft({ body: e.target.value })}
                  rows={14}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-none font-mono leading-relaxed"
                  placeholder="Write your post in markdown..."
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Footer{" "}
                  <span className="normal-case tracking-normal text-muted-foreground/60">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={draft.footer}
                  onChange={(e) => updateDraft({ footer: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  placeholder="A sign-off or note..."
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={back}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-muted-foreground text-sm hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.03] transition-transform"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={publish}
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.03] transition-transform disabled:opacity-50"
              >
                {saving
                  ? "Publishing..."
                  : editingPost
                    ? "Update Post"
                    : "Publish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
