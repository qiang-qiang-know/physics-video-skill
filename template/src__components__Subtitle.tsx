import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";
import { TIMELINE, Line, Seg } from "../lib";

const charEnds = (text: string, words: Line["words"]) => {
  let idx = 0;
  const ends: number[] = [];
  for (const w of words) {
    const pos = text.indexOf(w.w, idx);
    if (pos >= 0) {
      idx = pos + w.w.length;
    } else {
      idx = Math.min(text.length, idx + w.w.length);
    }
    ends.push(idx);
  }
  return ends;
};

export const useActiveLine = (): { seg: Seg; line: Line; elapsed: number } | null => {
  const f = useCurrentFrame();
  const seg = TIMELINE.segments.find(
    (s) => f >= s.startFrame && f < s.startFrame + s.frames
  );
  if (!seg) return null;
  const li = seg.lines.findIndex((l) => f >= l.startFrame && f < l.startFrame + l.frames);
  const line = seg.lines[li];
  if (!line) return null;
  return { seg, line, elapsed: (f - line.startFrame) / FPS };
};

/** 卡拉OK式逐字高亮文本（音画同步由 timeline.json 的 word boundary 驱动） */
export const Karaoke: React.FC<{
  fontSize: number;
  maxWidth: number;
  weight?: number;
  pad?: number;
}> = ({ fontSize, maxWidth, weight = 700, pad = 18 }) => {
  const al = useActiveLine();
  if (!al) return null;
  const { line, elapsed } = al;
  const ends = charEnds(line.text, line.words);
  let cut = 0;
  for (let i = 0; i < line.words.length; i++) {
    if (line.words[i].t <= elapsed) cut = ends[i];
  }
  return (
    <div
      style={{
        maxWidth,
        padding: `${pad}px 40px`,
        background: "rgba(255,255,255,0.94)",
        border: `1px solid ${C.line}`,
        borderRadius: 20,
        boxShadow: "0 8px 26px rgba(22,32,44,0.07)",
        fontSize,
        lineHeight: 1.5,
        fontWeight: weight,
        color: C.ink,
        textAlign: "center",
        fontFamily: FONT,
      }}
    >
      <span>{line.text.slice(0, cut)}</span>
      <span style={{ color: "#9AA7B7" }}>{line.text.slice(cut)}</span>
    </div>
  );
};

/** 横版字幕（固定底部） */
export const Subtitle: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 46,
        display: "flex",
        justifyContent: "center",
        fontFamily: FONT,
      }}
    >
      <Karaoke fontSize={37} maxWidth={1580} />
    </div>
  );
};

export const ProgressBar: React.FC = () => {
  const f = useCurrentFrame();
  const p = Math.min(1, f / Math.max(1, TIMELINE.totalFrames - 1));
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 6, background: "#E1E8F1" }}>
      <div style={{ width: `${p * 100}%`, height: "100%", background: C.blue, opacity: 0.8 }} />
    </div>
  );
};
