import { useState } from "react";
import { useVersion, ActiveFilters } from "./UI";
import { C } from "../theme";
import { SearchBar } from "./SearchBar";
import { FilterDrawer } from "./FilterDrawer";
import { ColumnDrawer } from "./ColumnDrawer";
import { useColumnManager } from "../hooks/useColumnManager";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColDef<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  hidden?: boolean;
  noSort?: boolean;
  /** Opt out of search matching for this column (e.g. pure icon/action columns) */
  noSearch?: boolean;
}

export interface FilterDef {
  key: string;
  label: string;
  options: string[];
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
  defaultSortKey?: string;
  defaultSortDir?: "asc" | "desc";
}

// ─── TableView props ──────────────────────────────────────────────────────────

export interface TableViewProps<T extends { id: any }> {
  title: string;
  subtitle?: string;
  allCols: ColDef<T>[];
  rows: T[];
  totalCount: number;
  recordLabel?: string;
  filterDefs?: FilterDef[];
  search: string;
  onSearch: (v: string) => void;
  applied: Record<string, string[]>;
  onApply: (f: Record<string, string[]>) => void;
  onRow?: (row: T) => void;
  activeId?: any;
  selectable?: boolean;
  selected?: Set<any>;
  onToggle?: (id: any) => void;
  onToggleAll?: (rows: T[]) => void;
  defaultSortKey?: string;
  primaryAction?: React.ReactNode;
  banner?: React.ReactNode;
}

// ─── Search helper ────────────────────────────────────────────────────────────
// Filters rows by matching the search term against all searchable column values.
// For columns with a render function, we call it and use the string result if
// it's a plain string; otherwise we fall back to the raw field value.
// Columns marked noSearch are skipped (e.g. pure icon or action columns).

function matchesSearch<T extends { id: any }>(
  row: T,
  cols: ColDef<T>[],
  query: string,
): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return cols.some(col => {
    if (col.noSearch) return false;
    const raw = row[col.key as keyof T];
    let text = "";
    if (col.render) {
      const result = col.render(raw, row);
      // Only use render output if it resolves to a plain string
      text = typeof result === "string" ? result : String(raw ?? "");
    } else {
      text = String(raw ?? "");
    }
    return text.toLowerCase().includes(q);
  });
}

// ─── Table primitive ──────────────────────────────────────────────────────────

export function Table<T extends { id: any }>({
  cols, rows, onRow, activeId,
  selectable, selected, onToggle, onToggleAll,
  defaultSortKey, defaultSortDir = "asc",
}: TableProps<T>) {
  const version = useVersion();
  const showCB  = (version === "post-mvp" || version === "ai") && selectable;

  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...rows].sort((a: any, b: any) => {
    if (!sortKey) return 0;
    let av = a[sortKey], bv = b[sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "boolean") { av = av ? 1 : 0; bv = bv ? 1 : 0; }
    if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const allSel = sorted.length > 0 && sorted.every(r => selected?.has(r.id));

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {showCB && (
              <th style={{ padding: "9px 8px 9px 14px", borderBottom: `1px solid ${C.border}`, width: 36 }}>
                <input type="checkbox" checked={allSel} onChange={() => onToggleAll?.(sorted)}
                  style={{ cursor: "pointer", accentColor: C.accent }} />
              </th>
            )}
            {cols.map(c => {
              const active = sortKey === c.key;
              return (
                <th key={c.key}
                  onClick={() => !c.noSort && handleSort(c.key)}
                  style={{ textAlign: "left", padding: "9px 14px", color: active ? C.accent : C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", cursor: c.noSort ? "default" : "pointer", userSelect: "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {c.label}
                    {!c.noSort && (
                      <span style={{ opacity: active ? 1 : 0.25, fontSize: 10, color: active ? C.accent : C.muted }}>
                        {active && sortDir === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const isActive = activeId != null && row.id === activeId;
            const isSel    = selected?.has(row.id);
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
          {sorted.length === 0 && (
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

// ─── TableView ────────────────────────────────────────────────────────────────
// Full-view table surface. Owns column visibility, drawer open/close, and
// search filtering. Views pass ALL rows (pre-filtered by applied filters only);
// TableView handles search matching internally across all visible columns.

export function TableView<T extends { id: any }>({
  title, subtitle: _subtitle,
  allCols, rows, totalCount, recordLabel = "records",
  filterDefs = [],
  search, onSearch,
  applied, onApply,
  onRow, activeId,
  selectable, selected, onToggle, onToggleAll,
  defaultSortKey,
  primaryAction,
  banner,
}: TableViewProps<T>) {
  const [filterOpen,       setFilterOpen]       = useState(false);
  const [columnDrawerOpen, setColumnDrawerOpen] = useState(false);
  const [pending,          setPending]          = useState<Record<string, string[]>>({});

  const { visibleCols, cols, toggleCol, reorder, reset } = useColumnManager(allCols);

  // Search filtering: applied here so all views get it for free.
  // We match against visibleCols so hidden columns don't pollute results.
  const searchedRows = rows.filter(row => matchesSearch(row, visibleCols, search));

  const activeFilterCount = Object.values(applied).filter(v => v?.length > 0).length;
  const clearFilters      = () => onApply({});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>{title}</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
            {searchedRows.length} of {totalCount} {recordLabel}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setColumnDrawerOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: C.textMed, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}
          >
            ⊞ Columns
          </button>
          <button
            onClick={() => { setPending(applied); setFilterOpen(true); }}
            style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: activeFilterCount > 0 ? C.accent : C.textMed, background: activeFilterCount > 0 ? C.accentBg : C.surface, border: `1px solid ${activeFilterCount > 0 ? C.accent + "55" : C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}
          >
            ⚙ Filters{activeFilterCount > 0 && (
              <span style={{ background: C.accent, color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                {activeFilterCount}
              </span>
            )}
          </button>
          {primaryAction}
        </div>
      </div>

      {/* Search + active filter chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SearchBar value={search} onChange={onSearch} />
        <ActiveFilters
          filters={applied}
          onRemove={(k, v) => onApply({ ...applied, [k]: (applied[k] || []).filter(x => x !== v) })}
          onClear={clearFilters}
        />
      </div>

      {/* Optional banner */}
      {banner}

      {/* Table — receives already-searched rows */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <Table
          cols={visibleCols}
          rows={searchedRows}
          onRow={onRow}
          activeId={activeId}
          selectable={selectable}
          selected={selected}
          onToggle={onToggle}
          onToggleAll={onToggleAll}
          defaultSortKey={defaultSortKey}
        />
      </div>

      {/* Drawers */}
      {filterDefs.length > 0 && (
        <FilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          filterDefs={filterDefs}
          pending={pending}
          setPending={setPending}
          onApply={f => { onApply(f); setFilterOpen(false); }}
          onClear={clearFilters}
        />
      )}
      <ColumnDrawer
        open={columnDrawerOpen}
        onClose={() => setColumnDrawerOpen(false)}
        cols={cols}
        onToggle={toggleCol}
        onReorder={reorder}
        onReset={() => reset(allCols)}
      />
    </div>
  );
}