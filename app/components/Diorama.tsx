'use client';

import { useEffect, useRef } from 'react';
import { Era } from '../types';

type Vec3 = [number, number, number];
interface Palette { ground: Vec3; sky: Vec3; accent: Vec3; accent2: Vec3; corrupt: number }

const DIO: Record<Era, { ground: string; sky: string; accent: string; accent2: string; corrupt: number }> = {
  [Era.GOLDEN_AGE]: { ground: '#0a1018', sky: '#0b1a2e', accent: '#2ee6c8', accent2: '#f2b13a', corrupt: 0.0 },
  [Era.TURNING_POINT]: { ground: '#150a0a', sky: '#2a0e10', accent: '#ff5050', accent2: '#ffae42', corrupt: 0.28 },
  [Era.WASTELAND]: { ground: '#120d07', sky: '#2a1c0e', accent: '#dd7b2c', accent2: '#cdb07a', corrupt: 0.5 },
  [Era.GHOST_SIGNAL]: { ground: '#04070a', sky: '#06120c', accent: '#37f0a0', accent2: '#8a6bff', corrupt: 1.0 },
};

const h2v = (h: string): Vec3 => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const pal = (e: Era): Palette => {
  const d = DIO[e];
  return { ground: h2v(d.ground), sky: h2v(d.sky), accent: h2v(d.accent), accent2: h2v(d.accent2), corrupt: d.corrupt };
};

function bayer(n: number): number[][] {
  let m = [[0]], s = 1;
  while (s < n) {
    const ns = s * 2, nm: number[][] = Array.from({ length: ns }, () => new Array(ns).fill(0));
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const v = m[y][x] * 4;
      nm[y][x] = v; nm[y][x + s] = v + 2; nm[y + s][x] = v + 3; nm[y + s][x + s] = v + 1;
    }
    m = nm; s = ns;
  }
  return m;
}

const VS = `attribute vec2 p; varying vec2 vUv; void main(){ vUv=p*0.5+0.5; gl_Position=vec4(p,0.0,1.0); }`;

