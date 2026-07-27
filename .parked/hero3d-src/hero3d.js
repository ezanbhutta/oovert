/**
 * THE IMPRESSION — the hero as a sheet of stock with the mark struck into it.
 *
 * The hero is not a page with an object floating on it. The canvas renders the
 * paper itself, and the OOVERT eclipse is a blind deboss pressed into that
 * paper: no ink, no foil, pressure only. The pointer does not move the mark.
 * It moves the light. A deboss is nearly invisible under flat light and
 * unmissable under a raking one, so the mark surfaces and submerges as the key
 * swings: the studio's own line, "camouflage is for prey", stated as material
 * behaviour rather than as decoration.
 *
 * Foil was tried and cut. A metal is only what it reflects, and against L*94
 * stock every version of it read as a brass ornament sitting on the page
 * instead of a finish struck into it. Blind is also the more expensive
 * finish in real print, and it is the only one that stays inside the
 * palette the rest of the site already uses.
 *
 * Why a single fragment shader instead of Three.js: there is no geometry, no
 * camera transform, no material graph and no loaded asset here, so a scene
 * graph would be 470KB of machinery to draw one triangle. This is ~20KB, it
 * compiles in a few ms, and the entire relief is a fragment-side height field.
 *
 * Everything about the look is physical rather than stylistic. The dark values
 * are shadow and occlusion, never tint, which is precisely why this reads on a
 * pale ground where a transmissive/tinted object washes out to a smudge. The
 * exposure is renormalised whenever the light moves so the flat sheet always
 * resolves to exactly --paper: the light changes the relief, never the colour
 * of the page, and the canvas/CSS seam stays invisible by construction.
 */
import MARK from './mark-paths.json';
import { buildMarkSDF } from './sdf.js';

/* ---- constants: geometry, in mark widths ------------------------------- */
const PAD = 0.075;
const SDF_W = 512, SDF_H = 272;

/* ---- constants: composition -------------------------------------------- */
const BAND_FILL = 0.86;  // of the open band between eyebrow and headline
const MAX_W = 0.46;      // of hero width, so it never spans the page

/* ---- constants: light --------------------------------------------------- */
const AZIM_REST = 2.55, AZIM_RANGE = 0.80;
const ELEV_REST = 0.3351, ELEV_MID = 0.3490, ELEV_SWING = 0.0785;
// Mirrors of the shader constants: the exposure below renormalises the flat
// sheet to exactly --paper, so these three must track FILLK/WRAP/ON_A in FRAG.
const ON_A = 0.83673, FILL = 0.100, WRAP = 0.550;

const LERP = 0.075;
const STRIKE_MS = 620;
const ENTRANCE_END = 2400, STRIKE_WINDOW = 6000;

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  uRes;        // device px
uniform float uAspect;     // heroW / heroH
uniform float uResY;       // hero height in device px
uniform sampler2D uSDF;

uniform vec2  uMarkC;      // mark bbox centre, sheet units
uniform vec2  uMarkBox;    // padded box size, sheet units
uniform float uMarkW;      // mark bbox width, sheet units
uniform vec3  uLight;      // key direction
uniform vec3  uStripT;     // strip axis
uniform float uExposure;
uniform float uStrike;
uniform float uTexel;      // sheet units per SDF texel

const float MARK_ASPECT = 2.17590;
const float K_DEPTH     = 0.01250;
const float K_SHOULDER  = 0.03000;
const float K_DISH      = 0.00340;
const float K_DISH_W    = 0.09000;
const float SHADOW_LEN  = 0.04500;
const float AO_STRENGTH = 0.22000;
const float AO_FALL     = 0.01000;

const float TOOTH_PERIOD_PX = 2.80,  TOOTH_SLOPE = 0.0550;
const float FORM_PERIOD_PX  = 46.0,  FORM_SLOPE  = 0.0120;

const vec3  EYE = vec3(0.06, 0.02, 5.20);
const float STRIP_DIST = 3.20, STRIP_HALF = 1.60;
const float FILLK = 0.1000;
/* The key is a softbox two metres across, not a point. Wrapping the lambert
   term is what a broad source actually does, and without it every wall past
   the terminator gets no key at all and the deboss reads as a hard grey
   stencil cut out of the page instead of a pressure mark pushed into it. */
