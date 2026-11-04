---
name: "frame-sequence-mouse-follow"
description: "Turns a short video into a transparent-background frame sequence and a single-page site where the sprite follows the mouse with spring physics. Invoke when the user wants to 抽帧/制作随鼠标跟随的网页 or build an image-sequence interactive from a video."
---

# Frame Sequence → Mouse-Follow Web

Convert a short video into a per-frame image sequence with a clean transparent
background, then ship a single-page site where the sprite follows the cursor.
The whole pipeline uses open-source tooling only: `ffmpeg`, Python
(`numpy` / `scipy` / `Pillow`), and dependency-free vanilla JS.

## 0. Inspect the source

```bash
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 input.webm
```

Many source containers (e.g. VP9 `.webm`) are not reliably decodable by every
browser, and frame-accurate control is hard with `<video>`. Always extract
frames and drive a canvas instead.

## 1. Extract frames + matte + encode

Use the bundled [`tools/extract_frames.py`](../tools/extract_frames.py):

```bash
python3 tools/extract_frames.py input.mp4 --fps 24 --width 512 --quality 82
```

Non-obvious decisions that matter:

- **Matte by flood fill from the border — never by globally removing white.**
  Cartoon characters are often white-filled (face, paws). A global
  `-transparent white` / colour-key punches holes straight through the
  character. Instead label near-white pixels, keep only the connected
  components that touch the image border, and set those to alpha 0.
- **Feather the boundary.** The 1–2 px ring around the outside region is
  anti-aliased, so it is neither pure white nor dark. Set its alpha from "how
  white is this pixel" (`alpha = 255 * (1 - minChannel/255)`) to kill the light
  halo that otherwise shows up on coloured backgrounds.
- **Compute the union bounding box across all frames**, then crop + resize once.
  Cropping per frame makes the sprite jitter; a shared crop keeps every frame
  pixel-aligned.
- **Emit `manifest.js`, not `manifest.json`.** A JS global
  (`window.X_FRAMES = {...}`) works when the page is opened directly via
  `file://`, where `fetch()` of a local JSON file is blocked by CORS.
- Budget roughly 30 KB/frame at 512 px WebP q82 (≈7 MB for 240 frames). Drop to
  `--fps 12` if the payload needs to shrink; idle animations survive it.

## 2. Build the page

Single `<canvas>`, no third-party dependency. Core pieces:

- Preload every frame with `new Image()`, count `onload`/`onerror`, and drive a
  progress bar; hide the loader only when all frames are in.
- **Fixed-step spring integration** so the feel is identical at 60/120/144 Hz:

  ```js
  const steps = Math.min(Math.max(Math.round(dt * 60), 1), 4);
  for (let i = 0; i < steps; i++) {
    vx += (targetX - x) * stiff;   vy += (targetY - y) * stiff;
    vx *= damping;                 vy *= damping;
    x += vx;                       y += vy;
  }
  ```

- Clamp the **target** (not the draw position) so the sprite always stays fully
  on screen without the spring fighting the clamp.
- Derive tilt from `vx` and squash/stretch from speed for a lively feel.
- Draw order: soft ground shadow → motion ghosts → sprite → particles.
- Advance the animation on its own clock:
  `frame = Math.floor(animTime * FPS) % count`, optionally sped up by speed.
- Honour `prefers-reduced-motion` (skip bob / ghosts / particles).
- Keep the page responsive: size the sprite from `min(innerWidth, innerHeight)`
  and scale the canvas by `devicePixelRatio` (capped at 2).

## 3. Verify in a real browser

Serve over HTTP (`python3 -m http.server 8080`) and confirm: the loader reaches
100%, there are no 404s for frames, the sprite actually moves toward the
pointer, and the controls work. Dispatch real `pointermove` events at known
coordinates to check the follow behaviour.

## 4. Ship it

```bash
# GitHub
git init && git add -A && git commit -m "feat: mouse-follow frame sequence"
curl -X POST https://api.github.com/user/repos \
  -H "Authorization: Bearer $GH_TOKEN" \
  -d '{"name":"<repo>","private":false}'
git remote add origin https://github.com/<owner>/<repo>.git && git push -u origin main

# Cloudflare Pages (static, direct upload)
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
  npx wrangler pages deploy . --project-name=<name>
```

Get the account id from `GET /client/v4/accounts`; verify a token with
`GET /client/v4/user/tokens/verify`.

## Pitfalls

- Do not globally remove white to fake transparency — flood fill from the border.
- Do not ship a JSON manifest if `file://` support matters.
- Avoid `cursor: none` unless you also draw a custom cursor.
- Hundreds of separate frame files are fine locally but chatty on a CDN;
  consider a sprite sheet when deploying at scale.
- Never commit API tokens. Pass them through environment variables.
