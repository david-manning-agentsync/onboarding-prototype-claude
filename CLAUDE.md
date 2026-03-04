# CLAUDE.md — Onboarding Prototype

## What This Is
A **React + TypeScript + Vite** prototype for AgentSync's Spring Onboarding MVP. This is a **design and product prototype** — no backend, no real auth, all data is mocked. The goal is to communicate product vision, test UX patterns, and align stakeholders across personas and feature maturity levels.

**Audience:** Customer demos, internal alignment, and engineering handoff. Code should be written cleanly enough that an engineer can read it and understand the intent — use clear variable names, logical component boundaries, and avoid prototype-only hacks that would confuse a handoff reader.

---

## Product Context
AgentSync is a producer lifecycle management platform in the insurance industry. This prototype focuses on **producer onboarding** — the process of getting licensed insurance producers credentialed, compliant, and ready to sell on behalf of an agency or carrier.

### Domain Language
Use real insurance industry terminology throughout — in mock data, UI labels, and placeholder copy.

| Term | Meaning |
|------|---------|
| **Producer** | A licensed insurance agent or broker being onboarded |
| **NPN** | National Producer Number — unique ID assigned by NIPR to every licensed producer |
| **Resident State** | The state where a producer holds their primary license |
| **LOA** | Line of Authority — a specific insurance line a producer is licensed to sell (Life, Health, P&C, etc.) |
| **E&O** | Errors & Omissions insurance — professional liability coverage required of producers |
| **Appointment** | A carrier's formal authorization for a producer to sell their products |
| **GWBR** | Gateway Business Rule — AgentSync's regulatory rule engine that determines compliance requirements by state/line |
| **Policy Set** | A configurable container of regulatory + organizational requirements applied to producers |
| **Producer Readiness** | The highest-priority unresolved gate to a producer being sell-ready |
| **Operating Manager (OM)** | The internal user shepherding producers through onboarding (agency admin, firm manager, etc.) |
| **Sell-Ready** | A producer who has met all licensing, LOA, and organizational requirements to actively sell |

---

## Project Goals
Operating Managers need to answer three questions fast:
1. What types of producers are we onboarding?
2. How are producers progressing?
3. What does the workload look like, and how can I help move things forward?

Every design decision should serve those questions. Favor **action-oriented, scannable UI** over decoration. Dashboards and tables are the primary surfaces — every chart should offer a one-click path to a filtered table where the user can act.

This prototype is not constrained by any single release scope. It is expected to grow — deeper features, richer persona experiences, and AI-assisted capabilities are all fair game. Use the version system to communicate maturity, not to limit imagination.

---

## Tech Stack
- **React 18 + TypeScript** (`.tsx` throughout)
- **Vite** (dev server, build)
- **No component library** — all UI is hand-rolled using inline styles
- **No backend** — all data lives in `src/data.tsx`
- **No routing library** — view switching is handled via state in `App.tsx`

---

## File Map

### `src/`
| File | Role |
|------|------|
| `App.tsx` | Root. Owns `persona`, `version`, and active view state. Routes to views. |
| `theme.tsx` | **Single source of truth for all colors, badges, and the `<Badge>` component.** Always import from here. |
| `data.tsx` | **All mock data.** `PRODUCERS_SEED`, `POLICY_SETS_SEED`, saved views, types, and helpers. Never inline mock data in components. |
| `main.tsx` | Vite entry point. |
| `App.css` / `index.css` | Base resets only. All component styling is inline. |

### `src/views/`
| File | Role |
|------|------|
| `Dashboard.tsx` | Operating Manager overview — charts by readiness, status, task volume. Each chart links to filtered table. |
| `Producers.tsx` | Producer table — sortable, filterable, searchable. Click row → opens `TaskDrawer`. Uses manual header/toolbar pattern — pending migration to `TableView`. |
| `Tasks.tsx` | Task table — cross-producer task view. Filterable by status, type, readiness. Uses manual header/toolbar pattern — pending migration to `TableView`. |
| `PolicySets.tsx` | Sysadmin view with navigational tabs: Policy Sets, Task Templates, Components. Tabs only render for `sysadmin` persona. Each tab uses `TableView`. Column defs are constants at top of file. Task Template rows open read-only drawer; Component rows open WIP drawer. |

