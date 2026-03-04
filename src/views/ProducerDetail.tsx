// src/views/ProducerDetail.tsx
// Full producer detail view — Tasks (split panel), Details, and NIPR tabs (Licenses, Appointments, Regulatory Actions)

import { useState, useMemo } from "react";
import { C, Badge } from "../theme";
import type { Producer, Task } from "../data";
import { useVersion } from "../components/UI";

// ─── Types ────────────────────────────────────────────────────────────────────

interface License {
  state: string;
  licenseNumber: string;
  loa: string;
  status: "Active" | "Expired" | "Pending";
  effectiveDate: string;
  expirationDate: string;
}

interface Appointment {
  carrier: string;
  loa: string;
  state: string;
  status: "Active" | "Terminated" | "Pending";
  effectiveDate: string;
  terminationDate?: string;
}

interface RegulatoryAction {
  state: string;
  actionType: string;
  description: string;
  date: string;
  disposition: "Closed" | "Open" | "Pending";
}

// ─── Mock NIPR Data ───────────────────────────────────────────────────────────

const MOCK_LICENSES: Record<string, License[]> = {
  "8821033": [
    { state: "NC", licenseNumber: "NC1234567", loa: "Life",   status: "Active",  effectiveDate: "Jan 15, 2020", expirationDate: "Dec 31, 2025" },
    { state: "NC", licenseNumber: "NC1234567", loa: "Health", status: "Active",  effectiveDate: "Jan 15, 2020", expirationDate: "Dec 31, 2025" },
    { state: "SC", licenseNumber: "SC9876543", loa: "Life",   status: "Active",  effectiveDate: "Mar 1, 2021",  expirationDate: "Dec 31, 2025" },
    { state: "VA", licenseNumber: "VA4456789", loa: "Life",   status: "Expired", effectiveDate: "Jun 1, 2018",  expirationDate: "May 31, 2022" },
  ],
  "5512984": [
    { state: "TX", licenseNumber: "TX5512984", loa: "Life",   status: "Active",  effectiveDate: "Mar 1, 2022",  expirationDate: "Feb 28, 2026" },
    { state: "TX", licenseNumber: "TX5512984", loa: "Health", status: "Active",  effectiveDate: "Mar 1, 2022",  expirationDate: "Feb 28, 2026" },
  ],
};

const MOCK_APPOINTMENTS: Record<string, Appointment[]> = {
  "8821033": [
    { carrier: "Nationwide Life",     loa: "Life",   state: "NC", status: "Active",     effectiveDate: "Feb 10, 2021" },
    { carrier: "Nationwide Life",     loa: "Health", state: "NC", status: "Active",     effectiveDate: "Feb 10, 2021" },
    { carrier: "Lincoln National",    loa: "Life",   state: "NC", status: "Terminated", effectiveDate: "Jan 1, 2020",  terminationDate: "Jun 30, 2023" },
    { carrier: "Principal Financial", loa: "Life",   state: "SC", status: "Pending",    effectiveDate: "Oct 1, 2024" },
  ],
  "5512984": [
    { carrier: "Prudential Financial", loa: "Life",   state: "TX", status: "Active",  effectiveDate: "Apr 15, 2022" },
    { carrier: "Aetna",                loa: "Health", state: "TX", status: "Pending", effectiveDate: "Jan 10, 2025" },
  ],
};

const MOCK_REGULATORY_ACTIONS: Record<string, RegulatoryAction[]> = {
  "8821033": [],
  "5512984": [],
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>
      {label}
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? C.text : C.muted, fontWeight: value ? 500 : 400 }}>
        {value || "—"}
      </div>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 12 }}>
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div style={{ fontSize: 14, color: C.muted, textAlign: "center" }}>{message}</div>
    </div>
  );
}

