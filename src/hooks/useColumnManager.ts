import { useState } from "react";
import type { ColDef } from "../components/Table";

export function useColumnManager<T>(allCols: ColDef<T>[]) {
  const [cols, setCols] = useState<ColDef<T>[]>(allCols);

  const toggleCol = (key: string) =>
    setCols(prev => prev.map(c => c.key === key ? { ...c, hidden: !c.hidden } : c));

  const reorder = (fromIdx: number, toIdx: number) =>
    setCols(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });

  const reset = (allCols: ColDef<T>[]) => setCols(allCols);

  const visibleCols = cols.filter(c => !c.hidden);

  return { cols, visibleCols, toggleCol, reorder, reset };
}