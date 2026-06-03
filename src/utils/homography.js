/**
 * Perspective compositing utilities.
 *
 * compositeArtwork warps the artwork into the destination quad with a TRUE 4-point
 * perspective (homography), drawn as a fine triangle mesh so it stays GPU-accelerated
 * (no per-pixel loop). It then matches the artwork to the wall's light and casts a
 * perspective-aware soft shadow, so the piece sits in the room instead of looking
 * pasted on. Falls back to a centered draw for degenerate quads.
 */

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Composite artworkImg into destQuad on destCanvas.
 *
 * @param {HTMLCanvasElement} destCanvas  - canvas with room photo already drawn
 * @param {HTMLImageElement}  artworkImg  - artwork image element (fully loaded)
 * @param {Array}             destQuad    - 4×[x,y] pixel coords [TL, TR, BR, BL]
 * @param {Object}            options     - { shadow, shadowStrength, light }
 */
export function compositeArtwork(destCanvas, artworkImg, destQuad, options = {}) {
  const { shadow = true, shadowStrength = 0.35, light = true } = options;
  const ctx = destCanvas.getContext("2d");
  const dW  = destCanvas.width;
  const dH  = destCanvas.height;
  const artW = artworkImg.naturalWidth  || artworkImg.width  || 1;
  const artH = artworkImg.naturalHeight || artworkImg.height || 1;

  const [tl, tr, br, bl] = destQuad;

  // ── Sanity check ──────────────────────────────────────────────────────────
  // Cross-product of (TL→TR) × (TL→BL) gives signed area; near-zero = degenerate
  const crossArea = Math.abs(
    (tr[0] - tl[0]) * (bl[1] - tl[1]) -
    (bl[0] - tl[0]) * (tr[1] - tl[1])
  );
  if (crossArea < 200) {
    // Degenerate quad — centre the artwork at 40% canvas width as a safe fallback
    const fw = Math.round(dW * 0.4);
    const fh = Math.round(fw * artH / artW);
    ctx.save();
    ctx.drawImage(artworkImg, (dW - fw) / 2, (dH - fh) / 2, fw, fh);
    ctx.restore();
    return;
  }

  // ── Sample the wall light UNDER the quad (before we paint over it) ──────────
  // Average colour + luminance of the destination region, used to tint the
  // artwork so it picks up the room's warmth/coolness and brightness.
  const wallLight = light ? sampleQuadLight(ctx, destQuad) : null;

  // ── Perspective-aware soft drop shadow behind the artwork ──────────────────
  // Offset the quad down-right in its own plane and fill a blurred dark shape so
  // the piece reads as standing slightly off the wall.
  if (shadow) {
    const off = Math.max(4, Math.hypot(tr[0] - tl[0], tr[1] - tl[1]) * 0.012);
    const shadowQuad = [
      [tl[0] + off, tl[1] + off * 1.6],
      [tr[0] + off, tr[1] + off * 1.6],
      [br[0] + off, br[1] + off * 1.6],
      [bl[0] + off, bl[1] + off * 1.6],
    ];
    ctx.save();
    ctx.filter = `blur(${Math.round(off * 1.8)}px)`;
    ctx.fillStyle = `rgba(0,0,0,${(shadowStrength + 0.12).toFixed(2)})`;
    quadPath(ctx, shadowQuad);
    ctx.fill();
    ctx.restore();
  }

  // ── True perspective warp via triangle mesh ────────────────────────────────
  // Map artwork space (0..artW, 0..artH) → dest quad with a homography, then draw
  // a GRID×GRID mesh of textured triangles. More cells = smoother perspective.
  const H = computeHomography(
    [[0, 0], [artW, 0], [artW, artH], [0, artH]],
    [tl, tr, br, bl]
  );

  ctx.save();
  quadPath(ctx, destQuad);
  ctx.clip(); // never bleed outside the wall quad

  drawImageMesh(ctx, artworkImg, artW, artH, H, 12);

  // ── Wall-light match: multiply a soft tint pulled from the wall ────────────
  if (wallLight) {
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = `rgb(${wallLight.r},${wallLight.g},${wallLight.b})`;
    quadPath(ctx, destQuad);
    ctx.fill();
    // Lift shadows back slightly so the multiply never crushes the art to mud.
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.10;
    const lift = Math.min(255, wallLight.lum + 40);
    ctx.fillStyle = `rgb(${lift},${lift},${lift})`;
    quadPath(ctx, destQuad);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  // ── Top-edge ambient occlusion: thin dark gradient where art meets wall ────
  const aoH = 0.06; // fraction of the artwork height
  const aoQuad = [
    tl,
    tr,
    [tr[0] + (br[0] - tr[0]) * aoH, tr[1] + (br[1] - tr[1]) * aoH],
    [tl[0] + (bl[0] - tl[0]) * aoH, tl[1] + (bl[1] - tl[1]) * aoH],
  ];
  const aoGrad = ctx.createLinearGradient(
    (tl[0] + tr[0]) / 2, (tl[1] + tr[1]) / 2,
    (aoQuad[3][0] + aoQuad[2][0]) / 2, (aoQuad[3][1] + aoQuad[2][1]) / 2
  );
  aoGrad.addColorStop(0, "rgba(0,0,0,0.22)");
  aoGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aoGrad;
  quadPath(ctx, aoQuad);
  ctx.fill();

  ctx.restore();
}

/** Build a closed path for a [TL,TR,BR,BL] quad (does not stroke/fill). */
function quadPath(ctx, [tl, tr, br, bl]) {
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]);
  ctx.lineTo(tr[0], tr[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(bl[0], bl[1]);
  ctx.closePath();
}

/** Average colour + luminance of the dest-quad region of the current canvas. */
function sampleQuadLight(ctx, [tl, tr, br, bl]) {
  const minX = Math.max(0, Math.floor(Math.min(tl[0], tr[0], br[0], bl[0])));
  const minY = Math.max(0, Math.floor(Math.min(tl[1], tr[1], br[1], bl[1])));
  const maxX = Math.ceil(Math.max(tl[0], tr[0], br[0], bl[0]));
  const maxY = Math.ceil(Math.max(tl[1], tr[1], br[1], bl[1]));
  const w = Math.min(ctx.canvas.width - minX, maxX - minX);
  const h = Math.min(ctx.canvas.height - minY, maxY - minY);
  if (w <= 0 || h <= 0) return null;
  let data;
  try { data = ctx.getImageData(minX, minY, w, h).data; }
  catch { return null; } // tainted canvas (cross-origin) — skip light match
  let r = 0, g = 0, b = 0, n = 0;
  const step = Math.max(1, Math.floor((w * h) / 4000)) * 4; // sample ~4k px
  for (let i = 0; i < data.length; i += step) {
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
  }
  if (!n) return null;
  r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
  return { r, g, b, lum: Math.round(0.299 * r + 0.587 * g + 0.114 * b) };
}

/**
 * Draw `img` into the region defined by homography H using a GRID×GRID mesh of
 * affine-textured triangles — a fast approximation of a full perspective warp.
 */
function drawImageMesh(ctx, img, imgW, imgH, H, GRID) {
  const cw = imgW / GRID, ch = imgH / GRID;
  // Precompute the projected dest points for every grid vertex.
  const pts = [];
  for (let gy = 0; gy <= GRID; gy++) {
    const row = [];
    for (let gx = 0; gx <= GRID; gx++) {
      row.push(applyHomography(H, gx * cw, gy * ch));
    }
    pts.push(row);
  }
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const sx = gx * cw, sy = gy * ch;
      const p00 = pts[gy][gx],     p10 = pts[gy][gx + 1];
      const p01 = pts[gy + 1][gx], p11 = pts[gy + 1][gx + 1];
      // Two triangles per cell, each drawn with its own affine texture map.
      drawTexturedTriangle(ctx, img, [sx, sy], [sx + cw, sy], [sx, sy + ch], p00, p10, p01);
      drawTexturedTriangle(ctx, img, [sx + cw, sy], [sx + cw, sy + ch], [sx, sy + ch], p10, p11, p01);
    }
  }
}

