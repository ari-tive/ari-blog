"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { db } from "@/lib/firebase";
import { Post, PostImage } from "@/lib/types";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit,
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

interface AllowListEntry {
  userId: string;
  username: string;
}

interface Draft {
  title: string;
  body: string;
  footer: string;
  images: PostImage[];
  visibility: "public" | "private";
  allowList: AllowListEntry[];
}

const emptyDraft: Draft = {
  title: "",
  body: "",
  footer: "",
  images: [],
  visibility: "public",
  allowList: [],
};

function loadDraft(editingPost: Post | null): Draft {
  if (editingPost) {
    return {
      title: editingPost.title,
      body: editingPost.body,
      footer: editingPost.footer || "",
      images: editingPost.images || [],
      visibility: editingPost.visibility || "public",
      allowList: (editingPost.allowList || []).map((userId) => ({ userId, username: "" })),
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

interface StepVisibilityProps {
  visibility: "public" | "private";
  allowList: AllowListEntry[];
  onChange: (updates: Partial<Draft>) => void;
}

function StepVisibility({ visibility, allowList, onChange }: StepVisibilityProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AllowListEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadedUsers, setLoadedUsers] = useState<AllowListEntry[]>(allowList);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchUsers = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const q = query(
        collection(db, "users"),
        where("usernameLower", ">=", term.toLowerCase()),
        where("usernameLower", "<=", term.toLowerCase() + "\uf8ff"),
        limit(8)
      );
      const snap = await getDocs(q);
      const entries = snap.docs
        .map((d) => ({ userId: d.id, username: d.data().username } as AllowListEntry))
        .filter((e) => !allowList.some((a) => a.userId === e.userId));
      setResults(entries);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [allowList]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(value), 300);
  }

  function addEntry(entry: AllowListEntry) {
    const updated = [...allowList, entry];
    onChange({ allowList: updated });
    setSearch("");
    setResults([]);
  }

  function removeEntry(userId: string) {
    onChange({ allowList: allowList.filter((e) => e.userId !== userId) });
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (visibility === "private" && allowList.length > 0) {
      const ids = allowList.map((e) => e.userId);
      const missing = ids.filter((id) => !loadedUsers.some((u) => u.userId === id));
      if (missing.length > 0) {
        Promise.all(
          missing.map(async (id) => {
            try {
              const snap = await import("firebase/firestore").then((fs) =>
                fs.getDoc(fs.doc(db, "users", id))
              );
              if (snap.exists()) {
                return { userId: id, username: snap.data().username } as AllowListEntry;
              }
            } catch {}
            return null;
          })
        ).then((resolved) => {
          const valid = resolved.filter(Boolean) as AllowListEntry[];
          if (valid.length > 0) setLoadedUsers((prev) => [...prev, ...valid]);
        });
      }
    }
  }, [visibility, allowList, loadedUsers]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">
          Visibility
        </label>
        <div className="flex gap-3">
          {(["public", "private"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ visibility: v })}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors capitalize ${
                visibility === v
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-muted-foreground border-border hover:border-foreground/30"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {visibility === "private" && (
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Allow List
          </label>
          <p className="text-xs text-muted-foreground/60 mb-3">
            Search and add users who can see this post.
          </p>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by username..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
            {results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 rounded-lg bg-background/95 backdrop-blur-sm border border-border overflow-hidden">
                {results.map((r) => (
                  <button
                    key={r.userId}
                    type="button"
                    onClick={() => addEntry(r)}
                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-white/10 transition-colors"
                  >
                    {r.username}
                  </button>
                ))}
              </div>
            )}
          </div>

          {allowList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {allowList.map((entry) => (
                <span
                  key={entry.userId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-sm text-foreground"
                >
                  {entry.username}
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.userId)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
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
    setStep((s) => Math.min(s + 1, 3));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
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
        visibility: draft.visibility,
        allowList: draft.visibility === "private" ? draft.allowList.map((e) => e.userId) : [],
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
            {[1, 2, 3].map((s) => (
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
                  {s === 1 ? "Images" : s === 2 ? "Write" : "Visibility"}
                </span>
                {s < 3 && (
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

          {/* Step 3: Visibility */}
          {step === 3 && (
            <StepVisibility
              visibility={draft.visibility}
              allowList={draft.allowList}
              onChange={(updates) => updateDraft(updates)}
            />
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

            {step < 3 ? (
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
