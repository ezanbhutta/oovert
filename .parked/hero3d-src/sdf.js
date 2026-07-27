/**
 * Signed distance field of the OOVERT eclipse, built in the browser at init.
 *
 * Nothing is shipped as an image. The mark already lives in the repo as 1.9KB
 * of SVG path data, so the field is rasterised and distance-transformed on the
 * client. That keeps the payload at zero bytes and means the field is always
 * in sync with the real mark rather than with a stale baked PNG.
 *
 * The transform is Felzenszwalb-Huttenlocher (the formulation Mapbox's
 * tiny-sdf uses): an exact squared euclidean distance transform in two 1-D
 * passes, seeded from the rasterised alpha so partially covered pixels
 * contribute sub-pixel distance rather than snapping to the pixel grid.
 *
 * Work is split across animation frames because the whole point of the gate is
 * that this never blocks the main thread while the page is still arriving.
 */

const SS = 2; // supersample factor for the rasterisation

/* One dimension of the FH transform. f is the cost row, d receives the result. */
function edt1d(f, d, v, z, n) {
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1, k = 0; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  for (let q = 0, k = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const dq = q - v[k];
    d[q] = f[v[k]] + dq * dq;
  }
}

/* Squared EDT over a 2-D grid held in `data` (cost, row-major).
   Yielded in slices: run whole, each pass is a single ~120ms task, which is
   long enough to eat an interaction if the visitor clicks while it runs. */
async function edt2d(data, w, h, yieldFrame) {
  const f = new Float64Array(Math.max(w, h));
  const d = new Float64Array(Math.max(w, h));
  const v = new Int32Array(Math.max(w, h));
  const z = new Float64Array(Math.max(w, h) + 1);
  const SLICE = 128;

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = data[y * w + x];
    edt1d(f, d, v, z, h);
    for (let y = 0; y < h; y++) data[y * w + x] = d[y];
    if ((x + 1) % SLICE === 0) await yieldFrame();
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = data[y * w + x];
    edt1d(f, d, v, z, w);
    for (let x = 0; x < w; x++) data[y * w + x] = d[x];
    if ((y + 1) % SLICE === 0) await yieldFrame();
  }
}

/**
 * Build the field.
 * @param {object} MARK  parsed mark-paths.json
 * @param {number} W     field width in texels
 * @param {number} H     field height in texels
 * @param {number} PAD   padding around the mark bbox, in mark widths
 * @param {function} yieldFrame  awaited between chunks so nothing blocks
 * @returns {{data: Float32Array, w: number, h: number, aspect: number}}
 *          distances in MARK-WIDTH units, negative inside the mark
 */
export async function buildMarkSDF(MARK, W, H, PAD, yieldFrame) {
  const paths = [...MARK.eclipseL, ...MARK.eclipseR];

  // Measure the mark's bbox in viewBox units by rasterising once at low res.
  // Cheaper and more honest than trusting a hardcoded number: if the mark
  // changes in the CMS, everything downstream follows.
  const bbox = measureBBox(paths, MARK.viewBox);
  const aspect = bbox.w / bbox.h;

  const rw = W * SS;
  const rh = H * SS;
  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(rw, rh)
    : Object.assign(document.createElement('canvas'), { width: rw, height: rh });
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, rw, rh);

  // Map the padded box onto the raster. The padded box is PAD mark-widths on
  // every side, expressed in mark-width units: (1 + 2·PAD) wide.
  const boxW = bbox.w * (1 + 2 * PAD);
  const boxH = boxW / (rw / rh);
  const scale = rw / boxW;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.translate(-(bbox.x - bbox.w * PAD), -(bbox.y + bbox.h / 2 - boxH / 2));

  ctx.fillStyle = '#fff';
  for (const dstr of paths) ctx.fill(new Path2D(dstr));

  const img = ctx.getImageData(0, 0, rw, rh).data;
  await yieldFrame();

  const n = rw * rh;
  const outer = new Float64Array(n);
  const inner = new Float64Array(n);
  const INF = 1e20;
  for (let i = 0; i < n; i++) {
    const a = img[i * 4 + 3] / 255;
    // Sub-pixel seeding: a partially covered pixel sits (0.5 - a) inside the
    // edge, which is what keeps the contour smooth instead of stair-stepped.
    if (a >= 1) { outer[i] = 0; inner[i] = INF; }
    else if (a <= 0) { outer[i] = INF; inner[i] = 0; }
    else {
      const e = 0.5 - a;
      outer[i] = e > 0 ? e * e : 0;
      inner[i] = e < 0 ? e * e : 0;
    }
  }
  await yieldFrame();

  await edt2d(outer, rw, rh, yieldFrame);
  await edt2d(inner, rw, rh, yieldFrame);

  // Combine, convert raster texels -> mark-width units, and box-downsample.
  const perTexel = boxW / rw / bbox.w; // mark-widths per raster texel
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = (y * SS + sy) * rw + (x * SS + sx);
          acc += (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) * perTexel;
        }
      }
      // Flip vertically: canvas is y-down, the shader samples y-up.
      out[(H - 1 - y) * W + x] = acc / (SS * SS);
    }
  }

  /* The transform seeds its costs on the raster grid, so the finished field
     carries a ripple of about half a texel along the contour. That is
     invisible as a distance and ruinous as a normal: across one texel it is a
     slope near 0.3, which combs every bevel with an 18-degree wobble. A
     separable binomial blur removes it and cannot move the contour, because an
     SDF is linear near its zero crossing and blurring a linear ramp is a
     no-op. Curvature shifts by well under a texel at this radius. */
  blur121(out, W, H);
  blur121(out, W, H);

  return { data: out, w: W, h: H, aspect };
}

/* Separable (1,2,1)/4, clamped at the edges, in place. */
function blur121(a, w, h) {
  const row = new Float32Array(Math.max(w, h));
  for (let y = 0; y < h; y++) {
    const o = y * w;
    for (let x = 0; x < w; x++) row[x] = a[o + x];
    for (let x = 0; x < w; x++) {
      const l = row[x > 0 ? x - 1 : 0];
      const r = row[x < w - 1 ? x + 1 : w - 1];
      a[o + x] = (l + 2 * row[x] + r) * 0.25;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) row[y] = a[y * w + x];
    for (let y = 0; y < h; y++) {
      const u = row[y > 0 ? y - 1 : 0];
      const d = row[y < h - 1 ? y + 1 : h - 1];
      a[y * w + x] = (u + 2 * row[y] + d) * 0.25;
    }
  }
}

/* Rasterise small and read back the ink bounds, in viewBox units. */
function measureBBox(paths, viewBox) {
  const RW = 600;
  const vbW = viewBox[2], vbH = viewBox[3];
  const RH = Math.max(1, Math.round(RW * vbH / vbW));
  const c = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(RW, RH)
    : Object.assign(document.createElement('canvas'), { width: RW, height: RH });
  const ctx = c.getContext('2d', { willReadFrequently: true });
  const s = RW / vbW;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = '#fff';
  for (const d of paths) ctx.fill(new Path2D(d));
  const px = ctx.getImageData(0, 0, RW, RH).data;

  let minX = RW, minY = RH, maxX = -1, maxY = -1;
  for (let y = 0; y < RH; y++) {
    for (let x = 0; x < RW; x++) {
      if (px[(y * RW + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    x: minX / s,
    y: minY / s,
    w: (maxX - minX + 1) / s,
    h: (maxY - minY + 1) / s,
  };
}
