import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { TIMELINE } from "../lib";
import { QUESTION, OPT_LETTERS } from "../question";

export const Header: React.FC = () => {
  const f = useCurrentFrame();
  const seg = TIMELINE.segments.find((s) => f >= s.startFrame && f < s.startFrame + s.frames);
  const optId = seg && OPT_LETTERS.includes(seg.id.toUpperCase()) ? seg.id.toUpperCase() : null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 92,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 60px",
        fontFamily: FONT,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 8, height: 38, borderRadius: 4, background: C.blue }} />
        <div style={{ fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: 1 }}>
          {seg?.chapter ?? ""}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {OPT_LETTERS.map((o) => {
          const active = optId === o;
          return (
            <div
              key={o}
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 800,
                color: active ? "#fff" : C.ink3,
                background: active ? C.ink : "#E4EAF2",
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
