import { useState } from "react";
import { Drawer } from "../components/Drawer";
import { C } from "../theme";
import { useVersion } from "../components/UI";
import { TableView } from "../components/Table";
import type { FilterDef, ColDef } from "../components/Table";
import { PolicySetDrawer } from "../components/PolicySetDrawer";
import type { PolicySetDrawerProps } from "../components/PolicySetDrawer";
import { AIChat } from "../components/AIChat";
import type { AIChatMessage, AIChatAction } from "../components/AIChat";
import { BottomBar } from "../components/BottomBar";
import { useTableSelection } from "../hooks/useTableSelection";
type SavePayload = Parameters<PolicySetDrawerProps["onSave"]>[0];

// ─── Tab types ────────────────────────────────────────────────────────────────

type TabId = "policy-sets" | "task-templates" | "components";
interface TabDef { id: TabId; label: string; }

const TABS: TabDef[] = [
  { id: "policy-sets",    label: "Policy Sets" },
  { id: "task-templates", label: "Task Templates" },
  { id: "components",     label: "Components" },
];

// ─── ViewTabs ─────────────────────────────────────────────────────────────────

function ViewTabs({ tabs, active, onChange }: { tabs: TabDef[]; active: TabId; onChange: (id: TabId) => void }) {
  return (
    <div style={{ display: "flex", borderBottom: `2px solid ${C.border}` }}>
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? C.accent : C.muted, background: "none", border: "none", borderBottom: `2px solid ${isActive ? C.accent : "transparent"}`, marginBottom: -2, padding: "8px 16px", cursor: "pointer", transition: "color .15s, border-color .15s", whiteSpace: "nowrap" }}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Policy Sets seed ─────────────────────────────────────────────────────────

const PS_SEED = [
  { id: "ps-1", name: "Licensed P&C Producer",               orgRequired: true,  activeInstances: 142, orgReqs: 6, gwbrs: 3, status: "active",   createdBy: "Maria Chen",   createdAt: "2024-01-12", modifiedBy: "Maria Chen",   modifiedAt: "2024-11-03" },
  { id: "ps-2", name: "Life & Health Producer",              orgRequired: true,  activeInstances: 89,  orgReqs: 7, gwbrs: 2, status: "active",   createdBy: "James Park",   createdAt: "2024-02-08", modifiedBy: "Sara Okonkwo", modifiedAt: "2025-01-15" },
  { id: "ps-3", name: "Unlicensed – Needs Resident License", orgRequired: false, activeInstances: 24,  orgReqs: 4, gwbrs: 0, status: "active",   createdBy: "Sara Okonkwo", createdAt: "2024-03-19", modifiedBy: "James Park",   modifiedAt: "2025-02-01" },
  { id: "ps-4", name: "Surplus Lines Broker",                orgRequired: false, activeInstances: 11,  orgReqs: 5, gwbrs: 4, status: "active",   createdBy: "Tom Rivera",   createdAt: "2024-05-22", modifiedBy: "Tom Rivera",   modifiedAt: "2024-12-10" },
  { id: "ps-5", name: "Non-Resident Producer",               orgRequired: false, activeInstances: 0,   orgReqs: 5, gwbrs: 1, status: "draft",    createdBy: "Maria Chen",   createdAt: "2024-09-01", modifiedBy: "Maria Chen",   modifiedAt: "2024-09-01" },
  { id: "ps-6", name: "Reinsurance Specialist",              orgRequired: false, activeInstances: 0,   orgReqs: 3, gwbrs: 0, status: "draft",    createdBy: "Tom Rivera",   createdAt: "2024-06-14", modifiedBy: "Tom Rivera",   modifiedAt: "2024-06-14" },
  { id: "ps-7", name: "Legacy P&C – Old Flow",               orgRequired: false, activeInstances: 0,   orgReqs: 4, gwbrs: 2, status: "archived", createdBy: "James Park",   createdAt: "2023-08-05", modifiedBy: "Sara Okonkwo", modifiedAt: "2024-04-20" },
  { id: "ps-8", name: "2023 Compliance Bundle",              orgRequired: false, activeInstances: 0,   orgReqs: 6, gwbrs: 0, status: "archived", createdBy: "Sara Okonkwo", createdAt: "2023-11-30", modifiedBy: "Sara Okonkwo", modifiedAt: "2024-01-08" },
];

