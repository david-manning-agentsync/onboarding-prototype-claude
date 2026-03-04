// src/components/ProducerShell.tsx
// Producer persona shell — replaces the sidebar layout entirely.
// Top bar holds user identity and prototype controls.
// Two screens: Confirm (identity review) → Tasks (ProducerDetail).

import { useState } from "react";
import { C } from "../theme";
import type { Producer } from "../data";
import { ProducerDetail } from "../views/ProducerDetail";
import type { PersonaId, VersionId } from "./Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProducerShellProps {
  producer: Producer;
  allProducers: Producer[];
  setAllProducers: (fn: (prev: Producer[]) => Producer[]) => void;
  personaId: PersonaId;
  version: VersionId;
  onPersonaChange: (id: string) => void;
  onVersionChange: (id: string) => void;
  onExit: () => void;
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ producer, personaId, version, onPersonaChange, onVersionChange, onExit }: {
  producer: Producer;
  personaId: PersonaId;
  version: VersionId;
  onPersonaChange: (id: string) => void;
  onVersionChange: (id: string) => void;
  onExit: () => void;
}) {
  const personas: { id: PersonaId; label: string }[] = [
    { id: "manager",  label: "Sarah Chen (Manager)" },
    { id: "sysadmin", label: "Alex Morgan (Sysadmin)" },
    { id: "producer", label: "Jordan Smith (Producer)" },
  ];
  const versions: { id: VersionId; label: string; color: string }[] = [
    { id: "mvp",      label: "MVP",      color: C.success },
    { id: "post-mvp", label: "Post-MVP", color: C.accent  },
    { id: "ai",       label: "AI",       color: C.ai      },
  ];
  const activeVersion = versions.find(v => v.id === version)!;

  return (
    <div style={{
      height: 52,
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0,
    }}>
      {/* Left — user identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: C.accent + "20", border: `1px solid ${C.accent}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: C.accent,
        }}>
          {producer.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{producer.name}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Producer · NPN {producer.npn}</div>
        </div>
        {/* Settings stub */}
        <button style={{
          marginLeft: 8, background: "none", border: `1px solid ${C.border}`,
          borderRadius: 7, padding: "4px 10px", fontSize: 12, color: C.muted,
          cursor: "default", display: "flex", alignItems: "center", gap: 4,
        }} title="Settings (coming soon)">
          ⚙ Settings
        </button>
      </div>

      {/* Right — proto switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4 }}>Prototype</span>

        {/* Persona */}
        <select
          value={personaId}
          onChange={e => onPersonaChange(e.target.value)}
          style={{
            fontSize: 12, fontWeight: 500, color: C.textMed,
            background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 7, padding: "4px 8px", cursor: "pointer", outline: "none",
          }}
        >
          {personas.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>

        {/* Version */}
        <select
          value={version}
          onChange={e => onVersionChange(e.target.value)}
          style={{
            fontSize: 12, fontWeight: 600,
            color: activeVersion.color,
            background: activeVersion.color + "12",
            border: `1px solid ${activeVersion.color}40`,
            borderRadius: 7, padding: "4px 8px", cursor: "pointer", outline: "none",
          }}
        >
          {versions.map(v => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>

        {/* Exit */}
        <button
          onClick={onExit}
          style={{
            fontSize: 12, fontWeight: 500, color: C.muted,
            background: "none", border: `1px solid ${C.border}`,
            borderRadius: 7, padding: "4px 10px", cursor: "pointer",
          }}
        >
          ← Exit Demo
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Screen ───────────────────────────────────────────────────────────

function ConfirmScreen({ producer, onConfirm }: { producer: Producer; onConfirm: () => void }) {
  const fields: [string, string][] = [
    ["Full Name",                    producer.name],
    ["National Producer Number",     producer.npn],
    ["Resident State",               producer.resident],
    ["Onboarding Invited",           producer.invited],
  ];

  return (
    <div style={{
      flex: 1, overflow: "auto",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 40, background: C.bg,
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Greeting */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            Welcome to AgentSync
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>
            Hi, {producer.name.split(" ")[0]}. Let's get you onboarded.
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: C.textMed, lineHeight: 1.7 }}>
            Before we get started, please review the information below.
            Your agency provided these details when setting up your onboarding — confirm everything looks right before continuing.
          </p>
        </div>

        {/* Identity card */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, overflow: "hidden", marginBottom: 24,
        }}>
          <div style={{
            padding: "12px 20px", borderBottom: `1px solid ${C.border}`,
            fontSize: 11, fontWeight: 600, color: C.muted,
            textTransform: "uppercase", letterSpacing: "0.06em", background: C.bg,
          }}>
            Your Information
          </div>
          {fields.map(([label, value], i) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px",
              borderBottom: i < fields.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Correction note */}
        <p style={{ margin: "0 0 28px", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          If anything looks incorrect, contact your agency administrator before continuing.
        </p>

        {/* CTA */}
        <button
          onClick={onConfirm}
          style={{
            width: "100%", padding: "13px 0",
            background: C.accent, color: "#fff",
            border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.01em",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.9"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
        >
          Looks good — let's get started →
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ProducerShell({
  producer, allProducers, setAllProducers,
  personaId, version, onPersonaChange, onVersionChange, onExit,
}: ProducerShellProps) {
  const [confirmed, setConfirmed] = useState(false);

  // Reset confirmation if persona changes away and back
  // (handled by App.tsx unmounting/remounting this component)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <TopBar
        producer={producer}
        personaId={personaId}
        version={version}
        onPersonaChange={onPersonaChange}
        onVersionChange={onVersionChange}
        onExit={onExit}
      />

      {!confirmed ? (
        <ConfirmScreen producer={producer} onConfirm={() => setConfirmed(true)} />
      ) : (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ProducerDetail
            producer={producer}
            onBack={() => setConfirmed(false)}
            allProducers={allProducers}
            setAllProducers={setAllProducers}
            isProducerView
          />
        </div>
      )}
    </div>
  );
}