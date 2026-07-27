/**
 * THE MARK, IN GLASS — a raymarched 3D object in the hero.
 *
 * The eclipse rendered as an actual solid: two tori fused with a smooth
 * minimum, raymarched against a signed-distance field, shaded with a fresnel
 * rim, a soft key light and a violet-to-gold sheen. It turns toward the
 * pointer with real rotation, not a CSS tilt, so the highlight travels across
 * the surface the way it would on a physical object.
 *
 * Written as one fullscreen quad and about 60 lines of GLSL rather than a 3D
 * library: the whole thing is a few KB, there is no dependency to load, and it
 * draws only while it is moving. Silent at rest, like everything else here.
 * Falls back to nothing at all (the canvas simply stays empty and the hero is
 * unchanged) if WebGL is unavailable, on touch, or under reduced motion.
 */
const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision highp float;
uniform vec2 R;      // resolution
uniform vec2 M;      // pointer, -1..1
uniform float T;     // settle amount 0..1

// Smooth union: fuses the two rings where they meet instead of intersecting
// them, which is what makes it read as one cast object rather than two props.
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xy)-t.x,p.z);return length(q)-t.y;}

mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0,-s,0,1,0,s,0,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,-s,0,s,c);}

float map(vec3 p){
  p = rotX(M.y*.55) * rotY(M.x*.85 + 0.5) * p;
  // The mark: two rings on the same axis, offset and fused.
  float a = sdTorus(p - vec3(-0.30,0.,0.), vec2(0.62,0.115));
  float b = sdTorus(p - vec3( 0.30,0.,0.), vec2(0.62,0.115));
  return smin(a,b,0.16);
}

vec3 normal(vec3 p){
  vec2 e=vec2(.0012,0.);
  return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
}

void main(){
  vec2 uv=(gl_FragCoord.xy*2.-R)/R.y;
  vec3 ro=vec3(0.,0.,3.2);
  vec3 rd=normalize(vec3(uv,-1.9));

  float t=0.; float hit=0.;
  for(int i=0;i<70;i++){
    vec3 pos=ro+rd*t;
    float d=map(pos);
    if(d<.0015){hit=1.;break;}
    if(t>7.)break;
    t+=d*.85;
  }
  if(hit<.5){discard;}

  vec3 pos=ro+rd*t;
  vec3 n=normal(pos);
  vec3 v=normalize(ro-pos);

  // Studio lighting: one key from upper left, one cool fill from behind.
  vec3 key=normalize(vec3(-.6,.85,.55));
  float dif=clamp(dot(n,key),0.,1.);
  float spec=pow(clamp(dot(reflect(-key,n),v),0.,1.),46.);
  float fres=pow(1.-clamp(dot(n,v),0.,1.),2.6);

  vec3 ink=vec3(.086,.078,.059);
  vec3 violet=vec3(.506,.369,.980);
  vec3 gold=vec3(.788,.604,.173);
  vec3 paper=vec3(.953,.941,.914);

  // Material: ink body, violet where the light rakes it, gold in the rim.
  vec3 col=mix(ink, violet, dif*.72);
  col=mix(col, gold, fres*.55);
  col+=paper*spec*.9;
  col=mix(paper, col, .82 + .18*T);

  gl_FragColor=vec4(col, (.30+.62*T));
}`;

export function initHeroGlass({ reducedMotion } = {}) {
  const canvas = document.querySelector('.hero__glass');
  if (!canvas) return;
  if (reducedMotion) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) return; // no WebGL: the hero simply carries on without it

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uR = gl.getUniformLocation(prog, 'R');
  const uM = gl.getUniformLocation(prog, 'M');
  const uT = gl.getUniformLocation(prog, 'T');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const hero = canvas.closest('.hero');
  let W = 0, H = 0;
  const state = { x: 0, y: 0, t: 0 };
  const target = { x: 0, y: 0, t: 1 };
  let raf = null;

  const size = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75); // raymarching is fill-rate bound
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
  };

  const draw = () => {
    gl.uniform2f(uR, W, H);
    gl.uniform2f(uM, state.x, state.y);
    gl.uniform1f(uT, state.t);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const frame = () => {
    raf = null;
    let moving = false;
    for (const k of ['x', 'y', 't']) {
      const d = target[k] - state[k];
      if (Math.abs(d) > 0.0015) { state[k] += d * 0.075; moving = true; }
      else state[k] = target[k];
    }
    draw();
    if (moving) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  size();
  draw();
  kick(); // settle in once on load

  hero.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    target.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.6)));
    target.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.6)));
    kick();
  }, { passive: true });

  hero.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; kick(); }, { passive: true });

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { size(); draw(); }, 140);
  }, { passive: true });
}