const PS_FILTER_DEFS: FilterDef[] = [
  { key: "status",      label: "Status",       options: ["active", "draft", "archived"] },
  { key: "orgRequired", label: "Org Required", options: ["Yes", "No"] },
];

const PS_STATUS_COLORS = {
  active:   { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  draft:    { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  archived: { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
};

const AI_PROMPTS = [
  "Show policy sets with no active usage and not updated in 3 months",
  "Which policy sets are missing GWBRs?",
  "Find all draft policy sets created before 2024",
  "Show active policy sets with the most producers",
];

// ─── Task Templates seed ──────────────────────────────────────────────────────

interface TaskTemplateRow {
  id: string; name: string; category: "Internal" | "Partner"; owner: "Producer" | "Operations";
  requiresApproval: boolean; componentCount: number;
  createdBy: string; createdAt: string; modifiedBy: string; modifiedAt: string;
  components: { icon: string; label: string; type: string }[];
}

const TT_SEED: TaskTemplateRow[] = [
  { id: "tt-1", name: "E&O Certificate Upload",            category: "Internal", owner: "Producer",   requiresApproval: true,  componentCount: 2, createdBy: "Maria Chen",   createdAt: "2024-01-15", modifiedBy: "Maria Chen",   modifiedAt: "2024-11-10", components: [{ icon: "¶", label: "Instructions", type: "Text Block" }, { icon: "⬆", label: "Certificate PDF", type: "File Upload" }] },
  { id: "tt-2", name: "Background Check Authorization",    category: "Internal", owner: "Producer",   requiresApproval: true,  componentCount: 3, createdBy: "James Park",   createdAt: "2024-02-20", modifiedBy: "Sara Okonkwo", modifiedAt: "2025-01-08", components: [{ icon: "¶", label: "Authorization Notice", type: "Text Block" }, { icon: "⊙", label: "Consent Confirmation", type: "Yes / No" }, { icon: "✍", label: "Producer Signature", type: "Signature" }] },
  { id: "tt-3", name: "Agent Agreement Signature",         category: "Internal", owner: "Producer",   requiresApproval: false, componentCount: 2, createdBy: "Sara Okonkwo", createdAt: "2024-03-05", modifiedBy: "James Park",   modifiedAt: "2025-02-14", components: [{ icon: "📎", label: "Agent Agreement PDF", type: "File / Doc" }, { icon: "✍", label: "Agent Acknowledgement", type: "Signature" }] },
  { id: "tt-4", name: "Carrier Appointment Request",       category: "Partner",  owner: "Operations", requiresApproval: true,  componentCount: 3, createdBy: "Tom Rivera",   createdAt: "2024-04-18", modifiedBy: "Tom Rivera",   modifiedAt: "2024-12-01", components: [{ icon: "¶", label: "Appointment Context", type: "Text Block" }, { icon: "☰", label: "Requested Carriers", type: "Picklist" }, { icon: "✏", label: "Notes to Carrier", type: "Free Text" }] },
  { id: "tt-5", name: "Resident License Verification",     category: "Internal", owner: "Operations", requiresApproval: false, componentCount: 2, createdBy: "Maria Chen",   createdAt: "2024-05-30", modifiedBy: "Maria Chen",   modifiedAt: "2024-10-22", components: [{ icon: "⬆", label: "License Copy Upload", type: "File Upload" }, { icon: "✏", label: "License Number", type: "Free Text" }] },
  { id: "tt-6", name: "Direct Deposit Setup",              category: "Internal", owner: "Producer",   requiresApproval: false, componentCount: 3, createdBy: "James Park",   createdAt: "2024-06-11", modifiedBy: "Sara Okonkwo", modifiedAt: "2025-01-30", components: [{ icon: "¶", label: "Banking Instructions", type: "Text Block" }, { icon: "🏦", label: "Bank Account Info", type: "Bank Account" }, { icon: "⊙", label: "Confirm Details", type: "Yes / No" }] },
  { id: "tt-7", name: "Anti-Money Laundering Training",    category: "Internal", owner: "Producer",   requiresApproval: true,  componentCount: 3, createdBy: "Tom Rivera",   createdAt: "2024-07-09", modifiedBy: "Tom Rivera",   modifiedAt: "2024-11-15", components: [{ icon: "▶", label: "AML Training Video", type: "Video" }, { icon: "☰", label: "Comprehension Quiz", type: "Picklist" }, { icon: "✍", label: "Completion Signature", type: "Signature" }] },
  { id: "tt-8", name: "NIPR License Lookup Consent",       category: "Partner",  owner: "Producer",   requiresApproval: false, componentCount: 2, createdBy: "Sara Okonkwo", createdAt: "2024-08-22", modifiedBy: "Maria Chen",   modifiedAt: "2025-02-05", components: [{ icon: "¶", label: "NIPR Consent Notice", type: "Text Block" }, { icon: "✍", label: "Producer Signature", type: "Signature" }] },
  { id: "tt-9", name: "State Non-Resident License Filing", category: "Partner",  owner: "Operations", requiresApproval: true,  componentCount: 2, createdBy: "James Park",   createdAt: "2024-09-14", modifiedBy: "James Park",   modifiedAt: "2024-12-28", components: [{ icon: "☰", label: "Target States", type: "Picklist" }, { icon: "⬆", label: "Supporting Documents", type: "File Upload" }] },
];

const TT_FILTER_DEFS: FilterDef[] = [
  { key: "category",         label: "Category",          options: ["Internal", "Partner"] },
  { key: "owner",            label: "Owner",             options: ["Producer", "Operations"] },
  { key: "requiresApproval", label: "Requires Approval", options: ["Yes", "No"] },
];

// ─── Components seed ──────────────────────────────────────────────────────────

interface ComponentRow {
  id: string; name: string; icon: string; category: "Content" | "Question" | "Other";
  createdBy: string; createdAt: string; modifiedBy: string; modifiedAt: string;
}

const COMP_SEED: ComponentRow[] = [
  { id: "c-1", name: "Text Block",   icon: "¶",  category: "Content",  createdBy: "System",     createdAt: "2023-01-01", modifiedBy: "System",       modifiedAt: "2023-01-01" },
  { id: "c-2", name: "Video",        icon: "▶",  category: "Content",  createdBy: "System",     createdAt: "2023-01-01", modifiedBy: "System",       modifiedAt: "2023-06-10" },
  { id: "c-3", name: "File / Doc",   icon: "📎", category: "Content",  createdBy: "System",     createdAt: "2023-01-01", modifiedBy: "System",       modifiedAt: "2023-01-01" },
  { id: "c-4", name: "Free Text",    icon: "✏",  category: "Question", createdBy: "System",     createdAt: "2023-01-01", modifiedBy: "System",       modifiedAt: "2023-01-01" },
  { id: "c-5", name: "Picklist",     icon: "☰",  category: "Question", createdBy: "System",     createdAt: "2023-01-01", modifiedBy: "Maria Chen",   modifiedAt: "2024-03-15" },
  { id: "c-6", name: "Yes / No",     icon: "⊙",  category: "Question", createdBy: "System",     createdAt: "2023-01-01", modifiedBy: "System",       modifiedAt: "2023-01-01" },
  { id: "c-7", name: "File Upload",  icon: "⬆",  category: "Question", createdBy: "System",     createdAt: "2023-01-01", modifiedBy: "James Park",   modifiedAt: "2024-07-22" },
  { id: "c-8", name: "Signature",    icon: "✍",  category: "Other",    createdBy: "System",     createdAt: "2023-04-01", modifiedBy: "Sara Okonkwo", modifiedAt: "2024-11-05" },
  { id: "c-9", name: "Bank Account", icon: "🏦", category: "Other",    createdBy: "Tom Rivera", createdAt: "2024-02-14", modifiedBy: "Tom Rivera",   modifiedAt: "2024-09-30" },
];

const COMP_FILTER_DEFS: FilterDef[] = [
  { key: "category", label: "Category", options: ["Content", "Question", "Other"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate   = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const monthsAgo = (d: string, n: number) => { const t = new Date(d), c = new Date(); c.setMonth(c.getMonth() - n); return t < c; };

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = PS_STATUS_COLORS[status as keyof typeof PS_STATUS_COLORS];
  if (!s) return <span>{status}</span>;
  return <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 99, padding: "2px 8px", textTransform: "capitalize" }}>{status}</span>;
}

const TT_CAT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Internal: { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  Partner:  { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
};
const COMP_CAT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Content:  { color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
  Question: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  Other:    { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
};

function CatBadge({ category, map }: { category: string; map: Record<string, { color: string; bg: string; border: string }> }) {
  const s = map[category] ?? { color: C.muted, bg: C.bg, border: C.border };
  return <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 99, padding: "2px 8px" }}>{category}</span>;
}

// ─── AI handler ───────────────────────────────────────────────────────────────

function usePolicySetsAI(onFilter: (ids: string[] | null) => void) {
  return (msg: string, addMessage: (m: AIChatMessage) => void, setLoading: (v: boolean) => void) => {
    setTimeout(async () => {
      await new Promise(r => setTimeout(r, 850));
      const lower = msg.toLowerCase();
      let reply = "", action: AIChatAction | null = null;
      if (lower.includes("no active usage") || (lower.includes("not updated") && lower.includes("3 months"))) {
        const ids = PS_SEED.filter(s => s.activeInstances === 0 && monthsAgo(s.modifiedAt, 3)).map(s => s.id);
        onFilter(ids);
        reply = `Found **${ids.length} policy sets** with no active producers and no updates in over 3 months.\n\n• Legacy P&C – Old Flow\n• 2023 Compliance Bundle\n\nWould you like to archive all of them?`;
        action = { type: "status", value: "archived", label: `Archive ${ids.length} policy sets`, ids };
      } else if (lower.includes("missing gwbr")) {
        const ids = PS_SEED.filter(s => s.gwbrs === 0).map(s => s.id);
        onFilter(ids); reply = `Found **${ids.length} policy sets** with no GWBRs configured.`;
      } else if (lower.includes("draft") && lower.includes("2024")) {
        const ids = PS_SEED.filter(s => s.status === "draft" && new Date(s.createdAt) < new Date("2024-01-01")).map(s => s.id);
        onFilter(ids); reply = ids.length ? `Found **${ids.length} draft** policy sets created before 2024.` : "No draft policy sets found created before 2024.";
      } else if (lower.includes("active") && lower.includes("most")) {
        const sorted = [...PS_SEED].filter(s => s.status === "active").sort((a, b) => b.activeInstances - a.activeInstances).slice(0, 3);
        onFilter(sorted.map(s => s.id));
        reply = `Top active policy sets:\n\n1. **Licensed P&C Producer** – 142\n2. **Life & Health Producer** – 89\n3. **Unlicensed – Needs Resident License** – 24`;
      } else {
        reply = `I searched for "${msg}". Try one of the suggested prompts.`;
      }
      addMessage({ role: "assistant", content: reply, action });
      setLoading(false);
    }, 0);
  };
}

// ─── Task Template drawer ─────────────────────────────────────────────────────

function TaskTemplateDrawer({ template, onClose }: { template: TaskTemplateRow | null; onClose: () => void }) {
  if (!template) return null;
  const appr = template.requiresApproval
    ? { color: "#d97706", bg: "#fffbeb", border: "#fde68a" }
    : { color: C.muted,   bg: C.bg,      border: C.border };

  return (
    <Drawer open={!!template} onClose={onClose} title={template.name} subtitle="Task template — read only"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 18px", cursor: "pointer" }}>Close</button>
          <button style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer" }}>Edit Template</button>
        </div>
      }>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {([
            ["Category",          <CatBadge category={template.category} map={TT_CAT_COLORS} />],
            ["Owner",             <span style={{ fontSize: 13, color: C.text }}>{template.owner}</span>],
            ["Requires Approval", <span style={{ fontSize: 11, fontWeight: 600, color: appr.color, background: appr.bg, border: `1px solid ${appr.border}`, borderRadius: 99, padding: "2px 8px" }}>{template.requiresApproval ? "Yes" : "No"}</span>],
            ["Components",        <span style={{ fontSize: 13, color: C.text }}>{template.componentCount}</span>],
            ["Created By",        <span style={{ fontSize: 13, color: C.text }}>{template.createdBy}</span>],
            ["Created",           <span style={{ fontSize: 13, color: C.text }}>{fmtDate(template.createdAt)}</span>],
            ["Modified By",       <span style={{ fontSize: 13, color: C.text }}>{template.modifiedBy}</span>],
            ["Last Modified",     <span style={{ fontSize: 13, color: C.text }}>{fmtDate(template.modifiedAt)}</span>],
          ] as [string, React.ReactNode][]).map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
              {value}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}` }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Components ({template.components.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {template.components.map((comp, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{comp.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{comp.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{comp.type}</div>
                </div>
                <div style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px" }}>{idx + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

// ─── Component WIP drawer ─────────────────────────────────────────────────────

function ComponentWIPDrawer({ component, onClose }: { component: ComponentRow | null; onClose: () => void }) {
  if (!component) return null;
  return (
    <Drawer open={!!component} onClose={onClose} title={component.name} subtitle="Component definition"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 18px", cursor: "pointer" }}>Close</button>
        </div>
      }>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {([
            ["Category",      <CatBadge category={component.category} map={COMP_CAT_COLORS} />],
            ["Icon",          <span style={{ fontSize: 20 }}>{component.icon}</span>],
            ["Created By",    <span style={{ fontSize: 13, color: C.text }}>{component.createdBy}</span>],
            ["Created",       <span style={{ fontSize: 13, color: C.text }}>{fmtDate(component.createdAt)}</span>],
            ["Modified By",   <span style={{ fontSize: 13, color: C.text }}>{component.modifiedBy}</span>],
            ["Last Modified", <span style={{ fontSize: 13, color: C.text }}>{fmtDate(component.modifiedAt)}</span>],
          ] as [string, React.ReactNode][]).map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
              {value}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}` }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 24px", background: C.bg, border: `2px dashed ${C.border}`, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>🚧</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Component editor coming soon</div>
          <div style={{ fontSize: 13, color: C.muted, maxWidth: 260, lineHeight: 1.6 }}>Configuration fields, validation rules, and field-level settings will live here.</div>
        </div>
      </div>
    </Drawer>
  );
}

// ─── Col defs ─────────────────────────────────────────────────────────────────
// Metadata cols (createdBy, createdAt, modifiedBy, modifiedAt) are marked
// noSearch so search matches against meaningful content columns only.

const PS_COLS: ColDef[] = [
  { key: "name",            label: "Name",             render: (v) => <span style={{ color: C.accentLight, fontWeight: 500 }}>{v}</span> },
  { key: "orgRequired",     label: "Org Required",     render: (v) => v ? <span style={{ fontSize: 12, color: C.success }}>✓ Yes</span> : <span style={{ fontSize: 12, color: C.muted }}>—</span> },
  { key: "activeInstances", label: "Active Instances" },
  { key: "orgReqs",         label: "Org Reqs" },
  { key: "gwbrs",           label: "GWBRs",            render: (v) => v > 0 ? v : "—" },
  { key: "status",          label: "Status",           render: (v) => <StatusBadge status={v} /> },
  { key: "createdBy",       label: "Created By",       noSearch: true },
  { key: "createdAt",       label: "Created",          render: (v) => fmtDate(v), noSearch: true },
  { key: "modifiedBy",      label: "Modified By",      noSearch: true },
  { key: "modifiedAt",      label: "Modified",         render: (v) => fmtDate(v), noSearch: true },
];

const TT_COLS: ColDef[] = [
  { key: "name",             label: "Name",              render: (v) => <span style={{ color: C.accentLight, fontWeight: 500 }}>{v}</span> },
  { key: "category",         label: "Category",          render: (v) => <CatBadge category={v} map={TT_CAT_COLORS} /> },
  { key: "owner",            label: "Owner" },
  { key: "requiresApproval", label: "Requires Approval", render: (v) => <span style={{ fontSize: 11, fontWeight: 600, color: v ? "#d97706" : C.muted, background: v ? "#fffbeb" : C.bg, border: `1px solid ${v ? "#fde68a" : C.border}`, borderRadius: 99, padding: "2px 8px" }}>{v ? "Yes" : "No"}</span> },
  { key: "componentCount",   label: "Components" },
  { key: "createdBy",        label: "Created By",        noSearch: true },
  { key: "createdAt",        label: "Created",           render: (v) => fmtDate(v), noSearch: true },
  { key: "modifiedBy",       label: "Modified By",       noSearch: true },
  { key: "modifiedAt",       label: "Last Modified",     render: (v) => fmtDate(v), noSearch: true },
];

const COMP_COLS: ColDef[] = [
  { key: "name",       label: "Name",          render: (v, row: any) => <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>{row.icon}</span><span style={{ color: C.accentLight, fontWeight: 500 }}>{v}</span></span> },
  { key: "category",   label: "Category",      render: (v) => <CatBadge category={v} map={COMP_CAT_COLORS} /> },
  { key: "createdBy",  label: "Created By",    noSearch: true },
  { key: "createdAt",  label: "Created",       render: (v) => fmtDate(v), noSearch: true },
  { key: "modifiedBy", label: "Modified By",   noSearch: true },
  { key: "modifiedAt", label: "Last Modified", render: (v) => fmtDate(v), noSearch: true },
];

// ─── Policy Sets tab ──────────────────────────────────────────────────────────

function PolicySetsTab({ isAdmin, isAI, isPostMVP }: { isAdmin: boolean; isAI: boolean; isPostMVP: boolean }) {
  const [data,            setData]            = useState(PS_SEED);
  const [search,          setSearch]          = useState("");
  const [applied,         setApplied]         = useState<Record<string, string[]>>({});
  const [aiOpen,          setAiOpen]          = useState(isAI);
  const [aiFilterIds,     setAiFilterIds]     = useState<string[] | null>(null);
  const [pendingAiAction, setPendingAiAction] = useState<AIChatAction | null>(null);
  const [showNewPS,       setShowNewPS]       = useState(false);

  // Filter by applied filters + AI filter only — search is handled by TableView
  const rows = data.filter(r => {
    if (aiFilterIds && !aiFilterIds.includes(r.id)) return false;
    if (applied.status?.length      && !applied.status.includes(r.status)) return false;
    if (applied.orgRequired?.length && !applied.orgRequired.includes(r.orgRequired ? "Yes" : "No")) return false;
    return true;
  });

  const { selected, toggleRow, toggleAll, selCount, setFromIds, clear } = useTableSelection(rows);

  const handleAiFilter = (ids: string[] | null) => {
    setAiFilterIds(ids);
    if (ids) setFromIds(ids); else { clear(); setPendingAiAction(null); }
  };
  const handleAiAction = ({ type, value, ids }: AIChatAction) => {
    setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, [type]: value } : r));
    clear(); setAiFilterIds(null); setPendingAiAction(null);
  };
  const handleBulkStatus = (status: string) => {
    const ids = [...selected].filter(id => rows.find(r => r.id === id));
    setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
    clear();
  };
  const handleBulkOrgRequired = (val: boolean) => {
    const ids = [...selected].filter(id => rows.find(r => r.id === id));
    setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, orgRequired: val } : r));
    clear();
  };

  const onSendMessage = usePolicySetsAI(handleAiFilter);
  const showActionBar = isPostMVP && selCount > 0 && !aiOpen;
  const bottomPad     = (aiOpen || showActionBar) ? 72 : 0;

  const primaryAction = isAdmin ? (
    <button onClick={() => setShowNewPS(true)} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: isAI ? C.ai : C.accent, border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
      {isAI && <span>✦</span>}+ New Policy Set
    </button>
  ) : undefined;

  const banner = aiFilterIds ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: C.aiBg, border: `1px solid ${C.aiBorder}`, borderRadius: 8, fontSize: 12, color: C.ai }}>
      <span>✦</span>
      <span><strong>AI filter active</strong> — showing {rows.length} policy set{rows.length !== 1 ? "s" : ""}. {selCount > 0 && `${selCount} selected.`}</span>
    </div>
  ) : undefined;

  return (
    <div style={{ paddingBottom: bottomPad }}>
      <TableView
        title="Policy Sets"
        subtitle="Configurable containers of regulatory and organizational requirements"
        allCols={PS_COLS}
        rows={rows}
        totalCount={data.length}
        recordLabel="policy sets"
        filterDefs={PS_FILTER_DEFS}
        search={search}
        onSearch={setSearch}
        applied={applied}
        onApply={setApplied}
        selectable
        selected={selected}
        onToggle={toggleRow}
        onToggleAll={toggleAll}
        defaultSortKey="name"
        primaryAction={primaryAction}
        banner={banner}
      />

      <PolicySetDrawer open={showNewPS} onClose={() => setShowNewPS(false)} isPlus={isPostMVP}
        onSave={({ name, gwbrIds, tasks }: SavePayload) => {
          setData(prev => [...prev, { id: `ps-${Date.now()}`, name, orgRequired: false, activeInstances: 0, orgReqs: tasks.length, gwbrs: gwbrIds.length, status: "draft", createdBy: "You", createdAt: new Date().toISOString().split("T")[0], modifiedBy: "You", modifiedAt: new Date().toISOString().split("T")[0] }]);
          setShowNewPS(false);
        }} />

      {isAI && !aiOpen && (
        <BottomBar selCount={selCount} showActions={showActionBar} onAskAI={() => setAiOpen(true)} onClear={clear}
          groups={[
            { label: "Status", actions: ["active","draft","archived"].map(s => ({ label: s, onClick: () => handleBulkStatus(s) })) },
            { label: "", actions: [
              { label: "Set Org Required", highlight: true, onClick: () => handleBulkOrgRequired(true) },
              { label: "Remove",           muted: true,     onClick: () => handleBulkOrgRequired(false) },
            ]},
          ]}
        />
      )}
      {isAI && (
        <AIChat open={aiOpen} onToggle={() => setAiOpen(v => !v)} onFilter={handleAiFilter} onAction={handleAiAction}
          filteredIds={aiFilterIds} selectedIds={selCount} pendingAiAction={pendingAiAction} onClearPending={() => setPendingAiAction(null)}
          prompts={AI_PROMPTS} onSendMessage={onSendMessage} placeholder="Ask anything about your policy sets…" />
      )}
    </div>
  );
}

