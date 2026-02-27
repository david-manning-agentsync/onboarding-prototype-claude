import { useEffect } from "react";
import { C } from "../theme";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Back button — shows ← in header when provided */
  onBack?: () => void;
  /** Replaces default title/subtitle block for complex headers (e.g. TaskDrawer) */
  headerContent?: React.ReactNode;
  /** Fixed footer content — rendered below scrollable body */
  footer?: React.ReactNode;
  /** Default 480 */
  width?: number;
  children: React.ReactNode;
}

export function Drawer({
  open, onClose, title, subtitle, onBack,
  headerContent, footer, width = 480, children,
}: DrawerProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.18)",
          zIndex: 70,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .2s",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width,
        background: C.surface,
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        borderLeft: `1px solid ${C.border}`,
        zIndex: 71,
        transform: open ? "translateX(0)" : `translateX(${width}px)`,
        transition: "transform .25s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{
          padding: "18px 24px 14px",
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {onBack && (
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18, padding: "2px 6px", borderRadius: 6, flexShrink: 0 }}>←</button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {headerContent ?? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{title}</div>
                {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
              </>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18, padding: 4, borderRadius: 6, flexShrink: 0 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}