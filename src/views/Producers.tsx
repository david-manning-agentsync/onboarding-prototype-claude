import { useState, useMemo, useEffect, useRef } from "react";
import { C, Badge } from "../theme";
import type { Producer, SavedView } from "../data";
import { useVersion } from "../components/UI";
import { TableView } from "../components/Table";
import type { ColDef, FilterDef } from "../components/Table";
import { SaveViewModal } from "../components/SaveViewModal";
import { AIChat } from "../components/AIChat";
import type { AIChatMessage, AIChatAction } from "../components/AIChat";
import { BottomBar } from "../components/BottomBar";
import { InviteDrawer, BulkInviteDrawer } from "../components/InviteDrawers";

const PROD_FILTER_DEFS: FilterDef[] = [
  { key: "classification", label: "Readiness", options: ["Needs License", "Needs LOAs", "Reg Tasks Only", "Org Requirements"] },
  { key: "status",         label: "Status",         options: ["Invited", "In Progress", "Waiting/Blocked", "Completed", "Terminated"] },
  { key: "resident",       label: "Resident State", options: ["AZ","CA","CO","FL","GA","IL","MI","MN","NC","NJ","NY","OH","PA","TN","TX","WA"] },
];

const ALL_COLS: ColDef<Producer>[] = [
  { key: "name",           label: "Producer",       render: (v) => <span style={{ color: C.accentLight, fontWeight: 500 }}>{v}</span> },
  { key: "npn",            label: "NPN" },
  { key: "classification",      label: "classification", render: (v) => <Badge label={v} />, hidden: true },
  { key: "status",         label: "Status",         render: (v) => <Badge label={v} /> },
  { key: "resident",       label: "State" },
  { key: "invited",        label: "Invited",        noSearch: true },
  { key: "lastTask",       label: "Last Activity",  noSearch: true },
];

