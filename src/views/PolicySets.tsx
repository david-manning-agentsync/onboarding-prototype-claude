import { useState } from "react";
import { C } from "../theme";
import { useVersion } from "../components/UI";
import { PolicySetDrawer } from "../components/PolicySetDrawer";
import type { PolicySetDrawerProps } from "../components/PolicySetDrawer";
import { Table } from "../components/Table";
import { ColumnDrawer } from "../components/ColumnDrawer";
import { useColumnManager } from "../hooks/useColumnManager";
import { AIChat } from "../components/AIChat";
import type { AIChatMessage, AIChatAction } from "../components/AIChat";
import { BottomBar } from "../components/BottomBar";
import { useTableSelection } from "../hooks/useTableSelection";
type SavePayload = Parameters<PolicySetDrawerProps["onSave"]>[0];

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED = [
  { id: "ps-1", name: "Licensed P&C Producer",               orgRequired: true,  activeInstances: 142, orgReqs: 6, gwbrs: 3, status: "active",   createdBy: "Maria Chen",   createdAt: "2024-01-12", modifiedBy: "Maria Chen",   modifiedAt: "2024-11-03" },
  { id: "ps-2", name: "Life & Health Producer",              orgRequired: true,  activeInstances: 89,  orgReqs: 7, gwbrs: 2, status: "active",   createdBy: "James Park",   createdAt: "2024-02-08", modifiedBy: "Sara Okonkwo", modifiedAt: "2025-01-15" },
  { id: "ps-3", name: "Unlicensed – Needs Resident License", orgRequired: false, activeInstances: 24,  orgReqs: 4, gwbrs: 0, status: "active",   createdBy: "Sara Okonkwo", createdAt: "2024-03-19", modifiedBy: "James Park",   modifiedAt: "2025-02-01" },
  { id: "ps-4", name: "Surplus Lines Broker",                orgRequired: false, activeInstances: 11,  orgReqs: 5, gwbrs: 4, status: "active",   createdBy: "Tom Rivera",   createdAt: "2024-05-22", modifiedBy: "Tom Rivera",   modifiedAt: "2024-12-10" },
  { id: "ps-5", name: "Non-Resident Producer",               orgRequired: false, activeInstances: 0,   orgReqs: 5, gwbrs: 1, status: "draft",    createdBy: "Maria Chen",   createdAt: "2024-09-01", modifiedBy: "Maria Chen",   modifiedAt: "2024-09-01" },
  { id: "ps-6", name: "Reinsurance Specialist",              orgRequired: false, activeInstances: 0,   orgReqs: 3, gwbrs: 0, status: "draft",    createdBy: "Tom Rivera",   createdAt: "2024-06-14", modifiedBy: "Tom Rivera",   modifiedAt: "2024-06-14" },
  { id: "ps-7", name: "Legacy P&C – Old Flow",               orgRequired: false, activeInstances: 0,   orgReqs: 4, gwbrs: 2, status: "archived", createdBy: "James Park",   createdAt: "2023-08-05", modifiedBy: "Sara Okonkwo", modifiedAt: "2024-04-20" },
  { id: "ps-8", name: "2023 Compliance Bundle",              orgRequired: false, activeInstances: 0,   orgReqs: 6, gwbrs: 0, status: "archived", createdBy: "Sara Okonkwo", createdAt: "2023-11-30", modifiedBy: "Sara Okonkwo", modifiedAt: "2024-01-08" },
];

