import React from "react";
import { C, FONT } from "../theme";

export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  accent?: string;
  children?: React.ReactNode;
  pad?: number;
  style?: React.CSSProperties;
  opacity?: number;
  titleSize?: number;
}> = ({ x, y, w, h, title, accent = C.blue, children, pad = 22, style, opacity = 1, titleSize = 23 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 22,
      boxShadow: "0 12px 34px rgba(22,32,44,0.07)",
      padding: pad,
      boxSizing: "border-box",
      fontFamily: FONT,
      opacity,
      overflow: "hidden",
      ...style,
    }}
  >
    {title && (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 5, height: 22, borderRadius: 3, background: accent }} />
        <div style={{ fontSize: titleSize, fontWeight: 800, color: accent }}>{title}</div>
      </div>
    )}
    {children}
  </div>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  bg?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, color = C.blue, bg = C.blueSoft, size = 24, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      background: bg,
      color,
      fontWeight: 800,
      fontSize: size,
      padding: "8px 18px",
      borderRadius: 12,
      fontFamily: FONT,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Verdict: React.FC<{ ok: boolean; text?: string }> = ({ ok, text }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      background: ok ? C.greenSoft : C.redSoft,
      color: ok ? C.green : C.red,
      fontWeight: 900,
      fontSize: 30,
      padding: "8px 22px",
      borderRadius: 14,
      fontFamily: FONT,
    }}
  >
    <span style={{ fontSize: 34 }}>{ok ? "✓" : "✗"}</span>
    {text ?? (ok ? "正确" : "错误")}
  </div>
);

/** 深色结论条：每段的收尾记忆点 */
export const ConclusionBar: React.FC<{
  children: React.ReactNode;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  opacity?: number;
}> = ({ children, x = 110, y = 840, w = 1700, h = 130, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: C.dark,
      borderRadius: 24,
      display: "flex",
      alignItems: "center",
      padding: "0 46px",
      boxSizing: "border-box",
      fontFamily: FONT,
      color: "#fff",
      fontSize: 30,
      fontWeight: 800,
      lineHeight: 1.45,
      opacity,
    }}
  >
    {children}
  </div>
);
