import Link from "next/link";

const displayFont = { fontFamily: "'Instrument Serif', serif" };

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center">
      <span className="text-xs text-muted-foreground tracking-[0.3em] uppercase mb-4">
        Lost page
      </span>
      <h1
        className="text-6xl sm:text-8xl text-foreground mb-3"
        style={displayFont}
      >
        404
      </h1>
      <div className="editorial-rule w-12 mb-6" />
      <p className="text-muted-foreground mb-8 max-w-sm">
        This page doesn&apos;t exist — or maybe it moved. Either way, you&apos;re not here.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.03] transition-transform"
      >
        Back to the start
      </Link>
    </div>
  );
}
