import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { Seg, lineAt, enter } from "../lib";
import { Card, Chip } from "../components/ui";
import { QUESTION } from "../question";

/**
 * 题目呈现段（半通用）：题干逐句浮现 + 关键词高亮 + 选项滑入。
 * 预留 <QuestionFigure /> 插槽：把本题的初始状态示意图放进 figures/QFigure.tsx。
 */
import { QFigure } from "./figures/QFigure";

export const S1Question: React.FC<{ seg: Seg }> = ({ seg }) => {
  const f = useCurrentFrame();
  const at = QUESTION.stemAt;
  const last = lineAt(seg, Math.max(0, QUESTION.options.length - 1)) + 8;

  return (
    <>
      <Card x={110} y={104} w={1700} h={318} pad={30}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <Chip color={C.ink} bg="#E7ECF4" size={24}>
            {QUESTION.tag}
          </Chip>
          <div style={{ fontSize: 21, color: C.ink3, fontWeight: 600 }}>{QUESTION.subtitle}</div>
        </div>
        <div style={{ fontSize: 37, lineHeight: 1.78, color: C.ink, fontWeight: 600 }}>
          {QUESTION.stem.map((p, i) => {
            const o = enter(f, lineAt(seg, at[i] ?? 0), 10);
            return (
              <span
                key={i}
                style={{
                  opacity: (at[i] ?? 0) === 0 ? 1 : Math.max(0.18, o),
                  color: p.hi && o > 0.6 ? C.blue : C.ink,
                  borderBottom: p.hi && o > 0.6 ? `3px solid ${C.blueSoft}` : "none",
                  fontWeight: p.hi ? 800 : 600,
                }}
              >
                {p.s}
              </span>
            );
          })}
        </div>
      </Card>

      <Card x={110} y={452} w={730} h={392} pad={12}>
        <QFigure />
      </Card>

      <div style={{ position: "absolute", left: 880, top: 446, width: 930 }}>
        {QUESTION.options.map((o, i) => {
          const p = enter(f, lineAt(seg, Math.min(QUESTION.stemAt.length - 1, 3)) + i * 7, 12);
          void last;
          return (
            <div
              key={o.k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: C.card,
                border: `1px solid ${C.line}`,
                borderRadius: 16,
                padding: "16px 22px",
                marginBottom: 12,
                height: 74,
                boxSizing: "border-box",
                boxShadow: "0 8px 22px rgba(22,32,44,0.05)",
                opacity: p,
                transform: `translateX(${(1 - p) * 26}px)`,
                fontFamily: FONT,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  background: "#E7ECF4",
                  color: C.ink,
                  fontWeight: 900,
                  fontSize: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                {o.k}
              </div>
              <div style={{ fontSize: 27, fontWeight: 700, color: C.ink, lineHeight: 1.35 }}>
                {o.t}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
