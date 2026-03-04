import { useState, useMemo, useEffect } from "react";
import { C, Badge } from "../theme";
import type { Producer, SavedView } from "../data";
import { useVersion } from "../components/UI";
import { TableView } from "../components/Table";
import type { ColDef, FilterDef } from "../components/Table";
import { SaveViewModal } from "../components/SaveViewModal";
import { AIChat } from "../components/AIChat";
import type { AIChatMessage, AIChatAction } from "../components/AIChat";
import { BottomBar } from "../components/BottomBar";
import { TaskDrawer } from "../components/TaskDrawer";

const TASK_FILTER_DEFS: FilterDef[] = [
  { key: "status",         label: "Task Status",             options: ["Open", "Needs Approval", "Approved", "Rejected", "Done"] },
  { key: "type",           label: "Task Type",               options: ["Org", "Regulatory"] },
  { key: "owner",          label: "Owner",                   options: ["Producer", "Customer"] },
  { key: "classification", label: "Producer Classification", options: ["Needs License", "Needs LOAs", "Reg Tasks Only", "Org Requirements"] },
  { key: "producerStatus", label: "Producer Status",         options: ["Invited", "In Progress", "Waiting/Blocked", "Completed", "Terminated"] },
];

// producerNPN is useful to search; producerStatus/classification are filter-only
const ALL_COLS: ColDef[] = [
  { key: "name",           label: "Task",           render: (v) => <span style={{ color: C.accentLight, fontWeight: 500 }}>{v}</span> },
  { key: "producerName",   label: "Producer" },
  { key: "producerNPN",    label: "NPN" },
  { key: "classification", label: "Classification", render: (v) => <Badge label={v} small /> },
  { key: "status",         label: "Status",         render: (v) => <Badge label={v} /> },
  { key: "type",           label: "Type",           render: (v) => <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px" }}>{v}</span> },
  { key: "owner",          label: "Owner" },
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
  const isAI    = version === "ai";
  const isPlus  = version === "post-mvp" || isAI;

  const [search,        setSearch]        = useState("");
  const [applied,       setApplied]       = useState<Record<string, string[]>>(initFilter || {});
  const [drawerTask,    setDrawerTask]    = useState<any>(null);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [saveOpen,      setSaveOpen]      = useState(false);
  const [aiOpen,        setAiOpen]        = useState(isAI);
  const [aiFilterIds,   setAiFilterIds]   = useState<string[] | null>(null);
  const [pendingAction, setPendingAction] = useState<AIChatAction | null>(null);

  useEffect(() => {
    if (initFilter && Object.keys(initFilter).length > 0) { setApplied(initFilter); }
  }, [initFilter]);

  const allTasks = useMemo(() => producers.flatMap(p =>
    p.tasks.map(t => ({ ...t, producerId: p.id, producerName: p.name, producerNPN: p.npn, classification: p.classification, producerStatus: p.status }))
  ), [producers]);

  // Search handled by TableView — only apply filter logic here
  const filteredRows = useMemo(() => allTasks.filter(t =>
    (!applied.status?.length         || applied.status.includes(t.status))
    && (!applied.type?.length        || applied.type.includes(t.type))
    && (!applied.owner?.length       || applied.owner.includes(t.owner))
    && (!applied.classification?.length || applied.classification.includes(t.classification))
    && (!applied.producerStatus?.length || applied.producerStatus.includes(t.producerStatus))
  ), [allTasks, applied]);

  const hasFilters = Object.values(applied).some(v => v?.length > 0) || !!search;
  const selCount   = filteredRows.filter(t => selected.has(t.id)).length;

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

  const drawerIdx  = drawerTask ? filteredRows.findIndex(t => t.id === drawerTask.id) : -1;
  const navigateTo = (idx: number) => {
    const t = filteredRows[idx];
    const prod = producers.find(p => p.id === t.producerId) || null;
    setDrawerTask({ ...t, _producer: prod });
  };

  useEffect(() => { if (selCount > 0 && aiOpen) setAiOpen(false); }, [selCount]);

  const showActionBar = isPlus && selCount > 0 && !aiOpen;
  const bottomPad     = (aiOpen || showActionBar) ? 72 : 24;

  const saveViewAction = isPlus && hasFilters ? (
    <button onClick={() => setSaveOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>⊕ Save view</button>
  ) : undefined;

  return (
    <>
      <div style={{ paddingBottom: bottomPad }}>
        <TableView
          title="Tasks"
          allCols={ALL_COLS}
          rows={filteredRows}
          totalCount={allTasks.length}
          recordLabel="tasks"
          filterDefs={TASK_FILTER_DEFS}
          search={search}
          onSearch={setSearch}
          applied={applied}
          onApply={setApplied}
          onRow={handleRowClick}
          activeId={drawerTask?.id}
          selectable
          selected={selected as any}
          onToggle={toggleOne as any}
          onToggleAll={toggleAll as any}
          defaultSortKey="name"
          primaryAction={saveViewAction}
        />
      </div>

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

      {drawerTask && (
        <TaskDrawer
          task={drawerTask} producer={drawerTask._producer}
          onClose={() => setDrawerTask(null)}
          onUpdate={handleUpdate}
          hasPrev={drawerIdx > 0} hasNext={drawerIdx < filteredRows.length - 1}
          onPrev={() => navigateTo(drawerIdx - 1)}
          onNext={() => navigateTo(drawerIdx + 1)} />
      )}

      {saveOpen && <SaveViewModal filters={applied} onClose={() => setSaveOpen(false)} onSave={name => { onSaveView({ id: `tv${Date.now()}`, name, filters: applied, table: "tasks" }); setSaveOpen(false); }} />}
    </>
  );
}