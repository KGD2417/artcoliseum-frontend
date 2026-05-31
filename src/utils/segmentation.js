/**
 * Segmentation worker wrapper.
 *
 * Loads the SegFormer model (Xenova/segformer-b2-finetuned-ade-512-512) in a
 * Web Worker via @huggingface/transformers.  The model runs in WebAssembly so
 * it works in every modern browser without a GPU or API key.
 *
 * First call downloads ~100 MB (cached in IndexedDB afterward).
 *
 * Usage:
 *   import { runSegmentation, extractSurfaces, pickSurfaceFromPrompt } from './segmentation';
 *   const segments = await runSegmentation(dataURL, onProgress);
 *   const { walls, floors } = extractSurfaces(segments, imgW, imgH);
 */

let worker = null;
let _idCounter = 0;

function getWorker() {
  if (worker) return worker;
  worker = new Worker(
    new URL("./segmentation.worker.js", import.meta.url),
    { type: "module" }
  );
  return worker;
}

/**
 * Run semantic segmentation on a room photo.
 *
 * @param {string}   imageDataURL  - data: URL of the room image
 * @param {Function} onProgress    - called with HuggingFace progress info objects
 * @returns {Promise<Array>}       - [{ label, score, mask: number[], width, height }]
 */
export function runSegmentation(imageDataURL, onProgress) {
  return new Promise((resolve, reject) => {
    const id = ++_idCounter;
    const w = getWorker();

    const handler = ({ data }) => {
      if (data.id !== id) return;
      if (data.type === "progress") {
        onProgress?.(data.info);
      } else if (data.type === "result") {
        w.removeEventListener("message", handler);
        resolve(data.segments);
      } else if (data.type === "error") {
        w.removeEventListener("message", handler);
        reject(new Error(data.message));
      }
    };

    w.addEventListener("message", handler);
    w.postMessage({ id, imageDataURL });
  });
}

// ─── Surface helpers ──────────────────────────────────────────────────────────

export const SURFACE_LABELS = {
  wall: ["wall"],
  floor: ["floor", "floor, flooring", "rug"],
};

/**
 * Given the segments array, return wall and floor segments each with a
 * bounding quad computed from the mask, scaled to imageWidth x imageHeight.
 */
export function extractSurfaces(segments, imageWidth, imageHeight) {
  const wallSegs = segments.filter((s) => SURFACE_LABELS.wall.includes(s.label));
  const floorSegs = segments.filter((s) => SURFACE_LABELS.floor.includes(s.label));

  return {
    walls: wallSegs.map((s) => ({
      ...s,
      quad: maskToQuad(s.mask, s.width, s.height, imageWidth, imageHeight),
    })),
    floors: floorSegs.map((s) => ({
      ...s,
      quad: maskToQuad(s.mask, s.width, s.height, imageWidth, imageHeight),
    })),
  };
}

function maskToQuad(mask, maskW, maskH, imgW, imgH) {
  const leftEdge = [], rightEdge = [];
  let bbMinX = maskW, bbMaxX = 0, bbMinY = maskH, bbMaxY = 0;

  for (let y = 0; y < maskH; y++) {
    let left = -1, right = -1;
    for (let x = 0; x < maskW; x++) {
      if (mask[y * maskW + x] > 127) {
        if (left === -1) left = x;
        right = x;
      }
    }
    if (left !== -1) {
      leftEdge.push([left, y]);
      rightEdge.push([right, y]);
      if (left  < bbMinX) bbMinX = left;
      if (right > bbMaxX) bbMaxX = right;
      if (y     < bbMinY) bbMinY = y;
      if (y     > bbMaxY) bbMaxY = y;
    }
  }

  const sx = imgW / maskW, sy = imgH / maskH;

  if (leftEdge.length === 0) return [[0,0],[imgW,0],[imgW,imgH],[0,imgH]];

  // Average the top and bottom 15% of edge rows for stable corner estimates
  const n    = leftEdge.length;
  const band = Math.max(3, Math.floor(n * 0.15));

  function avg(pts) {
    const s = pts.reduce((a, p) => [a[0]+p[0], a[1]+p[1]], [0,0]);
    return [s[0]/pts.length, s[1]/pts.length];
  }

  const tl = avg(leftEdge.slice(0, band));
  const tr = avg(rightEdge.slice(0, band));
  const br = avg(rightEdge.slice(-band));
  const bl = avg(leftEdge.slice(-band));

  // Safety: if the edge-derived quad looks "crossed" or too narrow, fall back to bounding box
  // A crossed quad has TL.x > TR.x at the top or BL.x > BR.x at the bottom
  const topWidth  = tr[0] - tl[0];
  const botWidth  = br[0] - bl[0];
  const topHeight = bl[1] - tl[1];
  if (topWidth < 2 || botWidth < 2 || topHeight < 2) {
    // Bounding box fallback
    return [
      [bbMinX * sx, bbMinY * sy],
      [bbMaxX * sx, bbMinY * sy],
      [bbMaxX * sx, bbMaxY * sy],
      [bbMinX * sx, bbMaxY * sy],
    ];
  }

  return [
    [tl[0]*sx, tl[1]*sy],
    [tr[0]*sx, tr[1]*sy],
    [br[0]*sx, br[1]*sy],
    [bl[0]*sx, bl[1]*sy],
  ];
}

/**
 * Pick the best surface from a list based on a text prompt.
 * Falls back to the largest surface.
 */
export function pickSurfaceFromPrompt(surfaces, prompt) {
  if (!surfaces || surfaces.length === 0) return null;
  const p = (prompt || "").toLowerCase();
  const isLeft  = /\bleft\b/.test(p);
  const isRight = /\bright\b/.test(p);
  const isBack  = /\bback\b|\bbehind\b|\bfar\b/.test(p);

  if (isLeft)  return [...surfaces].sort((a, b) => cx(a.quad) - cx(b.quad))[0];
  if (isRight) return [...surfaces].sort((a, b) => cx(b.quad) - cx(a.quad))[0];
  if (isBack)  return [...surfaces].sort((a, b) => area(b.quad) - area(a.quad))[0];
  return [...surfaces].sort((a, b) => area(b.quad) - area(a.quad))[0];
}

function cx(quad) { return (quad[0][0] + quad[1][0] + quad[2][0] + quad[3][0]) / 4; }
function area(quad) { return Math.abs(quad[1][0] - quad[0][0]) * Math.abs(quad[2][1] - quad[0][1]); }

/**
 * Draw semi-transparent coloured overlays for each surface on a canvas context.
 */
export function drawSurfaceOverlays(ctx, walls, floors, imgW, imgH) {
  const drawMask = (seg, rgba) => {
    if (!seg.mask) return;
    const [r, g, b, a] = rgba;
    const imgData = ctx.createImageData(seg.width, seg.height);
    for (let i = 0; i < seg.mask.length; i++) {
      if (seg.mask[i] > 127) {
        imgData.data[i * 4]     = r;
        imgData.data[i * 4 + 1] = g;
        imgData.data[i * 4 + 2] = b;
        imgData.data[i * 4 + 3] = a;
      }
    }
    const tmp = document.createElement("canvas");
    tmp.width = seg.width;
    tmp.height = seg.height;
    tmp.getContext("2d").putImageData(imgData, 0, 0);
    ctx.drawImage(tmp, 0, 0, imgW, imgH);
  };

  walls.forEach((w) => drawMask(w, [212, 175, 55, 70]));
  floors.forEach((f) => drawMask(f, [100, 180, 255, 55]));
}
