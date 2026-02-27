import { C } from "../theme";

export interface BottomBarAction {
  label: string;
  onClick: () => void;
  /** Renders with green accent styling (e.g. "Set Org Required") */
  highlight?: boolean;
  /** Renders dimly (e.g. "Remove") */
  muted?: boolean;
}

export interface BottomBarGroup {
  label: string;
  actions: BottomBarAction[];
}

interface BottomBarProps {
  /** px width of the left nav — used to offset centering into the content area */
  navWidth?: number;
  selCount: number;
  groups: BottomBarGroup[];
  onClear: () => void;
  onAskAI: () => void;
  /** When true, the action bar is shown alongside Ask AI */
  showActions: boolean;
  maxWidth?: number;
}

export function BottomBar({
  navWidth = 240,
  selCount,
  groups,
  onClear,
  onAskAI,
  showActions,
  maxWidth = 900,
}: BottomBarProps) {
  return (
    <div style={{
      position: "fixed", bottom: 0,
      left: navWidth, right: 0,
      display: "flex", justifyContent: "center",
      zIndex: 40, pointerEvents: "none",
    }}>
      <div style={{
        display: "flex", alignItems: "stretch",
        borderRadius: "12px 12px 0 0", overflow: "hidden",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
        pointerEvents: "auto",
        ...(showActions ? { width: "100%", maxWidth } : {}),
      }}>
        {/* Ask AI button */}
        <button onClick={onAskAI}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", background: C.ai, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0, borderRight: showActions ? `1px solid ${C.aiBorder}` : "none", borderRadius: showActions ? 0 : "12px 12px 0 0" }}>
          <span style={{ fontSize: 14 }}>✦</span> Ask AI
        </button>

        {/* Action bar */}
        {showActions && (
          <div style={{ flex: 1, background: C.text, padding: "0 20px", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{selCount} selected</span>

            {groups.map((g, gi) => (
              <>
                <div key={`div-${gi}`} style={{ width: 1, height: 18, background: C.textMed, flexShrink: 0 }} />
                {g.label && <span key={`lbl-${gi}`} style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>{g.label}:</span>}
                {g.actions.map(a => (
                  <button key={a.label} onClick={a.onClick}
                    style={{
                      fontSize: 12, fontWeight: 600, borderRadius: 7, padding: "5px 10px", cursor: "pointer", flexShrink: 0, border: "1px solid",
                      ...(a.highlight
                        ? { color: C.success,  background: C.accentBg,  borderColor: C.success + "44" }
                        : a.muted
                        ? { color: C.muted,    background: C.textDim + "22", borderColor: C.textDim + "44" }
                        : { color: "#fff",     background: C.textDim + "33", borderColor: C.textDim + "55", textTransform: "capitalize" as const }),
                    }}>
                    {a.label}
                  </button>
                ))}
              </>
            ))}

            <button onClick={onClear}
              style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", marginLeft: "auto", flexShrink: 0 }}>
              ✕ Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}