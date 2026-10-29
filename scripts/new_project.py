"""从 template 生成新项目：python new_project.py <目标目录> [--name 项目名]

模板在技能包内为「拍平存储」（目录层级编码进文件名：src__components__ui.tsx），
因为开放平台要求技能包最多两级目录。本脚本负责还原完整目录树。
"""
import argparse, json, os, re, shutil, subprocess, sys

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(SKILL, "template")
SEP = "__"  # 目录分隔符编码（原文件名不含此串）
# 共享依赖缓存：必须放在名为 node_modules 的目录里，否则 Node 从包内向上解析同级依赖会失败
CACHE = os.path.join(SKILL, ".deps", "node_modules")


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


def cache_ready():
    return os.path.isdir(os.path.join(CACHE, "remotion"))


def set_orientation(dest, orientation):
    """把选定方向写进 src/question.ts 的 ORIENTATION（默认 vertical）"""
    p = os.path.join(dest, "src", "question.ts")
    if not os.path.exists(p):
        return False
    s = open(p, encoding="utf-8").read()
    new = re.sub(r'(export const ORIENTATION: Orientation = )"(vertical|horizontal)";',
                 r'\1"%s";' % orientation, s)
    if new == s:
        return False
    open(p, "w", encoding="utf-8", newline="\n").write(new)
    return True


def link_shared_node_modules(dest):
    """用 NTFS junction 把项目 node_modules 指向共享缓存，免 npm install"""
    nm = os.path.join(dest, "node_modules")
    r = subprocess.run(["cmd", "/c", "mklink", "/J", nm, CACHE],
                       capture_output=True, text=True)
    return r.returncode == 0


def _npm_cmd():
    """Windows 下 Python subprocess 找不到 npm，需解析 npm.cmd 完整路径"""
    for name in ("npm.cmd", "npm"):
        p = shutil.which(name)
        if p:
            return p
    return None


def npm_install_and_cache(dest):
    """npm install，成功后把 node_modules 复制进共享缓存（仅首次，约 30~60s）"""
    npm = _npm_cmd()
    if not npm:
        print("依赖：PATH 里找不到 npm，请手动在项目目录执行 npm install", file=sys.stderr)
        return False
    print("npm install 中……")
    r = subprocess.run([npm, "install"], cwd=dest)
    if r.returncode != 0:
        return False
    if not cache_ready():
        print("首次安装：复制 node_modules 到共享缓存（一次性，之后的项目免安装）……")
        shutil.copytree(os.path.join(dest, "node_modules"), CACHE)
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dest")
    ap.add_argument("--name", default=None)
    ap.add_argument("--orientation", choices=["vertical", "horizontal"], default="vertical",
                    help="版本方向：vertical 竖版（默认）/ horizontal 横版")
    ap.add_argument("--install", action="store_true",
                    help="生成后自动安装依赖（有共享缓存时走 junction，秒级完成）")
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

    vertical = args.orientation == "vertical"
    if not set_orientation(dest, args.orientation):
        print("警告：未能写入 ORIENTATION，请手动改 src/question.ts", file=sys.stderr)

    if args.name:
        pkg = os.path.join(dest, "package.json")
        p = json.load(open(pkg, encoding="utf-8"))
        p["name"] = args.name
        json.dump(p, open(pkg, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    comp = "PhysicsExplainDouyin" if vertical else "PhysicsExplain"
    print("已生成项目：", dest)
    print(f"版本方向：{'竖版 1080×1920（抖音/视频号）' if vertical else '横版 1920×1080（B站/公众号）'}"
          f" —— Root.tsx 只会注册 {comp}")
    print("提示：模板自带斜面滑块示例的配音/时间轴，可直接渲染验证环境：")
    print(f"  npx remotion still src/index.ts {comp} out/check.png --frame=300")
    print("正式做新题时按下面顺序：")
    print("  1. 解题并产出 scripts/verification.json（答案校验单：每选项判定+证据，")
    print("     不过关禁止进入分镜）——规则见 rules/physics-check.md")
    print("  2. 改 src/question.ts（题目配置，ORIENTATION 不要动）与 scripts/script.json（旁白）")
    print("  3. 复制 scripts/sim_template.py 为 scripts/sim.py，按题改造并把每个选项")
    print("     的判定写成 assert，跑出 src/data/motion.json")
    print("  4. python scripts/check_script.py（正确性关卡：校验单+旁白数字对账，必须通过）")
    print("  5. python scripts/gen_audio.py 重新生成配音与时间轴（覆盖示例）")
    print(f"  6. 写{'竖版 SCENES_DY（未写的段由 DyGeneric 兜底）' if vertical else '横版 SCENES'}，"
          f"再 npx tsc --noEmit 检查")
    print(f"  7. 先渲染 960x540 草稿审看，确认后再 1080p 全量渲染（只渲 {comp}）")

    if args.install:
        if cache_ready():
            if link_shared_node_modules(dest):
                print("依赖：已通过共享缓存 junction 挂载（免 npm install）。")
                print("      注意：若修改 package.json 加新依赖，请先删除 node_modules 再 npm install。")
            else:
                print("依赖：junction 创建失败，执行 npm install……")
                npm_install_and_cache(dest)
        else:
            if npm_install_and_cache(dest):
                print("依赖：安装完成，共享缓存已就绪。")
            else:
                print("依赖：npm install 失败，请手动检查。", file=sys.stderr)
                sys.exit(1)
    elif cache_ready():
        print("检测到共享依赖缓存，可加 --install 参数免 npm install 秒装依赖。")


if __name__ == "__main__":
    main()
