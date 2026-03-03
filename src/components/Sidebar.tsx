import { useState } from "react";
import { C } from "../theme";
import type { SavedView } from "../data";
import { ProtoPanel } from "./ProtoPanel";

// ─── Types ────────────────────────────────────────────────────────────────────
export type PersonaId = "manager" | "sysadmin" | "producer";
export type VersionId = "mvp" | "post-mvp" | "ai";
export type ProductId = "onboarding" | "compliance" | "hierarchies" | "contracting";

export interface SidebarProps {
  nav:             string;
  personaId:       PersonaId;
  version:         VersionId;
  savedViews:      SavedView[];
  filter:          Record<string, string[]>;
  customerName:    string;
  onNav:           (id: string, filter?: Record<string, string[]>) => void;
  onPersonaChange: (id: PersonaId) => void;
  onVersionChange: (id: VersionId) => void;
  onDeleteView:    (id: string) => void;
  onExit:          () => void;
  onEnterSystem:   () => void;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const PRODUCTS: { id: ProductId; label: string; icon: string }[] = [
  { id: "onboarding",  label: "Onboarding",  icon: "◎" },
  { id: "compliance",  label: "Compliance",  icon: "⊕" },
  { id: "hierarchies", label: "Hierarchies", icon: "⊞" },
  { id: "contracting", label: "Contracting", icon: "◑" },
];

const NAV_BY_PRODUCT: Record<ProductId, { id: string; label: string; icon: string }[]> = {
  onboarding:  [
    { id: "dashboard",   label: "Dashboard",   icon: "▣" },
    { id: "producers",   label: "Producers",   icon: "👤" },
    { id: "tasks",       label: "Tasks",       icon: "✓" },
    { id: "policy-sets", label: "Policy Sets", icon: "⚙" },
  ],
  compliance:  [
    { id: "dashboard", label: "Dashboard", icon: "▣" },
    { id: "producers", label: "Producers", icon: "👤" },
    { id: "tasks",     label: "Tasks",     icon: "✓" },
  ],
  hierarchies: [
    { id: "dashboard",   label: "Dashboard",   icon: "▣" },
    { id: "hierarchies", label: "Hierarchies", icon: "⊞" },
    { id: "producers",   label: "Producers",   icon: "👤" },
  ],
  contracting: [
    { id: "dashboard", label: "Dashboard", icon: "▣" },
    { id: "contracts", label: "Contracts", icon: "◑" },
    { id: "producers", label: "Producers", icon: "👤" },
  ],
};

const PERSONAS: { id: PersonaId; label: string; role: string; initials: string; color: string; hasAdmin: boolean }[] = [
  { id: "manager",  label: "Sarah Chen",   role: "Operating Manager", initials: "SC", color: C.accent,  hasAdmin: false },
  { id: "sysadmin", label: "Alex Morgan",  role: "System Admin",      initials: "AM", color: "#0891b2", hasAdmin: true  },
  { id: "producer", label: "Jordan Smith", role: "Producer",          initials: "JS", color: "#7c3aed", hasAdmin: false },
];


// ─── Small primitives ─────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "6px 0" }} />;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", padding: "6px 10px 3px" }}>
      {children}
    </div>
  );
}

function NavItem({
  icon, label, active, small, accentColor, onClick,
}: {
  icon: string; label: string; active?: boolean; small?: boolean;
  accentColor?: string; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const ac = accentColor ?? C.accent;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: small ? "6px 10px" : "8px 10px",
        borderRadius: 7, marginBottom: 1, cursor: "pointer",
        background: active ? (accentColor ? "#FFF7ED" : C.accentBg) : hov ? C.bg : "transparent",
        color:      active ? ac : C.textMed,
        fontWeight: active ? 600 : 400,
        fontSize:   small  ? 12  : 13,
      }}
    >
      <span style={{ fontSize: small ? 10 : 12, width: 16, textAlign: "center" }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
    </div>
  );
}

