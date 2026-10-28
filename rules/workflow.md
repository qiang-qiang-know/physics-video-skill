# 工作流程：从一道题到一条成片

七步流程。每步有明确产出物，前一步没确认不要进下一步。

## 第 1 步：解题与物理校验（rules/physics-check.md）

- 读懂题，给出答案与完整解析（每个选项为什么对/错）
- **强制**：按 physics-check.md 完成答案验证
- 产出：每个选项的结论 + 关键物理量（共速时刻、转折点、最终状态等"讲解锚点"）

## 第 2 步：分镜策划

- 确定章节结构。选择题推荐七段：`q(题目) → model(建模) → a/b/c/d(逐项) → sum(总结)`
- 计算题推荐五段：`q(题目) → model(建模与思路) → s1/s2/...(分步求解) → sum(总结)`
- 每段想清楚：核心画面是什么（受力图？运动动画？v-t 图？数据面板？）
- 用户有平台要求时先确认：横版（B站）/竖版（抖音）/两者都要——模板两版都会生成

## 第 3 步：写旁白文案 scripts/script.json

- 逐句短句，每句一句完整的话（TTS 按句生成，句间自动加 gap）
- 术语的中文读音问题提前处理（μ 读"缪"，多音字换词）
- 字数估算时长：中文 TTS ≈ 每字 0.22~0.26s（rate +6% 时约 0.21s/字）
- **句子数决定每段画面节奏**：场景组件里用 `lineAt(seg, i)` 锚定每句话出现的画面变化

## 第 4 步：物理仿真 scripts/sim_template.py

- 复制 `sim_template.py` 改造：建立本题的运动方程，数值积分（dt ≤ 2e-5）
- **必须输出讲解锚点到 `events`**：如共速时刻、端点时刻、锁定时刻（仿真扫描确定，不能拍脑袋）
- 采样输出 `samples`（等间隔，含 t 和所有后续动画需要的量：位置、速度、力、能量…）
- 跑通后先打印关键锚点核对物理合理性，再写 `src/data/motion.json`

## 第 5 步：生成配音与时间轴

```bash
python scripts/gen_audio.py
```

- 自动产出 `public/audio/l001.mp3...` 和 `src/timeline.json`
- 产出后**必须**用 node 打印各段帧区间，确认总时长合理（>6 分钟考虑精简文案）

## 第 6 步：写题目配置与场景组件

1. 填 `src/question.ts`（题干、选项、答案、章节名、封面文案）
2. 改 `src/scenes/index.tsx` 的段 id → 组件映射
3. 写各段场景。可用组件见 rules/visual.md；选项段没有定制画面时可用 `GenericOption`
4. `npx tsc --noEmit` 过类型检查

## 第 7 步：渲染与质检

**两阶段渲染，禁止跳过第一阶段**：

1. 每段挑 1~2 个代表帧渲染静帧（用 timeline.json 里的段中帧号），逐一读图检查：
   - 文字是否溢出/重叠（历史最高频问题）
   - 竖版：内容是否侵入右侧点赞栏安全区、底部 UI 区
   - 曲线是否越出绘图区
2. 发现问题只改 scenes，重出静帧；全部通过后才全量渲染：

```bash
# 横竖两条必须串行！并行渲染会双双僵死（实测两小时零产出）
npx remotion render src/index.ts PhysicsExplain out/video.mp4 --timeout=60000 --concurrency=3 --log=error
npx remotion render src/index.ts PhysicsExplainDouyin out/video_dy.mp4 --timeout=60000 --concurrency=3 --log=error
npx remotion still src/index.ts CoverH out/cover_h.png
npx remotion still src/index.ts CoverV out/cover_v.png
```

3. 渲染期间盯日志：用 `>` 落盘 + 定期看文件大小变化，卡住超过 3 分钟无新帧就停掉重跑（加 `--concurrency=3`）
4. 用 ffprobe 验证产物（时长、分辨率），并抽 1~2 帧成图确认

> 封面渲染用 `still` 命令，`render` 命令不认 `--frame`（会报 flag 错误）。

## 交付

- 横竖版视频 + 两版封面 +（可选）标题/话题/置顶评论建议
- **交付前必须对竖版单独抽 2~3 帧看清晰度**：正文折算字号 < 30px 视为不合格，回去重排
- 告知用户：改文案 → 改 script.json 重跑 gen_audio；改动画 → 改 scenes/仿真重渲染
- 明确告诉用户哪个文件发抖音（`video_dy.mp4` + `cover_v.png`），别只丢一堆文件让人猜