const float WRAP = 0.5500;
const vec3  FILL_TINT  = vec3(1.0000, 0.9940, 0.9780);
const vec3  PAPER   = vec3(0.89627, 0.87137, 0.81485);
const float ON_A    = 0.83673, ON_B = 0.28800;
const float PAPER_A = 0.4200,  PAPER_F0 = 0.0400;
const float SHEEN   = 0.2800,  SHEEN_R = 0.9000;
const vec3  SHEEN_COL = vec3(1.00000, 0.95946, 0.86316);
const float VWIN = 0.0750;

float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

/* Analytic-derivative gradient noise: value plus exact d/dx, d/dy, so the
   substrate never needs finite differencing across its own Nyquist limit. */
vec3 noised(vec2 x){
  vec2 i = floor(x), f = fract(x);
  vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
  vec2 du = 30.0*f*f*(f*(f-2.0)+1.0);
  float a = hash12(i), b = hash12(i+vec2(1,0)), c = hash12(i+vec2(0,1)), d = hash12(i+vec2(1,1));
  float k0=a, k1=b-a, k2=c-a, k3=a-b-c+d;
  return vec3(k0 + k1*u.x + k2*u.y + k3*u.x*u.y,
              du.x*(k1 + k3*u.y),
              du.y*(k2 + k3*u.x));
}

/* Signed distance to the mark, in mark widths. Analytic clamp outside the
   padded box so nothing depends on texture edge behaviour. */
float sdf(vec2 sh){
  vec2 s = (sh - uMarkC) / uMarkBox + 0.5;
  if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0) return 1.0;
  return texture(uSDF, s).r;
}

/* The die profile. 1-(1-t)^1.7 sweeps the shoulder normal through the
   specular condition, which is what makes a thin line of foil blaze rather
   than a soft bevel glow. */
float biteProfile(float d){
  /* Smoothstep, not a power curve. 1-(1-t)^1.7 is steepest at t=0, so the die
     breaks the surface at 44 degrees and the far wall falls past the terminator
     no matter how broad the key is. A smoothstep rounds both the lip and the
     floor and caps the wall at 32 degrees, which is what a real steel die
     leaves in 600gsm stock. */
  float t = clamp(-d / K_SHOULDER, 0.0, 1.0);
  float wall = -K_DEPTH * t * t * (3.0 - 2.0 * t);
  /* The floor is not flat. A deboss die dishes very slightly toward the middle
     of every stroke, and those few degrees keep the floor reading as pressed
     stock rather than as a flat cut-out at a single value. */
  float dish = -K_DISH * smoothstep(0.0, -K_DISH_W, d);
  return (wall + dish) * uStrike;
}

float bite(vec2 sh){ return biteProfile(sdf(sh)) * uMarkW; }

