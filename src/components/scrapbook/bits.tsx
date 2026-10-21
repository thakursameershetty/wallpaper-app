"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Deterministic randomness, so torn edges match on server and client  */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A clip-path polygon for a piece of paper torn along the given sides.
 * `depth` is how far (in %) the tear bites into the paper.
 */
export function tornEdge(seed: number, sides: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean }, depth = 4, teeth = 28) {
  const r = rng(seed);
  const pts: string[] = [];
  const edge = (torn: boolean | undefined, from: [number, number], to: [number, number], inward: [number, number]) => {
    const n = torn ? teeth : 1;
    for (let i = 0; i < n; i++) {
      const k = i / n;
      const bite = torn ? r() * depth : 0;
      pts.push(`${(from[0] + (to[0] - from[0]) * k + inward[0] * bite).toFixed(2)}% ${(from[1] + (to[1] - from[1]) * k + inward[1] * bite).toFixed(2)}%`);
    }
  };
  edge(sides.top, [0, 0], [100, 0], [0, 1]);
  edge(sides.right, [100, 0], [100, 100], [-1, 0]);
  edge(sides.bottom, [100, 100], [0, 100], [0, -1]);
  edge(sides.left, [0, 100], [0, 0], [1, 0]);
  return `polygon(${pts.join(", ")})`;
}

/* ------------------------------------------------------------------ */
/* Things that can be picked up and moved around the desk              */
/* ------------------------------------------------------------------ */

let topZ = 20;

/** Only mouse and trackpad users get to drag: on touch the same gesture has to scroll the page. */
function useCanDrag() {
  const [can, setCan] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability check needs the browser
    setCan(mq.matches);
  }, []);
  return can;
}

type LooseProps = {
  children: ReactNode;
  /** Position and size on the desk. */
  className?: string;
  /** Resting angle, degrees. */
  rotate?: number;
  /** When it lands on the desk, seconds after the scene starts. */
  delay?: number;
  /** The area it may be dragged within. */
  bounds?: RefObject<HTMLElement | null>;
  style?: CSSProperties;
  label?: string;
  /** Land when scrolled into view rather than as soon as the page loads. */
  onView?: boolean;
};

/** An object lying loose on the desk: it drops into place, and on desktop it can be dragged anywhere within `bounds`. */
export function Loose({ children, className = "", rotate = 0, delay = 0, bounds, style, label, onView }: LooseProps) {
  const canDrag = useCanDrag();
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      aria-label={label}
      className={`absolute select-none ${canDrag ? "cursor-grab active:cursor-grabbing" : ""} ${className}`}
      style={style}
      // dropped from above, still turning as it lands
      initial={{ opacity: 0, scale: 1.3, rotate: rotate + (rotate >= 0 ? 16 : -16) }}
      {...(onView ? { whileInView: { opacity: 1, scale: 1, rotate }, viewport: { once: true, margin: "-15% 0px" } } : { animate: { opacity: 1, scale: 1, rotate } })}
      transition={{ type: "spring", stiffness: 140, damping: 16, delay }}
      drag={canDrag}
      dragConstraints={bounds}
      dragElastic={0.15}
      dragMomentum
      whileHover={canDrag ? { scale: 1.03 } : undefined}
      whileDrag={{ scale: 1.08, rotate: rotate * 0.5, filter: "drop-shadow(0 18px 18px rgb(0 0 0 / 0.35))" }}
      onPointerDown={() => ref.current && (ref.current.style.zIndex = String(++topZ))}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Desk props                                                          */
/* ------------------------------------------------------------------ */

/** A strip of washi tape with zig-zag torn ends. */
export function Tape({ className = "", color = "rgb(236 222 170 / 0.75)", rotate = 0, children }: { className?: string; color?: string; rotate?: number; children?: ReactNode }) {
  return (
    <div
      className={`tape flex items-center justify-center ${className}`}
      style={{ background: color, rotate: `${rotate}deg`, clipPath: tornEdge(rotate * 13 + 7, { left: true, right: true }, 3, 8) }}
    >
      {children}
    </div>
  );
}

/** A yellow star sticker with a sleepy little face. */
export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 116" className={`sticker ${className}`} aria-hidden>
      <path
        d="M60 6 L75 40 L112 44 L84 69 L92 106 L60 87 L28 106 L36 69 L8 44 L45 40 Z"
        fill="#f7c948"
        stroke="#8a5a00"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M60 14 L72 42" stroke="#fff6c8" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <circle cx="50" cy="58" r="3.4" fill="#4a2f00" />
      <circle cx="70" cy="58" r="3.4" fill="#4a2f00" />
      <path d="M54 68 Q60 73 66 68" stroke="#4a2f00" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** A four-point sparkle. */
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" fill="#f7c948" stroke="#8a5a00" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function PaperClip({ className = "", color = "#c7362f" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 64" className={className} aria-hidden>
      <path
        d="M8 22 V44 a4 4 0 0 0 8 0 V12 a6.5 6.5 0 0 0 -13 0 V48 a9 9 0 0 0 18 0 V20"
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A curl of pencil shaving: painted rim, raw wood inside. */
export function Shaving({ className = "", paint = "#2f5fb3" }: { className?: string; paint?: string }) {
  const ring = (radius: number, amp: number, waves: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const rr = radius + amp * Math.sin(a * waves);
      pts.push(`${(50 + rr * Math.cos(a)).toFixed(2)},${(50 + rr * Math.sin(a)).toFixed(2)}`);
    }
    return `M${pts.join(" L")} Z`;
  };
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d={ring(46, 2.4, 18)} fill={paint} stroke="#1c2b4a" strokeWidth="1.5" />
      <path d={ring(38, 1.6, 18)} fill="#e7c38f" stroke="#a87b45" strokeWidth="1" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const a = (i / 9) * Math.PI * 2;
        // rounded, so the server's markup and the browser's agree to the digit
        const at = (r: number, f: (x: number) => number) => (50 + r * f(a)).toFixed(2);
        return <line key={i} x1={at(12, Math.cos)} y1={at(12, Math.sin)} x2={at(36, Math.cos)} y2={at(36, Math.sin)} stroke="#b88a52" strokeWidth="1" />;
      })}
      <path d="M50 38 L61 58 L39 58 Z" fill="#f7c948" stroke="#8a5a00" strokeWidth="1.5" strokeLinejoin="round" transform="rotate(10 50 50)" />
    </svg>
  );
}

