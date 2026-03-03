import { useState } from "react";
import { C } from "../theme";
import { ProtoPanel } from "./ProtoPanel";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SystemNavId = "policy-sets" | "users";

export interface SystemSidebarProps {
  nav:             SystemNavId;
  personaId:       string;
  version:         string;
  customerName:    string;
  onNav:           (id: SystemNavId) => void;
  onExitSystem:    () => void;
  onPersonaChange: (id: string) => void;
  onVersionChange: (id: string) => void;
  onExit:          () => void;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const PERSONAS = [
  { id: "manager",  label: "Sarah Chen",   role: "Operating Manager", initials: "SC", color: C.accent,  hasAdmin: false },
  { id: "sysadmin", label: "Alex Morgan",  role: "System Admin",      initials: "AM", color: "#0891b2", hasAdmin: true  },
  { id: "producer", label: "Jordan Smith", role: "Producer",          initials: "JS", color: "#7c3aed", hasAdmin: false },
];

const VERSIONS = [
  { id: "mvp",      short: "MVP",  color: C.success },
  { id: "post-mvp", short: "Post", color: C.accent  },
  { id: "ai",       short: "AI",   color: C.ai      },
];

const S = {
  bg:         "#FFF7ED",
  border:     "#FDE8D0",
  accent:     "#EA580C",
  accentBg:   "#FFF0E6",
  accentText: "#C2410C",
  muted:      "#C2917A",
};

// ─── Primitives ───────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, margin: "6px 0", background: S.border }} />;
}

function NavItem({ icon, label, active, small, onClick }: {
  icon: string; label: string; active?: boolean;
  small?: boolean; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: small ? "6px 10px" : "8px 10px",
        borderRadius: 7, marginBottom: 1, cursor: "pointer",
        background: active ? S.accentBg : hov ? "#FEF3E8" : "transparent",
        color:      active ? S.accent   : "#92400E",
        fontWeight: active ? 600 : 400,
        fontSize:   small  ? 12  : 13,
      }}
    >
      <span style={{ fontSize: small ? 10 : 12, width: 16, textAlign: "center" }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: S.accent, flexShrink: 0 }} />}
    </div>
  );
}

// ─── User row ─────────────────────────────────────────────────────────────────
function UserRow({ persona, onExitSystem }: {
  persona: typeof PERSONAS[0];
  onExitSystem: () => void;
}) {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { icon: "◎", label: "Back to Product", isExit: true },
    { icon: "👤", label: "Profile" },
    { icon: "🔔", label: "Notifications" },
    { icon: "◉",  label: "Preferences" },
    { icon: "→",  label: "Sign out" },
  ];

  return (
    <div style={{ borderTop: `1px solid ${S.border}`, padding: "8px 12px" }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", padding: "2px 0" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: persona.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {persona.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1C0A00", lineHeight: 1.3 }}>{persona.label}</div>
          <div style={{ fontSize: 11, color: S.muted }}>{persona.role}</div>
        </div>
        <span style={{ fontSize: 9, color: S.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▼</span>
      </div>

      {open && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${S.border}` }}>
          {menuItems.map(item => (
            <div key={item.label}>
              {item.label === "Sign out" && <div style={{ height: 1, background: S.border, margin: "4px 0" }} />}
              {item.label === "Profile"  && <div style={{ height: 1, background: S.border, margin: "4px 0" }} />}
              <div
                onClick={() => { if (item.isExit) onExitSystem(); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 7, marginBottom: 1, cursor: "pointer", fontSize: 12,
                  color: item.isExit ? S.accent : "#92400E", fontWeight: item.isExit ? 600 : 400 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FEF3E8"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <span style={{ fontSize: 10, width: 16, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SystemSidebar (main export) ──────────────────────────────────────────────
export function SystemSidebar({
  nav, personaId, version, customerName,
  onNav, onExitSystem, onPersonaChange, onVersionChange, onExit,
}: SystemSidebarProps) {
  const persona = PERSONAS.find(p => p.id === personaId)!;

  return (
    <div style={{
      width: 220, display: "flex", flexDirection: "column", flexShrink: 0,
      background: S.bg, borderRight: `1px solid ${S.border}`, height: "100%",
    }}>

      {/* Proto panel — top of sidebar */}
      <ProtoPanel
        personaId={personaId} version={version}
        onPersonaChange={onPersonaChange}
        onVersionChange={onVersionChange}
        onExit={onExit}
        tint="orange"
      />

      {/* Customer logo + System label */}
      <div style={{ padding: "14px 12px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>
            {customerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1C0A00" }}>{customerName}</div>
            <div style={{ fontSize: 10, color: S.muted }}>AgentSync</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 7, background: S.accentBg, border: `1px solid ${S.border}` }}>
          <span style={{ fontSize: 12 }}>⚙</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: S.accentText }}>System</span>
          <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, color: S.accent, background: "#FEE4D0", borderRadius: 4, padding: "1px 5px" }}>ADMIN</span>
        </div>
      </div>

      <Divider />

      {/* Nav */}
      <div style={{ padding: "4px 8px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", padding: "4px 10px 6px" }}>Configuration</div>
        <NavItem icon="⚙" label="Policy Sets" active={nav === "policy-sets"} onClick={() => onNav("policy-sets")} />

        <div style={{ fontSize: 10, fontWeight: 600, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", padding: "12px 10px 6px" }}>Access</div>
        <NavItem icon="👥" label="Users" active={nav === "users"} onClick={() => onNav("users")} />
      </div>

      {/* Bottom — user row only */}
      <div style={{ flexShrink: 0 }}>
        <UserRow persona={persona} onExitSystem={onExitSystem} />
      </div>
    </div>
  );
}