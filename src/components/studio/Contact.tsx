import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EMAIL, INSTAGRAM_URL, YOUTUBE_URL } from "@/components/desk/data";
import { Eyebrow, Stroke } from "./Stroke";

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-[var(--rule)] px-5 pt-20 md:px-8 md:pt-28">
      <div className="reveal mx-auto max-w-6xl">
        <Eyebrow>Contact</Eyebrow>
        <h2 className="display mt-4 max-w-3xl text-5xl md:text-7xl">
          Got a wall, a brand or <Stroke><em>a story?</em></Stroke>
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/65">
          Open for commissions, murals, animation and design collaborations.
        </p>

        <a
          href={`mailto:${EMAIL}`}
          className="mt-10 inline-block break-all text-2xl font-medium underline decoration-ink/25 decoration-2 underline-offset-[6px] transition-colors hover:decoration-ochre md:text-4xl"
        >
          {EMAIL}
        </a>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
            Instagram @pencill.7 <ArrowUpRight size={16} />
          </a>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
            YouTube <ArrowUpRight size={16} />
          </a>
        </div>
      </div>

      <footer className="mx-auto mt-24 flex max-w-6xl flex-col justify-between gap-3 border-t border-[var(--rule)] py-8 text-sm text-smoke md:flex-row">
        <span>© {new Date().getFullYear()} Pencil7 · Abishek</span>
        <Link href="/gallery" className="hover:text-ink">
          Wallpapers
        </Link>
        <span>Visakhapatnam, India</span>
      </footer>
    </section>
  );
}