### `src/components/`
| File | Role |
|------|------|
| `ProtoPanel.tsx` | **Prototype control bar.** Persona + version switcher. Lives at top of sidebar. |
| `Sidebar.tsx` | Left nav. Renders nav items based on active persona's permissions. |
| `SystemSidebar.tsx` | Admin-mode sidebar variant. |
| `BottomBar.tsx` | Bottom status/action bar shown in certain views. |
| `Table.tsx` | **Two exports:** `Table` (bare primitive — headers, rows, sort, checkboxes) and `TableView` (full-page surface — title, count, toolbar, search, filter/column drawers). Use `TableView` for any full-page table view. Column defs (`ColDef[]`) and filter defs (`FilterDef[]`) are passed in from the view; all chrome is owned here. `Table` is for embedded use only. |
| `SearchBar.tsx` | Shared search input. `placeholder` is optional, defaults to `"Search…"`. |
| `Drawer.tsx` | **Base drawer component. Always use this — never create new drawer patterns.** Supports `footer` prop for fixed action buttons at bottom of drawer. |
| `TaskDrawer.tsx` | Producer task detail — built on `Drawer.tsx`. Shows task list, status, approval actions. |
| `ColumnDrawer.tsx` | Column visibility manager for tables — built on `Drawer.tsx`. |
| `FilterDrawer.tsx` | Filter panel for tables — built on `Drawer.tsx`. |
| `InviteDrawers.tsx` | Invite producer flow — built on `Drawer.tsx`. |
| `PolicySetDrawer.tsx` | Policy set detail/edit — built on `Drawer.tsx`. Multi-step flow: name → org-wide checkbox → states → products → GWBRs → task sequencer → task editor. |
| `SaveViewModal.tsx` | Save filtered view modal. |
| `AIChat.tsx` | AI assistant panel. Prototype-only, not wired to real API. |
| `UI.tsx` | Shared micro-components (buttons, inputs, etc.). |

### `src/hooks/`
| File | Role |
|------|------|
| `useColumnManager.ts` | Manages column visibility/order state for tables. |
| `useTableSelection.ts` | Manages row selection state for tables. |

---

## Design System

### Colors — always import `C` from `theme.tsx`
```ts
C.bg          // #f5f6fa — page background
C.surface     // #ffffff — cards, panels
C.border      // #e5e7eb — standard borders
C.accent      // #4f46e5 — primary actions, links
C.success     // #059669 — completed, approved
C.warning     // #d97706 — blocked, pending
C.danger      // #dc2626 — rejected, terminated
C.muted       // #9ca3af — secondary text, placeholders
C.text        // #111827 — primary text
C.textMed     // #374151 — secondary text
C.ai          // #7c3aed — AI feature tinting
```

### Badges — always use `<Badge label="..." />` from `theme.tsx`
Pre-defined for all statuses: `Needs License`, `Needs LOAs`, `Reg Tasks Only`, `Org Requirements`, `Invited`, `In Progress`, `Waiting/Blocked`, `Completed`, `Terminated`, `Open`, `Needs Approval`, `Approved`, `Rejected`, `Done`. Add new statuses to `BADGE` in `theme.tsx` — never define badge colors inline.

### General Design Principles
- **Simple and action-oriented.** No decorative UI. Every element should answer "what do I do next?"
- **Inline styles throughout** — consistent with existing codebase, no CSS modules or Tailwind.
- **Drawers, not modals** for detail views. Use `Drawer.tsx` as the base — never create a new drawer pattern. Always use the `footer` prop for action buttons — never put buttons inside the scroll body.
- **Tables are primary surfaces.** Dashboard charts should always deep-link into a pre-filtered table.
- **`TableView` is the standard full-page table surface.** Use it for any view that shows a table with a title, toolbar, search, and filters. `Table` is for embedded/nested use only.
- **Tabs pattern:** Use `ViewTabs` (defined locally in the view) for navigational tabs within a view. Tabs sit below the page title, above the toolbar. `TableView` owns its own title so tabs sit above the first `TableView` call.
- **Typography:** system-ui font stack, no custom fonts. Weights: 400 body, 500 labels, 600–700 headings/badges.
- **Insurance language matters.** Use real domain terminology in all UI copy, mock data, and placeholder text. Avoid generic labels like "Item 1" or "Task A." A demo should feel like a real product.
- **Consistency across components is non-negotiable.** Before building new UI, check how existing views handle the same pattern. When in doubt, paste the relevant existing file and ask Claude to match it.

