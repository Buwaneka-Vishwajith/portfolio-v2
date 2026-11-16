import { useEffect, useRef } from 'react';

import './LensImage.css';

/**
 * LensImage: the React Bits ShapeBlur lens, applied to a photo instead of a drawn shape.
 * A soft lens follows the pointer (and drifts on its own when the pointer is away);
 * inside it the photo goes out of focus with a little colour fringing.
 * The canvas stays transparent until the photo loads, so put the real <img> underneath.
 *
 * Props: src (same-origin URL), blur (px), lensSize (0–2, of the shorter side),
 * lensSoftness (0–1), focus (invert: blurred everywhere except the lens),
 * chroma (0–1), idle (drift when the pointer is away), className, style.
 */

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// Draws the photo into the pyramid's base level, cropped like object-fit: cover.
const COVER = `#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform vec2 uSize;
uniform vec2 uScale;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  outColor = vec4(texture(uImage, (uv - 0.5) * uScale + 0.5).rgb, 1.0);
}`;

const BLUR = `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform float uLod;
uniform vec2 uStep;
uniform vec2 uScale;
out vec4 outColor;
void main() {
  vec2 size = vec2(textureSize(uSource, int(uLod)));
  vec2 center = gl_FragCoord.xy * uScale;
  vec4 sum = textureLod(uSource, center / size, uLod) * 6.0;
  sum += textureLod(uSource, (center - uStep) / size, uLod) * 4.0;
  sum += textureLod(uSource, (center + uStep) / size, uLod) * 4.0;
  sum += textureLod(uSource, (center - 2.0 * uStep) / size, uLod);
  sum += textureLod(uSource, (center + 2.0 * uStep) / size, uLod);
  outColor = sum / 16.0;
}`;

const COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D uPyramid;
uniform float uMaxLod;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uBlur;
uniform vec3 uLens;
uniform vec2 uLensShape;
uniform float uFocus;
uniform float uChroma;
out vec4 outColor;

vec4 bspline(vec2 uv, float lod) {
  vec2 size = vec2(textureSize(uPyramid, int(lod)));
  vec2 st = uv * size - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 p0 = (i - 0.5 + w1 / g0) / size;
  vec2 p1 = (i + 1.5 + w3 / g1) / size;
  vec4 a = textureLod(uPyramid, p0, lod);
  vec4 b = textureLod(uPyramid, vec2(p1.x, p0.y), lod);
  vec4 c = textureLod(uPyramid, vec2(p0.x, p1.y), lod);
  vec4 d = textureLod(uPyramid, p1, lod);
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);
}

vec4 blurred(vec2 uv, float sigma) {
  if (sigma <= 0.6) return textureLod(uPyramid, uv, 0.0);
  float lod = sigma < 1.7 ? (sigma - 0.6) / 1.1 : log2(sigma / 0.866);
  lod = clamp(lod, 0.0, uMaxLod);
  float base = floor(lod);
  float t = lod - base;
  vec4 a = base < 0.5 ? textureLod(uPyramid, uv, 0.0) : bspline(uv, base);
  if (t < 0.001) return a;
  return mix(a, bspline(uv, min(base + 1.0, uMaxLod)), t);
}

