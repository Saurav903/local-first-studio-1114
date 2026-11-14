# local-first Studio 1114

## Public description

local-first Studio 1114 is a beautifully restrained productivity app for solo creative work. It replaces the anxiety of an endless task list with a focused runway: what is in motion, what is on deck, and what can wait. A polished focus block, quick capture ritual, energy-aware prompt, project library, and work trace make it immediately useful as a portfolio-quality demo.

## Stack

- React 19 with Vite 8
- Vanilla CSS with a custom responsive design system
- Browser `localStorage` for offline, account-free persistence
- Vitest for unit-level behavior checks

## Value proposition

Studio 1114 makes work feel finite and intentional. It gives a builder enough structure to choose a next move and preserve context, without importing the overhead of a team project-management product. It works completely offline and starts with rich demo content, so its value is visible on first launch.

## Key capabilities

- Focus timer and a deliberate “current thread”
- Local quick capture (`C`) with immediate persistence
- Keyboard action palette (`⌘/Ctrl + K`) and focus toggle (`F`)
- Flow lanes for in-motion, on-deck, and parked work
- Project progress cards and searchable thread index
- Deterministic local guidance that works without an API key
- Responsive desktop and mobile layouts, plus loading, empty, error, and recovery states

## Validation result

Run on 2026-11-14:

- `npm test` — passed: 1 test file, 3 tests
- `npm run build` — passed: production Vite bundle generated in `dist/`

No secrets are included. `.env.example` documents the reserved optional-integration variables.
