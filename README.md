# Text Breakout

A static web app that converts typed text into a single composite image using per-character PNGs from `chars/` (a–z, 0–9).

## Features
- Single canvas image output with white background
- Small gaps between adjacent characters; larger gaps for spaces
- Left/right margins via leading and trailing spaces
- Skips missing characters gracefully
- Input validation: letters, numbers, spaces (max 50 chars)

## Quick Start
1. Open `index.html` in a modern browser (no build needed).
2. Type your message (a–z, 0–9, spaces).
3. Click "Convert" to generate the image.
4. Use "Clear" to start over.

## Project Structure
```
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   └── app.js
└── assets/
    └── chars/   # character images (a–z, 0–9)
```

## Constraints (from constitution)
- Static-only delivery (no backend, no secrets)
- Performance budget: LCP ≤ 2.5s, CLS ≤ 0.1, initial JS ≤ 200KB gzip
- Accessibility: WCAG 2.1 AA (semantic HTML, keyboard operability)

## Notes
- Character images are expected at `assets/chars/` (copied from `chars/`).
- If a particular character image is missing, it is skipped in the output.
