import { useState } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
import { C } from "../theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskType = "internal" | "external";
type OwnerType = "producer" | "internal";
type ApprovalType = "yes" | "no";
type ComponentType = "text" | "video" | "file" | "freetext" | "picklist" | "boolean" | "fileupload" | "signature";
type TabType = "selected" | "unselected" | "all";

interface ComponentConfig {
  label?: string;
  content?: string;
  url?: string;
  description?: string;
  question?: string;
  placeholder?: string;
  required?: boolean;
  options?: string;
  selType?: "single" | "multi";
  display?: "toggle" | "radio" | "checkbox";
  instructions?: string;
  prompt?: string;
  signerRole?: string;
}

interface TaskComponent {
  id: string;
  type: ComponentType;
  config: ComponentConfig;
}

interface Task {
  id: string;
  name: string;
  type: TaskType;
  owner: OwnerType;
  approval: ApprovalType;
  components: TaskComponent[];
}

interface GwbrEntry {
  id: number;
  state: string;
  licName: string;
  licCode: string;
  loaName: string;
  loaCode: string;
}

export interface PolicySetDrawerProps {
  open: boolean;
  onClose: () => void;
  isPlus?: boolean;
  onSave: (ps: { name: string; gwbrIds: number[]; states: string[]; products: string[]; tasks: Task[]; requiredForAll: boolean }) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

const PRODUCTS = ["Property & Casualty (P&C)","Life Insurance","Health Insurance","Accident & Health (A&H)","Surplus Lines","Variable Products","Title Insurance","Crop / Agriculture","Workers Compensation","Medicare Supplement"];

const GWBR_POOL: GwbrEntry[] = [
  {id:1,state:"CA",licName:"Property Broker-Agent",licCode:"210",loaName:"Fire & Allied Lines",loaCode:"031"},
  {id:2,state:"CA",licName:"Property Broker-Agent",licCode:"210",loaName:"Liability",loaCode:"033"},
  {id:3,state:"CA",licName:"Property Broker-Agent",licCode:"210",loaName:"Inland Marine",loaCode:"034"},
  {id:4,state:"CA",licName:"Property Broker-Agent",licCode:"210",loaName:"Commercial Auto",loaCode:"038"},
  {id:5,state:"CA",licName:"Life-Only Agent",licCode:"220",loaName:"Life",loaCode:"061"},
  {id:6,state:"CA",licName:"Life-Only Agent",licCode:"220",loaName:"Fixed Annuity",loaCode:"063"},
  {id:7,state:"CA",licName:"Accident & Health Agent",licCode:"230",loaName:"Disability Income",loaCode:"071"},
  {id:8,state:"CA",licName:"Accident & Health Agent",licCode:"230",loaName:"Long-Term Care",loaCode:"074"},
  {id:9,state:"CA",licName:"Surplus Lines Broker",licCode:"240",loaName:"Surplus Lines",loaCode:"091"},
  {id:10,state:"CA",licName:"Variable Products Agent",licCode:"250",loaName:"Variable Annuity",loaCode:"065"},
  {id:11,state:"TX",licName:"General Lines Agent",licCode:"300",loaName:"Property",loaCode:"041"},
  {id:12,state:"TX",licName:"General Lines Agent",licCode:"300",loaName:"Casualty",loaCode:"043"},
  {id:13,state:"TX",licName:"General Lines Agent",licCode:"300",loaName:"Inland Marine",loaCode:"044"},
  {id:14,state:"TX",licName:"General Lines Agent",licCode:"300",loaName:"Boiler & Machinery",loaCode:"047"},
  {id:15,state:"TX",licName:"Life, Accident & Health Agent",licCode:"310",loaName:"Life",loaCode:"061"},
  {id:16,state:"TX",licName:"Life, Accident & Health Agent",licCode:"310",loaName:"Health",loaCode:"072"},
  {id:17,state:"TX",licName:"Life, Accident & Health Agent",licCode:"310",loaName:"Fixed Annuity",loaCode:"063"},
  {id:18,state:"TX",licName:"Surplus Lines Agent",licCode:"320",loaName:"Surplus Lines",loaCode:"091"},
  {id:19,state:"TX",licName:"Variable Life & Annuity Agent",licCode:"330",loaName:"Variable Life",loaCode:"062"},
  {id:20,state:"TX",licName:"Workers Comp Specialist",licCode:"340",loaName:"Workers Compensation",loaCode:"054"},
  {id:21,state:"NY",licName:"Broker",licCode:"400",loaName:"Property",loaCode:"041"},
  {id:22,state:"NY",licName:"Broker",licCode:"400",loaName:"Casualty",loaCode:"043"},
  {id:23,state:"NY",licName:"Broker",licCode:"400",loaName:"Fire",loaCode:"031"},
  {id:24,state:"NY",licName:"Life Broker",licCode:"410",loaName:"Life",loaCode:"061"},
  {id:25,state:"NY",licName:"Life Broker",licCode:"410",loaName:"Annuity",loaCode:"064"},
  {id:26,state:"NY",licName:"Accident & Health Broker",licCode:"420",loaName:"Accident & Health",loaCode:"070"},
  {id:27,state:"NY",licName:"Accident & Health Broker",licCode:"420",loaName:"Long-Term Care",loaCode:"074"},
  {id:28,state:"NY",licName:"Excess Lines Broker",licCode:"430",loaName:"Excess Lines",loaCode:"092"},
];

const COMPONENT_TYPES: { group: string; items: { type: ComponentType; label: string; icon: string }[] }[] = [
  { group: "Content", items: [
    { type: "text",       label: "Text Block",  icon: "¶" },
    { type: "video",      label: "Video",       icon: "▶" },
    { type: "file",       label: "File / Doc",  icon: "📎" },
  ]},
  { group: "Question", items: [
    { type: "freetext",   label: "Free Text",   icon: "✏" },
    { type: "picklist",   label: "Picklist",    icon: "☰" },
    { type: "boolean",    label: "Yes / No",    icon: "⊙" },
    { type: "fileupload", label: "File Upload", icon: "⬆" },
  ]},
  { group: "Other", items: [
    { type: "signature",  label: "Signature",   icon: "✍" },
  ]},
];

let _uid = 1;
const uid = () => `id_${_uid++}`;

// ─── Primitives ───────────────────────────────────────────────────────────────

const PrimaryBtn = ({
  children, onClick, disabled = false, style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) => (
  <button onClick={onClick} disabled={disabled} style={{
    fontSize: 13, fontWeight: 600, color: "#fff",
    background: disabled ? C.muted : C.accent,
    border: "none", borderRadius: 8, padding: "8px 20px",
    cursor: disabled ? "not-allowed" : "pointer", ...style,
  }}>{children}</button>
);

const SecBtn = ({
  children, onClick, style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) => (
  <button onClick={onClick} style={{
    fontSize: 13, fontWeight: 500, color: C.textMed,
    background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "8px 16px", cursor: "pointer", ...style,
  }}>{children}</button>
);

const SegToggle = ({
  options, value, onChange,
}: {
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div style={{ display: "flex", background: C.bg, borderRadius: 8, padding: 3, gap: 2, border: `1px solid ${C.border}` }}>
    {options.map(([val, label]) => (
      <button key={val} onClick={() => onChange(val)} style={{
        flex: 1, fontSize: 12, fontWeight: 600, padding: "5px 4px", borderRadius: 6, border: "none", cursor: "pointer",
        background: value === val ? C.surface : "transparent",
        color: value === val ? C.text : C.muted,
        boxShadow: value === val ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
        transition: "all .15s", whiteSpace: "nowrap",
      }}>{label}</button>
    ))}
  </div>
);

// ─── Drawer shell ─────────────────────────────────────────────────────────────

function Drawer({
  open, onClose, title, subtitle, onBack, children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", zIndex: 70, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .2s" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 520, background: C.surface, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 71, transform: open ? "translateX(0)" : "translateX(520px)", transition: "transform .25s cubic-bezier(.4,0,.2,1)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18, padding: "2px 6px", borderRadius: 6 }}>←</button>}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18, padding: 4 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
      </div>
    </>
  );
}

// ─── Reg: State selector ──────────────────────────────────────────────────────

function StateSelector({
  selected, onChange, onNext, onSkip,
}: {
  selected: string[];
  onChange: (s: string[]) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = US_STATES.filter(s => s.toLowerCase().includes(search.toLowerCase()));
  const toggle = (s: string) => onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Choose all states this policy set applies to.</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search states…" style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => onChange([...US_STATES])} style={{ fontSize: 12, color: C.accent, background: C.accentBg, border: `1px solid ${C.accentLight}44`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Select all</button>
          <button onClick={() => onChange([])} style={{ fontSize: 12, color: C.textDim, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Clear</button>
          {selected.length > 0 && <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>{selected.length} selected</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {filtered.map(s => (
            <div key={s} onClick={() => toggle(s)} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, borderRadius: 8, border: `1.5px solid ${selected.includes(s) ? C.accent : C.border}`, background: selected.includes(s) ? C.accentBg : C.surface, color: selected.includes(s) ? C.accent : C.textMed, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{s}</div>
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onSkip} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>Skip to GWBR selector →</button>
        <PrimaryBtn onClick={onNext} disabled={selected.length === 0}>Continue →</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Reg: Product selector ────────────────────────────────────────────────────

function ProductSelector({
  selected, onChange, onNext, onSkip,
}: {
  selected: string[];
  onChange: (p: string[]) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const toggle = (p: string) => onChange(selected.includes(p) ? selected.filter(x => x !== p) : [...selected, p]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Choose the insurance product lines this policy set covers.</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => onChange([...PRODUCTS])} style={{ fontSize: 12, color: C.accent, background: C.accentBg, border: `1px solid ${C.accentLight}44`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Select all</button>
          <button onClick={() => onChange([])} style={{ fontSize: 12, color: C.textDim, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Clear</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {PRODUCTS.map(p => (
            <div key={p} onClick={() => toggle(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${selected.includes(p) ? C.accent : C.border}`, background: selected.includes(p) ? C.accentBg : C.surface, cursor: "pointer" }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected.includes(p) ? C.accent : C.border}`, background: selected.includes(p) ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {selected.includes(p) && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: selected.includes(p) ? C.accent : C.text }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onSkip} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>Skip to GWBR selector →</button>
        <PrimaryBtn onClick={onNext} disabled={selected.length === 0}>Continue →</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Reg: GWBR list ───────────────────────────────────────────────────────────

function GWBRList({
  selectedIds, onChangeSelected, onConfirm, onReset,
}: {
  selectedIds: number[];
  onChangeSelected: (ids: number[]) => void;
  onConfirm: () => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<TabType>("selected");
  const [search, setSearch] = useState("");
  const selSet = new Set(selectedIds);
  const q = search.toLowerCase();
  const match = (g: GwbrEntry) => `${g.state} ${g.licName} ${g.licCode} ${g.loaName} ${g.loaCode}`.toLowerCase().includes(q);
  const visible = GWBR_POOL.filter(g => {
    if (tab === "selected")   return selSet.has(g.id) && match(g);
    if (tab === "unselected") return !selSet.has(g.id) && match(g);
    return match(g);
  });
  const add    = (id: number) => onChangeSelected([...selectedIds, id]);
  const remove = (id: number) => onChangeSelected(selectedIds.filter(x => x !== id));
  const selCount = selectedIds.length;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "14px 24px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules…" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", fontSize: 13, color: C.text, outline: "none" }} />
        <SegToggle options={[["selected",`Selected (${selCount})`],["unselected",`Unselected (${GWBR_POOL.length - selCount})`],["all",`All (${GWBR_POOL.length})`]]} value={tab} onChange={v => { setTab(v as TabType); setSearch(""); }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {visible.map(g => {
            const isSel = selSet.has(g.id);
            return (
              <div key={g.id} style={{ display: "flex", alignItems: "center", padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                <span style={{ flex: 1, fontSize: 13, color: C.text }}>
                  <span style={{ fontWeight: 700, color: C.accent }}>{g.state}</span>
                  <span style={{ color: C.muted, margin: "0 6px" }}>—</span>
                  <span>{g.licName}</span><span style={{ color: C.muted }}> ({g.licCode})</span>
                  <span style={{ color: C.muted, margin: "0 6px" }}>—</span>
                  <span>{g.loaName}</span><span style={{ color: C.muted }}> ({g.loaCode})</span>
                </span>
                {isSel
                  ? <button onClick={() => remove(g.id)} style={{ marginLeft: 12, fontSize: 11, fontWeight: 500, color: C.danger, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5, padding: "3px 9px", cursor: "pointer" }}>Remove</button>
                  : <button onClick={() => add(g.id)} style={{ marginLeft: 12, fontSize: 11, fontWeight: 500, color: C.success, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 5, padding: "3px 9px", cursor: "pointer" }}>+ Add</button>
                }
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: C.muted }}>{selCount} rule{selCount !== 1 ? "s" : ""} selected</span>
        <div style={{ display: "flex", gap: 8 }}>
          <SecBtn onClick={onReset}>Start Over</SecBtn>
          <PrimaryBtn onClick={onConfirm} disabled={selCount === 0}>Confirm Rules</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Org: Component config ────────────────────────────────────────────────────

function ComponentConfigForm({
  type, config, onChange,
}: {
  type: ComponentType;
  config: ComponentConfig;
  onChange: (c: ComponentConfig) => void;
}) {
  const field = (label: string, key: keyof ComponentConfig, placeholder = "", multiline = false) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 5 }}>{label}</div>
      {multiline
        ? <textarea value={(config[key] as string) || ""} onChange={e => onChange({ ...config, [key]: e.target.value })} placeholder={placeholder} rows={4} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        : <input value={(config[key] as string) || ""} onChange={e => onChange({ ...config, [key]: e.target.value })} placeholder={placeholder} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }} />
      }
    </div>
  );

  if (type === "text") return <div>{field("Label (optional)", "label", "e.g. Welcome Message")}{field("Content", "content", "Enter text content…", true)}</div>;
  if (type === "video") return <div>{field("Label", "label", "e.g. Onboarding Video")}{field("Video URL", "url", "https://…")}{field("Description (optional)", "description", "Brief description…")}</div>;
  if (type === "file") return <div>{field("Label", "label", "e.g. Agent Agreement")}{field("File URL or name", "url", "https://… or filename.pdf")}{field("Description (optional)", "description", "")}</div>;
  if (type === "freetext") return (
    <div>
      {field("Question", "question", "e.g. Describe your experience…")}
      {field("Placeholder hint (optional)", "placeholder", "e.g. Enter your answer here")}
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={!!config.required} onChange={e => onChange({ ...config, required: e.target.checked })} />
        <span style={{ fontSize: 13, color: C.text }}>Required</span>
      </label>
    </div>
  );
  if (type === "picklist") return (
    <div>
      {field("Question", "question", "e.g. Select your license type")}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 5 }}>Options (one per line)</div>
        <textarea value={config.options || ""} onChange={e => onChange({ ...config, options: e.target.value })} placeholder={"Option 1\nOption 2\nOption 3"} rows={5} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 5 }}>Selection type</div>
        <SegToggle options={[["single","Single select"],["multi","Multi-select"]]} value={config.selType || "single"} onChange={v => onChange({ ...config, selType: v as "single" | "multi" })} />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={!!config.required} onChange={e => onChange({ ...config, required: e.target.checked })} />
        <span style={{ fontSize: 13, color: C.text }}>Required</span>
      </label>
    </div>
  );
  if (type === "boolean") return (
    <div>
      {field("Question", "question", "e.g. Do you agree to the terms?")}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 5 }}>Display as</div>
        <SegToggle options={[["toggle","Toggle"],["radio","Yes / No buttons"],["checkbox","Checkbox"]]} value={config.display || "toggle"} onChange={v => onChange({ ...config, display: v as "toggle" | "radio" | "checkbox" })} />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={!!config.required} onChange={e => onChange({ ...config, required: e.target.checked })} />
        <span style={{ fontSize: 13, color: C.text }}>Required</span>
      </label>
    </div>
  );
  if (type === "fileupload") return (
    <div>
      {field("Label", "label", "e.g. Upload your E&O Certificate")}
      {field("Instructions (optional)", "instructions", "e.g. PDF only, max 5 MB")}
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={!!config.required} onChange={e => onChange({ ...config, required: e.target.checked })} />
        <span style={{ fontSize: 13, color: C.text }}>Required</span>
      </label>
    </div>
  );
  if (type === "signature") return (
    <div>
      {field("Label", "label", "e.g. Agent Acknowledgement")}
      {field("Prompt text", "prompt", "e.g. I agree to all terms and conditions.")}
      {field("Signer role (optional)", "signerRole", "e.g. Agent, Manager")}
    </div>
  );
  return null;
}

// ─── Org: Component preview ───────────────────────────────────────────────────

function ComponentPreview({
  comp, onEdit, onRemove,
}: {
  comp: TaskComponent;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const typeInfo = COMPONENT_TYPES.flatMap(g => g.items).find(i => i.type === comp.type) ?? { icon: "?", label: comp.type };
  const c = comp.config;

  const renderContent = () => {
    if (comp.type === "text") return (
      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
        {c.label && <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{c.label}</div>}
        {c.content ? <div>{c.content}</div> : <div style={{ color: C.muted, fontStyle: "italic" }}>No content yet</div>}
      </div>
    );
    if (comp.type === "video") return (
      <div>
        {c.label && <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{c.label}</div>}
        <div style={{ background: "#111", borderRadius: 8, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 28, color: "#fff" }}>▶</span>
        </div>
        {c.url && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, wordBreak: "break-all" }}>{c.url}</div>}
      </div>
    );
    if (comp.type === "file") return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
        <span style={{ fontSize: 22 }}>📎</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.label || "Attachment"}</div>
          {c.url && <div style={{ fontSize: 11, color: C.muted }}>{c.url}</div>}
        </div>
      </div>
    );
    if (comp.type === "freetext") return (
      <div>
        {c.question && <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>{c.question}{c.required && <span style={{ color: C.danger }}> *</span>}</div>}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.muted, minHeight: 60 }}>{c.placeholder || "Enter your answer…"}</div>
      </div>
    );
    if (comp.type === "picklist") return (
      <div>
        {c.question && <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8 }}>{c.question}{c.required && <span style={{ color: C.danger }}> *</span>}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {(c.options || "Option 1\nOption 2").split("\n").filter(Boolean).slice(0, 4).map((opt: string, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px" }}>
              <div style={{ width: 14, height: 14, borderRadius: c.selType === "multi" ? 3 : "50%", border: `2px solid ${C.border}` }} />
              <span style={{ fontSize: 13, color: C.text }}>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    );
    if (comp.type === "boolean") return (
      <div>
        {c.question && <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8 }}>{c.question}{c.required && <span style={{ color: C.danger }}> *</span>}</div>}
        {c.display === "radio"
          ? <div style={{ display: "flex", gap: 8 }}>{["Yes","No"].map(opt => <div key={opt} style={{ flex: 1, textAlign: "center", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px", fontSize: 13, color: C.text, background: C.bg }}>{opt}</div>)}</div>
          : c.display === "checkbox"
          ? <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" disabled /><span style={{ fontSize: 13, color: C.text }}>Confirm</span></label>
          : <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 40, height: 22, borderRadius: 11, background: C.border, position: "relative" }}><div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 2 }} /></div><span style={{ fontSize: 13, color: C.muted }}>Off</span></div>
        }
      </div>
    );
    if (comp.type === "fileupload") return (
      <div>
        {c.label && <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>{c.label}{c.required && <span style={{ color: C.danger }}> *</span>}</div>}
        <div style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>⬆</div>
          <div style={{ fontSize: 13, color: C.muted }}>{c.instructions || "Click to upload or drag & drop"}</div>
        </div>
      </div>
    );
    if (comp.type === "signature") return (
      <div>
        {c.label && <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{c.label}</div>}
        {c.prompt && <div style={{ fontSize: 13, color: C.textMed, marginBottom: 10, lineHeight: 1.5 }}>{c.prompt}</div>}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, height: 60, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Signature field</span>
        </div>
        {c.signerRole && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Signer: {c.signerRole}</div>}
      </div>
    );
    return <div style={{ fontSize: 12, color: C.muted }}>{typeInfo.label} component</div>;
  };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ color: C.accent, fontSize: 11, fontWeight: 600, background: C.accentBg, border: `1px solid ${C.accentLight}44`, borderRadius: 4, padding: "1px 6px" }}>{typeInfo.icon} {typeInfo.label}</span>
        <div style={{ flex: 1 }} />
        <button onClick={onEdit} style={{ fontSize: 11, color: C.textMed, background: "none", border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 8px", cursor: "pointer" }}>Edit</button>
        <button onClick={onRemove} style={{ fontSize: 11, color: C.danger, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5, padding: "2px 8px", cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ padding: "12px 14px" }}>{renderContent()}</div>
    </div>
  );
}

// ─── Org: Task editor ─────────────────────────────────────────────────────────

type EditorSubView = "editor" | "addComponent" | "configComponent";

function TaskEditor({
  task, onChange, onBack, onDone,
}: {
  task: Task;
  onChange: (t: Task) => void;
  onBack: () => void;
  onDone: () => void;
}) {
  const [subView, setSubView] = useState<EditorSubView>("editor");
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [draftConfig, setDraftConfig] = useState<ComponentConfig>({});
  const [draftType, setDraftType] = useState<ComponentType | null>(null);

  const startAdd = (type: ComponentType) => { setDraftType(type); setDraftConfig({}); setEditingCompId(null); setSubView("configComponent"); };
  const startEdit = (comp: TaskComponent) => { setDraftType(comp.type); setDraftConfig({ ...comp.config }); setEditingCompId(comp.id); setSubView("configComponent"); };
  const saveComp = () => {
    if (!draftType) return;
    if (editingCompId) {
      onChange({ ...task, components: task.components.map(c => c.id === editingCompId ? { ...c, config: draftConfig } : c) });
    } else {
      onChange({ ...task, components: [...task.components, { id: uid(), type: draftType, config: draftConfig }] });
    }
    setSubView("editor");
  };
  const removeComp = (id: string) => onChange({ ...task, components: task.components.filter(c => c.id !== id) });
  const moveComp = (idx: number, dir: number) => {
    const arr = [...task.components];
    const swp = idx + dir;
    if (swp < 0 || swp >= arr.length) return;
    [arr[idx], arr[swp]] = [arr[swp], arr[idx]];
    onChange({ ...task, components: arr });
  };

  const typeInfo = draftType ? COMPONENT_TYPES.flatMap(g => g.items).find(i => i.type === draftType) : null;

  if (subView === "addComponent") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Choose a component type to add.</div>
        {COMPONENT_TYPES.map(group => (
          <div key={group.group} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{group.group}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {group.items.map(item => (
                <button key={item.type} onClick={() => startAdd(item.type)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{item.label}</span>
                  <span style={{ marginLeft: "auto", color: C.muted }}>›</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}` }}>
        <SecBtn onClick={() => setSubView("editor")} style={{ width: "100%" }}>← Back to task</SecBtn>
      </div>
    </div>
  );

  if (subView === "configComponent" && draftType) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>{typeInfo?.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{typeInfo?.label}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{editingCompId ? "Edit component" : "Configure new component"}</div>
          </div>
        </div>
        <ComponentConfigForm type={draftType} config={draftConfig} onChange={setDraftConfig} />
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <SecBtn onClick={() => setSubView(editingCompId ? "editor" : "addComponent")}>Cancel</SecBtn>
        <PrimaryBtn onClick={saveComp}>{editingCompId ? "Save changes" : "Add component"}</PrimaryBtn>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Task Settings</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 4 }}>Task name <span style={{ color: C.danger }}>*</span></div>
              <input value={task.name} onChange={e => onChange({ ...task, name: e.target.value })} placeholder="e.g. E&O Certificate Upload" style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 4 }}>Type</div>
                <SegToggle options={[["internal","Internal"],["external","External"]]} value={task.type} onChange={v => onChange({ ...task, type: v as TaskType })} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 4 }}>Owner</div>
                <SegToggle options={[["producer","Producer"],["Operations","Operations"]]} value={task.owner} onChange={v => onChange({ ...task, owner: v as OwnerType })} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 4 }}>Requires approval</div>
              <SegToggle options={[["no","No"],["yes","Yes"]]} value={task.approval} onChange={v => onChange({ ...task, approval: v as ApprovalType })} />
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Task Preview — Components ({task.components.length})
        </div>
        {task.components.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", border: `2px dashed ${C.border}`, borderRadius: 10, color: C.muted, fontSize: 13 }}>
            No components yet.<br /><span style={{ fontSize: 12 }}>Add components below to build the task.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 32 }}>
            {task.components.map((comp, idx) => (
              <div key={comp.id} style={{ position: "relative" }}>
                <ComponentPreview comp={comp} onEdit={() => startEdit(comp)} onRemove={() => removeComp(comp.id)} />
                <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: -28, display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => moveComp(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? C.borderLight : C.muted, fontSize: 12, padding: 1 }}>▲</button>
                  <button onClick={() => moveComp(idx, 1)} disabled={idx === task.components.length - 1} style={{ background: "none", border: "none", cursor: idx === task.components.length - 1 ? "default" : "pointer", color: idx === task.components.length - 1 ? C.borderLight : C.muted, fontSize: 12, padding: 1 }}>▼</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setSubView("addComponent")} style={{ marginTop: 12, width: "100%", padding: "10px", border: `1.5px dashed ${C.accentLight}`, borderRadius: 10, background: C.accentBg, color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Component</button>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <SecBtn onClick={onBack}>Cancel</SecBtn>
        <PrimaryBtn onClick={onDone} disabled={!task.name.trim()}>Save Task →</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Org: Task sequencer ──────────────────────────────────────────────────────

const TYPE_COLORS: Record<TaskType, { bg: string; text: string; border: string }> = {
  internal: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  external: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
};
const OWNER_LABEL: Record<OwnerType, string> = { producer: "Producer", internal: "Internal" };

function TaskSequencer({
  tasks, onChangeTasks, onConfirm, onAddTask, onEditTask,
}: {
  tasks: Task[];
  onChangeTasks: (t: Task[]) => void;
  onConfirm: () => void;
  onAddTask: () => void;
  onEditTask: (t: Task) => void;
}) {
  const move = (idx: number, dir: number) => {
    const arr = [...tasks];
    const swp = idx + dir;
    if (swp < 0 || swp >= arr.length) return;
    [arr[idx], arr[swp]] = [arr[swp], arr[idx]];
    onChangeTasks(arr);
  };
  const remove = (id: string) => onChangeTasks(tasks.filter(t => t.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Set the order producers will see these tasks.</div>
        {tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 13 }}>No tasks yet. Add your first task below.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((task, idx) => {
              const tc = TYPE_COLORS[task.type] ?? TYPE_COLORS.internal;
              return (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                    <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? C.borderLight : C.muted, fontSize: 11, lineHeight: 1 }}>▲</button>
                    <button onClick={() => move(idx, 1)} disabled={idx === tasks.length - 1} style={{ background: "none", border: "none", cursor: idx === tasks.length - 1 ? "default" : "pointer", color: idx === tasks.length - 1 ? C.borderLight : C.muted, fontSize: 11, lineHeight: 1 }}>▼</button>
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.muted, flexShrink: 0 }}>{idx + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{task.name || "Untitled Task"}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: tc.text, background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 4, padding: "1px 6px" }}>{task.type}</span>
                      <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px" }}>{OWNER_LABEL[task.owner]}</span>
                      {task.approval === "yes" && <span style={{ fontSize: 11, color: C.warning, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 4, padding: "1px 6px" }}>Approval</span>}
                      <span style={{ fontSize: 11, color: C.muted }}>{task.components.length} component{task.components.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <button onClick={() => onEditTask(task)} style={{ fontSize: 11, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: "3px 9px", cursor: "pointer", flexShrink: 0 }}>Edit</button>
                  <button onClick={() => remove(task.id)} style={{ fontSize: 11, color: C.danger, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5, padding: "3px 9px", cursor: "pointer", flexShrink: 0 }}>✕</button>
                </div>
              );
            })}
          </div>
        )}
        <button onClick={onAddTask} style={{ marginTop: 12, width: "100%", padding: "10px", border: `1.5px dashed ${C.accentLight}`, borderRadius: 10, background: C.accentBg, color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Task</button>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: C.muted }}>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
        <PrimaryBtn onClick={onConfirm} disabled={tasks.length === 0}>Confirm Tasks</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PolicySetDrawer({ open, onClose, isPlus = true, onSave }: PolicySetDrawerProps) {
  const [view, setView]               = useState("main");
  const [psName, setPsName]           = useState("");
  const [requiredForAll, setRequiredForAll] = useState(false);
  const [states, setStates]           = useState<string[]>([]);
  const [products, setProducts]       = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [regDone, setRegDone]         = useState(false);
  const [tasks, setTasks]             = useState<Task[]>([]);
  const [orgDone, setOrgDone]         = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNewTask, setIsNewTask]     = useState(false);

  const resetAll = () => {
    setView("main"); setPsName("");
    setRequiredForAll(false);
    setStates([]); setProducts([]); setSelectedIds([]); setRegDone(false);
    setTasks([]); setOrgDone(false); setEditingTask(null); setIsNewTask(false);
  };

  const skipToGWBR = () => { setSelectedIds(GWBR_POOL.map(g => g.id)); setView("gwbr"); };

  const startCompile = () => {
    setView("compiling");
    const pool = GWBR_POOL.filter(g => states.includes(g.state));
    setTimeout(() => { setSelectedIds(pool.map(g => g.id)); setView("gwbr"); }, 1500);
  };

  const handleSave = () => {
    onSave({ name: psName, gwbrIds: selectedIds, states, products, tasks, requiredForAll });
    resetAll();
  };

  const openAddTask = () => {
    setEditingTask({ id: uid(), name: "", type: "internal", owner: "producer", approval: "no", components: [] });
    setIsNewTask(true);
    setView("taskEditor");
  };

  const openEditTask = (task: Task) => {
    setEditingTask({ ...task });
    setIsNewTask(false);
    setView("taskEditor");
  };

  const saveTask = () => {
    if (!editingTask) return;
    if (isNewTask) {
      setTasks(prev => [...prev, editingTask]);
    } else {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
    }
    setEditingTask(null);
    setView("taskSequencer");
  };

  const hp = (() => {
    if (view === "main")          return { title: psName || "New Policy Set",       subtitle: "Define requirements for this policy set",  onBack: undefined };
    if (view === "states")        return { title: "Regulatory Requirements",         subtitle: "Step 1 of 2 — Select states",              onBack: () => setView("main") };
    if (view === "products")      return { title: "Regulatory Requirements",         subtitle: "Step 2 of 2 — Select products",            onBack: () => setView("states") };
    if (view === "compiling")     return { title: "Compiling Rules…",                subtitle: undefined,                                  onBack: undefined };
    if (view === "gwbr")          return { title: "Gateway Business Rules",           subtitle: `${GWBR_POOL.length} rules in system`,      onBack: () => setView("main") };
    if (view === "taskSequencer") return { title: "Organizational Requirements",     subtitle: "Manage & sequence tasks",                  onBack: () => setView("main") };
    if (view === "taskEditor")    return { title: isNewTask ? "New Task" : "Edit Task", subtitle: "Configure task header & components",    onBack: () => { setEditingTask(null); setView("taskSequencer"); } };
    return { title: "", subtitle: undefined, onBack: undefined };
  })();

  return (
    <Drawer open={open} onClose={onClose} title={hp.title} subtitle={hp.subtitle} onBack={hp.onBack}>

      {view === "main" && (
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 6 }}>Policy set name <span style={{ color: C.danger }}>*</span></div>
            <input value={psName} onChange={e => setPsName(e.target.value)} placeholder="e.g. Licensed P&C Producer" style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={requiredForAll} onChange={e => setRequiredForAll(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer" }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Required for all</span>
            </label>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMed, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Regulatory Requirements</div>
            {isPlus ? (
              <div onClick={() => setView(regDone ? "gwbr" : "states")} style={{ background: C.surface, border: `1.5px solid ${regDone ? C.accent : C.border}`, borderRadius: 12, padding: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: regDone ? C.accentBg : C.bg, border: `1px solid ${regDone ? C.accentLight + "44" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{regDone ? "✓" : "⚖"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: regDone ? C.accent : C.text }}>{regDone ? `${selectedIds.length} Gateway Business Rules` : "Add regulatory requirements"}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{regDone ? (states.length > 0 ? `${states.length} states · ${products.length} products` : "Manually curated") : "States, products, and licensing rules"}</div>
                </div>
                <span style={{ color: C.muted, fontSize: 13 }}>›</span>
              </div>
            ) : (
              <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18, opacity: 0.55, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚖</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: C.textDim }}>Add regulatory requirements</div><div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>States, products, and licensing rules</div></div>
                <span style={{ fontSize: 11, color: C.accent, background: C.accentBg, border: `1px solid ${C.accentLight}44`, borderRadius: 4, padding: "1px 6px" }}>Post-MVP</span>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMed, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Organizational Requirements</div>
            <div onClick={() => setView("taskSequencer")} style={{ background: C.surface, border: `1.5px solid ${orgDone ? C.accent : C.border}`, borderRadius: 12, padding: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: orgDone ? C.accentBg : C.bg, border: `1px solid ${orgDone ? C.accentLight + "44" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{orgDone ? "✓" : "⊞"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: orgDone ? C.accent : C.text }}>{orgDone ? `${tasks.length} task${tasks.length !== 1 ? "s" : ""} configured` : "Add organizational requirements"}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{orgDone ? tasks.map(t => t.name).join(", ") : "Internal onboarding tasks and processes"}</div>
              </div>
              <span style={{ color: C.muted, fontSize: 13 }}>›</span>
            </div>
          </div>

          {(regDone || orgDone) && psName.trim() && (
            <PrimaryBtn onClick={handleSave} style={{ width: "100%" }}>Save Policy Set</PrimaryBtn>
          )}
        </div>
      )}

      {view === "states"   && <StateSelector selected={states} onChange={setStates} onNext={() => setView("products")} onSkip={skipToGWBR} />}
      {view === "products" && <ProductSelector selected={products} onChange={setProducts} onNext={() => { setView("compiling"); startCompile(); }} onSkip={skipToGWBR} />}

      {view === "compiling" && (
        <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 26, display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>Compiling Gateway Business Rules</div>
            <div style={{ fontSize: 13, color: C.muted }}>Matching state/product combinations…</div>
          </div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {view === "gwbr" && (
        <GWBRList
          selectedIds={selectedIds}
          onChangeSelected={setSelectedIds}
          onConfirm={() => { setRegDone(true); setView("main"); }}
          onReset={() => { setStates([]); setProducts([]); setSelectedIds([]); setRegDone(false); setView("states"); }}
        />
      )}

      {view === "taskSequencer" && (
        <TaskSequencer tasks={tasks} onChangeTasks={setTasks} onConfirm={() => { setOrgDone(true); setView("main"); }} onAddTask={openAddTask} onEditTask={openEditTask} />
      )}

      {view === "taskEditor" && editingTask && (
        <TaskEditor task={editingTask} onChange={setEditingTask} onBack={() => { setEditingTask(null); setView("taskSequencer"); }} onDone={saveTask} />
      )}
    </Drawer>
  );
}