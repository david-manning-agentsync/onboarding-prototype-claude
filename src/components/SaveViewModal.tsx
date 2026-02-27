import { useState, useEffect } from "react";
import { C, Badge } from "../theme";

interface SaveViewModalProps {
  filters: Record<string, string[]>;
  onSave: (name: string) => void;
  onClose: () => void;
}

export function SaveViewModal({ filters, onSave, onClose }: SaveViewModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const active = Object.entries(filters).flatMap(([, v]) => v || []);
  const canSave = name.trim().length > 0;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 80 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 380, background: C.surface, borderRadius: 14,
        boxShadow: "0 8px 48px rgba(0,0,0,0.18)", zIndex: 81,
      }}>
        <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Save view</div>
          <div style={{ fontSize: 12, color: C.muted }}>Appears in the sidebar for quick access.</div>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 6 }}>View name</div>
          <input
            autoFocus value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && canSave) onSave(name.trim()); }}
            placeholder="e.g. My open tasks"
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          {active.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Filters included</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {active.map(v => <Badge key={v} label={v} small />)}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose}
            style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={() => canSave && onSave(name.trim())} disabled={!canSave}
            style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: canSave ? C.accent : C.muted, border: "none", borderRadius: 8, padding: "7px 18px", cursor: canSave ? "pointer" : "not-allowed" }}>
            Save view
          </button>
        </div>
      </div>
    </>
  );
}