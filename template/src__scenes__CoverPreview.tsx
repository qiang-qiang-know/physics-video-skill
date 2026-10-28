import React from "react";
import { Card } from "../components/ui";
import { C } from "../theme";
import { QUESTION } from "../question";

/**
 * 封面的预览区（每题定制）：默认放一张"钩子图"。
 * 推荐放本题最有信息量的画面（v-t 图/受力图/关键数据）。
 */
export const CoverPreview: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const big = Math.min(height * 0.15, width * 0.062); // 保证不折行
  return (
    <div
      style={{
        width,
        height,
        background: C.card,
        border: `1px solid ${C.line}`,
        borderRadius: 26,
        boxShadow: "0 18px 44px rgba(22,32,44,0.10)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Microsoft YaHei",
        gap: 24,
        boxSizing: "border-box",
        padding: 30,
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: big, fontWeight: 900, color: C.ink, whiteSpace: "nowrap" }}>
        上滑 a₁ = <span style={{ color: C.red }}>10 m/s²</span>
      </div>
      <div style={{ fontSize: big, fontWeight: 900, color: C.ink, whiteSpace: "nowrap" }}>
        下滑 a₂ = <span style={{ color: C.green }}>2 m/s²</span>
      </div>
      <div style={{ fontSize: Math.round(big * 0.4), fontWeight: 700, color: C.ink3 }}>
        {QUESTION.subtitle}
      </div>
    </div>
  );
};
