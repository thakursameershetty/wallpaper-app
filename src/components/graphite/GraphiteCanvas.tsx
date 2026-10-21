"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { createGraphiteMaterial } from "./material";
import { graphite, subscribeArts, TRAIL_MS, type Art } from "./store";

/** The colour mask is drawn at half the viewport's size; it's soft anyway. */
const MASK_SCALE = 0.5;
/** Radius of the patch of colour the pencil leaves, in css px. */
const BRUSH_PX = 95;
/** Planes this far outside the viewport (px) are skipped. */
const MARGIN = 120;

const loader = new THREE.TextureLoader();
const EMPTY = new THREE.Texture();

/**
 * The WebGL layer: one fixed, full-screen canvas behind the page that draws every registered
 * artwork over its placeholder, plus (unless `trail` is off) the pencil line the cursor leaves on top of the page.
 */
export default function GraphiteCanvas({ trail: drawTrail = true }: { trail?: boolean }) {
  const trail = useMemo(() => new TrailLayers(), []);
  const attachLine = useCallback((el: HTMLCanvasElement | null) => trail.attachLine(el), [trail]);
  // drop to 1x pixels if the machine can't keep up
  const [maxDpr, setMaxDpr] = useState(1.5);

  // record where the pencil has been; touch is left alone so it can scroll
  useEffect(() => {
    if (!drawTrail) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch" && !graphite.reducedMotion) recordPoint(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [drawTrail]);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <Canvas
          orthographic
          camera={{ position: [0, 0, 10], near: 0.1, far: 100 }}
          dpr={[1, maxDpr]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          flat
          linear
        >
          <PerformanceMonitor onDecline={() => setMaxDpr(1)} />
          <Trail layers={trail} />
          <Arts mask={trail.texture} />
        </Canvas>
      </div>
      {/* the visible pencil line, drawn over everything and multiplied into it like graphite */}
      <canvas ref={attachLine} aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full mix-blend-multiply" />
    </>
  );
}

function recordPoint(x: number, y: number) {
  const now = performance.now();
  const last = graphite.trail.at(-1);
  if (last && now - last.t < 80) {
    const d = Math.hypot(x - last.x, y - last.y);
    if (d < 3) return;
    // fill in fast strokes so the line and the colour stay continuous
    const steps = Math.min(12, Math.floor(d / 14));
    for (let i = 1; i <= steps; i++) {
      const k = i / (steps + 1);
      graphite.trail.push({ x: last.x + (x - last.x) * k, y: last.y + (y - last.y) * k, t: now });
    }
  }
  graphite.trail.push({ x, y, t: now });
}

function Trail({ layers }: { layers: TrailLayers }) {
  const size = useThree((s) => s.size);
  useEffect(() => layers.resize(size.width, size.height), [layers, size]);
  useFrame(() => layers.draw());
  return null;
}

function Arts({ mask }: { mask: THREE.Texture }) {
  const version = useSyncExternalStore(subscribeArts, () => graphite.version, () => 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- re-read the registry whenever it changes
  const arts = useMemo(() => [...graphite.arts], [version]);
  return (
    <>
      {arts.map((art, i) => (
        <ArtPlane key={art.id} art={art} mask={mask} order={i} />
      ))}
    </>
  );
}

function ArtPlane({ art, mask, order }: { art: Art; mask: THREE.Texture; order: number }) {
  const plane = useMemo(() => new GraphitePlane(art, mask), [art, mask]);
  useEffect(() => {
    plane.attach();
    return () => plane.detach();
  }, [plane]);
  useEffect(() => plane.setOrder(order), [plane, order]);
  useFrame((state, delta) => plane.update(state, delta));
  return <primitive object={plane.mesh} />;
}

/**
 * The colour mask (soft dabs of colour along the cursor's recent path, sampled by every plane)
 * and the visible pencil line, both redrawn from the trail each frame there is one.
 */
class TrailLayers {
  readonly canvas = document.createElement("canvas");
  readonly ctx = this.canvas.getContext("2d")!;
  readonly texture = new THREE.CanvasTexture(this.canvas);
  private brush = createBrush();
  private line: CanvasRenderingContext2D | null = null;
  private lineCanvas: HTMLCanvasElement | null = null;
  private width = 1;
  private height = 1;
  private drawn = false;

  constructor() {
    this.texture.colorSpace = THREE.NoColorSpace;
  }

  attachLine(el: HTMLCanvasElement | null) {
    this.lineCanvas = el;
    this.line = el?.getContext("2d") ?? null;
    this.resize(this.width, this.height);
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = Math.max(1, Math.round(width * MASK_SCALE));
    this.canvas.height = Math.max(1, Math.round(height * MASK_SCALE));
    // WebGL storage is fixed-size once allocated: drop it so the new size gets fresh storage
    this.texture.dispose();
    this.texture.needsUpdate = true;
    if (this.lineCanvas && this.line) {
      const dpr = Math.min(window.devicePixelRatio, 2);
      this.lineCanvas.width = width * dpr;
      this.lineCanvas.height = height * dpr;
      this.line.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  draw() {
    const now = performance.now();
    const trail = graphite.trail;
    while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
    if (!trail.length && !this.drawn) return;
    this.drawn = trail.length > 0;

    const { ctx, canvas, brush } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const r = BRUSH_PX * MASK_SCALE;
    for (const p of trail) {
      ctx.globalAlpha = (1 - (now - p.t) / TRAIL_MS) * 0.35;
      ctx.drawImage(brush, p.x * MASK_SCALE - r, p.y * MASK_SCALE - r, r * 2, r * 2);
    }
    this.texture.needsUpdate = true;

    // pencil line: darker and thicker where the hand moves slowly, fading with age
    const lc = this.line;
    if (!lc) return;
    lc.clearRect(0, 0, this.width, this.height);
    lc.lineCap = "round";
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1];
      const b = trail[i];
      if (b.t - a.t > 90) continue; // pen lifted
      const age = (now - b.t) / TRAIL_MS;
      const speed = Math.hypot(b.x - a.x, b.y - a.y) / Math.max(1, b.t - a.t);
      lc.strokeStyle = `rgba(38, 36, 33, ${(1 - age) * 0.75})`;
      lc.lineWidth = 0.9 + 1.3 * (1 - Math.min(1, speed / 2.5));
      lc.beginPath();
      lc.moveTo(a.x, a.y);
      lc.lineTo(b.x, b.y);
      lc.stroke();
    }
  }
}

/** A soft round brush, stamped along the trail. */
function createBrush() {
  const brush = document.createElement("canvas");
  brush.width = brush.height = 64;
  const b = brush.getContext("2d")!;
  const g = b.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  b.fillStyle = g;
  b.fillRect(0, 0, 64, 64);
  return brush;
}

/** One artwork: a plane kept exactly over its placeholder element, drawn with the graphite shader. */
class GraphitePlane {
  readonly mesh: THREE.Mesh;
  private texture: THREE.Texture | null = null;
  private material: THREE.ShaderMaterial;
  private src = "";
  private aspect = 1;
  private attached = false;
  private order = 0;

  constructor(
    private art: Art,
    mask: THREE.Texture
  ) {
    this.material = createGraphiteMaterial(EMPTY, mask);
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 16), this.material);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
  }

  attach() {
    this.attached = true;
    // the placeholder <img> may load (or switch to another srcset candidate) at any time
    this.art.img.addEventListener("load", this.onLoad);
    if (this.art.img.complete && this.art.img.naturalWidth) this.onLoad();
  }

  /** Frees the GPU side once the plane is really gone (not when Strict Mode remounts it straight away). */
  detach() {
    this.attached = false;
    this.art.img.removeEventListener("load", this.onLoad);
    queueMicrotask(() => {
      if (this.attached) return;
      this.texture?.dispose();
      this.material.dispose();
      this.mesh.geometry.dispose();
    });
  }

  /** Loads whatever the <img> settled on (straight from the browser cache) into a texture of its own. */
  private onLoad = () => {
    const src = this.art.img.currentSrc || this.art.img.src;
    if (!src || src === this.src) return;
    this.src = src;
    loader.load(src, (texture) => {
      if (src !== this.src) return texture.dispose();
      texture.colorSpace = THREE.NoColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      const image = texture.image as HTMLImageElement;
      this.aspect = image.width / image.height;
      this.texture?.dispose();
      this.texture = texture;
      this.material.uniforms.uTex.value = texture;
    });
  };

  setOrder(order: number) {
    this.order = order;
  }

  update({ size, gl, clock }: RootState, delta: number) {
    const { art, mesh } = this;
    const rect = art.el.getBoundingClientRect();
    const onScreen = rect.bottom > -MARGIN && rect.top < size.height + MARGIN && rect.right > -MARGIN && rect.left < size.width + MARGIN;
    mesh.visible = !!this.texture && onScreen && rect.width > 0;
    if (!mesh.visible) return;

    // a rotated placeholder's box is its bounds, not its shape: recover the sheet from its layout size
    let width = rect.width;
    let height = rect.height;
    const angle = THREE.MathUtils.degToRad(art.rotation ?? 0);
    if (angle) {
      const { offsetWidth: w, offsetHeight: h } = art.el;
      const k = rect.width / (w * Math.abs(Math.cos(angle)) + h * Math.abs(Math.sin(angle)) || 1);
      width = w * k;
      height = h * k;
    }

    mesh.position.set(rect.left + rect.width / 2 - size.width / 2, size.height / 2 - (rect.top + rect.height / 2), 0);
    mesh.scale.set(width, height, 1);
    mesh.rotation.z = -angle;
    mesh.renderOrder = this.order + (art.layer ?? 0);

    if (art.mode !== "manual") {
      const target = graphite.reducedMotion
        ? 1
        : art.mode === "y"
          ? nearMiddle(rect.top + rect.height / 2, size.height)
          : nearMiddle(rect.left + rect.width / 2, size.width);
      art.reveal = THREE.MathUtils.damp(art.reveal, target, 2.5, delta);
    }

    const u = this.material.uniforms;
    const planeAspect = width / height;
    const imageAspect = this.aspect;
    if (planeAspect > imageAspect) u.uCover.value.set(1, imageAspect / planeAspect);
    else u.uCover.value.set(planeAspect / imageAspect, 1);
    u.uPlane.value.set(width, height);
    gl.getDrawingBufferSize(u.uViewport.value);
    u.uDpr.value = gl.getPixelRatio();
    u.uReveal.value = art.reveal;
    u.uDraw.value = art.draw;
    u.uZoom.value = art.zoom;
    u.uFocus.value.set(art.focus[0], art.focus[1]);
    u.uTime.value = clock.elapsedTime;
    u.uAlpha.value = THREE.MathUtils.damp(u.uAlpha.value, 1, 6, delta);
    // in the sideways sketchbook the middle of each sheet lags behind its edges, as if dragged
    u.uBend.value =
      art.mode === "x" ? THREE.MathUtils.damp(u.uBend.value, THREE.MathUtils.clamp(graphite.velocity * 0.004, -0.07, 0.07), 6, delta) : 0;
  }

}

/** 1 at the middle of the screen, easing to 0 by the time the piece is most of the way off it. */
function nearMiddle(center: number, extent: number) {
  const d = Math.abs(center - extent / 2) / (extent / 2);
  return 1 - THREE.MathUtils.smoothstep(d, 0.2, 0.85);
}
