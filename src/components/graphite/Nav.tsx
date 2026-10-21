"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { lockScroll, scrollToTarget } from "./SmoothScroll";
import { ScrollTrigger, useGSAP } from "./gsap";
import { EMAIL } from "@/components/desk/data";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Wall art", href: "#wall-art" },
  { label: "Reel", href: "#reel" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const ease = [0.76, 0, 0.24, 1] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  // over the dark reel the logo and button flip to light
  const [overDark, setOverDark] = useState(false);
  const light = open || overDark;

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: "#reel",
      // flip halfway through the page's fade to graphite and back (see Reel)
      start: "top 57%",
      end: "bottom 42%",
      // measured after the pinned sections above have added their scroll distance
      refreshPriority: -1,
      onToggle: (self) => setOverDark(self.isActive),
    });
  });

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10">
        <a href="#top" className="pointer-events-auto" aria-label="Abishek — back to top">
          <Image
            src="/desk/logo-abishek.webp"
            alt="Abishek"
            width={900}
            height={553}
            className={`h-9 w-auto transition-[filter] duration-500 ${light ? "invert" : ""}`}
            preload
          />
        </a>
        <div className="pointer-events-auto flex items-center gap-2">
          <Link href="/gallery" className={`hidden rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-500 sm:block ${light ? "text-paper/70 hover:text-paper" : "text-ink/70 hover:text-ink"}`}>
            Wallpapers ↗
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            className={`group relative flex h-11 items-center gap-3 overflow-hidden rounded-full pl-5 pr-4 text-sm font-medium transition-colors duration-500 ${
              light ? "bg-paper text-ink" : "bg-ink text-paper"
            }`}
          >
            <span className="relative block h-5 overflow-hidden">
              <motion.span className="block" animate={{ y: open ? "-100%" : "0%" }} transition={{ duration: 0.4, ease }}>
                <span className="block h-5 leading-5">Menu</span>
                <span className="block h-5 leading-5">Close</span>
              </motion.span>
            </span>
            <span className="relative block h-2.5 w-4">
              <motion.span className="absolute left-0 top-0 block h-px w-4 bg-current" animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.4, ease }} />
              <motion.span className="absolute bottom-0 left-0 block h-px w-4 bg-current" animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} transition={{ duration: 0.4, ease }} />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-menu"
            aria-label="Site"
            className="fixed inset-0 z-[45] flex flex-col justify-between bg-ink px-5 pb-8 pt-28 text-paper md:px-10"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease }}
          >
            <ul>
              {LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      scrollToTarget(l.href);
                    }}
                    className="display group flex items-baseline gap-4 py-1 text-[13vw] leading-[1.02] md:text-[7.5vw]"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.05 }}
                  >
                    <span className="text-sm font-medium tabular-nums text-paper/40">0{i + 1}</span>
                    <span className="transition-[font-style,letter-spacing] duration-300 group-hover:font-[family-name:var(--font-accent)] group-hover:font-normal">
                      {l.label}
                    </span>
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="flex flex-col justify-between gap-3 text-sm text-paper/60 md:flex-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              <a href={`mailto:${EMAIL}`} className="hover:text-paper">
                {EMAIL}
              </a>
              <Link href="/gallery" className="hover:text-paper">
                Wallpapers ↗
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
