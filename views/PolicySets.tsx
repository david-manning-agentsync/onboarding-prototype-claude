import { useState, useEffect } from "react";
import { C } from "../theme";
import { POLICY_SETS_SEED, POLICY_REQS } from "../data";
import { useVersion } from "../components/UI";

// ─── Constants ────────────────────────────────────────────────────────────────
const TASK_TYPES  = ["Regulatory", "Org"];
const TASK_OWNERS = ["Producer", "Customer"];

const EXAMPLE_PROMPTS = [
  "Licensed P&C producer in a state requiring background check and carrier appointment",
  "Life and health producer needing LOA verification and compliance training",
  "New unlicensed producer who needs to obtain their resident license",
];

// ─── AI Task Generator ────────────────────────────────────────────────────────
async function generatePolicyTasks(description: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You generate onboarding task lists for insurance producers. Return ONLY a JSON array of tasks, no prose, no markdown.
Each task: {"name":string,"type":"Regulatory"|"Org","owner":"Producer"|"Customer","required":true|false,"detail":string}
Generate 5-8 realistic tasks based on the description. Regulatory tasks relate to licensing/compliance. Org tasks relate to company processes.`,
      messages: [{ role: "user", content: `Generate onboarding tasks for: ${description}` }],
    }),
  });
  const d = await res.json();
  const txt = d.content?.find((b: any) => b.type === "text")?.text || "[]";
  return JSON.parse(txt.replace(/```json|```/g, "").trim());
}

// ─── Policy Set Modal ─────────────────────────────────────────────────────────
function PolicySetModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (ps: { name: string; tasks: any[] }) => void;
}) {
  const [step,       setStep]       = useState<"choose" | "ai-prompt" | "ai-review" | "manual">("choose");
  const [psName,     setPsName]     = useState("");
  const [aiPrompt,   setAiPrompt]   = useState("");
  const [loading,    setLoading]    = useState(false);
  const [tasks,      setTasks]      = useState<any[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    try {
      const t = await generatePolicyTasks(aiPrompt);
      setTasks(t.map((t: any, i: number) => ({ ...t, id: `gen-${i}` })));
      setStep("ai-review");
    } catch { setTasks([]); }
    setLoading(false);
  };

  const addManualTask = () => setTasks(prev => [...prev, { id: `m-${Date.now()}`, name: "", type: "Regulatory", owner: "Producer", required: true, detail: "" }]);
  const removeTask    = (idx: number) => setTasks(prev => prev.filter((_, i) => i !== idx));
  const updateTask    = (idx: number, patch: any) => setTasks(prev => prev.map((t, i) => i === idx ? { ...t, ...patch } : t));

  const canSave = psName.trim() && tasks.length > 0 && tasks.every(t => t.name.trim());

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 60 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 580, maxHeight: "85vh", background: C.surface, borderRadius: 16, boxShadow: "0 12px 60px rgba(0,0,0,0.2)", zIndex: 61, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
              {step === "choose"     && "New Policy Set"}
              {step === "ai-prompt"  && <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14, color: C.ai }}>✦</span>Generate with AI</span>}
              {step === "ai-review"  && <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14, color: C.ai }}>✦</span>Review AI-Generated Tasks</span>}
              {step === "manual"     && "Build Manually"}
            </div>
            {(step === "ai-review" || step === "manual") && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Edit tasks before saving</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {(step === "ai-prompt" || step === "ai-review" || step === "manual") && (
              <button onClick={() => setStep("choose")} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>← Back</button>
            )}
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18, padding: 4, borderRadius: 6 }}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* Choose path */}
          {step === "choose" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 6 }}>Policy set name <span style={{ color: C.danger }}>*</span></div>
                <input value={psName} onChange={e => setPsName(e.target.value)} placeholder="e.g. Licensed P&C Producer"
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
                <div onClick={() => psName.trim() && setStep("ai-prompt")}
                  style={{ background: psName.trim() ? C.aiBg : C.bg, border: `1.5px solid ${psName.trim() ? C.aiBorder : C.border}`, borderRadius: 12, padding: 20, cursor: psName.trim() ? "pointer" : "not-allowed", opacity: psName.trim() ? 1 : 0.5 }}>
                  <div style={{ fontSize: 22, marginBottom: 10 }}>✦</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: psName.trim() ? C.ai : C.textDim, marginBottom: 6 }}>Generate with AI</div>
                  <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>Describe the producer type or process. AI will suggest a task list you can review and edit.</div>
                </div>
                <div onClick={() => psName.trim() && setStep("manual")}
                  style={{ background: psName.trim() ? C.bg : "#fafafa", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: psName.trim() ? "pointer" : "not-allowed", opacity: psName.trim() ? 1 : 0.5 }}>
                  <div style={{ fontSize: 22, marginBottom: 10 }}>⊞</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.textMed, marginBottom: 6 }}>Build manually</div>
                  <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>Add tasks one by one using the task builder. Full control over every field.</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4, padding: "0 2px" }}>Enter a policy set name to continue.</div>
            </div>
          )}

          {/* AI prompt */}
          {step === "ai-prompt" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: C.ai, lineHeight: 1.6 }}>
                Describe the producer type, licensing requirements, or onboarding process. AI will generate a recommended task list.
              </div>
              <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4}
                placeholder="e.g. Licensed P&C producer in California requiring background check, E&O insurance, carrier appointment, and compliance training…"
                style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = C.ai}
                onBlur={e => e.target.style.borderColor = C.border} />
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Example prompts</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {EXAMPLE_PROMPTS.map(p => (
                    <button key={p} onClick={() => setAiPrompt(p)} style={{ textAlign: "left", fontSize: 12, color: C.ai, background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Task editor — shared by ai-review and manual */}
          {(step === "ai-review" || step === "manual") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {loading && [1,2,3,4,5].map(i => (
                <div key={i} style={{ background: C.bg, borderRadius: 10, padding: 14, border: `1px solid ${C.border}`, height: 56, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 120 + (i % 3) * 40, height: 13, background: C.border, borderRadius: 6 }} />
                  <div style={{ width: 60, height: 13, background: C.borderLight, borderRadius: 6 }} />
                </div>
              ))}
              {!loading && tasks.map((t, idx) => (
                <div key={t.id} style={{ background: editingIdx === idx ? C.accentBg : C.bg, border: `1.5px solid ${editingIdx === idx ? C.accent : C.border}`, borderRadius: 10, padding: 14, transition: "all .15s" }}>
                  {editingIdx === idx ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <input value={t.name} onChange={e => updateTask(idx, { name: e.target.value })} placeholder="Task name"
                        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit" }}
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
                      <textarea value={t.detail} onChange={e => updateTask(idx, { detail: e.target.value })} placeholder="Task description" rows={2}
                        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", fontSize: 12, color: C.textMed, outline: "none", resize: "none", fontFamily: "inherit" }}
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <select value={t.type} onChange={e => updateTask(idx, { type: e.target.value })} style={{ fontSize: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 10px", color: C.text, outline: "none", cursor: "pointer" }}>
                          {TASK_TYPES.map(ty => <option key={ty} value={ty}>{ty}</option>)}
                        </select>
                        <select value={t.owner} onChange={e => updateTask(idx, { owner: e.target.value })} style={{ fontSize: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 10px", color: C.text, outline: "none", cursor: "pointer" }}>
                          {TASK_OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textMed, cursor: "pointer" }}>
                          <input type="checkbox" checked={t.required} onChange={e => updateTask(idx, { required: e.target.checked })} style={{ cursor: "pointer" }} /> Required
                        </label>
                        <div style={{ flex: 1 }} />
                        <button onClick={() => setEditingIdx(null)} style={{ fontSize: 12, fontWeight: 500, color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}33`, borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}>Done</button>
                        <button onClick={() => removeTask(idx)} style={{ fontSize: 12, color: C.danger, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name || <span style={{ color: C.muted, fontStyle: "italic" }}>Untitled task</span>}</span>
                          <span style={{ fontSize: 11, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px" }}>{t.type}</span>
                          <span style={{ fontSize: 11, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px" }}>{t.owner}</span>
                          {t.required && <span style={{ fontSize: 11, color: C.success, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 6px" }}>Required</span>}
                        </div>
                        {t.detail && <div style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>{t.detail}</div>}
                      </div>
                      <button onClick={() => setEditingIdx(idx)} style={{ fontSize: 12, color: C.accentLight, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, flexShrink: 0 }}>Edit</button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addManualTask} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, background: "transparent", border: `1px dashed ${C.border}`, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500, color: C.accentLight }}>
                + Add task
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
          {step === "ai-prompt" && (
            <button onClick={handleGenerate} disabled={!aiPrompt.trim() || loading}
              style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: aiPrompt.trim() && !loading ? C.ai : C.muted, border: "none", borderRadius: 8, padding: "8px 20px", cursor: aiPrompt.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 7 }}>
              {loading ? <>Generating…</> : <><span>✦</span>Generate tasks</>}
            </button>
          )}
          {(step === "ai-review" || step === "manual") && (
            <>
              <button onClick={onClose} style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => canSave && onSave({ name: psName, tasks })} disabled={!canSave}
                style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: canSave ? C.accent : C.muted, border: "none", borderRadius: 8, padding: "8px 20px", cursor: canSave ? "pointer" : "not-allowed" }}>
                Save policy set
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Policy Sets View ─────────────────────────────────────────────────────────
export function PolicySets() {
  const version = useVersion();
  const isAI   = version === "ai";
  const isPlus  = version === "post-mvp" || isAI;

  const [sets,       setSets]       = useState<Record<string, string[]>>(Object.fromEntries(Object.entries(POLICY_REQS).map(([k, v]) => [k, [...v]])));
  const [customSets, setCustomSets] = useState<any[]>([]);
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [dragging,   setDragging]   = useState<{ psId: string; idx: number } | null>(null);
  const [dragOver,   setDragOver]   = useState<number | null>(null);
  const [showModal,  setShowModal]  = useState(false);

  const handleDrop = (e: React.DragEvent, psId: string, toIdx: number) => {
    e.preventDefault();
    if (!dragging || dragging.psId !== psId) return;
    const reqs = [...sets[psId]];
    const [item] = reqs.splice(dragging.idx, 1);
    reqs.splice(toIdx, 0, item);
    setSets(prev => ({ ...prev, [psId]: reqs }));
    setDragging(null); setDragOver(null);
  };

  const handleSavePS = ({ name, tasks }: { name: string; tasks: any[] }) => {
    const id = `ps-${Date.now()}`;
    setCustomSets(prev => [...prev, { id, name, tasks, orgWide: false }]);
    setExpanded(id);
    setShowModal(false);
  };

  const allSets = [...POLICY_SETS_SEED, ...customSets];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>Policy Sets</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Define onboarding requirement groups</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: isAI ? C.ai : C.accent, border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
          {isAI && <span style={{ fontSize: 12 }}>✦</span>}+ New Policy Set
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {allSets.map(s => {
          const reqs = sets[s.id] || s.tasks?.map((t: any) => t.name) || [];
          const isCustom = !!s.tasks;
          return (
            <div key={s.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div onClick={() => setExpanded(expanded === s.id ? null : s.id)} style={{ display: "flex", alignItems: "center", padding: "16px 20px", cursor: "pointer", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: isAI && isCustom ? C.aiBg : C.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {isAI && isCustom ? "✦" : "⚙"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.name}</div>
                    {isAI && isCustom && <span style={{ fontSize: 10, fontWeight: 600, color: C.ai, background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 99, padding: "1px 7px" }}>AI generated</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{reqs.length} requirements</div>
                </div>
                {s.orgWide && <span style={{ fontSize: 11, color: C.success, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "2px 8px" }}>Org-wide</span>}
                <span style={{ color: C.muted, fontSize: 12 }}>{expanded === s.id ? "▲" : "▼"}</span>
              </div>

              {expanded === s.id && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 20px", background: C.bg }}>
                  {isPlus && !isCustom && <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Drag to reorder requirements</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(isCustom ? s.tasks : reqs.map((r: string) => ({ name: r, type: null, owner: null, required: null }))).map((item: any, i: number) => {
                      const label = typeof item === "string" ? item : item.name;
                      return (
                        <div key={i}
                          draggable={isPlus && !isCustom}
                          onDragStart={() => setDragging({ psId: s.id, idx: i })}
                          onDragOver={e => { e.preventDefault(); setDragOver(i); }}
                          onDrop={e => handleDrop(e, s.id, i)}
                          onDragEnd={() => { setDragging(null); setDragOver(null); }}
                          style={{ display: "flex", alignItems: "center", gap: 10, background: dragOver === i && dragging?.psId === s.id ? C.accentBg : C.surface, border: `1px solid ${dragOver === i && dragging?.psId === s.id ? C.accent : C.border}`, borderRadius: 8, padding: "9px 12px", cursor: isPlus && !isCustom ? "grab" : "default" }}>
                          {isPlus && !isCustom && <span style={{ color: C.muted, fontSize: 14 }}>⠿</span>}
                          <span style={{ fontSize: 11, color: C.muted, width: 18, textAlign: "center", fontWeight: 600 }}>{i + 1}</span>
                          <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{label}</span>
                          {isCustom && item.type     && <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px" }}>{item.type}</span>}
                          {isCustom && item.owner    && <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px" }}>{item.owner}</span>}
                          {isCustom && item.required && <span style={{ fontSize: 11, color: C.success, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 6px" }}>Required</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button style={{ fontSize: 12, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 11px", cursor: "pointer" }}>Edit</button>
                    <button style={{ fontSize: 12, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 11px", cursor: "pointer" }}>+ Add Requirement</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && <PolicySetModal onClose={() => setShowModal(false)} onSave={handleSavePS} />}
    </div>
  );
}
