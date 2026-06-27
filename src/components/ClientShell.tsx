"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClickSpark from "@/components/ClickSpark";
import UsernameOnboarding from "@/components/UsernameOnboarding";
import { useProximityGlow } from "@/hooks/useProximityGlow";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260604_125109_19424216-4e2a-4560-b9f2-f1b5f6eb2c2e.mp4";

function GlowProvider({ children }: { children: ReactNode }) {
  useProximityGlow();
  return <>{children}</>;
}

function FixedVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      const resume = () => {
        v.play().catch(() => {});
        window.removeEventListener("pointerdown", resume);
        window.removeEventListener("keydown", resume);
      };
      window.addEventListener("pointerdown", resume, { once: true });
      window.addEventListener("keydown", resume, { once: true });
    });
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-background/60" />
    </div>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, username, usernameLoading } = useAuth();

  if (loading || usernameLoading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (user && !username) {
    return <UsernameOnboarding />;
  }

  return <>{children}</>;
}

export default function ClientShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <GlowProvider>
        <ClickSpark
          sparkColor="#fff"
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <FixedVideoBackground />
          <Navbar />
          <div
            className="transition-opacity duration-500"
            style={{ opacity: ready ? 1 : 0 }}
          >
            <main className="relative z-10">
              <AuthGate>{children}</AuthGate>
            </main>
            <Footer />
          </div>
        </ClickSpark>
      </GlowProvider>
    </AuthProvider>
  );
}
