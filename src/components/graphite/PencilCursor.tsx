"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

/**
 * On mouse/trackpad devices the cursor is a pencil: its tip is the pointer, it leans into
 * sideways movement, and it says what a click will do over the work ([data-cursor="view"]).
 */
export function PencilCursor() {
  const [enabled, setEnabled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const lean = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [overLink, setOverLink] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability check needs the browser
    setEnabled(true);
    document.documentElement.classList.add("pencil-cursor");
    return () => document.documentElement.classList.remove("pencil-cursor");
  }, []);

  useEffect(() => {
    if (!enabled || !root.current || !lean.current) return;
    const x = gsap.quickTo(root.current, "x", { duration: 0.08, ease: "power3" });
    const y = gsap.quickTo(root.current, "y", { duration: 0.08, ease: "power3" });
    const tilt = gsap.quickTo(lean.current, "rotation", { duration: 0.5, ease: "power3" });
    let lastX = 0;
    let lastY = 0;
    let settle = 0;

    // what's under the pencil decides its label; re-checked on scroll, since the page moves under a still mouse
    const readTarget = (t: Element | null) => {
      const tagged = t?.closest<HTMLElement>("[data-cursor]");
      setLabel(tagged?.dataset.cursor ?? null);
      setOverLink(!tagged && !!t?.closest("a, button"));
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x(e.clientX);
      y(e.clientY);
      tilt(gsap.utils.clamp(-28, 28, (e.clientX - lastX) * 1.4));
      lastX = e.clientX;
      lastY = e.clientY;
      clearTimeout(settle);
      settle = window.setTimeout(() => tilt(0), 90);
      setHidden(false);
      readTarget(e.target as Element | null);
    };
    const onScroll = () => readTarget(document.elementFromPoint(lastX, lastY));
    const onLeave = () => setHidden(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={root} aria-hidden className={`pointer-events-none fixed left-0 top-0 z-[2147483647] transition-opacity duration-200 ${hidden ? "opacity-0" : "opacity-100"}`}>
      <div ref={lean} className="origin-top-left">
        <div className={`origin-top-left transition-transform duration-300 ease-out ${overLink ? "scale-125" : label ? "scale-90" : "scale-100"}`}>
          {/* drawn pointing down-left so the graphite tip sits exactly on the pointer (0, 0) */}
          <svg width="1" height="1" overflow="visible" className="drop-shadow-[0_6px_6px_rgba(40,30,15,0.25)]">
            <g transform="rotate(-50)">
              <polygon points="0,0 6,-1.9 6,1.9" fill="#2a2926" />
              <polygon points="6,-1.9 15,-5 15,5 6,1.9" fill="#ecd3a7" />
              <rect x="15" y="-5" width="33" height="10" fill="#d4a24c" />
              <rect x="15" y="-5" width="33" height="3.4" fill="#e6b95f" />
              <rect x="48" y="-5" width="5" height="10" fill="#b8b6ae" />
              <rect x="53" y="-5" width="7" height="10" rx="2.5" fill="#d98c7e" />
            </g>
          </svg>
        </div>
      </div>
      <span
        className={`absolute left-4 top-4 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper transition-[opacity,transform] duration-300 ease-out ${
          label ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-75 opacity-0"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
