# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-04-18] Hero changes need visual verification**
   Do instead: validate `src/sections/Hero.tsx` in `localhost:5000` and confirm the composition with screenshots before publishing.
2. **[2026-04-18] Build is the minimum safe gate**
   Do instead: run `npm run build` before commit whenever hero, header, or showreel code changes.

## Shell & Command Reliability
1. **[2026-04-18] Playwright artifacts can block push**
   Do instead: keep `.playwright-cli/` ignored and never include generated browser logs in commits.
2. **[2026-04-18] Local Vite logs are disposable**
   Do instead: ignore `.codex-vite-5000.log` and `.codex-vite-5000.err` instead of trying to version them.

## User Directives
1. **[2026-04-18] Publish directly on `main` when explicitly requested**
   Do instead: commit and push on `main` instead of creating a feature branch when the user asks for a single-branch flow.
