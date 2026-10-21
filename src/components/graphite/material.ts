import * as THREE from "three";

/**
 * Renders a picture as a pencil drawing on paper — Sobel edges for the linework, three layers
 * of cross-hatching for tone — and bleeds the real colours back in like watercolour wherever
 * `uReveal` or the cursor's trail (uMask) reaches.
 *
 * Textures are left untagged (no colour-space conversion) and nothing is tone-mapped, so the
 * values that come out match the page's CSS colours exactly.
 */

const vertex = /* glsl */ `
  uniform float uBend;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // fast scrolling bows the sheet a little, like paper dragged across a desk
    p.x += sin(uv.y * 3.14159) * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform sampler2D uMask;
  uniform vec2 uPlane;     // css px
  uniform vec2 uCover;     // uv scale that makes the image cover its frame
  uniform vec2 uViewport;  // drawing-buffer px
  uniform float uDpr;
  uniform float uReveal;
  uniform float uDraw;
  uniform float uZoom;
  uniform vec2 uFocus;
  uniform float uTime;
  uniform float uAlpha;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  // one family of hatch strokes: thin parallel lines, broken up along their length
  float hatch(vec2 p, float angle, float spacing) {
    float s = sin(angle), c = cos(angle);
    vec2 r = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    float line = abs(fract(r.y / spacing) - 0.5) * 2.0;
    float stroke = 1.0 - smoothstep(0.0, 0.4, line);
    return stroke * smoothstep(0.25, 0.6, noise(vec2(r.x * 0.045, floor(r.y / spacing) * 7.0)));
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    uv = (uv - uFocus) / uZoom + uFocus;
    vec4 texel = texture2D(uTex, uv);
    vec3 col = texel.rgb;

    // linework: edge strength of the picture, sampled at a constant on-screen width
    vec2 px = 1.0 * uCover / (uPlane * uZoom);
    float tl = luma(texture2D(uTex, uv + px * vec2(-1, 1)).rgb);
    float t  = luma(texture2D(uTex, uv + px * vec2(0, 1)).rgb);
    float tr = luma(texture2D(uTex, uv + px * vec2(1, 1)).rgb);
    float l  = luma(texture2D(uTex, uv + px * vec2(-1, 0)).rgb);
    float r  = luma(texture2D(uTex, uv + px * vec2(1, 0)).rgb);
    float bl = luma(texture2D(uTex, uv + px * vec2(-1, -1)).rgb);
    float b  = luma(texture2D(uTex, uv + px * vec2(0, -1)).rgb);
    float br = luma(texture2D(uTex, uv + px * vec2(1, -1)).rgb);
    float gx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
    float gy = (tl + 2.0 * t + tr) - (bl + 2.0 * b + br);
    float edge = smoothstep(0.2, 0.65, length(vec2(gx, gy))) * 0.8;

    // tone: lighter areas get one direction of hatching, darker areas cross-hatching
    vec2 p = gl_FragCoord.xy / uDpr;
    float dark = smoothstep(0.08, 0.92, 1.0 - luma(col));
    float shade = hatch(p, 0.75, 5.0) * smoothstep(0.38, 0.68, dark)
                + hatch(p, -0.6, 6.0) * smoothstep(0.58, 0.86, dark)
                + hatch(p, 1.9, 4.0) * smoothstep(0.78, 0.97, dark);

    // the drawing appears in the order a hand would lay it down: blocky noise sweeps across
    float order = fbm(vUv * 2.5) * 0.7 + (1.0 - vUv.y) * 0.3;
    float laid = smoothstep(order, order + 0.08, uDraw * 1.1);
    float shaded = smoothstep(order + 0.25, order + 0.4, uDraw * 1.4);

    float lead = clamp(edge * laid + clamp(shade, 0.0, 1.0) * 0.5 * shaded, 0.0, 1.0);
    float grain = noise(gl_FragCoord.xy * 0.7);
    vec3 paper = vec3(0.953, 0.941, 0.914) - grain * 0.025;
    vec3 sketch = mix(paper, vec3(0.16, 0.155, 0.15), lead * (0.85 + grain * 0.15));

    // colour bleeds in through a ragged, slowly drifting front, like wet paint
    float mask = texture2D(uMask, gl_FragCoord.xy / uViewport).r;
    vec2 sp = gl_FragCoord.xy / uDpr;
    float ragged = fbm(vUv * 3.5 + uTime * 0.04) * 0.45 + noise(sp * 0.09) * 0.12;
    float front = uReveal * 1.25 + mask * 1.1 - ragged;
    float wet = smoothstep(0.4, 0.5, front);
    float rim = wet - smoothstep(0.5, 0.62, front);
    vec3 paint = col * (1.0 - rim * 0.28);
    vec3 outColor = mix(sketch, paint, wet);
    // the pencil underdrawing still shows faintly through the paint
    outColor *= 1.0 - edge * 0.12 * wet;

    // cut-outs (the cartoon Pencil) keep their silhouette: no paper drawn outside it
    gl_FragColor = vec4(outColor, uAlpha * texel.a);
  }
`;

export function createGraphiteMaterial(tex: THREE.Texture, mask: THREE.Texture) {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthTest: false,
    uniforms: {
      uTex: { value: tex },
      uMask: { value: mask },
      uPlane: { value: new THREE.Vector2(1, 1) },
      uCover: { value: new THREE.Vector2(1, 1) },
      uViewport: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uReveal: { value: 0 },
      uDraw: { value: 1 },
      uZoom: { value: 1 },
      uFocus: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uAlpha: { value: 0 },
      uBend: { value: 0 },
    },
  });
}
