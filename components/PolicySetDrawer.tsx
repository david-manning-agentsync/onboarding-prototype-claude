// PolicySetDrawer.tsx
// Drop this next to PolicySets.tsx and import { PolicySetDrawer } from "./PolicySetDrawer"

import { useState } from "react";
import { C } from "../theme";

// ─── Constants ────────────────────────────────────────────────────────────────

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const PRODUCTS = [
  "Property & Casualty (P&C)", "Life Insurance", "Health Insurance",
  "Accident & Health (A&H)", "Surplus Lines", "Variable Products",
  "Title Insurance", "Crop / Agriculture", "Workers Compensation", "Medicare Supplement",
];

const GWBR_POOL = [
  // CA
  { id:1,  state:"CA", licName:"Property Broker-Agent",         licCode:"210", loaName:"Fire & Allied Lines",    loaCode:"031" },
  { id:2,  state:"CA", licName:"Property Broker-Agent",         licCode:"210", loaName:"Liability",              loaCode:"033" },
  { id:3,  state:"CA", licName:"Property Broker-Agent",         licCode:"210", loaName:"Inland Marine",          loaCode:"034" },
  { id:4,  state:"CA", licName:"Property Broker-Agent",         licCode:"210", loaName:"Commercial Auto",        loaCode:"038" },
  { id:5,  state:"CA", licName:"Life-Only Agent",               licCode:"220", loaName:"Life",                   loaCode:"061" },
  { id:6,  state:"CA", licName:"Life-Only Agent",               licCode:"220", loaName:"Fixed Annuity",          loaCode:"063" },
  { id:7,  state:"CA", licName:"Accident & Health Agent",       licCode:"230", loaName:"Disability Income",      loaCode:"071" },
  { id:8,  state:"CA", licName:"Accident & Health Agent",       licCode:"230", loaName:"Long-Term Care",         loaCode:"074" },
  { id:9,  state:"CA", licName:"Surplus Lines Broker",          licCode:"240", loaName:"Surplus Lines",          loaCode:"091" },
  { id:10, state:"CA", licName:"Variable Products Agent",       licCode:"250", loaName:"Variable Annuity",       loaCode:"065" },
  // TX
  { id:11, state:"TX", licName:"General Lines Agent",           licCode:"300", loaName:"Property",               loaCode:"041" },
  { id:12, state:"TX", licName:"General Lines Agent",           licCode:"300", loaName:"Casualty",               loaCode:"043" },
  { id:13, state:"TX", licName:"General Lines Agent",           licCode:"300", loaName:"Inland Marine",          loaCode:"044" },
  { id:14, state:"TX", licName:"General Lines Agent",           licCode:"300", loaName:"Boiler & Machinery",     loaCode:"047" },
  { id:15, state:"TX", licName:"Life, Accident & Health Agent", licCode:"310", loaName:"Life",                   loaCode:"061" },
  { id:16, state:"TX", licName:"Life, Accident & Health Agent", licCode:"310", loaName:"Health",                 loaCode:"072" },
  { id:17, state:"TX", licName:"Life, Accident & Health Agent", licCode:"310", loaName:"Fixed Annuity",          loaCode:"063" },
  { id:18, state:"TX", licName:"Surplus Lines Agent",           licCode:"320", loaName:"Surplus Lines",          loaCode:"091" },
  { id:19, state:"TX", licName:"Variable Life & Annuity Agent", licCode:"330", loaName:"Variable Life",          loaCode:"062" },
  { id:20, state:"TX", licName:"Workers Comp Specialist",       licCode:"340", loaName:"Workers Compensation",   loaCode:"054" },
  // NY
  { id:21, state:"NY", licName:"Broker",                        licCode:"400", loaName:"Property",               loaCode:"041" },
  { id:22, state:"NY", licName:"Broker",                        licCode:"400", loaName:"Casualty",               loaCode:"043" },
  { id:23, state:"NY", licName:"Broker",                        licCode:"400", loaName:"Fire",                   loaCode:"031" },
  { id:24, state:"NY", licName:"Life Broker",                   licCode:"410", loaName:"Life",                   loaCode:"061" },
  { id:25, state:"NY", licName:"Life Broker",                   licCode:"410", loaName:"Annuity",                loaCode:"064" },
  { id:26, state:"NY", licName:"Accident & Health Broker",      licCode:"420", loaName:"Accident & Health",      loaCode:"070" },
  { id:27, state:"NY", licName:"Accident & Health Broker",      licCode:"420", loaName:"Long-Term Care",         loaCode:"074" },
  { id:28, state:"NY", licName:"Excess Lines Broker",           licCode:"430", loaName:"Excess Lines",           loaCode:"092" },
  // FL
  { id:29, state:"FL", licName:"General Lines Agent",           licCode:"500", loaName:"Property",               loaCode:"041" },
  { id:30, state:"FL", licName:"General Lines Agent",           licCode:"500", loaName:"Casualty",               loaCode:"043" },
  { id:31, state:"FL", licName:"General Lines Agent",           licCode:"500", loaName:"Personal Lines",         loaCode:"048" },
  { id:32, state:"FL", licName:"Life Agent",                    licCode:"510", loaName:"Life",                   loaCode:"061" },
  { id:33, state:"FL", licName:"Life Agent",                    licCode:"510", loaName:"Variable Annuity",       loaCode:"065" },
  { id:34, state:"FL", licName:"Health Agent",                  licCode:"520", loaName:"Health",                 loaCode:"072" },
  { id:35, state:"FL", licName:"Health Agent",                  licCode:"520", loaName:"Medicare Supplement",    loaCode:"073" },
  { id:36, state:"FL", licName:"Surplus Lines Agent",           licCode:"530", loaName:"Surplus Lines",          loaCode:"091" },
  // IL
  { id:37, state:"IL", licName:"Property & Casualty Producer",  licCode:"600", loaName:"Fire",                   loaCode:"031" },
  { id:38, state:"IL", licName:"Property & Casualty Producer",  licCode:"600", loaName:"Allied Lines",           loaCode:"032" },
  { id:39, state:"IL", licName:"Property & Casualty Producer",  licCode:"600", loaName:"Casualty",               loaCode:"043" },
  { id:40, state:"IL", licName:"Life Producer",                 licCode:"610", loaName:"Life",                   loaCode:"061" },
  { id:41, state:"IL", licName:"Accident & Health Producer",    licCode:"620", loaName:"Health",                 loaCode:"072" },
  { id:42, state:"IL", licName:"Surplus Lines Producer",        licCode:"630", loaName:"Surplus Lines",          loaCode:"091" },
  // WA
  { id:43, state:"WA", licName:"Property & Casualty Broker",    licCode:"700", loaName:"Property",               loaCode:"041" },
  { id:44, state:"WA", licName:"Property & Casualty Broker",    licCode:"700", loaName:"Casualty",               loaCode:"043" },
  { id:45, state:"WA", licName:"Life & Disability Broker",      licCode:"710", loaName:"Life",                   loaCode:"061" },
  { id:46, state:"WA", licName:"Life & Disability Broker",      licCode:"710", loaName:"Disability",             loaCode:"076" },
  { id:47, state:"WA", licName:"Title Insurance Agent",         licCode:"720", loaName:"Title",                  loaCode:"093" },
  // CO
  { id:48, state:"CO", licName:"Property & Casualty Producer",  licCode:"800", loaName:"Property",               loaCode:"041" },
  { id:49, state:"CO", licName:"Property & Casualty Producer",  licCode:"800", loaName:"Liability",              loaCode:"033" },
  { id:50, state:"CO", licName:"Life Producer",                 licCode:"810", loaName:"Life",                   loaCode:"061" },
  { id:51, state:"CO", licName:"Life Producer",                 licCode:"810", loaName:"Annuity",                loaCode:"064" },
  // OH
  { id:52, state:"OH", licName:"Property & Casualty Agent",     licCode:"550", loaName:"Fire",                   loaCode:"031" },
  { id:53, state:"OH", licName:"Property & Casualty Agent",     licCode:"550", loaName:"Casualty",               loaCode:"043" },
  { id:54, state:"OH", licName:"Life Agent",                    licCode:"560", loaName:"Life",                   loaCode:"061" },
  { id:55, state:"OH", licName:"Life Agent",                    licCode:"560", loaName:"Variable Life",          loaCode:"062" },
  { id:56, state:"OH", licName:"Health Agent",                  licCode:"570", loaName:"Health",                 loaCode:"072" },
  // GA
  { id:57, state:"GA", licName:"Property & Casualty Agent",     licCode:"450", loaName:"Property",               loaCode:"041" },
  { id:58, state:"GA", licName:"Property & Casualty Agent",     licCode:"450", loaName:"Casualty",               loaCode:"043" },
  { id:59, state:"GA", licName:"Life & Health Agent",           licCode:"460", loaName:"Life",                   loaCode:"061" },
  { id:60, state:"GA", licName:"Life & Health Agent",           licCode:"460", loaName:"Health",                 loaCode:"072" },
  // PA
  { id:61, state:"PA", licName:"Property & Casualty Agent",     licCode:"650", loaName:"Property",               loaCode:"041" },
  { id:62, state:"PA", licName:"Property & Casualty Agent",     licCode:"650", loaName:"Casualty",               loaCode:"043" },
  { id:63, state:"PA", licName:"Life Agent",                    licCode:"660", loaName:"Life",                   loaCode:"061" },
  { id:64, state:"PA", licName:"Surplus Lines Licensee",        licCode:"670", loaName:"Surplus Lines",          loaCode:"091" },
  // NJ
  { id:65, state:"NJ", licName:"Property & Casualty Producer",  licCode:"480", loaName:"Property",               loaCode:"041" },
  { id:66, state:"NJ", licName:"Property & Casualty Producer",  licCode:"480", loaName:"Casualty",               loaCode:"043" },
  { id:67, state:"NJ", licName:"Life Producer",                 licCode:"490", loaName:"Life",                   loaCode:"061" },
  { id:68, state:"NJ", licName:"Life Producer",                 licCode:"490", loaName:"Annuity",                loaCode:"064" },
  // AZ
  { id:69, state:"AZ", licName:"Property & Casualty Licensee",  licCode:"270", loaName:"Property",               loaCode:"041" },
  { id:70, state:"AZ", licName:"Property & Casualty Licensee",  licCode:"270", loaName:"Casualty",               loaCode:"043" },
  { id:71, state:"AZ", licName:"Life & Health Licensee",        licCode:"280", loaName:"Life",                   loaCode:"061" },
  { id:72, state:"AZ", licName:"Life & Health Licensee",        licCode:"280", loaName:"Health",                 loaCode:"072" },
  // MN
  { id:73, state:"MN", licName:"Property & Casualty Agent",     licCode:"580", loaName:"Property",               loaCode:"041" },
  { id:74, state:"MN", licName:"Property & Casualty Agent",     licCode:"580", loaName:"Casualty",               loaCode:"043" },
  { id:75, state:"MN", licName:"Life Producer",                 licCode:"590", loaName:"Life",                   loaCode:"061" },
  { id:76, state:"MN", licName:"Accident & Health Agent",       licCode:"595", loaName:"Health",                 loaCode:"072" },
  // MI
  { id:77, state:"MI", licName:"Property & Casualty Agent",     licCode:"540", loaName:"Property",               loaCode:"041" },
  { id:78, state:"MI", licName:"Property & Casualty Agent",     licCode:"540", loaName:"Casualty",               loaCode:"043" },
  { id:79, state:"MI", licName:"Life Agent",                    licCode:"545", loaName:"Life",                   loaCode:"061" },
  { id:80, state:"MI", licName:"Surplus Lines Broker",          licCode:"548", loaName:"Surplus Lines",          loaCode:"091" },
  // NC
  { id:81, state:"NC", licName:"Property & Casualty Agent",     licCode:"620", loaName:"Property",               loaCode:"041" },
  { id:82, state:"NC", licName:"Property & Casualty Agent",     licCode:"620", loaName:"Casualty",               loaCode:"043" },
  { id:83, state:"NC", licName:"Life & Health Agent",           licCode:"630", loaName:"Life",                   loaCode:"061" },
  { id:84, state:"NC", licName:"Life & Health Agent",           licCode:"630", loaName:"Long-Term Care",         loaCode:"074" },
  // VA
  { id:85, state:"VA", licName:"Property & Casualty Licensee",  licCode:"740", loaName:"Fire & Allied Lines",    loaCode:"031" },
  { id:86, state:"VA", licName:"Property & Casualty Licensee",  licCode:"740", loaName:"Casualty",               loaCode:"043" },
  { id:87, state:"VA", licName:"Life & Annuity Licensee",       licCode:"750", loaName:"Life",                   loaCode:"061" },
  { id:88, state:"VA", licName:"Life & Annuity Licensee",       licCode:"750", loaName:"Variable Annuity",       loaCode:"065" },
  // MA
  { id:89, state:"MA", licName:"Property & Casualty Broker",    licCode:"760", loaName:"Property",               loaCode:"041" },
  { id:90, state:"MA", licName:"Property & Casualty Broker",    licCode:"760", loaName:"Casualty",               loaCode:"043" },
  { id:91, state:"MA", licName:"Life Broker",                   licCode:"770", loaName:"Life",                   loaCode:"061" },
  { id:92, state:"MA", licName:"Accident & Health Broker",      licCode:"780", loaName:"Disability Income",      loaCode:"071" },
  // TN
  { id:93, state:"TN", licName:"Property & Casualty Agent",     licCode:"680", loaName:"Property",               loaCode:"041" },
  { id:94, state:"TN", licName:"Life & Health Agent",           licCode:"690", loaName:"Life",                   loaCode:"061" },
  { id:95, state:"TN", licName:"Life & Health Agent",           licCode:"690", loaName:"Health",                 loaCode:"072" },
  // IN
  { id:96, state:"IN", licName:"Property & Casualty Producer",  licCode:"560", loaName:"Property",               loaCode:"041" },
  { id:97, state:"IN", licName:"Property & Casualty Producer",  licCode:"560", loaName:"Casualty",               loaCode:"043" },
  { id:98, state:"IN", licName:"Life Producer",                 licCode:"570", loaName:"Life",                   loaCode:"061" },
  // MO
  { id:99,  state:"MO", licName:"Property & Casualty Agent",    licCode:"610", loaName:"Property",               loaCode:"041" },
  { id:100, state:"MO", licName:"Life Agent",                   licCode:"615", loaName:"Life",                   loaCode:"061" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type GwbrEntry = typeof GWBR_POOL[0];

export interface PolicySetDrawerProps {
  open: boolean;
  onClose: () => void;
  /** true when org is on post-MVP or AI plan */
  isPlus: boolean;
  /** Called when user clicks "Save Policy Set" from the main view */
  onSave: (ps: { name: string; gwbrIds: number[]; states: string[]; products: string[] }) => void;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const PrimaryBtn = ({
  children, onClick, disabled, style = {},
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
  }}>
    {children}
  </button>
);

const Chip = ({ label }: { label: string }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 500,
    color: C.accent, background: C.accentBg,
    border: `1px solid ${C.accentLight}44`, borderRadius: 6, padding: "2px 8px",
  }}>{label}</span>
);

