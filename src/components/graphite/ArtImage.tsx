"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { prefersReducedMotion } from "./gsap";
import { addArt, type Art } from "./store";

/** Fields a parent can own and tween (e.g. with a GSAP timeline) to drive a "manual" artwork. */
export type ArtControl = Partial<Pick<Art, "reveal" | "draw" | "zoom" | "focus" | "rotation" | "layer">>;

type Props = {
  src: string;
  alt: string;
  /** Intrinsic size: sets the frame's aspect ratio unless the className sizes it. */
  width: number;
  height: number;
  sizes: string;
  className?: string;
  mode?: Art["mode"];
  /** For mode "manual": an object the parent keeps and animates; the canvas reads it every frame. */
  control?: ArtControl;
  preload?: boolean;
  fit?: boolean;
};

/**
 * A frame the WebGL layer draws an artwork into, as graphite that floods with colour.
 * The real <img> inside stays for SEO, no-WebGL visitors and the moment before the canvas is
 * ready — and its download is what the canvas uses as the texture.
 */
export function ArtImage({ src, alt, width, height, sizes, className = "", mode = "y", control, preload, fit = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const img = el?.querySelector("img");
    if (!el || !img) return;
    const reduced = prefersReducedMotion();
    const fields = Object.assign(control ?? {}, {
      el,
      img,
      mode,
      reveal: reduced ? 1 : (control?.reveal ?? 0),
      draw: reduced ? 1 : (control?.draw ?? 1),
      zoom: reduced ? 1 : (control?.zoom ?? 1),
      focus: control?.focus ?? ([0.5, 0.5] as [number, number]),
    });
    const { remove } = addArt(fields);
    return remove;
  }, [control, mode]);

  return (
    <div ref={ref} className={`art relative overflow-hidden ${className}`} style={fit ? { aspectRatio: `${width} / ${height}` } : undefined}>
      <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="art-fallback object-cover" />
    </div>
  );
}
