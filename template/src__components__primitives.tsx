import React from "react";
import { C, FONT } from "../theme";

/** SVG 基元库：用它们拼每道题的场景，不要从零画。 */

/** 通用箭头（相对坐标） */
export const Arrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  w?: number;
  dashed?: boolean;
  label?: string;
  labelDx?: number;
  labelDy?: number;
  fontSize?: number;
  opacity?: number;
}> = ({ x1, y1, x2, y2, color, w = 6, dashed, label, labelDx = 0, labelDy = -14, fontSize = 21, opacity = 1 }) => {
  const dx = Math.sign(x2 - x1);
  const dy = Math.sign(y2 - y1);
  const isH = dy === 0 && dx !== 0;
  return (
    <g opacity={opacity}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={dashed ? "10 8" : undefined}
      />
      <polygon
        points={`${x2},${y2} ${x2 - dx * 13 - dy * 11},${y2 - dy * 13 - dx * 11} ${
          x2 - dx * 13 + dy * 11
        },${y2 - dy * 13 + dx * 11}`}
        fill={color}
      />
      {label && (
        <text
          x={isH ? (x1 + x2) / 2 + labelDx : x2 + labelDx}
          y={isH ? y1 + labelDy : (y1 + y2) / 2 + 8 + labelDy}
          fill={color}
          fontSize={fontSize}
          fontWeight={800}
          fontFamily={FONT}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
};

/** 物块（矩形，带标签） */
export const Block: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  fill?: string;
  fontSize?: number;
}> = ({ x, y, w, h, label, fill = "#F7F9FC", fontSize = 22 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={8} fill={fill} stroke={C.ink} strokeWidth={4} />
    {label && (
      <text
        x={x + w / 2}
        y={y + h / 2 + fontSize * 0.36}
        fill={C.ink}
        fontSize={fontSize}
        fontWeight={800}
        fontFamily={FONT}
        textAnchor="middle"
      >
        {label}
      </text>
    )}
  </g>
);

/** 地面（横线 + 斜纹阴影线） */
export const Ground: React.FC<{
  x1: number;
  x2: number;
  y: number;
  tick?: number;
  label?: string;
  labelColor?: string;
}> = ({ x1, x2, y, tick = 16, label, labelColor = C.ink2 }) => (
  <g>
    <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: Math.floor((x2 - x1) / tick) }, (_, i) => {
      const x = x1 + i * tick;
      return <line key={i} x1={x} y1={y} x2={x - tick * 0.6} y2={y + tick * 0.6} stroke={C.ink3} strokeWidth={2} />;
    })}
    {label && (
      <text x={x2 - 8} y={y + 34} fill={labelColor} fontSize={20} fontWeight={700} fontFamily={FONT} textAnchor="end">
        {label}
      </text>
    )}
  </g>
);

/** 固定墙面（竖线 + 斜纹） */
export const Wall: React.FC<{ x: number; y1: number; y2: number; tick?: number }> = ({ x, y1, y2, tick = 14 }) => (
  <g>
    <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: Math.floor((y2 - y1) / tick) }, (_, i) => {
      const y = y1 + i * tick;
      return <line key={i} x1={x} y1={y} x2={x - tick * 0.6} y2={y + tick * 0.6} stroke={C.ink3} strokeWidth={2} />;
    })}
  </g>
);

/** 弹簧（折线，两端点由参数给定） */
export const Spring: React.FC<{
  x1: number;
  y: number;
  x2: number;
  coils?: number;
  amp?: number;
  color?: string;
}> = ({ x1, y, x2, coils = 10, amp = 14, color = C.ink }) => {
  const n = Math.max(4, coils);
  const seg = (x2 - x1 - 24) / n;
  const dir = Math.sign(x2 - x1);
  const pts: string[] = [`${x1},${y}`, `${x1 + 12 * dir},${y}`];
  for (let i = 0; i < n; i++) {
    pts.push(`${x1 + 12 * dir + seg * (i + 0.5)},${y + (i % 2 === 0 ? -amp : amp)}`);
  }
  pts.push(`${x2 - 12 * dir},${y}`, `${x2},${y}`);
  return <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" />;
};

/** 斜面（直角三角形，倾角 theta 弧度，顶点在左上） */
export const Incline: React.FC<{
  x: number; // 左上顶点 x
  y: number; // 左上顶点 y
  base: number; // 底边长 px
  theta: number; // 弧度
  fill?: string;
  angleLabel?: string; // 如 "37°"
}> = ({ x, y, base, theta, fill = "#EDF2F9", angleLabel }) => {
  const h = base * Math.tan(theta);
  return (
    <g>
      <polygon points={`${x},${y} ${x},${y + h} ${x + base},${y + h}`} fill={fill} stroke={C.ink} strokeWidth={3} />
      {angleLabel && (
        <text
          x={x + 62}
          y={y + h - 12}
          fill={C.ink2}
          fontSize={20}
          fontWeight={800}
          fontFamily={FONT}
          textAnchor="middle"
        >
          {angleLabel}
        </text>
      )}
    </g>
  );
};

/** 角度弧线标记（以 cx,cy 为顶点、水平向左为始边、向上张角 theta） */
export const AngleArc: React.FC<{
  cx: number;
  cy: number;
  r: number;
  theta: number;
  label?: string;
}> = ({ cx, cy, r, theta, label }) => {
  const x2 = cx - r * Math.cos(theta);
  const y2 = cy - r * Math.sin(theta);
  return (
    <g>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        fill="none"
        stroke={C.ink3}
        strokeWidth={2.5}
      />
      {label && (
        <text
          x={cx - r * 1.35}
          y={cy - r * 0.35}
          fill={C.ink2}
          fontSize={18}
          fontWeight={700}
          fontFamily={FONT}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
};

/** 实时读数块（数据面板单元） */
export const Readout: React.FC<{
  label: string;
  value: string;
  color?: string;
  width?: number;
}> = ({ label, value, color = C.ink, width = 200 }) => (
  <div
    style={{
      width,
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 16,
      padding: "12px 18px",
      fontFamily: FONT,
    }}
  >
    <div style={{ fontSize: 19, fontWeight: 700, color: C.ink3 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 900, color, marginTop: 4 }}>{value}</div>
  </div>
);
