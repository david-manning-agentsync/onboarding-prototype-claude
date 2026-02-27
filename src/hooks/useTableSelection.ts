import { useState } from "react";

export function useTableSelection<T extends { id: string }>(rows: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const allSelected  = rows.length > 0 && rows.every(r => selected.has(r.id));
  const someSelected = rows.some(r => selected.has(r.id));

  const toggleAll = () =>
    setSelected(prev => {
      const n = new Set(prev);
      if (allSelected) rows.forEach(r => n.delete(r.id));
      else             rows.forEach(r => n.add(r.id));
      return n;
    });

  const selCount   = rows.filter(r => selected.has(r.id)).length;
  const setFromIds = (ids: string[]) => setSelected(new Set(ids));
  const clear      = ()              => setSelected(new Set());

  return { selected, toggleRow, toggleAll, selCount, allSelected, someSelected, setFromIds, clear };
}