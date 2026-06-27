import Link from "next/link";

const displayFont = { fontFamily: "'Instrument Serif', serif" };

export default function Footer() {
  return (
    <footer className="relative z-10 px-8 pt-8 pb-16 mt-auto">
      <div className="h-px w-full bg-foreground/10 mb-8" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-10">
          <div>
            <span className="text-2xl text-foreground" style={{ ...displayFont, letterSpacing: "0.12em" }}>
              aka iris
            </span>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Thoughts, stories, and things worth remembering.
            </p>
          </div>
          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Navigate</span>
              <Link href="/" className="text-foreground/70 hover:text-foreground transition-colors">
                Home
              </Link>
            </div>
          </div>
        </div>
        <div className="editorial-rule mb-6" />
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} aka iris. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
