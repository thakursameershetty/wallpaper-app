"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EMAIL, INSTAGRAM_URL, YOUTUBE_URL } from "@/components/desk/data";
import { Magnetic } from "@/components/graphite/Contact";
import { PaperEdge } from "./bits";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.8, ease },
};

/**
 * The back cover: a last sheet of paper torn over the dark chapters, with the way to get in touch,
 * the links, and the name once more, cut off by the bottom of the page.
 */
export function Footer() {
  return (
    <footer id="contact" className="relative bg-[#0e0e0e] text-[#161616]">
      <PaperEdge side="top" seed={97} />
      <div className="sheet overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pt-14 md:px-10 md:pt-20">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            {/* left: the ask */}
            <div className="md:col-span-8">
              <motion.p {...rise} className="text-sm font-medium text-smoke md:text-base">
                Contact — <span className="font-[family-name:var(--font-accent)] text-lg text-ink md:text-xl">drop a line</span>
              </motion.p>
              <motion.h2 {...rise} className="display mt-4 text-[12vw] leading-[0.9] md:text-[5.6vw]">
                Your idea,{" "}
                <span className="relative inline-block">
                  <em>my pencil.</em>
                  <svg className="absolute -bottom-[0.06em] left-0 h-[0.18em] w-full overflow-visible" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
                    <motion.path
                      d="M3 13 C 70 4, 150 3, 220 9 S 285 15, 297 6"
                      fill="none"
                      stroke="#d4a24c"
                      strokeWidth="4"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, margin: "-20% 0px" }}
                      transition={{ duration: 1.2, ease: "easeInOut", delay: 0.4 }}
                    />
                  </svg>
                </span>
              </motion.h2>
              <motion.p {...rise} className="mt-6 max-w-md text-base leading-relaxed text-[#555]">
                Commissions, murals, animation, brand work — got a wall, a brand or a story? Say hi.
              </motion.p>
            </div>

            {/* right: Pencil, pencil in mouth, mumbling hello over the button */}
            <div className="relative mt-8 flex items-end justify-between gap-6 md:col-span-4 md:mt-0 md:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 14 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.3 }}
                className="relative w-24 shrink-0 md:w-28"
              >
                <Image src="/desk/pencil-hoodie.webp" alt="Pencil in a yellow hoodie with a pencil held in his mouth" width={547} height={640} sizes="112px" className="sticker w-full" />
                <p className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full -rotate-6 whitespace-nowrap rounded-2xl rounded-bl-sm bg-[#161616] px-3 py-1 font-marker text-sm font-bold text-white">
                  mmph! <span className="font-normal text-white/60">(say hi)</span>
                </p>
              </motion.div>
              <Magnetic>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex size-28 flex-col items-center justify-center rounded-full bg-[#161616] text-center text-white transition-colors hover:bg-black md:size-32"
                >
                  <span className="text-[15px] font-medium">Write to me</span>
                  <ArrowUpRight size={18} className="mt-1" />
                </a>
              </Magnetic>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[#161616]/10 pt-8 md:mt-16 md:grid-cols-4">
            <Column title="Say hi">
              <CopyEmail />
            </Column>
            <Column title="Follow">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="link">
                Instagram ↗
              </a>
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="link">
                YouTube ↗
              </a>
            </Column>
            <Column title="Around here">
              <a href="#about" className="link">
                About
              </a>
              <a href="#work" className="link">
                Contents
              </a>
              <a href="/gallery" className="link">
                Wallpapers ↗
              </a>
            </Column>
            <Column title="Pencil7">
              <span className="text-[#555]">© {new Date().getFullYear()} · Visakhapatnam</span>
              <a href="#top" className="link">
                Back to top ↑
              </a>
            </Column>
          </div>
        </div>

        {/* the name once more, cut off by the bottom of the page */}
        <p aria-hidden className="display -mb-[0.24em] mt-10 select-none whitespace-nowrap text-center text-[17vw] leading-[0.8] text-[#161616] md:mt-12">
          Abishek
        </p>
      </div>
    </footer>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#161616]">{title}</p>
      <div className="mt-3 flex flex-col items-start gap-1.5 text-sm">{children}</div>
    </div>
  );
}

/** The address, with a click to copy it for anyone whose mail app isn't set up. */
function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };
  return (
    <>
      <a href={`mailto:${EMAIL}`} className="link font-medium text-[#161616]">
        {EMAIL}
      </a>
      <button type="button" onClick={copy} className="font-marker text-sm text-[#c7362f] hover:underline">
        {copied ? "copied ✓" : "copy address"}
      </button>
    </>
  );
}
