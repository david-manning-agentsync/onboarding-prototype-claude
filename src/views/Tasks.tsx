import { useState, useMemo, useEffect } from "react";
import { C, Badge } from "../theme";
import type { Producer, SavedView } from "../data";
import { useVersion, Input, ActiveFilters, FilterDrawer, Table, BulkBar, SaveViewModal } from "../components/UI";
import { AICommandBar, AIResultBanner } from "../components/AI";
import { TaskDrawer } from "../components/TaskDrawer";

// ─── Filter Definitions ───────────────────────────────────────────────────────
const TASK_FILTER_DEFS = [
  { key: "status",         label: "Task Status",             options: ["Open", "Needs Approval", "Approved", "Rejected", "Done"] },
  { key: "type",           label: "Task Type",               options: ["Org", "Regulatory"] },
  { key: "owner",          label: "Owner",                   options: ["Producer", "Customer"] },
  { key: "classification", label: "Producer Classification", options: ["Needs License", "Needs LOAs", "Reg Tasks Only", "Org Requirements"] },
  { key: "producerStatus", label: "Producer Status",         options: ["Invited", "In Progress", "Waiting/Blocked", "Completed", "Terminated"] },
];

// ─── Tasks View ───────────────────────────────────────────────────────────────
export function TasksView({ producers, setAllProducers, initFilter, onSaveView }: {
  producers: Producer[];
  setAllProducers: (fn: (prev: Producer[]) => Producer[]) => void;
  initFilter: Record<string, string[]>;
  onSaveView: (v: SavedView) => void;
}) {
  const version = useVersion();
  const isAI  = version === "ai";
  const isPlus = version === "post-mvp" || isAI;

  const [search,      setSearch]      = useState("");
  const [applied,     setApplied]     = useState<Record<string, string[]>>(initFilter || {});
  const [pending,     setPending]     = useState<Record<string, string[]>>(initFilter || {});
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [drawerTask,  setDrawerTask]  = useState<any>(null);
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [saveOpen,    setSaveOpen]    = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [aiResult,    setAiResult]    = useState<any>(null);

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

  const activeCount = Object.values(applied).filter(v => v?.length > 0).length;
  const hasFilters  = activeCount > 0 || search;
  const clearFilters = () => { setApplied({}); setPending({}); };

  const toggleOne = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (rows: any[]) => { const allS = rows.every(r => selected.has(r.id)); setSelected(allS ? new Set() : new Set(rows.map(r => r.id))); };

  const handleAIResult = (res: any) => {
    if (res.target !== "tasks") return;
    const f: Record<string, string[]> = {};
    if (res.filters?.status?.length) f.status = res.filters.status;
    if (res.filters?.type?.length)   f.type   = res.filters.type;
    if (res.filters?.owner?.length)  f.owner  = res.filters.owner;
    setApplied(f);
    setAiResult(res);
  };

  useEffect(() => {
    if (aiResult?.selectedAll && aiResult?.target === "tasks") {
      setSelected(new Set(filtered.map(t => t.id)));
    }
  }, [filtered, aiResult]);

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

  const drawerIdx = drawerTask ? filtered.findIndex(t => t.id === drawerTask.id) : -1;
  const navigateTo = (idx: number) => {
    const t = filtered[idx];
    const prod = producers.find(p => p.id === t.producerId) || null;
    setDrawerTask({ ...t, _producer: prod });
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            <button onClick={() => { setPending(applied); setFilterOpen(true); }}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: activeCount > 0 ? C.accent : C.textMed, background: activeCount > 0 ? C.accentBg : C.surface, border: `1px solid ${activeCount > 0 ? C.accent + "55" : C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
              ⚙ Filters {activeCount > 0 && <span style={{ background: C.accent, color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{activeCount}</span>}
            </button>
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input placeholder="Search by task, producer name, or NPN…" value={search} onChange={setSearch} />
          <ActiveFilters filters={applied} onRemove={(k, v) => setApplied(prev => ({ ...prev, [k]: (prev[k] || []).filter(x => x !== v) }))} onClear={clearFilters} />
        </div>

        {aiResult && (
          <AIResultBanner result={aiResult} selectedCount={selected.size}
            onConfirmAction={() => { setSelected(new Set()); setAiResult(null); }}
            onSaveView={name => { onSaveView({ id: `tv${Date.now()}`, name, filters: applied, table: "tasks" }); setAiResult(null); }}
            onDismiss={() => setAiResult(null)} />
        )}

        {/* Table */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <Table activeId={drawerTask?.id} selectable onToggle={toggleOne} onToggleAll={toggleAll} selected={selected} onRow={handleRowClick}
            cols={[
              { key: "name",           label: "Task",           render: v => <span style={{ color: C.accentLight, fontWeight: 500 }}>{v}</span> },
              { key: "producerName",   label: "Producer" },
              { key: "producerNPN",    label: "NPN" },
              { key: "classification", label: "Classification", render: v => <Badge label={v} small /> },
              { key: "status",         label: "Status",         render: v => <Badge label={v} /> },
              { key: "type",           label: "Type",           render: v => <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px" }}>{v}</span> },
              { key: "owner",          label: "Owner" },
            ]} rows={filtered} />
        </div>

        {isPlus && <BulkBar selected={selected} onClear={() => setSelected(new Set())} actions={[
          { label: "Approve Selected", onClick: () => setSelected(new Set()) },
          { label: "Reject Selected",  danger: true, onClick: () => setSelected(new Set()) },
        ]} />}

        {isAI && <AICommandBar tableType="tasks" onResult={handleAIResult} onCollapse={() => setAiCollapsed(v => !v)} collapsed={aiCollapsed} />}
      </div>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} filterDefs={TASK_FILTER_DEFS} pending={pending} setPending={setPending} onApply={f => setApplied(f)} onClear={clearFilters} />

      {drawerTask && (
        <TaskDrawer
          task={drawerTask}
          producer={drawerTask._producer}
          onClose={() => setDrawerTask(null)}
          onUpdate={handleUpdate}
          hasPrev={drawerIdx > 0}
          hasNext={drawerIdx < filtered.length - 1}
          onPrev={() => navigateTo(drawerIdx - 1)}
          onNext={() => navigateTo(drawerIdx + 1)} />
      )}

      {saveOpen && <SaveViewModal filters={applied} onClose={() => setSaveOpen(false)} onSave={name => { onSaveView({ id: `tv${Date.now()}`, name, filters: applied, table: "tasks" }); setSaveOpen(false); }} />}
    </>
  );
}
