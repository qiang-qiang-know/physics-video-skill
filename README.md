# 物理题讲解视频生成器（physics-video-skill）

把一道初高中物理题（文字或截图）自动做成一套**可直接发布的教学视频**：横版 1920×1080（B 站/视频号）+ 竖版 1080×1920（抖音），含 AI 配音、逐字卡拉OK字幕、受力分析图、v-t 图、数值仿真驱动的真实运动动画，以及横竖两版封面。

这不是一个"提示词模板"，而是一个**工程化的生产流水线**：物理校验 → 分镜 → 仿真 → 配音 → 组件 → 两阶段渲染，每一步都有明确的产出物与质检卡点。

## 效果

- 横版：7 段结构（题目 → 建模 → 逐项/分步 → 总结），310 秒级成片，1920×1080
- 竖版：**原生竖屏重排**（不是横版缩放），大字要点卡 + 顶部章节条 + 右侧点赞栏安全区
- 字幕：逐字卡拉OK高亮，音画帧级对齐（由 TTS 时间戳驱动，不靠估算）
- 动画：位置/速度/力曲线全部来自数值仿真结果，物理锚点（共速、转折、碰撞时刻）由仿真扫描确定，不靠拍脑袋

## 安装

仓库根目录**就是技能目录**，克隆到 WorkBuddy 技能路径即可：

```bash
# macOS / Linux
git clone https://github.com/qiang-qiang-know/physics-video-skill.git ~/.workbuddy/skills/physics-video-skill

# Windows (PowerShell)
git clone https://github.com/qiang-qiang-know/physics-video-skill.git "$env:USERPROFILE\.workbuddy\skills\physics-video-skill"
```

重启 WorkBuddy 后，在「技能」里即可看到「物理题讲解视频生成器」。之后直接对话：

> 把这道题做成视频 [附题目截图]

## 依赖

| 依赖 | 用途 | 安装 |
|---|---|---|
| Node ≥ 18 | Remotion 渲染 | 自带 npm 即可 |
| Python 3 | 脚手架、仿真、配音脚本 | 3.9+ |
| edge-tts | 中文配音 + 逐字时间戳 | `pip install edge-tts` |
| ffmpeg / ffprobe | 音频时长探测、成片校验 | Windows 可用 WinGet 安装 |

**浏览器（关键）**：Remotion 需要本地 Chrome。Edge 156+ 的无头模式会秒退（exit 0），必须用 Chrome for Testing：

```bash
curl -o chrome.zip https://registry.npmmirror.com/-/binary/chrome-for-testing/138.0.7204.94/win64/chrome-win64.zip
# 解压到 <项目>/browsers/chrome-win64/，remotion.config.ts 会自动探测
```

## 快速开始

```bash
# 1. 从模板生成项目（目录树自动还原）
python scripts/new_project.py my-video --name my-video
cd my-video

# 2. 安装依赖（模板自带示例配音与时间轴，装完即可直接渲染验证环境）
npm install
pip install edge-tts   # 仅在你修改旁白、需要重新配音时才用得到

# 3. 验证环境：先出静帧，别直接渲染全片
npx remotion still src/index.ts PhysicsExplainDouyin out/dy.png --frame=300

# 4. 正式做新题：改题目配置与旁白
#    src/question.ts     题干、选项、答案、封面文案
#    scripts/script.json 分段旁白（句子数决定画面节奏）
#    scripts/sim.py      复制 sim_template.py 按题改造，产出 src/data/motion.json

# 5. 渲染（横竖必须串行，并行会双双僵死）
npx remotion render src/index.ts PhysicsExplain out/video.mp4 --timeout=60000 --concurrency=3
npx remotion render src/index.ts PhysicsExplainDouyin out/video_dy.mp4 --timeout=60000 --concurrency=3
npx remotion still src/index.ts CoverH out/cover_h.png
npx remotion still src/index.ts CoverV out/cover_v.png
```

## 目录结构

```
physics-video-skill/
├── SKILL.md                 技能定义（触发条件、流程入口、环境要求）
├── rules/                   按需加载的规则文件
│   ├── workflow.md          七步流程与每步产出物
│   ├── physics-check.md     物理正确性校验清单（生死线）
│   ├── timeline.md          旁白驱动时间轴架构（音画同步关键）
│   └── visual.md            配色/箭头语义/字号/竖屏安全区
├── scripts/
│   └── new_project.py       脚手架：模板 → 新项目（还原目录树）
├── template/                Remotion 项目模板（可复用组件库 + 示例题）
│   ├── package.json  tsconfig.json  remotion.config.ts
│   ├── scripts__gen_audio.py      旁白 → 音频 + timeline.json
│   ├── scripts__sim_template.py   物理仿真模板
│   ├── src__question.ts           ★ 题目配置
│   ├── src__components__*.tsx     字幕/页眉/受力图/v-t图/图元
│   └── src__scenes__*.tsx         题目/总结/通用段/竖屏兜底/封面预览
└── assets/                  效果预览图（发布包内含）
```

> **关于 template/ 的扁平文件名**：`src__components__ui.tsx` 实际对应 `src/components/ui.tsx`。
> 因为技能市场要求安装包最多两级目录，模板采用"目录层级编码进文件名"的扁平存储；`new_project.py` 会在生成项目时自动还原成正常嵌套结构，使用者无感知。

## 设计要点

1. **旁白驱动，而非画面驱动**：先定文案，TTS 产出逐句时间戳，场景用 `lineAt(seg, i)` 对齐"讲到哪、画面变到哪"，避免音画漂移。
2. **仿真优先**：所有运动曲线来自 `sim.py` 的数值积分，物理锚点由扫描得到；讲解里的每个数字都可追溯到脚本输出。
3. **竖屏原生三条路**：专用竖屏组件 → `DyGeneric` 大字要点卡兜底 → 仅对单个 SVG 图形局部缩放。禁止整体缩放横版（0.56 倍会把正文压到 23px，手机上必然发糊）。
4. **两阶段渲染**：每段先出 1~2 张静帧读图检查（文字溢出、安全区、曲线越界），全过才全量渲染。

## 已知限制

- 单条 5 分钟成片渲染约 20~40 分钟（1080p），横竖两条必须串行
- 仿真脚本需按题改写，模板只提供结构，物理正确性依赖 `rules/physics-check.md` 自查
- 竖版专用组件写得越少，成片越接近"念稿"；图形密集的段落建议手写竖屏组件
- 目前覆盖力学（斜面、弹簧、碰撞、传送带等），电磁/天体类题目可复用框架但需新增图元

## 许可证

MIT，见 [LICENSE](LICENSE)。
