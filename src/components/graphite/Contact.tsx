"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EMAIL, INSTAGRAM_URL, YOUTUBE_URL } from "@/components/desk/data";
import { ArtImage } from "./ArtImage";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "./gsap";

export function Contact() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      SplitText.create(".contact-title", {
        type: "chars,words",
        mask: "chars",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.02, scrollTrigger: { trigger: ".contact-title", start: "top 85%" } }),
      });
      gsap.from(".contact-stroke path", { drawSVG: 0, duration: 1.2, ease: "power2.inOut", scrollTrigger: { trigger: ".contact-title", start: "top 60%" } });
    },
    { scope: root }
  );

  return (
    <section id="contact" ref={root} className="relative px-5 pt-32 md:px-10 md:pt-48">
      <div className="pointer-events-none absolute right-5 top-20 w-[30vw] md:right-10 md:top-44 md:w-[19vw]">
        <ArtImage src="/desk/pencil-hoodie.webp" alt="Pencil in a yellow hoodie with a pencil held in his mouth" width={547} height={640} sizes="(max-width: 768px) 30vw, 19vw" />
        <p className="font-marker absolute -left-6 top-[18%] -rotate-6 rounded-2xl rounded-br-sm bg-ink px-3 py-1.5 text-sm text-paper md:-left-16 md:text-base">
          mmph! <span className="text-paper/60">(say hi)</span>
        </p>
      </div>
      <p className="text-sm font-medium text-smoke">Contact</p>
      <h2 className="contact-title display mt-5 text-[15vw] leading-[0.88] md:text-[10.5vw]">
        Let&apos;s make
        <br />
        <span className="relative inline-block">
          <em>something.</em>
          <svg className="contact-stroke absolute -bottom-[0.06em] left-0 h-[0.18em] w-full overflow-visible" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
            <path d="M3 13 C 70 4, 150 3, 220 9 S 285 15, 297 6" fill="none" stroke="#d4a24c" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </span>
      </h2>

      <div className="mt-16 flex flex-col gap-10 md:mt-20 md:flex-row md:items-end md:justify-between">
        <p className="max-w-sm text-lg leading-relaxed text-ink/65">
          Commissions, murals, animation, brand work — got a wall, a brand or a story? Say hi.
        </p>
        <Magnetic>
          <a
            href={`mailto:${EMAIL}`}
            className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-ink text-center text-paper transition-colors hover:bg-black md:h-48 md:w-48"
          >
            <span className="text-lg font-medium">Write to me</span>
            <ArrowUpRight size={22} className="mt-1" />
          </a>
        </Magnetic>
      </div>

      <footer className="mt-24 flex flex-col gap-6 border-t border-ink/10 py-8 text-sm text-smoke md:mt-32 md:flex-row md:items-center md:justify-between">
        <a href={`mailto:${EMAIL}`} className="font-medium text-ink hover:underline">
          {EMAIL}
        </a>
        <div className="flex flex-wrap gap-6">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
            Instagram
          </a>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
            YouTube
          </a>
          <Link href="/gallery" className="hover:text-ink">
            Wallpapers
          </Link>
        </div>
        <span>© {new Date().getFullYear()} Pencil7 · Visakhapatnam</span>
      </footer>
    </section>
  );
}

/** Leans toward the cursor while it's nearby, and springs back when it leaves. */
export function Magnetic({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  return (
    <motion.div
      className="self-start md:self-auto"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.35);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
