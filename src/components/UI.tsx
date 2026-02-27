import { useContext, createContext } from "react";
import { C } from "../theme";

// ─── Version Context ──────────────────────────────────────────────────────────
export const VersionCtx = createContext("mvp");
export const useVersion = () => useContext(VersionCtx);

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