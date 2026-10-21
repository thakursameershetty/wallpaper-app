"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { INSTAGRAM_URL, WORK, workHref } from "@/components/desk/data";
import { Eyebrow, Stroke } from "./Stroke";

interface Piece {
  src: string;
  category: string;
}

const ALL = "All";
const ALL_PIECES: Piece[] = WORK.flatMap((c) => c.images.map((src) => ({ src, category: c.title })));

export function Work({ initialFilter = ALL, syncUrl = false, children }: { initialFilter?: string; syncUrl?: boolean; children?: React.ReactNode } = {}) {
  const [filter, setFilter] = useState(initialFilter);
  const [open, setOpen] = useState<number | null>(null);

  const pieces = useMemo(
    () => (filter === ALL ? ALL_PIECES : ALL_PIECES.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <section id="work" className="scroll-mt-16 border-t border-[var(--rule)] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Selected work</Eyebrow>
            <h2 className="display mt-4 text-5xl md:text-6xl">
              Fresh off <Stroke><em>the desk.</em></Stroke>
            </h2>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-ink/65">
            Graphite, charcoal, ink, watercolour and pixels — a few favourites.
          </p>
        </div>

        <div role="tablist" aria-label="Filter by medium" className="-mx-5 mt-10 flex gap-6 overflow-x-auto border-b border-[var(--rule)] px-5 md:mx-0 md:px-0">
          {[ALL, ...WORK.map((c) => c.title)].map((t) => {
            const active = t === filter;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setFilter(t);
                  // on its own page, the address follows the tab, so any view can be shared or bookmarked
                  if (syncUrl) window.history.replaceState(null, "", workHref(t === ALL ? undefined : t));
                }}
                className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                  active ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* re-keyed per filter so the new set simply fades in, rather than shuffling around */}
        <ul key={filter} className="fade-in mt-10 columns-2 gap-4 md:columns-3 md:gap-6">
          {pieces.map((p, i) => (
            <li key={p.src} className="mb-4 break-inside-avoid md:mb-6">
              <button onClick={() => setOpen(i)} className="group block w-full overflow-hidden rounded-md bg-stone text-left">
                <Image
                  src={p.src}
                  alt={`${p.category} by Abishek`}
                  width={800}
                  height={1000}
                  sizes="(max-width: 768px) 48vw, 370px"
                  className="h-auto w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </button>
              <p className="mt-2 text-xs font-medium text-smoke">{p.category}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
            More on Instagram <ArrowUpRight size={16} />
          </a>
          <Link href="/gallery" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
            Get the art as wallpapers <ArrowUpRight size={16} />
          </Link>
        </div>
        {children}
      </div>

      <Lightbox pieces={pieces} index={open} onChange={setOpen} />
    </section>
  );
}

function Lightbox({ pieces, index, onChange }: { pieces: Piece[]; index: number | null; onChange: (i: number | null) => void }) {
  const n = pieces.length;
  const close = useCallback(() => onChange(null), [onChange]);
  const step = useCallback((d: number) => index !== null && onChange((index + d + n) % n), [index, n, onChange]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  if (index === null) return null;
  const piece = pieces[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={piece.category}
      className="fade-in fixed inset-0 z-[100] flex flex-col bg-[#141312]/95 text-paper"
      onClick={close}
    >
      <div className="flex items-center justify-between px-5 py-4 text-sm">
        <span className="text-paper/70">
          {piece.category} · {index + 1} / {n}
        </span>
        <button aria-label="Close" onClick={close} className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
          <X size={22} />
        </button>
      </div>

      <div className="relative flex-1 px-4 pb-6 md:px-20">
        <div key={piece.src} className="fade-in relative h-full w-full" onClick={(e) => e.stopPropagation()}>
          <Image src={piece.src} alt={`${piece.category} by Abishek`} fill sizes="(max-width: 768px) 100vw, 1000px" className="object-contain" />
        </div>
      </div>

      {n > 1 && (
        <>
          <ArrowButton side="left" onClick={() => step(-1)} />
          <ArrowButton side="right" onClick={() => step(1)} />
        </>
      )}
    </div>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      aria-label={side === "left" ? "Previous" : "Next"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 ${
        side === "left" ? "left-3 md:left-5" : "right-3 md:right-5"
      }`}
    >
      <Icon size={24} />
    </button>
  );
}
