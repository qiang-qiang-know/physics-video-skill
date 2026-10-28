import React from "react";
import { Seg } from "../lib";
import { S1Question } from "./S1Question";
import { S7Summary } from "./S7Summary";
import { GenericOption, OptionExtra } from "./GenericOption";
import { GenericScene } from "./GenericScene";

/**
 * ★★ 段 id → 场景组件映射（每题都要改）
 *
 * - id 必须与 scripts/script.json 里 segments[].id 一致
 * - 选项段可以全用 GenericOption（配 EXTRA.explain 文案）
 * - 定制画面时新建组件并替换映射
 */

/** GenericOption 的逐句解析文案（与该段旁白 lines 对齐，最后一句作结论条） */
export const EXTRA: OptionExtra = {
  explain: {
    A: ["上滑时摩擦力沿斜面向下，与重力分量同向", "a₁ = g(sinθ + μcosθ) = 10 m/s²，不是 2 m/s²", "所以 A 错误：10 m/s² 才是上滑加速度"],
    B: ["上滑做匀减速直线运动，最高点末速度为零", "由 v₀² = 2a₁x 得 x = 36/20 = 1.8 m", "所以 B 正确：最大位移 1.8 m"],
    C: ["最高点速度为零，是否静止看最大静摩擦", "重力沿斜面分量 mg·sinθ = 6 N，最大静摩擦 ≈ μmg·cosθ = 4 N", "μ = 0.5 < tan37° ≈ 0.75，滑块会下滑，C 错误", "注意：本题 μ 与 tanθ 的比较决定能否静止"],
    D: ["下滑加速度 a₂ = g(sinθ − μcosθ) = 2 m/s²", "下滑位移与上滑相同，但加速度更小", "由 v² = 2a₂x 得 v ≈ 2.68 m/s < 6 m/s", "机械能有损失，速度不可能恢复到 6 m/s"],
  },
};

export const SCENES: Record<string, React.FC<{ seg: Seg }>> = {
  q: S1Question,
  model: GenericScene, // 有建模段时替换为定制组件
  a: (p) => <GenericOption {...p} extra={EXTRA} />,
  b: (p) => <GenericOption {...p} extra={EXTRA} />,
  c: (p) => <GenericOption {...p} extra={EXTRA} />,
  d: (p) => <GenericOption {...p} extra={EXTRA} />,
  sum: S7Summary,
};

/**
 * 竖屏原生场景（可选）：为关键段落单独排版（rules/visual.md）。
 * 留空则该段在竖版里自动使用 DyGeneric（竖屏原生大字要点卡，不是缩放）。
 * 有图/动画的段落建议写专用竖屏组件——参考 spring3ball 项目的 DyScenes.tsx。
 */
export const SCENES_DY: Record<string, React.FC<{ seg: Seg }>> = {};

/** 「本节关键」要点条（竖版顶部，段 id → 一句话） */
export const KEY_POINTS: Record<string, string> = {
  q: "先看清：斜面、初速度、μ 三个条件",
  model: "上滑与下滑，摩擦力方向相反",
  a: "上滑 a₁ = g(sinθ + μcosθ)",
  b: "最高点由 v₀² = 2a₁x 决定",
  c: "μ 与 tanθ 比较决定能否静止",
  d: "下滑加速度更小，速度回不到原值",
  sum: "三步法：分阶段受力 → 判静止 → 对称性检查",
};
