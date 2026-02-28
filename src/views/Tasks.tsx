import { useState, useMemo, useEffect } from "react";
import { C, Badge } from "../theme";
import type { Producer, SavedView } from "../data";
import { useVersion, ActiveFilters } from "../components/UI";
import { SearchBar } from "../components/SearchBar";
import { FilterDrawer } from "../components/FilterDrawer";
import { Table } from "../components/Table";
import { SaveViewModal } from "../components/SaveViewModal";
import { AIChat } from "../components/AIChat";
import type { AIChatMessage, AIChatAction } from "../components/AIChat";
import { BottomBar } from "../components/BottomBar";
import { TaskDrawer } from "../components/TaskDrawer";
import { ColumnDrawer } from "../components/ColumnDrawer";
import { useColumnManager } from "../hooks/useColumnManager";

const TASK_FILTER_DEFS = [
  { key: "status",         label: "Task Status",             options: ["Open", "Needs Approval", "Approved", "Rejected", "Done"] },
  { key: "type",           label: "Task Type",               options: ["Org", "Regulatory"] },
  { key: "owner",          label: "Owner",                   options: ["Producer", "Customer"] },
  { key: "classification", label: "Producer Classification", options: ["Needs License", "Needs LOAs", "Reg Tasks Only", "Org Requirements"] },
  { key: "producerStatus", label: "Producer Status",         options: ["Invited", "In Progress", "Waiting/Blocked", "Completed", "Terminated"] },
];

const AI_PROMPTS = [
  "Create a view of all open regulatory tasks",
  "Show tasks waiting for approval",
  "Find all rejected tasks across producers",
  "Show customer-owned tasks that are overdue",
];