const FS = `precision highp float;
varying vec2 vUv;
uniform vec2 u_res; uniform float u_time, u_corrupt; uniform vec3 u_ground, u_accent, u_accent2, u_sky; uniform sampler2D u_bayer; uniform vec2 u_mouse;
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.)); return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float fbm(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.02; a*=0.5; } return s; }
float dab(){ return texture2D(u_bayer, gl_FragCoord.xy/8.0).r; }
vec3 quant(vec3 c, float lv){ float d=(dab()-0.5)/lv; return floor(c*lv+0.5+d)/lv; }
vec2 curve(vec2 uv){ uv=uv*2.0-1.0; vec2 o=abs(uv.yx)/vec2(5.0,4.0); uv=uv+uv*o*o; return uv*0.5+0.5; }
const float hor=0.44;
float tri(vec2 uv,float cx,float ey,float ew,float rh){ float dx=abs(uv.x-cx); float t=clamp((uv.y-ey)/rh,0.0,1.0); float w=ew*(1.0-t); float lip=(uv.y-ey)<rh*0.12?ew*1.10:w; return (uv.y>=ey&&uv.y<=ey+rh&&dx<=lip)?1.0:0.0; }
float pagoda(vec2 uv,float tx,float sc){ float s=0.0;
  if(uv.y>hor-0.10*sc&&uv.y<hor+0.11*sc&&abs(uv.x-tx)<0.020*sc) s=1.0;
  if(uv.y>hor-0.10*sc&&uv.y<hor-0.055*sc){ float w=mix(0.052,0.040,(uv.y-(hor-0.10*sc))/(0.045*sc))*sc; if(abs(uv.x-tx)<w)s=1.0; }
  s=max(s,tri(uv,tx,hor-0.010*sc,0.076*sc,0.050*sc)); s=max(s,tri(uv,tx,hor+0.042*sc,0.058*sc,0.044*sc)); s=max(s,tri(uv,tx,hor+0.088*sc,0.042*sc,0.038*sc)); return s; }
vec3 scene(vec2 uv){
  float t=clamp((uv.y-hor)/(1.0-hor),0.0,1.0);
  vec3 col=mix(u_accent*0.20+u_ground, u_sky, t);
  col+=u_accent*smoothstep(0.20,0.0,abs(uv.y-hor))*0.16;
  vec2 sp=vec2(0.27,hor+0.14); float sd=length((uv-sp)*vec2(1.0,1.3));
  col+=u_accent2*smoothstep(0.05,0.034,sd)*0.9; col+=u_accent2*smoothstep(0.15,0.0,sd)*0.32;
  vec2 g=floor(uv*vec2(140.0,90.0)); float st=step(0.988,hash(g))*step(hor+0.05,uv.y); st*=0.5+0.5*sin(u_time*3.0+hash(g)*40.0); col+=u_accent2*st*0.7;
  float mx=uv.x+u_mouse.x*0.02;
  float r1=hor+fbm(vec2(mx*2.4,0.0))*0.12-0.05; if(uv.y<r1) col=mix(col,u_ground*1.9+u_sky*0.2,0.6);
  float r2=hor+fbm(vec2(mx*4.0+9.0,0.0))*0.08-0.04; if(uv.y<r2) col=mix(col,u_ground*1.3,0.85);
  for(int i=0;i<2;i++){ float gx=i==0?0.13:0.88; if(pagoda(vec2(uv.x,uv.y+0.045),gx,0.5)>0.5) col=u_ground*0.75;
    float bd2=length(uv-vec2(gx,hor+0.03)); col+=u_accent*smoothstep(0.010,0.0,bd2)*(0.4+0.5*sin(u_time*2.5+float(i)*2.0)); }
  if(uv.y<hor-0.05){ col=u_ground; col+=u_accent*step(0.985,fract(uv.y*34.0))*0.045; col+=u_accent2*fbm(vec2(uv.x*28.0,uv.y*55.0))*0.03; }
  vec2 rp=vec2(0.46,hor-0.14); float rd=abs(length((uv-rp)*vec2(1.0,1.1))-0.022); if(uv.y<hor-0.105&&rd<0.0045&&uv.x<0.50) col+=u_accent2*0.55;
  if(pagoda(uv,0.68,1.0)>0.5) col=u_ground*0.30;
  if(abs(uv.x-0.68)<0.011&&uv.y>hor-0.095&&uv.y<hor-0.03) col+=u_accent*0.4;
  vec2 bp=vec2(0.68,hor+0.132); float bd=length(uv-bp); float pulse=0.6+0.4*sin(u_time*5.0)+0.1*fbm(vec2(u_time*3.0,0.0));
  col+=u_accent*smoothstep(0.020,0.0,bd)*(0.85+pulse); col+=u_accent*smoothstep(0.10,0.0,bd)*0.16*pulse;
  float haze=fbm(vec2(uv.x*4.0-u_time*0.22,uv.y*8.0))*smoothstep(hor,-0.1,uv.y); col=mix(col,col+u_ground*1.5+u_accent*0.04,haze*0.4);
  vec2 dgc=uv*vec2(60.0,40.0); dgc.x-=u_time*1.5; float mote=step(0.992,hash(floor(dgc)))*smoothstep(hor,0.0,uv.y); col+=u_accent*mote*0.45;
  return col;
}
void main(){
  vec2 cu=curve(vUv);
  if(cu.x<0.0||cu.x>1.0||cu.y<0.0||cu.y>1.0){ gl_FragColor=vec4(0.0,0.0,0.0,1.0); return; }
  vec2 px=vec2(230.0,130.0); vec2 puv=floor(cu*px)/px; vec2 d=cu-0.5; float ca=0.0020+0.0035*u_corrupt;
  vec3 col; col.r=scene(puv+d*ca).r; col.g=scene(puv).g; col.b=scene(puv-d*ca).b;
  col=quant(col,8.0);
  float l=dot(col,vec3(0.299,0.587,0.114)); col+=u_accent*pow(l,3.0)*0.20;
  col*=0.87+0.13*sin(cu.y*px.y*3.14159);
  float m=mod(gl_FragCoord.x,3.0); col*= m<1.0?vec3(1.05,0.97,0.97):(m<2.0?vec3(0.97,1.05,0.97):vec3(0.97,0.97,1.05));
  float band=step(0.86,fract(cu.y*1.5-u_time*0.35)); col*=1.0-0.18*u_corrupt*band;
  col+=(hash(gl_FragCoord.xy+u_time)-0.5)*(0.035+0.17*u_corrupt);
  col*=smoothstep(1.15,0.35,length((cu-0.5)*vec2(1.1,1.2)));
  col*=1.0+0.025*sin(u_time*9.0);
  gl_FragColor=vec4(col,1.0);
}`;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: Vec3, b: Vec3, k: number): Vec3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export function Diorama({ era }: { era: Era }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tgtRef = useRef<Palette>(pal(Era.GHOST_SIGNAL));

  // keep target palette in sync with era (lerped toward in the render loop)
  useEffect(() => { tgtRef.current = pal(era); }, [era]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'high-performance' });
    if (!gl) { canvas.style.background = '#0a1018'; return; }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!; gl.shaderSource(sh, src); gl.compileShader(sh); return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VS);
    const fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(fs)); return; }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const N = 8, mm = bayer(N), data = new Uint8Array(N * N * 4);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const v = ((mm[y][x] + 0.5) / (N * N)) * 255; const i = (y * N + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v; data[i + 3] = 255;
    }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_bayer'), 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const resize = () => {
      const sc = 0.7;
      canvas.width = Math.floor(window.innerWidth * sc);
      canvas.height = Math.floor(window.innerHeight * sc);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const cp = tgtRef.current;
    const cur: Palette = { ground: [...cp.ground] as Vec3, sky: [...cp.sky] as Vec3, accent: [...cp.accent] as Vec3, accent2: [...cp.accent2] as Vec3, corrupt: cp.corrupt };
    const mouse: [number, number] = [0, 0];
    const mtgt: [number, number] = [0, 0];
    const onMove = (e: MouseEvent) => { mtgt[0] = (e.clientX / window.innerWidth) * 2 - 1; mtgt[1] = (e.clientY / window.innerHeight) * 2 - 1; };
    window.addEventListener('mousemove', onMove);

    const t0 = performance.now();
    let raf = 0;
    const frame = () => {
      const tgt = tgtRef.current, k = 0.05;
      cur.ground = lerp3(cur.ground, tgt.ground, k); cur.sky = lerp3(cur.sky, tgt.sky, k);
      cur.accent = lerp3(cur.accent, tgt.accent, k); cur.accent2 = lerp3(cur.accent2, tgt.accent2, k);
      cur.corrupt = lerp(cur.corrupt, tgt.corrupt, k);
      mouse[0] = lerp(mouse[0], mtgt[0], 0.05); mouse[1] = lerp(mouse[1], mtgt[1], 0.05);
      gl.uniform2f(U('u_res'), canvas.width, canvas.height);
      gl.uniform1f(U('u_time'), (performance.now() - t0) / 1000);
      gl.uniform1f(U('u_corrupt'), cur.corrupt);
      gl.uniform3fv(U('u_ground'), cur.ground); gl.uniform3fv(U('u_sky'), cur.sky);
      gl.uniform3fv(U('u_accent'), cur.accent); gl.uniform3fv(U('u_accent2'), cur.accent2);
      gl.uniform2f(U('u_mouse'), mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="gl-canvas" aria-hidden="true" />;
}