const STATUS_COLORS = {
  active:   { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  draft:    { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  archived: { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
};

const AI_PROMPTS = [
  "Show policy sets with no active usage and not updated in 3 months",
  "Which policy sets are missing GWBRs?",
  "Find all draft policy sets created before 2024",
  "Show active policy sets with the most producers",
];

const fmtDate  = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const monthsAgo = (d: string, n: number) => { const t = new Date(d), c = new Date(); c.setMonth(c.getMonth() - n); return t < c; };

// ─── Badge ────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  return <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 99, padding: "2px 8px", textTransform: "capitalize" }}>{status}</span>;
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
import { useRef, useEffect } from "react";

// ─── AI message handler (PolicySets-specific logic) ───────────────────────────
function usePolicySetsAI(onFilter: (ids: string[] | null) => void) {
  return (msg: string, addMessage: (m: AIChatMessage) => void, setLoading: (v: boolean) => void) => {
    setTimeout(async () => {
      await new Promise(r => setTimeout(r, 850));
      const lower = msg.toLowerCase();
      let reply = "", action: AIChatAction | null = null;

      if (lower.includes("no active usage") || (lower.includes("not updated") && lower.includes("3 months"))) {
        const ids = SEED.filter(s => s.activeInstances === 0 && monthsAgo(s.modifiedAt, 3)).map(s => s.id);
        onFilter(ids);
        reply = `Found **${ids.length} policy sets** with no active producers and no updates in over 3 months — I've selected them in the table:\n\n• Legacy P&C – Old Flow\n• 2023 Compliance Bundle\n\nWould you like to archive all of them?`;
        action = { type: "status", value: "archived", label: `Archive ${ids.length} policy sets`, ids };
      } else if (lower.includes("missing gwbr")) {
        const ids = SEED.filter(s => s.gwbrs === 0).map(s => s.id);
        onFilter(ids);
        reply = `Found **${ids.length} policy sets** with no GWBRs configured. They're highlighted in the table.`;
      } else if (lower.includes("draft") && lower.includes("2024")) {
        const ids = SEED.filter(s => s.status === "draft" && new Date(s.createdAt) < new Date("2024-01-01")).map(s => s.id);
        onFilter(ids);
        reply = ids.length ? `Found **${ids.length} draft** policy sets created before 2024.` : "No draft policy sets found created before 2024.";
      } else if (lower.includes("active") && lower.includes("most")) {
        const sorted = [...SEED].filter(s => s.status === "active").sort((a, b) => b.activeInstances - a.activeInstances).slice(0, 3);
        onFilter(sorted.map(s => s.id));
        reply = `Top active policy sets by producer count:\n\n1. **Licensed P&C Producer** – 142\n2. **Life & Health Producer** – 89\n3. **Unlicensed – Needs Resident License** – 24`;
      } else {
        reply = `I searched your policy sets for "${msg}". Try one of the suggested prompts, or ask me to filter by usage, missing GWBRs, or status.`;
      }

      addMessage({ role: "assistant", content: reply, action });
      setLoading(false);
    }, 0);
  };
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function PolicySets() {
  const version   = useVersion();
  const isAI      = version === "ai";
  const isPostMVP = version === "post-mvp" || isAI;

  const [data,            setData]            = useState(SEED);
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [orgFilter,       setOrgFilter]       = useState("all");
  const [aiOpen,          setAiOpen]          = useState(isAI);
  const [aiFilterIds,     setAiFilterIds]     = useState<string[] | null>(null);
  const [pendingAiAction, setPendingAiAction] = useState<AIChatAction | null>(null);
  const [showDrawer,      setShowDrawer]      = useState(false);
  const [columnDrawerOpen, setColumnDrawerOpen] = useState(false);

  let rows = data.filter(r => {
    if (aiFilterIds && !aiFilterIds.includes(r.id)) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (orgFilter === "yes" && !r.orgRequired) return false;
    if (orgFilter === "no" && r.orgRequired) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { selected, toggleRow, toggleAll, selCount, setFromIds, clear } = useTableSelection(rows);

  const ALL_COLS = [
    { key: "name",            label: "Name",             render: (v: any) => <span style={{ fontWeight: 600, color: C.text }}>{v}</span> },
    { key: "orgRequired",     label: "Org Required",     render: (v: any) => v ? <span style={{ fontSize: 12, color: C.success }}>✓ Yes</span> : <span style={{ fontSize: 12, color: C.muted }}>—</span> },
    { key: "activeInstances", label: "Active Instances" },
    { key: "orgReqs",         label: "Org Reqs" },
    { key: "gwbrs",           label: "GWBRs",            render: (v: any) => v > 0 ? v : "—" },
    { key: "status",          label: "Status",           render: (v: any) => <StatusBadge status={v} /> },
    { key: "createdBy",       label: "Created By" },
    { key: "createdAt",       label: "Created",          render: (v: any) => fmtDate(v) },
    { key: "modifiedBy",      label: "Modified By" },
    { key: "modifiedAt",      label: "Modified",         render: (v: any) => fmtDate(v) },
  ];
  const { visibleCols, cols, toggleCol, reorder, reset } = useColumnManager(ALL_COLS);

  const handleAiFilter = (ids: string[] | null) => {
    setAiFilterIds(ids);
    if (ids) setFromIds(ids);
    else { clear(); setPendingAiAction(null); }
  };

  const handleAiAction = ({ type, value, ids }: AIChatAction) => {
    setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, [type]: value } : r));
    clear(); setAiFilterIds(null); setPendingAiAction(null);
  };

  const handleBulkStatus = (status: string) => {
    const ids = [...selected].filter(id => rows.find(r => r.id === id));
    setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
    clear(); setPendingAiAction(null);
  };

  const handleBulkOrgRequired = (val: boolean) => {
    const ids = [...selected].filter(id => rows.find(r => r.id === id));
    setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, orgRequired: val } : r));
    clear(); setPendingAiAction(null);
  };

  const onSendMessage = usePolicySetsAI(handleAiFilter);

  useEffect(() => {
  if (selCount > 0 && aiOpen) setAiOpen(false);
}, [selCount]);

  const showActionBar = isPostMVP && selCount > 0 && !aiOpen;
  const bottomPad     = (aiOpen || showActionBar) ? 72 : 24;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: bottomPad }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>Policy Sets</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Define and manage onboarding requirement groups</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setColumnDrawerOpen(true)}
            style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            ⊞ Columns
          </button>
          <button onClick={() => setShowDrawer(true)}
            style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: isAI ? C.ai : C.accent, border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            {isAI && <span>✦</span>}+ New Policy Set
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 14 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search policy sets…"
            style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.surface, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", background: C.surface, color: C.text, cursor: "pointer", outline: "none" }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
          style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", background: C.surface, color: C.text, cursor: "pointer", outline: "none" }}>
          <option value="all">All Org Levels</option>
          <option value="yes">Org Required</option>
          <option value="no">Not Org Required</option>
        </select>
        <div style={{ fontSize: 12, color: C.muted, marginLeft: "auto" }}>{rows.length} result{rows.length !== 1 ? "s" : ""}</div>
      </div>

      {/* AI filter banner */}
      {aiFilterIds && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 8, fontSize: 12, color: C.ai }}>
          <span>✦</span>
          <span><strong>AI filter active</strong> — showing {rows.length} policy set{rows.length !== 1 ? "s" : ""}. {selCount > 0 && `${selCount} selected.`}</span>
        </div>
      )}

      {/* Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <Table
          selectable onToggle={toggleRow} onToggleAll={toggleAll} selected={selected}
          defaultSortKey="name"
          cols={visibleCols}
          rows={rows} />
      </div>

      {/* Drawer */}
      <PolicySetDrawer open={showDrawer} onClose={() => setShowDrawer(false)} isPlus={isPostMVP}
        onSave={({ name, gwbrIds, tasks }: SavePayload) => {
          setData(prev => [...prev, { id: `ps-${Date.now()}`, name, orgRequired: false, activeInstances: 0, orgReqs: tasks.length, gwbrs: gwbrIds.length, status: "draft", createdBy: "You", createdAt: new Date().toISOString().split("T")[0], modifiedBy: "You", modifiedAt: new Date().toISOString().split("T")[0] }]);
          setShowDrawer(false);
        }} />

      <ColumnDrawer open={columnDrawerOpen} onClose={() => setColumnDrawerOpen(false)} cols={cols} onToggle={toggleCol} onReorder={reorder} onReset={() => reset(ALL_COLS)} />

      {/* Bottom layer */}
      {isAI && !aiOpen && (
        <BottomBar
          selCount={selCount}
          showActions={showActionBar}
          onAskAI={() => setAiOpen(true)}
          onClear={clear}
          groups={[
            { label: "Status", actions: ["active", "draft", "archived"].map(s => ({ label: s, onClick: () => handleBulkStatus(s) })) },
            { label: "",       actions: [
              { label: "Set Org Required", highlight: true, onClick: () => handleBulkOrgRequired(true) },
              { label: "Remove",           muted: true,     onClick: () => handleBulkOrgRequired(false) },
            ]},
          ]}
        />
      )}

      {isAI && (
        <AIChat
          open={aiOpen}
          onToggle={() => setAiOpen(v => !v)}
          onFilter={handleAiFilter}
          onAction={handleAiAction}
          filteredIds={aiFilterIds}
          selectedIds={selCount}
          pendingAiAction={pendingAiAction}
          onClearPending={() => setPendingAiAction(null)}
          prompts={AI_PROMPTS}
          onSendMessage={onSendMessage}
          placeholder="Ask anything about your policy sets…"
        />
      )}
    </div>
  );
}