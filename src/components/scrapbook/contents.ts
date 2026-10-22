import { IMAGE_SIZES, WALL_ART_VIDEOS, WORK, slugOf } from "@/components/desk/data";
import type { Piece } from "@/components/graphite/Lightbox";

/** How a chapter's own section lays out its work. */
export type Layout = "pinboard" | "feature" | "spread" | "film" | "walls";

export type Video = { src: string; poster: string; label: string; href?: string; /** "2D", "3D", "Motion graphics"… */ kind?: string };

const film = (slug: string, label: string, kind: string): Video => ({ src: `/media/motion/${slug}.mp4`, poster: `/media/motion/${slug}.jpg`, label, kind });

export type Chapter = {
  title: string;
  slug: string;
  note: string;
  cover: string;
  /** object-position for the cover inside its tall strip on the Contents page. */
  focus: string;
  /** Border and hover colour, picked from the cover. */
  accent: string;
  layout: Layout;
  /** Paper for work made by hand, dark for work made on screen. */
  tone: "paper" | "dark";
  pieces: Piece[];
  videos: Video[];
};

const piecesOf = (title: string): Piece[] =>
  (WORK.find((c) => c.title === title)?.images ?? []).map((src) => ({ src, category: title, size: IMAGE_SIZES[src] ?? [4, 5] }));

const chapter = (c: Omit<Chapter, "slug" | "pieces" | "videos"> & { videos?: Video[] }): Chapter => ({
  ...c,
  slug: slugOf(c.title),
  pieces: piecesOf(c.title),
  videos: c.videos ?? [],
});

/** The table of contents, in reading order: the Contents strips and the sections below follow it. */
export const CHAPTERS: Chapter[] = [
  chapter({ title: "Pencil Sketches", note: "Graphite on paper", cover: "/gallery-1.jpeg", focus: "42% 30%", accent: "#e8e1cc", layout: "pinboard", tone: "paper" }),
  chapter({ title: "Digital Arts", note: "Painted on screen", cover: "/gallery-2.jpeg", focus: "50% 45%", accent: "#4fa3e0", layout: "feature", tone: "dark" }),
  chapter({ title: "Charcoal Portraits", note: "Charcoal on paper", cover: "/gallery-3.jpg", focus: "30% 35%", accent: "#a9a196", layout: "spread", tone: "paper" }),
  chapter({ title: "Watercolors", note: "Ink & wash", cover: "/gallery-5.jpeg", focus: "72% 40%", accent: "#e0566a", layout: "spread", tone: "paper" }),
  chapter({ title: "Pen Sketches", note: "Ink on paper", cover: "/gallery-6.jpeg", focus: "45% 40%", accent: "#9db7d4", layout: "spread", tone: "paper" }),
  chapter({ title: "Acrylic & Pen", note: "Mixed media", cover: "/gallery-4.jpeg", focus: "55% 40%", accent: "#e08a3a", layout: "spread", tone: "paper" }),
  chapter({
    title: "2D & 3D Graphics in Motion",
    note: "Animation & motion graphics",
    cover: "/media/showreel.jpg",
    focus: "50% 50%",
    accent: "#7aa7ff",
    layout: "film",
    tone: "dark",
    videos: [
      { src: "/media/showreel.mp4", poster: "/media/showreel.jpg", label: "Showreel", kind: "3D" },
      film("3d-jadal-zamaana-shuru", "Jadal Zamaana Shuru", "3D"),
      film("3d-golden-title", "Golden title sequence", "3D"),
      film("3d-pencil-logo", "Pencil logo reveal", "3D"),
      film("2d-night-city-title", "Night city title", "2D"),
      film("2d-scale-up-mascot", "Scale Up mascot", "2D"),
      film("mg-careers-app-3d", "Careers app launch", "Motion graphics"),
      film("mg-careers-app-ui", "Careers app walkthrough", "Motion graphics"),
      film("mg-crypto-promo", "Crypto wallet promo", "Motion graphics"),
    ],
  }),
  chapter({
    title: "Wall Art",
    note: "Murals in Vizag",
    cover: WALL_ART_VIDEOS[0].poster,
    focus: "50% 45%",
    accent: "#e0393e",
    layout: "walls",
    tone: "dark",
    videos: WALL_ART_VIDEOS.map((v) => ({ src: v.src, poster: v.poster, label: v.label, href: v.instagramUrl })),
  }),
];

export const chapterId = (c: Chapter) => `chapter-${c.slug}`;
