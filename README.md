# local-first Studio 1114

**A calmer runway for creative work.** Studio 1114 is a local-first productivity workspace that helps independent builders decide what deserves attention now, rather than accumulating a larger and louder task list.

It ships with a believable working day: a focus session, several project threads, an energy forecast, lightweight trace notes, and three project arcs. Every interaction works in the browser with no account, server, API key, or paid service.

## What it does

- Turns tasks into a small attention runway: *in motion*, *on deck*, and *parking lot*.
- Runs a focused work block with a visible countdown and completion control.
- Captures ideas quickly with `C`; the thought is saved immediately as a local thread.
- Offers a local “shape this block” nudge. This deliberately uses deterministic client-side logic so the demo is useful without pretending to call an AI service.
- Organizes work by projects without turning the project view into a heavyweight project-management tool.
- Persists data in `localStorage`, including new captures, task state, selected focus, and project context.
- Supports keyboard navigation: `C` opens capture, `F` toggles the focus session, `⌘/Ctrl + K` opens Studio actions, and `Esc` closes overlays.
- Includes purpose-built loading, no-results, cleared-runway, save-failure, and application-recovery states.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

For production verification:

```bash
npm test
npm run build
npm run preview
```

## Architecture

The app is intentionally a frontend-only Vite + React application.

| Area | Location | Purpose |
| --- | --- | --- |
| Application shell and UI | `src/App.jsx` | Views, modal interactions, focus timer, keyboard shortcuts, local persistence wiring, and recovery boundary. |
| Presentation system | `src/styles.css` | Responsive layout, custom controls, motion, visual states, and mobile navigation. |
| Local domain logic | `src/logic.js` | Demo seed data, storage hydration, capture creation, task-state transitions, progress, and local guidance. |
| Unit checks | `src/logic.test.js` | Tests the core pure behaviors without a browser. |

There is no standalone backend because one would make the core experience less local and offer no benefit here. The only persistence boundary is browser `localStorage` under the key `studio-1114-state-v1`.

## Design and interaction notes

The visual system pairs a warm paper canvas with pine, lime, peach, mint, and violet accents. Serif headings create an editorial, reflective tone while dense actions stay in a practical sans-serif. The desktop sidebar becomes a compact bottom navigation on mobile; controls remain large enough to touch comfortably.

The opening Studio screen is the intended hero state. It communicates the product in one frame: a concise promise, a present work block, a task runway, an energy signal, and proof of thoughtful progress. The Flow and Library views demonstrate that the system scales from “what should I do now?” to “what am I building over time?”

### Screenshot guidance

For a representative portfolio screenshot, use the default **Studio** view at a wide desktop viewport (1440 × 1000 or similar), with the sidebar and the `Sketch the onboarding story` focus card visible. The captured frame should include the focus timer, runway, and right-side signal panel. For a responsive companion image, use a narrow viewport (390 × 844) on the same default screen; it shows the mobile bottom navigation and stacked focus composition.

## Optional integrations and environment

Studio 1114 does not need configuration for its core experience. `.env.example` reserves names for a future optional AI endpoint, but no environment variables are currently read by the app. Do not put secrets in `VITE_*` values unless you understand that Vite exposes them to the client bundle.

## Deployment notes

This is a static single-page app. Run `npm run build` and publish the generated `dist/` directory to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages with SPA fallback, etc.). No database, API route, or server environment is needed.

Because data stays in each browser, hosted previews begin with the curated demo state. A visitor can use **Restore demo data** to clear their own Studio 1114 local data and return to that starting point.

## Validation status

`npm test` runs three focused Vitest assertions for progress, task progression, and quick capture creation. `npm run build` produces a successful production Vite bundle.