// ─── Task Templates tab ───────────────────────────────────────────────────────

function TaskTemplatesTab({ isAdmin }: { isAdmin: boolean }) {
  const [search,           setSearch]           = useState("");
  const [applied,          setApplied]          = useState<Record<string, string[]>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplateRow | null>(null);

  // Search handled by TableView — only apply filter logic here
  const rows = TT_SEED.filter(r => {
    if (applied.category?.length         && !applied.category.includes(r.category)) return false;
    if (applied.owner?.length            && !applied.owner.includes(r.owner)) return false;
    if (applied.requiresApproval?.length && !applied.requiresApproval.includes(r.requiresApproval ? "Yes" : "No")) return false;
    return true;
  });

  return (
    <>
      <TableView
        title="Task Templates"
        subtitle="Reusable task definitions applied across policy sets"
        allCols={TT_COLS}
        rows={rows}
        totalCount={TT_SEED.length}
        recordLabel="task templates"
        filterDefs={TT_FILTER_DEFS}
        search={search}
        onSearch={setSearch}
        applied={applied}
        onApply={setApplied}
        onRow={(row: any) => setSelectedTemplate(row as TaskTemplateRow)}
        defaultSortKey="name"
        primaryAction={isAdmin ? (
          <button style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>+ New Template</button>
        ) : undefined}
      />
      <TaskTemplateDrawer template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />
    </>
  );
}

