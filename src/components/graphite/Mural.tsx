"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { WALL_ART_VIDEOS } from "@/components/desk/data";
import { ArtImage, type ArtControl } from "./ArtImage";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

/**
 * The finale. Pinned: we start nose-to-the-wall on a single sketched stroke, and pull back
 * while the paint floods in until the whole mural is in view. Then the film of it being made.
 */
export function Mural() {
  const root = useRef<HTMLElement>(null);
  const [art] = useState<ArtControl>(() => ({ draw: 0.5, reveal: 0, zoom: 2.2, focus: [0.55, 0.62] }));

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".mural-stage", start: "top top", end: "+=260%", pin: true, scrub: 1 },
      });
      tl.to(art, { zoom: 1, duration: 1, ease: "power2.inOut" }, 0)
        .to(art, { draw: 1, duration: 0.35 }, 0)
        .to(art, { reveal: 1, duration: 0.5 }, 0.35)
        .to(".mural-line-1", { yPercent: -60, opacity: 0, duration: 0.25 }, 0.22)
        .fromTo(".mural-line-2 > span > span", { yPercent: 110 }, { yPercent: 0, duration: 0.25, stagger: 0.05, ease: "power3.out" }, 0.62)
        .fromTo(".mural-scrim", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.6);
    },
    { scope: root }
  );

  return (
    <section id="wall-art" ref={root}>
      <div className="mural-stage relative h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <ArtImage
            src="/media/wall-art-2.jpg"
            alt="Abishek painting a giant mural portrait on a concrete wall at Pencil Ground, Vizag"
            width={1280}
            height={720}
            sizes="100vw"
            mode="manual"
            control={art}
            fit={false}
            className="h-full w-full"
          />
        </div>
        <div className="mural-scrim pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0" />

        <div className="relative flex h-full flex-col justify-end px-5 pb-10 md:px-10 md:pb-14">
          <p className="mural-line-1 display absolute left-5 top-[22%] max-w-[12ch] text-[12vw] leading-[0.92] md:left-10 md:text-[7vw]">
            Then the pencil got <em>bigger.</em>
          </p>
          <h2 className="mural-line-2 display text-[12vw] leading-[0.92] text-paper md:text-[7.5vw]">
            <span className="block overflow-hidden">
              <span className="block">Vizag&apos;s biggest</span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <span className="block">
                <em>wall art.</em>
              </span>
            </span>
          </h2>
        </div>
      </div>

      <MuralFilm />
    </section>
  );
}

function MuralFilm() {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [inView, setInView] = useState(false);
  const clip = WALL_ART_VIDEOS[index];

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // nothing downloads until the film is on screen, and it pauses once you scroll past
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, index]);

  return (
    <div className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <p className="max-w-md text-lg leading-relaxed text-ink/70 md:text-xl">
            Bare concrete to a towering canvas, stroke by stroke — at Pencil Ground, Visakhapatnam.
          </p>
          <div role="tablist" aria-label="Murals" className="flex gap-2">
            {WALL_ART_VIDEOS.map((v, i) => (
              <button
                key={v.src}
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${i === index ? "text-paper" : "text-ink/60 hover:text-ink"}`}
              >
                {i === index && <motion.span layoutId="mural-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="relative">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div
          ref={frame}
          className="relative mt-8 aspect-[4/5] overflow-hidden rounded-2xl bg-ink sm:aspect-video"
          initial={{ clipPath: "inset(12% 8% 12% 8% round 24px)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 16px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        >
          <video
            ref={video}
            key={clip.src}
            src={clip.src}
            poster={clip.poster}
            muted={muted}
            playsInline
            preload="none"
            onEnded={() => setIndex((i) => (i + 1) % WALL_ART_VIDEOS.length)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
            <a
              href={clip.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-black/55 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/75"
            >
              Watch on Instagram <ArrowUpRight size={15} />
            </a>
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
