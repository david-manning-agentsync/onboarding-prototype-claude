import { useState, useEffect } from "react";
import { C, Badge } from "../theme";
import { Drawer } from "./Drawer";

export interface FilterDef {
  key: string;
  label: string;
  options: string[];
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filterDefs: FilterDef[];
  pending: Record<string, string[]>;
  setPending: (f: any) => void;
  onApply: (f: Record<string, string[]>) => void;
  onClear: () => void;
}

export function FilterDrawer({
  open, onClose, filterDefs, pending, setPending, onApply, onClear,
}: FilterDrawerProps) {
  const [drill, setDrill] = useState<string | null>(null);

  useEffect(() => { if (!open) setDrill(null); }, [open]);

  // Override Escape to drill back before closing
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (drill) { e.stopPropagation(); setDrill(null); } }
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [open, drill]);

  const activeDef = drill ? filterDefs.find(f => f.key === drill) : null;
  const cnt = Object.values(pending).filter(v => v?.length > 0).length;

  const toggle = (key: string, val: string) =>
    setPending((prev: any) => {
      const cur = prev[key] || [];
      return { ...prev, [key]: cur.includes(val) ? cur.filter((x: string) => x !== val) : [...cur, val] };
    });

  const footer = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={() => { onClear(); onClose(); }}
        style={{ fontSize: 13, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "7px 0", fontWeight: 500 }}>
        Clear all
      </button>
      <div style={{ flex: 1 }} />
      {drill && (
        <button onClick={() => setDrill(null)}
          style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 16px", cursor: "pointer" }}>
          Back
        </button>
      )}
      <button onClick={() => { onApply(pending); onClose(); }}
        style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer" }}>
        Apply
      </button>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={360}
      title={drill ? (activeDef?.label ?? "Filter") : "Filters"}
      subtitle={!drill && cnt > 0 ? `${cnt} filter${cnt > 1 ? "s" : ""} set` : undefined}
      onBack={drill ? () => setDrill(null) : undefined}
      footer={footer}
    >
      <div style={{ padding: "8px 0" }}>
        {!drill
          ? filterDefs.map(f => {
              const v = pending[f.key] || [];
              return (
                <div key={f.key} onClick={() => setDrill(f.key)}
                  style={{ display: "flex", alignItems: "center", padding: "13px 24px", cursor: "pointer", borderBottom: `1px solid ${C.borderLight}` }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{f.label}</div>
                    {v.length > 0 && <div style={{ fontSize: 12, color: C.accentLight, marginTop: 3 }}>{v.join(", ")}</div>}
                  </div>
                  <span style={{ color: C.muted, fontSize: 13 }}>›</span>
                </div>
              );
            })
          : activeDef?.options.map(opt => {
              const sel = (pending[drill] || []).includes(opt);
              return (
                <div key={opt} onClick={() => toggle(drill, opt)}
                  style={{ display: "flex", alignItems: "center", padding: "12px 24px", cursor: "pointer", borderBottom: `1px solid ${C.borderLight}`, background: sel ? C.accentBg : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${sel ? C.accent : C.border}`, background: sel ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {sel && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                    </div>
                    <Badge label={opt} small />
                  </div>
                </div>
              );
            })
        }
      </div>
    </Drawer>
  );
}