// ─── Components tab ───────────────────────────────────────────────────────────

function ComponentsTab({ isAdmin }: { isAdmin: boolean }) {
  const [search,       setSearch]       = useState("");
  const [applied,      setApplied]      = useState<Record<string, string[]>>({});
  const [selectedComp, setSelectedComp] = useState<ComponentRow | null>(null);

  // Search handled by TableView — only apply filter logic here
  const rows = COMP_SEED.filter(r => {
    if (applied.category?.length && !applied.category.includes(r.category)) return false;
    return true;
  });

  return (
    <>
      <TableView
        title="Components"
        subtitle="Individual input and content blocks used to build tasks"
        allCols={COMP_COLS}
        rows={rows}
        totalCount={COMP_SEED.length}
        recordLabel="components"
        filterDefs={COMP_FILTER_DEFS}
        search={search}
        onSearch={setSearch}
        applied={applied}
        onApply={setApplied}
        onRow={(row: any) => setSelectedComp(row as ComponentRow)}
        defaultSortKey="name"
        primaryAction={isAdmin ? (
          <button style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.accent, border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>+ New Component</button>
        ) : undefined}
      />
      <ComponentWIPDrawer component={selectedComp} onClose={() => setSelectedComp(null)} />
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PolicySets({ isAdmin = false }: { isAdmin?: boolean }) {
  const version   = useVersion();
  const isAI      = version === "ai";
  const isPostMVP = version === "post-mvp" || isAI;

  const [activeTab, setActiveTab] = useState<TabId>("policy-sets");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {isAdmin && (
        <ViewTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      )}
      {(!isAdmin || activeTab === "policy-sets") && (
        <PolicySetsTab isAdmin={isAdmin} isAI={isAI} isPostMVP={isPostMVP} />
      )}
      {isAdmin && activeTab === "task-templates" && <TaskTemplatesTab isAdmin={isAdmin} />}
      {isAdmin && activeTab === "components"     && <ComponentsTab isAdmin={isAdmin} />}
    </div>
  );
}