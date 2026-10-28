import React from "react";
import { C, FONT } from "../theme";

export type Force = {
  label: string;
  value?: string;
  dir: "right" | "left" | "up" | "down";
  color: string;
  appear?: number; // 0..1
  len?: number;
  dashed?: boolean;
};

type Props = {
  title: string;
  sub?: string;
  forces: Force[];
  note?: string;
  noteColor?: string;
  width?: number;
  accent?: string;
  body?: React.ReactNode;
  svgH?: number;
  shape?: "rect" | "circle";
};

/** 受力分析图：中心物体 + 四方向力箭头 */
export const FBD: React.FC<Props> = ({
  title,
  sub,
  forces,
  note,
  noteColor = C.ink2,
  width = 430,
  accent = C.ink,
  body,
  svgH = 220,
  shape = "rect",
}) => {
  const cx = 210;
  const cy = 148;
  const half = 46;

  return (
    <div
      style={{
        width,
        background: C.card,
        borderRadius: 20,
        boxShadow: "0 10px 30px rgba(22,32,44,0.08)",
        border: `1px solid ${C.line}`,
        padding: "16px 18px 10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontSize: 27, fontWeight: 800, color: accent }}>{title}</div>
        {sub && <div style={{ fontSize: 19, color: C.ink3, fontWeight: 600 }}>{sub}</div>}
      </div>
      <svg viewBox="0 0 420 300" style={{ width: "100%", height: svgH, marginTop: 2 }}>
        {shape === "circle" ? (
          <circle cx={cx} cy={cy} r={half + 6} fill="#F7F9FC" stroke={C.ink} strokeWidth={4} />
        ) : (
          <rect
            x={cx - half}
            y={cy - half}
            width={half * 2}
            height={half * 2}
            rx={10}
            fill="#F7F9FC"
            stroke={C.ink}
            strokeWidth={4}
          />
        )}
        {forces.map((f, i) => {
          const p = f.appear ?? 1;
          if (p <= 0) return null;
          const L = (f.len ?? 86) * Math.min(1, p);
          const color = f.color;
          let x1 = cx,
            y1 = cy,
            x2 = cx,
            y2 = cy;
          if (f.dir === "right") {
            x1 = cx + half;
            x2 = x1 + L;
          }
          if (f.dir === "left") {
            x1 = cx - half;
            x2 = x1 - L;
          }
          if (f.dir === "up") {
            y1 = cy - half;
            y2 = y1 - L;
          }
          if (f.dir === "down") {
            y1 = cy + half;
            y2 = y1 + L;
          }
          const isH = f.dir === "left" || f.dir === "right";
          const dx = isH ? Math.sign(x2 - x1) : 0;
          const dy = isH ? 0 : Math.sign(y2 - y1);
          return (
            <g key={i} opacity={p}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={f.dashed ? "10 8" : undefined}
              />
              <polygon
                points={`${x2},${y2} ${x2 - dx * 13 - dy * 11},${y2 - dy * 13 - dx * 11} ${
                  x2 - dx * 13 + dy * 11
                },${y2 - dy * 13 + dx * 11}`}
                fill={color}
              />
              <text
                x={isH ? (x1 + x2) / 2 : x2 + (dx === 0 ? 6 : 0) + 12}
                y={isH ? y1 - 14 : (y1 + y2) / 2 + 8}
                fill={color}
                fontSize={21}
                fontWeight={800}
                fontFamily={FONT}
                textAnchor={isH ? "middle" : "start"}
              >
                {f.label}
                {f.value ? ` = ${f.value}` : ""}
              </text>
            </g>
          );
        })}
        {body}
      </svg>
      {note && (
        <div
          style={{
            fontSize: 21,
            fontWeight: 700,
            color: noteColor,
            paddingBottom: 6,
            lineHeight: 1.35,
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
};
