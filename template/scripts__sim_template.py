"""物理仿真模板：斜面滑块（上滑-下滑两阶段）。

用法：复制本文件为 scripts/sim.py，按题目改造运动方程与事件，
运行 python scripts/sim.py 后生成 src/data/motion.json。

输出约定（src/lib.ts 依赖）：
{
  "params": {...},          # 仿真参数
  "events": {               # ★ 讲解锚点，场景组件直接引用，禁止手写数值
     "stop": <时刻>,         # 单值事件
     "back": <时刻>,
     "turn": [[t, "说明"], ...]  # 带说明的事件列表
  },
  "samples": [{"t":.., <本题需要的任意字段>:..}, ...]  # t 递增等间隔
}
"""
import json, math, os

# ---- 参数（选好参数后做参数扫描，确认结论对参数不敏感）----
g = 10.0
SIN_T, COS_T = 0.6, 0.8   # 题目约定 sin37°=0.6, cos37°=0.8（与题面数值一致）
mu = 0.5
v0 = 6.0

DT = 2e-5            # 积步步长
T_END = 4.0          # 仿真总时长
OUT_DT = 1 / 120     # 采样输出间隔（120 Hz）

a_up = g * (SIN_T + mu * COS_T)    # 上滑加速度
a_dn = g * (SIN_T - mu * COS_T)    # 下滑加速度
t_stop = v0 / a_up                                      # 到最高点时刻
x_max = v0 * v0 / (2 * a_up)                            # 最大位移
v_back = math.sqrt(2 * a_dn * x_max)                    # 回到出发点速度
t_back = t_stop + math.sqrt(2 * x_max / a_dn)

# ---- 人工解析解核对（能解析的题先写解析解，数值积分用于动画数据）----
print(f"a_up={a_up} a_dn={a_dn} t_stop={t_stop:.3f} x_max={x_max:.3f} "
      f"v_back={v_back:.3f} t_back={t_back:.3f}")
assert abs(x_max - v0**2 / (2 * a_up)) < 1e-9

# ---- ★ 选项结论断言（强制，与 scripts/verification.json 一一对应）----
# 每个选项的判定必须翻译成一条 assert；任一断言失败 = 解题或仿真有误，
# 修复前禁止进入分镜（scripts/check_script.py 也会拦截无校验单的项目）。
# 写法：把"选项说了什么"改写成仿真能直接回答的布尔条件。
# 示例（斜面滑块示例题，做题时替换为本题选项）：
#   选项 A："上滑过程摩擦力大小不变" -> 断言见下
assert abs(mu * g * COS_T - (a_up - g * SIN_T)) < 1e-9, \
    "示例断言失败：上滑阶段摩擦力应为 mu*g*cosθ 恒定"
#   选项 B："物块最终会停在出发点" -> 最高点后能否下滑取决于 mu 与 tanθ
assert (mu < math.tan(math.atan(SIN_T / COS_T))) == (v_back > 0), \
    "示例断言失败：能否下滑由 mu 与 tanθ 的关系决定"
#   （按本题选项数量续写……每条断言对应 verification.json 里一个选项的 evidence）

# ---- 数值积分（两阶段解析运动即可，这里演示"解析+采样"的最简形式；
#      需要积分的题参考 skill 示例项目的 spring-block 模型）----
samples = []
next_out = 0.0
t = 0.0
while t <= T_END:
    if t <= t_stop:
        v = v0 - a_up * t
        x = v0 * t - 0.5 * a_up * t * t
        phase, a = 1, a_up
        fric = mu * g * COS_T  # 沿斜面向下
    else:
        ts = t - t_stop
        v = min(a_dn * ts, v_back)
        x = max(x_max - 0.5 * a_dn * ts * ts, 0.0)
        phase, a = -1, a_dn
        fric = mu * g * COS_T  # 沿斜面向上
    if t >= next_out:
        samples.append({
            "t": round(t, 5),
            "x": round(x, 5),      # 沿斜面位置（0=出发点）
            "v": round(v, 5),      # 带符号速度（正=上滑）
            "a": round(a, 3),
            "f": round(fric, 3),
            "phase": phase,        # 1=上滑 -1=下滑
        })
        next_out += OUT_DT
    t += DT

out = {
    "params": {"g": g, "theta_deg": 37, "mu": mu, "v0": v0},
    "events": {
        "stop": round(t_stop, 4),          # 到最高点
        "back": round(t_back, 4),          # 回到出发点
        "x_max": round(x_max, 4),
        "v_back": round(v_back, 4),
        "turn": [[round(t_stop, 4), "最高点：速度为零，摩擦力反向"]],
    },
    "samples": samples,
}
dst = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "src", "data", "motion.json")
os.makedirs(os.path.dirname(dst), exist_ok=True)
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False)
print(f"-> {dst}  samples={len(samples)}")
