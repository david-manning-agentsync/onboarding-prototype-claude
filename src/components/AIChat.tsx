import { useState, useRef, useEffect } from "react";
import { C } from "../theme";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
  action?: AIChatAction | null;
}

export interface AIChatAction {
  type: string;
  value: any;
  label: string;
  ids: string[];
}

interface AIChatProps {
  open: boolean;
  onToggle: () => void;
  onFilter: (ids: string[] | null) => void;
  onAction: (a: AIChatAction) => void;
  filteredIds: string[] | null;
  selectedIds: number;
  pendingAiAction: AIChatAction | null;
  onClearPending: () => void;
  prompts: string[];
  onSendMessage: (msg: string, addMessage: (m: AIChatMessage) => void, setLoading: (v: boolean) => void) => void;
  placeholder?: string;
}

export function AIChat({
  open, onToggle, onFilter, onAction, filteredIds,
  selectedIds, pendingAiAction, onClearPending,
  prompts, onSendMessage, placeholder = "Ask anything…",
}: AIChatProps) {
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [loading,  setLoading]  = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const prevOpen   = useRef(open);

  // Welcome-back message when reopening with rows selected
  useEffect(() => {
    if (open && !prevOpen.current && selectedIds > 0) {
      const content = pendingAiAction
        ? `Welcome back — you have **${selectedIds} item${selectedIds !== 1 ? "s" : ""}** selected. Would you like to proceed with: **${pendingAiAction.label}**?`
        : `Welcome back — you now have **${selectedIds} item${selectedIds !== 1 ? "s" : ""}** selected. What would you like to do with them?`;
      setMessages(prev => [...prev.filter(m => !m.content.startsWith("Welcome back")), { role: "assistant", content, action: pendingAiAction ?? null }]);
    }
    prevOpen.current = open;
  }, [open, selectedIds, pendingAiAction]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const addMessage = (m: AIChatMessage) => setMessages(prev => [...prev, m]);

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    addMessage({ role: "user", content: msg });
    setLoading(true);
    onSendMessage(msg, addMessage, setLoading);
  };

  const executeAction = (action: AIChatAction) => {
    onAction(action);
    onClearPending();
    addMessage({ role: "assistant", content: `✓ Done — ${action.label} completed successfully.` });
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0,
      left: 240, right: 0,                         // content area only
      display: "flex", justifyContent: "center",
      zIndex: 50, pointerEvents: "none",
    }}>
      <div style={{
        width: 520, display: "flex", flexDirection: "column",
        background: C.surface, borderRadius: "16px 16px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        border: `1px solid ${C.aiBorder}`, borderBottom: "none",
        maxHeight: 460, pointerEvents: "auto",
      }}>
        {/* Header */}
        <div onClick={onToggle} style={{ padding: "12px 18px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: `1px solid ${C.aiBorder}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, color: C.ai }}>✦</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.ai }}>AI Assistant</span>
            {filteredIds && <span style={{ fontSize: 11, color: C.ai, background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 99, padding: "1px 8px" }}>Filter active</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {filteredIds && (
              <button onClick={e => { e.stopPropagation(); onFilter(null); }}
                style={{ fontSize: 11, color: C.muted, background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>
                Clear filter
              </button>
            )}
            <span style={{ fontSize: 11, color: C.muted }}>▼ Collapse</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Try asking</div>
              {prompts.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  style={{ textAlign: "left", fontSize: 12, color: C.ai, background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "88%", fontSize: 13, lineHeight: 1.6, padding: "9px 13px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? C.ai : C.aiBg, color: m.role === "user" ? "#fff" : C.text, border: m.role === "assistant" ? `1px solid ${C.aiBorder}` : "none" }}>
                {m.content.split("\n").map((line, j, arr) => (
                  <span key={j}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}{j < arr.length - 1 && <br />}</span>
                ))}
              </div>
              {m.action && (
                <button onClick={() => executeAction(m.action!)}
                  style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: C.ai, border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
                  ✦ {m.action.label}
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 4, padding: "8px 12px", background: C.aiBg, borderRadius: 12, width: "fit-content", border: `1px solid ${C.aiBorder}` }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.ai, animation: `bounce 1s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "10px 14px 14px", flexShrink: 0, borderTop: `1px solid ${C.aiBorder}` }}>
          <div style={{ display: "flex", gap: 8 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder={placeholder} rows={1}
              style={{ flex: 1, resize: "none", border: `1px solid ${C.aiBorder}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit", background: C.aiBg }} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              style={{ padding: "9px 14px", background: input.trim() && !loading ? C.ai : C.muted, color: "#fff", border: "none", borderRadius: 10, cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600 }}>
              ↑
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
    </div>
  );
}