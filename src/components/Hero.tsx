"use client";

const displayFont = { fontFamily: "'Instrument Serif', serif" };

export default function Hero({ settled }: { settled: boolean }) {
  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out"
      style={{
        minHeight: settled ? "10vh" : "100svh",
        paddingTop: settled ? "2rem" : 0,
        paddingBottom: settled ? "1rem" : 0,
      }}
    >
      <h1
        className="text-foreground text-3xl sm:text-5xl md:text-8xl leading-[1.05] transition-all duration-700 ease-out text-center py-6"
        style={{
          ...displayFont,
          fontSize: settled ? "1.5rem" : undefined,
          letterSpacing: settled ? "0.02em" : "0.04em",
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
        }}
      >
        - thoughts &amp; stories -
      </h1>
      {!settled && (
        <div className="mt-8 editorial-rule w-16 transition-opacity duration-500" />
      )}
    </section>
  );
}
