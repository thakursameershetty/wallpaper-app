export const INSTAGRAM_URL = "https://www.instagram.com/pencill.7";
export const YOUTUBE_URL = "https://www.youtube.com/@pencill7";
export const EMAIL = "challaabi12@gmail.com";

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "/desk" },
  { label: "Wall Art", href: "#wall-art" },
  { label: "Reel", href: "#reel" },
  { label: "Contact", href: "#contact" },
];

export interface WorkCategory {
  title: string;
  images: string[];
}

export const WORK: WorkCategory[] = [
  {
    title: "Pencil Sketches",
    images: [
      "/gallery-1.jpeg",
      "/pencilsketches/pencilsketches1.jpg",
      "/pencilsketches/pencilsketches2.jpeg",
      "/pencilsketches/pencilsketches3.webp",
      "/pencilsketches/pencilsketches4.jpeg",
      "/pencilsketches/pencilsketches5.jpeg",
    ],
  },
  {
    title: "Digital Arts",
    images: [
      "/gallery-2.jpeg",
      "/digitalarts/4553.webp",
      "/digitalarts/4554.webp",
      "/digitalarts/4555.webp",
      "/digitalarts/4556.webp",
      "/digitalarts/4557.webp",
      "/digitalarts/4558.webp",
      "/digitalarts/4559.webp",
      "/digitalarts/4561.webp",
      "/digitalarts/4562.webp",
      "/digitalarts/4564.webp",
      "/digitalarts/4565.webp",
      "/digitalarts/4567.webp",
      "/digitalarts/4568.webp",
      "/digitalarts/4570.webp",
      "/digitalarts/4571.webp",
      "/digitalarts/4572.webp",
      "/digitalarts/4573.webp",
      "/digitalarts/4574.webp",
      "/digitalarts/4575.webp",
      "/digitalarts/4576.webp",
      "/digitalarts/4577.webp",
      "/digitalarts/4578.webp",
      "/digitalarts/4579.webp",
      "/digitalarts/4580.webp",
      "/digitalarts/4581.webp",
      "/digitalarts/4582.webp",
      "/digitalarts/4583.webp",
      "/digitalarts/4584.webp",
      "/digitalarts/4585.webp",
      "/digitalarts/4586.webp",
      "/digitalarts/digitalarts5.jpeg",
      "/digitalarts/digitalarts1.webp",
      "/digitalarts/digitalarts2.webp",
      "/digitalarts/digitalarts3.webp",
      "/digitalarts/digitalarts4.jpg",
    ],
  },
  { title: "Charcoal Portraits", images: ["/gallery-3.jpg"] },
  { title: "Watercolors", images: ["/gallery-5.jpeg"] },
  { title: "Pen Sketches", images: ["/gallery-6.jpeg"] },
  { title: "Acrylic & Pen", images: ["/gallery-4.jpeg"] },
];

/** Intrinsic sizes of the originals, so every frame has its shape before anything loads. */
export const IMAGE_SIZES: Record<string, [number, number]> = {
  "/gallery-1.jpeg": [1440, 1920],
  "/gallery-2.jpeg": [1440, 1799],
  "/gallery-3.jpg": [540, 960],
  "/gallery-4.jpeg": [1440, 1049],
  "/gallery-5.jpeg": [2906, 3733],
  "/gallery-6.jpeg": [1094, 1440],
  "/pencilsketches/pencilsketches1.jpg": [540, 960],
  "/pencilsketches/pencilsketches2.jpeg": [1080, 1440],
  "/pencilsketches/pencilsketches3.webp": [1439, 936],
  "/pencilsketches/pencilsketches4.jpeg": [1440, 1798],
  "/pencilsketches/pencilsketches5.jpeg": [961, 1201],
  "/digitalarts/digitalarts1.webp": [1439, 1085],
  "/digitalarts/digitalarts2.webp": [1440, 1800],
  "/digitalarts/digitalarts3.webp": [1440, 1800],
  "/digitalarts/digitalarts4.jpg": [1440, 1920],
  "/digitalarts/digitalarts5.jpeg": [1011, 1600],
  "/digitalarts/4553.webp": [1640, 1892],
  "/digitalarts/4554.webp": [2000, 1224],
  "/digitalarts/4555.webp": [2000, 1390],
  "/digitalarts/4556.webp": [1390, 2000],
  "/digitalarts/4557.webp": [1390, 2000],
  "/digitalarts/4558.webp": [1390, 2000],
  "/digitalarts/4559.webp": [2000, 2000],
  "/digitalarts/4561.webp": [2000, 2000],
  "/digitalarts/4562.webp": [1390, 2000],
  "/digitalarts/4564.webp": [2000, 2000],
  "/digitalarts/4565.webp": [2000, 2000],
  "/digitalarts/4567.webp": [2000, 2000],
  "/digitalarts/4568.webp": [1146, 2000],
  "/digitalarts/4570.webp": [2000, 2000],
  "/digitalarts/4571.webp": [2000, 2000],
  "/digitalarts/4572.webp": [1723, 2000],
  "/digitalarts/4573.webp": [2000, 2000],
  "/digitalarts/4574.webp": [2000, 2000],
  "/digitalarts/4575.webp": [2000, 2000],
  "/digitalarts/4576.webp": [2000, 2000],
  "/digitalarts/4577.webp": [1390, 2000],
  "/digitalarts/4578.webp": [2000, 2000],
  "/digitalarts/4579.webp": [1422, 2000],
  "/digitalarts/4580.webp": [2000, 1422],
  "/digitalarts/4581.webp": [2000, 1422],
  "/digitalarts/4582.webp": [1422, 2000],
  "/digitalarts/4583.webp": [1422, 2000],
  "/digitalarts/4584.webp": [2000, 1422],
  "/digitalarts/4585.webp": [1778, 2000],
  "/digitalarts/4586.webp": [1778, 2000],
};

export const WALL_ART_VIDEOS = [
  {
    src: "/media/wall-art-1.mp4",
    poster: "/media/wall-art-1.jpg",
    label: "The Paradise",
    instagramUrl: "https://www.instagram.com/reel/DVhubNQkdgM/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==",
  },
  {
    src: "/media/wall-art-2.mp4",
    poster: "/media/wall-art-2.jpg",
    label: "PEDDI",
    instagramUrl: "https://www.instagram.com/reel/DZJnRCfRHuY/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==",
  },
];

/** URL-safe name for a work category: "Acrylic & Pen" → "acrylic-and-pen". */
export const slugOf = (title: string) =>
  title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Where a medium's work lives: its own page, or the whole board when it has no category of its own. */
export const workHref = (category?: string) => (category && WORK.some((c) => c.title === category) ? `/desk/${slugOf(category)}` : "/desk");
