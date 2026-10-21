"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { lockScroll } from "./SmoothScroll";

export type Piece = { src: string; category: string; size: [number, number] };

const ease = [0.76, 0, 0.24, 1] as const;
const noop = () => () => {};

/** Full-colour view of one piece. Arrow keys, buttons or a swipe move through the set. */
export function Lightbox({ pieces, index, onChange }: { pieces: Piece[]; index: number | null; onChange: (i: number | null) => void }) {
  const n = pieces.length;
  const [dir, setDir] = useState(1);
  const close = useCallback(() => onChange(null), [onChange]);
  const step = useCallback(
    (d: number) => {
      if (index === null) return;
      setDir(d);
      onChange((index + d + n) % n);
    },
    [index, n, onChange]
  );

  const isOpen = index !== null;
  useEffect(() => {
    if (!isOpen) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  const piece = index !== null ? pieces[index] : null;
  // rendered into <body>: the sketchbook is pinned, and a pinned parent would trap a fixed overlay
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {piece && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={piece.category}
          className="fixed inset-0 z-[60] flex flex-col bg-[#161514] text-paper"
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="flex items-center justify-between px-5 py-5 text-sm md:px-10">
            <span className="tabular-nums text-paper/60">
              {String(index! + 1).padStart(2, "0")} / {n} · <span className="text-paper">{piece.category}</span>
            </span>
            <button aria-label="Close" onClick={close} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
              <X size={20} />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={piece.src}
                custom={dir}
                className="absolute inset-0 px-5 pb-6 md:px-24"
                initial={{ x: `${dir * 30}%`, opacity: 0 }}
                animate={{ x: "0%", opacity: 1 }}
                exit={{ x: `${dir * -30}%`, opacity: 0 }}
                transition={{ duration: 0.6, ease }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) step(1);
                  else if (info.offset.x > 80) step(-1);
                }}
              >
                <div className="relative h-full w-full">
                  <Image src={piece.src} alt={`${piece.category} by Abishek`} fill sizes="100vw" className="pointer-events-none object-contain" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-3 pb-6">
            <button aria-label="Previous" onClick={() => step(-1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
              <ArrowLeft size={20} />
            </button>
            <button aria-label="Next" onClick={() => step(1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
