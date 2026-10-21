"use client";

import { useRef } from "react";
import { useAbout } from "@/context/AboutContext";
import { ArtImage } from "./ArtImage";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "./gsap";

export function About() {
  const root = useRef<HTMLElement>(null);
  const { about } = useAbout();
  const tools = about.toolkit
    .split(/,\s*(?:and\s+)?|\s+and\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      SplitText.create(".about-title", {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".about-title", start: "top 80%" } }),
      });
      gsap.from(".about-copy > *", { opacity: 0, y: 30, duration: 1, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".about-copy", start: "top 80%" } });
    },
    { scope: root }
  );

  return (
    <section id="about" ref={root} className="relative pt-28 md:pt-40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 md:grid-cols-12 md:gap-16 md:px-10">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <ArtImage
              src="/desk/pencil-shades.webp"
              alt="Pencil, Abishek's cartoon self, in shades with a giant pencil over his shoulder"
              width={1100}
              height={781}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="rounded-sm"
            />
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="text-sm font-medium text-smoke">About</p>
          <h2 className="about-title display mt-5 text-[12vw] leading-[0.92] md:text-[5.2vw]">
            The hand behind <em>the pencil.</em>
          </h2>
          <div className="about-copy mt-10">
            <p className="text-xl leading-relaxed md:text-2xl">
              {about.leadText} {about.skills.slice(0, -1).join(", ")}
              {about.skills.length > 1 ? " and " : ""}
              {about.skills.at(-1)}.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-ink/65">{about.paragraph2}</p>
            <p className="mt-4 text-lg leading-relaxed text-ink/65">{about.paragraph3}</p>
          </div>
        </div>
      </div>

      {/* the toolkit, sliding past like a strip of labels on the edge of the desk */}
      <div aria-label="Toolkit" className="mt-24 overflow-hidden border-y border-ink/10 py-6 md:mt-32">
        <div className="marquee flex w-max gap-12">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-12">
              {tools.map((t) => (
                <li key={t} className="display flex items-center gap-12 whitespace-nowrap text-4xl md:text-6xl">
                  {t}
                  <span className="text-2xl text-ochre md:text-3xl">✶</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
