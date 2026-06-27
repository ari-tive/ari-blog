"use client";

import { useEffect } from "react";

const RADIUS = 180;

export function useProximityGlow() {
  useEffect(() => {
    let raf: number | null = null;

    function handlePointerMove(e: PointerEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const els = document.querySelectorAll<HTMLElement>(".liquid-glass");
        els.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const cx = Math.max(rect.left, Math.min(e.clientX, rect.right));
          const cy = Math.max(rect.top, Math.min(e.clientY, rect.bottom));
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const glow = Math.max(0, 1 - dist / RADIUS);
          el.style.setProperty("--glow", String(glow));
        });
        raf = null;
      });
    }

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
