export const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const SHADERS = [
  {
    name: "Voronoi Crystal",
    description: "Animated cellular noise with glowing edges",
    source: `
      precision highp float;
      uniform vec2  u_resolution;
      uniform float u_time;
      uniform vec2  u_mouse;

      vec2 hash2(vec2 p) {
        return fract(sin(vec2(
          dot(p, vec2(127.1, 311.7)),
          dot(p, vec2(269.5, 183.3))
        )) * 43758.5453);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
        uv *= 5.0;

        vec2 i_uv = floor(uv);
        vec2 f_uv = fract(uv);

        float minD  = 9.0;
        float minD2 = 9.0;
        vec2  cell  = vec2(0.0);

        for (int y = -2; y <= 2; y++) {
          for (int x = -2; x <= 2; x++) {
            vec2 nb  = vec2(float(x), float(y));
            vec2 pt  = hash2(i_uv + nb);
            pt = 0.5 + 0.5 * sin(u_time * 0.7 + 6.2831 * pt);
            float d  = length(nb + pt - f_uv);
            if (d < minD) { minD2 = minD; minD = d; cell = i_uv + nb; }
            else if (d < minD2) { minD2 = d; }
          }
        }

        float edge  = minD2 - minD;
        float glow  = 1.0 - smoothstep(0.0, 0.08, edge);
        vec2  h     = hash2(cell);
        vec3  col   = 0.5 + 0.5 * cos(u_time * 0.3 + vec3(h.x * 6.28, h.y * 6.28, (h.x + h.y) * 3.14) + vec3(0.0, 2.1, 4.2));
        col = mix(col * 0.3, vec3(1.0, 0.95, 0.8), glow * glow);

        gl_FragColor = vec4(col, 1.0);
      }
    `
  },

  {
    name: "Julia Set",
    description: "Animated Julia fractal with smooth colouring",
    source: `
      precision highp float;
      uniform vec2  u_resolution;
      uniform float u_time;
      uniform vec2  u_mouse;

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
        uv *= 1.5;

        float t  = u_time * 0.15;
        vec2  c  = vec2(0.355 + 0.355 * cos(t), 0.355 * sin(t));

        vec2  z  = uv;
        float i  = 0.0;
        const float MAX = 128.0;

        for (float n = 0.0; n < MAX; n++) {
          if (dot(z, z) > 4.0) break;
          z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
          i = n;
        }

        float smooth_i = i - log2(log2(dot(z, z))) + 4.0;
        float norm = smooth_i / MAX;

        vec3 col = 0.5 + 0.5 * cos(3.0 + norm * 15.0 + vec3(0.0, 0.6, 1.0));
        col = mix(vec3(0.0), col, smoothstep(0.0, 0.02, norm));

        gl_FragColor = vec4(col, 1.0);
      }
    `
  },

  {
    name: "Plasma Waves",
    description: "Interference of sine waves in UV space",
    source: `
      precision highp float;
      uniform vec2  u_resolution;
      uniform float u_time;
      uniform vec2  u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.6;

        float v = 0.0;
        v += sin(uv.x * 10.0 + t);
        v += sin(uv.y * 10.0 + t * 1.3);
        v += sin((uv.x + uv.y) * 7.0 + t * 0.9);

        float cx = uv.x + 0.5 * sin(t * 0.5);
        float cy = uv.y + 0.5 * cos(t * 0.4);
        v += sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + t);

        v = v * 0.25;

        float r = 0.5 + 0.5 * sin(v * 3.14159 + 0.0);
        float g = 0.5 + 0.5 * sin(v * 3.14159 + 2.094);
        float b = 0.5 + 0.5 * sin(v * 3.14159 + 4.189);

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `
  },

  {
    name: "Ray Marched Metaballs",
    description: "SDF ray marching — 4 orbiting metaballs",
    source: `
      precision highp float;
      uniform vec2  u_resolution;
      uniform float u_time;
      uniform vec2  u_mouse;

      float sdSphere(vec3 p, float r) { return length(p) - r; }

      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      float scene(vec3 p) {
        float t = u_time * 0.8;
        vec3 b1 = vec3(sin(t)       * 0.8, cos(t * 1.3) * 0.5, 0.0);
        vec3 b2 = vec3(cos(t * 0.7) * 0.8, sin(t * 0.9) * 0.5, sin(t * 0.5) * 0.3);
        vec3 b3 = vec3(sin(t * 1.2) * 0.6, cos(t * 0.6) * 0.8, cos(t * 1.1) * 0.4);
        vec3 b4 = vec3(cos(t * 1.5) * 0.5, sin(t * 1.4) * 0.4, sin(t * 0.8) * 0.6);

        float d = sdSphere(p - b1, 0.35);
        d = smin(d, sdSphere(p - b2, 0.3),  0.4);
        d = smin(d, sdSphere(p - b3, 0.28), 0.4);
        d = smin(d, sdSphere(p - b4, 0.25), 0.4);
        return d;
      }

      vec3 normal(vec3 p) {
        float e = 0.001;
        return normalize(vec3(
          scene(p + vec3(e,0,0)) - scene(p - vec3(e,0,0)),
          scene(p + vec3(0,e,0)) - scene(p - vec3(0,e,0)),
          scene(p + vec3(0,0,e)) - scene(p - vec3(0,0,e))
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);

        vec3 ro = vec3(0.0, 0.0, 3.0);
        vec3 rd = normalize(vec3(uv, -1.5));

        float t = 0.0;
        vec3  col = vec3(0.04, 0.04, 0.1);

        for (int i = 0; i < 80; i++) {
          vec3  p = ro + rd * t;
          float d = scene(p);
          if (d < 0.001) {
            vec3  n   = normal(p);
            vec3  lig = normalize(vec3(1.0, 2.0, 2.0));
            float diff = clamp(dot(n, lig), 0.0, 1.0);
            float spec = pow(clamp(dot(reflect(-lig, n), -rd), 0.0, 1.0), 32.0);
            float ao = clamp(0.5 + 0.5 * n.y, 0.0, 1.0);

            vec3 base = 0.5 + 0.5 * cos(u_time * 0.4 + n * 2.0 + vec3(0.0, 2.1, 4.2));
            col  = base * diff * ao + spec * 0.6 + base * 0.08;
            break;
          }
          t += d;
          if (t > 6.0) break;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `
  },

  {
    name: "Truchet Tiles",
    description: "Animated procedural arc tiling",
    source: `
      precision highp float;
      uniform vec2  u_resolution;
      uniform float u_time;
      uniform vec2  u_mouse;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float arc(vec2 uv, vec2 c, float r, float w) {
        float d = abs(length(uv - c) - r);
        return smoothstep(w, 0.0, d);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / min(u_resolution.x, u_resolution.y);
        uv *= 7.0;

        vec2 tile = floor(uv);
        vec2 local = fract(uv);

        float flip = step(0.5, hash(tile + floor(u_time * 0.4)));

        float w = 0.06;
        float r = 0.5;
        float mask = 0.0;

        if (flip < 0.5) {
          mask += arc(local, vec2(0.0, 0.0), r, w);
          mask += arc(local, vec2(1.0, 1.0), r, w);
        } else {
          mask += arc(local, vec2(1.0, 0.0), r, w);
          mask += arc(local, vec2(0.0, 1.0), r, w);
        }

        mask = clamp(mask, 0.0, 1.0);

        float hue  = hash(tile) + u_time * 0.05;
        vec3  col  = 0.5 + 0.5 * cos(hue * 6.28318 + vec3(0.0, 2.094, 4.189));
        vec3  bg   = mix(vec3(0.05), vec3(0.12, 0.1, 0.18), hash(tile * 3.7));

        gl_FragColor = vec4(mix(bg, col, mask), 1.0);
      }
    `
  }
  ,

  // ── Video shaders (require u_video + u_prev textures) ──────────────────────

  {
    name: "Video Edges",
    description: "Parallax depth from luminance · Sobel edge detection · motion map",
    video: true,
    source: `
      precision highp float;
      uniform sampler2D u_video;
      uniform sampler2D u_prev;
      uniform vec2  u_resolution;
      uniform vec2  u_video_resolution;
      uniform float u_time;
      uniform vec2  u_mouse;

      float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

      float sobel(vec2 uv) {
        vec2 px = 1.0 / max(u_video_resolution, vec2(1.0));
        float tl = luma(texture2D(u_video, uv + px * vec2(-1.0, 1.0)).rgb);
        float tc = luma(texture2D(u_video, uv + px * vec2( 0.0, 1.0)).rgb);
        float tr = luma(texture2D(u_video, uv + px * vec2( 1.0, 1.0)).rgb);
        float ml = luma(texture2D(u_video, uv + px * vec2(-1.0, 0.0)).rgb);
        float mr = luma(texture2D(u_video, uv + px * vec2( 1.0, 0.0)).rgb);
        float bl = luma(texture2D(u_video, uv + px * vec2(-1.0,-1.0)).rgb);
        float bc = luma(texture2D(u_video, uv + px * vec2( 0.0,-1.0)).rgb);
        float br = luma(texture2D(u_video, uv + px * vec2( 1.0,-1.0)).rgb);
        float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
        float gy =  tl + 2.0*tc + tr - bl - 2.0*bc - br;
        return sqrt(gx*gx + gy*gy);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        uv.y = 1.0 - uv.y;

        // Parallax: mouse view angle + luminance depth
        vec2 view  = (u_mouse / u_resolution - 0.5) * 0.06;
        float dep  = luma(texture2D(u_video, uv).rgb);
        vec2  pUV  = clamp(uv + view * dep * 4.0, 0.001, 0.999);

        vec3  vid  = texture2D(u_video, pUV).rgb;
        float edge = smoothstep(0.08, 0.5, sobel(pUV));
        float mot  = smoothstep(0.04, 0.5, length(vid - texture2D(u_prev, pUV).rgb) * 5.0);

        vec3 col = vid;
        col += vec3(0.0, 0.75, 1.0) * edge * 0.85;
        col += vec3(1.0, 0.38, 0.0) * mot  * 1.1;
        gl_FragColor = vec4(clamp(col, 0.0, 1.5), 1.0);
      }
    `
  },

  {
    name: "Video Sphere Path",
    description: "Video mapped onto 3D sphere · 100×100 wire grid (10 000 nodes) · edge+motion glow · mouse to orbit",
    video: true,
    source: `
      precision highp float;
      uniform sampler2D u_video;
      uniform sampler2D u_prev;
      uniform vec2  u_resolution;
      uniform vec2  u_video_resolution;
      uniform float u_time;
      uniform vec2  u_mouse;

      const float PI = 3.14159265359;

      float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

      float sobel(vec2 uv) {
        vec2 px = 1.0 / max(u_video_resolution, vec2(1.0));
        float tl = luma(texture2D(u_video, uv + px * vec2(-1.0, 1.0)).rgb);
        float tc = luma(texture2D(u_video, uv + px * vec2( 0.0, 1.0)).rgb);
        float tr = luma(texture2D(u_video, uv + px * vec2( 1.0, 1.0)).rgb);
        float ml = luma(texture2D(u_video, uv + px * vec2(-1.0, 0.0)).rgb);
        float mr = luma(texture2D(u_video, uv + px * vec2( 1.0, 0.0)).rgb);
        float bl = luma(texture2D(u_video, uv + px * vec2(-1.0,-1.0)).rgb);
        float bc = luma(texture2D(u_video, uv + px * vec2( 0.0,-1.0)).rgb);
        float br = luma(texture2D(u_video, uv + px * vec2( 1.0,-1.0)).rgb);
        float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
        float gy =  tl + 2.0*tc + tr - bl - 2.0*bc - br;
        return sqrt(gx*gx + gy*gy);
      }

      // Ray vs unit sphere at origin
      float hitSphere(vec3 ro, vec3 rd) {
        float b = dot(ro, rd);
        float c = dot(ro, ro) - 1.0;
        float h = b*b - c;
        if (h < 0.0) return -1.0;
        return -b - sqrt(h);
      }

      // 3D point on unit sphere → equirectangular UV
      vec2 sphereUV(vec3 p) {
        return vec2(
          atan(p.z, p.x) * (1.0 / (2.0 * PI)) + 0.5,
          acos(clamp(p.y, -1.0, 1.0)) * (1.0 / PI)
        );
      }

      // Column-major rotation matrices (GLSL ES 1.0)
      mat3 rotY(float a) {
        float c = cos(a), s = sin(a);
        return mat3(c, 0.0, -s,   0.0, 1.0, 0.0,   s, 0.0, c);
      }
      mat3 rotX(float a) {
        float c = cos(a), s = sin(a);
        return mat3(1.0, 0.0, 0.0,   0.0, c, s,   0.0, -s, c);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);

        // Camera fixed; sphere texture spins via inverse rotation on hit point
        vec3 ro = vec3(0.0, 0.0, 2.5);
        vec3 rd = normalize(vec3(uv, -1.8));

        float ay = u_time * 0.2 + (u_mouse.x / u_resolution.x - 0.5) * 6.28318;
        float ax = (u_mouse.y / u_resolution.y - 0.5) * 2.5;
        // Inverse of (rotY(ay)*rotX(ax)) = rotX(-ax)*rotY(-ay)
        mat3 spin = rotX(-ax) * rotY(-ay);

        float t   = hitSphere(ro, rd);
        vec3  col = vec3(0.0);

        if (t > 0.0) {
          vec3 p   = ro + rd * t;
          vec3 n   = normalize(p);
          vec2 sUV = sphereUV(spin * p);   // rotated UV → spinning texture

          vec3 vid  = texture2D(u_video, sUV).rgb;
          vec3 prev = texture2D(u_prev,  sUV).rgb;

          float edge = smoothstep(0.06, 0.5,  sobel(sUV));
          float mot  = smoothstep(0.04, 0.5,  length(vid - prev) * 5.0);

          // 100 × 100 grid = 10 000 intersection nodes
          // Scan-order path: each node connects right + down → continuous wire mesh
          const float N = 100.0;
          vec2  g  = fract(sUV * N);
          float hw = 0.025 + edge * 0.07 + mot * 0.10;   // thickens at active areas
          float lx = 1.0 - smoothstep(0.0, hw, min(g.x, 1.0 - g.x));
          float ly = 1.0 - smoothstep(0.0, hw, min(g.y, 1.0 - g.y));
          float wire = max(lx, ly);

          // Wire colour: blue-white → cyan (edges) → orange (motion)
          vec3 wc = vec3(0.25, 0.55, 1.0);
          wc = mix(wc, vec3(0.0, 1.0, 0.85), edge);
          wc = mix(wc, vec3(1.0, 0.45, 0.05), mot);
          wc *= 1.0 + edge * 2.5 + mot * 4.0;   // HDR glow

          float diff = clamp(dot(n, normalize(vec3(1.5, 1.0, 2.0))), 0.0, 1.0) * 0.6 + 0.2;
          col  = vid * 0.12 * diff;      // dim video on sphere surface
          col += wc * wire;              // wire grid

          // Atmospheric rim
          float rim = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 4.0);
          col += vec3(0.05, 0.15, 0.55) * rim * 0.6;
        }

        // Background stars
        float star = fract(sin(dot(floor(gl_FragCoord.xy / 2.5), vec2(127.1, 311.7))) * 43758.5453);
        col += smoothstep(0.985, 1.0, star) * 0.5;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }
];