const SegToggle = ({
  options, value, onChange,
}: {
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div style={{
    display: "flex", background: C.bg, borderRadius: 8,
    padding: 3, gap: 2, border: `1px solid ${C.border}`,
  }}>
    {options.map(([val, label]) => (
      <button key={val} onClick={() => onChange(val)} style={{
        flex: 1, fontSize: 12, fontWeight: 600, padding: "5px 4px",
        borderRadius: 6, border: "none", cursor: "pointer",
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
  onBack?: (() => void) | null;
  children: React.ReactNode;
}) {
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", zIndex: 70,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .2s",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 520,
        background: C.surface, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 71,
        transform: open ? "translateX(0)" : "translateX(520px)",
        transition: "transform .25s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "18px 24px 14px", borderBottom: `1px solid ${C.border}`,
          flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
        }}>
          {onBack && (
            <button onClick={onBack} style={{
              background: "none", border: "none", cursor: "pointer",
              color: C.muted, fontSize: 18, padding: "2px 6px", borderRadius: 6,
            }}>←</button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18, padding: 4,
          }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
      </div>
    </>
  );
}

// ─── Step: State selector ─────────────────────────────────────────────────────

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
  const toggle = (s: string) =>
    onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Choose all states this policy set applies to.</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search states…"
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => onChange([...US_STATES])} style={{ fontSize: 12, color: C.accent, background: C.accentBg, border: `1px solid ${C.accentLight}44`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Select all</button>
          <button onClick={() => onChange([])} style={{ fontSize: 12, color: C.textDim, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Clear</button>
          {selected.length > 0 && <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>{selected.length} selected</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {filtered.map(s => (
            <div key={s} onClick={() => toggle(s)} style={{
              display: "flex", alignItems: "center", justifyContent: "center", height: 36, borderRadius: 8,
              border: `1.5px solid ${selected.includes(s) ? C.accent : C.border}`,
              background: selected.includes(s) ? C.accentBg : C.surface,
              color: selected.includes(s) ? C.accent : C.textMed,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{s}</div>
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onSkip} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>Skip to GWBR selector →</button>
        <PrimaryBtn onClick={onNext} disabled={selected.length === 0}>Continue →</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Step: Product selector ───────────────────────────────────────────────────

function ProductSelector({
  selected, onChange, onNext, onSkip,
}: {
  selected: string[];
  onChange: (p: string[]) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const toggle = (p: string) =>
    onChange(selected.includes(p) ? selected.filter(x => x !== p) : [...selected, p]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Choose the insurance product lines this policy set covers.</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => onChange([...PRODUCTS])} style={{ fontSize: 12, color: C.accent, background: C.accentBg, border: `1px solid ${C.accentLight}44`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Select all</button>
          <button onClick={() => onChange([])} style={{ fontSize: 12, color: C.textDim, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Clear</button>
          {selected.length > 0 && <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>{selected.length} selected</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {PRODUCTS.map(p => (
            <div key={p} onClick={() => toggle(p)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
              borderRadius: 10, border: `1.5px solid ${selected.includes(p) ? C.accent : C.border}`,
              background: selected.includes(p) ? C.accentBg : C.surface, cursor: "pointer",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4,
                border: `2px solid ${selected.includes(p) ? C.accent : C.border}`,
                background: selected.includes(p) ? C.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {selected.includes(p) && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: selected.includes(p) ? C.accent : C.text }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onSkip} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>Skip to GWBR selector →</button>
        <PrimaryBtn onClick={onNext} disabled={selected.length === 0}>Continue →</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Step: Confirm selections ─────────────────────────────────────────────────

function ConfirmSelections({
  states, products, onNext, onSkip,
}: {
  states: string[];
  products: string[];
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Review your selections before continuing.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: C.bg, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMed, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>States ({states.length})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{states.map(s => <Chip key={s} label={s} />)}</div>
          </div>
          <div style={{ background: C.bg, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMed, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Products ({products.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {products.map(p => (
                <div key={p} style={{ fontSize: 13, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: C.success }}>✓</span>{p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onSkip} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>Skip to GWBR selector →</button>
        <PrimaryBtn onClick={onNext}>Confirm →</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Step: Scope question ─────────────────────────────────────────────────────

function ScopeQuestion({
  onAllStates, onSpecific, onSkip,
}: {
  onAllStates: () => void;
  onSpecific: () => void;
  onSkip: () => void;
}) {
  const [scope, setScope] = useState<"all" | "specific">("all");
  const opts = [
    { val: "all" as const,      label: "Yes — all products apply to all states",        desc: "We'll compile applicable Gateway Business Rules for all state/product combinations." },
    { val: "specific" as const, label: "No — I need to map products to specific states", desc: "Define which products apply to which states before we compile rules." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1 }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Do the selected products apply to all selected states?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {opts.map(({ val, label, desc }) => {
            const sel = scope === val;
            return (
              <div key={val} onClick={() => setScope(val)} style={{
                padding: 20, borderRadius: 12,
                border: `1.5px solid ${sel ? C.accent : C.border}`,
                background: sel ? C.accentBg : C.surface,
                cursor: "pointer", display: "flex", gap: 14, transition: "all .15s",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: `2px solid ${sel ? C.accent : C.border}`,
                  background: sel ? C.accentBg : C.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                }}>
                  {sel && <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.accent }} />}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: sel ? C.accent : C.text, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onSkip} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>Skip to GWBR selector →</button>
        <PrimaryBtn onClick={scope === "all" ? onAllStates : onSpecific}>Continue →</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Step: Product↔State mapper ───────────────────────────────────────────────

function ProductStateMapper({
  states, products, mapping, onChange, onConfirm, onSkip,
}: {
  states: string[];
  products: string[];
  mapping: Record<string, string[]>;
  onChange: (m: Record<string, string[]>) => void;
  onConfirm: () => void;
  onSkip: () => void;
}) {
  const [viewMode, setViewMode] = useState<"byProduct" | "byState">("byProduct");
  const isLinked = (p: string, s: string) => (mapping[p] || []).includes(s);
  const toggle = (p: string, s: string) => {
    const cur = mapping[p] || [];
    onChange({ ...mapping, [p]: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] });
  };
  const selectAllForProduct = (p: string) => onChange({ ...mapping, [p]: [...states] });
  const clearAllForProduct  = (p: string) => onChange({ ...mapping, [p]: [] });
  const selectAllForState   = (s: string) => {
    const n = { ...mapping };
    products.forEach(p => { if (!(n[p] || []).includes(s)) n[p] = [...(n[p] || []), s]; });
    onChange(n);
  };
  const clearAllForState = (s: string) => {
    const n = { ...mapping };
    products.forEach(p => { n[p] = (n[p] || []).filter(x => x !== s); });
    onChange(n);
  };
  const totalLinks = Object.values(mapping).reduce((sum, a) => sum + a.length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Define which products apply to which states.</div>
        <div style={{ marginBottom: 16 }}>
          <SegToggle options={[["byProduct","By Product"],["byState","By State"]]} value={viewMode} onChange={v => setViewMode(v as "byProduct" | "byState")} />
        </div>
        {viewMode === "byProduct" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {products.map(p => {
              const sel = mapping[p] || [];
              return (
                <div key={p} style={{ background: C.bg, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button onClick={() => selectAllForProduct(p)} style={{ fontSize: 11, color: C.accent, background: C.accentBg, border: `1px solid ${C.accentLight}44`, borderRadius: 5, padding: "2px 8px", cursor: "pointer" }}>All</button>
                      <button onClick={() => clearAllForProduct(p)} style={{ fontSize: 11, color: C.textDim, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 8px", cursor: "pointer" }}>Clear</button>
                      <span style={{ fontSize: 11, color: C.muted }}>{sel.length}/{states.length}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {states.map(s => {
                      const on = sel.includes(s);
                      return (
                        <div key={s} onClick={() => toggle(p, s)} style={{
                          width: 36, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: 6, border: `1.5px solid ${on ? C.accent : C.border}`,
                          background: on ? C.accentBg : C.surface,
                          color: on ? C.accent : C.textDim,
                          fontSize: 11, fontWeight: 600, cursor: "pointer",
                        }}>{s}</div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {viewMode === "byState" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {states.map(s => {
              const selCount = products.filter(p => isLinked(p, s)).length;
              return (
                <div key={s} style={{ background: C.bg, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button onClick={() => selectAllForState(s)} style={{ fontSize: 11, color: C.accent, background: C.accentBg, border: `1px solid ${C.accentLight}44`, borderRadius: 5, padding: "2px 8px", cursor: "pointer" }}>All</button>
                      <button onClick={() => clearAllForState(s)} style={{ fontSize: 11, color: C.textDim, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 8px", cursor: "pointer" }}>Clear</button>
                      <span style={{ fontSize: 11, color: C.muted }}>{selCount}/{products.length}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {products.map(p => {
                      const on = isLinked(p, s);
                      return (
                        <div key={p} onClick={() => toggle(p, s)} style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                          borderRadius: 8, border: `1.5px solid ${on ? C.accent : C.border}`,
                          background: on ? C.accentBg : C.surface, cursor: "pointer",
                        }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: 3,
                            border: `2px solid ${on ? C.accent : C.border}`,
                            background: on ? C.accent : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            {on && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 500, color: on ? C.accent : C.text }}>{p}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button onClick={onSkip} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>Skip to GWBR selector →</button>
          <span style={{ fontSize: 12, color: C.muted }}>{totalLinks} mapping{totalLinks !== 1 ? "s" : ""}</span>
        </div>
        <PrimaryBtn onClick={onConfirm} disabled={totalLinks === 0}>Confirm Mapping →</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Step: Compiling ──────────────────────────────────────────────────────────

function CompilingScreen() {
  return (
    <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 26, display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>Compiling Gateway Business Rules</div>
        <div style={{ fontSize: 13, color: C.muted }}>Matching state/product combinations to applicable rules…</div>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
        {[180, 240, 200, 260, 210].map((w, i) => (
          <div key={i} style={{ height: 44, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 10 }}>
            <div style={{ width: 32, height: 14, borderRadius: 4, background: C.border }} />
            <div style={{ height: 13, borderRadius: 4, background: C.borderLight, width: w }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Step: GWBR list ──────────────────────────────────────────────────────────

function GWBRList({
  selectedIds, onChangeSelected, onConfirm, onReset,
}: {
  selectedIds: number[];
  onChangeSelected: (ids: number[]) => void;
  onConfirm: () => void;
  onReset: () => void;
}) {
  const [tab, setTab]           = useState<"selected" | "unselected" | "all">("selected");
  const [search, setSearch]     = useState("");
  const [confirming, setConfirming] = useState(false);
  const q      = search.toLowerCase();
  const selSet = new Set(selectedIds);
  const match  = (g: GwbrEntry) =>
    `${g.state} ${g.licName} ${g.licCode} ${g.loaName} ${g.loaCode}`.toLowerCase().includes(q);

  const visible = GWBR_POOL.filter(g => {
    if (tab === "selected")   return selSet.has(g.id) && match(g);
    if (tab === "unselected") return !selSet.has(g.id) && match(g);
    return match(g);
  });

  const add    = (id: number) => onChangeSelected([...selectedIds, id]);
  const remove = (id: number) => onChangeSelected(selectedIds.filter(x => x !== id));
  const selCount   = selectedIds.length;
  const unselCount = GWBR_POOL.length - selCount;

  if (confirming) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "40px 24px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>↺</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Start over from scratch?</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 340 }}>
              This will clear your state and product selections, your product–state mappings, and all {selCount} selected Gateway Business Rules. You'll restart from Step 1.
            </div>
          </div>
          <div style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.8 }}>
              <div>✗ &nbsp;State &amp; product selections cleared</div>
              <div>✗ &nbsp;Product–state mappings cleared</div>
              <div>✗ &nbsp;{selCount} selected business rules cleared</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => setConfirming(false)} style={{ fontSize: 13, fontWeight: 500, color: C.textMed, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>
            Keep my rules
          </button>
          <button onClick={onReset} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: C.danger, border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer" }}>
            Yes, start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "14px 24px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules…"
            style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", fontSize: 13, color: C.text, outline: "none" }} />
          <button onClick={() => setConfirming(true)} style={{ fontSize: 12, fontWeight: 500, color: C.danger, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "7px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>Start Over</button>
        </div>
        <SegToggle
          options={[["selected",`Selected (${selCount})`],["unselected",`Unselected (${unselCount})`],["all",`All (${GWBR_POOL.length})`]]}
          value={tab} onChange={v => { setTab(v as typeof tab); setSearch(""); }}
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px" }}>
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: C.muted }}>
            {search ? "No rules match your search." : tab === "unselected" ? "All rules are selected." : "No rules in this view."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {visible.map(g => {
              const isSel      = selSet.has(g.id);
              const showRemove = isSel  && (tab === "selected"   || tab === "all");
              const showAdd    = !isSel && (tab === "unselected" || tab === "all");
              return (
                <div key={g.id} style={{ display: "flex", alignItems: "center", padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 13, color: C.text, fontVariantNumeric: "tabular-nums" }}>
                    <span style={{ fontWeight: 700, color: C.accent }}>{g.state}</span>
                    <span style={{ color: C.muted, margin: "0 6px" }}>—</span>
                    <span>{g.licName}</span>
                    <span style={{ color: C.muted }}> ({g.licCode})</span>
                    <span style={{ color: C.muted, margin: "0 6px" }}>—</span>
                    <span>{g.loaName}</span>
                    <span style={{ color: C.muted }}> ({g.loaCode})</span>
                  </span>
                  {showRemove && (
                    <button onClick={() => remove(g.id)} style={{ marginLeft: 12, fontSize: 11, fontWeight: 500, color: C.danger, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5, padding: "3px 9px", cursor: "pointer", flexShrink: 0 }}>Remove</button>
                  )}
                  {showAdd && (
                    <button onClick={() => add(g.id)} style={{ marginLeft: 12, fontSize: 11, fontWeight: 500, color: C.success, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 5, padding: "3px 9px", cursor: "pointer", flexShrink: 0 }}>+ Add</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: C.muted }}>{selCount} rule{selCount !== 1 ? "s" : ""} selected</span>
        <PrimaryBtn onClick={onConfirm} disabled={selCount === 0}>Confirm Rules</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── PolicySetDrawer (main export) ───────────────────────────────────────────
//
// Usage in PolicySets.tsx:
//
//   import { PolicySetDrawer } from "./PolicySetDrawer";
//
//   // Replace showModal + PolicySetModal with:
//   const [showDrawer, setShowDrawer] = useState(false);
//
//   // In JSX, replace <PolicySetModal …/> with:
//   {isPlus && (
//     <PolicySetDrawer
//       open={showDrawer}
//       onClose={() => setShowDrawer(false)}
//       isPlus={isPlus}
//       onSave={({ name, gwbrIds, states, products }) => {
//         handleSavePS({ name, gwbrIds, states, products });
//         setShowDrawer(false);
//       }}
//     />
//   )}
//
//   // Change the "+ New Policy Set" button to open the right UI:
//   onClick={() => isPlus ? setShowDrawer(true) : setShowModal(true)}

export function PolicySetDrawer({ open, onClose, isPlus, onSave }: PolicySetDrawerProps) {
  const [view, setView]               = useState("main");
  const [psName, setPsName]           = useState("");
  const [states, setStates]           = useState<string[]>([]);
  const [products, setProducts]       = useState<string[]>([]);
  const [mapping, setMapping]         = useState<Record<string, string[]>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [regDone, setRegDone]         = useState(false);

  const resetReg = () => {
    setStates([]); setProducts([]); setMapping({});
    setSelectedIds([]); setRegDone(false); setView("states");
  };

  const skipToGWBR = () => {
    setSelectedIds(GWBR_POOL.map(g => g.id));
    setView("gwbr");
  };

  const startCompile = () => {
    setView("compiling");
    const pool = GWBR_POOL.filter(g => states.includes(g.state));
    setTimeout(() => {
      setSelectedIds(pool.map(g => g.id));
      setView("gwbr");
    }, 2000);
  };

  const handleSave = () => {
    onSave({ name: psName, gwbrIds: selectedIds, states, products });
    // reset internal state for next open
    setView("main"); setPsName(""); setStates([]); setProducts([]);
    setMapping({}); setSelectedIds([]); setRegDone(false);
  };

  const hp = (() => {
    if (view === "main")      return { title: psName || "New Policy Set", subtitle: "Define requirements for this policy set", onBack: null };
    if (view === "states")    return { title: "Regulatory Requirements",  subtitle: "Step 1 of 4 — Select states",            onBack: () => setView("main") };
    if (view === "products")  return { title: "Regulatory Requirements",  subtitle: "Step 2 of 4 — Select products",          onBack: () => setView("states") };
    if (view === "confirm")   return { title: "Regulatory Requirements",  subtitle: "Step 3 of 4 — Confirm selections",       onBack: () => setView("products") };
    if (view === "scope")     return { title: "Regulatory Requirements",  subtitle: "Step 4 of 4 — Define scope",             onBack: () => setView("confirm") };
    if (view === "mapping")   return { title: "Product ↔ State Mapping",  subtitle: undefined,                                onBack: () => setView("scope") };
    if (view === "compiling") return { title: "Compiling Rules…",         subtitle: undefined,                                onBack: null };
    if (view === "gwbr")      return { title: "Gateway Business Rules",   subtitle: `${GWBR_POOL.length} rules in system`,    onBack: () => setView("main") };
    return { title: "", subtitle: undefined, onBack: null };
  })();

  return (
    <Drawer open={open} onClose={onClose} title={hp.title} subtitle={hp.subtitle} onBack={hp.onBack ?? undefined}>

      {view === "main" && (
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Name */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.textMed, marginBottom: 6 }}>
              Policy set name <span style={{ color: C.danger }}>*</span>
            </div>
            <input
              value={psName} onChange={e => setPsName(e.target.value)}
              placeholder="e.g. Licensed P&C Producer"
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Regulatory Requirements */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMed, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Regulatory Requirements</div>
            {isPlus ? (
              <div
                onClick={() => setView(regDone ? "gwbr" : "states")}
                style={{ background: C.surface, border: `1.5px solid ${regDone ? C.accent : C.border}`, borderRadius: 12, padding: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: regDone ? C.accentBg : C.bg, border: `1px solid ${regDone ? C.accentLight + "44" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {regDone ? "✓" : "⚖"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: regDone ? C.accent : C.text }}>
                    {regDone ? `${selectedIds.length} Gateway Business Rules` : "Add regulatory requirements"}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    {regDone
                      ? states.length > 0 ? `${states.length} states · ${products.length} products` : "Manually curated"
                      : "States, products, and licensing rules"}
                  </div>
                </div>
                <span style={{ color: C.muted, fontSize: 13 }}>›</span>
              </div>
            ) : (
              <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18, opacity: 0.55, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textDim }}>Add regulatory requirements</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>States, products, and licensing rules</div>
                </div>
                <span style={{ fontSize: 11, color: C.accent, background: C.accentBg, border: `1px solid ${C.accentLight}44`, borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }}>Post-MVP</span>
              </div>
            )}
          </div>

          {/* Organizational Requirements */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMed, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Organizational Requirements</div>
            <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 18, opacity: 0.55, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⊞</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.textDim }}>Add organizational requirements</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Internal onboarding tasks and processes</div>
              </div>
              <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px" }}>Coming soon</span>
            </div>
          </div>

          {/* Save — only shown once regulatory setup is done and name is filled */}
          {regDone && psName.trim() && (
            <PrimaryBtn onClick={handleSave} style={{ width: "100%" }}>Save Policy Set</PrimaryBtn>
          )}
        </div>
      )}

      {view === "states"    && <StateSelector   selected={states}   onChange={setStates}   onNext={() => setView("products")} onSkip={skipToGWBR} />}
      {view === "products"  && <ProductSelector  selected={products} onChange={setProducts} onNext={() => setView("confirm")}  onSkip={skipToGWBR} />}
      {view === "confirm"   && <ConfirmSelections states={states} products={products}       onNext={() => setView("scope")}    onSkip={skipToGWBR} />}
      {view === "scope"     && <ScopeQuestion     onAllStates={startCompile} onSpecific={() => setView("mapping")}             onSkip={skipToGWBR} />}
      {view === "mapping"   && <ProductStateMapper states={states} products={products} mapping={mapping} onChange={setMapping} onConfirm={startCompile} onSkip={skipToGWBR} />}
      {view === "compiling" && <CompilingScreen />}
      {view === "gwbr"      && (
        <GWBRList
          selectedIds={selectedIds}
          onChangeSelected={setSelectedIds}
          onConfirm={() => { setRegDone(true); setView("main"); }}
          onReset={resetReg}
        />
      )}
    </Drawer>
  );
}