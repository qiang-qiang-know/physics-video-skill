export const C = {
  bg: "#F4F6FA",
  bg2: "#E9EEF6",
  card: "#FFFFFF",
  ink: "#16202C",
  ink2: "#55647A",
  ink3: "#93A1B1",
  blue: "#1F6FEB",
  blueSoft: "#E7F0FE",
  orange: "#F2711C",
  orangeSoft: "#FDEEE3",
  green: "#17A05A",
  greenSoft: "#E4F6EC",
  purple: "#7C5CFF",
  purpleSoft: "#EFEBFF",
  gray: "#93A1B1",
  red: "#DC3545",
  redSoft: "#FDEAEC",
  line: "#D9E2EC",
  dark: "#0F1B2B",
};

export const FONT = `"Microsoft YaHei", "PingFang SC", "Noto Sans SC", "Segoe UI", sans-serif`;

/** 横版画布。竖版固定 1080x1920（见 Root.tsx）。 */
export const W = 1920;
export const H = 1080;
export const FPS = 30;

/** 箭头/颜色语义（rules/visual.md） */
export const SEM = {
  spring: C.blue, // 弹力/支持力
  friction: C.orange, // 摩擦力
  gravity: C.gray, // 重力
  velocity: C.green, // 速度
  accel: C.purple, // 加速度
};
