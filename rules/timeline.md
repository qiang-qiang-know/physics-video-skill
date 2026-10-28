# 旁白驱动时间轴架构（音画同步的核心）

## 原则：旁白时长决定画面节奏，永远不要反过来

不要先做动画再配音。流程是：

```
script.json（逐句文案）
  → gen_audio.py：逐句 TTS + ffprobe 实测时长 + word boundary 逐字时间戳
  → src/timeline.json：每段/每句的精确秒数与帧号
  → 场景组件用 lineAt(seg, i) 锚定画面变化
```

这样换音色、调语速、改文案后重跑一遍，画面自动跟随，音画永不脱节。

## script.json 格式

```json
{
  "voice": "zh-CN-YunxiNeural",
  "rate": "+6%",
  "gap": 0.18,
  "segPadHead": 0.35,
  "segPadTail": 0.55,
  "segments": [
    { "id": "q", "chapter": "第 1 部分 · 读懂题目", "lines": ["第一句。", "第二句。"] },
    { "id": "a", "chapter": "第 3 部分 · 选项 A 解析", "lines": ["..."] }
  ]
}
```

- `id`：段的标识，场景组件按它分发（q/model/a/b/c/d/sum 或 s1/s2…）
- `chapter`：顶部标题栏文字
- `voice` 候选：zh-CN-YunxiNeural（男，讲解感）、zh-CN-XiaoyiNeural（女）、zh-CN-YunyangNeural（男，播音）
- `rate` 建议 +6%~+10%，太慢会拖

## timeline.json 产物结构

```jsonc
{
  "fps": 30, "totalFrames": 7006, "totalSeconds": 233.5,
  "segments": [{
    "id": "a", "chapter": "...", "start": 96.2, "end": 128.9,
    "startFrame": 2886, "frames": 981,
    "lines": [{                       // 每句：帧号 + 逐字时间戳
      "text": "...", "file": "audio/l014.mp3",
      "startFrame": 2900, "frames": 142, "audioFrames": 128,
      "words": [{ "t": 0.12, "d": 0.09, "w": "选" }, ...]
    }]
  }]
}
```

## 组件侧的锚定 API（lib.ts，已内置）

- `lineAt(seg, i)` / `lineEnd(seg, i)`：段内第 i 句的起/止帧（相对段起点）
- `lineProgress(seg, frame, i)`：第 i 句内进度 0..1
- `enter(frame, startFrame, dur)`：入场动画 0..1
- `key(frame, frames, values)`：关键帧插值
- `sampleAt(t)`：按时间取仿真采样点
- 字幕组件 `Subtitle`/`Karaoke` 自动读当前句并逐字高亮，无需手写

## 段的衔接

- 相邻段的 Sequence 用"下一段起点 - 本段起点"作为时长（无重叠无缝隙），Main.tsx 已处理
- 每段内部用 `SceneFade` 淡入（Main.tsx 已处理）
- 每段头尾的 segPadHead/segPadTail 是留给画面先行的呼吸空间：**画面变化比旁白早 ~0.35s 开始**

## 注意

- edge-tts 必须传 `boundary="WordBoundary"` 才有逐字时间戳（默认 SentenceBoundary 没有）
- 逐句 mp3 放 `public/audio/`，Remotion 里用 `staticFile(ln.file)` 引用
- 每句音频 Sequence 的时长是 `audioFrames + 2`，防止句尾被裁
