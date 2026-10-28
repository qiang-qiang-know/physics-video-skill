"""从 template 生成新项目：python new_project.py <目标目录> [--name 项目名]

模板在技能包内为「拍平存储」（目录层级编码进文件名：src__components__ui.tsx），
因为开放平台要求技能包最多两级目录。本脚本负责还原完整目录树。
"""
import argparse, json, os, shutil, sys

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(SKILL, "template")
SEP = "__"  # 目录分隔符编码（原文件名不含此串）


def decode_flat(dest):
    """把 template 拍平文件按文件名编码还原成目录树"""
    for name in os.listdir(dest):
        if SEP not in name:
            continue
        parts = name.split(SEP)
        flat = os.path.join(dest, name)
        target = os.path.join(dest, *parts)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        shutil.move(flat, target)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dest")
    ap.add_argument("--name", default=None)
    args = ap.parse_args()

    dest = os.path.abspath(args.dest)
    if os.path.exists(dest):
        print(f"目标目录已存在：{dest}")
        sys.exit(1)

    shutil.copytree(TEMPLATE, dest)
    decode_flat(dest)
    # 复制示例文案为 script.json
    ex = os.path.join(dest, "scripts", "script.example.json")
    if os.path.exists(ex):
        shutil.copy(ex, os.path.join(dest, "scripts", "script.json"))

    if args.name:
        pkg = os.path.join(dest, "package.json")
        p = json.load(open(pkg, encoding="utf-8"))
        p["name"] = args.name
        json.dump(p, open(pkg, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    print("已生成项目：", dest)
    print("提示：模板自带斜面滑块示例的配音/时间轴，可直接渲染验证环境：")
    print("  npx remotion still src/index.ts PhysicsExplainDouyin out/dy.png --frame=300")
    print("正式做新题时按下面顺序：")
    print("  1. 改 src/question.ts（题目配置）与 scripts/script.json（旁白）")
    print("  2. 复制 scripts/sim_template.py 为 scripts/sim.py 并按题改造，跑出 src/data/motion.json")
    print("  3. python scripts/gen_audio.py 重新生成配音与时间轴（覆盖示例）")
    print("  4. 按需改 src/scenes/，然后 npx tsc --noEmit 检查")


if __name__ == "__main__":
    main()