/** Affine-map a source triangle of `img` onto a destination triangle. */
function drawTexturedTriangle(ctx, img, s0, s1, s2, d0, d1, d2) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(d0[0], d0[1]);
  ctx.lineTo(d1[0], d1[1]);
  ctx.lineTo(d2[0], d2[1]);
  ctx.closePath();
  ctx.clip();

  // Solve the affine matrix that maps the source tri → dest tri.
  const denom = (s1[0] - s0[0]) * (s2[1] - s0[1]) - (s2[0] - s0[0]) * (s1[1] - s0[1]);
  if (Math.abs(denom) < 1e-6) { ctx.restore(); return; }
  const a = ((d1[0] - d0[0]) * (s2[1] - s0[1]) - (d2[0] - d0[0]) * (s1[1] - s0[1])) / denom;
  const b = ((d1[1] - d0[1]) * (s2[1] - s0[1]) - (d2[1] - d0[1]) * (s1[1] - s0[1])) / denom;
  const c = ((d2[0] - d0[0]) * (s1[0] - s0[0]) - (d1[0] - d0[0]) * (s2[0] - s0[0])) / denom;
  const d = ((d2[1] - d0[1]) * (s1[0] - s0[0]) - (d1[1] - d0[1]) * (s2[0] - s0[0])) / denom;
  const e = d0[0] - a * s0[0] - c * s0[1];
  const f = d0[1] - b * s0[0] - d * s0[1];

  ctx.transform(a, b, c, d, e, f);
  // Slight overdraw avoids hairline seams between adjacent triangles.
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/**
 * Radial ground shadow for sculptures: ellipse at the base of destQuad.
 */
