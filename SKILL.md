---
name: physics-video-skill
description: "Turn a middle/high-school physics problem into a complete explanation video (Remotion): physics verification, storyboard, narration-driven timeline, force-body diagrams, v-t/x-t graphs, physics simulation driven animation, TTS narration, karaoke subtitles, plus horizontal (Bilibili) / vertical (Douyin) versions and covers."
description_zh: "给一道初高中物理题，生成完整讲解视频：物理校验→分镜→仿真驱动动画→受力图/v-t图→配音→字幕→横竖双版本+封面"
description_en: "Physics problem to explanation video: verification, storyboard, simulation-driven Remotion animation, TTS, karaoke subtitles, landscape/vertical covers"
category: education
version: 1.2.0
display_name: "物理题讲解视频生成器"
display_name_en: "Physics Video Generator"
visibility: "public"
agent_created: true
---

# 物理题讲解视频生成器

给一道初高中物理题（文字或截图），产出一套完整讲解视频：

- **横版** 1920×1080（B 站/公众号）+ **竖版** 1080×1920（抖音）
- AI 配音（edge-tts，逐字卡拉OK字幕，音画帧级对齐）
- 数值仿真驱动的真实运动动画 + 受力分析图 + v-t 图
- 横竖两版封面 + 发布文案建议
- 效果示例截图：`assets/preview_h.png`（横版）、`assets/preview_v.png`（竖屏原生排版）

## 何时使用

用户给出（或让你自己出）一道**初高中物理题**，要求做成讲解视频/教学视频/短视频。

## 快速开始

```bash
# 1. 从模板生成新项目（--install 走共享依赖缓存，免 npm install）
python "<skill目录>/scripts/new_project.py" <目标目录> --name my-video --install

# 2. 解题并产出 scripts/verification.json（答案校验单：每选项判定+证据）
#    ★ 强制闸门：没有校验单禁止进入后续任何步骤

# 3. 编辑 scripts/script.json（旁白文案）与 src/question.ts（题目配置）

# 4. 写物理仿真（复制 scripts/sim_template.py 改造，每个选项判定写成 assert），
#    生成 src/data/motion.json

# 5. 运行正确性关卡（校验单完整性 + 旁白数字与仿真数据对账，必须通过）
cd <目标目录> && python scripts/check_script.py

# 6. 生成配音与时间轴（自动产出 src/timeline.json，TTS 已并行化）
python scripts/gen_audio.py

# 7. 写各段场景组件（src/scenes/），npx tsc --noEmit 过类型检查

# 8. 先渲染静帧抽查 → 960x540 草稿审看 → 确认后再 1080p 全量渲染
npx remotion still src/index.ts PhysicsExplain out/check.png --frame=<关键帧>
npx remotion render src/index.ts PhysicsExplain out/draft.mp4 --scale=0.5     # 草稿
npx remotion render src/index.ts PhysicsExplain out/video.mp4                 # 横版成品
npx remotion render src/index.ts PhysicsExplainDouyin out/video_dy.mp4        # 竖版成品
npx remotion still src/index.ts CoverH out/cover_h.png                        # 横版封面
npx remotion still src/index.ts CoverV out/cover_v.png                        # 竖版封面
```

## 规则文件（按需读取）

| 文件 | 何时读 |
|---|---|
| `rules/workflow.md` | 开始任何项目前——七步流程与每步产出物 |
| `rules/physics-check.md` | 解题与仿真阶段——物理正确性是生死线 |
| `rules/timeline.md` | 写文案与组件前——旁白驱动时间轴架构（音画同步的关键） |
| `rules/visual.md` | 写场景组件前——配色、箭头语义、字号、平台安全区 |

## 环境要求

