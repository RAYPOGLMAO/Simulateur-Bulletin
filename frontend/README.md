# PaieSim (Angular)

Angular 17 (standalone components) port of the original vanilla HTML/CSS/JS PaieSim app.

## Setup

```bash
npm install
npm start
```

Then open http://localhost:4200.

## Structure

- `src/app/core/models` — TypeScript interfaces (`BudgetInput`, `BudgetResult`, `HistoryEntry`, `AuthUser`).
- `src/app/core/services`
  - `budget.service.ts` — direct port of `computeBudget` / `buildBreakdownCategories`.
  - `history.service.ts` — localStorage-backed simulation history (signal-based).
  - `auth.service.ts` — localStorage-backed "logged in" user (client-side only, same as the original app — there's no real backend/auth).
  - `theme.service.ts` — light/dark theme, persisted to localStorage, applied via `data-theme` on `<html>`.
  - `toast.service.ts` — the small bottom toast notification.
- `src/app/core/guards/auth.guard.ts` — redirects to `/auth` if nobody is logged in (used on `/dashboard` and `/profile`, matching the original app's behavior).
- `src/app/shared/components`
  - `sidebar` — left navigation, reused on every app page.
  - `theme-toggle` — the sun/moon icon button, placed in each page's header.
  - `toast` — renders the current toast message.
  - `payslip-report` — the budget breakdown report, reused by both the simulation page and the historique detail modal.
- `src/app/pages` — one folder per route: `dashboard`, `bulletin-paie` (simulation form), `historique`, `profile`, `auth`.
- `src/styles.css` — global stylesheet, ported as-is from the original `styles.css` (CSS variables drive the light/dark theme).

## Notes

- Chart.js (`chart.js/auto`) renders the "Revenu net" bar chart on the dashboard.
- Everything is still client-side only — history and auth are stored in `localStorage`, same as the original app. There's no real backend.
- The route guard on `/dashboard` and `/profile` reproduces the "you can't access the dashboard without logging in" behavior from the original app.