---

## Personas & Version Toggling

Controlled by `ProtoPanel.tsx`. State lives in `App.tsx` and is passed down as props.

### Personas
| ID | Name | Role | What they see |
|----|------|------|---------------|
| `manager` | Sarah Chen | Operating Manager | Dashboard, producer table, task table, task actions. Default view. |
| `sysadmin` | Alex Morgan | System Admin | Everything Sarah sees + policy set config (with tabs), invite management, full producer/task access. |
| `producer` | Jordan Smith | Producer | Their own task checklist only. No tables, no dashboard. |

Personas are also expected to grow. As the prototype expands (e.g., a carrier rep, an executive stakeholder view), new personas can be added to `ProtoPanel.tsx`.

### Versions
| ID | Label | Color | Intent |
|----|-------|-------|--------|
| `mvp` | MVP | green | Core onboarding primitives — invite, task list, tables, dashboard |
| `post-mvp` | Post | indigo | Enhanced workflows, richer task management, deeper OM tooling |
| `ai` | AI | purple | AI-assisted features: task generation, readiness reasoning, chat, suggestions |

**Versions are additive.** Post-MVP builds on MVP; AI builds on Post. When building a feature, anchor it to the version where it would realistically appear and use the version prop to gate it. Don't shy away from ambitious post-MVP or AI experiences — the prototype should show the full arc of the product vision.

Use `personaId` and `version` props (passed from `App.tsx`) to tailor the experience. Keep conditional logic close to where the UI diverges — don't abstract it in a way that makes it hard to see what each persona or version actually renders.

---

## Placeholders Are Valid
Not everything needs to be fully built. **Placeholders are a legitimate prototype tool** — use them when they add value to a demo or help communicate where a feature would live without requiring full implementation.

Good uses of placeholders:
- A greyed-out nav item with a "Coming soon" tooltip to show scope
- An empty state with a clear call-to-action that communicates intent
- A chart card with a title and "Data coming soon" to anchor the dashboard layout
- A drawer that opens but shows a simplified or static version of what the real experience would be

When building a placeholder, make it feel intentional — not broken. A placeholder should communicate *what will be here* clearly enough that a customer in a demo doesn't feel like they're looking at an unfinished product.

---

## Data Model (Mock)

All types and seed data in `src/data.tsx`. Never inline mock data in components. If a dataset grows large, split into a dedicated file (e.g., `data/producers.ts`) rather than expanding `data.tsx` indefinitely.

### Key Types
- **`Producer`** — `id`, `name`, `npn`, `classification` (readiness), `status` (process status), `resident` (state), `tasks[]`, `activityLog[]`
- **`Task`** — `id`, `name`, `type` (Regulatory | Org), `status`, `owner` (Producer | Customer), `required`, `detail`, `rejectionNote`
- **`PolicySet`** — `id`, `name`, `orgWide` (boolean), `tasks` count, `desc`
- **`SavedView`** — `id`, `name`, `filters`, `table`

### Producer Readiness (`classification`) — precedence order
`Ineligible` → `Needs License` → `Needs LOAs` → `Needs Regulatory Follow-ups` → `Needs Partner Setup` → `Needs Internal Setup` → `Ready`

The system surfaces the **highest-priority unresolved gate**, not the largest volume of work. Original readiness is captured at invite; current readiness updates as tasks are completed.

### Process Status Values
`Invited` | `In Progress` | `Waiting/Blocked` | `Completed` | `Terminated`

### Task Status Values
`Open` | `Needs Approval` | `Approved` | `Rejected` | `Done`

### Task Ownership
- **Producer** — producer completes the task
- **Internal** — Operating Manager or customer staff completes it
- **Partner** — external party (e.g., carrier) completes it; takes precedence in readiness rollups

