import tl from "./timeline.json";
import motion from "./data/motion.json";
import { interpolate, Easing } from "remotion";

export type Line = {
  text: string;
  file: string;
  dur: number;
  start: number;
  startFrame: number;
  frames: number;
  audioFrames: number;
  words: { t: number; d: number; w: string }[];
};
export type Seg = {
  id: string;
  chapter: string;
  start: number;
  end: number;
  startFrame: number;
  frames: number;
  lines: Line[];
};

export const TIMELINE = tl as unknown as {
  fps: number;
  totalFrames: number;
  totalSeconds: number;
  segments: Seg[];
};

/** 仿真数据（scripts/sim 生成）。samples 字段名由每题的仿真决定。 */
export type Sample = { t: number } & Record<string, number>;
export const MOTION = motion as unknown as {
  params: Record<string, number>;
  events: Record<string, number | number[] | [number, string][] | null>;
  samples: Sample[];
};

/** 段内第 i 句的起始帧（相对段起点） */
export const lineAt = (seg: Seg, i: number) =>
  seg.lines[Math.max(0, Math.min(seg.lines.length - 1, i))].startFrame - seg.startFrame;

/** 段内第 i 句结束帧（相对段起点） */
export const lineEnd = (seg: Seg, i: number) => {
  const l = seg.lines[Math.max(0, Math.min(seg.lines.length - 1, i))];
  return l.startFrame + l.frames - seg.startFrame;
};

/** 段内进度：在第 i 句内为 0..1 */
export const lineProgress = (seg: Seg, frame: number, i: number) => {
  const a = lineAt(seg, i);
  const b = lineEnd(seg, i);
  return interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
};

/** 关键帧式插值：frames/values 等长 */
export const key = (frame: number, frames: number[], values: number[]) =>
  interpolate(frame, frames, values, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const easeScale = (p: number, from = 0.94, to = 1) =>
  interpolate(p, [0, 1], [from, to], { extrapolateRight: "clamp" });

/** 入场动画：0..1 */
export const enter = (frame: number, start: number, dur = 14) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/** 按时间取仿真采样点（二分查找，samples 必须按 t 递增） */
export const sampleAt = (t: number): Sample => {
  const s = MOTION.samples;
  if (t <= s[0].t) return s[0];
  if (t >= s[s.length - 1].t) return s[s.length - 1];
  let lo = 0,
    hi = s.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid].t <= t) lo = mid;
    else hi = mid;
  }
  return t - s[lo].t <= s[hi].t - t ? s[lo] : s[hi];
};

/** 事件时间取值辅助：events.x 为 number | number[] | null */
export const ev = (name: string): number[] => {
  const v = MOTION.events[name];
  if (v == null) return [];
  return Array.isArray(v) ? (v as number[]) : [v as number];
};
