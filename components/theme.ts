// ─── Colors ───────────────────────────────────────────────────────────────────
export const C = {
  bg: "#f5f6fa", surface: "#ffffff", border: "#e5e7eb", borderLight: "#f0f1f5",
  accent: "#4f46e5", accentLight: "#6366f1", accentBg: "#eef2ff",
  success: "#059669", warning: "#d97706", danger: "#dc2626",
  muted: "#9ca3af", textDim: "#6b7280", text: "#111827", textMed: "#374151",
  ai: "#7c3aed", aiBg: "#f5f3ff", aiBorder: "#ddd6fe",
};

// ─── Badge Colors ─────────────────────────────────────────────────────────────
export const BADGE: Record<string, { bg: string; color: string; dot: string }> = {
  "Needs License":    { bg: "#f5f3ff", color: "#6d28d9", dot: "#7c3aed" },
  "Needs LOAs":       { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  "Reg Tasks Only":   { bg: "#f0fdf4", color: "#065f46", dot: "#059669" },
  "Org Requirements": { bg: "#fffbeb", color: "#92400e", dot: "#d97706" },
  Invited:            { bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af" },
  "In Progress":      { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  "Waiting/Blocked":  { bg: "#fffbeb", color: "#92400e", dot: "#d97706" },
  Completed:          { bg: "#f0fdf4", color: "#065f46", dot: "#059669" },
  Terminated:         { bg: "#fef2f2", color: "#991b1b", dot: "#dc2626" },
  Open:               { bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af" },
  "Needs Approval":   { bg: "#fffbeb", color: "#92400e", dot: "#d97706" },
  Approved:           { bg: "#f0fdf4", color: "#065f46", dot: "#059669" },
  Rejected:           { bg: "#fef2f2", color: "#991b1b", dot: "#dc2626" },
  Done:               { bg: "#f0fdf4", color: "#065f46", dot: "#059669" },
};

// ─── Badge Component ──────────────────────────────────────────────────────────
export const Badge = ({ label, small }: { label: string; small?: boolean }) => {
  const s = BADGE[label] || { bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, padding: small ? "2px 7px" : "3px 9px", borderRadius: 99, fontSize: small ? 11 : 12, fontWeight: 500, border: `1px solid ${s.dot}22` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />{label}
    </span>
  );
};
