"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { IMAGE_SIZES, WORK } from "@/components/desk/data";
import { ArtImage } from "./ArtImage";
import { Lightbox, type Piece } from "./Lightbox";
import { gsap, useGSAP } from "./gsap";

const PIECES: Piece[] = WORK.flatMap((c) => c.images.map((src) => ({ src, category: c.title, size: IMAGE_SIZES[src] ?? [4, 5] })));

// a loose, hand-pinned rhythm: alternating heights and offsets down the strip
const HEIGHTS = ["h-[46vh]", "h-[36vh]", "h-[52vh]", "h-[40vh]"];
const OFFSETS = ["self-start", "self-end", "self-center", "self-end"];

export function Sketchbook() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      const t = track.current!;
      const distance = () => Math.max(0, t.scrollWidth - window.innerWidth);
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", t);
      let current = 0;

      gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          // the strip travels faster than the page scrolls, so sixteen pieces don't take forever
          end: () => `+=${distance() * 0.6}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(bar.current, { scaleX: self.progress });
            // the piece nearest the middle names the chapter
            const mid = window.innerWidth / 2;
            let best = 0;
            let bestD = Infinity;
            cards.forEach((c, i) => {
              const r = c.getBoundingClientRect();
              const d = Math.abs(r.left + r.width / 2 - mid);
              if (d < bestD) {
                bestD = d;
                best = i;
              }
            });
            if (best !== current) {
              current = best;
              setActive(best);
            }
          },
        },
      });

      gsap.from(".sb-title-line > span", {
        yPercent: 105,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    },
    { scope: root }
  );

  const piece = PIECES[active];

  return (
    <section id="work" ref={root} className="relative flex h-[100svh] flex-col overflow-hidden pb-6 pt-24 md:pb-8 md:pt-28">
      <div className="flex items-end justify-between gap-6 px-5 md:px-10">
        <h2 className="display text-[11vw] leading-[0.9] md:text-[5.6vw]">
          <span className="sb-title-line block overflow-hidden">
            <span className="block">Fresh off</span>
          </span>
          <span className="sb-title-line block overflow-hidden pb-[0.08em]">
            <span className="block">
              <em>the desk.</em>
            </span>
          </span>
        </h2>
        <div className="text-right text-sm">
          <p className="tabular-nums text-smoke">
            {String(active + 1).padStart(2, "0")} / {PIECES.length}
          </p>
          <div className="relative mt-1 h-6 overflow-hidden font-medium">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={piece.category}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
                className="whitespace-nowrap"
              >
                {piece.category}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div ref={track} className="mt-6 flex min-h-0 flex-1 items-stretch gap-[6vw] pl-5 pr-[10vw] will-change-transform md:mt-8 md:gap-[4.5vw] md:pl-10">
        {PIECES.map((p, i) => (
          <figure key={p.src} data-card className={`flex flex-none flex-col ${OFFSETS[i % OFFSETS.length]}`}>
            <button onClick={() => setOpen(i)} data-cursor="view" className="group block cursor-zoom-in text-left" aria-label={`Open ${p.category}, piece ${i + 1}`}>
              <ArtImage
                src={p.src}
                alt={`${p.category} by Abishek`}
                width={p.size[0]}
                height={p.size[1]}
                sizes="(max-width: 768px) 60vw, 34vw"
                mode="x"
                className={`${HEIGHTS[i % HEIGHTS.length]} max-h-[58vh] transition-transform duration-500 ease-out group-hover:scale-[0.98]`}
              />
            </button>
            <figcaption className="mt-3 flex justify-between gap-4 text-xs text-smoke">
              <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span>{p.category}</span>
            </figcaption>
          </figure>
        ))}

        <Link href="/desk" data-cursor="see all" className="group flex flex-none flex-col items-start justify-center gap-6 self-center pr-[4vw]">
          <span className="display text-[12vw] leading-[0.9] md:text-[6vw]">
            See every
            <br />
            <em>piece</em>
          </span>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-paper transition-transform duration-500 ease-out group-hover:-rotate-45 group-hover:scale-110">
            <ArrowRight size={24} />
          </span>
        </Link>
      </div>

      <div className="mx-5 mt-4 h-px bg-ink/10 md:mx-10">
        <div ref={bar} className="h-px origin-left scale-x-0 bg-ink" />
      </div>

      <Lightbox pieces={PIECES} index={open} onChange={setOpen} />
    </section>
  );
}
