"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const displayFont = { fontFamily: "'Instrument Serif', serif" };
const ADMIN_EMAIL = "nv2008223@gmail.com";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDisplayName(null);
      return;
    }
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setDisplayName(snap.data().username);
    });
  }, [user]);

  const isBlogPost = pathname.startsWith("/blog/");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isBlogPost) return null;

  async function handleGoogleSignIn() {
    try {
      setAuthError("");
      await signInWithPopup(auth, new GoogleAuthProvider());
      setShowAuth(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Google sign-in failed";
      setAuthError(msg);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowAuth(false);
      setEmail("");
      setPassword("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : isSignUp ? "Sign up failed" : "Sign in failed";
      setAuthError(msg);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    router.push("/");
  }

  return (
    <>
      <nav className="sm:fixed sm:top-6 sm:left-6 z-50 liquid-glass mx-auto sm:mx-0 w-fit relative sm:max-w-[calc(100vw-48px)] mt-12 sm:mt-0 scale-[0.8] sm:scale-100 origin-top">
        <div
          className="flex items-center cursor-pointer select-none px-6 py-3.5"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className="text-2xl text-foreground whitespace-nowrap"
            style={{ ...displayFont, letterSpacing: "0.12em" }}
          >
            aka iris
          </span>
          <div className="ml-3 flex flex-col gap-[5px]">
            <span
              className={cn(
                "block h-[2px] w-6 bg-foreground transition-all duration-300 origin-center",
                open && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-6 bg-foreground transition-all duration-300",
                open && "opacity-0 scale-x-0"
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-6 bg-foreground transition-all duration-300 origin-center",
                open && "-translate-y-[7px] -rotate-45"
              )}
            />
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="flex flex-col gap-3 px-6 pb-4 pt-2">
            <div className="h-px bg-border mb-1" />
            <Link
              href="/"
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground transition-colors",
                pathname === "/" && "text-foreground"
              )}
            >
              Home
            </Link>
            {user?.email === ADMIN_EMAIL && (
              <Link
                href="/admin"
                className={cn(
                  "text-sm text-muted-foreground hover:text-foreground transition-colors",
                  pathname === "/admin" && "text-foreground"
                )}
              >
                Admin
              </Link>
            )}

            {!loading && (
              <>
                <div className="h-px bg-border my-1" />
                {user ? (
                  <>
                    <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {displayName || user.email || user.displayName}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {showAuth && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowAuth(false);
              setAuthError("");
            }}
          />
          <div className="liquid-glass-solid relative z-10 w-full max-w-sm p-8 animate-zoom-in-95">
            <button
              onClick={() => {
                setShowAuth(false);
                setAuthError("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <h2
              className="text-2xl mb-6 text-foreground"
              style={displayFont}
            >
              {isSignUp ? "Join" : "Welcome back"}
            </h2>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-border bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium transition-colors mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
              {authError && (
                <p className="text-red-400 text-xs">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-white text-black text-sm font-medium hover:scale-[1.02] transition-transform"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>

            <button
              onClick={() => {
                setIsSignUp((v) => !v);
                setAuthError("");
              }}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
