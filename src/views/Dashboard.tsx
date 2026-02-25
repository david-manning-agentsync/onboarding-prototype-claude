import { useState } from "react";
import { C } from "../theme";
import { countBy, TIMEFRAMES } from "../data"
import type { Producer } from "../data";

// ─── Chart config ─────────────────────────────────────────────────────────────
const statData =   [{ label: "Needs License",    color: "#7c3aed" }, { label: "Needs LOAs",       color: "#3b82f6" }, { label: "Reg Tasks Only",   color: "#059669" }, { label: "Org Requirements", color: "#d97706" }];
const statusData = [{ label: "Invited",          color: "#9ca3af" }, { label: "In Progress",      color: "#3b82f6" }, { label: "Waiting/Blocked",  color: "#d97706" }, { label: "Completed",        color: "#059669" }, { label: "Terminated",       color: "#dc2626" }];
const taskKeys =   [{ label: "Open",             color: "#9ca3af" }, { label: "Needs Approval",   color: "#d97706" }, { label: "Done",             color: "#059669" }, { label: "Rejected",         color: "#dc2626" }];

function scaleData(tf: string, src: string, producers: Producer[]) {
  const m = tf === "Last 7 days" ? 0.25 : tf === "Last 30 days" ? 0.6 : tf === "Last 90 days" ? 0.85 : 1;
  const pC = countBy(producers, "classification");
  const pS = countBy(producers, "status");
  const tS = countBy(producers.flatMap(p => p.tasks), "status");
  if (src === "class")  return statData.map(d  => ({ ...d, count: Math.max(0, Math.round((pC[d.label] || 0) * m)) }));
  if (src === "status") return statusData.map(d => ({ ...d, count: Math.max(0, Math.round((pS[d.label] || 0) * m)) }));
  return taskKeys.map(d => ({ ...d, count: Math.max(0, Math.round((tS[d.label] || 0) * m)) }));
}

// ─── Horizontal Bar ───────────────────────────────────────────────────────────
function HorizBar({ data, total, onFilter }: {
  data: { label: string; color: string; count: number }[];
  total: number;
  onFilter?: (label: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map(d => (
        <div key={d.label} onClick={() => onFilter?.(d.label)}
          style={{ display: "flex", alignItems: "center", gap: 14, cursor: onFilter ? "pointer" : "default", padding: "6px 8px", borderRadius: 8 }}
          onMouseEnter={e => { if (onFilter) (e.currentTarget as HTMLElement).style.background = C.bg; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <div style={{ width: 140, fontSize: 12, color: C.textDim, flexShrink: 0, fontWeight: 500 }}>{d.label}</div>
          <div style={{ flex: 1, background: C.border, borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${total ? (d.count / total) * 100 : 0}%`, background: d.color, borderRadius: 99, height: 8, transition: "width .5s" }} />
          </div>
          <div style={{ width: 28, textAlign: "right", fontSize: 13, fontWeight: 700, color: C.text }}>{d.count}</div>
          {onFilter && <span style={{ fontSize: 11, color: C.muted }}>→</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard({ setNav, setFilter, producers }: {
  setNav: (id: string) => void;
  setFilter: (f: Record<string, string[]>) => void;
  producers: Producer[];
}) {
  const [tf, setTf] = useState("Last 30 days");
  const sc = scaleData(tf, "class",  producers);
  const ss = scaleData(tf, "status", producers);
  const st = scaleData(tf, "tasks",  producers);
  const tot  = sc.reduce((s, d) => s + d.count, 0);
  const tTot = st.reduce((s, d) => s + d.count, 0);

  const cards = [
    { title: "Producers by Classification", sub: "Click a row to filter", data: sc, total: tot,  nav: "producers", filterKey: "classification", foot: <><b>{tot}</b> total producers</> },
    { title: "Producers by Status",         sub: "Click a row to filter", data: ss, total: tot,  nav: "producers", filterKey: "status",         foot: <><b>{tot}</b> total producers</> },
    { title: "Tasks by Status",             sub: "Click a row to filter tasks", data: st, total: tTot, nav: "tasks", filterKey: "status",        foot: <><b>{tot}</b> producers · <b>{tTot}</b> tasks</> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>Dashboard</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Onboarding overview</p>
        </div>
        <div style={{ display: "flex", gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
          {TIMEFRAMES.map(t => (
            <button key={t} onClick={() => setTf(t)}
              style={{ fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: tf === t ? C.surface : "transparent", color: tf === t ? C.text : C.muted, boxShadow: tf === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {cards.map(card => (
        <div key={card.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{card.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{card.sub}</div>
            </div>
            <button onClick={() => setNav(card.nav)} style={{ fontSize: 12, color: C.accentLight, background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0 }}>
              View {card.nav} →
            </button>
          </div>
          <HorizBar data={card.data} total={card.total} onFilter={f => { setFilter({ [card.filterKey]: [f] }); setNav(card.nav); }} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderLight}`, fontSize: 12, color: C.muted }}>
            {card.foot}
          </div>
        </div>
      ))}
    </div>
  );
}
