import { useState, useEffect } from "react";
import { C, Badge } from "../theme";
import { Drawer } from "./Drawer";
import type { Task, Producer } from "../data";

export function TaskDrawer({ task, producer, onClose, onUpdate, onPrev, onNext, hasPrev, hasNext }: {
  task: Task | null;
  producer: Producer | null;
  onClose: () => void;
  onUpdate: (patch: Partial<Task>) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const [note, setNote] = useState("");
  useEffect(() => { setNote(""); }, [task?.id]);

  // Arrow key navigation
  useEffect(() => {
    if (!task) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp"   && hasPrev) onPrev();
      if (e.key === "ArrowDown" && hasNext) onNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [task, hasPrev, hasNext, onPrev, onNext]);

  if (!task) return null;

  const primary = (() => {
    if (task.status === "Open")          return { label: task.required && task.owner === "Producer" ? "Submit for Approval" : "Mark Done", patch: { status: task.required && task.owner === "Producer" ? "Needs Approval" : "Done" } };
    if (task.status === "Needs Approval") return { label: "Approve", patch: { status: "Approved" } };
    if (task.status === "Rejected")       return { label: "Resubmit", patch: { status: "Open", rejectionNote: "" } };
    return null;
  })();

  const canReject = task.status === "Needs Approval";
  const canReopen = task.status === "Done" && task.owner === "Producer";

  const header = (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 6 }}>{task.name}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Badge label={task.status} />
        <span style={{ fontSize: 11, color: C.muted }}>
          <span style={{ color: C.accentLight, fontWeight: 500 }}>{producer?.name}</span>
          {" · "}{task.type}{" · "}Required: <span style={{ color: task.required ? C.danger : C.muted }}>{task.required ? "Yes" : "No"}</span>
        </span>
      </div>
    </div>
  );

  const footer = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Prev/Next navigation */}
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={onPrev} disabled={!hasPrev}
          style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: hasPrev ? C.bg : "transparent", color: hasPrev ? C.textMed : C.border, cursor: hasPrev ? "pointer" : "default", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
        <button onClick={onNext} disabled={!hasNext}
          style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: hasNext ? C.bg : "transparent", color: hasNext ? C.textMed : C.border, cursor: hasNext ? "pointer" : "default", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>↓</button>
      </div>
      <div style={{ flex: 1 }} />
      {(task.status === "Done" || task.status === "Approved") && (
        <span style={{ fontSize: 12, color: C.success, fontWeight: 500 }}>✓ Complete</span>
      )}
      {canReopen && (
        <button onClick={() => onUpdate({ status: "Open" })}
          style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
          Reopen
        </button>
      )}
      {canReject && (
        <button onClick={() => { onUpdate({ status: "Rejected", rejectionNote: note }); setNote(""); }}
          style={{ fontSize: 13, fontWeight: 500, color: C.danger, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
          Reject
        </button>
      )}
      {primary && (
        <button onClick={() => onUpdate(primary.patch as Partial<Task>)}
          style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer" }}>
          {primary.label}
        </button>
      )}
    </div>
  );

  return (
    <Drawer
      open={!!task}
      onClose={onClose}
      title={task.name}
      headerContent={header}
      footer={footer}
    >
      <div style={{ padding: "24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Task Content</div>
          <div style={{ fontSize: 14, color: C.textMed, lineHeight: 1.8 }}>{task.detail}</div>
        </div>

        {task.status === "Rejected" && task.rejectionNote && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: C.danger, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Rejection Note</div>
            <div style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.6 }}>{task.rejectionNote}</div>
          </div>
        )}

        {canReject && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Rejection Note <span style={{ fontSize: 10, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Explain why this task is being rejected…" rows={3}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
        )}
      </div>
    </Drawer>
  );
}