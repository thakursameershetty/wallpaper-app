"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Lightbox } from "@/components/graphite/Lightbox";
import { prefersReducedMotion } from "@/components/graphite/gsap";
import { PaperEdge, Tape } from "./bits";
import { ReelCarousel } from "./ReelCarousel";
import { CHAPTERS, chapterId, type Chapter, type Video } from "./contents";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.8, ease },
};

/**
 * Every chapter from the Contents page, one after another. Work made by hand sits on paper, work
 * made on screen sits in the dark; where one gives way to the other, the paper is torn.
 */
export function Chapters() {
  return (
    <>
      {CHAPTERS.map((c, i) => (
        <ChapterSection key={c.slug} chapter={c} n={i + 1} prev={CHAPTERS[i - 1]?.tone ?? "dark"} next={CHAPTERS[i + 1]?.tone ?? "dark"} />
      ))}
    </>
  );
}

type Tone = Chapter["tone"];

function ChapterSection({ chapter: c, n, prev, next }: { chapter: Chapter; n: number; prev: Tone; next: Tone }) {
  const [open, setOpen] = useState<number | null>(null);
  const dark = c.tone === "dark";
  // chapters on the same surface run on from each other, split by a hairline
  const rule = prev === c.tone ? (dark ? "border-t border-white/10" : "border-t border-[#161616]/10") : "";

  return (
    <section
      id={chapterId(c)}
      aria-labelledby={`${chapterId(c)}-title`}
      className={dark ? "bg-[#0e0e0e] text-white" : "text-[#161616]"}
      style={{ "--accent": c.accent } as CSSProperties}
    >
      {!dark && prev === "dark" && <PaperEdge side="top" seed={n * 11} />}
      <div className={dark ? "" : "sheet"}>
        <div className={`mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28 ${rule}`}>
          {c.layout === "pinboard" && <Pinboard chapter={c} n={n} onOpen={setOpen} />}
          {c.layout === "feature" && <Feature chapter={c} n={n} onOpen={setOpen} />}
          {c.layout === "spread" && <Spread chapter={c} n={n} onOpen={setOpen} />}
          {c.layout === "film" && <Film chapter={c} n={n} />}
          {c.layout === "walls" && <Walls chapter={c} n={n} />}
        </div>
      </div>
      {!dark && next === "dark" && <PaperEdge side="bottom" seed={n * 11 + 5} />}
      {c.pieces.length > 0 && <Lightbox pieces={c.pieces} index={open} onChange={setOpen} />}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The chapter's title block                                           */
/* ------------------------------------------------------------------ */

function Head({ chapter: c, n, compact }: { chapter: Chapter; n: number; compact?: boolean }) {
  const dark = c.tone === "dark";
  const count =
    c.pieces.length > 1 ? ` · ${c.pieces.length} pieces` : c.videos.length > 1 ? ` · ${c.videos.length} ${c.layout === "walls" ? "walls" : "films"}` : "";
  return (
    <motion.header {...rise} className={compact ? "" : "flex flex-wrap items-end justify-between gap-x-10 gap-y-5"}>
      <div>
        {/* the same label as the chapter's strip on the Contents page */}
        <p
          className={`inline-block border px-3 py-1 font-marker text-sm font-bold md:text-base ${
            dark ? "border-[var(--accent)] text-white" : "border-[#161616] bg-[var(--accent)] text-[#161616]"
          }`}
        >
          Chapter {n}
        </p>
        <h2 id={`${chapterId(c)}-title`} className={`display mt-5 ${compact ? "text-[12vw] md:text-[4.6vw]" : "text-[13vw] md:text-[7vw]"}`}>
          {c.title}
        </h2>
      </div>
      <div className={`${compact ? "mt-4" : "pb-2 md:ml-auto md:text-right"} text-sm ${dark ? "text-white/55" : "text-[#555]"}`}>
        <p>
          {c.note}
          {count}
        </p>
        <a href="#work" className={`mt-1 inline-block underline-offset-4 hover:underline ${dark ? "hover:text-white" : "hover:text-[#161616]"}`}>
          ↑ Back to contents
        </a>
      </div>
    </motion.header>
  );
}

type LayoutProps = { chapter: Chapter; n: number; onOpen: (i: number) => void };

/* ------------------------------------------------------------------ */
/* Pinboard: many sketches, taped up at slight angles                  */
/* ------------------------------------------------------------------ */

const TILTS = [-2.4, 1.8, -1.2, 2.2, -1.8, 1.3];

function Pinboard({ chapter: c, n, onOpen }: LayoutProps) {
  return (
    <>
      <Head chapter={c} n={n} />
      <div className="mt-14 columns-2 gap-5 md:mt-20 md:columns-3 md:gap-12">
        {c.pieces.map((p, i) => (
          <motion.figure
            key={p.src}
            {...rise}
            transition={{ ...rise.transition, delay: (i % 3) * 0.08 }}
            className="group relative mb-10 break-inside-avoid md:mb-14"
            style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
          >
            <div className="rotate-[var(--tilt)] bg-white p-[4%] shadow-[0_12px_28px_rgb(0_0_0/0.14)] transition-[rotate,translate,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-0 group-hover:shadow-[0_22px_40px_rgb(0_0_0/0.2)]">
              <Image src={p.src} alt={`${c.title} by Abishek, piece ${i + 1}`} width={p.size[0]} height={p.size[1]} sizes="(max-width: 768px) 45vw, 30vw" className="h-auto w-full" />
            </div>
            <Tape className="absolute -top-3 left-1/2 h-6 w-[38%] -translate-x-1/2" rotate={i % 2 ? 4 : -3} />
            <button type="button" onClick={() => onOpen(i)} data-cursor="view" aria-label={`View ${c.title}, piece ${i + 1}`} className="absolute inset-0" />
          </motion.figure>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Feature: one big piece at a time, the rest waiting alongside        */
/* ------------------------------------------------------------------ */

function Feature({ chapter: c, n, onOpen }: LayoutProps) {
  const [active, setActive] = useState(0);
  const thumbs = useRef<HTMLOListElement>(null);
  const moved = useRef(false);
  const total = c.pieces.length;
  const p = c.pieces[active];
  const step = (d: number) => setActive((i) => (i + d + total) % total);

  // keep the chosen thumbnail in sight within its own scrolling strip, without moving the page
  // (the strip is `relative`, so each thumbnail's offsets are measured from it)
  useEffect(() => {
    const strip = thumbs.current;
    const el = strip?.children[active] as HTMLElement | undefined;
    // on first load the strip stays at its start
    if (!moved.current) {
      moved.current = true;
      return;
    }
    if (!strip || !el) return;
    const sideways = strip.scrollWidth > strip.clientWidth + 1;
    strip.scrollTo({
      left: sideways ? el.offsetLeft - strip.clientWidth / 2 + el.offsetWidth / 2 : 0,
      top: sideways ? 0 : el.offsetTop - strip.clientHeight / 2 + el.offsetHeight / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    <>
      <Head chapter={c} n={n} />
      <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-12 md:gap-10">
        <div
          className="relative h-[60svh] outline-none md:col-span-8 md:h-[78vh]"
          tabIndex={0}
          aria-label={`${c.title}: use the arrow keys to move between pieces`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={p.src}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease }}
              className="absolute inset-0"
            >
              <Image src={p.src} alt={`${c.title} by Abishek, piece ${active + 1}`} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-contain" />
              <button type="button" onClick={() => onOpen(active)} data-cursor="view" aria-label={`View ${c.title}, piece ${active + 1}, full size`} className="absolute inset-0" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 translate-y-full items-center gap-4 md:-bottom-4">
            <button type="button" onClick={() => step(-1)} aria-label="Previous piece" className="grid size-10 place-items-center rounded-full border border-white/20 text-lg transition-colors hover:border-[var(--accent)] hover:bg-white/5">
              ←
            </button>
            <span className="min-w-[4.5rem] text-center font-marker text-base font-bold tabular-nums">
              {String(active + 1).padStart(2, "0")} <span className="text-white/40">/ {String(total).padStart(2, "0")}</span>
            </span>
            <button type="button" onClick={() => step(1)} aria-label="Next piece" className="grid size-10 place-items-center rounded-full border border-white/20 text-lg transition-colors hover:border-[var(--accent)] hover:bg-white/5">
              →
            </button>
          </div>
        </div>

        {/* a sideways strip on phones; a grid that scrolls within the viewer's height on wider screens */}
        <ol
          ref={thumbs}
          data-lenis-prevent
          className="relative -mx-5 mt-16 flex gap-3 overflow-x-auto px-5 py-1 md:col-span-4 md:mx-0 md:mt-0 md:grid md:h-[78vh] md:grid-cols-4 md:content-start md:gap-3 md:overflow-y-auto md:overflow-x-hidden md:p-1.5 md:pr-3"
        >
          {c.pieces.map((q, i) => (
            <li key={q.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`Show piece ${i + 1}`}
                className={`relative block aspect-square w-16 overflow-hidden rounded-md bg-white/5 transition-[opacity,box-shadow] duration-300 md:w-full ${
                  i === active ? "opacity-100 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[#0e0e0e]" : "opacity-45 hover:opacity-90"
                }`}
              >
                <Image src={q.src} alt="" fill sizes="(max-width: 768px) 64px, 8vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Spread: a single piece across a page, the words opposite            */
/* ------------------------------------------------------------------ */

function Spread({ chapter: c, n, onOpen }: LayoutProps) {
  const p = c.pieces[0];
  // alternate sides down the run of single-piece chapters
  const flip = n % 2 === 0;
  return (
    <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
      <motion.figure
        {...rise}
        className={`group relative md:col-span-7 ${flip ? "md:order-2" : "md:order-1"}`}
        style={{ "--tilt": flip ? "1.6deg" : "-1.6deg" } as CSSProperties}
      >
        <div className="mx-auto w-fit rotate-[var(--tilt)] bg-white p-3 shadow-[0_16px_36px_rgb(0_0_0/0.16)] transition-[rotate,translate] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-0 md:p-4">
          <Image
            src={p.src}
            alt={`${c.title} by Abishek`}
            width={p.size[0]}
            height={p.size[1]}
            sizes="(max-width: 768px) 90vw, 50vw"
            className="h-auto max-h-[72vh] w-auto"
          />
        </div>
        <button type="button" onClick={() => onOpen(0)} data-cursor="view" aria-label={`View ${c.title} full size`} className="absolute inset-0" />
      </motion.figure>
      {/* on phones the title always comes first */}
      <div className={`order-first md:col-span-5 ${flip ? "md:order-1" : "md:order-2"}`}>
        <Head chapter={c} n={n} compact />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Film and walls: moving pictures                                     */
/* ------------------------------------------------------------------ */

function Film({ chapter: c, n }: { chapter: Chapter; n: number }) {
  return (
    <>
      <Head chapter={c} n={n} />
      {/* one film plays full width; as more arrive they line up in a carousel */}
      <motion.div {...rise} className="mt-14 md:mt-20">
        {c.videos.length > 1 ? <ReelCarousel videos={c.videos} /> : <Clip video={c.videos[0]} className="aspect-video" />}
      </motion.div>
    </>
  );
}

function Walls({ chapter: c, n }: { chapter: Chapter; n: number }) {
  return (
    <>
      <Head chapter={c} n={n} />
      <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-2 md:gap-8">
        {c.videos.map((v, i) => (
          <motion.figure key={v.src} {...rise} transition={{ ...rise.transition, delay: i * 0.1 }}>
            <Clip video={v} className="aspect-video" />
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-marker text-2xl font-bold">{v.label}</span>
              {v.href && (
                <a href={v.href} target="_blank" rel="noreferrer" className="text-sm text-white/55 underline-offset-4 hover:text-white hover:underline">
                  Watch on Instagram ↗
                </a>
              )}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </>
  );
}

/** A muted, looping clip that plays only while it's on screen, with a button for sound. */
function Clip({ video: v, className = "" }: { video: Video; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // with reduced motion nothing plays by itself: the browser's own controls are there instead
    if (prefersReducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- preference check needs the browser
      setStill(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      <video ref={ref} src={v.src} poster={v.poster} muted={muted} loop playsInline preload="none" controls={still} aria-label={v.label} className="h-full w-full object-cover" />
      {!still && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/75"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {muted ? "Sound off" : "Sound on"}
        </button>
      )}
    </div>
  );
}