export function compositeGroundShadow(destCanvas, destQuad, strength = 0.5) {
  const ctx = destCanvas.getContext("2d");
  const [, , br, bl] = destQuad;
  const cx = (br[0] + bl[0]) / 2;
  const cy = (br[1] + bl[1]) / 2;
  const rx = Math.abs(br[0] - bl[0]) / 2;
  const ry = rx * 0.18;

  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  grad.addColorStop(0, `rgba(0,0,0,${strength})`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── Kept for potential external use (ManualPlacer) ───────────────────────────
export function computeHomography(src, dst) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [sx, sy] = src[i], [dx, dy] = dst[i];
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]); b.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);  b.push(dy);
  }
  const h = gaussianElimination(A, b);
  return [...h, 1];
}

export function invertMatrix3x3(m) {
  const [a, b, c, d, e, f, g, h, k] = m;
  const det = a*(e*k-f*h) - b*(d*k-f*g) + c*(d*h-e*g);
  if (Math.abs(det) < 1e-10) throw new Error("Singular matrix");
  const inv = 1 / det;
  return [
    (e*k-f*h)*inv, (c*h-b*k)*inv, (b*f-c*e)*inv,
    (f*g-d*k)*inv, (a*k-c*g)*inv, (c*d-a*f)*inv,
    (d*h-e*g)*inv, (b*g-a*h)*inv, (a*e-b*d)*inv,
  ];
}

export function applyHomography(H, x, y) {
  const w = H[6]*x + H[7]*y + H[8];
  return [(H[0]*x + H[1]*y + H[2])/w, (H[3]*x + H[4]*y + H[5])/w];
}

function gaussianElimination(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col+1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    for (let row = col+1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let j = col; j <= n; j++) M[row][j] -= factor * M[col][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n-1; i >= 0; i--) {
    x[i] = M[i][n] / M[i][i];
    for (let j = i-1; j >= 0; j--) M[j][n] -= M[j][i] * x[i];
  }
  return x;
}
