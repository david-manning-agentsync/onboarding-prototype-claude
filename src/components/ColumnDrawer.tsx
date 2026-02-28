import { useState, useRef } from "react";
import { C } from "../theme";
import { Drawer } from "./Drawer";
import type { ColDef } from "./Table";

type Tab = "visible" | "hidden" | "all";

interface ColumnDrawerProps<T> {
  open: boolean;
  onClose: () => void;
  cols: ColDef<T>[];
  onToggle: (key: string) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onReset: () => void;
}

export function ColumnDrawer<T>({
  open, onClose, cols, onToggle, onReorder, onReset,
}: ColumnDrawerProps<T>) {
  const [tab, setTab]       = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const dragIdx             = useRef<number | null>(null);

  const visible  = cols.filter(c => !c.hidden);
  const hidden   = cols.filter(c => c.hidden);
  const q        = search.toLowerCase();
  const filtered = cols.filter(c => {
    if (tab === "visible" && c.hidden)  return false;
    if (tab === "hidden"  && !c.hidden) return false;
    return !q || c.label.toLowerCase().includes(q);
  });

  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragOver  = (e: React.DragEvent) => e.preventDefault();
  const handleDrop      = (toIdx: number) => {
    if (dragIdx.current === null || dragIdx.current === toIdx) return;
    // Map filtered index back to cols index
    const fromKey = filtered[dragIdx.current].key;
    const toKey   = filtered[toIdx].key;
    const fromI   = cols.findIndex(c => c.key === fromKey);
    const toI     = cols.findIndex(c => c.key === toKey);
    onReorder(fromI, toI);
    dragIdx.current = null;
  };

  const footer = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={onReset}
        style={{ fontSize: 13, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "7px 0", fontWeight: 500 }}>
        Reset to default
      </button>
      <div style={{ flex: 1 }} />
      <button onClick={onClose}
        style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer" }}>
        Done
      </button>
    </div>
  );

  return (
    <Drawer
      open={open} onClose={onClose}
      title="Manage Columns"
      subtitle={`${visible.length} of ${cols.length} visible`}
      footer={footer}
      width={360}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Search */}
        <div style={{ padding: "12px 24px 0" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search columns…"
            style={{ width: "100%", boxSizing: "border-box", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.text, outline: "none" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, padding: "10px 24px", borderBottom: `1px solid ${C.border}` }}>
          {([["all", `All (${cols.length})`], ["visible", `Visible (${visible.length})`], ["hidden", `Hidden (${hidden.length})`]] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, fontSize: 12, fontWeight: 600, padding: "6px 4px", borderRadius: 6, border: "none", cursor: "pointer", background: tab === t ? C.accentBg : "transparent", color: tab === t ? C.accent : C.muted, transition: "all .15s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Column list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "28px 24px", textAlign: "center", color: C.muted, fontSize: 13 }}>No columns match</div>
          )}
          {filtered.map((col, idx) => (
            <div
              key={col.key}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 24px", borderBottom: `1px solid ${C.borderLight}`, cursor: "grab", background: col.hidden ? "transparent" : C.surface, transition: "background .1s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = col.hidden ? "transparent" : C.surface}
            >
              {/* Drag handle */}
              <span style={{ color: C.muted, fontSize: 14, cursor: "grab", flexShrink: 0 }}>⠿</span>

              {/* Toggle */}
              <div onClick={() => onToggle(col.key)}
                style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${!col.hidden ? C.accent : C.border}`, background: !col.hidden ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                {!col.hidden && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
              </div>

              {/* Label */}
              <span style={{ fontSize: 13, fontWeight: 500, color: col.hidden ? C.muted : C.text, flex: 1 }}>
                {col.label}
              </span>

              {/* Visible indicator */}
              {!col.hidden && (
                <span style={{ fontSize: 11, color: C.accentLight, background: C.accentBg, border: `1px solid ${C.accent}22`, borderRadius: 4, padding: "1px 6px", flexShrink: 0 }}>
                  Visible
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}