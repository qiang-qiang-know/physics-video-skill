import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { C, FONT } from "./theme";
import { TIMELINE, Seg } from "./lib";
import { Header } from "./components/Header";
import { Subtitle, ProgressBar } from "./components/Subtitle";
import { SCENES } from "./scenes";

const Scene: React.FC<{ seg: Seg }> = ({ seg }) => {
  const Cmp = SCENES[seg.id];
  return Cmp ? <Cmp seg={seg} /> : null;
};

const SceneFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(1200px 700px at 82% 6%, #FFFFFF 0%, ${C.bg} 55%, ${C.bg2} 100%)`,
    }}
  >
    <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.5 }}>
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#DCE5F0" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" opacity={0.55} />
    </svg>
  </AbsoluteFill>
);

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT }}>
      <Backdrop />
      {TIMELINE.segments.map((seg, i) => (
        <Sequence
          key={seg.id}
          name={seg.chapter}
          from={seg.startFrame}
          durationInFrames={
            (TIMELINE.segments[i + 1]?.startFrame ?? TIMELINE.totalFrames) - seg.startFrame
          }
        >
          <SceneFade>
            <Scene seg={seg} />
          </SceneFade>
        </Sequence>
      ))}
      <Header />
      <Subtitle />
      <ProgressBar />
      {TIMELINE.segments.flatMap((seg) =>
        seg.lines.map((ln, i) => (
          <Sequence
            key={`${seg.id}-${i}`}
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
