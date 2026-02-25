import { useState, useEffect, useContext, createContext } from "react";
import { C, Badge } from "../theme";

// ─── Version Context ──────────────────────────────────────────────────────────
export const VersionCtx = createContext("mvp");
export const useVersion = () => useContext(VersionCtx);

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ placeholder, value, onChange, style: s }: {
  placeholder: string; value: string; onChange: (v: string) => void; style?: React.CSSProperties;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", ...s }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e => e.target.style.borderColor = C.border} />
  );
}

// ─── Active Filters ───────────────────────────────────────────────────────────
export function ActiveFilters({ filters, onRemove, onClear }: {
  filters: Record<string, string[]>;
  onRemove: (key: string, val: string) => void;
  onClear: () => void;
}) {
  const active = Object.entries(filters).flatMap(([k, v]) => (v || []).map(val => ({ key: k, val })));
  if (!active.length) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {active.map(({ key, val }) => (
        <span key={`${key}-${val}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.accentBg, color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 500 }}>
          {val}
          <button onClick={() => onRemove(key, val)} style={{ background: "none", border: "none", cursor: "pointer", color: C.accentLight, fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
        </span>
      ))}
      <button onClick={onClear} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "3px 6px" }}>Clear all</button>
    </div>
  );
}

// ─── Filter Drawer ────────────────────────────────────────────────────────────
export function FilterDrawer({ open, onClose, filterDefs, pending, setPending, onApply, onClear }: {
  open: boolean; onClose: () => void;
  filterDefs: { key: string; label: string; options: string[] }[];
  pending: Record<string, string[]>;
  setPending: (f: any) => void;
  onApply: (f: Record<string, string[]>) => void;
  onClear: () => void;
}) {
  const [drill, setDrill] = useState<string | null>(null);
  useEffect(() => { if (!open) setDrill(null); }, [open]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { if (drill) setDrill(null); else onClose(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [drill, onClose]);
  if (!open) return null;

  const activeDef = drill ? filterDefs.find(f => f.key === drill) : null;
  const cnt = Object.values(pending).filter(v => v?.length > 0).length;
  const toggle = (key: string, val: string) => setPending((prev: any) => {
    const cur = prev[key] || [];
    return { ...prev, [key]: cur.includes(val) ? cur.filter((x: string) => x !== val) : [...cur, val] };
  });

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.15)", zIndex: 40 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 360, background: C.surface, borderLeft: `1px solid ${C.border}`, zIndex: 50, display: "flex", flexDirection: "column", boxShadow: "-4px 0 32px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
          {drill
            ? <button onClick={() => setDrill(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.accentLight, fontSize: 13, fontWeight: 500, padding: 0 }}>← {activeDef?.label}</button>
            : <div><div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Filters</div>{cnt > 0 && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{cnt} filter{cnt > 1 ? "s" : ""} set</div>}</div>}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18, padding: 4, borderRadius: 6 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {!drill
            ? <div style={{ padding: "8px 0" }}>{filterDefs.map(f => {
                const v = pending[f.key] || [];
                return (
                  <div key={f.key} onClick={() => setDrill(f.key)} style={{ display: "flex", alignItems: "center", padding: "13px 20px", cursor: "pointer", borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{f.label}</div>{v.length > 0 && <div style={{ fontSize: 12, color: C.accentLight, marginTop: 3 }}>{v.join(", ")}</div>}</div>
                    <span style={{ color: C.muted, fontSize: 13 }}>›</span>
                  </div>
                );
              })}</div>
            : <div style={{ padding: "8px 0" }}>{activeDef?.options.map(opt => {
                const sel = (pending[drill] || []).includes(opt);
                return (
                  <div key={opt} onClick={() => toggle(drill, opt)} style={{ display: "flex", alignItems: "center", padding: "12px 20px", cursor: "pointer", borderBottom: `1px solid ${C.borderLight}`, background: sel ? C.accentBg : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${sel ? C.accent : C.border}`, background: sel ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{sel && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>
                      {Badge ? <Badge label={opt} small /> : <span style={{ fontSize: 13, color: C.text }}>{opt}</span>}
                    </div>
                  </div>
                );
              })}</div>}
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
          <button onClick={() => { onClear(); onClose(); }} style={{ fontSize: 13, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "7px 0", fontWeight: 500 }}>Clear all</button>
          <div style={{ flex: 1 }} />
          {drill && <button onClick={() => setDrill(null)} style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 16px", cursor: "pointer" }}>Back</button>}
          <button onClick={() => { onApply(pending); onClose(); }} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: `1px solid ${C.accent}`, borderRadius: 8, padding: "7px 18px", cursor: "pointer" }}>Apply</button>
        </div>
      </div>
    </>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ cols, rows, onRow, activeId, selectable, selected, onToggle, onToggleAll }: {
  cols: { key: string; label: string; render?: (v: any, row: any) => React.ReactNode }[];
  rows: any[];
  onRow?: (row: any) => void;
  activeId?: any;
  selectable?: boolean;
  selected?: Set<any>;
  onToggle?: (id: any) => void;
  onToggleAll?: (rows: any[]) => void;
}) {
  const version = useVersion();
  const showCB = (version === "post-mvp" || version === "ai") && selectable;
  const allSel = rows.length > 0 && rows.every(r => selected?.has(r.id));
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr style={{ background: C.bg }}>
          {showCB && <th style={{ padding: "9px 8px 9px 14px", borderBottom: `1px solid ${C.border}`, width: 36 }}><input type="checkbox" checked={allSel} onChange={() => onToggleAll?.(rows)} style={{ cursor: "pointer" }} /></th>}
          {cols.map(c => <th key={c.key} style={{ textAlign: "left", padding: "9px 14px", color: C.muted, fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{c.label}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((row, i) => {
            const isActive = activeId && row.id === activeId;
            const isSel = selected?.has(row.id);
            return (
              <tr key={i} onClick={() => onRow?.(row)}
                style={{ cursor: onRow ? "pointer" : "default", borderBottom: `1px solid ${C.borderLight}`, background: isSel ? "#f0f4ff" : isActive ? C.accentBg : "transparent" }}
                onMouseEnter={e => { if (!isActive && !isSel) (e.currentTarget as HTMLElement).style.background = "#f8f9ff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSel ? "#f0f4ff" : isActive ? C.accentBg : "transparent"; }}>
                {showCB && <td style={{ padding: "11px 8px 11px 14px" }} onClick={e => { e.stopPropagation(); onToggle?.(row.id); }}><input type="checkbox" checked={isSel || false} onChange={() => {}} style={{ cursor: "pointer" }} /></td>}
                {cols.map(c => <td key={c.key} style={{ padding: "11px 14px", color: C.textMed, whiteSpace: "nowrap" }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
              </tr>
            );
          })}
          {rows.length === 0 && <tr><td colSpan={cols.length + (showCB ? 1 : 0)} style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 13 }}>No results found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ─── Bulk Bar ─────────────────────────────────────────────────────────────────
export function BulkBar({ selected, onClear, actions }: {
  selected: Set<any>;
  onClear: () => void;
  actions: { label: string; danger?: boolean; onClick: () => void }[];
}) {
  if (!selected.size) return null;
  return (
    <div style={{ position: "sticky", bottom: 0, background: C.text, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 -4px 24px rgba(0,0,0,0.15)", zIndex: 10 }}>
      <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{selected.size} selected</span>
      <div style={{ flex: 1 }} />
      {actions.map(a => <button key={a.label} onClick={a.onClick} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: `1px solid ${a.danger ? "#f87171" : "rgba(255,255,255,0.2)"}`, background: a.danger ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.1)", color: a.danger ? "#f87171" : "#fff", cursor: "pointer" }}>{a.label}</button>)}
      <button onClick={onClear} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", padding: "6px 8px" }}>Clear</button>
    </div>
  );
}

// ─── Save View Modal ──────────────────────────────────────────────────────────
export function SaveViewModal({ onSave, onClose, filters }: {
  onSave: (name: string) => void;
  onClose: () => void;
  filters: Record<string, string[]>;
}) {
  const [name, setName] = useState("");
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const active = Object.entries(filters).flatMap(([, v]) => v || []);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 60 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 380, background: C.surface, borderRadius: 14, boxShadow: "0 8px 48px rgba(0,0,0,0.18)", zIndex: 61 }}>
        <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Save view</div>
          <div style={{ fontSize: 12, color: C.muted }}>Appears in the sidebar for quick access.</div>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 6 }}>View name</div>
          <input autoFocus value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); }}
            placeholder="e.g. My open tasks"
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border} />
          {active.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Filters included</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{active.map(v => <Badge key={v} label={v} small />)}</div>
            </div>
          )}
        </div>
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => name.trim() && onSave(name.trim())} disabled={!name.trim()} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: name.trim() ? C.accent : C.muted, border: "none", borderRadius: 8, padding: "7px 18px", cursor: name.trim() ? "pointer" : "not-allowed" }}>Save view</button>
        </div>
      </div>
    </>
  );
}