---

## Key Patterns & Rules

**Drawers:** Always use `Drawer.tsx` as the base. Never create new drawer or slide-out patterns. Always use the `footer` prop for action buttons — never render buttons inside the scrollable body.

**Full-page tables:** Always use `TableView` from `Table.tsx`. Pass `allCols`, `filterDefs`, `rows`, `totalCount`, `recordLabel`, `search`, `onSearch`, `applied`, `onApply`, and optionally `primaryAction` and `banner`. The view owns filter logic and row data; `TableView` owns all chrome.

**Column definitions:** Define as named constants (e.g., `PS_COLS`, `TT_COLS`) at the top of the view file — not inline in JSX. This makes them easy to find and edit without touching component logic.

**Mock data:** All seed data lives in `data.tsx`. Use realistic insurance data — real state names, NPN-style numbers, actual LOA types (Life, Health, P&C, Annuities), real task names. If a dataset grows large, split it into a dedicated file.

**Tabs within a view:** Define a local `ViewTabs` component in the view file. Tabs sit below the page title/subtitle and above the first `TableView`. Each tab renders its own `TableView` — titles and subtitles update per tab.

**New components:** Prefer a new file when a component will be reused or iterated independently. If code is small and tightly coupled to one view, weigh the cost of touching two files vs. one — ask when it's genuinely unclear.

**State:** No global state library. Cross-view concerns (persona, version, active view) are lifted to `App.tsx`. Local state stays in the component.

**Conditional rendering:** Use `personaId` and `version` props from `App.tsx`. Keep conditionals close to the UI divergence point — don't abstract them away from where they matter.

**Handoff-ready code:** Variable and prop names should be self-explanatory. Avoid one-letter variables outside of obvious loops. Component boundaries should reflect real product concepts — an engineer reading this should understand what each piece represents without needing a walkthrough.

**No backend:** Don't introduce fetch calls, APIs, or async data patterns. This is a static prototype.

**Share relevant files upfront.** Before building anything that touches a shared component (`Table.tsx`, `Drawer.tsx`, `SearchBar.tsx`, `theme.tsx`, etc.), paste that file at the start of the session. This prevents avoidable errors and round-trips.

---

## Working With Claude Effectively

### The Session Lifecycle
A session maps to **one working unit of change** — not a time limit. The natural arc is:

1. **Start** — paste `CLAUDE.md` + a one-sentence "where we left off" note
2. **Build** — Claude writes or rewrites code; you apply it locally and test
3. **Fix** — if something breaks, describe the error in the same session and Claude helps resolve it
4. **Deploy** — once it's working locally, push to git
5. **End** — session is done; start fresh for the next unit of work

