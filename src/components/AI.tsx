import { useState, useRef } from "react";
import { C } from "../theme";

// ─── Suggestions ──────────────────────────────────────────────────────────────
const PRODUCER_SUGGESTIONS = [
  "Show producers with no activity in 60 days",
  "Find all invited producers in California",
  "Filter to waiting or blocked producers needing license",
];
const TASK_SUGGESTIONS = [
  "Create a view of all open regulatory tasks",
  "Show tasks waiting for approval",
  "Find all rejected tasks across producers",
];

// ─── Claude API Call ──────────────────────────────────────────────────────────
export function callClaude(prompt: string) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are an AI assistant embedded in an insurance producer onboarding platform. 
You interpret natural language queries about producers and tasks and return structured JSON only — no prose, no markdown fences.

For producer queries return:
{"type":"filter","target":"producers","filters":{"status":[],"classification":[],"resident":[]},"selectedAll":true|false,"action":null|"terminate"|"save_view","actionLabel":null|string,"suggestedViewName":null|string,"summary":string}

For task queries return:
{"type":"filter","target":"tasks","filters":{"status":[],"type":[],"owner":[]},"selectedAll":true|false,"action":null|"save_view","actionLabel":null|string,"suggestedViewName":null|string,"summary":string}

Valid producer status values: Invited, In Progress, Waiting/Blocked, Completed, Terminated
Valid producer classification values: Needs License, Needs LOAs, Reg Tasks Only, Org Requirements
Valid resident values: two-letter US state codes
Valid task status values: Open, Needs Approval, Approved, Rejected, Done
Valid task type values: Org, Regulatory
Valid task owner values: Producer, Customer

"No activity in 60 days" means status is Invited (they never started). Map intent carefully.
If the query implies a bulk action like "terminate", set action to "terminate" and selectedAll to true.
If the query implies saving a view, set action to "save_view" and provide a suggestedViewName.
summary should be a short 1-sentence human-readable explanation of what you did.`,
      messages: [{ role: "user", content: prompt }],
    }),
  }).then(r => r.json()).then(d => {
    const txt = d.content?.find((b: any) => b.type === "text")?.text || "{}";
    return JSON.parse(txt.replace(/```json|```/g, "").trim());
  });
}

// ─── AI Command Bar ───────────────────────────────────────────────────────────
export function AICommandBar({ tableType, onResult, onCollapse, collapsed }: {
  tableType: "producers" | "tasks";
  onResult: (res: any, query: string) => void;
  onCollapse: () => void;
  collapsed: boolean;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = tableType === "producers" ? PRODUCER_SUGGESTIONS : TASK_SUGGESTIONS;

  const handleSubmit = async (q?: string) => {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await callClaude(text);
      onResult(res, text);
      setQuery("");
    } catch (e) {
      setError("Couldn't parse that — try rephrasing.");
    } finally { setLoading(false); }
  };

  if (collapsed) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 4 }}>
        <button onClick={onCollapse} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: C.ai, background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 99, padding: "5px 14px", cursor: "pointer", boxShadow: "0 2px 8px rgba(124,58,237,0.12)" }}>
          <span style={{ fontSize: 14 }}>✦</span> Ask AI
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: C.surface, border: `1.5px solid ${C.aiBorder}`, borderRadius: 16, padding: "14px 16px", boxShadow: "0 4px 24px rgba(124,58,237,0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 15, color: C.ai }}>✦</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.ai, flex: 1 }}>Ask AI</span>
        <button onClick={onCollapse} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, padding: "2px 6px", borderRadius: 6 }}>↓ Hide</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={tableType === "producers" ? "e.g. terminate all producers with no activity in 60 days…" : "e.g. create a view of all open regulatory tasks…"}
          style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit" }}
          onFocus={e => e.target.style.borderColor = C.ai}
          onBlur={e => e.target.style.borderColor = C.border}
          disabled={loading} />
        <button onClick={() => handleSubmit()} disabled={loading || !query.trim()}
          style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: loading || !query.trim() ? C.muted : C.ai, color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading || !query.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {loading ? "…" : "Run"}
        </button>
      </div>
      {error && <div style={{ fontSize: 12, color: C.danger, marginTop: 8 }}>{error}</div>}
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => handleSubmit(s)} disabled={loading}
            style={{ fontSize: 11, color: C.ai, background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 99, padding: "3px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AI Result Banner ─────────────────────────────────────────────────────────
export function AIResultBanner({ result, selectedCount, onConfirmAction, onSaveView, onDismiss }: {
  result: any;
  selectedCount: number;
  onConfirmAction: () => void;
  onSaveView: (name: string) => void;
  onDismiss: () => void;
}) {
  const [viewName, setViewName] = useState(result?.suggestedViewName || "");
  if (!result) return null;
  return (
    <div style={{ background: "#1e1b4b", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: "0 4px 20px rgba(79,70,229,0.2)" }}>
      <span style={{ fontSize: 14, color: C.aiBorder }}>✦</span>
      <span style={{ fontSize: 13, color: "#c7d2fe", flex: 1 }}>
        {result.summary}
        {selectedCount > 0 && result.selectedAll && <span style={{ color: "#a5b4fc", fontWeight: 600 }}> — {selectedCount} selected</span>}
      </span>
      {result.action === "terminate" && selectedCount > 0 && (
        <button onClick={onConfirmAction} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: "1px solid #f87171", background: "rgba(239,68,68,0.15)", color: "#f87171", cursor: "pointer" }}>
          Terminate {selectedCount} producers
        </button>
      )}
      {result.action === "save_view" && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input value={viewName} onChange={e => setViewName(e.target.value)}
            style={{ fontSize: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "5px 10px", color: "#fff", outline: "none", width: 160 }}
            placeholder="View name…" />
          <button onClick={() => onSaveView(viewName)} disabled={!viewName.trim()}
            style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: "1px solid #a5b4fc", background: "rgba(165,180,252,0.15)", color: "#a5b4fc", cursor: "pointer" }}>
            Save view
          </button>
        </div>
      )}
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 16, padding: "2px 4px" }}>×</button>
    </div>
  );
}
