import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { Seg, lineAt, enter } from "../lib";
import { Card } from "../components/ui";

/**
 * 任意段的兜底组件：章节标题 + 逐句旁白要点。
 * 建模段、计算分步段若来不及定制画面，可用它占位。
 */
export const GenericScene: React.FC<{ seg: Seg }> = ({ seg }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", left: 110, top: 120, fontFamily: FONT }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: C.ink }}>{seg.chapter}</div>
      </div>
      <Card x={110} y={220} w={1700} h={620} pad={34} title="本节要点">
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 10 }}>
          {seg.lines.map((ln, i) => {
            const p = enter(f, lineAt(seg, i), 12);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  fontSize: 30,
                  fontWeight: 700,
                  color: C.ink,
                  lineHeight: 1.5,
                  opacity: p,
                  transform: `translateX(${(1 - p) * 20}px)`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    background: C.blueSoft,
                    color: C.blue,
                    fontSize: 20,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                    marginTop: 4,
                  }}
                >
                  {i + 1}
                </div>
                {ln.text}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
};
