"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/components/graphite/gsap";
import type { Video } from "./contents";

type Tier = "mobile" | "tablet" | "desktop";

const OFFSETS = [-3, -2, -1, 0, 1, 2, 3] as const;
const SPRING = { type: "spring", stiffness: 220, damping: 26, mass: 0.75 } as const;
const CARD = "#1b1b1a";

/** The film in the middle plays; its neighbours wait at the sides as narrow posters. */
const SIZES: Record<Tier, { w: number; side: number; far: number; gap: number }> = {
  desktop: { w: 860, side: 104, far: 72, gap: 20 },
  tablet: { w: 600, side: 84, far: 0, gap: 16 },
  mobile: { w: 0, side: 26, far: 0, gap: 12 },
};

/**
 * A carousel of films in the spirit of Calendly's: the active one plays at full size, the next
 * and previous peek in from the sides, notched onto it. It moves on when a film ends.
 */
export function ReelCarousel({ videos }: { videos: Video[] }) {
  const total = videos.length;
  const [page, setPage] = useState(0);
  const [tier, setTier] = useState<Tier>("desktop");
  const [vw, setVw] = useState(1200);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [still, setStill] = useState(false);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const active = ((page % total) + total) % total;

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setVw(w);
      setTier(w < 768 ? "mobile" : w < 1180 ? "tablet" : "desktop");
    };
    onResize();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preference check needs the browser
    setStill(prefersReducedMotion());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // only play while the carousel is on screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the active film plays from the start; the bar under it follows along
  useEffect(() => {
    const v = video.current;
    if (!v || still) return;
    setProgress(0);
    if (!inView) {
      v.pause();
      return;
    }
    v.play().catch(() => {});
    let raf = 0;
    const tick = () => {
      if (v.duration) setProgress(v.currentTime / v.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, inView, still]);

  const go = useCallback((d: number) => setPage((p) => p + d), []);

  const goTo = (i: number) => {
    let d = i - active;
    if (d > total / 2) d -= total;
    else if (d < -total / 2) d += total;
    go(d);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  };

  const s = SIZES[tier];
  const w = tier === "mobile" ? Math.min(vw - 40 - 2 * (s.side + s.gap), 560) : s.w;
  const h = Math.round((w * 9) / 16);

  /** Where the card `offset` places from the middle sits, and how big it is. */
  const place = (offset: number) => {
    const sideH = h * 0.72;
    const farH = h * 0.44;
    const hidden = { opacity: 0, pointerEvents: "none" as const, zIndex: 0 };
    if (offset === 0) return { x: -w / 2, y: -h / 2, width: w, height: h, opacity: 1, zIndex: 1, pointerEvents: "auto" as const };
    const dir = Math.sign(offset);
    const near = w / 2 + s.gap;
    if (Math.abs(offset) === 1)
      return { x: dir < 0 ? -near - s.side : near, y: -sideH / 2, width: s.side, height: sideH, opacity: 1, zIndex: 2, pointerEvents: "auto" as const };
    const far = near + s.side + s.gap;
    if (Math.abs(offset) === 2 && s.far)
      return { x: dir < 0 ? -far - s.far : far, y: -farH / 2, width: s.far, height: farH, opacity: 1, zIndex: 2, pointerEvents: "auto" as const };
    // further out: waiting just beyond the edge, invisible
    return { x: dir < 0 ? -far - 220 : far + 140, y: -farH / 2, width: s.far || s.side, height: farH, ...hidden };
  };

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Films"
      tabIndex={0}
      onKeyDown={onKey}
      className="relative mx-auto flex w-full select-none flex-col items-center overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <div id="reel-panel" role="tabpanel" aria-live="polite" className="relative w-full" style={{ height: h }}>
        {OFFSETS.map((offset) => {
          // with fewer films than slots, each film appears once: the spare one goes on the right
          if (offset < -Math.floor((total - 1) / 2) || offset > Math.ceil((total - 1) / 2)) return null;
          const vi = page + offset;
          const v = videos[((vi % total) + total) % total];
          const isActive = offset === 0;
          return (
            <motion.div
              key={vi}
              initial={false}
              animate={place(offset)}
              transition={SPRING}
              onClick={() => offset && go(offset)}
              style={{ position: "absolute", left: "50%", top: "50%", background: CARD, willChange: "transform" }}
              className={cn("rounded-[22px] md:rounded-[28px]", !isActive && "cursor-pointer")}
              aria-label={isActive ? undefined : `Play ${v.label}`}
              role={isActive ? undefined : "button"}
            >
              {Math.abs(offset) === 1 && <Notch from={offset < 0 ? "left" : "right"} big />}
              {Math.abs(offset) === 2 && tier === "desktop" && <Notch from={offset < 0 ? "left" : "right"} />}

              <div className="relative size-full overflow-hidden p-1.5" style={{ borderRadius: "inherit" }}>
                <div className="relative size-full overflow-hidden rounded-[16px] md:rounded-[22px]">
                  {isActive ? (
                    <>
                      <video
                        ref={video}
                        src={v.src}
                        poster={v.poster}
                        muted={muted}
                        playsInline
                        loop={total === 1}
                        controls={still}
                        preload="metadata"
                        aria-label={v.label}
                        onEnded={() => go(1)}
                        className="size-full bg-black object-contain"
                      />
                      {!still && (
                        <button
                          type="button"
                          onClick={() => setMuted((m) => !m)}
                          aria-label={muted ? "Turn sound on" : "Turn sound off"}
                          className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium md:bottom-4 md:left-4 md:gap-2 md:px-4 md:py-2 md:text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/75"
                        >
                          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          {muted ? "Sound off" : "Sound on"}
                        </button>
                      )}
                      <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2.5 py-0.5 font-marker text-xs font-bold md:right-4 md:top-4 md:px-3 md:py-1 md:text-sm text-white backdrop-blur-sm">
                        {v.kind && <span className="font-sans font-medium text-white/60">{v.kind} · </span>}
                        {v.label}
                      </span>
                    </>
                  ) : (
                    <Image src={v.poster} alt="" fill sizes="120px" draggable={false} className="object-cover opacity-70 transition-opacity duration-300 hover:opacity-100" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {total > 1 && (
        <div role="tablist" aria-label="Films" className="mt-6 flex items-center gap-1.5">
          {videos.map((v, i) => {
            const on = i === active;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="reel-panel"
                aria-label={v.label}
                tabIndex={on ? 0 : -1}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 overflow-hidden rounded-[3px] bg-white/15 transition-[width,background-color] duration-300 ease-out",
                  on ? "w-20" : "w-2 hover:bg-white/35"
                )}
              >
                {on && <span className="block h-full origin-left rounded-[3px] bg-[var(--accent)]" style={{ transform: `scaleX(${progress})` }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** The little waisted bridge that joins a side card onto its neighbour, nearer the middle. */
function Notch({ from, big }: { from: "left" | "right"; big?: boolean }) {
  const [w, h] = big ? [22, 42] : [18, 28];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 z-10 my-auto flex items-center"
      // a card on the left reaches out of its right edge, and the other way round
      style={{ width: w, height: h, color: CARD, [from]: "calc(100% - 1px)" }}
    >
      <svg viewBox="0 0 20 37.33" preserveAspectRatio="none" className="block size-full overflow-visible fill-current">
        <path d="M0 0C0 0 1.24 13.58 10 13.58C18.76 13.58 20 0 20 0V37.33C20 37.33 18.76 23.76 10 23.76C1.24 23.76 0 37.33 0 37.33V0Z" />
      </svg>
    </div>
  );
}
