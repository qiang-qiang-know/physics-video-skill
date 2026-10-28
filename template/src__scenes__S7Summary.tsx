import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { Seg, lineAt, enter } from "../lib";
import { Card } from "../components/ui";
import { QUESTION } from "../question";

/** 总结段（半通用）：三步法卡片 + 答案条，内容来自 question.ts */
export const S7Summary: React.FC<{ seg: Seg }> = ({ seg }) => {
  const f = useCurrentFrame();
  const L = (i: number) => lineAt(seg, i);
  const pTitle = enter(f, 0, 12);
  const pAnswer = enter(f, L(QUESTION.steps.length), 16);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 110,
          fontFamily: FONT,
          opacity: pTitle,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 900, color: C.ink, letterSpacing: 2 }}>
          方法总结 ·
          <span style={{ color: C.blue }}> {QUESTION.subtitle}</span>
        </div>
        <div style={{ fontSize: 24, color: C.ink3, fontWeight: 700, marginTop: 8 }}>
          题型变了，方法不变
        </div>
      </div>

      {QUESTION.steps.map((s, i) => {
        const p = enter(f, L(i), 14);
        return (
          <div
            key={s.n}
            style={{
              position: "absolute",
              left: 110 + i * 566,
              top: 236,
              width: 546,
              height: 290,
              opacity: p,
              transform: `translateY(${(1 - p) * 24}px)`,
              fontFamily: FONT,
            }}
          >
            <Card x={0} y={0} w={546} h={290} pad={26}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  background: C.blueSoft,
                  color: C.blue,
                  fontSize: 30,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, color: C.ink, marginBottom: 12 }}>
                {s.t}
              </div>
              <div style={{ fontSize: 25, fontWeight: 700, color: C.ink2, lineHeight: 1.5 }}>
                {s.d}
              </div>
            </Card>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 566,
          width: 1700,
          height: 250,
          background: "#0F1B2B",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          padding: "0 46px",
          boxSizing: "border-box",
          fontFamily: FONT,
          color: "#fff",
          opacity: pAnswer,
          transform: `translateY(${(1 - pAnswer) * 20}px)`,
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 64,
            background: C.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 74,
            fontWeight: 900,
            marginRight: 40,
            flex: "0 0 auto",
          }}
        >
          {QUESTION.answer}
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#8FA8C4", marginBottom: 10 }}>
            正确答案
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.45 }}>
            {QUESTION.answerReason}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 840,
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 700,
          color: C.ink3,
          opacity: pAnswer,
        }}
      >
        {QUESTION.recap}
      </div>
    </>
  );
};
