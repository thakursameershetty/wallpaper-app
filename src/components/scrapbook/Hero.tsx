"use client";

import { useRef } from "react";
import Image from "next/image";
import { Brush, Eraser, Loose, PaperClip, Pencil, Shaving, Sparkle, Star, Tape, tornEdge } from "./bits";

const TITLE_EDGE = tornEdge(11, { top: true, right: true, bottom: true, left: true }, 5, 44);
const NOTE_EDGE = tornEdge(5, { top: true, right: true, bottom: true, left: true }, 6, 18);

const TODO = [
  { text: "sketch it", done: true },
  { text: "ink it", done: true },
  { text: "colour it", done: true },
  { text: "paint a wall", done: false },
];

/**
 * A flat-lay of the desk on a green cutting mat: the title on a torn strip of paper, surrounded by
 * the tools and a few finished pieces. Everything on it can be picked up and moved (on desktop).
 */
export function Hero() {
  const desk = useRef<HTMLElement>(null);

  return (
    <section id="top" ref={desk} className="mat relative h-[100svh] min-h-[640px] overflow-hidden" aria-label="Intro">
      {/* -------- top left: a star and the to-do list -------- */}
      <Loose bounds={desk} delay={0.35} rotate={-14} className="left-[-5%] top-[11%] w-[22vw] md:left-[1.5%] md:top-[13%] md:w-[8vw]">
        <Star className="w-full" />
      </Loose>

      <Loose bounds={desk} delay={0.45} rotate={-5} className="left-[16%] top-[12%] w-[38vw] md:left-[12%] md:top-[7%] md:w-[13vw]" label="To-do list">
        <div className="note relative aspect-square bg-[#f9e27d] p-[11%] font-[family-name:var(--font-hand)] text-[#3b2f12]">
          <p className="text-[3.6vw] font-bold leading-none tracking-wide md:text-[1.15vw]">TO-DO LIST</p>
          <ul className="mt-[8%] space-y-[3%] text-[3.4vw] leading-tight md:text-[1.05vw]">
            {TODO.map((t) => (
              <li key={t.text} className="flex items-center gap-[6%]">
                <span className="grid aspect-square w-[11%] shrink-0 place-items-center rounded-full border-2 border-[#3b2f12] text-[0.8em] leading-none">{t.done ? "✓" : ""}</span>
                <span className={t.done ? "line-through decoration-[#c7362f] decoration-2" : ""}>{t.text}</span>
              </li>
            ))}
          </ul>
          <PaperClip className="absolute -top-[14%] right-[12%] w-[9%] rotate-6" color="#3f8a4a" />
        </div>
      </Loose>

      <Loose bounds={desk} delay={0.9} rotate={30} className="left-[34%] top-[16%] hidden w-[1.6vw] md:block">
        <PaperClip className="w-full" color="#3b6fc9" />
      </Loose>

      {/* -------- top middle: coloured pencils hanging in from the edge -------- */}
      {[
        { left: "md:left-[47%]", body: "#d9483b", shade: "#b0362b", r: 84, d: 0.55 },
        { left: "md:left-[51%]", body: "#ef8d2f", shade: "#c9701c", r: 95, d: 0.6 },
        { left: "md:left-[55%]", body: "#3f8a4a", shade: "#2e6b37", r: 88, d: 0.65 },
      ].map((p) => (
        <Loose key={p.body} bounds={desk} delay={p.d} rotate={p.r} className={`hidden md:top-[4%] md:block md:w-[20vw] ${p.left}`}>
          <Pencil className="w-full" body={p.body} shade={p.shade} />
        </Loose>
      ))}

      {/* -------- top right: a finished piece, taped down -------- */}
      <Loose bounds={desk} delay={0.5} rotate={7} className="right-[3%] top-[10%] w-[38vw] md:right-[3%] md:top-[11%] md:w-[13vw]" label="Polaroid of a digital painting">
        <figure className="relative bg-white p-[6%] pb-[4%] shadow-[0_10px_24px_rgb(0_0_0/0.3)]">
          <div className="relative aspect-square overflow-hidden">
            <Image src="/gallery-2.jpeg" alt="Digital painting of a swordswoman resting in a golden field" fill sizes="(max-width: 768px) 38vw, 14vw" className="object-cover object-[50%_35%]" draggable={false} />
          </div>
          <figcaption className="pt-[5%] font-[family-name:var(--font-hand)] text-[3.4vw] text-[#3b2f12] md:text-[1.1vw]">pixels ♥</figcaption>
          <Tape className="absolute -top-[6%] left-1/2 h-[9%] w-[42%] -translate-x-1/2" rotate={-4} />
        </figure>
      </Loose>

      {/* -------- left edge: shavings from sharpening -------- */}
      <Loose bounds={desk} delay={0.7} rotate={0} className="hidden md:left-[3%] md:top-[36%] md:block md:w-[8vw]">
        <Shaving className="w-full" />
      </Loose>
      <Loose bounds={desk} delay={0.75} rotate={40} className="hidden md:left-[9.5%] md:top-[52%] md:block md:w-[4.5vw]">
        <Shaving className="w-full" paint="#d9483b" />
      </Loose>

      {/* -------- the title -------- */}
      <Loose bounds={desk} delay={0.15} rotate={-2} className="left-[3%] top-[37%] w-[94vw] md:left-[21%] md:top-[34%] md:w-[56vw]">
        <div className="drop-shadow-[0_10px_14px_rgb(0_0_0/0.35)]">
          <div className="paper bg-[#f8f4ea] px-[6%] py-[7%] md:py-[5%]" style={{ clipPath: TITLE_EDGE }}>
            <h1 className="text-center font-[family-name:var(--font-hand)] text-[15vw] font-light uppercase leading-none tracking-[0.06em] text-[#2b2219] md:text-[8.5vw]">
              <span className="sr-only">Abishek — </span>Portfolio
            </h1>
          </div>
        </div>
      </Loose>

      <Loose bounds={desk} delay={0.8} rotate={-4} className="left-[8%] top-[33%] md:left-[28%] md:top-[29.5%]">
        <Label>VISUAL ARTIST</Label>
      </Loose>
      <Loose bounds={desk} delay={0.85} rotate={3} className="left-[6%] top-[59%] md:left-[23%] md:top-[62%]">
        <Label>2026</Label>
      </Loose>

      <Loose bounds={desk} delay={0.95} rotate={4} className="right-[6%] top-[56%] w-[40vw] md:left-[57%] md:right-auto md:top-[60%] md:w-[13vw]">
        <div className="drop-shadow-[0_6px_8px_rgb(0_0_0/0.3)]">
          <div className="bg-[#fbf8f0] px-[12%] py-[10%] text-center font-[family-name:var(--font-hand)] leading-tight text-[#2b2219]" style={{ clipPath: NOTE_EDGE }}>
            <p className="text-[5vw] font-bold md:text-[1.6vw]">Abishek</p>
            <p className="text-[3.6vw] md:text-[1.1vw]">a.k.a. Pencil</p>
          </div>
        </div>
      </Loose>

      <Loose bounds={desk} delay={0.6} rotate={8} className="left-[67%] top-[15%] hidden w-[8.5vw] md:block" label="Sticker of Pencil, Abishek's cartoon self">
        <Image src="/desk/pencil-hoodie.webp" alt="" width={547} height={640} sizes="9vw" className="sticker w-full" draggable={false} />
      </Loose>

      {/* -------- right edge: stars and brushes -------- */}
      <Loose bounds={desk} delay={1} rotate={12} className="right-[8%] top-[71%] w-[15vw] md:right-[7%] md:top-[36%] md:w-[6.5vw]">
        <Star className="w-full" />
      </Loose>
      <Loose bounds={desk} delay={1.05} rotate={0} className="hidden md:right-[15%] md:top-[33%] md:block md:w-[2.4vw]">
        <Sparkle className="w-full" />
      </Loose>
      <Loose bounds={desk} delay={1.1} rotate={18} className="hidden md:right-[4%] md:top-[56%] md:block md:w-[2.8vw]">
        <Sparkle className="w-full" />
      </Loose>
      <Loose bounds={desk} delay={0.7} rotate={-16} className="hidden md:right-[-4%] md:top-[47%] md:block md:w-[21vw]">
        <Brush className="w-full" />
      </Loose>
      <Loose bounds={desk} delay={0.75} rotate={-6} className="hidden md:right-[-6%] md:top-[53%] md:block md:w-[19vw]">
        <Brush className="w-full" handle="#c7362f" fan />
      </Loose>

      {/* -------- bottom: pencils, the sketchbook, a sticker -------- */}
      {[
        { label: "2B", y: "bottom-[19%] md:bottom-[22%]", d: 0.5 },
        { label: "4B", y: "bottom-[14%] md:bottom-[14%]", d: 0.55 },
        { label: "HB", y: "bottom-[9%] md:bottom-[6%]", d: 0.6 },
      ].map((p) => (
        <Loose key={p.label} bounds={desk} delay={p.d} rotate={28} className={`left-[-14%] w-[62vw] md:left-[-5%] md:w-[30vw] ${p.y}`}>
          <Pencil className="w-full" label={p.label} />
        </Loose>
      ))}

      <Loose bounds={desk} delay={0.4} rotate={-7} className="bottom-[-12%] left-[40%] w-[46vw] md:bottom-[-14%] md:left-[33%] md:w-[19vw]" label="Spiral sketchbook">
        <div className="relative rounded-md bg-[#f2e8d2] p-[7%] pt-[12%] shadow-[0_14px_28px_rgb(0_0_0/0.35)]">
          <div className="absolute inset-x-[6%] -top-[3%] flex justify-between">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="block h-[1.6vw] min-h-3 w-[0.9vw] min-w-1.5 rounded-full border-2 border-[#2b2219] bg-[#f2e8d2]" />
            ))}
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src="/pencilsketches/pencilsketches2.jpeg" alt="A pencil sketch from Abishek's sketchbook" fill sizes="(max-width: 768px) 46vw, 19vw" className="object-cover mix-blend-multiply grayscale" draggable={false} />
          </div>
        </div>
      </Loose>
      <Loose bounds={desk} delay={1.15} rotate={-22} className="hidden md:bottom-[18%] md:left-[44%] md:block md:w-[6vw]">
        <Eraser className="w-full" />
      </Loose>

      <Loose bounds={desk} delay={0.65} rotate={-6} className="bottom-[5%] right-[4%] hidden w-[17vw] md:block" label="Sticker of Pencil in shades">
        <div className="overflow-hidden rounded-2xl border-[6px] border-white shadow-[0_10px_24px_rgb(0_0_0/0.35)]">
          <Image src="/desk/pencil-shades.webp" alt="" width={1100} height={781} sizes="17vw" className="w-full" draggable={false} />
        </div>
      </Loose>
      <Loose bounds={desk} delay={1.2} rotate={50} className="hidden md:bottom-[30%] md:right-[27%] md:block md:w-[1.6vw]">
        <PaperClip className="w-full" color="#e0a52a" />
      </Loose>

      <p className="pointer-events-none absolute bottom-[4%] right-[24%] hidden -rotate-3 font-[family-name:var(--font-hand)] text-lg text-white/85 md:block">
        psst — everything on this desk moves ↗
      </p>

      {/* the lamp: a warm band of light across the desk, darker at the edges */}
      <div aria-hidden className="lamp pointer-events-none absolute inset-0 z-[9999]" />
    </section>
  );
}

/** A yellow label, stuck on like the ones in a sketchbook. */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block border-2 border-[#3b2f12] bg-[#f7c948] px-3 py-0.5 font-[family-name:var(--font-hand)] text-sm font-bold tracking-[0.12em] text-[#7a2a14] shadow-[0_4px_8px_rgb(0_0_0/0.25)] md:px-4 md:text-[1.1vw]">
      {children}
    </span>
  );
}
