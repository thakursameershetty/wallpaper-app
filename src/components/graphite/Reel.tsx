"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { YOUTUBE_URL } from "@/components/desk/data";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "./gsap";

export function Reel() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [inView, setInView] = useState(false);

  // the phone tilts toward the cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 18 });

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      SplitText.create(".reel-title", {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".reel-title", start: "top 80%" } }),
      });
      const page = document.querySelector(".graphite");
      gsap.fromTo(page, { backgroundColor: "#f3f0e9" }, { backgroundColor: "#1f1e1c", ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 30%", scrub: true } });
      gsap.fromTo(
        page,
        { backgroundColor: "#1f1e1c" },
        { backgroundColor: "#f3f0e9", ease: "none", immediateRender: false, scrollTrigger: { trigger: root.current, start: "bottom 70%", end: "bottom 15%", scrub: true } }
      );
      gsap.from(".reel-phone", { y: 120, rotate: 6, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } });
    },
    { scope: root }
  );

  return (
    <section
      id="reel"
      ref={root}
      className="relative overflow-hidden px-5 py-28 text-paper md:px-10 md:py-40"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-sm font-medium text-paper/50">Showreel</p>
          <h2 className="reel-title display mt-5 text-[13vw] leading-[0.92] md:text-[6.5vw]">
            Drawings that <em>refuse</em> to sit still.
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/60">
            3D animation, motion design and visual storytelling — the sketchbook, set in motion.
          </p>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 border-b border-paper/30 pb-1 text-sm font-medium transition-colors hover:border-paper"
          >
            More on YouTube <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="md:col-span-5" style={{ perspective: 1200 }}>
          <motion.button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            style={{ rotateX, rotateY }}
            className="reel-phone group relative mx-auto block aspect-[9/16] w-full max-w-[330px] overflow-hidden rounded-[2rem] border-[6px] border-[#2c2b29] bg-graphite shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
          >
            <video ref={video} src="/media/showreel.mp4" poster="/media/showreel.jpg" muted={muted} loop playsInline preload="none" className="h-full w-full object-cover" />
            <span className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-black/55 px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-black/75">
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {muted ? "Tap for sound" : "Sound on"}
            </span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