// ─── Grid app switcher ────────────────────────────────────────────────────────
function GridSwitcher({ active, onChange }: { active: ProductId; onChange: (id: ProductId) => void }) {
  const [open, setOpen] = useState(false);
  const prod = PRODUCTS.find(p => p.id === active)!;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer" }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 4px)", gap: "2.5px", flexShrink: 0 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: 1, background: open ? C.accent : C.muted }} />
          ))}
        </div>
        <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 600, color: C.text }}>{prod.label}</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, padding: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {PRODUCTS.map(p => {
                const isA = p.id === active;
                return (
                  <div
                    key={p.id}
                    onClick={() => { onChange(p.id); setOpen(false); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 8px", borderRadius: 9, cursor: "pointer", border: `1.5px solid ${isA ? C.accent : "transparent"}`, background: isA ? C.accentBg : "transparent" }}
                    onMouseEnter={e => { if (!isA) (e.currentTarget as HTMLElement).style.background = C.bg; }}
                    onMouseLeave={e => { if (!isA) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: isA ? C.accent : C.bg, border: `1px solid ${isA ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: isA ? "#fff" : C.textDim }}>
                      {p.icon}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: isA ? 600 : 400, color: isA ? C.accent : C.textMed, textAlign: "center" }}>{p.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// ─── User row ─────────────────────────────────────────────────────────────────
function UserRow({
  persona, isAdmin, activeNav, onAdminClick,
}: {
  persona: typeof PERSONAS[0]; isAdmin: boolean; activeNav: string; onAdminClick: () => void;
}) {
  const [open, setOpen] = useState(false);

  const menuItems = [
    ...(isAdmin ? [{ icon: "⚙", label: "System", isAdmin: true }] : []),
    { icon: "👤", label: "Profile" },
    { icon: "🔔", label: "Notifications" },
    { icon: "◉",  label: "Preferences" },
    { icon: "→",  label: "Sign out" },
  ];

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 12px" }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", padding: "2px 0" }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 9, background: persona.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {persona.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{persona.label}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{persona.role}</div>
        </div>
        <span style={{ fontSize: 9, color: C.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▼</span>
      </div>

      {open && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
          {menuItems.map(item => (
            <div key={item.label}>
              {item.label === "Sign out" && <div style={{ height: 1, background: C.border, margin: "4px 0" }} />}
              <NavItem
                icon={item.icon} label={item.label} small
                accentColor={item.isAdmin ? "#EA580C" : undefined}
                active={item.isAdmin && activeNav === "admin"}
                onClick={() => { if (item.isAdmin) { onAdminClick(); setOpen(false); } }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar (main export) ────────────────────────────────────────────────────
export function Sidebar({
  nav, personaId, version, savedViews, filter, customerName,
  onNav, onPersonaChange, onVersionChange, onDeleteView, onExit, onEnterSystem,
}: SidebarProps) {
  const [product, setProduct] = useState<ProductId>("onboarding");

  const persona   = PERSONAS.find(p => p.id === personaId)!;
  const navItems  = NAV_BY_PRODUCT[product];
  const isPostMvp = version === "post-mvp" || version === "ai";

  const prodViews = savedViews.filter(v => v.table === "producers");
  const taskViews = savedViews.filter(v => v.table === "tasks");

  const handleProductChange = (id: ProductId) => {
    setProduct(id);
    onNav("dashboard");
  };

  const handlePersonaChange = (id: PersonaId) => {
    onPersonaChange(id);
    if (nav === "admin" && !PERSONAS.find(p => p.id === id)?.hasAdmin) onNav("dashboard");
  };

  return (
    <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>

      {/* Proto panel — top of sidebar */}
     <ProtoPanel
        personaId={personaId}
        version={version}
        onPersonaChange={(id) => handlePersonaChange(id as PersonaId)}
        onVersionChange={(id) => onVersionChange(id as VersionId)}
        onExit={onExit}
     />

      {/* Customer logo + product switcher */}
      <div style={{ padding: "14px 12px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>
            {customerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{customerName}</div>
            <div style={{ fontSize: 10, color: C.muted }}>AgentSync</div>
          </div>
        </div>
        <GridSwitcher active={product} onChange={handleProductChange} />
      </div>

      <Divider />

      {/* Scrollable nav area */}
      <div style={{ padding: "0 8px", flex: 1 }}>
        {navItems.map(n => {
          const isActive = nav === n.id && Object.keys(filter).length === 0;
          return (
            <NavItem key={n.id} {...n} active={isActive} onClick={() => onNav(n.id)} />
          );
        })}

        {/* Saved Views — post-mvp and AI only */}
        {isPostMvp && (prodViews.length > 0 || taskViews.length > 0) && (
          <div style={{ marginTop: 8 }}>
            <Divider />
            <SectionLabel>Saved Views</SectionLabel>

            {prodViews.length > 0 && (
              <>
                <div style={{ fontSize: 10, color: C.muted, padding: "4px 10px 2px" }}>Producers</div>
                {prodViews.map(v => {
                  const isActive = nav === "producers" && JSON.stringify(filter) === JSON.stringify(v.filters);
                  return (
                    <div
                      key={v.id}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, marginBottom: 1, cursor: "pointer", background: isActive ? C.accentBg : "none", color: isActive ? C.accent : C.textDim, fontSize: 12, fontWeight: isActive ? 600 : 400 }}
                      onClick={() => onNav("producers", v.filters)}
                      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = C.bg; const b = e.currentTarget.querySelector(".del") as HTMLElement; if (b) b.style.opacity = "1"; } }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "none"; const b = e.currentTarget.querySelector(".del") as HTMLElement; if (b) b.style.opacity = "0"; } }}
                    >
                      <span style={{ fontSize: 10 }}>⊞</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                      <button className="del" onClick={e => { e.stopPropagation(); onDeleteView(v.id); }} style={{ opacity: 0, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, lineHeight: 1, padding: "0 2px", transition: "opacity .15s" }}>×</button>
                    </div>
                  );
                })}
              </>
            )}

            {taskViews.length > 0 && (
              <>
                <div style={{ fontSize: 10, color: C.muted, padding: "8px 10px 2px" }}>Tasks</div>
                {taskViews.map(v => {
                  const isActive = nav === "tasks" && JSON.stringify(filter) === JSON.stringify(v.filters);
                  return (
                    <div
                      key={v.id}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, marginBottom: 1, cursor: "pointer", background: isActive ? C.accentBg : "none", color: isActive ? C.accent : C.textDim, fontSize: 12, fontWeight: isActive ? 600 : 400 }}
                      onClick={() => onNav("tasks", v.filters)}
                      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = C.bg; const b = e.currentTarget.querySelector(".del") as HTMLElement; if (b) b.style.opacity = "1"; } }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "none"; const b = e.currentTarget.querySelector(".del") as HTMLElement; if (b) b.style.opacity = "0"; } }}
                    >
                      <span style={{ fontSize: 10 }}>⊞</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                      <button className="del" onClick={e => { e.stopPropagation(); onDeleteView(v.id); }} style={{ opacity: 0, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, lineHeight: 1, padding: "0 2px", transition: "opacity .15s" }}>×</button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom — user row only */}
      <div style={{ flexShrink: 0 }}>
        <UserRow
          persona={persona}
          isAdmin={persona.hasAdmin}
          activeNav={nav}
          onAdminClick={onEnterSystem}
        />
      </div>
    </div>
  );
}