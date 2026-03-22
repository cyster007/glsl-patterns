# glsl-patterns

Five real-time GLSL fragment shaders in WebGL. No build step — open `index.html` directly or serve with any static server.

## Shaders

| # | Name | Technique |
|---|------|-----------|
| 1 | Voronoi Crystal | Animated cellular noise with glowing edges |
| 2 | Julia Set | Smooth-coloured Julia fractal, animated C |
| 3 | Plasma Waves | 4-term sine wave interference |
| 4 | Ray Marched Metaballs | SDF ray marching, 4 orbiting blobs |
| 5 | Truchet Tiles | Procedural arc tiling, animated flipping |

`← →` to cycle shaders.

## Uniforms

| Uniform | Type | Description |
|---|---|---|
| `u_time` | `float` | Seconds since load |
| `u_resolution` | `vec2` | Canvas size in pixels |
| `u_mouse` | `vec2` | Mouse position (bottom-left origin) |

## Adding a shader

Push a new entry to `SHADERS` in `src/shaders.js` — the UI picks it up automatically.

```js
{
  name: "My Shader",
  description: "what it does",
  source: `
    precision highp float;
    uniform vec2  u_resolution;
    uniform float u_time;
    uniform vec2  u_mouse;

    void main() {
      gl_FragColor = vec4(col, 1.0);
    }
  `
}
```
