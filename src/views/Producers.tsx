import { useState, useMemo, useEffect, useRef } from "react";
import { C, Badge } from "../theme";
import type { Producer, SavedView } from "../data";
import { useVersion, Input, ActiveFilters, FilterDrawer, Table, BulkBar, SaveViewModal } from "../components/UI";
import { AICommandBar, AIResultBanner } from "../components/AI";
import { TaskDrawer } from "../components/TaskDrawer";
import { InviteDrawer, BulkInviteDrawer } from "../components/InviteDrawers";

// ─── Filter Definitions ───────────────────────────────────────────────────────
const PROD_FILTER_DEFS = [
  { key: "classification", label: "Classification", options: ["Needs License", "Needs LOAs", "Reg Tasks Only", "Org Requirements"] },
  { key: "status",         label: "Status",         options: ["Invited", "In Progress", "Waiting/Blocked", "Completed", "Terminated"] },
  { key: "resident",       label: "Resident State", options: ["AZ","CA","CO","FL","GA","IL","MI","MN","NC","NJ","NY","OH","PA","TN","TX","WA"] },
];

// ─── Producer Detail ──────────────────────────────────────────────────────────
export function ProducerDetail({ producer: init, onBack, allProducers, setAllProducers }: {
  producer: Producer;
  onBack: () => void;
  allProducers: Producer[];
  setAllProducers: (fn: (prev: Producer[]) => Producer[]) => void;
}) {
  const version = useVersion();
  const producer = allProducers.find(p => p.id === init.id) || init;
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");

  const updateTask = (taskId: string, patch: Record<string, any>) => {
    setAllProducers(prev => prev.map(p => p.id === producer.id ? {
      ...p,
      tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t),
      activityLog: patch.status ? [{
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        event: `Task ${patch.status === "Rejected" ? "rejected" : patch.status === "Approved" ? "approved" : "updated"}`,
        detail: `${p.tasks.find(t => t.id === taskId)?.name} → ${patch.status}`,
      }, ...p.activityLog] : p.activityLog,
    } : p));
  };

  const tasks = producer.tasks;
  const done = tasks.filter(t => t.status === "Done" || t.status === "Approved").length;
  const drawerTask = drawerTaskId ? tasks.find(t => t.id === drawerTaskId) || null : null;
  const drawerIdx = drawerTaskId ? tasks.findIndex(t => t.id === drawerTaskId) : -1;
  const tabs = [{ id: "tasks", label: "Tasks" }, ...((version === "post-mvp" || version === "ai") ? [{ id: "activity", label: "Activity Log" }] : [])];

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.accentLight, cursor: "pointer", fontSize: 13, padding: 0, fontWeight: 500 }}>← Back</button>
          <span style={{ color: C.border }}>|</span>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>{producer.name}</h2>
          <Badge label={producer.status} /><Badge label={producer.classification} />
        </div>

        {/* Meta cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {([["NPN", producer.npn], ["Resident State", producer.resident], ["Invited", producer.invited], ["Last Activity", producer.lastTask]] as [string, string][]).map(([l, v]) => (
            <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}` }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ fontSize: 13, fontWeight: activeTab === t.id ? 600 : 500, color: activeTab === t.id ? C.accent : C.muted, background: "none", border: "none", borderBottom: `2px solid ${activeTab === t.id ? C.accent : "transparent"}`, padding: "8px 16px", cursor: "pointer", marginBottom: -1 }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Tasks tab */}
        {activeTab === "tasks" && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Task List</div>
              <div style={{ fontSize: 12, color: C.muted }}>{done} of {tasks.length} complete</div>
            </div>
            <div style={{ background: C.border, borderRadius: 99, height: 6, marginBottom: 12 }}>
              <div style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%`, background: C.accent, borderRadius: 99, height: 6, transition: "width .4s" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tasks.map(t => (
                <div key={t.id} onClick={() => setDrawerTaskId(t.id)}
                  style={{ background: drawerTaskId === t.id ? C.accentBg : C.bg, border: `1px solid ${drawerTaskId === t.id ? C.accent : C.border}`, borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                  onMouseEnter={e => { if (drawerTaskId !== t.id) (e.currentTarget as HTMLElement).style.borderColor = C.accent; }}
                  onMouseLeave={e => { if (drawerTaskId !== t.id) (e.currentTarget as HTMLElement).style.borderColor = C.border; }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.accentLight }}>{t.name}</span>
                      <Badge label={t.status} small />
                      <span style={{ fontSize: 11, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px" }}>{t.type}</span>
                      {t.owner === "Customer" && <span style={{ fontSize: 11, color: C.accentLight, background: C.accentBg, borderRadius: 4, padding: "1px 6px" }}>Customer-owned</span>}
                    </div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>{t.detail}</div>
                    {t.status === "Rejected" && t.rejectionNote && <div style={{ fontSize: 12, color: C.danger, marginTop: 4, background: "#fef2f2", borderRadius: 6, padding: "4px 8px", display: "inline-block" }}>↳ {t.rejectionNote}</div>}
                  </div>
                  <span style={{ fontSize: 12, color: C.muted }}>→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity tab */}
        {activeTab === "activity" && (version === "post-mvp" || version === "ai") && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Activity Log</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {producer.activityLog.map((entry, i) => (
                <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < producer.activityLog.length - 1 ? 16 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.accent, border: `2px solid ${C.accentBg}`, marginTop: 3 }} />
                    {i < producer.activityLog.length - 1 && <div style={{ width: 2, flex: 1, background: C.border, marginTop: 4 }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{entry.event}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>{entry.date}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textDim }}>{entry.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <TaskDrawer
        task={drawerTask}
        producer={producer}
        onClose={() => setDrawerTaskId(null)}
        onUpdate={patch => updateTask(drawerTaskId!, patch)}
        hasPrev={drawerIdx > 0}
        hasNext={drawerIdx < tasks.length - 1}
        onPrev={() => setDrawerTaskId(tasks[drawerIdx - 1].id)}
        onNext={() => setDrawerTaskId(tasks[drawerIdx + 1].id)} />
    </>
  );
}

// ─── Producers View ───────────────────────────────────────────────────────────
export function ProducersView({ initFilter, setDetailState, producers, setAllProducers, onSaveView }: {
  initFilter: Record<string, string[]>;
  setDetailState: (s: { producer: Producer } | null) => void;
  producers: Producer[];
  setAllProducers: (fn: (prev: Producer[]) => Producer[]) => void;
  onSaveView: (v: SavedView) => void;
}) {
  const version = useVersion();
  const isAI   = version === "ai";
  const isPlus  = version === "post-mvp" || isAI;

  const [search,         setSearch]         = useState("");
  const [applied,        setApplied]        = useState<Record<string, string[]>>(initFilter || {});
  const [pending,        setPending]        = useState<Record<string, string[]>>(initFilter || {});
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [inviteOpen,     setInviteOpen]     = useState(false);
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);
  const [inviteMenuOpen, setInviteMenuOpen] = useState(false);
  const [selected,       setSelected]       = useState<Set<number>>(new Set());
  const [saveOpen,       setSaveOpen]       = useState(false);
  const [aiCollapsed,    setAiCollapsed]    = useState(false);
  const [aiResult,       setAiResult]       = useState<any>(null);
  const inviteMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inviteMenuOpen) return;
    const h = (e: MouseEvent) => { if (inviteMenuRef.current && !inviteMenuRef.current.contains(e.target as Node)) setInviteMenuOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [inviteMenuOpen]);

  useEffect(() => {
    if (initFilter && Object.keys(initFilter).length > 0) { setApplied(initFilter); setPending(initFilter); }
  }, [initFilter]);

  const activeCount = Object.values(applied).filter(v => v?.length > 0).length;
  const hasFilters  = activeCount > 0 || search;

  const filtered = useMemo(() => producers.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.npn.includes(q))
      && (!applied.classification?.length || applied.classification.includes(p.classification))
      && (!applied.status?.length         || applied.status.includes(p.status))
      && (!applied.resident?.length       || applied.resident.includes(p.resident));
  }), [search, applied, producers]);

  const toggleOne = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (rows: Producer[]) => { const allS = rows.every(r => selected.has(r.id)); setSelected(allS ? new Set() : new Set(rows.map(r => r.id))); };
  const clearFilters = () => { setApplied({}); setPending({}); };

  const handleAIResult = (res: any) => {
    if (res.target !== "producers") return;
    const f: Record<string, string[]> = {};
    if (res.filters?.status?.length)         f.status         = res.filters.status;
    if (res.filters?.classification?.length) f.classification = res.filters.classification;
    if (res.filters?.resident?.length)       f.resident       = res.filters.resident;
    setApplied(f);
    setAiResult(res);
  };

  useEffect(() => {
    if (aiResult?.selectedAll && aiResult?.target === "producers") {
      setSelected(new Set(filtered.map(p => p.id)));
    }
  }, [filtered, aiResult]);

  const handleTerminate = () => {
    setAllProducers(prev => prev.map(p => selected.has(p.id) ? { ...p, status: "Terminated" } : p));
    setSelected(new Set()); setAiResult(null);
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>Producers</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>{filtered.length} of {producers.length} producers</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {isPlus && hasFilters && (
              <button onClick={() => setSaveOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>⊕ Save view</button>
            )}
            <button onClick={() => { setPending(applied); setFilterOpen(true); }}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: activeCount > 0 ? C.accent : C.textMed, background: activeCount > 0 ? C.accentBg : C.surface, border: `1px solid ${activeCount > 0 ? C.accent + "55" : C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
              ⚙ Filters {activeCount > 0 && <span style={{ background: C.accent, color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{activeCount}</span>}
            </button>
            <div ref={inviteMenuRef} style={{ position: "relative" }}>
              <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.accent}` }}>
                <button onClick={() => setInviteOpen(true)} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", padding: "7px 14px", cursor: "pointer", borderRight: `1px solid ${C.accentLight}` }}>+ Invite Producer</button>
                <button onClick={() => setInviteMenuOpen(v => !v)} style={{ fontSize: 12, color: "#fff", background: C.accent, border: "none", padding: "7px 10px", cursor: "pointer" }}>▾</button>
              </div>
              {inviteMenuOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 30, minWidth: 170, overflow: "hidden" }}>
                  <div onClick={() => { setInviteOpen(true); setInviteMenuOpen(false); }} style={{ padding: "10px 14px", fontSize: 13, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>👤 Invite producer</div>
                  <div style={{ height: 1, background: C.border }} />
                  <div onClick={() => { setBulkInviteOpen(true); setInviteMenuOpen(false); }} style={{ padding: "10px 14px", fontSize: 13, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>📋 Bulk invite via CSV</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input placeholder="Search by name or NPN…" value={search} onChange={setSearch} />
          <ActiveFilters filters={applied} onRemove={(k, v) => setApplied(prev => ({ ...prev, [k]: (prev[k] || []).filter(x => x !== v) }))} onClear={clearFilters} />
        </div>

        {aiResult && (
          <AIResultBanner result={aiResult} selectedCount={selected.size}
            onConfirmAction={handleTerminate}
            onSaveView={name => { onSaveView({ id: `pv${Date.now()}`, name, filters: applied, table: "producers" }); setAiResult(null); }}
            onDismiss={() => setAiResult(null)} />
        )}

        {/* Table */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <Table selectable onToggle={toggleOne} onToggleAll={toggleAll} selected={selected}
            onRow={row => setDetailState({ producer: row })}
            cols={[
              { key: "name",           label: "Producer",       render: v => <span style={{ color: C.accentLight, fontWeight: 500 }}>{v}</span> },
              { key: "npn",            label: "NPN" },
              { key: "classification", label: "Classification", render: v => <Badge label={v} /> },
              { key: "status",         label: "Status",         render: v => <Badge label={v} /> },
              { key: "resident",       label: "State" },
              { key: "invited",        label: "Invited" },
              { key: "lastTask",       label: "Last Activity" },
            ]} rows={filtered} />
        </div>

        {isPlus && <BulkBar selected={selected} onClear={() => setSelected(new Set())} actions={[
          { label: "Assign Policy Set", onClick: () => setSelected(new Set()) },
          { label: "Send Reminder",     onClick: () => setSelected(new Set()) },
          { label: "Terminate", danger: true, onClick: handleTerminate },
        ]} />}

        {isAI && <AICommandBar tableType="producers" onResult={handleAIResult} onCollapse={() => setAiCollapsed(v => !v)} collapsed={aiCollapsed} />}
      </div>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} filterDefs={PROD_FILTER_DEFS} pending={pending} setPending={setPending} onApply={f => setApplied(f)} onClear={clearFilters} />
      <InviteDrawer open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <BulkInviteDrawer open={bulkInviteOpen} onClose={() => setBulkInviteOpen(false)} />
      {saveOpen && <SaveViewModal filters={applied} onClose={() => setSaveOpen(false)} onSave={name => { onSaveView({ id: `pv${Date.now()}`, name, filters: applied, table: "producers" }); setSaveOpen(false); }} />}
    </>
  );
}