**Start a new session when:**
- Code is tested locally and deployed to git ✓
- You're shifting to a meaningfully different feature or file
- Responses start feeling off — wrong patterns, ignoring constraints, repeating questions
- You hit a context limit warning (don't push through it)

**Mid-session safeguard:**
This instruction is always active — no need to ask:
> *Monitor context usage throughout this session. When you estimate we're at roughly 75% of the context window, proactively warn me before responding so we have a few prompts to wrap up cleanly and deploy before starting a new session.*

Because `CLAUDE.md` is pasted at the start of every session, this instruction is automatically in effect. You should never have to think about it.

> ⚠️ **If a session crashes without warning**, start a fresh session immediately — don't try to continue in the same chat. Paste `CLAUDE.md` and a brief note on what was last deployed.

> ⚠️ **If Claude's patch updates produce cascading errors** (e.g. a second `update` missing its target), skip further patches and ask for a full file rewrite instead. Partial updates on large files are fragile — a full rewrite is always a safe fallback.

**How to re-orient a new session fast:** Paste `CLAUDE.md`, then add context like: *"We just finished the TaskDrawer approval flow and deployed. Next I want to build out the producer invite experience in `InviteDrawers.tsx`."* That's enough.

---

### Applying Code (Non-Coder Guidance)
Claude will typically provide one of three things — know which you're getting:

**Full file rewrite** (most common for this project): Claude provides the entire file contents. In VS Code, open the file, select all (`Cmd+A`), paste, save. Done.

**Targeted change with instructions**: Claude describes what to change and where. If it's not obvious, ask: *"Can you just rewrite the full file?"* — that's always a valid ask.

**Terminal commands**: Claude may give you commands to run in the VS Code terminal (`Terminal → New Terminal`). Common ones:
```bash
npm install          # install a new dependency
npm run dev          # start local dev server
git add .            # stage all changes
git commit -m "..."  # commit with a message
git push             # deploy to git
```
If a command fails, paste the full error back into the chat — don't try to interpret it yourself first.

**If the local dev server shows an error:** Copy the exact error text from the browser console (`Cmd+Option+I → Console`) or the terminal and paste it into the chat. Always include which file you just changed.

---

### Git Deploy Problems
Deployment issues are common. When something goes wrong pushing to git, paste the terminal error directly into the chat and say "I got this error trying to push." Common culprits Claude can help with: merge conflicts, untracked files, branch issues, or auth token expiry.

Before ending any session, run:
```bash
git status
```
If it shows uncommitted changes, ask Claude for the right commit-and-push sequence before closing out.

---

### End-of-Session Checklist
Before closing a session, ask Claude: **"What should I do before ending this session?"** Claude should provide:

- ✅ Confirmation of what was built and what files changed
- 🧪 Any specific things to test locally before deploying
- 🚀 The git commit message to use
- 📋 Suggested next tasks to tackle in the next session
- 📎 Anything extra to carry into the next session beyond `CLAUDE.md`

---

### Other Things to Ask at End of Session
Beyond code, Claude can help you get more value from what was just built. Examples:

- **"Write a next-session starter prompt"** — a ready-to-paste message for the next chat that includes context, files changed, and what's next
- **"Update the Current State section of CLAUDE.md"** — keep the doc accurate after each session
- **"Write a demo script for this feature"** — a talking-track for walking a customer or stakeholder through what was just built, using real insurance language
- **"Write a sales-oriented pitch for this feature"** — framed around customer value, not technical detail
- **"Explain what we built in plain English"** — useful for sharing with non-technical stakeholders or writing a Slack update
- **"What edge cases or gaps should engineering know about?"** — surfaces handoff notes while context is fresh
- **"What would make this feel more real for a demo?"** — Claude will suggest mock data improvements, placeholder upgrades, or missing persona details

### How to Ask for Good Results
- **Be specific about persona and version.** Instead of "add a filter," say "add a readiness filter to the producer table, visible to the `manager` persona in all versions."
- **Reference file names.** "Update `TaskDrawer.tsx`" is clearer than "update the task drawer."
- **Describe the goal, not just the change.** "An OM needs to be able to reject a task and leave a note" gives better results than "add a reject button."
- **For placeholders,** say so explicitly: "Build this as a placeholder — it should feel intentional but doesn't need real functionality yet."
- **For handoff-ready code,** flag it: "This will be handed off to engineers — make sure naming is clean and the logic is easy to follow."
- **Paste shared component files upfront** when your work will touch them — `Table.tsx`, `Drawer.tsx`, `SearchBar.tsx`, `theme.tsx`. This prevents errors and saves round-trips.

---

## Current State

| Area | State |
|------|-------|
| Dashboard | ✅ Working |
| Producer table | ✅ Working — pending `TableView` migration |
| Task table | ✅ Working — pending `TableView` migration |
| Policy Sets view | ✅ Working — tabs (Policy Sets / Task Templates / Components), all three tables functional, drawers working |
| `PolicySetDrawer` | ✅ Updated — org-wide requirement checkbox below policy name; bank account preview widened with empty-state field placeholders and inline "Add bank account" link |
| `TableView` component | ✅ Built in `Table.tsx` — Producers/Tasks migration is next |
| Drawers / modals | ✅ Working — all use `Drawer.tsx` footer prop for action buttons |
| AI Chat panel | ✅ Working (prototype only) |
| All data | 🟡 Mocked / hardcoded — seed data in `data.tsx` and locally in `PolicySets.tsx` (TaskTemplates, Components not yet in `data.tsx`) |