function StatusDot({ status }: { status: "Active" | "Expired" | "Pending" | "Terminated" | "Open" | "Closed" }) {
  const colors: Record<string, string> = {
    Active: C.success, Expired: C.danger, Pending: C.warning,
    Terminated: C.danger, Open: C.warning, Closed: C.muted,
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors[status] || C.muted, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: colors[status] || C.muted, fontWeight: 500 }}>{status}</span>
    </span>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            fontSize: 13, fontWeight: active === t.id ? 600 : 500,
            color: active === t.id ? C.accent : C.muted,
            background: "none", border: "none",
            borderBottom: `2px solid ${active === t.id ? C.accent : "transparent"}`,
            padding: "10px 18px", cursor: "pointer", marginBottom: -1,
            transition: "color 0.15s",
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────

function TaskStatusTag({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Open:             { bg: "#eff6ff", text: "#1d4ed8" },
    "Needs Approval": { bg: "#fffbeb", text: "#92400e" },
    Approved:         { bg: "#ecfdf5", text: "#065f46" },
    Rejected:         { bg: "#fef2f2", text: "#991b1b" },
    Done:             { bg: "#f0fdf4", text: "#166534" },
  };
  const s = colors[status] || { bg: C.bg, text: C.muted };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.text, borderRadius: 5, padding: "2px 7px" }}>
      {status}
    </span>
  );
}

// ─── Task Detail Panel ────────────────────────────────────────────────────────

