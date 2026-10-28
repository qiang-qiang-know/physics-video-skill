import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { Seg, lineAt, enter } from "../lib";
import { Card, Verdict, ConclusionBar } from "../components/ui";
import { QUESTION } from "../question";

/**
 * 选项段兜底组件（通用）：选项原文 + 判定 + 逐句解析行。
 * 没有时间为本题定制画面时，用它保证每段可用。
 * 解析行来自 EXTRA.explain[optionKey]（scenes/index.tsx 中配置）。
 */
export type OptionExtra = {
  /** 每个选项的逐句解析（与旁白 lines 对齐） */
  explain: Record<string, string[]>;
};

export const GenericOption: React.FC<{ seg: Seg; extra: OptionExtra }> = ({ seg, extra }) => {
  const f = useCurrentFrame();
  const key = seg.id.toUpperCase();
  const opt = QUESTION.options.find((o) => o.k === key);
  const ok = key === QUESTION.answer;
  const lines = extra.explain[key] ?? [];

  return (
    <>
      <Card x={110} y={130} w={1700} h={210} pad={30}>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, marginBottom: 16 }}>
          选项 {key}：{opt?.t ?? ""}
        </div>
        <Verdict ok={ok} text={ok ? "正确" : "错误"} />
      </Card>

      <Card x={110} y={372} w={1700} h={420} pad={30} title="解析" accent={ok ? C.green : C.red}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 6 }}>
          {lines.map((t, i) => {
            const p = enter(f, lineAt(seg, i), 12);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 29,
                  fontWeight: 700,
                  color: C.ink,
                  opacity: p,
                  transform: `translateX(${(1 - p) * 20}px)`,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 5, background: ok ? C.green : C.red }} />
                {t}
              </div>
            );
          })}
        </div>
      </Card>

      <ConclusionBar y={830} h={120} opacity={enter(f, lineAt(seg, lines.length), 14)}>
        {ok ? "结论：" : "原因："}
        <span style={{ color: ok ? "#7BE3AE" : "#FFB067" }}>
          {lines[lines.length - 1] ?? (ok ? "该选项正确" : "该选项错误")}
        </span>
      </ConclusionBar>
    </>
  );
};
