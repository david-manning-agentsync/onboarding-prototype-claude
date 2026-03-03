import { useState } from "react";
import { C } from "../theme";

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

export function ProtoPanel({
  personaId, version, onPersonaChange, onVersionChange, onExit, tint,
}: {
  personaId: string;
  version:   string;
  onPersonaChange: (id: string) => void;
  onVersionChange: (id: string) => void;
  onExit:    () => void;
  tint?:     "orange";
}) {
  const [open, setOpen] = useState(false);
  const persona = PERSONAS.find(p => p.id === personaId)!;
  const ver     = VERSIONS.find(v => v.id === version)!;

  const borderColor  = tint ? "#FDE8D0" : C.border;
  const bgColor      = tint ? "#FFFAF5" : "#FAFBFC";
  const hoverColor   = tint ? "#FEF3E8" : C.bg;
  const mutedColor   = tint ? "#C2917A" : C.muted;
  const textColor    = tint ? "#92400E" : C.textMed;

  return (
    <div style={{ position: "relative", borderBottom: `1.5px dashed ${borderColor}`, background: bgColor, flexShrink: 0 }}>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 8, right: 8, background: C.surface, border: `1.5px solid ${borderColor}`, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", zIndex: 50, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px 8px", borderBottom: `1px solid ${borderColor}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: mutedColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>Prototype</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={onExit} style={{ fontSize: 10, color: mutedColor, background: "none", border: `1px solid ${borderColor}`, borderRadius: 5, padding: "2px 8px", cursor: "pointer" }}>← versions</button>
                <button onClick={() => setOpen(false)} style={{ fontSize: 16, lineHeight: 1, color: mutedColor, background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}>×</button>
              </div>
            </div>

            <div style={{ padding: "10px 12px 12px" }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: mutedColor, marginBottom: 4 }}>Version</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {VERSIONS.map(v => (
                    <button key={v.id} onClick={() => onVersionChange(v.id)}
                      style={{ flex: 1, fontSize: 10, fontWeight: 600, padding: "5px 0", borderRadius: 5, border: `1.5px solid ${version === v.id ? v.color : borderColor}`, background: version === v.id ? v.color + "18" : "transparent", color: version === v.id ? v.color : mutedColor, cursor: "pointer" }}>
                      {v.short}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: mutedColor, marginBottom: 4 }}>Persona</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {PERSONAS.map(p => (
                    <button key={p.id} onClick={() => onPersonaChange(p.id)}
                      style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", borderRadius: 6, border: `1.5px solid ${personaId === p.id ? p.color : borderColor}`, background: personaId === p.id ? p.color + "12" : "transparent", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{p.initials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: personaId === p.id ? p.color : textColor, lineHeight: 1.2 }}>{p.label}</div>
                        <div style={{ fontSize: 10, color: mutedColor }}>{p.role}</div>
                      </div>
                      {p.hasAdmin && <span style={{ fontSize: 9, color: "#EA580C", fontWeight: 600 }}>admin</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px", background: "transparent", border: "none", cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverColor}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: ver.color, background: ver.color + "18", border: `1px solid ${ver.color}33`, borderRadius: 99, padding: "2px 7px", flexShrink: 0 }}>{ver.short}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: persona.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff" }}>{persona.initials}</div>
          <span style={{ fontSize: 11, color: textColor, fontWeight: 500 }}>{persona.label.split(" ")[0]}</span>
        </div>
        <span style={{ fontSize: 11, color: mutedColor }}>{open ? "▲" : "▼"}</span>
      </button>
    </div>
  );
}