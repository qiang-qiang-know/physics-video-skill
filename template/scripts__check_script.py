"""正确性强制关卡：答案校验单闸门 + 旁白数字对账。

用法：python scripts/check_script.py
流程位置：仿真(src/data/motion.json)与旁白(scripts/script.json)就绪后必须运行；
渲染开始前再跑一次。退出码：0=通过  1=对账未过/数据缺失  2=校验单缺失或非法。

它做两件事：
1. 校验 scripts/verification.json（答案校验单）存在且每个选项都有判定与证据；
2. 扫描旁白里的所有数值，与仿真数据(motion.json 的 events/params/samples)对账：
   旁白中出现而仿真数据中不存在的物理数值 -> 报警（错误传播链的最后闸门）。

合法但不来自仿真的数字（年份、题号等）写进 script.json 顶层 "allowNumbers": []。
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

VERIF_PATH = os.path.join(ROOT, "scripts", "verification.json")
SCRIPT_PATH = os.path.join(ROOT, "scripts", "script.json")
MOTION_PATH = os.path.join(ROOT, "src", "data", "motion.json")


def fail(code, msg):
    print(f"[check_script] FAIL: {msg}")
    sys.exit(code)


def flatten_numbers(obj, out):
    """递归收集结构里的所有数值"""
    if isinstance(obj, (int, float)) and not isinstance(obj, bool):
        out.append(float(obj))
    elif isinstance(obj, dict):
        for v in obj.values():
            flatten_numbers(v, out)
    elif isinstance(obj, list):
        for v in obj:
            flatten_numbers(v, out)


# ---------- 第 1 关：答案校验单 ----------
if not os.path.isfile(VERIF_PATH):
    fail(2, "缺少 scripts/verification.json（答案校验单）。"
            "解题阶段必须先产出校验单（每选项判定+证据），才允许进入后续流程。")
try:
    verif = json.load(open(VERIF_PATH, encoding="utf-8"))
except Exception as e:
    fail(2, f"verification.json 不是合法 JSON：{e}")

ans = verif.get("answer")
opts = verif.get("options")
if not ans or not isinstance(opts, list) or not opts:
    fail(2, 'verification.json 缺少必填字段 "answer" 或 "options"')

valid_methods = {"simulation", "dual_derivation", "formula"}
for o in opts:
    oid, verdict = o.get("id"), o.get("verdict")
    ev = o.get("evidence") or {}
    method = ev.get("method")
    detail = (ev.get("detail") or "").strip()
    if oid is None or not isinstance(verdict, bool):
        fail(2, f"选项 {oid} 缺少 id 或 verdict(true/false)")
    if method not in valid_methods:
        fail(2, f"选项 {oid} 证据不完整：evidence.method 必须是 "
                f"{sorted(valid_methods)} 之一")
    if method == "dual_derivation":
        d1 = (ev.get("method1") or "").strip()
        d2 = (ev.get("method2") or "").strip()
        if not d1 or not d2 or ev.get("consistent") is not True:
            fail(2, f"选项 {oid} 用双法推导，必须填 method1、method2 且 consistent=true")
    elif not detail:
        fail(2, f"选项 {oid} 证据不完整：evidence.detail 非空")
    if method == "simulation" and not os.path.isfile(MOTION_PATH):
        fail(2, f"选项 {oid} 声称由仿真验证，但 src/data/motion.json 不存在")
print(f"[校验单] 通过：答案={ans}，{len(opts)} 个选项均有判定与证据")

# ---------- 第 2 关：旁白数字对账 ----------
if not os.path.isfile(MOTION_PATH):
    fail(1, "缺少 src/data/motion.json（先跑仿真，再对账）")
if not os.path.isfile(SCRIPT_PATH):
    fail(1, "缺少 scripts/script.json")
motion = json.load(open(MOTION_PATH, encoding="utf-8"))
script = json.load(open(SCRIPT_PATH, encoding="utf-8"))

if not motion.get("events"):
    fail(1, "motion.json 的 events 为空——仿真未输出讲解锚点，违反 physics-check.md 规则 2")

universe = []           # 仿真数值全集
flatten_numbers(motion.get("events"), universe)
flatten_numbers(motion.get("params"), universe)
for s in motion.get("samples", []):
    flatten_numbers(s, universe)

allow = set()
for a in script.get("allowNumbers", []):
    try:
        allow.add(float(a))
    except (TypeError, ValueError):
        pass

NUM_RE = re.compile(r"\d+(?:\.\d+)?")
problems = []
checked = 0
for seg in script.get("segments", []):
    for ln in seg.get("lines", []):
        text = ln if isinstance(ln, str) else ln.get("text", "")
        for m in NUM_RE.finditer(text):
            tok = m.group(0)
            val = float(tok)
            checked += 1
            if val in allow:
                continue
            hit = any(abs(v - val) <= max(0.02 * abs(v), 1e-9) for v in universe)
            if not hit:
                problems.append((seg.get("id", "?"), tok, text.strip()))

print(f"[对账] 旁白共扫描 {checked} 个数值，仿真数值全集 {len(universe)} 个")
if problems:
    print(f"[对账] {len(problems)} 个数值在仿真数据中找不到出处：")
    for sid, tok, text in problems:
        print(f"  - 段[{sid}] 数值 {tok}：{text[:50]}")
    print('若确属合法数字（题号、年份等），加入 script.json 顶层 "allowNumbers": [...] 后重跑。')
    sys.exit(1)
print("[对账] 通过：旁白中所有数值均可在仿真数据中找到出处")
