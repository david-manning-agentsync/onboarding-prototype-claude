# Onboarding Prototype — Claude

A prototype of the AgentSync producer onboarding experience, built in React + TypeScript with Vite.

**Live demo:** https://david-manning-agentsync.github.io/onboarding-prototype-claude

---

## Running locally

```bash
npm run dev
```
Then open http://localhost:5173 in your browser.

## Deploying to GitHub Pages

```bash
npm run deploy
```
The live URL updates automatically after ~2 minutes.

---

## Iterating with Claude

When making changes, paste the relevant file(s) into Claude with a description of what you want changed. Claude will return the updated file. Save it in VS Code and run `npm run deploy` to push live.

**Always include `theme.ts` as context** when working on visual changes — it contains all the colors and badge styles that keep the UI consistent.

---

## File Structure

```
onboarding-prototype-claude/
├── src/
│   ├── App.tsx                     # App shell, sidebar, navigation, version launcher
│   ├── theme.tsx                   # Colors, badge styles, Badge component
│   ├── data.tsx                    # All seed data, types, and helpers
│   ├── main.tsx                    # Entry point (don't edit this)
│   ├── components/
│   │   ├── UI.tsx                  # Shared UI: Input, Table, FilterDrawer, BulkBar, SaveViewModal
│   │   ├── AI.tsx                  # AI command bar, result banner, Claude API call
│   │   ├── TaskDrawer.tsx          # Slide-out task detail panel with approve/reject actions
│   │   └── InviteDrawers.tsx       # Single producer invite + bulk CSV invite drawers
│   └── views/
│       ├── Dashboard.tsx           # Dashboard with bar charts and timeframe selector
│       ├── Producers.tsx           # Producers table + producer detail page
│       ├── Tasks.tsx               # Tasks table with filters and task drawer
│       └── PolicySets.tsx          # Policy sets list + AI-powered policy set builder
```

---

## What each file does

### `src/App.tsx`
The root of the app. Contains:
- **Launcher** — the version picker screen (MVP / Post-MVP / AI Preview)
- **App shell** — the sidebar, navigation, saved views, and main content area
- **Root** — the top-level component that switches between Launcher and App

### `src/theme.tsx`
The single source of truth for all visual styling. Contains:
- **C** — the full color palette (backgrounds, borders, accent, success, danger, AI purple)
- **BADGE** — color definitions for every badge label (statuses, classifications)
- **Badge** — the colored pill component used everywhere in the app

### `src/data.tsx`
All data and TypeScript types. Contains:
- **Types** — `Producer`, `Task`, `ActivityEntry`, `PolicySet`, `SavedView`
- **PRODUCERS_SEED** — 18 fake producers with tasks and activity logs
- **POLICY_SETS_SEED** — 3 policy set definitions
- **POLICY_REQS** — task lists for each policy set
- **DEFAULT_PRODUCER_VIEWS / DEFAULT_TASK_VIEWS** — pre-built saved views
- **countBy / TIMEFRAMES** — small helper utilities

### `src/components/UI.tsx`
Reusable building blocks used across multiple views. Contains:
- **VersionCtx / useVersion** — context that tracks which version (MVP/Post-MVP/AI) is active
- **Input** — styled search input
- **ActiveFilters** — the row of removable filter pills
- **FilterDrawer** — slide-out filter panel with drill-down options
- **Table** — the data table with optional checkboxes and hover states
- **BulkBar** — sticky bottom bar that appears when rows are selected
- **SaveViewModal** — modal for naming and saving a filtered view

### `src/components/AI.tsx`
Everything related to the AI features. Contains:
- **callClaude** — the function that calls the Anthropic API
- **AICommandBar** — the natural language input bar on producers and tasks tables
- **AIResultBanner** — the dark banner showing AI query results with action buttons

### `src/components/TaskDrawer.tsx`
The slide-out panel for viewing and acting on a single task. Contains:
- Task details, status badge, owner and type metadata
- Action buttons: Submit, Approve, Reject, Reopen, Resubmit
- Rejection note textarea
- Keyboard navigation (arrow keys to move between tasks, Escape to close)

### `src/components/InviteDrawers.tsx`
Two drawers for inviting producers. Contains:
- **InviteDrawer** — single producer invite form with name, email, NPN, state, and policy set picker
- **BulkInviteDrawer** — CSV upload flow with drag-and-drop, template download, and file preview

### `src/views/Dashboard.tsx`
The overview screen. Contains:
- Three horizontal bar charts: producers by classification, producers by status, tasks by status
- Timeframe toggle (Last 7 days / 30 days / 90 days / All time)
- Clickable bars that navigate to filtered producer or task views

### `src/views/Producers.tsx`
Two components in one file. Contains:
- **ProducersView** — the producers table with search, filters, invite button, AI command bar, bulk actions, and save view
- **ProducerDetail** — the individual producer page with meta cards, task list, progress bar, and activity log tab

### `src/views/Tasks.tsx`
The tasks table. Contains:
- Flat list of all tasks across all producers
- Search by task name, producer name, or NPN
- Filters by task status, type, owner, producer classification, producer status
- AI command bar and bulk approve/reject actions
- Task drawer wired up for inline updates and keyboard navigation

### `src/views/PolicySets.tsx`
The policy sets management screen. Contains:
- **PolicySets** — expandable list of policy sets with drag-to-reorder (Post-MVP+)
- **PolicySetModal** — two-path modal for creating new policy sets:
  - AI path: describe the producer type, AI generates a task list to review and edit
  - Manual path: add tasks one by one with full control over every field

---

## Versions

The prototype has three versions selectable from the launcher:

| Version | What's included |
|---|---|
| **MVP** | Core tables, producer invite, policy sets, dashboard, task execution |
| **Post-MVP** | + Bulk actions, rejection notes, saved views, activity log, task reordering |
| **AI Preview** | + Natural language command bar, AI filter/action flows, AI policy set generator |