function TaskDetailPanel({ task, onAction, isProducerView }: {
  task: Task;
  onAction: (patch: Partial<Task>) => void;
  isProducerView: boolean;
}) {
  const [note,           setNote]           = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<"Yes" | "No" | null>(null);

  const isDone    = task.status === "Done" || task.status === "Approved";
  const isOpen    = task.status === "Open";
  const isWaiting = task.status === "Needs Approval";

  // Whether this task has a yes/no disclosure question
  const hasQuestion = !!task.question;

  // Disclosure tasks (question field present) always Mark Complete — never route to approval.
  // Producer view: always Mark Complete — producers never route to approval.
  // OM view: required producer-owned tasks go to Needs Approval.
  const isDisclosure = !!task.question;
  const actionLabel  = (isProducerView || isDisclosure) ? "Mark Complete" : (task.required && task.owner === "Producer" ? "Submit for Approval" : "Mark Done");
  const actionStatus = (isProducerView || isDisclosure) ? "Done"          : (task.required && task.owner === "Producer" ? "Needs Approval"      : "Done");

  // Disable the primary action if question is unanswered
  const primaryDisabled = isOpen && hasQuestion && selectedAnswer === null;

  // OM-only actions
  const canApprove = !isProducerView && isWaiting;
  const canReject  = !isProducerView && isWaiting;
  const canReopen  = !isProducerView && isDone && task.owner === "Producer";

  const handlePrimary = () => {
    if (!isOpen) return;
    const patch: Partial<Task> = { status: actionStatus as Task["status"] };
    // Persist the answer into the task's recorded answer field
    if (hasQuestion && selectedAnswer !== null) {
      patch.answer = selectedAnswer;
    }
    onAction(patch);
    setSelectedAnswer(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.surface, borderLeft: `1px solid ${C.border}` }}>

      {/* Panel header */}
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.3 }}>{task.name}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <TaskStatusTag status={task.status} />
          <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px" }}>{task.type}</span>
          {!isProducerView && (
            <span style={{ fontSize: 11, color: C.muted }}>Owner: <span style={{ color: C.textMed, fontWeight: 500 }}>{task.owner}</span></span>
          )}
          <span style={{ fontSize: 11, color: task.required ? C.danger : C.muted }}>
            {task.required ? "Required" : "Optional"}
          </span>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

        {/* Completion banner */}
        {isDone && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <span style={{ fontSize: 13, color: "#065f46", fontWeight: 500 }}>This task is complete</span>
          </div>
        )}

        {/* Waiting banner (producer view) */}
        {isProducerView && isWaiting && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
            <span style={{ fontSize: 16 }}>⏳</span>
            <span style={{ fontSize: 13, color: "#92400e", fontWeight: 500 }}>Submitted — your agency is reviewing this task.</span>
          </div>
        )}

        {/* Rejection note */}
        {task.status === "Rejected" && task.rejectionNote && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: C.danger, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 5 }}>
              {isProducerView ? "Your agency left a note" : "Rejection Note"}
            </div>
            <div style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.6 }}>{task.rejectionNote}</div>
          </div>
        )}

        {/* Task instructions */}
        <div style={{ marginBottom: hasQuestion && isOpen ? 20 : 0 }}>
          <SectionLabel label="Instructions" />
          <div style={{ fontSize: 14, color: C.textMed, lineHeight: 1.8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
            {task.detail}
          </div>
        </div>

        {/* Yes/No disclosure question — only shown when task is open */}
        {hasQuestion && isOpen && (
          <div style={{ marginTop: 20 }}>
            <SectionLabel label="Your Response" />
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 14px" }}>
              <div style={{ fontSize: 14, color: C.text, fontWeight: 500, lineHeight: 1.6, marginBottom: 14 }}>
                {task.question}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {(["Yes", "No"] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSelectedAnswer(opt)}
                    style={{
                      flex: 1, padding: "9px 0",
                      fontSize: 13, fontWeight: 600,
                      borderRadius: 8, cursor: "pointer",
                      border: `2px solid ${selectedAnswer === opt ? C.accent : C.border}`,
                      background: selectedAnswer === opt ? C.accent + "12" : C.surface,
                      color: selectedAnswer === opt ? C.accent : C.textMed,
                      transition: "all 0.15s",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedAnswer === "Yes" && task.yesWarning && (
                <div style={{ marginTop: 12, fontSize: 13, color: C.warning, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 7, padding: "9px 12px", lineHeight: 1.6 }}>
                  ⚠ {task.yesWarning}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Persisted answer — shown after task is done */}
        {isDone && task.answer && (
          <div style={{ marginTop: 20 }}>
            <SectionLabel label="Your Response" />
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{task.question}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{task.answer}</div>
            </div>
          </div>
        )}

        {/* OM-only: rejection note input */}
        {canReject && (
          <div style={{ marginTop: 20 }}>
            <SectionLabel label="Rejection Note (optional)" />
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Explain why this task is being rejected…" rows={3}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>

        {/* OM-only actions */}
        {canReopen && (
          <button onClick={() => onAction({ status: "Open" })}
            style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
            Reopen
          </button>
        )}
        {canReject && (
          <button onClick={() => { onAction({ status: "Rejected", rejectionNote: note }); setNote(""); }}
            style={{ fontSize: 13, fontWeight: 500, color: C.danger, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
            Reject
          </button>
        )}
        {canApprove && (
          <button onClick={() => onAction({ status: "Approved" })}
            style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.success, border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer" }}>
            Approve
          </button>
        )}

        {/* Resubmit after rejection */}
        {task.status === "Rejected" && (
          <button onClick={() => onAction({ status: "Open", rejectionNote: "" })}
            style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer" }}>
            Resubmit
          </button>
        )}

        {/* Primary action — open tasks only */}
        {isOpen && (
          <button
            onClick={handlePrimary}
            disabled={primaryDisabled}
            style={{
              fontSize: 13, fontWeight: 600, color: "#fff",
              background: primaryDisabled ? C.muted : C.accent,
              border: "none", borderRadius: 8, padding: "7px 18px",
              cursor: primaryDisabled ? "not-allowed" : "pointer",
              opacity: primaryDisabled ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────

function TasksTab({ tasks, onUpdateTask, isProducerView }: {
  tasks: Task[];
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  isProducerView: boolean;
}) {
  const [search,     setSearch]     = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q) ||
      t.owner.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  // Producer view: only show tasks they own or need to act on
  const visibleTasks = isProducerView
    ? filtered.filter(t => t.owner === "Producer")
    : filtered;

  const selectedTask = selectedId ? tasks.find(t => t.id === selectedId) || null : null;
  const done = tasks.filter(t => t.status === "Done" || t.status === "Approved").length;
  const producerTotal = isProducerView ? tasks.filter(t => t.owner === "Producer").length : tasks.length;
  const producerDone  = isProducerView ? tasks.filter(t => t.owner === "Producer" && (t.status === "Done" || t.status === "Approved")).length : done;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
      {/* Left: task list */}
      <div style={{ width: selectedTask ? "45%" : "100%", display: "flex", flexDirection: "column", transition: "width 0.2s", overflow: "hidden", borderRight: selectedTask ? `1px solid ${C.border}` : "none" }}>

        {/* Toolbar */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center", background: C.surface }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isProducerView ? "Search tasks…" : "Search by name, status, owner, or type…"}
            style={{ flex: 1, fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", outline: "none", background: C.bg, color: C.text, fontFamily: "inherit" }}
            onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border}
          />
          <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{producerDone} of {producerTotal} complete</span>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "10px 20px 0", background: C.surface }}>
          <div style={{ background: C.border, borderRadius: 99, height: 5 }}>
            <div style={{ width: `${producerTotal ? (producerDone / producerTotal) * 100 : 0}%`, background: C.success, borderRadius: 99, height: 5, transition: "width .4s" }} />
          </div>
        </div>

        {/* Task rows */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6, background: C.surface }}>
          {visibleTasks.length === 0 && (
            <EmptyState icon="✓" message="No tasks match your filters." />
          )}
          {visibleTasks.map(t => {
            const isSelected = selectedId === t.id;
            const isDone = t.status === "Done" || t.status === "Approved";
            return (
              <div key={t.id} onClick={() => setSelectedId(isSelected ? null : t.id)}
                style={{
                  background: isSelected ? C.accentBg : C.bg,
                  border: `1px solid ${isSelected ? C.accent : C.border}`,
                  borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  opacity: isDone ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = C.accent; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = C.border; }}>

                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isDone ? C.success : C.border}`, background: isDone ? C.success : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isDone && <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>✓</span>}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? C.accent : C.text, textDecoration: isDone ? "line-through" : "none" }}>{t.name}</span>
                    <TaskStatusTag status={t.status} />
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px" }}>{t.type}</span>
                    {!isProducerView && <span style={{ fontSize: 11, color: C.muted }}>Owner: {t.owner}</span>}
                    {t.required && <span style={{ fontSize: 11, color: C.danger }}>Required</span>}
                  </div>
                  {t.status === "Rejected" && t.rejectionNote && (
                    <div style={{ fontSize: 12, color: C.danger, marginTop: 5, background: "#fef2f2", borderRadius: 6, padding: "3px 8px", display: "inline-block" }}>
                      ↳ {t.rejectionNote}
                    </div>
                  )}
                </div>

                <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>{isSelected ? "←" : "→"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: task detail panel */}
      {selectedTask && (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TaskDetailPanel
            task={selectedTask}
            onAction={patch => onUpdateTask(selectedTask.id, patch)}
            isProducerView={isProducerView}
          />
        </div>
      )}
    </div>
  );
}

// ─── Details Tab ──────────────────────────────────────────────────────────────

function DetailsTab({ producer }: { producer: Producer }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", gap: 28 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <SectionLabel label="Producer Identity" />
          <FieldRow label="Full Name" value={producer.name} />
          <FieldRow label="National Producer Number (NPN)" value={producer.npn} />
          <FieldRow label="Resident State" value={producer.resident} />
          <FieldRow label="Email Address" value={(producer as any).email || null} />
          <FieldRow label="Phone Number" value={(producer as any).phone || null} />
          <FieldRow label="Date of Birth" value={(producer as any).dob || null} />
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
          <SectionLabel label="Licensing" />
          <FieldRow label="Resident License Number" value={(producer as any).residentLicense || null} />
          <FieldRow label="License Expiration" value={(producer as any).licenseExpiration || null} />
          <FieldRow label="Lines of Authority" value={(producer as any).loas?.join(", ") || null} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <SectionLabel label="Onboarding" />
          <FieldRow label="Process Status" value={producer.status} />
          <FieldRow label="Producer Readiness" value={producer.classification} />
          <FieldRow label="Invited" value={producer.invited} />
          <FieldRow label="Last Activity" value={producer.lastTask} />
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <SectionLabel label="E&O Coverage" />
          <FieldRow label="E&O Carrier" value={(producer as any).eoCarrier || null} />
          <FieldRow label="Policy Number" value={(producer as any).eoPolicyNumber || null} />
          <FieldRow label="Coverage Amount" value={(producer as any).eoCoverage || null} />
          <FieldRow label="Expiration Date" value={(producer as any).eoExpiration || null} />
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
          <SectionLabel label="Task Summary" />
          {(() => {
            const tasks = producer.tasks;
            const done = tasks.filter(t => t.status === "Done" || t.status === "Approved").length;
            const blocked = tasks.filter(t => t.status === "Rejected" || t.status === "Needs Approval").length;
            return (
              <>
                <FieldRow label="Total Tasks" value={String(tasks.length)} />
                <FieldRow label="Completed" value={`${done} of ${tasks.length}`} />
                {blocked > 0 && <FieldRow label="Needs Attention" value={`${blocked} task${blocked > 1 ? "s" : ""}`} />}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Licenses Tab ─────────────────────────────────────────────────────────────

function LicensesTab({ npn }: { npn: string }) {
  const licenses = MOCK_LICENSES[npn] || [];
  if (licenses.length === 0) return <EmptyState icon="📋" message="No license records found for this producer in NIPR." />;
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
      <div style={{ marginBottom: 12, fontSize: 12, color: C.muted }}>{licenses.length} license record{licenses.length !== 1 ? "s" : ""} · Source: NIPR</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {["State", "License #", "Line of Authority", "Status", "Effective", "Expiration"].map(h => (
              <th key={h} style={{ textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {licenses.map((l, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>{l.state}</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: C.textMed, fontFamily: "monospace" }}>{l.licenseNumber}</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: C.textMed }}>{l.loa}</td>
              <td style={{ padding: "11px 14px" }}><StatusDot status={l.status} /></td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: C.muted }}>{l.effectiveDate}</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: l.status === "Expired" ? C.danger : C.muted }}>{l.expirationDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Appointments Tab ─────────────────────────────────────────────────────────

function AppointmentsTab({ npn }: { npn: string }) {
  const appointments = MOCK_APPOINTMENTS[npn] || [];
  if (appointments.length === 0) return <EmptyState icon="🤝" message="No appointment records found for this producer in NIPR." />;
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
      <div style={{ marginBottom: 12, fontSize: 12, color: C.muted }}>{appointments.length} appointment record{appointments.length !== 1 ? "s" : ""} · Source: NIPR</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {["Carrier", "Line of Authority", "State", "Status", "Effective", "Terminated"].map(h => (
              <th key={h} style={{ textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {appointments.map((a, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>{a.carrier}</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: C.textMed }}>{a.loa}</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: C.textMed }}>{a.state}</td>
              <td style={{ padding: "11px 14px" }}><StatusDot status={a.status} /></td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: C.muted }}>{a.effectiveDate}</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: a.terminationDate ? C.danger : C.muted }}>{a.terminationDate || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Regulatory Actions Tab ───────────────────────────────────────────────────

function RegulatoryActionsTab({ npn }: { npn: string }) {
  const actions = MOCK_REGULATORY_ACTIONS[npn] || [];
  if (actions.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 12 }}>
        <div style={{ fontSize: 32 }}>✅</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No regulatory actions on file</div>
        <div style={{ fontSize: 13, color: C.muted, textAlign: "center", maxWidth: 320 }}>
          NIPR shows no disciplinary actions, license revocations, or regulatory orders for this producer.
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: C.muted }}>{actions.length} action{actions.length !== 1 ? "s" : ""} · Source: NIPR</span>
        <span style={{ fontSize: 11, fontWeight: 600, background: "#fef2f2", color: C.danger, borderRadius: 5, padding: "2px 8px" }}>Review Required</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {actions.map((a, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.actionType}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>State: {a.state} · {a.date}</div>
              </div>
              <StatusDot status={a.disposition} />
            </div>
            <div style={{ fontSize: 13, color: C.textMed, lineHeight: 1.6 }}>{a.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function ProducerHeader({ producer, isProducerView }: { producer: Producer; isProducerView: boolean }) {
  const tasks = producer.tasks;
  const producerTasks = isProducerView ? tasks.filter(t => t.owner === "Producer") : tasks;
  const done    = producerTasks.filter(t => t.status === "Done" || t.status === "Approved").length;
  const pct     = producerTasks.length ? Math.round((done / producerTasks.length) * 100) : 0;
  const blocked = producerTasks.filter(t => t.status === "Rejected" || t.status === "Needs Approval").length;

  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 28px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>{producer.name}</h2>
        <Badge label={producer.status} />
        {!isProducerView && <Badge label={producer.classification} />}
        {blocked > 0 && (
          <span style={{ fontSize: 12, fontWeight: 600, background: "#fef2f2", color: C.danger, borderRadius: 6, padding: "3px 9px" }}>
            {blocked} task{blocked > 1 ? "s" : ""} need{blocked === 1 ? "s" : ""} attention
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${isProducerView ? 3 : 5}, 1fr)`, gap: 10 }}>
        {(isProducerView ? [
          ["NPN",            producer.npn],
          ["Resident State", producer.resident],
          ["Task Progress",  `${done} / ${producerTasks.length} (${pct}%)`],
        ] : [
          ["NPN",            producer.npn],
          ["Resident State", producer.resident],
          ["Invited",        producer.invited],
          ["Last Activity",  producer.lastTask || "—"],
          ["Task Progress",  `${done} / ${producerTasks.length} (${pct}%)`],
        ] as [string, string][]).map(([l, v]) => (
          <div key={l} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3, fontWeight: 500 }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ProducerDetail({ producer: init, onBack, allProducers, setAllProducers, isProducerView = false }: {
  producer: Producer;
  onBack: () => void;
  allProducers: Producer[];
  setAllProducers: (fn: (prev: Producer[]) => Producer[]) => void;
  isProducerView?: boolean;
}) {
  const version  = useVersion();
  const producer = allProducers.find(p => p.id === init.id) || init;
  const hasNpn = true;

  const tabs = [
  { id: "tasks",   label: "Tasks" },
  { id: "details", label: "Details" },
  { id: "licenses",     label: "Licenses" },
  { id: "appointments", label: "Appointments" },
  { id: "regulatory",   label: "Regulatory Actions" },
  ...((version === "post-mvp" || version === "ai") ? [{ id: "activity", label: "Activity Log" }] : []),
];

  const [activeTab, setActiveTab] = useState("tasks");

  const updateTask = (taskId: string, patch: Partial<Task>) => {
    setAllProducers(prev => prev.map(p => {
      if (p.id !== producer.id) return p;
      return {
        ...p,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t),
        activityLog: patch.status ? [{
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          event: `Task ${patch.status === "Rejected" ? "rejected" : patch.status === "Approved" ? "approved" : "updated"}`,
          detail: `${p.tasks.find(t => t.id === taskId)?.name} → ${patch.status}`,
        }, ...p.activityLog] : p.activityLog,
      };
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Back nav */}
      {!isProducerView && (
        <div style={{ padding: "12px 28px 0", flexShrink: 0 }}>
          <button onClick={onBack}
            style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 13, padding: 0, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
            ← Back to Producers
          </button>
        </div>
      )}

      <ProducerHeader producer={producer} isProducerView={isProducerView} />

      <div style={{ padding: "0 28px", background: C.surface, flexShrink: 0 }}>
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeTab === "tasks" && (
          <TasksTab tasks={producer.tasks} onUpdateTask={updateTask} isProducerView={isProducerView} />
        )}
        {activeTab === "details" && (
            <DetailsTab producer={producer} />
            )}
            {activeTab === "licenses" && (
            <LicensesTab npn={producer.npn} />
            )}
            {activeTab === "appointments" && (
            <AppointmentsTab npn={producer.npn} />
            )}
            {activeTab === "regulatory" && (
            <RegulatoryActionsTab npn={producer.npn} />
            )}
        {activeTab === "activity" && (version === "post-mvp" || version === "ai") && !isProducerView && (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Activity Log</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {producer.activityLog.map((entry, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < producer.activityLog.length - 1 ? 16 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.accent, border: `2px solid ${C.accentBg}`, marginTop: 3 }} />
                      {i < producer.activityLog.length - 1 && <div style={{ width: 2, flex: 1, background: C.border, marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{entry.event}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>{entry.date}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMed }}>{entry.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}