/** A pencil-stroke underline under the wrapped words. Draws as it scrolls into view (or on load, for the hero). */
export function Stroke({ children, color = "#d4a24c", onLoad }: { children: React.ReactNode; color?: string; onLoad?: boolean }) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 300 24"
        preserveAspectRatio="none"
        className={`stroke-draw absolute -bottom-[0.1em] left-0 h-[0.24em] w-full overflow-visible ${onLoad ? "on-load" : ""}`}
      >
        <path d="M4 16 C 60 6, 120 4, 180 10 S 270 18, 296 8" pathLength={1} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Small "Label" eyebrow above a section heading. */
export function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`text-sm font-medium ${light ? "text-paper/60" : "text-smoke"}`}>{children}</p>;
}
