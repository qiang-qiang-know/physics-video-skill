/**
 * ★ 题目配置（每个项目都要改）
 * S1Question / S7Summary / GenericOption / Header / Cover 都从这里读内容。
 * 注意：本文件是 .ts，不能写 JSX；富文本请放场景组件里。
 * 场景专用的几何/物理常量不要放这里，放各自的场景文件里。
 */

/**
 * ★ 版本方向（开工前由用户选择，默认竖版）
 * - "vertical"   竖版 1080×1920（抖音 / 视频号 / 快手）——默认
 * - "horizontal" 横版 1920×1080（B站 / 公众号 / 课堂投屏）
 * Root.tsx 只注册所选方向的 Composition；写错方向无法渲染，会直接报 composition not found。
 * 只做一版即可，不要两版都做（渲染时间减半，且两版画面语言完全不同）。
 */
export type Orientation = "vertical" | "horizontal";
export const ORIENTATION: Orientation = "vertical";

export const QUESTION = {
  /** 顶部标签与副题 */
  tag: "高中物理 · 例题",
  subtitle: "斜面 — 滑块 · 受力与运动",

  /** 题干（pieces 用于关键词高亮，at = lineAt(seg, i) 锚点） */
  stem: [
    { s: "如图所示，" },
    { s: "倾角 37°", hi: true },
    { s: "的固定斜面足够长，" },
    { s: "滑块以 6 m/s 的初速度沿斜面向上滑出", hi: true },
    { s: "，滑块与斜面间的动摩擦因数 μ = 0.5，" },
    { s: "取 g = 10 m/s²", hi: true },
    { s: "，则（　　）" },
  ],
  /** 各句锚点：第 i 个元素表示 stem 中该部分随第几句旁白出现 */
  stemAt: [0, 0, 1, 1, 2, 2, 3],

  /** 选项 */
  options: [
    { k: "A", t: "滑块上滑的加速度大小为 2 m/s²" },
    { k: "B", t: "滑块上滑的最大位移为 1.8 m" },
    { k: "C", t: "滑块到达最高点后将静止在斜面上" },
    { k: "D", t: "滑块下滑回到出发点时的速度大小为 6 m/s" },
  ],
  /** 正确答案字母（Header 圆点高亮、总结页用） */
  answer: "B",

  /** 总结页三步法 */
  steps: [
    { n: "1", t: "分阶段受力", d: "上滑与下滑摩擦力方向相反，分开列方程" },
    { n: "2", t: "判断能否静止", d: "比较 μ 与 tanθ：μ > tanθ 才停得住" },
    { n: "3", t: "对称性检查", d: "下滑加速度更小，回到出发点速度必变小" },
  ],  /** 总结页答案条的一句话理由（纯文本；富文本版本写在 S7Summary 场景里） */
  answerReason:
    "上滑 a₁ = g(sinθ + μcosθ) = 10 m/s²，最大位移 x = v₀²/2a₁ = 1.8 m；下滑 a₂ = 2 m/s²，回到出发点速度仅 ≈ 2.68 m/s，B 正确。",
  /** 总结页底部一句话回顾 */
  recap: "A ✗ a₁ = 10 m/s² ｜ B ✓ x = 1.8 m ｜ C ✗ μ < tanθ 停不住 ｜ D ✗ 机械能损失，仅 ≈ 2.68 m/s",

  /** 封面文案。hook 是逐行大字标题，每行由若干片段组成，hi=true 标红 */
  cover: {
    chip: "高中物理 · 斜面模型",
    hook: [
      [{ s: "上滑 10 m/s²，" }],
      [{ s: "下滑只有 " }, { s: "2 m/s²", hi: true }],
      [{ s: "为什么？" }],
    ],
    sub: "摩擦力换了个方向，一切都不一样了",
    truth: "关键在「μ 与 tanθ 的比较」",
  },
} as {
  tag: string;
  subtitle: string;
  stem: { s: string; hi?: boolean }[];
  stemAt: number[];
  options: { k: string; t: string }[];
  answer: string;
  steps: { n: string; t: string; d: string }[];
  answerReason: string;
  recap: string;
  cover: {
    chip: string;
    hook: { s: string; hi?: boolean }[][];
    sub: string;
    truth: string;
  };
};

/** 选项映射为 A/B/C/D 顺序数组（Header 用） */
export const OPT_LETTERS = ["A", "B", "C", "D"].slice(0, QUESTION.options.length);