float ggx(float NoH, float a){ float a2=a*a; float d=(NoH*a2-NoH)*NoH+1.0; return a2/(3.14159265*d*d+1e-7); }
float smithG(float NoV, float NoL, float a){
  float a2=a*a;
  float gv = NoL*sqrt(NoV*NoV*(1.0-a2)+a2);
  float gl = NoV*sqrt(NoL*NoL*(1.0-a2)+a2);
  return 0.5/max(gv+gl,1e-6);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 sh = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);

  float dMark = sdf(sh);

  /* substrate, pinned to device pixels so grain never crawls with DPR */
  float toothF = uResY / TOOTH_PERIOD_PX;
  float formF  = uResY / FORM_PERIOD_PX;
  vec3 nt = noised(sh * toothF);
  vec3 nf = noised(sh * formF);
  float biteMask = smoothstep(0.0, -K_SHOULDER, dMark);
  float tMul = mix(1.0, 0.25, biteMask);
  float fMul = mix(1.0, 0.50, biteMask);
  vec2 subGrad = vec2(nt.y * TOOTH_SLOPE * tMul + nf.y * FORM_SLOPE * fMul,
                      nt.z * TOOTH_SLOPE * tMul + nf.z * FORM_SLOPE * fMul);

  /* Normal: 4-tap on the bite, plus the analytic substrate gradient. Both
     terms must be dh/dx, not -dh/dx: for z = h(x,y) the normal is
     (-dh/dx, -dh/dy, 1), so a bite differenced backwards renders the recess
     as a raised tube with its shadow on the wrong side.

     The step must span at least one SDF texel. Bilinear interpolation has a
     piecewise-constant derivative inside a texel, so a one-device-pixel step
     across a magnified field quantises the gradient to the texel grid and
     combs every bevel. */
  float e = max(1.0 / uResY, uTexel * 0.80);
  float gx = (bite(sh + vec2(e,0.0)) - bite(sh - vec2(e,0.0))) / (2.0*e) + subGrad.x;
  float gy = (bite(sh + vec2(0.0,e)) - bite(sh - vec2(0.0,e))) / (2.0*e) + subGrad.y;
  vec3 N = normalize(vec3(-gx, -gy, 1.0));

  vec3 V = normalize(vec3(EYE.xy - sh, EYE.z));
  vec3 L = uLight;
  float NoLr = max(dot(N,L), 0.0);                          // true cosine
  float NoL = max((dot(N,L) + WRAP) / (1.0 + WRAP), 0.0);   // softbox wrap
  float NoV = max(dot(N,V), 1e-4);

  /* cast shadow: march the bite height field toward the light. Confined to
     the pixels near the mark, jittered so 8 steps read as grain not banding. */
  float shadow = 1.0;
  if (dMark < SHADOW_LEN) {
    float h0 = bite(sh);
    float tanE = L.z / max(length(L.xy), 1e-4);
    float jit = hash12(gl_FragCoord.xy);
    float occ = 0.0;
    for (int i = 0; i < 8; i++) {
      float t = (float(i) + jit) / 8.0 * SHADOW_LEN * uMarkW;
      float hs = bite(sh + L.xy * t);
      occ = max(occ, smoothstep(0.0, 0.0015 * uMarkW, hs - (h0 + t * tanE)));
    }
    shadow = 1.0 - occ;
  }

  /* Ambient occlusion, and only inside the recess. exp(-wall/AO_FALL) is 1
     wherever wall is 0, which is true across the whole flat sheet as well as
     at the foot of the wall, so without the inside mask this darkens the
     entire page by 0.4 and the deboss disappears into a grey field. */
  float wall = max(0.0, -dMark - K_SHOULDER);
  float inRecess = smoothstep(0.0, -K_SHOULDER * 0.5, dMark);
  float ao = 1.0 - AO_STRENGTH * exp(-wall / AO_FALL) * uStrike * inRecess;
  ao = max(ao, 0.40);

  /* strip-light specular via Karis' representative point */
  vec3 R = reflect(-V, N);
  float tOnStrip = clamp(dot(R - L * dot(R, L), uStripT) * STRIP_DIST, -STRIP_HALF, STRIP_HALF);
  vec3 Lp = normalize(L * STRIP_DIST + uStripT * tOnStrip);
  vec3 Hv = normalize(Lp + V);
  float NoHp = max(dot(N, Hv), 0.0);
  float NoLp = max(dot(N, Lp), 0.0);
  float widen = STRIP_HALF / (2.0 * STRIP_DIST);

  float vwin = smoothstep(0.0, VWIN, 0.5 - abs(sh.y));

  /* ---- paper: Oren-Nayar diffuse + a dielectric sheen ------------------ */
  /* Oren-Nayar's roughness term is geometric, so it takes the true cosine even
     though the lambert factor above it is wrapped. */
  float ON = ON_A + ON_B * max(0.0, dot(normalize(V - N*NoV), normalize(L - N*NoLr))) *
             sin(max(acos(NoLr), acos(NoV))) * tan(min(acos(NoLr), acos(NoV)));
  ON = ON_A + (ON - ON_A) * vwin;
  vec3 diff = PAPER * NoL * ON * shadow * ao;

  float aP = clamp(PAPER_A + widen, 0.0, 1.0);
  float engP = (PAPER_A * PAPER_A) / (aP * aP);
  float specP = ggx(NoHp, aP) * smithG(NoV, NoLp, aP) * NoLp * engP;
  float fres = PAPER_F0 + (1.0 - PAPER_F0) * pow(1.0 - NoV, 5.0);
  float sheen = SHEEN * pow(1.0 - NoV, 3.0) * SHEEN_R;
  vec3 paperCol = diff + (specP * fres + sheen * vwin) * SHEEN_COL * shadow;
  paperCol += PAPER * FILLK * FILL_TINT * (N.z * 0.5 + 0.5);

  vec3 c = paperCol * uExposure;

  /* highlight rolloff: identity below 1.0 so PAPER is never touched */
  float m = max(c.r, max(c.g, c.b));
  if (m > 1.0) c *= (1.0 + (m - 1.0) / (1.0 + (m - 1.0) * 0.6)) / m;

  c = mix(c * 12.92, 1.055 * pow(max(c, 0.0), vec3(1.0/2.4)) - 0.055, step(vec3(0.0031308), c));

  float r1 = hash12(gl_FragCoord.xy);
  float r2 = hash12(gl_FragCoord.xy + 17.3);
  c += (r1 + r2 - 1.0) / 255.0;

  outColor = vec4(c, 1.0);
}`;

export async function initHero3D(mount) {
  const hero = mount.closest('.hero') || mount.parentElement;
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__sheet';
  canvas.setAttribute('aria-hidden', 'true');
  mount.appendChild(canvas);

  const gl = canvas.getContext('webgl2', {
    alpha: false, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  if (!gl) { canvas.remove(); return; }

  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.debug('hero3d shader:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = (n) => gl.getUniformLocation(prog, n);
  const u = {
    res: U('uRes'), aspect: U('uAspect'), resY: U('uResY'), sdf: U('uSDF'),
    markC: U('uMarkC'), markBox: U('uMarkBox'), markW: U('uMarkW'),
    light: U('uLight'), stripT: U('uStripT'), exposure: U('uExposure'), strike: U('uStrike'),
    texel: U('uTexel'),
  };

  /* Yield to the event loop, not to the next frame. The field build is sliced
     into ~24 chunks; on rAF that is 24 x 16ms of pure waiting on top of the
     work. A macrotask hop lets pending input run between slices at no cost. */
  const yieldFrame = (() => {
    if (typeof scheduler !== 'undefined' && scheduler.yield) return () => scheduler.yield();
    const ch = new MessageChannel();
    return () => new Promise((r) => { ch.port1.onmessage = () => r(); ch.port2.postMessage(0); });
  })();
  let field;
  const t0 = performance.now();
  try {
    field = await buildMarkSDF(MARK, SDF_W, SDF_H, PAD, yieldFrame);
  } catch (err) {
    console.debug('hero3d sdf:', err);
    canvas.remove();
    return;
  }

  {
    let mn = 1e9, mx = -1e9;
    for (let i = 0; i < field.data.length; i++) { const v = field.data[i]; if (v < mn) mn = v; if (v > mx) mx = v; }
    console.debug('HERO3D sdf', JSON.stringify({ mn: +mn.toFixed(4), mx: +mx.toFixed(4), aspect: +field.aspect.toFixed(4), ms: Math.round(performance.now() - t0) }));
  }
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, field.w, field.h, 0, gl.RED, gl.FLOAT, field.data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u.sdf, 0);

  /* ---- layout: measured from the real DOM, never hardcoded ------------- */
  let W = 0, H = 0, dpr = 1;
  const layout = () => {
    const r = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Cap total pixels so a 4K display does not quadruple the fill cost.
    const px = W * H * dpr * dpr;
    const MAXPX = 2.6e6;
    if (px > MAXPX) dpr *= Math.sqrt(MAXPX / px);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const title = hero.querySelector('.hero__title');
    const meta = hero.querySelector('.hero__meta');
    const strip = hero.querySelector('.hero__strip');
    // Measure the GLYPHS, not the boxes. Both .line and .line__inner are
    // block-level here, so their rects span the whole column and report the
    // headline as touching the right edge of the hero, which collapses the
    // mark to zero width. A Range over the text contents gives the true ink
    // extent whatever the display type is.
    let titleRt = W * 0.55;
    if (title) {
      const range = document.createRange();
      let maxRight = 0;
      const els = title.querySelectorAll('.line__inner').length
        ? title.querySelectorAll('.line__inner')
        : title.querySelectorAll('.line');
      for (const el of els) {
        try {
          range.selectNodeContents(el);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0) maxRight = Math.max(maxRight, rect.right);
        } catch (e) { /* empty node */ }
      }
      if (maxRight > 0) titleRt = maxRight - r.left;
    }
    // The impression lives in the open band above the headline, right-aligned
    // to the margin the eyebrow and nav already use. Sharing a margin is what
    // makes it read as set on the page rather than dropped onto it.
    const mr = meta ? meta.getBoundingClientRect() : null;
    const metaBot = mr ? mr.bottom - r.top : H * 0.16;
    const metaRt = mr ? mr.right - r.left : W - 60;
    const titleTop = title ? title.getBoundingClientRect().top - r.top : H * 0.48;

    const bandTop = metaBot + 0.045 * H;
    const bandBot = titleTop - 0.030 * H;
    let markH = Math.max(48, (bandBot - bandTop) * BAND_FILL);
    let markW = markH * field.aspect;
    if (markW > MAX_W * W) { markW = MAX_W * W; markH = markW / field.aspect; }

    const cx = metaRt - markW * 0.5;
    const cy = (bandTop + bandBot) * 0.5;

    // DOM px -> sheet units (1.0 = hero height, y up, origin centre)
    const markWs = markW / H;
    const cxs = (cx / H) - (W / H) * 0.5;
    const cys = 0.5 - cy / H;

    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.aspect, W / H);
    gl.uniform1f(u.resY, canvas.height);
    gl.uniform2f(u.markC, cxs, cys);
    const boxW = markWs * (1 + 2 * PAD);
    gl.uniform2f(u.markBox, boxW, boxW / (field.w / field.h));
    gl.uniform1f(u.markW, markWs);
    gl.uniform1f(u.texel, boxW / field.w);
    console.debug('HERO3D layout', JSON.stringify({ W, H, titleRt: Math.round(titleRt), markW: Math.round(markW), markH: Math.round(markH), cx: Math.round(cx), cy: Math.round(cy), markWs: +markWs.toFixed(4), cxs: +cxs.toFixed(4), cys: +cys.toFixed(4) }));
  };

  /* ---- state ----------------------------------------------------------- */
  const state = { azim: AZIM_REST, elev: ELEV_REST, strike: 0 };
  const target = { azim: AZIM_REST, elev: ELEV_REST, strike: 1 };
  let raf = null, alive = true, pointerEntered = false;

  const writeLight = () => {
    const ce = Math.cos(state.elev), se = Math.sin(state.elev);
    const ca = Math.cos(state.azim), sa = Math.sin(state.azim);
    gl.uniform3f(u.light, ce * ca, ce * sa, se);
    gl.uniform3f(u.stripT, -sa, ca, 0);
    gl.uniform1f(u.exposure, 1 / (ON_A * ((se + WRAP) / (1 + WRAP)) + FILL));
    gl.uniform1f(u.strike, state.strike);
  };

  const draw = () => { writeLight(); gl.drawArrays(gl.TRIANGLES, 0, 3); };

  const frame = () => {
    raf = null;
    if (!alive) return;
    let moving = false;
    const eps = { azim: 0.0015, elev: 0.0006, strike: 0.0015 };
    for (const k of ['azim', 'elev', 'strike']) {
      const d = target[k] - state[k];
      if (Math.abs(d) > eps[k]) { state[k] += d * LERP; moving = true; }
      else state[k] = target[k];
    }
    draw();
    // Stop dead when settled: this site does not run idle loops.
    if (moving) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && alive) raf = requestAnimationFrame(frame); };

  layout();

  /* The strike is the arrival beat, or it never happens. A press that fires
     after the visitor has already engaged is just a random flash. */
  const now = performance.now();
  const visible = hero.getBoundingClientRect().top < window.innerHeight * 0.4;
  if (now < STRIKE_WINDOW && visible && !pointerEntered) {
    state.strike = 0;
    setTimeout(() => {
      const t0 = performance.now();
      const ease = (x) => 1 - Math.pow(1 - x, 3);
      const step = () => {
        if (!alive) return;
        const k = Math.min(1, (performance.now() - t0) / STRIKE_MS);
        state.strike = ease(k);
        draw();
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, Math.max(0, ENTRANCE_END - now));
    draw();
  } else {
    state.strike = 1; target.strike = 1;
    draw();
  }

  hero.addEventListener('pointermove', (e) => {
    pointerEntered = true;
    const r = hero.getBoundingClientRect();
    const p = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    const q = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    target.azim = AZIM_REST - p * AZIM_RANGE;
    target.elev = ELEV_MID - q * ELEV_SWING;
    kick();
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    target.azim = AZIM_REST; target.elev = ELEV_REST; kick();
  }, { passive: true });

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { layout(); draw(); }, 140);
  }, { passive: true });

  // Give the GPU back when the hero is off screen or the tab is hidden.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      alive = en.isIntersecting;
      if (alive) kick();
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0 }).observe(hero);
  }
}
