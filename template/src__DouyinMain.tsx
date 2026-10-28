/**
 * 竖版（抖音 1080×1920）主组件。
 *
 * 排版策略：**竖屏原生优先**（rules/visual.md）。
 *   1) SCENES_DY[seg.id] 有专用竖屏组件 → 用它（最佳）
 *   2) 否则用 DyGeneric：把本段旁白逐条排成大字号要点卡（清晰，够用）
 *   3) 已废弃「横版缩放」：1920→1080 只有 0.56 倍，正文会糊成一片
 */
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, FONT } from "./theme";
import { TIMELINE, Seg } from "./lib";
import { Backdrop } from "./Main";
import { SCENES_DY, KEY_POINTS } from "./scenes";
import { DyGeneric } from "./scenes/DyGeneric";
import { Karaoke } from "./components/Subtitle";
import { QUESTION, OPT_LETTERS } from "./question";

const DyScene: React.FC<{ seg: Seg }> = ({ seg }) => {
  const Dy = SCENES_DY[seg.id];
  if (Dy) return <Dy seg={seg} />;
  return <DyGeneric seg={seg} />;
};

/** 顶部章节条 + 选项进度圆点 */
const DyHeader: React.FC = () => {
  const f = useCurrentFrame();
  const seg = TIMELINE.segments.find((s) => f >= s.startFrame && f < s.startFrame + s.frames);
  return (
    <div style={{ position: "absolute", top: 56, left: 60, right: 130 }}>
      <div style={{ fontSize: 44, fontWeight: 900, color: C.ink, letterSpacing: 1 }}>
        {seg?.chapter ?? ""}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
        {OPT_LETTERS.map((o) => {
          const active = seg?.id === o.toLowerCase();
          return (
            <div
              key={o}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 900,
                color: active ? "#fff" : "#7C8CA0",
                background: active ? C.ink : "#DCE4EE",
              }}
            >
              {o}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** 「本节关键」要点条（KEY_POINTS 由 scenes/index.tsx 提供） */
const DyKeyBar: React.FC<{ segId?: string }> = ({ segId }) => {
  const text = segId ? KEY_POINTS[segId] : undefined;
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 262,
        left: 60,
        right: 130,
        background: C.blueSoft,
        border: `1.5px solid ${C.blue}33`,
        borderRadius: 18,
        padding: "20px 28px",
        fontSize: 34,
        fontWeight: 900,
        color: C.blue,
      }}
    >
      关键 · {text}
    </div>
  );
};

export const MainDouyin: React.FC = () => {
  const f = useCurrentFrame();
  const seg = TIMELINE.segments.find((s) => f >= s.startFrame && f < s.startFrame + s.frames);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT }}>
      <Backdrop />
      {TIMELINE.segments.map((s, i) => (
        <Sequence
          key={s.id}
          name={s.chapter}
          from={s.startFrame}
          durationInFrames={
            (TIMELINE.segments[i + 1]?.startFrame ?? TIMELINE.totalFrames) - s.startFrame
          }
        >
          <DyScene seg={s} />
        </Sequence>
      ))}

      <DyHeader />
      <DyKeyBar segId={seg?.id} />

      {/* 字幕（竖屏大号，中心带；右侧留点赞栏安全区） */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 110,
          top: 1468,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Karaoke fontSize={46} maxWidth={880} />
      </div>

      {/* 配音 */}
      {TIMELINE.segments.flatMap((s) =>
        s.lines.map((ln, i) => (
          <Sequence
            key={`${s.id}-${i}`}
            from={ln.startFrame}
            durationInFrames={ln.audioFrames + 2}
          >
            <Audio src={staticFile(ln.file)} />
          </Sequence>
        ))
      )}
    </AbsoluteFill>
  );
};

export { QUESTION };