- Node ≥ 18，Python 3 + `edge-tts`（`pip install edge-tts`）
- ffmpeg/ffprobe（Windows 下脚本会自动探测 WinGet 安装路径，也可设环境变量 `FFPROBE`；注意 0 字节坏链会被自动过滤）
- **浏览器渲染**（关键坑）：Remotion 需要本地浏览器。**Edge 156+ 无头模式会秒退（exit 0）导致渲染失败**，此时用 Chrome for Testing（国内可从 npmmirror 直连下载）：
  ```bash
  curl -o chrome.zip https://registry.npmmirror.com/-/binary/chrome-for-testing/138.0.7204.94/win64/chrome-win64.zip
  # 解压到 <项目>/browsers/ 下（模板 remotion.config.ts 会自动探测并启用 chrome-for-testing 模式）
  ```
- 模板 `remotion.config.ts` 已内置浏览器探测逻辑（项目内 chrome.exe → Edge 回退）

## 模板结构（template/）

```
template/
├── package.json / tsconfig.json / remotion.config.ts
├── scripts/
│   ├── gen_audio.py        # 旁白 → 音频 + src/timeline.json（通用，直接用；TTS 并发 4）
│   ├── check_script.py     # ★ 正确性关卡：校验单闸门 + 旁白数字对账（通用，直接用）
│   ├── sim_template.py     # 物理仿真模板（复制后按题改造，选项判定必须写成 assert）
│   └── script.example.json # 旁白文案格式示例
└── src/
    ├── theme.ts            # 配色/字体/画布常量
    ├── lib.ts              # 时间轴工具 + 仿真数据读取（通用）
    ├── question.ts         # ★ 题目配置：题干、选项、答案、章节、封面文案
    ├── Main.tsx            # 分段调度 + 字幕 + 配音（通用）
    ├── Root.tsx            # 4 个 Composition 注册（通用）
    ├── Cover.tsx           # 封面骨架（文案来自 question.ts）
    ├── components/         # 通用组件库：Subtitle/Header/ui/FBD/VtGraph/primitives
    └── scenes/
        ├── index.tsx       # ★ 段 id → 组件映射（每题都要改）
        ├── S1Question.tsx  # 题目呈现（读 question.ts，半通用）
        ├── S7Summary.tsx   # 总结（读 question.ts，半通用）
        ├── GenericOption.tsx # 选项段兜底组件（无定制场景时可用）
        ├── GenericScene.tsx  # 通用讲解段（要点逐条出现）
        ├── DyGeneric.tsx   # 竖屏原生兜底排版（大字要点卡，禁止横版缩放）
        └── CoverPreview.tsx  # 封面预览区（每题定制）
```

**分工原则**：components/ 和 Main/Root/lib/theme 一律不改；每题只改 `question.ts`、`scenes/`、仿真脚本、`script.json`。

> **存储说明**：开放平台限制技能包最多两级目录，因此 template/ 内的文件**拍平存储**——目录层级编码进文件名（如 `src__components__ui.tsx` 代表 `src/components/ui.tsx`）。运行 `scripts/new_project.py` 时会自动解码还原成上面的目录树，你直接生成的项目里看到的仍是正常嵌套结构。

## 竖版原则（重要）

竖版**不允许把横版缩放**。三段式优先：专用竖屏组件（`SCENES_DY`）→ `DyGeneric` 兜底 → 仅对单个 SVG 图形局部缩放。详见 `rules/visual.md`。

## 正确性三道防线（v1.2.0 起）

1. **校验单闸门**：`scripts/verification.json` 缺失或证据不完整 → `check_script.py` 拦截（exit 2）
2. **仿真断言**：每个选项判定必须写成 sim.py 的 `assert`，结论错则仿真直接报错
3. **旁白对账**：旁白中的物理数值必须在仿真数据中找到出处，找不到即报警（exit 1）

## 已知限制

- 1080p 全量渲染约 10~20 分钟/条（310s 成片，concurrency=10 + x264 veryfast），横竖两条须串行；草稿审看（--scale=0.5）约 3~5 分钟/条
- 依赖本机浏览器：Edge 156+ 无头失效，需 Chrome for Testing（见「环境要求」）
- 仿真脚本需按题改写，模板只给结构（`sim_template.py`）；物理正确性由「三道防线」强制把关，但校验单中"证据是否真实成立"仍依赖执行时的严谨性
- 竖版有专用组件的段落越少，成片越像"念稿"——重要图形段落建议手写竖屏组件
