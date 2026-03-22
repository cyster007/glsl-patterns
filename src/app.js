import { VERTEX_SHADER, SHADERS } from './shaders.js';

// ── WebGL helpers ──────────────────────────────────────────────────────────────

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function link(gl, vert, frag) {
  const p = gl.createProgram();
  gl.attachShader(p, vert);
  gl.attachShader(p, frag);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p));
  return p;
}

function buildProgram(gl, fragSrc) {
  const v = compile(gl, gl.VERTEX_SHADER,   VERTEX_SHADER);
  const f = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  return link(gl, v, f);
}

// ── State ──────────────────────────────────────────────────────────────────────

const canvas   = document.getElementById('c');
const gl       = canvas.getContext('webgl');
const errorBox = document.getElementById('error');

let program   = null;
let startTime = performance.now();
let mouse     = [0, 0];
let current   = 0;

// Fullscreen quad
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1,  1, -1, -1,  1,
  -1,  1,  1, -1,  1,  1,
]), gl.STATIC_DRAW);

// ── Resize ─────────────────────────────────────────────────────────────────────

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

// ── Load shader ────────────────────────────────────────────────────────────────

function loadShader(index) {
  current = index;
  errorBox.textContent = '';
  errorBox.style.display = 'none';

  try {
    if (program) gl.deleteProgram(program);
    program = buildProgram(gl, SHADERS[index].source);
  } catch (e) {
    errorBox.textContent = e.message;
    errorBox.style.display = 'block';
    program = null;
    return;
  }

  // Update active pill
  document.querySelectorAll('.pill').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  // Update description
  document.getElementById('desc').textContent = SHADERS[index].description;

  startTime = performance.now();
}

// ── Render loop ────────────────────────────────────────────────────────────────

function render() {
  requestAnimationFrame(render);
  if (!program) return;

  gl.useProgram(program);

  const pos = gl.getAttribLocation(program, 'a_position');
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const time = (performance.now() - startTime) / 1000;
  gl.uniform1f(gl.getUniformLocation(program, 'u_time'),        time);
  gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'),  canvas.width, canvas.height);
  gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'),       mouse[0], mouse[1]);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// ── UI ─────────────────────────────────────────────────────────────────────────

const nav = document.getElementById('nav');

SHADERS.forEach((sh, i) => {
  const btn = document.createElement('button');
  btn.className   = 'pill';
  btn.textContent = sh.name;
  btn.onclick     = () => loadShader(i);
  nav.appendChild(btn);
});

canvas.addEventListener('mousemove', e => {
  mouse = [e.clientX, canvas.height - e.clientY];
});

// Keyboard: left/right arrows to cycle shaders
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') loadShader((current + 1) % SHADERS.length);
  if (e.key === 'ArrowLeft')  loadShader((current - 1 + SHADERS.length) % SHADERS.length);
});

// ── Boot ───────────────────────────────────────────────────────────────────────

loadShader(0);
render();
