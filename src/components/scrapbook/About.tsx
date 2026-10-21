"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAbout } from "@/context/AboutContext";
import { Loose, PaperEdge, Tape, tornEdge } from "./bits";

const TEAR = tornEdge(23, { top: true }, 70, 120);
// a second, shallower tear just behind the edge: the white fibres a real rip leaves
const FIBRE = tornEdge(24, { top: true }, 45, 160);

type Logo = {
  src: string;
  /** Not an app icon of its own: sits on a white tile like one. */ plain?: boolean;
};

/** Each tool's own logo, matched on a lower-cased word from its name; anything unmatched shows its initials. */
const LOGOS: [match: string, logo: Logo][] = [
  ["procreate dreams", { src: "/tools/procreate-dreams.png" }],
  ["procreate", { src: "/tools/procreate.png" }],
  ["blender", { src: "/tools/blender.svg", plain: true }],
  ["unreal", { src: "/tools/unreal-engine.svg", plain: true }],
  ["maya", { src: "/tools/maya.jpg" }], // the icon comes on its own white square
  ["after effects", { src: "/tools/after-effects.svg" }],
  ["premiere", { src: "/tools/premiere-pro.svg" }],
  ["photoshop", { src: "/tools/photoshop.svg" }],
  ["illustrator", { src: "/tools/illustrator.svg" }],
  ["animate", { src: "/tools/animate.svg" }],
];
const logoOf = (tool: string) => LOGOS.find(([m]) => tool.toLowerCase().includes(m))?.[1];
const initials = (tool: string) =>
  tool
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

/** Drawing apps he uses that the editable toolkit text doesn't list yet. */
const ALSO_USES = ["Procreate", "Procreate Dreams"];

const rise = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

/**
 * A fresh sheet torn from the sketchbook and laid over the hero's paper: who he is, what he does and the tools he does it
 * with, next to a photo stuck all over with stickers. The words come from the editable About content.
 */
