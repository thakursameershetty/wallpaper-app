"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";
import { graphite } from "./store";

let lenis: Lenis | null = null;

/** Freeze or release the page scroll (menus and the lightbox). */
export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/** Glide to a section ("#work"); falls back to a jump without smooth scroll. */
export function scrollToTarget(href: string) {
  if (lenis) {
    lenis.start();
    lenis.scrollTo(href, { duration: 1.6 });
  } else document.querySelector(href)?.scrollIntoView();
}

/** One smooth-scroll loop for the page: Lenis, driven by GSAP's ticker, feeding ScrollTrigger and the WebGL layer. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    graphite.reducedMotion = prefersReducedMotion();
    if (graphite.reducedMotion) return;

    const instance = new Lenis({ lerp: 0.09, anchors: true });
    lenis = instance;
    instance.on("scroll", (l: Lenis) => {
      graphite.velocity = l.velocity;
      ScrollTrigger.update();
    });
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}