const AI_PROMPTS = [
  "Show producers with no activity in 60 days",
  "Find all invited producers in California",
  "Filter to waiting or blocked producers needing license",
  "Show producers ready to terminate",
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
{"target":"producers","filters":{"status":[],"classification":[],"resident":[]},"action":null|"terminate"|"assign_policy_set"|"send_reminder","actionLabel":null|string,"summary":string}
Valid status: Invited, In Progress, Waiting/Blocked, Completed, Terminated
Valid classification: Needs License, Needs LOAs, Reg Tasks Only, Org Requirements
Valid resident: two-letter US state codes
summary should be a short human-readable explanation.`,
      messages: [{ role: "user", content: msg }],
    }),
  });
  const data = await res.json();
  const txt = data.content?.find((b: any) => b.type === "text")?.text || "{}";
  return JSON.parse(txt.replace(/```json|```/g, "").trim());
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
  const isAI    = version === "ai";
  const isPlus  = version === "post-mvp" || isAI;

  const [search,         setSearch]         = useState("");
  const [applied,        setApplied]        = useState<Record<string, string[]>>(initFilter || {});
  const [inviteOpen,     setInviteOpen]     = useState(false);
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);
  const [inviteMenuOpen, setInviteMenuOpen] = useState(false);
  const [selected,       setSelected]       = useState<Set<number>>(new Set());
  const [saveOpen,       setSaveOpen]       = useState(false);
  const [aiOpen,         setAiOpen]         = useState(isAI);
  const [aiFilterIds,    setAiFilterIds]    = useState<string[] | null>(null);
  const [pendingAction,  setPendingAction]  = useState<AIChatAction | null>(null);
  const inviteMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inviteMenuOpen) return;
    const h = (e: MouseEvent) => { if (inviteMenuRef.current && !inviteMenuRef.current.contains(e.target as Node)) setInviteMenuOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [inviteMenuOpen]);

  useEffect(() => {
    if (initFilter && Object.keys(initFilter).length > 0) { setApplied(initFilter); }
  }, [initFilter]);

  const filteredRows = useMemo(() => producers.filter(p =>
    (!applied.classification?.length || applied.classification.includes(p.classification))
    && (!applied.status?.length      || applied.status.includes(p.status))
    && (!applied.resident?.length    || applied.resident.includes(p.resident))
  ), [applied, producers]);

  const hasFilters = Object.values(applied).some(v => v?.length > 0) || !!search;
  const selCount   = filteredRows.filter(p => selected.has(p.id)).length;

  const toggleOne = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (rows: Producer[]) => { const allS = rows.every(r => selected.has(r.id)); setSelected(allS ? new Set() : new Set(rows.map(r => r.id))); };

  const handleAiFilter = (ids: string[] | null) => {
    setAiFilterIds(ids);
    if (ids) setSelected(new Set(ids.map(Number)));
    else { setSelected(new Set()); setPendingAction(null); }
  };

  const handleAiAction = (_action: AIChatAction) => {
    setSelected(new Set()); setAiFilterIds(null); setPendingAction(null);
  };

  const handleTerminate = () => {
    setAllProducers(prev => prev.map(p => selected.has(p.id) ? { ...p, status: "Terminated" } : p));
    setSelected(new Set());
  };

  const onSendMessage = (msg: string, addMessage: (m: AIChatMessage) => void, setLoading: (v: boolean) => void) => {
    callClaude(msg).then(res => {
      const f: Record<string, string[]> = {};
      if (res.filters?.status?.length)         f.status         = res.filters.status;
      if (res.filters?.classification?.length) f.classification = res.filters.classification;
      if (res.filters?.resident?.length)       f.resident       = res.filters.resident;
      if (Object.keys(f).length) setApplied(f);
      const action: AIChatAction | null = res.action ? { type: res.action, value: res.action, label: res.actionLabel || res.action, ids: [] } : null;
      addMessage({ role: "assistant", content: res.summary || "Done — results updated in the table.", action });
    }).catch(() => {
      addMessage({ role: "assistant", content: "Sorry, I couldn't process that. Try rephrasing." });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { if (selCount > 0 && aiOpen) setAiOpen(false); }, [selCount]);

  const showActionBar = isPlus && selCount > 0 && !aiOpen;
  const bottomPad     = (aiOpen || showActionBar) ? 72 : 24;

  const inviteAction = (
    <div ref={inviteMenuRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.accent}` }}>
        <button onClick={() => setInviteOpen(true)} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", padding: "7px 14px", cursor: "pointer", borderRight: `1px solid ${C.accentLight}` }}>+ Invite Producer</button>
        <button onClick={() => setInviteMenuOpen(v => !v)} style={{ fontSize: 12, color: "#fff", background: C.accent, border: "none", padding: "7px 10px", cursor: "pointer" }}>▾</button>
      </div>
      {inviteMenuOpen && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 30, minWidth: 170, overflow: "hidden" }}>
          <div onClick={() => { setInviteOpen(true); setInviteMenuOpen(false); }} style={{ padding: "10px 14px", fontSize: 13, color: C.text, cursor: "pointer" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>👤 Invite producer</div>
          <div style={{ height: 1, background: C.border }} />
          <div onClick={() => { setBulkInviteOpen(true); setInviteMenuOpen(false); }} style={{ padding: "10px 14px", fontSize: 13, color: C.text, cursor: "pointer" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>📋 Bulk invite via CSV</div>
        </div>
      )}
    </div>
  );

  const saveViewAction = isPlus && hasFilters ? (
    <button onClick={() => setSaveOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>⊕ Save view</button>
  ) : undefined;

  return (
    <>
      <div style={{ paddingBottom: bottomPad }}>
        <TableView
          title="Producers"
          allCols={ALL_COLS}
          rows={filteredRows}
          totalCount={producers.length}
          recordLabel="producers"
          filterDefs={PROD_FILTER_DEFS}
          search={search}
          onSearch={setSearch}
          applied={applied}
          onApply={setApplied}
          onRow={row => setDetailState({ producer: row })}
          selectable
          selected={selected as any}
          onToggle={toggleOne as any}
          onToggleAll={toggleAll as any}
          defaultSortKey="name"
          primaryAction={
            <div style={{ display: "flex", gap: 8 }}>
              {saveViewAction}
              {inviteAction}
            </div>
          }
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
              { label: "Assign Policy Set", onClick: () => setSelected(new Set()) },
              { label: "Send Reminder",     onClick: () => setSelected(new Set()) },
              { label: "Terminate",         onClick: handleTerminate },
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
          placeholder="Ask anything about your producers…"
        />
      )}

      <InviteDrawer open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <BulkInviteDrawer open={bulkInviteOpen} onClose={() => setBulkInviteOpen(false)} />
      {saveOpen && <SaveViewModal filters={applied} onClose={() => setSaveOpen(false)} onSave={name => { onSaveView({ id: `pv${Date.now()}`, name, filters: applied, table: "producers" }); setSaveOpen(false); }} />}
    </>
  );
}