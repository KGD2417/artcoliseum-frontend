/**
 * Perspective / affine compositing utilities.
 *
 * compositeArtwork uses a canvas 2D affine transform (TL, TR, BL corners) rather
 * than per-pixel homography backward-mapping.  This is GPU-accelerated, numerically
 * stable, and visually correct for all frontal / near-frontal wall placements.
 * The 4th corner (BR) is extrapolated by the affine — imperceptible in practice.
 */

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Composite artworkImg into destQuad on destCanvas.
 *
 * @param {HTMLCanvasElement} destCanvas  - canvas with room photo already drawn
 * @param {HTMLImageElement}  artworkImg  - artwork image element (fully loaded)
 * @param {Array}             destQuad    - 4×[x,y] pixel coords [TL, TR, BR, BL]
 * @param {Object}            options     - { shadow, shadowStrength }
 */
export function compositeArtwork(destCanvas, artworkImg, destQuad, options = {}) {
  const { shadow = true, shadowStrength = 0.35 } = options;
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

  // ── Affine transform: artwork (0,0)→tl, (W,0)→tr, (0,H)→bl ──────────────
  // Standard canvas transform(a, b, c, d, e, f) — column-major affine matrix:
  //   x' = a·x + c·y + e
  //   y' = b·x + d·y + f
  const a = (tr[0] - tl[0]) / artW;   // scale + shear X per artwork-X
  const b = (tr[1] - tl[1]) / artW;   // shear Y per artwork-X
  const c = (bl[0] - tl[0]) / artH;   // shear X per artwork-Y
  const d = (bl[1] - tl[1]) / artH;   // scale + shear Y per artwork-Y
  const e = tl[0];                     // translate X
  const f = tl[1];                     // translate Y

  ctx.save();

  // Clip to the dest quad so artwork never bleeds outside the detected wall
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]);
  ctx.lineTo(tr[0], tr[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(bl[0], bl[1]);
  ctx.closePath();
  ctx.clip();

  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(artworkImg, 0, 0, artW, artH);
  ctx.restore();

  // ── Drop shadow ───────────────────────────────────────────────────────────
  if (shadow) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tl[0], tl[1]);
    ctx.lineTo(tr[0], tr[1]);
    ctx.lineTo(br[0], br[1]);
    ctx.lineTo(bl[0], bl[1]);
    ctx.closePath();
    ctx.shadowColor    = `rgba(0,0,0,${(shadowStrength + 0.1).toFixed(2)})`;
    ctx.shadowBlur     = 28;
    ctx.shadowOffsetX  = 5;
    ctx.shadowOffsetY  = 9;
    ctx.strokeStyle    = `rgba(0,0,0,${(shadowStrength * 0.4).toFixed(2)})`;
    ctx.lineWidth      = 2;
    ctx.stroke();
    ctx.restore();
  }
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