async function callClaude(msg: string): Promise<any> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are an AI assistant in an insurance producer onboarding platform.
Return JSON only — no prose, no markdown fences.
{"target":"tasks","filters":{"status":[],"type":[],"owner":[]},"action":null|"approve"|"reject","actionLabel":null|string,"summary":string}
Valid task status: Open, Needs Approval, Approved, Rejected, Done
Valid task type: Org, Regulatory
Valid task owner: Producer, Customer
summary should be a short human-readable explanation.`,
      messages: [{ role: "user", content: msg }],
    }),
  });
  const data = await res.json();
  const txt = data.content?.find((b: any) => b.type === "text")?.text || "{}";
  return JSON.parse(txt.replace(/```json|```/g, "").trim());
}

// ─── Tasks View ───────────────────────────────────────────────────────────────
export function TasksView({ producers, setAllProducers, initFilter, onSaveView }: {
  producers: Producer[];
  setAllProducers: (fn: (prev: Producer[]) => Producer[]) => void;
  initFilter: Record<string, string[]>;
  onSaveView: (v: SavedView) => void;
}) {
  const version = useVersion();
  const isAI   = version === "ai";
  const isPlus  = version === "post-mvp" || isAI;

  const [search,        setSearch]        = useState("");
  const [applied,       setApplied]       = useState<Record<string, string[]>>(initFilter || {});
  const [pending,       setPending]       = useState<Record<string, string[]>>(initFilter || {});
  const [filterOpen,    setFilterOpen]    = useState(false);
  const [drawerTask,    setDrawerTask]    = useState<any>(null);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [saveOpen,      setSaveOpen]      = useState(false);
  const [aiOpen,        setAiOpen]        = useState(isAI);
  const [aiFilterIds,   setAiFilterIds]   = useState<string[] | null>(null);
  const [pendingAction, setPendingAction] = useState<AIChatAction | null>(null);
  const [columnDrawerOpen, setColumnDrawerOpen] = useState(false);

  useEffect(() => {
    if (initFilter && Object.keys(initFilter).length > 0) { setApplied(initFilter); setPending(initFilter); }
  }, [initFilter]);

  const allTasks = useMemo(() => producers.flatMap(p =>
    p.tasks.map(t => ({ ...t, producerId: p.id, producerName: p.name, producerNPN: p.npn, classification: p.classification, producerStatus: p.status }))
  ), [producers]);

  const filtered = useMemo(() => allTasks.filter(t => {
    const q = search.toLowerCase();
    return (!q || t.name.toLowerCase().includes(q) || t.producerName.toLowerCase().includes(q) || t.producerNPN.includes(q))
      && (!applied.status?.length         || applied.status.includes(t.status))
      && (!applied.type?.length           || applied.type.includes(t.type))
      && (!applied.owner?.length          || applied.owner.includes(t.owner))
      && (!applied.classification?.length || applied.classification.includes(t.classification))
      && (!applied.producerStatus?.length || applied.producerStatus.includes(t.producerStatus));
  }), [allTasks, search, applied]);

  const activeCount  = Object.values(applied).filter(v => v?.length > 0).length;
  const hasFilters   = activeCount > 0 || !!search;
  const selCount     = filtered.filter(t => selected.has(t.id)).length;
  const clearFilters = () => { setApplied({}); setPending({}); };

  const toggleOne = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (rows: any[]) => { const allS = rows.every(r => selected.has(r.id)); setSelected(allS ? new Set() : new Set(rows.map(r => r.id))); };

  const handleAiFilter = (ids: string[] | null) => {
    setAiFilterIds(ids);
    if (ids) setSelected(new Set(ids));
    else { setSelected(new Set()); setPendingAction(null); }
  };

  const handleAiAction = (_action: AIChatAction) => {
    setSelected(new Set()); setAiFilterIds(null); setPendingAction(null);
  };

  const handleUpdate = (patch: Record<string, any>) => {
    setAllProducers(prev => prev.map(p =>
      p.id === drawerTask.producerId
        ? { ...p, tasks: p.tasks.map(t => t.id === drawerTask.id ? { ...t, ...patch } : t) }
        : p
    ));
    setDrawerTask((prev: any) => ({ ...prev, ...patch }));
  };

  const handleRowClick = (row: any) => {
    const prod = producers.find(p => p.id === row.producerId) || null;
    setDrawerTask({ ...row, _producer: prod });
  };

  const onSendMessage = (msg: string, addMessage: (m: AIChatMessage) => void, setLoading: (v: boolean) => void) => {
    callClaude(msg).then(res => {
      const f: Record<string, string[]> = {};
      if (res.filters?.status?.length) f.status = res.filters.status;
      if (res.filters?.type?.length)   f.type   = res.filters.type;
      if (res.filters?.owner?.length)  f.owner  = res.filters.owner;
      if (Object.keys(f).length) setApplied(f);
      const action: AIChatAction | null = res.action ? { type: res.action, value: res.action, label: res.actionLabel || res.action, ids: [] } : null;
      addMessage({ role: "assistant", content: res.summary || "Done — results updated in the table.", action });
    }).catch(() => {
      addMessage({ role: "assistant", content: "Sorry, I couldn't process that. Try rephrasing." });
    }).finally(() => setLoading(false));
  };

  const drawerIdx = drawerTask ? filtered.findIndex(t => t.id === drawerTask.id) : -1;
  const navigateTo = (idx: number) => {
    const t = filtered[idx];
    const prod = producers.find(p => p.id === t.producerId) || null;
    setDrawerTask({ ...t, _producer: prod });
  };

  useEffect(() => {
  if (selCount > 0 && aiOpen) setAiOpen(false);
}, [selCount]);

  const showActionBar = isPlus && selCount > 0 && !aiOpen;
  const bottomPad     = (aiOpen || showActionBar) ? 72 : 24;

  const ALL_COLS = [
    { key: "name",           label: "Task",           render: (v: any) => <span style={{ color: C.accentLight, fontWeight: 500 }}>{v}</span> },
    { key: "producerName",   label: "Producer" },
    { key: "producerNPN",    label: "NPN" },
    { key: "classification", label: "Classification", render: (v: any) => <Badge label={v} small /> },
    { key: "status",         label: "Status",         render: (v: any) => <Badge label={v} /> },
    { key: "type",           label: "Type",           render: (v: any) => <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px" }}>{v}</span> },
    { key: "owner",          label: "Owner" },
  ];
  const { visibleCols, cols, toggleCol, reorder, reset } = useColumnManager(ALL_COLS);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: bottomPad }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>Tasks</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>{filtered.length} of {allTasks.length} tasks</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {isPlus && hasFilters && (
              <button onClick={() => setSaveOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>⊕ Save view</button>
            )}
            <button onClick={() => setColumnDrawerOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: C.textMed, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
              ⊞ Columns
            </button>
            <button onClick={() => { setPending(applied); setFilterOpen(true); }}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: activeCount > 0 ? C.accent : C.textMed, background: activeCount > 0 ? C.accentBg : C.surface, border: `1px solid ${activeCount > 0 ? C.accent + "55" : C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
              ⚙ Filters {activeCount > 0 && <span style={{ background: C.accent, color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{activeCount}</span>}
            </button>
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SearchBar placeholder="Search by task, producer name, or NPN…" value={search} onChange={setSearch} />
          <ActiveFilters filters={applied} onRemove={(k, v) => setApplied(prev => ({ ...prev, [k]: (prev[k] || []).filter(x => x !== v) }))} onClear={clearFilters} />
        </div>

        {/* Table */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <Table activeId={drawerTask?.id} selectable onToggle={toggleOne} onToggleAll={toggleAll} selected={selected} onRow={handleRowClick}
            cols={visibleCols} rows={filtered} />
        </div>
      </div>

      {/* Bottom layer */}
      {isAI && !aiOpen && (
        <BottomBar
          selCount={selCount}
          showActions={showActionBar}
          onAskAI={() => setAiOpen(true)}
          onClear={() => setSelected(new Set())}
          groups={[
            { label: "", actions: [
              { label: "Approve Selected", onClick: () => setSelected(new Set()) },
              { label: "Reject Selected",  muted: true, onClick: () => setSelected(new Set()) },
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
          pendingAiAction={pendingAction}
          onClearPending={() => setPendingAction(null)}
          prompts={AI_PROMPTS}
          onSendMessage={onSendMessage}
          placeholder="Ask anything about your tasks…"
        />
      )}

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} filterDefs={TASK_FILTER_DEFS} pending={pending} setPending={setPending} onApply={f => setApplied(f)} onClear={clearFilters} />

      <ColumnDrawer open={columnDrawerOpen} onClose={() => setColumnDrawerOpen(false)} cols={cols} onToggle={toggleCol} onReorder={reorder} onReset={reset} />

      {drawerTask && (
        <TaskDrawer
          task={drawerTask} producer={drawerTask._producer}
          onClose={() => setDrawerTask(null)}
          onUpdate={handleUpdate}
          hasPrev={drawerIdx > 0} hasNext={drawerIdx < filtered.length - 1}
          onPrev={() => navigateTo(drawerIdx - 1)}
          onNext={() => navigateTo(drawerIdx + 1)} />
      )}

      {saveOpen && <SaveViewModal filters={applied} onClose={() => setSaveOpen(false)} onSave={name => { onSaveView({ id: `tv${Date.now()}`, name, filters: applied, table: "tasks" }); setSaveOpen(false); }} />}
    </>
  );
}