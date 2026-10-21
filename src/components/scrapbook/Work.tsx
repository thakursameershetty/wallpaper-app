"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CHAPTERS, chapterId, type Chapter } from "./contents";

/**
 * The table of contents: one tall strip per kind of work, staggered like pages pulled from a stack,
 * each jumping down to its own chapter below.
 */
export function Work() {
  return (
    <section id="work" className="relative overflow-hidden bg-[#0e0e0e] px-5 pb-24 pt-14 text-white md:px-10 md:pb-32 md:pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 20, rotate: -6 }}
            whileInView={{ opacity: 1, y: 0, rotate: -3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-marker text-5xl font-bold md:text-7xl"
          >
            Contents
          </motion.h2>
          <p className="max-w-[19rem] text-right text-sm text-white/55">{CHAPTERS.length} chapters, one pencil. Pick one to open it.</p>
        </div>

        {/* a sideways scroll on phones, all side by side on wider screens */}
        <ol className="-mx-5 mt-12 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-6 md:mx-0 md:mt-16 md:gap-[2.2%] md:overflow-visible md:px-0 md:pb-0">
          {CHAPTERS.map((c, i) => (
            <motion.li
              key={c.title}
              initial={{ clipPath: "inset(100% 0 0 0)", y: 40 }}
              whileInView={{ clipPath: "inset(0% 0 0 0)", y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: i * 0.08 }}
              className={`w-[44vw] shrink-0 snap-start md:w-auto md:flex-1 ${i % 2 ? "mt-12 md:mt-[6vw]" : ""}`}
            >
              <ChapterStrip chapter={c} n={i + 1} />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ChapterStrip({ chapter: c, n }: { chapter: Chapter; n: number }) {
  return (
    <a href={`#${chapterId(c)}`} data-cursor="open" className="group block" style={{ ["--accent" as string]: c.accent }}>
      <div className="relative">
        <div className="relative aspect-[9/24] overflow-hidden md:aspect-[9/30]">
          <Image
            src={c.cover}
            alt=""
            fill
            sizes="(max-width: 768px) 44vw, 13vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            style={{ objectPosition: c.focus }}
          />
          {/* printed-page halftone, lifted on hover */}
          <div aria-hidden className="halftone absolute inset-0 transition-opacity duration-500 group-hover:opacity-0" />
        </div>
        <span className="absolute inset-x-[6%] bottom-0 translate-y-1/2 border border-[var(--accent)] bg-[#0e0e0e]/90 py-1.5 text-center font-marker text-sm font-bold text-white transition-colors duration-300 group-hover:bg-[var(--accent)] group-hover:text-[#0e0e0e] md:text-[clamp(11px,1vw,15px)]">
          Chapter {n}
        </span>
      </div>
      <p className="mt-8 text-[13px] font-semibold leading-tight md:text-sm">{c.title}</p>
      <p className="mt-1 text-xs text-white/55">{c.note}</p>
    </a>
  );
}
