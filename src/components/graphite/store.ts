/**
 * Shared state between the DOM and the one WebGL canvas behind it.
 * Artworks register their placeholder element here; the canvas draws each one as a
 * graphite sketch exactly where its placeholder sits, and colours it in as it's revealed.
 */

export type Art = {
  id: number;
  el: HTMLElement;
  /** The placeholder's <img>: the canvas reuses whatever the browser already downloaded for it. */
  img: HTMLImageElement;
  /**
   * "x" / "y": colour floods in as the piece nears the middle of the screen along that axis.
   * "manual": `reveal` is driven from outside (a GSAP timeline).
   */
  mode: "x" | "y" | "manual";
  /** 0 = graphite, 1 = full colour. */
  reveal: number;
  /** 0 → 1: how much of the drawing's linework has been laid down. */
  draw: number;
  /** Magnification of the image inside its frame, about `focus` (uv). */
  zoom: number;
  focus: [number, number];
  /** Degrees, matching a CSS rotation on the placeholder or its ancestors (the bounding box alone can't tell). */
  rotation?: number;
  /** Added to the draw order, so a lifted piece lands on top of the ones it overlaps. */
  layer?: number;
};

type Point = { x: number; y: number; t: number };

const listeners = new Set<() => void>();

export const graphite = {
  arts: [] as Art[],
  version: 0,
  /** Recent pointer positions (viewport px) with timestamps; the pencil trail and the colour mask are drawn from them. */
  trail: [] as Point[],
  /** Smoothed scroll velocity from Lenis, px per frame. */
  velocity: 0,
  reducedMotion: false,
};

let nextId = 0;

/** Registers an artwork with the canvas. The object itself becomes the live entry, so tweening its fields drives the drawing. */
export function addArt(fields: Omit<Art, "id">) {
  const art: Art = Object.assign(fields, { id: nextId++ });
  graphite.arts.push(art);
  graphite.version++;
  listeners.forEach((l) => l());
  const remove = () => {
    graphite.arts = graphite.arts.filter((a) => a !== art);
    graphite.version++;
    listeners.forEach((l) => l());
  };
  return { art, remove };
}

export function subscribeArts(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** How long the pencil line and the colour it leaves behind take to fade, in ms. */
export const TRAIL_MS = 2600;
