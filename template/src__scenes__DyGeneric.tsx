import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { Seg } from "../lib";

/**
 * 竖屏原生兜底场景（DyGeneric）
 *
 * 为什么不用「横版缩放」：1920 宽的排版缩到 1080 只有 0.56 倍，
 * 42px 正文变 23px，在手机上一片糊——这是竖版最大的质量坑。
 *
 * 做法：把本段旁白逐条做成大字要点卡，当前句高亮、已讲过的降为浅色，
 * 全部按 1080×1920 重新排版（字号 36~46，右侧留 110px 点赞栏安全区）。
 *
 * 用法：在 src/scenes/index.tsx 的 SCENES_DY 里挂到任意段落即可；
 * 有图/动画的段落建议写专用竖屏组件（参考 DyGeneric 的骨架）。
 */
export const DyGeneric: React.FC<{ seg: Seg }> = ({ seg }) => {
  const f = useCurrentFrame();
  const local = f - seg.startFrame;
  const lines = seg.lines;
  const n = Math.max(1, lines.length);

  const AREA_TOP = 336;
  const AREA_H = 1040;
  const gap = n > 5 ? 12 : n > 3 ? 16 : 22;
  const cardH = Math.min(168, (AREA_H - gap * (n - 1)) / n);
  const fs = cardH >= 150 ? 44 : cardH >= 120 ? 40 : 34;

  const active = lines.findIndex((l, i) => {
    const s = l.startFrame - seg.startFrame;
    const e = i + 1 < n ? lines[i + 1].startFrame - seg.startFrame : seg.frames;
    return local >= s && local < e;
  });

  return (
    <div
      style={{
        position: "absolute",
        top: AREA_TOP,
        left: 70,
        width: 900,
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        gap,
      }}
    >
      {lines.map((l, i) => {
        const s = l.startFrame - seg.startFrame;
        if (local < s - 2 && i > 0) return null;
        const isNow = i === active;
        const isPast = active >= 0 && i < active;
        return (
          <div
            key={i}
            style={{
              height: cardH,
              boxSizing: "border-box",
              background: isNow ? C.card : "rgba(255,255,255,0.55)",
              border: `2px solid ${isNow ? C.blue : C.line}`,
              borderLeft: `10px solid ${isNow ? C.blue : isPast ? C.ink3 : C.line}`,
              borderRadius: 20,
              padding: `18px ${fs * 0.6}px`,
              display: "flex",
              alignItems: "center",
              boxShadow: isNow ? "0 14px 34px rgba(31,111,235,0.14)" : "none",
              opacity: isNow ? 1 : isPast ? 0.78 : 0.95,
            }}
          >
            <div
              style={{
                fontSize: fs,
                fontWeight: 900,
                lineHeight: 1.34,
                color: isNow ? C.ink : C.ink2,
                letterSpacing: 0.5,
              }}
            >
              {l.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
