"use client";

import { use, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { DESK, WALL_Z } from "../layout";
import { cachedTexture, cssFont, fontsReady, grain, rng } from "./canvas";
import { pencilSketch } from "./Sketchbook";

const TOP_T = 0.3; // desk top thickness (3 cm board)
const FLOOR_Y = -7.5;

/* --------------------- the desk: white vinyl top, chipped dark edge --------------------- */

export function Desk() {
  // the top is covered in a white contact sheet: faint wrinkles and trapped air
  const top = useMemo(
    () =>
      cachedTexture("desk-top", 1024, 600, (ctx, w, h) => {
        ctx.fillStyle = "#e7e8ec";
        ctx.fillRect(0, 0, w, h);
        const r = rng(5);
        for (let i = 0; i < 40; i++) {
          const x = r() * w;
          const y = r() * h;
          const len = 30 + r() * 160;
          const a = r() * Math.PI;
          ctx.strokeStyle = `rgba(150,152,165,${0.05 + r() * 0.08})`;
          ctx.lineWidth = 1 + r() * 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + r() * 30, y + r() * 30, x + Math.cos(a) * len, y + Math.sin(a) * len);
          ctx.stroke();
        }
        grain(ctx, w, h, 6, 19);
      }),
    [],
  );

  // particle-board edge banding, worn through to the pale core in places
  const edge = useMemo(
    () =>
      cachedTexture("desk-edge", 2048, 64, (ctx, w, h) => {
        ctx.fillStyle = "#2e221b";
        ctx.fillRect(0, 0, w, h);
        const r = rng(13);
        for (let i = 0; i < 70; i++) {
          const x = r() * w;
          const cw = 6 + r() * (r() < 0.2 ? 140 : 40);
          const ch = h * (0.25 + r() * 0.75);
          ctx.fillStyle = r() < 0.5 ? "#9a7a55" : "#b8986c";
          ctx.beginPath();
          ctx.ellipse(x, r() < 0.6 ? 0 : h, cw / 2, ch / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        grain(ctx, w, h, 22, 14);
      }),
    [],
  );

  const carcass = <meshStandardMaterial color="#2a201a" roughness={0.75} />;

  return (
    <group>
      <mesh position-y={-TOP_T / 2} receiveShadow castShadow>
        <boxGeometry args={[DESK.w, TOP_T, DESK.d]} />
        {/* +x, −x, +y, −y, +z, −z */}
        <meshStandardMaterial attach="material-0" color="#33261e" roughness={0.6} />
        <meshStandardMaterial attach="material-1" color="#33261e" roughness={0.6} />
        <meshPhysicalMaterial attach="material-2" map={top} roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.3} />
        <meshStandardMaterial attach="material-3" color="#2a201a" roughness={0.75} />
        <meshStandardMaterial attach="material-4" map={edge} roughness={0.7} />
        <meshStandardMaterial attach="material-5" color="#33261e" roughness={0.6} />
      </mesh>
      {/* drawer pedestal on the right, open knee space on the left */}
      <mesh position={[DESK.w / 2 - 2.1, (FLOOR_Y - TOP_T) / 2, -0.1]} receiveShadow>
        <boxGeometry args={[4, -FLOOR_Y - TOP_T, DESK.d - 0.4]} />
        {carcass}
      </mesh>
      <mesh position={[-DESK.w / 2 + 0.15, (FLOOR_Y - TOP_T) / 2, -0.1]} receiveShadow>
        <boxGeometry args={[0.3, -FLOOR_Y - TOP_T, DESK.d - 0.4]} />
        {carcass}
      </mesh>
      {/* tiled floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={FLOOR_Y} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#d8d2c8" roughness={0.35} />
      </mesh>
    </group>
  );
}

/* ------------------------------- the art wall ------------------------------- */

const WALL_ART = [
  "gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5", "gallery-6",
  "pencilsketches1", "pencilsketches2", "pencilsketches3", "pencilsketches4", "pencilsketches5",
  "digitalarts1", "digitalarts2", "digitalarts3", "digitalarts4", "digitalarts5",
] as const;
type Art = (typeof WALL_ART)[number];
type Sketch = "pencilHoodie" | "pencilPose" | "pencilShades";
type Poster = "mismatched" | "hinanna" | "f1" | "quote" | "switchboard" | "cat" | "swatches" | "notes" | Sketch;
const SKETCH_SRC: Record<Sketch, string> = {
  pencilHoodie: "/desk/pencil-hoodie.webp",
  pencilPose: "/desk/pencil-pose.webp",
  pencilShades: "/desk/pencil-shades.webp",
};
const SKETCHES = Object.keys(SKETCH_SRC) as Sketch[];
const isSketch = (p?: Poster): p is Sketch => !!p && p in SKETCH_SRC;

/** One sheet taped to the wall: centre (wall units, y up from the desk), width, and what's on it. */
type Sheet = { x: number; y: number; w: number; h?: number; art?: Art; poster?: Poster };

// Six loose columns, four rows, overlapping a little like the real wall
const SHEETS: Sheet[] = [
  // row 0 — mostly hidden behind the laptop and lamps
  { x: -5.35, y: 0.95, w: 2.5, h: 1.6, poster: "mismatched" },
  { x: -3.15, y: 1.2, w: 2.25, art: "pencilsketches3" },
  { x: -0.95, y: 1.15, w: 2.2, art: "digitalarts5" },
  { x: 1.2, y: 1.2, w: 2.2, art: "gallery-4" },
  { x: 3.2, y: 1.3, w: 1.75, h: 2.35, poster: "f1" },
  { x: 5.3, y: 1.35, w: 2.1, h: 2.45, poster: "hinanna" },
  // row 1
  { x: -5.4, y: 3.6, w: 2.0, art: "gallery-1" },
  { x: -3.25, y: 3.55, w: 2.05, art: "pencilsketches2" },
  { x: -1.2, y: 3.7, w: 1.55, art: "gallery-3" },
  { x: 0.85, y: 3.45, w: 2.35, art: "digitalarts1" },
  { x: 3.15, y: 3.75, w: 2.05, art: "digitalarts2" },
  { x: 5.35, y: 3.85, w: 2.05, art: "gallery-5" },
  // row 2
  { x: -5.3, y: 6.15, w: 2.05, art: "pencilsketches4" },
  { x: -3.2, y: 6.05, w: 2.05, art: "digitalarts3" },
  { x: -1.05, y: 6.3, w: 2.05, art: "gallery-6" },
  { x: 1.05, y: 6.0, w: 2.0, art: "pencilsketches5" },
  { x: 3.05, y: 6.45, w: 1.85, h: 1.5, poster: "switchboard" },
  { x: 3.15, y: 5.15, w: 1.1, h: 0.85, poster: "cat" },
  { x: 5.3, y: 6.35, w: 2.0, art: "digitalarts4" },
  // row 3 — the top of the collage
  { x: -5.4, y: 8.6, w: 1.5, art: "pencilsketches1" },
  { x: -3.3, y: 8.55, w: 1.9, h: 2.4, poster: "pencilHoodie" },
  { x: -1.1, y: 8.75, w: 2.05, art: "gallery-2" },
  { x: 1.1, y: 8.45, w: 1.9, h: 2.4, poster: "pencilPose" },
  { x: 3.25, y: 8.4, w: 1.8, h: 2.1, poster: "quote" },
];

/**
 * The collage carries on past the ends of the desk, so the wall is covered edge to edge however
 * wide the screen. Same three columns a side, same four rows, with his work hung a second time.
 */
const SIDE_COLS = [7.5, 9.65, 11.8];
const SIDE_ROWS = [1.25, 3.75, 6.2, 8.6];
const sideSheets = (sign: 1 | -1, grid: (Partial<Sheet> & Pick<Sheet, "w">)[][]): Sheet[] =>
  grid.flatMap((row, r) =>
    row.map((s, c) => ({ x: sign * SIDE_COLS[c] + ((r + c) % 2 ? 0.08 : -0.06), y: SIDE_ROWS[r] + ((r * 3 + c) % 3) * 0.1 - 0.1, ...s })),
  );

const LEFT_SHEETS = sideSheets(-1, [
  [{ w: 2.0, art: "gallery-5" }, { w: 1.75, h: 1.75, poster: "notes" }, { w: 2.0, art: "digitalarts2" }],
  [{ w: 2.0, art: "pencilsketches5" }, { w: 2.1, art: "digitalarts4" }, { w: 1.9, art: "pencilsketches1" }],
  [{ w: 1.6, art: "gallery-3" }, { w: 1.9, h: 2.4, poster: "pencilShades" }, { w: 2.05, art: "gallery-1" }],
  [{ w: 2.0, art: "digitalarts1" }, { w: 1.9, art: "pencilsketches4" }, { w: 2.0, art: "gallery-6" }],
]);

const RIGHT_SHEETS = sideSheets(1, [
  [{ w: 2.0, art: "pencilsketches4" }, { w: 2.0, art: "gallery-1" }, { w: 2.05, art: "digitalarts3" }],
  [{ w: 2.05, art: "digitalarts1" }, { w: 2.0, art: "gallery-6" }, { w: 2.0, art: "pencilsketches2" }],
  [{ w: 1.6, h: 2.1, poster: "swatches" }, { w: 2.0, art: "gallery-3" }, { w: 2.1, art: "gallery-4" }],
  [{ w: 2.0, art: "digitalarts5" }, { w: 1.9, art: "pencilsketches3" }, { w: 2.0, art: "gallery-2" }],
]);

/** Three panels, each its own texture (one wide one would pass what phones can hold): [left edge, width, sheets]. */
const ART_W = 13;
const SIDE_W = 6.9;
const PANELS: { key: string; x0: number; w: number; sheets: Sheet[]; seed: number }[] = [
  { key: "art-wall-left", x0: -ART_W / 2 - SIDE_W, w: SIDE_W, sheets: LEFT_SHEETS, seed: 78 },
  { key: "art-wall", x0: -ART_W / 2, w: ART_W, sheets: SHEETS, seed: 77 },
  { key: "art-wall-right", x0: ART_W / 2, w: SIDE_W, sheets: RIGHT_SHEETS, seed: 79 },
];
const ART_H = 10;
const PX = 240; // texture pixels per wall unit

export function ArtWall() {
  use(fontsReady());
  const textures = useTexture([...WALL_ART.map((a) => `/desk/wall/${a}.webp`), ...SKETCHES.map((k) => SKETCH_SRC[k])]);

  const plaster = useMemo(
    () =>
      cachedTexture(
        "plaster",
        512,
        512,
        (ctx, w, h) => {
          // freshly painted: a flat warm white with only the faintest texture
          ctx.fillStyle = "#e9e4da";
          ctx.fillRect(0, 0, w, h);
          grain(ctx, w, h, 4, 32);
        },
        { repeat: [8, 6] },
      ),
    [],
  );

  const panels = useMemo(() => {
    const images = Object.fromEntries(WALL_ART.map((a, i) => [a, textures[i].image as HTMLImageElement])) as Record<
      Art,
      HTMLImageElement
    >;
    const sketches = Object.fromEntries(
      SKETCHES.map((k, i) => [k, textures[WALL_ART.length + i].image as HTMLImageElement]),
    ) as Record<Sketch, HTMLImageElement>;

    return PANELS.map((p) => ({
      ...p,
      map: cachedTexture(p.key, Math.round(p.w * PX), ART_H * PX, (ctx) => {
        const r = rng(p.seed);
        for (const s of p.sheets) {
          const img = s.art ? images[s.art] : null;
          const w = s.w * PX;
          const h = (s.h ?? (img ? s.w * (img.height / img.width) : s.w * 1.41)) * PX;
          ctx.save();
          ctx.translate((s.x - p.x0) * PX, (ART_H - s.y) * PX);
          ctx.rotate((r() - 0.5) * 0.045);

          // paper, lifting off the wall a touch
          ctx.shadowColor = "rgba(50,38,26,0.32)";
          ctx.shadowBlur = 18;
          ctx.shadowOffsetX = -4;
          ctx.shadowOffsetY = 8;
          ctx.fillStyle = s.poster === "mismatched" ? "#f2cf2f" : s.poster === "notes" ? "rgba(0,0,0,0)" : "#f5f3ee";
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.shadowColor = "transparent";

          ctx.save();
          ctx.beginPath();
          ctx.rect(-w / 2, -h / 2, w, h);
          ctx.clip();
          if (img) {
            // the drawing sits in the paper: multiply keeps its white as paper white
            ctx.globalCompositeOperation = "multiply";
            const inset = w * 0.025;
            ctx.drawImage(img, -w / 2 + inset, -h / 2 + inset, w - 2 * inset, h - 2 * inset);
          } else if (isSketch(s.poster)) {
            const src = sketches[s.poster];
            const sh = h * 0.86;
            const sw = Math.min(sh * (src.width / src.height), w * 0.92);
            const fit = sw / (src.width / src.height);
            ctx.globalCompositeOperation = "multiply";
            ctx.drawImage(pencilSketch(src, Math.round(sw), Math.round(fit)), -sw / 2, -fit / 2, sw, fit);
          } else if (s.poster) {
            drawPoster(ctx, s.poster, w, h);
          }
          ctx.restore();

          // a soft curl of shade along the edges
          if (s.poster !== "notes") {
            ctx.globalCompositeOperation = "multiply";
            const edge = ctx.createRadialGradient(0, 0, Math.min(w, h) * 0.45, 0, 0, Math.max(w, h) * 0.75);
            edge.addColorStop(0, "rgba(255,255,255,0)");
            edge.addColorStop(1, "rgba(200,188,170,0.6)");
            ctx.fillStyle = edge;
            ctx.fillRect(-w / 2, -h / 2, w, h);
          }
          ctx.restore();
        }
      }),
    }));
  }, [textures]);

  return (
    <group position-z={WALL_Z}>
      <mesh position={[0, 4, 0]} receiveShadow>
        <planeGeometry args={[40, 24]} />
        <meshStandardMaterial map={plaster} roughness={0.95} />
      </mesh>
      {panels.map((p) => (
        <mesh key={p.key} position={[p.x0 + p.w / 2, ART_H / 2, 0.012]} receiveShadow>
          <planeGeometry args={[p.w, ART_H]} />
          <meshStandardMaterial map={p.map} transparent depthWrite={false} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------- hand-made posters, drawn straight onto the paper -------------------- */

function drawPoster(ctx: CanvasRenderingContext2D, poster: Poster, w: number, h: number) {
  const marker = cssFont("--font-hand", "cursive");
  const sans = cssFont("--font-general-sans", "sans-serif");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  switch (poster) {
    case "mismatched": {
      ctx.save();
      ctx.rotate(-0.03);
      ctx.font = `${h * 0.24}px ${marker}`;
      ctx.lineWidth = h * 0.02;
      ctx.strokeStyle = "#f8f0e0";
      ctx.strokeText("mismatched", 0, -h * 0.24);
      ctx.fillStyle = "#8c1d3c";
      ctx.fillText("mismatched", 0, -h * 0.24);
      ctx.restore();
      // two cartoon heads leaning in
      for (const [x, skin, hair] of [
        [-0.17, "#e6b48e", "#2b1d16"],
        [0.17, "#d9a07a", "#1f1612"],
      ] as const) {
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.arc(x * w, h * 0.2, h * 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hair;
        ctx.beginPath();
        ctx.arc(x * w, h * 0.16, h * 0.15, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = x < 0 ? "#c0392b" : "#2d5d9f";
        ctx.fillRect(x * w - h * 0.16, h * 0.34, h * 0.32, h * 0.2);
      }
      break;
    }
    case "hinanna": {
      ctx.font = `${h * 0.25}px ${marker}`;
      ctx.lineWidth = h * 0.012;
      ctx.strokeStyle = "#b8322e";
      ctx.fillStyle = "rgba(214,90,84,0.35)";
      for (const [text, y] of [["HI", -0.3], ["NANNA", -0.06]] as const) {
        ctx.fillText(text, 0, y * h);
        ctx.strokeText(text, 0, y * h);
      }
      // a quick pen sketch of the father and daughter below
      ctx.strokeStyle = "rgba(40,38,36,0.8)";
      ctx.lineWidth = 3;
      scribbleFigure(ctx, -w * 0.18, h * 0.3, h * 0.15, 3);
      scribbleFigure(ctx, w * 0.16, h * 0.28, h * 0.17, 4);
      break;
    }
    case "f1": {
      ctx.fillStyle = "#e8642c";
      for (let i = 0; i < 4; i++) ctx.fillRect(w * (0.02 + i * 0.12), -h / 2, w * 0.06, h);
      ctx.strokeStyle = "rgba(40,38,36,0.85)";
      ctx.lineWidth = 3;
      scribbleFigure(ctx, -w * 0.2, -h * 0.12, h * 0.18, 9);
      ctx.save();
      ctx.font = `italic 700 ${h * 0.12}px ${sans}`;
      ctx.fillStyle = "#e8642c";
      ctx.translate(-w * 0.22, h * 0.36);
      ctx.transform(1, 0, -0.25, 1, 0, 0);
      ctx.fillText("F1", 0, 0);
      ctx.restore();
      break;
    }
    case "quote": {
      ctx.fillStyle = "rgba(34,33,31,0.88)";
      ctx.font = `${h * 0.085}px ${marker}`;
      ctx.textAlign = "left";
      ["created", "  to create —", "one line", "  at a time ♪"].forEach((line, i) =>
        ctx.fillText(line, -w * 0.4, -h * 0.34 + i * h * 0.11),
      );
      ctx.strokeStyle = "rgba(40,38,36,0.8)";
      ctx.lineWidth = 3;
      scribbleFigure(ctx, -w * 0.15, h * 0.3, h * 0.13, 6);
      scribbleFigure(ctx, w * 0.18, h * 0.3, h * 0.13, 7);
      break;
    }
    case "switchboard": {
      ctx.fillStyle = "#ece6d8";
      ctx.fillRect(-w / 2, -h / 2, w, h);
      const r = rng(3);
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = `rgba(120,100,70,${0.05 + r() * 0.08})`;
        ctx.beginPath();
        ctx.arc((r() - 0.5) * w, (r() - 0.5) * h, 6 + r() * 26, 0, Math.PI * 2);
        ctx.fill();
      }
      const sw = w * 0.17;
      const sh = h * 0.3;
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const x = -w * 0.3 + col * w * 0.3;
          const y = -h * 0.2 + row * h * 0.4;
          if (row === 1 && col === 2) {
            // 3-pin socket
            ctx.fillStyle = "#3b3a37";
            for (const [dx, dy] of [[0, -0.09], [-0.06, 0.06], [0.06, 0.06]]) {
              ctx.beginPath();
              ctx.arc(x + dx * w, y + dy * h, w * 0.022, 0, Math.PI * 2);
              ctx.fill();
            }
            continue;
          }
          ctx.fillStyle = "#d9d2c3";
          ctx.fillRect(x - sw / 2, y - sh / 2, sw, sh);
          ctx.strokeStyle = "rgba(90,80,64,0.5)";
          ctx.lineWidth = 3;
          ctx.strokeRect(x - sw / 2, y - sh / 2, sw, sh);
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.fillRect(x - sw / 2 + 4, y - sh / 2 + 4, sw - 8, sh * 0.35);
        }
      }
      break;
    }
    case "swatches": {
      // a paint-swatch card: his go-to palette, each chip labelled in pencil
      const chips = ["#d4a24c", "#b5664b", "#8a9682", "#6f7f95", "#2f7150", "#c0392b", "#1f1e1c"];
      const ch = (h * 0.8) / chips.length;
      ctx.font = `${ch * 0.32}px ${marker}`;
      ctx.textAlign = "left";
      chips.forEach((c, i) => {
        const y = -h * 0.4 + i * ch;
        ctx.fillStyle = c;
        ctx.fillRect(-w * 0.38, y + ch * 0.12, w * 0.36, ch * 0.76);
        ctx.fillStyle = "rgba(40,38,36,0.7)";
        ctx.fillText(c.slice(1).toUpperCase(), w * 0.06, y + ch * 0.5);
      });
      break;
    }
    case "notes": {
      // a cluster of sticky notes with to-dos
      const notes: [x: number, y: number, a: number, color: string, lines: string[]][] = [
        [-0.2, -0.2, -0.06, "#f7e27a", ["finish", "wall mural"]],
        [0.2, -0.12, 0.05, "#f4a7b9", ["reel cut", "v3 ✓"]],
        [-0.12, 0.22, 0.04, "#a8d8c8", ["call", "nanna ♥"]],
        [0.22, 0.26, -0.07, "#f7e27a", ["buy 2B", "pencils"]],
      ];
      const n = w * 0.42;
      ctx.font = `${n * 0.17}px ${marker}`;
      for (const [x, y, a, color, lines] of notes) {
        ctx.save();
        ctx.translate(x * w, y * h);
        ctx.rotate(a);
        ctx.shadowColor = "rgba(50,38,26,0.25)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = color;
        ctx.fillRect(-n / 2, -n / 2, n, n);
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "rgba(34,33,31,0.85)";
        lines.forEach((l, i) => ctx.fillText(l, 0, -n * 0.12 + i * n * 0.26));
        ctx.restore();
      }
      break;
    }
    case "cat": {
      ctx.strokeStyle = "rgba(40,38,36,0.85)";
      ctx.lineWidth = 3;
      const s = h * 0.24;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.5, s, s * 0.8, 0, 0, Math.PI * 2);
      ctx.moveTo(-s * 0.8, -s * 0.9);
      ctx.lineTo(-s * 0.6, -s * 1.5);
      ctx.lineTo(-s * 0.25, -s * 1.2);
      ctx.moveTo(s * 0.8, -s * 0.9);
      ctx.lineTo(s * 0.6, -s * 1.5);
      ctx.lineTo(s * 0.25, -s * 1.2);
      ctx.moveTo(-s * 0.7, s * 0.2);
      ctx.quadraticCurveTo(-s * 0.9, s * 1.5, 0, s * 1.6);
      ctx.quadraticCurveTo(s * 0.9, s * 1.5, s * 0.7, s * 0.2);
      ctx.stroke();
      ctx.fillStyle = "rgba(40,38,36,0.9)";
      for (const dx of [-0.35, 0.35]) {
        ctx.beginPath();
        ctx.arc(dx * s, -s * 0.55, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }
}

/** A loose ballpoint figure: head, shoulders and a few hatching strokes. */
function scribbleFigure(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, seed: number) {
  const r = rng(seed);
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.6, s * 0.32, s * 0.4, 0, 0, Math.PI * 2);
  ctx.moveTo(x - s * 0.8, y + s);
  ctx.quadraticCurveTo(x - s * 0.7, y - s * 0.1, x, y - s * 0.1);
  ctx.quadraticCurveTo(x + s * 0.7, y - s * 0.1, x + s * 0.8, y + s);
  for (let i = 0; i < 9; i++) {
    const hx = x + (r() - 0.5) * s * 1.2;
    const hy = y + r() * s * 0.8;
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + s * 0.25, hy - s * 0.2);
  }
  ctx.stroke();
}
