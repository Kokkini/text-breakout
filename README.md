# Text Breakout

A static web app that converts typed text into a single composite image using per-character PNGs from `chars/` (a–z, 0–9).

## Features
- Single canvas image output with white background
- Small gaps between adjacent characters; larger gaps for spaces
- Left/right margins via leading and trailing spaces
- Skips missing characters gracefully
- Input validation: letters, numbers, spaces (max 50 chars)
- Ball animation with configurable parameters
- **URL configuration**: Share custom settings via URL parameters

## Quick Start
1. Open `index.html` in a modern browser (no build needed).
2. Type your message (a–z, 0–9, spaces).
3. Adjust animation parameters (ball count, deviation angle, speed, etc.).
4. Click "Start New" to begin the animation.
5. Use "Share Config" to copy a URL with your current settings.

## URL Parameters

You can configure the animation using URL parameters to share specific settings:

### Supported Parameters

| Parameter | Aliases | Range | Description |
|-----------|---------|-------|-------------|
| `viewer` | - | `true`/`false` | Enable viewer mode (hides controls, auto-starts) |
| `balls` | `ballCount`, `numBalls` | 1-50 | Number of balls in the animation |
| `deviation` | `deviationAngle`, `angle` | 1-45 | Maximum angle deviation in degrees |
| `speed` | `movementSpeed` | 0.1-5.0 | Movement speed multiplier |
| `fontSize` | `textResolution`, `resolution` | 8-120 | Text rendering resolution |
| `text` | - | - | The text to display (URL encoded) |

### Examples

Viewer mode (clean sharing - hides controls, auto-starts):
```
?viewer=true&balls=30&deviation=20&speed=1.5&text=Amazing
```

Editor mode (shows controls for customization):
```
?viewer=false&balls=40&deviation=25&speed=2.0&fontSize=40&text=Hello%20World
```

Using alternative parameter names:
```
?viewer=true&numBalls=15&angle=10&movementSpeed=0.5&resolution=60&text=Cool!
```

### Using the Share Button

1. Configure your desired settings using the sliders and text input
2. Click the "Share" button
3. A URL with `viewer=true` and your configuration is copied to your clipboard
4. Share this URL for a clean viewing experience

### Viewer Mode

The `viewer` parameter controls the display mode:

**When `viewer=true`:**
- Animation automatically starts with the specified settings
- Title changes to "You've got a message"
- Only the animation canvas and title are visible
- A "Create your own" button is displayed below the canvas
- Clicking "Create your own" reveals the controls while keeping the animation running
- Provides a clean, distraction-free viewing experience

**When `viewer=false` (or omitted):**
- Full interface is shown with all controls
- Settings from URL parameters are pre-loaded into the controls
- Users can modify settings and start/stop the animation
- Perfect for sharing configurations that others can customize

## Carving Algorithm

The animation uses an intelligent island detection system to handle character loops (like in 'A', 'O', 'P', 'R', etc.):

### How It Works

1. **Flood Fill Detection** (at game start):
   - Performs flood fill from edge squares to identify all reachable areas
   - Unreachable regions (enclosed by text) are identified as "islands"
   - Each island can contain both protected (text) and carveable squares

2. **Boundary Detection**:
   - For each island, calculates the boundary (carveable squares that enclose it)
   - These boundary squares act as the "doorway" to the island

3. **Island Completion** (animated):
   - Monitors if all boundary squares have been carved
   - When an island's boundary is fully carved, triggers an animated completion:
     - Sweeps through island squares from **left-to-right, top-to-bottom**
     - Protected squares flash **gold** for 3 frames, then turn **red**
     - Carveable squares are carved to white (with matching timing)
     - Already carved squares are skipped immediately
   - Creates a satisfying visual reveal effect showing the island being completed
   - Ensures all areas are eventually reachable

### Visual Feedback

- **Black**: Carveable area (can be carved by balls)
- **Gray**: Protected text pattern (balls bounce off)
- **White**: Carved area (balls pass through)
- **Gold Flash**: Protected squares being revealed during island completion
- **Red**: Completed protected text (island completed or adjacent carving)

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
