import React from "react";
import { C, FONT } from "../theme";
import { MOTION } from "../lib";

/**
 * 通用 v-t 图（也可当 x-t 用，改轴标签即可）。
 * series[].key 对应 motion.json samples 的字段名。
 */
export type Series = { key: string; label: string; color: string };
export type Mark = {
  t: number;
  label: string;
  sub?: string;
  color?: string;
  dotOn?: string[]; // series keys
  align?: "left" | "right";
  dy?: number;
};

type Props = {
  tNow: number;
  tMax: number;
  vMin?: number;
  vMax?: number;
  series: Series[];
  marks?: Mark[];
  shade?: { from: number; to: number } | null;
  showLegend?: boolean;
  pulse?: number;
  height?: number;
  k?: number;
  xLabel?: string;
  yLabel?: string;
};

export const VtGraph: React.FC<Props> = ({
  tNow,
  tMax,
  vMin = -1.2,
  vMax = 3.2,
  series,
  marks = [],
  shade = null,
  showLegend = true,
  pulse = 0,
  height = 380,
  k = 1,
  xLabel = "t / s",
  yLabel = "v /(m·s⁻¹)",
}) => {
  const X0 = 78,
    X1 = 740,
    Y0 = 28,
    Y1 = 330;
  const px = (t: number) => X0 + (t / tMax) * (X1 - X0);
  const py = (v: number) => Y1 - ((v - vMin) / (vMax - vMin)) * (Y1 - Y0);

  const pts = MOTION.samples.filter((s) => s.t <= tNow + 1e-6 && s.t <= tMax);
  const paths = series.map((sr) => ({
    sr,
    d: pts.map((s) => `${px(s.t)},${py(s[sr.key] ?? 0)}`).join(" "),
    last: pts[pts.length - 1],
  }));

  const inPlot = (v: number) => v >= vMin - 0.001 && v <= vMax + 0.001;
  const gridT: number[] = [];
  for (let t = 0; t <= tMax + 1e-6; t += 0.1) gridT.push(Number(t.toFixed(2)));
  const gridV: number[] = [];
  for (let v = Math.ceil(vMin); v <= vMax; v += 1) gridV.push(v);

  return (
    <svg viewBox={`0 0 760 420`} style={{ width: "100%", height }}>
      {shade && (
        <rect
          x={px(shade.from)}
          y={Y0}
          width={Math.max(0, px(Math.min(shade.to, tNow)) - px(shade.from))}
          height={Y1 - Y0}
          fill={C.orangeSoft}
        />
      )}
      {gridT.map((t) => (
        <line
          key={`gt${t}`}
          x1={px(t)}
          y1={Y0}
          x2={px(t)}
          y2={Y1}
          stroke={C.line}
          strokeWidth={1.5}
          opacity={0.7}
        />
      ))}
      {gridV.map((v) => (
        <line
          key={`gv${v}`}
          x1={X0}
          y1={py(v)}
          x2={X1}
          y2={py(v)}
          stroke={v === 0 ? C.ink3 : C.line}
          strokeWidth={v === 0 ? 2.5 : 1.5}
          opacity={v === 0 ? 0.9 : 0.7}
        />
      ))}
      <line x1={X0} y1={Y0 - 6} x2={X0} y2={Y1} stroke={C.ink} strokeWidth={3} />
      <line x1={X0} y1={py(0)} x2={X1} y2={py(0)} stroke={C.ink} strokeWidth={3} />
      <text x={X1} y={py(0) - 12} fill={C.ink2} fontSize={20 * k} fontWeight={700} textAnchor="end" fontFamily={FONT}>
        {xLabel}
      </text>
      <text x={X0 + 14} y={Y0 + 26} fill={C.ink2} fontSize={20 * k} fontWeight={700} textAnchor="start" fontFamily={FONT}>
        {yLabel}
      </text>
      {gridT.map((t) => (
        <text
          key={`lt${t}`}
          x={px(t)}
          y={py(0) + 24}
          fill={C.ink3}
          fontSize={17 * k}
          textAnchor="middle"
          fontFamily={FONT}
          opacity={Number.isInteger(t) ? 1 : 0}
        >
          {t.toFixed(0)}
        </text>
      ))}
      {gridV.map((v) => (
        <text
          key={`lv${v}`}
          x={X0 - 12}
          y={py(v) + 6}
          fill={C.ink3}
          fontSize={17 * k}
          textAnchor="end"
          fontFamily={FONT}
        >
          {v}
        </text>
      ))}

      {pts.length > 1 && (
        <>
          <clipPath id="vtPlotClip">
            <rect x={X0} y={Y0 - 8} width={X1 - X0} height={Y1 - Y0 + 16} />
          </clipPath>
          <g clipPath="url(#vtPlotClip)">
            {paths.map(({ sr, d }) => (
              <polyline key={sr.key} points={d} fill="none" stroke={sr.color} strokeWidth={5} strokeLinejoin="round" />
            ))}
          </g>
          {paths.map(({ sr, last }) =>
            last && inPlot(last[sr.key] ?? 0) ? (
              <circle key={`dot-${sr.key}`} cx={px(last.t)} cy={py(last[sr.key] ?? 0)} r={7} fill={sr.color} />
            ) : null
          )}
        </>
      )}

      {marks
        .filter((m) => m.t <= tNow + 0.001)
        .map((m, i) => {
          const color = m.color ?? C.ink;
          return (
            <g key={i}>
              <line
                x1={px(m.t)}
                y1={Y0}
                x2={px(m.t)}
                y2={Y1}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="7 7"
                opacity={0.85}
              />
              {(m.dotOn ?? []).map((srKey, j) => {
                const s = MOTION.samples.find((x) => Math.abs(x.t - m.t) < 0.006);
                const sr = series.find((x) => x.key === srKey);
                if (!s || !sr) return null;
                return (
                  <circle
                    key={j}
                    cx={px(m.t)}
                    cy={py(s[srKey] ?? 0)}
                    r={9 + pulse * 3}
                    fill={C.card}
                    stroke={color}
                    strokeWidth={4}
                  />
                );
              })}
              <g
                transform={`translate(${px(m.t) + (m.align === "right" ? -10 : 10)}, ${
                  Y0 + 8 + (m.dy ?? 0)
                })`}
              >
                <text
                  x={0}
                  y={0}
                  fill={color}
                  fontSize={20 * k}
                  fontWeight={800}
                  textAnchor={m.align === "right" ? "end" : "start"}
                  fontFamily={FONT}
                >
                  {m.label}
                </text>
                {m.sub && (
                  <text
                    x={0}
                    y={24}
                    fill={color}
                    fontSize={18 * k}
                    fontWeight={700}
                    opacity={0.9}
                    textAnchor={m.align === "right" ? "end" : "start"}
                    fontFamily={FONT}
                  >
                    {m.sub}
                  </text>
                )}
              </g>
            </g>
          );
        })}

      {showLegend && (
        <g fontFamily={FONT} fontSize={19 * k} fontWeight={700}>
          {series.map((sr, i) => (
            <g key={sr.key} transform={`translate(0, ${i * 34})`}>
              <line x1={X0 + 6} y1={Y1 + 60} x2={X0 + 44} y2={Y1 + 60} stroke={sr.color} strokeWidth={5} />
              <text x={X0 + 54} y={Y1 + 66} fill={sr.color}>
                {sr.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};
