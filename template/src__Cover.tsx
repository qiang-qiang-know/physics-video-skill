import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "./theme";
import { Backdrop } from "./Main";
import { CoverPreview } from "./scenes/CoverPreview";
import { QUESTION } from "./question";

/** 封面骨架：文案来自 question.ts（cover 字段），预览区来自 scenes/CoverPreview */

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      background: C.ink,
      color: "#fff",
      fontSize: 34,
      fontWeight: 800,
      padding: "10px 26px",
      borderRadius: 12,
      fontFamily: FONT,
      letterSpacing: 2,
    }}
  >
    {children}
  </div>
);

const Title: React.FC<{ size: number; lineGap?: number }> = ({ size, lineGap = 10 }) => (
  <div style={{ fontFamily: FONT, lineHeight: 1.18, fontWeight: 900, color: C.ink }}>
    {QUESTION.cover.hook.map((line, i) => (
      <div key={i} style={{ fontSize: size, marginTop: i > 0 ? lineGap : 0, whiteSpace: "nowrap" }}>
        {line.map((p, j) => (
          <span key={j} style={p.hi ? { color: C.red } : undefined}>
            {p.s}
          </span>
        ))}
      </div>
    ))}
  </div>
);

const Sub: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 900,
      color: "#fff",
      background: C.orange,
      display: "inline-block",
      padding: "12px 30px",
      borderRadius: 14,
    }}
  >
    {QUESTION.cover.sub}
  </div>
);

const Truth: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 900,
      color: C.green,
      background: C.greenSoft,
      border: `2px solid ${C.green}`,
      display: "inline-block",
      padding: "10px 28px",
      borderRadius: 14,
    }}
  >
    {QUESTION.cover.truth}
  </div>
);

/** 横版封面 1920x1080 */
export const CoverH: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT }}>
    <Backdrop />
    <div style={{ position: "absolute", left: 96, top: 150, width: 860 }}>
      <Chip>{QUESTION.cover.chip}</Chip>
      <div style={{ marginTop: 56 }}>
        <Title size={110} />
      </div>
      <div style={{ marginTop: 48 }}>
        <Sub size={46} />
      </div>
      <div style={{ marginTop: 34 }}>
        <Truth size={40} />
      </div>
    </div>
    <div style={{ position: "absolute", right: 70, top: 120, width: 860, height: 840 }}>
      <CoverPreview width={860} height={840} />
    </div>
  </AbsoluteFill>
);

/** 竖版封面 1080x1920 */
export const CoverV: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT }}>
    <Backdrop />
    <div style={{ position: "absolute", top: 150, left: 70 }}>
      <Chip>{QUESTION.cover.chip}</Chip>
    </div>
    <div style={{ position: "absolute", top: 300, left: 70, width: 940 }}>
      <Title size={104} lineGap={14} />
      <div style={{ marginTop: 48 }}>
        <Sub size={50} />
      </div>
      <div style={{ marginTop: 36 }}>
        <Truth size={42} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 44, top: 1020, width: 992, height: 400 }}>
      <CoverPreview width={992} height={400} />
    </div>
  </AbsoluteFill>
);
