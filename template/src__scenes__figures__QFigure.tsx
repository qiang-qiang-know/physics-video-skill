import React from "react";
import { Card } from "../../components/ui";
import { QUESTION } from "../../question";
import { C } from "../../theme";

/**
 * 题目段的初始状态示意图（每题定制）。
 * 用 components/primitives 拼装；这里默认是斜面+滑块示例。
 */
export const QFigure: React.FC = () => (
  <div style={{ width: "100%", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg viewBox="0 0 660 280" style={{ width: "100%", height: "100%" }}>
      <polygon points="60,40 60,230 500,230" fill="#EDF2F9" stroke={C.ink} strokeWidth={3} />
      <line x1={40} y1={230} x2={560} y2={230} stroke={C.ink} strokeWidth={4} />
      {/* 斜面上的滑块 */}
      <g transform="rotate(-37 230 145)">
        <rect x={200} y={124} width={70} height={42} rx={8} fill="#F7F9FC" stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 初速度箭头 */}
      <line x1={250} y1={120} x2={330} y2={70} stroke={C.green} strokeWidth={6} strokeLinecap="round" />
      <polygon points="334,67 312,72 322,86" fill={C.green} />
      <text x={318} y={104} fill={C.green} fontSize={22} fontWeight={800} fontFamily="Microsoft YaHei">
        v₀ = 6 m/s
      </text>
      <text x={112} y={214} fill={C.ink2} fontSize={20} fontWeight={800} fontFamily="Microsoft YaHei">
        37°
      </text>
      <text x={548} y={262} fill={C.ink2} fontSize={20} fontWeight={700} fontFamily="Microsoft YaHei" textAnchor="end">
        μ = 0.5（滑块与斜面间）
      </text>
    </svg>
  </div>
);

export const QFigureCard: React.FC = () => (
  <Card x={110} y={452} w={730} h={392} pad={12}>
    <QFigure />
  </Card>
);
