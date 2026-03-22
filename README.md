# glsl-patterns

Five real-time GLSL fragment shaders running in WebGL. No build step — open `index.html` directly (or serve with any static server).

## Shaders

| # | Name | Technique |
|---|------|-----------|
| 1 | **Voronoi Crystal** | Animated cellular noise with glowing cell edges |
| 2 | **Julia Set** | Smooth-coloured Julia fractal with animated C parameter |
| 3 | **Plasma Waves** | 4-term sine wave interference in UV space |
| 4 | **Ray Marched Metaballs** | SDF ray marching — 4 orbiting blobs with smooth-min merge |
| 5 | **Truchet Tiles** | Procedural arc tiling with animated tile flipping |

## Uniforms (available in every shader)

| Uniform | Type | Description |
|---|---|---|
| `u_time` | `float` | Seconds since shader loaded |
| `u_resolution` | `vec2` | Canvas size in pixels |
| `u_mouse` | `vec2` | Mouse position in pixels (bottom-left origin) |

## Run locally

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080`.

> `← →` arrow keys also cycle through shaders.

## Adding a new shader

1. Open `src/shaders.js`
2. Push a new entry to the `SHADERS` array:

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
      // your code
      gl_FragColor = vec4(col, 1.0);
    }
  `
}
```

That's it — the UI picks it up automatically.
