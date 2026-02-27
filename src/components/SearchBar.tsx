import { C } from "../theme";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}

export function SearchBar({ placeholder, value, onChange, style }: SearchBarProps) {
  return (
    <div style={{ position: "relative", ...style }}>
      <span style={{
        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
        color: C.muted, fontSize: 14, pointerEvents: "none",
      }}>⌕</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "8px 12px 8px 30px",
          color: C.text, fontSize: 13, outline: "none",
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}