/** A hexagonal pencil lying flat, point to the right. */
export function Pencil({ className = "", body = "#2f5fb3", shade = "#234a8c", label }: { className?: string; body?: string; shade?: string; label?: string }) {
  return (
    <svg viewBox="0 0 320 26" className={className} aria-hidden>
      <rect x="0" y="2" width="18" height="22" rx="3" fill="#d98c7e" stroke="#1d1d1b" strokeWidth="1.5" />
      <rect x="16" y="2" width="14" height="22" fill="#b8b6ae" stroke="#1d1d1b" strokeWidth="1.5" />
      <rect x="30" y="2" width="226" height="22" fill={body} stroke="#1d1d1b" strokeWidth="1.5" />
      <rect x="30" y="2" width="226" height="7" fill={shade} />
      <rect x="30" y="17" width="226" height="7" fill={shade} opacity="0.55" />
      <path d="M256 2 L300 11 L300 15 L256 24 Z" fill="#ecd3a7" stroke="#1d1d1b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M288 9 L318 13 L288 17 Z" fill="#2a2926" />
      {label && (
        <text x="60" y="18" fontSize="11" fontWeight="700" fill="#fff" fontFamily="var(--font-general-sans), sans-serif" letterSpacing="1">
          {label}
        </text>
      )}
    </svg>
  );
}

/** A round brush (or a fan brush), bristles to the left. */
export function Brush({ className = "", handle = "#2f5fb3", fan = false }: { className?: string; handle?: string; fan?: boolean }) {
  return (
    <svg viewBox="0 0 340 40" className={className} aria-hidden>
      {fan ? (
        <path d="M2 2 Q40 20 2 38 L60 24 L60 16 Z" fill="#c9b79c" stroke="#1d1d1b" strokeWidth="1.5" strokeLinejoin="round" />
      ) : (
        <path d="M4 20 Q30 8 62 14 L62 26 Q30 32 4 20 Z" fill="#6b4a2f" stroke="#1d1d1b" strokeWidth="1.5" strokeLinejoin="round" />
      )}
      <rect x="60" y="12" width="48" height="16" rx="2" fill="#c7cbd1" stroke="#1d1d1b" strokeWidth="1.5" />
      <rect x="60" y="12" width="48" height="5" fill="#eef0f2" />
      <path d="M108 13 L330 17 Q336 20 330 23 L108 27 Z" fill={handle} stroke="#1d1d1b" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** A white eraser in its paper sleeve. */
export function Eraser({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 64" className={className} aria-hidden>
      <rect x="2" y="2" width="116" height="60" rx="10" fill="#f6f6f2" stroke="#1d1d1b" strokeWidth="2" />
      <rect x="40" y="2" width="78" height="60" rx="4" fill="#3b6fc9" stroke="#1d1d1b" strokeWidth="2" />
      <path d="M52 20 H104 M52 32 H96" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 12 Q14 8 22 10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The torn edge where a paper section meets a dark one: the sheet's ragged edge, with the white
 * fibres a real rip leaves just beyond it. `side` is which edge of the paper is torn.
 */
export function PaperEdge({ side, seed }: { side: "top" | "bottom"; seed: number }) {
  const tear = tornEdge(seed, { [side]: true }, 70, 120);
  const fibre = tornEdge(seed + 1, { [side]: true }, 45, 160);
  return (
    <div aria-hidden className={`relative h-[clamp(22px,2.4vw,36px)] bg-[#0e0e0e] ${side === "top" ? "-mb-px" : "-mt-px"}`}>
      <div className="absolute inset-0 bg-white" style={{ clipPath: fibre }} />
      <div className="sheet absolute inset-0" style={{ clipPath: tear }} />
    </div>
  );
}
