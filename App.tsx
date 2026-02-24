import { useState } from "react";
import { C } from "./theme";
import { PRODUCERS_SEED, DEFAULT_PRODUCER_VIEWS, DEFAULT_TASK_VIEWS, Producer, SavedView } from "./data";
import { VersionCtx } from "./components/UI";
import { Dashboard } from "./views/Dashboard";
import { ProducersView, ProducerDetail } from "./views/Producers";
import { TasksView } from "./views/Tasks";
import { PolicySets } from "./views/PolicySets";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_NAV = [
  { id: "dashboard",   label: "Dashboard",   icon: "▣" },
  { id: "producers",   label: "Producers",   icon: "👤" },
  { id: "tasks",       label: "Tasks",        icon: "✓" },
  { id: "policy-sets", label: "Policy Sets",  icon: "⚙" },
];

const VERSION_META: Record<string, { label: string; color: string }> = {
  mvp:       { label: "MVP",        color: C.success },
  "post-mvp":{ label: "Post-MVP",   color: C.accent },
  ai:        { label: "AI Preview", color: C.ai },
};

// ─── Launcher ─────────────────────────────────────────────────────────────────
function Launcher({ onSelect }: { onSelect: (v: string) => void }) {
  const versions = [
    {
      id: "mvp", label: "Onboarding MVP", tag: "Current", tagColor: C.success,
      desc: "Core primitives — dynamic task generation, producer management, operational visibility, and role-based access.",
      features: ["Producer invite & classification", "Policy set configuration", "Task list generation & execution", "Producer & task tables with filtering", "Action-oriented dashboard"],
    },
    {
      id: "post-mvp", label: "Onboarding Post-MVP", tag: "Next", tagColor: C.accent,
      desc: "Operational maturity — bulk actions, richer approval flows, producer history, and smarter task management.",
      features: ["Bulk actions on producer & task tables", "Approval with rejection notes", "Saved views on producer & task tables", "Activity log per producer", "Task sequencing in policy sets"],
    },
    {
      id: "ai", label: "Onboarding + AI", tag: "Preview", tagColor: C.ai,
      desc: "AI-assisted workflows — natural language commands, intelligent task generation, and smart classification.",
      features: ["Natural language command bar on tables", "AI filter → bulk action flows", "AI-powered policy set task generation", "Save AI-generated views to sidebar", "All Post-MVP features included"],
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>A</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>AgentSync</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.text }}>Onboarding Product Demo</h1>
        <p style={{ margin: "10px 0 0", fontSize: 15, color: C.textDim, maxWidth: 480 }}>Select a version to explore. Each builds on the last.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 340px)", gap: 20 }}>
        {versions.map(v => (
          <div key={v.id} style={{ border: `1.5px solid ${v.id === "ai" ? C.aiBorder : C.border}`, borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", background: v.id === "ai" ? "linear-gradient(160deg,#fdf4ff,#fff)" : C.surface }}>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: v.tagColor, background: v.tagColor + "18", border: `1px solid ${v.tagColor}33`, borderRadius: 99, padding: "3px 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{v.tag}</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>{v.label}</div>
            <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, marginBottom: 20 }}>{v.desc}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 28, flex: 1 }}>
              {v.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: v.id === "ai" ? C.ai : C.accent, fontSize: 13, marginTop: 1 }}>{v.id === "ai" ? "✦" : "✓"}</span>
                  <span style={{ fontSize: 13, color: C.textMed }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onSelect(v.id)} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: `1px solid ${v.id === "ai" ? C.ai : C.accent}`, background: v.id === "ai" ? C.ai : C.accent, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Open {v.label.split(" ").slice(-1)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function App({ version, onExit }: { version: string; onExit: () => void }) {
  const [nav,          setNav]          = useState("dashboard");
  const [filter,       setFilter]       = useState<Record<string, string[]>>({});
  const [detailState,  setDetailState]  = useState<{ producer: Producer } | null>(null);
  const [allProducers, setAllProducers] = useState<Producer[]>(PRODUCERS_SEED);
  const [savedViews,   setSavedViews]   = useState<SavedView[]>([...DEFAULT_PRODUCER_VIEWS, ...DEFAULT_TASK_VIEWS]);
  const vm     = VERSION_META[version];
  const isPlus = version === "post-mvp" || version === "ai";

  const navTo = (id: string, f?: Record<string, string[]>) => { setNav(id); setFilter(f || {}); setDetailState(null); };
  const prodViews = savedViews.filter(v => v.table === "producers");
  const taskViews = savedViews.filter(v => v.table === "tasks");
  const handleSaveView   = (v: SavedView) => setSavedViews(prev => [...prev, v]);
  const handleDeleteView = (id: string)   => setSavedViews(prev => prev.filter(v => v.id !== id));

  return (
    <VersionCtx.Provider value={version}>
      <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ padding: "16px 18px 12px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>A</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>AgentSync</div><div style={{ fontSize: 10, color: C.muted }}>Onboarding</div></div>
            </div>
            <button onClick={onExit} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", background: vm.color + "15", border: `1px solid ${vm.color}33`, borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: vm.color }}>{vm.label}</span>
              <span style={{ fontSize: 10, color: vm.color + "99", marginLeft: "auto" }}>← versions</span>
            </button>
          </div>

          <div style={{ padding: "0 8px", flex: 1 }}>
            {BASE_NAV.map(n => {
              const isActive = nav === n.id && !detailState && Object.keys(filter).length === 0;
              return (
                <div key={n.id} onClick={() => navTo(n.id)}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 8, marginBottom: 2, cursor: "pointer", background: isActive ? C.accentBg : "none", color: isActive ? C.accent : C.textDim, fontWeight: isActive ? 600 : 400, fontSize: 13 }}>
                  <span>{n.icon}</span>{n.label}
                </div>
              );
            })}

            {isPlus && (prodViews.length > 0 || taskViews.length > 0) && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 10px", marginBottom: 6 }}>Saved Views</div>

                {prodViews.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, color: C.muted, padding: "4px 10px 2px", letterSpacing: "0.04em" }}>Producers</div>
                    {prodViews.map(v => {
                      const isActive = nav === "producers" && !detailState && JSON.stringify(filter) === JSON.stringify(v.filters);
                      return (
                        <div key={v.id} onClick={() => navTo("producers", v.filters)}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, marginBottom: 1, cursor: "pointer", background: isActive ? C.accentBg : "none", color: isActive ? C.accent : C.textDim, fontSize: 12, fontWeight: isActive ? 600 : 400 }}
                          onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = C.bg; const b = e.currentTarget.querySelector(".del") as HTMLElement; if (b) b.style.opacity = "1"; } }}
                          onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "none"; const b = e.currentTarget.querySelector(".del") as HTMLElement; if (b) b.style.opacity = "0"; } }}>
                          <span style={{ fontSize: 10 }}>⊞</span>
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                          <button className="del" onClick={e => { e.stopPropagation(); handleDeleteView(v.id); }} style={{ opacity: 0, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, lineHeight: 1, padding: "0 2px", transition: "opacity .15s" }}>×</button>
                        </div>
                      );
                    })}
                  </>
                )}

                {taskViews.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, color: C.muted, padding: "8px 10px 2px", letterSpacing: "0.04em" }}>Tasks</div>
                    {taskViews.map(v => {
                      const isActive = nav === "tasks" && JSON.stringify(filter) === JSON.stringify(v.filters);
                      return (
                        <div key={v.id} onClick={() => navTo("tasks", v.filters)}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, marginBottom: 1, cursor: "pointer", background: isActive ? C.accentBg : "none", color: isActive ? C.accent : C.textDim, fontSize: 12, fontWeight: isActive ? 600 : 400 }}
                          onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = C.bg; const b = e.currentTarget.querySelector(".del") as HTMLElement; if (b) b.style.opacity = "1"; } }}
                          onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "none"; const b = e.currentTarget.querySelector(".del") as HTMLElement; if (b) b.style.opacity = "0"; } }}>
                          <span style={{ fontSize: 10 }}>⊞</span>
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                          <button className="del" onClick={e => { e.stopPropagation(); handleDeleteView(v.id); }} style={{ opacity: 0, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, lineHeight: 1, padding: "0 2px", transition: "opacity .15s" }}>×</button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: C.muted }}>Operating Manager</div>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginTop: 2 }}>Sarah Chen</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {detailState ? (
            <ProducerDetail producer={detailState.producer} onBack={() => setDetailState(null)} allProducers={allProducers} setAllProducers={setAllProducers} />
          ) : (
            <>
              {nav === "dashboard"   && <Dashboard setNav={id => navTo(id)} setFilter={f => navTo("producers", f)} producers={allProducers} />}
              {nav === "producers"   && <ProducersView initFilter={filter} setDetailState={s => setDetailState(s)} producers={allProducers} setAllProducers={setAllProducers} onSaveView={handleSaveView} />}
              {nav === "tasks"       && <TasksView producers={allProducers} setAllProducers={setAllProducers} initFilter={filter} onSaveView={handleSaveView} />}
              {nav === "policy-sets" && <PolicySets />}
            </>
          )}
        </div>
      </div>
    </VersionCtx.Provider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Root() {
  const [version, setVersion] = useState<string | null>(null);
  if (!version) return <Launcher onSelect={setVersion} />;
  return <App version={version} onExit={() => setVersion(null)} />;
}
