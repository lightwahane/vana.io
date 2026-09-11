# hold the light

A small, private, cinematic web experience — built for one phone, one person.

She opens the link, starts the music, and the story carries her the rest of the
way: mostly watching, occasionally asked to touch the screen. The whole thing
is built around one idea — a small light she has to keep alive, that by the
end becomes something bigger.

## What's inside

```
index.html   — structure: the music gate + every scene
style.css    — all visual design, animation, and responsive rules
script.js    — the scene controller, gestures, starfield, and finale
README.md    — this file
```

No build step. No dependencies to install. It's plain HTML/CSS/JS, so it
runs by opening `index.html`, or by hosting the folder anywhere static.

## Deploying to GitHub Pages

1. Create a new repository (or use an existing one).
2. Put `index.html`, `style.css`, and `script.js` at the **root** of the repo
   (not inside a subfolder) — or inside `/docs` if you'd rather keep it tidy;
   either works as long as you point Pages at the right folder.
3. Push the files.
4. In the repo's **Settings → Pages**, set the source to the branch/folder
   you used, and save.
5. GitHub gives you a URL like `https://yourusername.github.io/your-repo/`.
   That's the link you send her.

It also works fine on Netlify, Vercel, or any static host — just drop the
three files in.

## Media

The three photographs and the music track are loaded directly from the
remote URLs already in `index.html`/`script.js` (no local `assets/` folder
needed). If any of those links ever change, update the `src` in:

- `index.html` — the three `<img>` tags (`photo1.jpg`, `photo2.jpg`, `photo3.JPG`)
- `index.html` — the `<audio>` element's `<source>`

Note the third photo intentionally uses uppercase `.JPG` — that's exact and
matters on case-sensitive hosts.

## If you want to adjust pacing or copy

- All the story text lives directly in `index.html`, inside each
  `<section class="scene">`. Every line that should fade in on its own has
  `data-line` on it — add or remove lines freely, the reveal timing adapts.
- Scene timing (how long an automatic scene lingers before the story moves
  on) is controlled in `script.js` in the `SCENE_CONFIG` object — each entry
  has a `holdAfter` value in milliseconds.
- The three touch interactions (hold the ember, swipe the stars, drag the
  light) each have a generous ~20 second fallback built in, so she's never
  stuck if she doesn't realize what to do — the label gently changes to
  "whenever you're ready..." and the story continues on its own.

## Accessibility

- Respects `prefers-reduced-motion`: particles, camera drift, and page-load
  animation are all disabled or minimized automatically.
- All interactive elements are keyboard-reachable and have visible focus
  states.
- Images have descriptive `alt` text; decorative layers are marked
  `aria-hidden`.

## A note on the ending

The final button is intentionally the only moment that needs a plain tap —
everything before it is either automatic or a gentle gesture. That's on
purpose: the ending should feel like *her* choice, not something the page
did for her.
