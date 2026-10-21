"use client";

import { useRef } from "react";
import { ArtImage } from "./ArtImage";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "./gsap";

/** One sentence, inked in word by word as you scroll through it, with two sketches drifting past at their own pace. */
export function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      SplitText.create(".statement", {
        type: "words",
        autoSplit: true,
        onSplit: (self) =>
          gsap.fromTo(
            self.words,
            { opacity: 0.12 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: { trigger: ".statement", start: "top 80%", end: "bottom 45%", scrub: true },
            }
          ),
      });
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 0 },
          { yPercent: -100 * Number(el.dataset.speed), ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-label="About the work" className="relative px-5 py-[22vh] md:px-10 md:py-[30vh]">
      <div data-speed="0.5" className="absolute left-[3vw] top-[6%] w-[26vw] md:w-[12vw]">
        <ArtImage src="/pencilsketches/pencilsketches4.jpeg" alt="Graphite sketch of a woman's smiling face" width={1440} height={1798} sizes="(max-width: 768px) 26vw, 12vw" />
      </div>
      <div data-speed="0.9" className="absolute bottom-[4%] right-[3vw] hidden w-[13vw] md:block">
        <ArtImage src="/gallery-6.jpeg" alt="Pen sketch of a bearded man resting his head on his hand" width={1094} height={1440} sizes="13vw" />
      </div>

      <p className="statement display relative mx-auto max-w-5xl text-center text-[9vw] leading-[1.02] md:text-[5.4vw]">
        Every piece starts the same way — <em>a pencil</em> and a blank page. Then it becomes charcoal, ink, pixels, motion… and sometimes <em>a whole city wall.</em>
      </p>
    </section>
  );
}
