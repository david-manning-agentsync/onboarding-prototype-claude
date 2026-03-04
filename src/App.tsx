import { useState } from "react";
import { C } from "./theme";
import { PRODUCERS_SEED, DEFAULT_PRODUCER_VIEWS, DEFAULT_TASK_VIEWS } from "./data";
import type { Producer, SavedView } from "./data";
import { VersionCtx } from "./components/UI";
import { Sidebar } from "./components/Sidebar";
import { SystemSidebar } from "./components/SystemSidebar";
import type { PersonaId, VersionId } from "./components/Sidebar";
import type { SystemNavId } from "./components/SystemSidebar";
import { Dashboard } from "./views/Dashboard";
import { ProducersView } from "./views/Producers";
import { TasksView } from "./views/Tasks";
import { PolicySets as PolicySetsView } from "./views/PolicySets";
import { ProducerDetail } from "./views/ProducerDetail";
import { ProducerShell } from "./components/ProducerShell";

// ─── Launcher ─────────────────────────────────────────────────────────────────
function Launcher({ onSelect }: { onSelect: (v: string) => void }) {
  const versions = [
    {
      id: "mvp", label: "Onboarding MVP", tag: "Current", tagColor: C.success,
      desc: "Core primitives — dynamic task generation, producer management, operational visibility, and role-based access.",
      features: ["Producer invite", "Producer status & readiness", "Onboarding configuration", "Task list generation & execution", "Producer & task tables with filtering", "Action-oriented dashboard", "Improved producer experience"],
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

// ─── Placeholder view ─────────────────────────────────────────────────────────
function ComingSoon({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted }}>{desc}</div>
      </div>
    </div>
  );
}

// ─── System content views ─────────────────────────────────────────────────────
function SystemContent({ nav }: { nav: SystemNavId }) {
  return (
    <div style={{ flex: 1, overflow: "auto", padding: 28, background: "#FFFCF9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
        <span style={{ fontSize: 12, color: "#EA580C", fontWeight: 600 }}>System</span>
        <span style={{ fontSize: 12, color: "#C2917A" }}>›</span>
        <span style={{ fontSize: 12, color: "#92400E", fontWeight: 500, textTransform: "capitalize" }}>
          {nav === "policy-sets" ? "Policy Sets" : "Users"}
        </span>
      </div>
      {nav === "policy-sets" && <SystemPolicySets />}
      {nav === "users"       && <SystemUsers />}
    </div>
  );
}

function SystemPolicySets() {
  return <PolicySetsView isAdmin />;
}

function SystemUsers() {
  const [tab, setTab] = useState<"users" | "roles">("users");

  const tabs = [
    { id: "users", label: "Users" },
    { id: "roles", label: "Roles" },
  ] as const;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1C0A00" }}>Users</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#C2917A" }}>Manage users and their roles.</p>
      </div>
      <div style={{ display: "flex", gap: 2, borderBottom: `1px solid #FDE8D0`, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "8px 16px", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? "#EA580C" : "#92400E",
              background: "transparent", border: "none",
              borderBottom: `2px solid ${tab === t.id ? "#EA580C" : "transparent"}`,
              marginBottom: -1, cursor: "pointer", transition: "all .15s",
            }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "users" && <ComingSoon icon="👥" title="Users" desc="Manage system users and their access." />}
      {tab === "roles" && <ComingSoon icon="◉"  title="Roles" desc="Define roles and the permissions they grant." />}
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function App({ version: initialVersion, onExit }: { version: string; onExit: () => void }) {
  const [mode,         setMode]         = useState<"product" | "system">("product");
  const [nav,          setNav]          = useState("dashboard");
  const [systemNav,    setSystemNav]    = useState<SystemNavId>("policy-sets");
  const [filter,       setFilter]       = useState<Record<string, string[]>>({});
  const [detailState,  setDetailState]  = useState<{ producer: Producer } | null>(null);
  const [allProducers, setAllProducers] = useState<Producer[]>(PRODUCERS_SEED);
  const [savedViews,   setSavedViews]   = useState<SavedView[]>([...DEFAULT_PRODUCER_VIEWS, ...DEFAULT_TASK_VIEWS]);
  const [personaId,    setPersonaId]    = useState<PersonaId>("manager");
  const [version,      setVersion]      = useState<VersionId>(initialVersion as VersionId);

  const jordanSmith = allProducers.find(p => p.name === "Jordan Smith")!;

  const navTo = (id: string, f?: Record<string, string[]>) => {
    setNav(id);
    setFilter(f || {});
    setDetailState(null);
  };

  const handlePersonaChange = (id: PersonaId) => {
    setPersonaId(id);
    setFilter({});
    setDetailState(null);
    setNav("dashboard");
    if (id !== "sysadmin" && mode === "system") setMode("product");
  };

  const handleSaveView   = (v: SavedView) => setSavedViews(prev => [...prev, v]);
  const handleDeleteView = (id: string)   => setSavedViews(prev => prev.filter(v => v.id !== id));

  const sharedSidebarProps = {
    personaId,
    version,
    customerName: "Acme Insurance",
    onPersonaChange: (id: string) => handlePersonaChange(id as PersonaId),
    onVersionChange: (id: string) => setVersion(id as VersionId),
    onExit,
  };

  // ─── Producer persona — no sidebar, dedicated shell ───────────────────────
  if (personaId === "producer") {
    return (
      <VersionCtx.Provider value={version}>
        <ProducerShell
          producer={jordanSmith}
          allProducers={allProducers}
          setAllProducers={setAllProducers}
          personaId={personaId}
          version={version}
          onPersonaChange={(id) => handlePersonaChange(id as PersonaId)}
          onVersionChange={(id) => setVersion(id as VersionId)}
          onExit={onExit}
        />
      </VersionCtx.Provider>
    );
  }

  // ─── Manager / Sysadmin — sidebar layout ─────────────────────────────────
  return (
    <VersionCtx.Provider value={version}>
      <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, overflow: "hidden" }}>

        {mode === "product" ? (
          <Sidebar
            {...sharedSidebarProps}
            nav={nav}
            savedViews={savedViews}
            filter={filter}
            onNav={(id, f) => navTo(id, f)}
            onDeleteView={handleDeleteView}
            onEnterSystem={() => setMode("system")}
          />
        ) : (
          <SystemSidebar
            {...sharedSidebarProps}
            nav={systemNav}
            onNav={setSystemNav}
            onExitSystem={() => setMode("product")}
          />
        )}

        {mode === "product" ? (
          <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
            {detailState ? (
              <ProducerDetail
                producer={detailState.producer}
                onBack={() => setDetailState(null)}
                allProducers={allProducers}
                setAllProducers={setAllProducers}
              />
            ) : (
              <>
                {nav === "dashboard"   && <Dashboard setNav={id => navTo(id)} setFilter={(f, dest) => navTo(dest || "producers", f)} producers={allProducers} />}
                {nav === "producers"   && <ProducersView initFilter={filter} setDetailState={s => setDetailState(s)} producers={allProducers} setAllProducers={setAllProducers} onSaveView={handleSaveView} />}
                {nav === "tasks"       && <TasksView producers={allProducers} setAllProducers={setAllProducers} initFilter={filter} onSaveView={handleSaveView} />}
                {nav === "policy-sets" && <PolicySetsView />}
                {nav === "admin"       && <ComingSoon icon="⚙" title="Admin" desc="Users, roles, integrations, and org settings will live here." />}
                {nav === "profile"     && <ComingSoon icon="👤" title="Profile" desc="This section will allow you to view and update your profile information." />}
              </>
            )}
          </div>
        ) : (
          <SystemContent nav={systemNav} />
        )}

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