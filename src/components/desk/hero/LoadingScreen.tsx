"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/** How long the fade-out runs, in ms; keep in step with the `duration-700` below. */
const FADE_MS = 700;

type Props = {
  /** Files downloaded so far, 0–100. */
  progress: number;
  /** The desk has loaded and its shaders are compiled. */
  done: boolean;
};

/**
 * Covers the page while the 3D desk downloads and compiles, then fades away.
 * Downloads fill the line to 90%; the last stretch is shader compilation.
 */
export function LoadingScreen({ progress, done }: Props) {
  const [mounted, setMounted] = useState(true);
  const shown = done ? 100 : progress * 0.9;

  // hold the page still underneath until the desk is ready
  useEffect(() => {
    if (!mounted) return;
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = overflow;
    };
  }, [mounted]);

  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setMounted(false), FADE_MS + 300);
    return () => clearTimeout(id);
  }, [done]);

  if (!mounted) return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading the desk"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown)}
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-paper px-6 transition-opacity delay-300 duration-700 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <Image
        src="/pencil/logo-abishek.png"
        alt="Abishek"
        width={1050}
        height={645}
        className="h-20 w-auto animate-pulse md:h-24"
        priority
      />

      <div className="w-full max-w-xs">
        {/* a pencil line drawn across the page as the desk loads */}
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full origin-left bg-gradient-to-r from-ochre via-clay to-dusk transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${shown / 100})` }}
          />
        </div>
        <div className="mt-3 flex justify-between font-ruler text-xs uppercase tracking-widest text-ink/60">
          <span>{shown < 90 ? "Setting up the desk" : "Sharpening pencils"}</span>
          <span>{Math.round(shown)}%</span>
        </div>
      </div>
    </div>
  );
}
