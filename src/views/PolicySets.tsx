import { useState, useRef, useEffect } from "react";
import { C } from "../theme";
import { useVersion } from "../components/UI";
import { PolicySetDrawer } from "../components/PolicySetDrawer";

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

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const monthsAgo = (d: string, n: number) => { const t = new Date(d), c = new Date(); c.setMonth(c.getMonth() - n); return t < c; };

// ─── Badge ────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  return <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 99, padding: "2px 8px", textTransform: "capitalize" }}>{status}</span>;
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} style={{ cursor: "pointer", width: 15, height: 15, accentColor: C.accent }} />;
}

// ─── Table Header Cell ────────────────────────────────────────────────────────
function Th({ children, sortKey, sortState, onSort }: { children: React.ReactNode; sortKey?: string; sortState: { key: string; dir: string }; onSort: (k: string) => void }) {
  const active = sortState?.key === sortKey;
  return (
    <th onClick={() => sortKey && onSort(sortKey)}
      style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap", cursor: sortKey ? "pointer" : "default", userSelect: "none", background: C.bg, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 2 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {children}
        {sortKey && <span style={{ opacity: active ? 1 : 0.3, fontSize: 10 }}>{active && sortState.dir === "asc" ? "▲" : "▼"}</span>}
      </span>
    </th>
  );
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function AIChat({ open, onToggle, onFilter, onAction, filteredIds, selectedIds, pendingAiAction, onClearPending }: {
  open: boolean; onToggle: () => void; onFilter: (ids: string[] | null) => void;
  onAction: (a: any) => void; filteredIds: string[] | null;
  selectedIds: number; pendingAiAction: any; onClearPending: () => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current && selectedIds > 0) {
      const content = pendingAiAction
        ? `Welcome back — you have **${selectedIds} policy set${selectedIds !== 1 ? "s" : ""}** selected. Would you like to proceed with: **${pendingAiAction.label}**?`
        : `Welcome back — you now have **${selectedIds} policy set${selectedIds !== 1 ? "s" : ""}** selected. What would you like to do with them?`;
      const msg = { role: "assistant", content, action: pendingAiAction || null };
      setMessages(prev => [...prev.filter(m => !m.content.startsWith("Welcome back")), msg]);
    }
    prevOpen.current = open;
  }, [open, selectedIds, pendingAiAction]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 850));

    let reply = "", action = null;
    const lower = msg.toLowerCase();

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
      reply = ids.length ? `Found **${ids.length} draft** policy sets created before 2024. Consider activating or archiving stale drafts.` : "No draft policy sets found created before 2024.";
    } else if (lower.includes("active") && lower.includes("most")) {
      const sorted = [...SEED].filter(s => s.status === "active").sort((a, b) => b.activeInstances - a.activeInstances).slice(0, 3);
      onFilter(sorted.map(s => s.id));
      reply = `Top active policy sets by producer count:\n\n1. **Licensed P&C Producer** – 142\n2. **Life & Health Producer** – 89\n3. **Unlicensed – Needs Resident License** – 24`;
    } else {
      reply = `I searched your policy sets for "${msg}". Try one of the suggested prompts, or ask me to filter by usage, missing GWBRs, or status.`;
    }

    setMessages(prev => [...prev, { role: "assistant", content: reply, action }]);
    setLoading(false);
  };

  const executeAction = (action: any) => {
    onAction(action);
    onClearPending();
    setMessages(prev => [...prev, { role: "assistant", content: `✓ Done — ${action.label} completed successfully.` }]);
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 520, zIndex: 50, display: "flex", flexDirection: "column", background: C.surface, borderRadius: "16px 16px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)", border: `1px solid ${C.aiBorder}`, borderBottom: "none", maxHeight: 460 }}>
      <div onClick={onToggle} style={{ padding: "12px 18px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: `1px solid ${C.aiBorder}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, color: C.ai }}>✦</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.ai }}>AI Assistant</span>
          {filteredIds && <span style={{ fontSize: 11, color: C.ai, background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 99, padding: "1px 8px" }}>Filter active</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {filteredIds && (
            <button onClick={e => { e.stopPropagation(); onFilter(null); }}
              style={{ fontSize: 11, color: C.muted, background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>
              Clear filter
            </button>
          )}
          <span style={{ fontSize: 11, color: C.muted }}>▼ Collapse</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Try asking</div>
            {AI_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                style={{ textAlign: "left", fontSize: 12, color: C.ai, background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
                {p}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "88%", fontSize: 13, lineHeight: 1.6, padding: "9px 13px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? C.ai : C.aiBg, color: m.role === "user" ? "#fff" : C.text, border: m.role === "assistant" ? `1px solid ${C.aiBorder}` : "none" }}>
              {m.content.split("\n").map((line: string, j: number, arr: string[]) => (
                <span key={j}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}{j < arr.length - 1 && <br />}</span>
              ))}
            </div>
            {m.action && (
              <button onClick={() => executeAction(m.action)}
                style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: C.ai, border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
                ✦ {m.action.label}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "8px 12px", background: C.aiBg, borderRadius: 12, width: "fit-content", border: `1px solid ${C.aiBorder}` }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.ai, animation: `bounce 1s ease-in-out ${i*0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 14px 14px", flexShrink: 0, borderTop: `1px solid ${C.aiBorder}` }}>
        <div style={{ display: "flex", gap: 8 }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
            placeholder="Ask anything about your policy sets…" rows={1}
            style={{ flex: 1, resize: "none", border: `1px solid ${C.aiBorder}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit", background: C.aiBg }} />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            style={{ padding: "9px 14px", background: input.trim() && !loading ? C.ai : C.muted, color: "#fff", border: "none", borderRadius: 10, cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600 }}>
            ↑
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function PolicySets() {
  const version = useVersion();
  const isAI      = version === "ai";
  const isPostMVP = version === "post-mvp" || isAI;

  const [data,            setData]            = useState(SEED);
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [orgFilter,       setOrgFilter]       = useState("all");
  const [selected,        setSelected]        = useState<Set<string>>(new Set());
  const [sort,            setSort]            = useState({ key: "name", dir: "asc" });
  const [aiOpen,          setAiOpen]          = useState(isAI);
  const [aiFilterIds,     setAiFilterIds]     = useState<string[] | null>(null);
  const [pendingAiAction, setPendingAiAction] = useState<any>(null);
  const [showDrawer,      setShowDrawer]      = useState(false);

  const handleSort = (k: string) => setSort(prev => ({ key: k, dir: prev.key === k && prev.dir === "asc" ? "desc" : "asc" }));

  let rows = data.filter(r => {
    if (aiFilterIds && !aiFilterIds.includes(r.id)) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (orgFilter === "yes" && !r.orgRequired) return false;
    if (orgFilter === "no" && r.orgRequired) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  rows = [...rows].sort((a: any, b: any) => {
    let av = a[sort.key], bv = b[sort.key];
    if (typeof av === "boolean") { av = av ? 1 : 0; bv = bv ? 1 : 0; }
    if (typeof av === "number") return sort.dir === "asc" ? av - bv : bv - av;
    return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const allSelected = rows.length > 0 && rows.every(r => selected.has(r.id));
  const someSelected = rows.some(r => selected.has(r.id));
  const selCount = [...selected].filter(id => rows.find(r => r.id === id)).length;

  const toggleAll = () => {
    if (allSelected) setSelected(prev => { const n = new Set(prev); rows.forEach(r => n.delete(r.id)); return n; });
    else setSelected(prev => { const n = new Set(prev); rows.forEach(r => n.add(r.id)); return n; });
  };
  const toggleRow = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleAiFilter = (ids: string[] | null) => {
    setAiFilterIds(ids);
    if (ids) setSelected(new Set(ids));
    else { setSelected(new Set()); setPendingAiAction(null); }
  };

  const handleAiAction = ({ type, value, ids }: { type: string; value: any; ids: string[] }) => {
    setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, [type]: value } : r));
    setSelected(new Set());
    setAiFilterIds(null);
    setPendingAiAction(null);
  };

  const handleBulkStatus = (status: string) => {
    const ids = [...selected].filter(id => rows.find(r => r.id === id));
    setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
    setSelected(new Set());
    setPendingAiAction(null);
  };

  const handleBulkOrgRequired = (val: boolean) => {
    const ids = [...selected].filter(id => rows.find(r => r.id === id));
    setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, orgRequired: val } : r));
    setSelected(new Set());
    setPendingAiAction(null);
  };

  const showActionBar = isPostMVP && selCount > 0 && !aiOpen;
  const bottomPad = (aiOpen || showActionBar) ? 72 : 24;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: bottomPad }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>Policy Sets</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Define and manage onboarding requirement groups</p>
        </div>
        <button onClick={() => setShowDrawer(true)}
          style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: isAI ? C.ai : C.accent, border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
          {isAI && <span>✦</span>}+ New Policy Set
        </button>
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
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {isPostMVP && (
                  <th style={{ padding: "10px 14px", background: C.bg, borderBottom: `1px solid ${C.border}`, width: 36, position: "sticky", top: 0, zIndex: 2 }}>
                    <Checkbox checked={allSelected} indeterminate={!allSelected && someSelected} onChange={toggleAll} />
                  </th>
                )}
                <Th sortKey="name"            sortState={sort} onSort={handleSort}>Name</Th>
                <Th sortKey="orgRequired"     sortState={sort} onSort={handleSort}>Org Required</Th>
                <Th sortKey="activeInstances" sortState={sort} onSort={handleSort}>Active Instances</Th>
                <Th sortKey="orgReqs"         sortState={sort} onSort={handleSort}>Org Reqs</Th>
                <Th sortKey="gwbrs"           sortState={sort} onSort={handleSort}>GWBRs</Th>
                <Th sortKey="status"          sortState={sort} onSort={handleSort}>Status</Th>
                <Th sortKey="createdBy"       sortState={sort} onSort={handleSort}>Created By</Th>
                <Th sortKey="createdAt"       sortState={sort} onSort={handleSort}>Created</Th>
                <Th sortKey="modifiedBy"      sortState={sort} onSort={handleSort}>Modified By</Th>
                <Th sortKey="modifiedAt"      sortState={sort} onSort={handleSort}>Modified</Th>
                <th style={{ padding: "10px 14px", background: C.bg, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 2 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isSel = selected.has(r.id);
                const isHl  = aiFilterIds?.includes(r.id);
                return (
                  <tr key={r.id}
                    style={{ background: isSel ? C.accentBg : isHl ? C.aiBg : i % 2 === 0 ? C.surface : C.bg, transition: "background .1s" }}
                    onMouseEnter={e => { if (!isSel && !isHl) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSel ? C.accentBg : isHl ? C.aiBg : i % 2 === 0 ? C.surface : C.bg; }}>
                    {isPostMVP && (
                      <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
                        <Checkbox checked={isSel} indeterminate={false} onChange={() => toggleRow(r.id)} />
                      </td>
                    )}
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        {isHl && <span style={{ fontSize: 10, color: C.ai }}>✦</span>}
                        {r.name}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "center" }}>
                      {r.orgRequired ? <span style={{ fontSize: 12, color: C.success }}>✓ Yes</span> : <span style={{ fontSize: 12, color: C.muted }}>—</span>}
                    </td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "center", color: r.activeInstances > 0 ? C.text : C.muted, fontWeight: r.activeInstances > 0 ? 600 : 400 }}>
                      {r.activeInstances || "0"}
                    </td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "center", color: C.textMed }}>{r.orgReqs}</td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, textAlign: "center", color: r.gwbrs > 0 ? C.textMed : C.muted }}>{r.gwbrs || "—"}</td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}` }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, color: C.textDim, whiteSpace: "nowrap" }}>{r.createdBy}</td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, color: C.textDim, whiteSpace: "nowrap" }}>{fmtDate(r.createdAt)}</td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, color: C.textDim, whiteSpace: "nowrap" }}>{r.modifiedBy}</td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}`, color: C.textDim, whiteSpace: "nowrap" }}>{fmtDate(r.modifiedAt)}</td>
                    <td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
                      <button style={{ fontSize: 14, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>···</button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={isPostMVP ? 12 : 11} style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>No policy sets match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PolicySetDrawer */}
      <PolicySetDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        isPlus={isPostMVP}
        onSave={({ name, gwbrIds, states, products, tasks }) => {
          const id = `ps-${Date.now()}`;
          setData(prev => [...prev, {
            id,
            name,
            orgRequired: false,
            activeInstances: 0,
            orgReqs: tasks.length,
            gwbrs: gwbrIds.length,
            status: "draft",
            createdBy: "You",
            createdAt: new Date().toISOString().split("T")[0],
            modifiedBy: "You",
            modifiedAt: new Date().toISOString().split("T")[0],
          }]);
          setShowDrawer(false);
        }}
      />

      {/* ── Fixed bottom layer ── */}
      {isAI && !aiOpen && (
        <div style={{
          position: "fixed", bottom: 0,
          ...(showActionBar
            ? { left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 1200 }
            : { left: "50%", transform: "translateX(-50%)", width: "auto" }
          ),
          display: "flex", alignItems: "stretch",
          zIndex: 40, borderRadius: "12px 12px 0 0", overflow: "hidden",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
        }}>
          <button onClick={() => setAiOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", background: "#5b21b6", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0, borderRight: showActionBar ? "1px solid #7c3aed" : "none", borderRadius: "12px 12px 0 0" }}>
            <span style={{ fontSize: 14 }}>✦</span> Ask AI
          </button>

          {showActionBar && (
            <div style={{ flex: 1, background: "#111827", padding: "0 20px", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{selCount} selected</span>
              <div style={{ width: 1, height: 18, background: "#374151", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>Status:</span>
              {["active", "draft", "archived"].map(s => (
                <button key={s} onClick={() => handleBulkStatus(s)}
                  style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#1f2937", border: "1px solid #374151", borderRadius: 7, padding: "5px 10px", cursor: "pointer", textTransform: "capitalize", flexShrink: 0 }}>
                  {s}
                </button>
              ))}
              <div style={{ width: 1, height: 18, background: "#374151", flexShrink: 0 }} />
              <button onClick={() => handleBulkOrgRequired(true)}
                style={{ fontSize: 12, fontWeight: 600, color: "#86efac", background: "#052e16", border: "1px solid #166534", borderRadius: 7, padding: "5px 10px", cursor: "pointer", flexShrink: 0 }}>
                Set Org Required
              </button>
              <button onClick={() => handleBulkOrgRequired(false)}
                style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", background: "#1f2937", border: "1px solid #374151", borderRadius: 7, padding: "5px 10px", cursor: "pointer", flexShrink: 0 }}>
                Remove
              </button>
              <button onClick={() => setSelected(new Set())}
                style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", marginLeft: "auto", flexShrink: 0 }}>
                ✕ Clear
              </button>
            </div>
          )}
        </div>
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
        />
      )}
    </div>
  );
}