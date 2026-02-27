import { useState, useRef } from "react";
import { C } from "../theme";
import { Drawer } from "./Drawer";
import { POLICY_SETS_SEED } from "../data";

const STATES = ["AZ","CA","CO","FL","GA","IL","MI","MN","NC","NJ","NY","OH","PA","TN","TX","WA"];
const CSV_TEMPLATE = `Full Name,Email,NPN,Resident State\nJane Smith,jane@agency.com,1234567,CA\nJohn Doe,john@agency.com,,TX`;

// ─── Bulk Invite Drawer ───────────────────────────────────────────────────────
export function BulkInviteDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bulk_invite_template.csv";
    a.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) setFile(f);
  };

  const footer = (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button onClick={onClose}
        style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
        Cancel
      </button>
      <button onClick={onClose} disabled={!file}
        style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: file ? C.accent : C.muted, border: "none", borderRadius: 8, padding: "7px 18px", cursor: file ? "pointer" : "not-allowed" }}>
        Send Invites
      </button>
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Bulk Invite Producers" subtitle="Upload a CSV to invite multiple producers at once" footer={footer}>
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Step 1 */}
        <div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Step 1 — Download template</div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: C.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>bulk_invite_template.csv</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Name, Email, NPN, Resident State</div>
            </div>
            <button onClick={handleDownload}
              style={{ fontSize: 12, fontWeight: 600, color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>
              ↓ Download
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Step 2 — Upload completed file</div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{ background: dragging ? C.accentBg : C.bg, border: `2px dashed ${dragging ? C.accent : file ? C.success : C.border}`, borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "all .15s" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{file ? "✅" : "📂"}</div>
            {file ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.success }}>{file.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                  {(file.size / 1024).toFixed(1)} KB ·{" "}
                  <button onClick={e => { e.stopPropagation(); setFile(null); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 12, padding: 0 }}>
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textMed }}>Drop your CSV here or click to browse</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>.csv files only</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} style={{ display: "none" }} />
        </div>

        {/* Note */}
        <div style={{ background: C.accentBg, border: `1px solid ${C.accent}22`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, color: C.accentLight, lineHeight: 1.7 }}>
            Each row will generate an invite email. NPN and Resident State are optional — producers can provide them on first login. Duplicate emails will be skipped.
          </div>
        </div>
      </div>
    </Drawer>
  );
}

// ─── Invite Drawer ────────────────────────────────────────────────────────────
export function InviteDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", npn: "", state: "" });
  const [added, setAdded] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const req   = POLICY_SETS_SEED.filter(ps => ps.orgWide);
  const opt   = POLICY_SETS_SEED.filter(ps => !ps.orgWide);
  const avail = opt.filter(ps => !added.includes(ps.id));
  const toggle = (id: string) => setAdded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const canSubmit = !!(form.name && form.email);

  const footer = showPicker
    ? (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setShowPicker(false)}
          style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer" }}>
          Done
        </button>
      </div>
    ) : (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onClose}
          style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={onClose} disabled={!canSubmit}
          style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: canSubmit ? C.accent : C.muted, border: "none", borderRadius: 8, padding: "7px 18px", cursor: canSubmit ? "pointer" : "not-allowed" }}>
          Send Invite
        </button>
      </div>
    );

  return (
    <Drawer
      open={open} onClose={onClose}
      title={showPicker ? "Add Policy Sets" : "Invite Producer"}
      subtitle={showPicker ? undefined : "An email invite will be sent"}
      onBack={showPicker ? () => setShowPicker(false) : undefined}
      footer={footer}
    >
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
        {showPicker ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {opt.map(ps => {
              const isA = added.includes(ps.id);
              return (
                <div key={ps.id} onClick={() => toggle(ps.id)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, background: isA ? C.accentBg : C.bg, border: `1px solid ${isA ? C.accent : C.border}`, borderRadius: 10, cursor: "pointer" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isA ? C.accent : C.border}`, background: isA ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {isA && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ps.name}</div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{ps.desc} · {ps.tasks} tasks</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {/* Producer Info */}
            <div>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Producer Info</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {([["Full Name", "name", "Jane Smith"], ["Email Address", "email", "jane@agency.com"], ["NPN", "npn", "Leave blank if unknown"]] as [string, string, string][]).map(([label, key, ph]) => (
                  <div key={key}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 6 }}>
                      {label}{(key === "name" || key === "email") && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}
                    </div>
                    <input value={form[key as keyof typeof form]} onChange={e => setF(key, e.target.value)} placeholder={ph}
                      style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e => e.target.style.borderColor = C.border} />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 6 }}>Resident State</div>
                  <select value={form.state} onChange={e => setF("state", e.target.value)}
                    style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: form.state ? C.text : C.muted, fontSize: 13, outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Policy Sets */}
            <div>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Policy Sets</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {req.map(ps => (
                  <div key={ps.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ps.name}</span>
                        <span style={{ fontSize: 11, color: C.success, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 7px" }}>Required</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{ps.desc} · {ps.tasks} tasks</div>
                    </div>
                    <span style={{ fontSize: 12, color: C.muted }}>🔒</span>
                  </div>
                ))}
                {added.map(id => {
                  const ps = POLICY_SETS_SEED.find(p => p.id === id)!;
                  return (
                    <div key={id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: C.accentBg, border: `1px solid ${C.accent}33`, borderRadius: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ps.name}</div>
                        <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{ps.desc} · {ps.tasks} tasks</div>
                      </div>
                      <button onClick={() => toggle(id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
                    </div>
                  );
                })}
                {avail.length > 0 && (
                  <button onClick={() => setShowPicker(true)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", background: "transparent", border: `1px dashed ${C.border}`, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500, color: C.accentLight }}>
                    + Add policy set
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}