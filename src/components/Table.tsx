import { useVersion } from "./UI";
import { C } from "../theme";

export interface ColDef<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T extends { id: any }> {
  cols: ColDef<T>[];
  rows: T[];
  onRow?: (row: T) => void;
  activeId?: any;
  selectable?: boolean;
  selected?: Set<any>;
  onToggle?: (id: any) => void;
  onToggleAll?: (rows: T[]) => void;
}

export function Table<T extends { id: any }>({
  cols, rows, onRow, activeId,
  selectable, selected, onToggle, onToggleAll,
}: TableProps<T>) {
  const version = useVersion();
  const showCB = (version === "post-mvp" || version === "ai") && selectable;
  const allSel = rows.length > 0 && rows.every(r => selected?.has(r.id));

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {showCB && (
              <th style={{ padding: "9px 8px 9px 14px", borderBottom: `1px solid ${C.border}`, width: 36 }}>
                <input type="checkbox" checked={allSel} onChange={() => onToggleAll?.(rows)}
                  style={{ cursor: "pointer", accentColor: C.accent }} />
              </th>
            )}
            {cols.map(c => (
              <th key={c.key} style={{ textAlign: "left", padding: "9px 14px", color: C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isActive = activeId != null && row.id === activeId;
            const isSel = selected?.has(row.id);
            return (
              <tr key={i} onClick={() => onRow?.(row)}
                style={{ cursor: onRow ? "pointer" : "default", borderBottom: `1px solid ${C.borderLight}`, background: isSel ? C.accentBg : isActive ? C.accentBg : "transparent", transition: "background .1s" }}
                onMouseEnter={e => { if (!isActive && !isSel) (e.currentTarget as HTMLElement).style.background = C.bg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSel ? C.accentBg : isActive ? C.accentBg : "transparent"; }}>
                {showCB && (
                  <td style={{ padding: "11px 8px 11px 14px" }} onClick={e => { e.stopPropagation(); onToggle?.(row.id); }}>
                    <input type="checkbox" checked={isSel || false} onChange={() => {}}
                      style={{ cursor: "pointer", accentColor: C.accent }} />
                  </td>
                )}
                {cols.map(c => (
                  <td key={c.key} style={{ padding: "11px 14px", color: C.textMed, whiteSpace: "nowrap" }}>
                    {c.render ? c.render(row[c.key as keyof T], row) : String(row[c.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols.length + (showCB ? 1 : 0)}
                style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 13 }}>
                No results found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}