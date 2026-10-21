"use client";

import { useRef, useState } from "react";
import { ArtImage, type ArtControl } from "./ArtImage";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "./gsap";

/** Resting angle of the picture, degrees. */
const TILT = -3;
/**
 * The shader's colour front only moves between these two `reveal` values: below SKETCH nothing is
 * painted yet, above PAINTED it's all paint. Tweening just this range makes hover respond at once.
 */
const SKETCH = 0.3;
const PAINTED = 1;

/**
 * Opens on a blank sheet: the name sets itself letter by letter while Pencil, Abishek's cartoon
 * self, sketches himself in graphite. He stays a sketch until hovered (or tapped), then colours in.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const [ctrl] = useState<ArtControl>(() => ({ draw: 0, reveal: SKETCH, zoom: 1.08, focus: [0.5, 0.45], rotation: TILT }));
  const coloured = useRef(false);

  // colour responds the moment the pointer arrives and eases to a stop; he straightens up a little as it does
  const colour = (on: boolean) => {
    if (prefersReducedMotion()) return;
    coloured.current = on;
    gsap.to(ctrl, { reveal: on ? PAINTED : SKETCH, duration: on ? 1.4 : 1.1, ease: on ? "power2.out" : "power2.inOut", overwrite: "auto" });
    gsap.to(art.current, {
      rotation: on ? TILT * 0.3 : TILT,
      scale: on ? 1.025 : 1,
      duration: 1.2,
      ease: "power3.out",
      overwrite: "auto",
      // the canvas can't see CSS transforms: hand it the angle as it changes
      onUpdate: () => void (ctrl.rotation = Number(gsap.getProperty(art.current, "rotation"))),
    });
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      SplitText.create(".hero-name", {
        type: "chars",
        charsClass: "hero-char",
        mask: "chars",
        autoSplit: true,
        onSplit: (self) => gsap.from(self.chars, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.045, delay: 0.25 }),
      });
      gsap.from(".hero-fade", { opacity: 0, y: 14, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.7 });

      // he draws himself in graphite and stays that way; colour waits for a hover
      gsap
        .timeline({ delay: 0.2 })
        .to(ctrl, { draw: 1, duration: 2.4, ease: "power2.inOut" })
        .to(ctrl, { zoom: 1, duration: 3.2, ease: "power3.out" }, 0)
        .from(".hero-caption path", { drawSVG: 0, duration: 0.8, ease: "power2.out" }, "-=1");

      // he leans a little toward the mouse
      const x = gsap.quickTo(art.current, "x", { duration: 1.2, ease: "power3" });
      const y = gsap.quickTo(art.current, "y", { duration: 1.2, ease: "power3" });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        x((e.clientX / window.innerWidth - 0.5) * 24);
        y((e.clientY / window.innerHeight - 0.5) * 16);
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      // leaving the hero: the art drifts up slower than the page, the name faster
      const leave = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-art", { yPercent: 14, ease: "none", scrollTrigger: leave });
      gsap.to(".hero-name", { yPercent: -40, ease: "none", scrollTrigger: leave });

      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root }
  );

  return (
    <section id="top" ref={root} className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-8 pt-24 md:px-10 md:pb-10">
      <div className="hero-art absolute inset-x-5 top-[20svh] md:left-auto md:right-[6vw] md:top-[13vh] md:w-[44vw]">
        <div
          ref={art}
          style={{ transform: `rotate(${TILT}deg)` }}
          onPointerEnter={(e) => e.pointerType !== "touch" && colour(true)}
          onPointerLeave={(e) => e.pointerType !== "touch" && colour(false)}
          // no hover on touch screens: a tap toggles it instead
          onPointerUp={(e) => e.pointerType === "touch" && colour(!coloured.current)}
        >
          <ArtImage
            src="/desk/pencil-shades.webp"
            alt="Pencil, Abishek's cartoon self, in shades with a giant pencil over his shoulder"
            width={1100}
            height={781}
            sizes="(max-width: 768px) 100vw, 44vw"
            mode="manual"
            control={ctrl}
            preload
          />
        </div>
        <p className="hero-fade font-marker mt-3 flex items-center justify-end gap-2 text-base text-smoke md:text-lg">
          that&apos;s me, Pencil — <span className="md:hidden">tap</span>
          <span className="hidden md:inline">hover</span> to colour me in
          <svg className="hero-caption h-6 w-8 -rotate-12" viewBox="0 0 40 32" fill="none" aria-hidden>
            <path d="M4 22 C 14 26, 26 22, 34 12 M34 12 l-8 1 M34 12 l-1 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </p>
      </div>

      <div className="relative">
        <p className="hero-fade mb-3 text-sm font-medium text-smoke md:mb-0 md:text-base">
          Visual artist from Visakhapatnam — <span className="font-[family-name:var(--font-accent)] text-lg text-ink md:text-xl">a.k.a. Pencil</span>
        </p>
        <h1 className="hero-name display -ml-[0.05em] text-[25vw] leading-[0.82] md:text-[17vw]">Abishek</h1>
        <div className="hero-fade mt-5 flex items-end justify-between gap-6 text-sm text-smoke">
          <p className="max-w-[18rem]">Graphite, charcoal, ink, pixels, motion — and walls the size of buildings.</p>
          <p className="hidden items-center gap-2 md:flex">
            Scroll
            <span className="block h-8 w-px origin-top animate-[scroll-hint_1.8s_ease-in-out_infinite] bg-ink/40" />
          </p>
        </div>
      </div>
    </section>
  );
}