void main() {
  vec2 texel = 1.0 / vec2(textureSize(uPyramid, 0));
  vec2 uv = gl_FragCoord.xy * texel;
  vec2 p = gl_FragCoord.xy / uDpr - 0.5 * uResolution;
  vec2 toLens = p - uLens.xy;
  float lensDistance = length(toLens);
  float lens = uLens.z * (1.0 - smoothstep(uLensShape.x * (1.0 - uLensShape.y), uLensShape.x, lensDistance));
  float amount = mix(lens, 1.0 - lens, uFocus);
  float sigma = uBlur * amount * uDpr;
  vec2 dir = lensDistance > 0.001 ? toLens / lensDistance : vec2(0.0);
  vec2 split = dir * uChroma * 0.3 * sigma * texel;
  vec3 color = vec3(
    blurred(uv - split, sigma * (1.0 + uChroma * 0.25)).r,
    blurred(uv, sigma).g,
    blurred(uv + split, sigma * (1.0 - uChroma * 0.2)).b
  );
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  outColor = vec4(clamp(color + grain / 255.0, 0.0, 1.0), 1.0);
}`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = (gl, vertex, source) => {
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);
  const program = gl.createProgram();
  if (!fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
};

const locate = (gl, program, names) => {
  const map = {};
  for (const name of names) map[name] = gl.getUniformLocation(program, name);
  return map;
};

const LensImage = ({
  src,
  blur = 16,
  lensSize = 0.3,
  lensSoftness = 0.7,
  focus = false,
  chroma = 0.3,
  idle = true,
  className = '',
  style
}) => {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const controlRef = useRef(null);
  const settingsRef = useRef(null);
  settingsRef.current = {
    blur: Math.max(0, blur),
    lensSize: clamp(lensSize, 0.02, 2),
    lensSoftness: clamp(lensSoftness, 0, 1),
    focus,
    chroma: clamp(chroma, 0, 1),
    idle
  };

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!root || !canvas || !gl) return undefined;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    if (!vertex) return undefined;
    const coverProgram = link(gl, vertex, COVER);
    const blurProgram = link(gl, vertex, BLUR);
    const compositeProgram = link(gl, vertex, COMPOSITE);
    if (!coverProgram || !blurProgram || !compositeProgram) return undefined;

    const coverUniforms = locate(gl, coverProgram, ['uImage', 'uSize', 'uScale']);
    const blurUniforms = locate(gl, blurProgram, ['uSource', 'uLod', 'uStep', 'uScale']);
    const compositeUniforms = locate(gl, compositeProgram, [
      'uPyramid',
      'uMaxLod',
      'uResolution',
      'uDpr',
      'uBlur',
      'uLens',
      'uLensShape',
      'uFocus',
      'uChroma'
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const framebuffer = gl.createFramebuffer();
    const imageTexture = gl.createTexture();

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const pointer = { x: 0, y: 0, active: false };
    const lens = { x: 0, y: 0, power: 0, placed: false };
    const pyramid = { texture: null, temps: [], sizes: [], levels: 0, key: '' };
    const state = { width: 1, height: 1, dpr: 1, time: 0, image: null, request: 0 };
    let raf = 0;
    let last = 0;
    let visible = true;
    let alive = true;

    const allocate = () => {
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);
      pyramid.temps.forEach(texture => texture && gl.deleteTexture(texture));
      const width = canvas.width;
      const height = canvas.height;
      pyramid.levels = Math.min(10, Math.floor(Math.log2(Math.max(width, height))) + 1);
      pyramid.sizes = [];
      for (let k = 0; k < pyramid.levels; k++) {
        pyramid.sizes.push([Math.max(1, width >> k), Math.max(1, height >> k)]);
      }
      const configure = () => {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      };
      pyramid.texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);
      gl.texStorage2D(gl.TEXTURE_2D, pyramid.levels, gl.RGBA8, width, height);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      configure();
      pyramid.temps = [null];
      for (let k = 1; k < pyramid.levels; k++) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        configure();
        pyramid.temps.push(texture);
      }
      pyramid.key = '';
    };

    // Rebuilds the blur pyramid only when the size or the photo changes.
    const buildPyramid = () => {
      const image = state.image;
      const key = [canvas.width, canvas.height, state.request].join('|');
      if (key === pyramid.key) return;
      pyramid.key = key;

      const ratio = canvas.width / canvas.height / (image.naturalWidth / image.naturalHeight);
      const scale = ratio > 1 ? [1, 1 / ratio] : [ratio, 1];

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, 0);
      gl.viewport(0, 0, pyramid.sizes[0][0], pyramid.sizes[0][1]);
      gl.useProgram(coverProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(coverUniforms.uImage, 0);
      gl.uniform2f(coverUniforms.uSize, pyramid.sizes[0][0], pyramid.sizes[0][1]);
      gl.uniform2f(coverUniforms.uScale, scale[0], scale[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.useProgram(blurProgram);
      gl.uniform1i(blurUniforms.uSource, 0);
      for (let k = 1; k < pyramid.levels; k++) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.temps[k], 0);
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k - 1][1]);
        gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);
        gl.uniform1f(blurUniforms.uLod, k - 1);
        gl.uniform2f(blurUniforms.uStep, 1, 0);
        gl.uniform2f(blurUniforms.uScale, 2, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pyramid.texture, k);
        gl.viewport(0, 0, pyramid.sizes[k][0], pyramid.sizes[k][1]);
        gl.bindTexture(gl.TEXTURE_2D, pyramid.temps[k]);
        gl.uniform1f(blurUniforms.uLod, 0);
        gl.uniform2f(blurUniforms.uStep, 0, 1);
        gl.uniform2f(blurUniforms.uScale, 1, 2);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const render = () => {
      if (!pyramid.texture) return;
      gl.bindVertexArray(vao);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!state.image) return; // transparent until the photo is ready
      const s = settingsRef.current;
      buildPyramid();

      const { width, height } = state;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(compositeProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pyramid.texture);
      gl.uniform1i(compositeUniforms.uPyramid, 0);
      gl.uniform1f(compositeUniforms.uMaxLod, pyramid.levels - 1);
      gl.uniform2f(compositeUniforms.uResolution, width, height);
      gl.uniform1f(compositeUniforms.uDpr, state.dpr);
      gl.uniform1f(compositeUniforms.uBlur, s.blur);
      gl.uniform3f(compositeUniforms.uLens, lens.x, lens.y, lens.power);
      gl.uniform2f(compositeUniforms.uLensShape, s.lensSize * Math.min(width, height), s.lensSoftness);
      gl.uniform1f(compositeUniforms.uFocus, s.focus ? 1 : 0);
      gl.uniform1f(compositeUniforms.uChroma, s.chroma);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Same drift path as ShapeBlur's rectangle.
    const wander = t => {
      const reachX = state.width / 2;
      const reachY = state.height / 2;
      return [
        reachX * (0.75 * Math.sin(t * 0.37) + 0.2 * Math.sin(t * 1.13 + 1.7)),
        reachY * (0.7 * Math.sin(t * 0.53 + 0.9) + 0.2 * Math.cos(t * 0.91 + 0.4))
      ];
    };

    const frame = now => {
      raf = 0;
      if (!alive || !visible) return;
      const s = settingsRef.current;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      state.time += dt;

      const drifting = !pointer.active && s.idle && !reduce;
      let targetX = lens.x;
      let targetY = lens.y;
      let targetPower = 0;
      if (pointer.active) {
        targetX = pointer.x;
        targetY = pointer.y;
        targetPower = 1;
      } else if (drifting) {
        [targetX, targetY] = wander(state.time);
        targetPower = 0.85;
      }
      if (!lens.placed) {
        lens.x = targetX;
        lens.y = targetY;
        lens.placed = true;
      }
      const follow = 1 - Math.exp(-dt * (pointer.active ? 10 : 3));
      lens.x += (targetX - lens.x) * follow;
      lens.y += (targetY - lens.y) * follow;
      lens.power += (targetPower - lens.power) * (1 - Math.exp(-dt * 4));

      render();

      const settled =
        Math.abs(targetX - lens.x) < 0.1 &&
        Math.abs(targetY - lens.y) < 0.1 &&
        Math.abs(targetPower - lens.power) < 0.002;
      if (!settled || drifting) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (raf || !alive || !visible) return;
      raf = requestAnimationFrame(frame);
    };

    const load = value => {
      const request = ++state.request;
      state.image = null;
      wake();
      if (!value) return;
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        if (!alive || request !== state.request) return;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        state.image = image;
        pyramid.key = '';
        wake();
      };
      image.src = value;
    };

    const onPointerMove = event => {
      const rect = root.getBoundingClientRect();
      const margin = settingsRef.current.lensSize * Math.min(rect.width, rect.height);
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.active = x > -margin && y > -margin && x < rect.width + margin && y < rect.height + margin;
      pointer.x = x - rect.width / 2;
      pointer.y = rect.height / 2 - y;
      wake();
    };

    const onPointerLeave = () => {
      pointer.active = false;
      wake();
    };

    const resize = () => {
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.width = Math.max(1, root.clientWidth);
      state.height = Math.max(1, root.clientHeight);
      canvas.width = Math.round(state.width * state.dpr);
      canvas.height = Math.round(state.height * state.dpr);
      allocate();
      render();
      wake();
    };

    controlRef.current = { load, wake };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    const visibility = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      }
    });
    visibility.observe(root);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    resize();
    load(src || '');

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      controlRef.current = null;
      resizeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      if (pyramid.texture) gl.deleteTexture(pyramid.texture);
      pyramid.temps.forEach(texture => texture && gl.deleteTexture(texture));
      gl.deleteTexture(imageTexture);
      gl.deleteFramebuffer(framebuffer);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(coverProgram);
      gl.deleteProgram(blurProgram);
      gl.deleteProgram(compositeProgram);
      gl.deleteShader(vertex);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstSrc = useRef(true);
  useEffect(() => {
    if (firstSrc.current) {
      firstSrc.current = false;
      return;
    }
    controlRef.current?.load(src || '');
  }, [src]);

  useEffect(() => {
    controlRef.current?.wake();
  });

  return (
    <div ref={rootRef} className={`lens-image${className ? ` ${className}` : ''}`} style={style}>
      <canvas ref={canvasRef} className="lens-image__canvas" aria-hidden="true" />
    </div>
  );
};

export default LensImage;