export function About() {
  const { about } = useAbout();
  const collage = useRef<HTMLDivElement>(null);
  const tools = about.toolkit
    .split(/,\s*(?:and\s+)?|\s+and\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  for (const t of ALSO_USES) if (!tools.some((x) => x.toLowerCase() === t.toLowerCase())) tools.push(t);
  const skills = about.skills;

  return (
    <section id="about" className="relative text-[#161616]">
      {/* the torn top edge, casting a faint shadow onto the hero's paper */}
      <div aria-hidden className="relative -mb-px h-[clamp(22px,2.4vw,36px)]">
        <div className="absolute inset-0 -translate-y-[3px] blur-[4px]">
          <div className="h-full bg-black/15" style={{ clipPath: TEAR }} />
        </div>
        <div className="absolute inset-0 bg-white" style={{ clipPath: FIBRE }} />
        <div className="sheet absolute inset-0" style={{ clipPath: TEAR }} />
      </div>

      <div className="sheet overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 pb-24 pt-10 md:grid-cols-12 md:gap-x-12 md:px-10 md:pb-20 md:pt-16">
          {/* ---------------- left: hello, then the résumé in two columns ---------------- */}
          <div className="md:col-span-7">
            <motion.p {...rise} className="mb-4 text-sm font-medium text-smoke md:text-base">
              About — <span className="font-[family-name:var(--font-accent)] text-lg text-ink md:text-xl">the hand behind the pencil</span>
            </motion.p>
            <motion.h2 {...rise} className="text-5xl font-bold tracking-tight md:text-6xl">
              Hey, friends!
            </motion.h2>
            <motion.div {...rise} className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-[#2a2a2a] md:text-[17px]">
              <p>
                {about.leadText} {skills.slice(0, -1).join(", ")}
                {skills.length > 1 ? " and " : ""}
                {skills.at(-1)}.
              </p>
              <p className="text-[#555]">{about.paragraph2}</p>
            </motion.div>

            <div className="mt-14 grid gap-12 border-t border-[#161616]/10 pt-10 sm:grid-cols-2 sm:gap-10">
              <div>
                <Heading>Work &amp; craft</Heading>
                <Entry when="right now" title="Graphic Designer & Editor" sub="Working professionally" tags={["Brand identity", "Editing", "Animation"]} />
                <Entry when="where it started" title="Traditional art" sub="Offline, on paper" tags={["Charcoal", "Pencil", "Watercolour"]} />
              </div>

              <div>
                <Heading>Toolkit</Heading>
                <motion.ul {...rise} className="mt-5 grid w-fit grid-cols-5 gap-2.5" aria-label="Toolkit">
                  {tools.map((t) => {
                    const logo = logoOf(t);
                    return (
                      <li key={t} title={t} className="group relative">
                        <span
                          aria-hidden
                          className={`relative grid size-11 place-items-center overflow-hidden rounded-[22%] shadow-[0_3px_8px_rgb(0_0_0/0.16)] transition-transform duration-200 group-hover:-translate-y-1 ${
                            logo?.plain ? "bg-white ring-1 ring-black/10" : logo ? "" : "bg-[#161616] text-sm font-bold text-white"
                          }`}
                        >
                          {logo ? (
                            <Image src={logo.src} alt="" fill sizes="44px" unoptimized className={logo.plain ? "object-contain p-[14%]" : "object-cover"} />
                          ) : (
                            initials(t)
                          )}
                        </span>
                        <span className="sr-only">{t}</span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#161616] px-2.5 py-1 text-[11px] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {t}
                        </span>
                      </li>
                    );
                  })}
                </motion.ul>

                <Heading className="mt-12">Proudest wall</Heading>
                <motion.p {...rise} className="mt-4 text-[15px] leading-relaxed">
                  Vizag&apos;s <span className="font-[family-name:var(--font-hand)] text-lg text-[#c7362f]">biggest</span> wall art.
                </motion.p>
              </div>
            </div>
          </div>

          {/* ---------------- right: the photo, stuck all over with stickers ---------------- */}
          <div ref={collage} className="relative mx-auto aspect-[4/5] w-full max-w-md self-start md:col-span-5 md:max-w-none">
            <Loose onView bounds={collage} rotate={3} delay={0.1} className="left-[12%] top-[8%] w-[76%]" label="Photo of Abishek">
              <div className="group bg-[#e9e6df] p-[3%] pb-[10%] shadow-[0_18px_36px_rgb(0_0_0/0.28)]">
                <div className="relative aspect-[828/1019] overflow-hidden">
                  <Image
                    src="/pencil-abhishek-photo.webp"
                    alt="Abishek in a red kurta and sunglasses on a rooftop, the city behind him"
                    fill
                    sizes="(max-width: 768px) 80vw, 32vw"
                    className="object-cover contrast-[1.15] grayscale transition-[filter] duration-700 group-hover:grayscale-0"
                    draggable={false}
                  />
                </div>
              </div>
              <Tape className="absolute -top-[2%] left-[8%] h-[5%] w-[26%]" rotate={-28} />
            </Loose>

            <Loose onView bounds={collage} rotate={-6} delay={0.3} className="right-[2%] top-[-6%] w-[30%]" label="Sticker of Pencil in a hoodie">
              <Image
                src="/desk/pencil-hoodie.webp"
                alt=""
                width={547}
                height={640}
                sizes="(max-width: 768px) 30vw, 12vw"
                className="sticker w-full"
                draggable={false}
              />
            </Loose>

            <Loose onView bounds={collage} rotate={-10} delay={0.4} className="left-[-2%] top-[2%] w-[28%]" label="Round sticker">
              <Badge />
            </Loose>

            <Loose onView bounds={collage} rotate={-6} delay={0.5} className="bottom-[4%] left-[0%] w-[36%]" label="Name tag">
              <div className="rounded-lg bg-[#d6332c] p-[5%] text-center shadow-[0_8px_16px_rgb(0_0_0/0.3)]">
                <p className="text-[clamp(10px,1vw,14px)] font-bold text-white">hello, I&apos;m</p>
                <p className="mt-[4%] rounded bg-white py-[6%] font-[family-name:var(--font-hand)] text-[clamp(16px,1.8vw,26px)] font-bold leading-none text-[#161616]">
                  Pencil ✶
                </p>
              </div>
            </Loose>

            <Loose onView bounds={collage} rotate={10} delay={0.7} className="bottom-[-8%] right-[-4%] w-[22%]" label="Sticker of Pencil with a giant pencil">
              <Image
                src="/desk/pencil-pose.webp"
                alt=""
                width={361}
                height={720}
                sizes="(max-width: 768px) 22vw, 9vw"
                className="sticker w-full"
                draggable={false}
              />
            </Loose>
          </div>
        </div>
      </div>

      {/* the bottom edge, torn open onto the dark Contents page below */}
      <PaperEdge side="bottom" seed={41} />
    </section>
  );
}

function Heading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h3 {...rise} className={`text-sm font-bold uppercase tracking-[0.14em] ${className}`}>
      {children}
    </motion.h3>
  );
}

/** One line of the résumé: a red handwritten "when", what, and optional black tags. */
function Entry({ when, title, sub, tags }: { when: string; title: string; sub: string; tags?: string[] }) {
  return (
    <motion.div {...rise} className="mt-6">
      <p className="font-[family-name:var(--font-hand)] text-lg uppercase leading-none text-[#c7362f]">{when}</p>
      <p className="mt-2 text-base font-semibold">{title}</p>
      <p className="text-[15px] text-[#555]">{sub}</p>
      {tags && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <li key={t} className="rounded-full bg-[#161616] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
              {t}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

/** A round sticker: the logo, ringed with words that turn slowly. */
function Badge() {
  return (
    <div className="sticker relative aspect-square rounded-full border-[5px] border-[#d6332c] bg-white">
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-[spin_24s_linear_infinite] motion-reduce:animate-none" aria-hidden>
        <defs>
          <path id="badge-ring" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
        </defs>
        <text fontSize="9" fontWeight="700" fill="#d6332c" fontFamily="var(--font-general-sans), sans-serif">
          {/* stretched to exactly the ring's circumference (2π × 36), so the end meets the start */}
          <textPath href="#badge-ring" textLength="224" lengthAdjust="spacing">
            VISUAL ARTIST • VIZAG • PENCIL •
          </textPath>
        </text>
      </svg>
      <Image
        src="/desk/logo-abishek.webp"
        alt=""
        width={900}
        height={553}
        sizes="8vw"
        className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2"
        draggable={false}
      />
    </div>
  );
}
