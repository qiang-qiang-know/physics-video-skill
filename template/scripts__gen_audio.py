"""生成逐句配音 + 字幕时间轴（edge-tts），输出 src/timeline.json。

通用脚本：只读 scripts/script.json，段数与句数不限。
用法：python scripts/gen_audio.py
依赖：pip install edge-tts；ffprobe 在 PATH 或环境变量 FFPROBE。
"""
import asyncio, json, os, shutil, subprocess

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(ROOT, "public", "audio")


def _valid(p):
    try:
        return p and os.path.isfile(p) and os.path.getsize(p) > 1000
    except OSError:
        return False


def find_ffprobe():
    env = os.environ.get("FFPROBE")
    if _valid(env):
        return env
    # Windows winget 安装 Gyan.FFmpeg 的常见位置（过滤 0 字节坏链）
    import glob
    hits = glob.glob(os.path.expanduser(
        "~/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_*/ffmpeg-*/bin/ffprobe.exe"
    ))
    hits = [h for h in hits if _valid(h)]
    if hits:
        return sorted(hits)[-1]
    w = shutil.which("ffprobe")
    if _valid(w):
        return w
    raise RuntimeError("找不到 ffprobe：请安装 ffmpeg 或设置环境变量 FFPROBE")


FFPROBE = find_ffprobe()
cfg = json.load(open(os.path.join(ROOT, "scripts", "script.json"), encoding="utf-8"))
os.makedirs(AUDIO_DIR, exist_ok=True)

fps = cfg.get("fps", 30)


def probe(path):
    out = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=nw=1:nk=1", path], capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(out.stderr)
    return float(out.stdout.strip())


async def tts(text, voice, rate, path):
    # boundary="WordBoundary" 才有逐字时间戳（默认 SentenceBoundary 没有）
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    words = []
    with open(path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({"t": round(chunk["offset"] / 1e7, 3),
                              "d": round(chunk["duration"] / 1e7, 3),
                              "w": chunk["text"]})
    return words


async def main():
    segs_out = []
    cursor = 0.0
    idx = 0
    for seg in cfg["segments"]:
        if not seg.get("lines"):
            continue
        cursor += cfg["segPadHead"]
        lines_out = []
        for text in seg["lines"]:
            idx += 1
            name = f"l{idx:03d}.mp3"
            path = os.path.join(AUDIO_DIR, name)
            words = await tts(text, cfg["voice"], cfg["rate"], path)
            dur = probe(path)
            lines_out.append({"text": text, "file": f"audio/{name}",
                              "dur": round(dur, 3), "words": words,
                              "start": round(cursor, 3)})
            cursor += dur + cfg["gap"]
            print(f"  [{idx:02d}] {dur:5.2f}s  {text}")
        seg_start = lines_out[0]["start"] - cfg["segPadHead"]
        seg_end = lines_out[-1]["start"] + lines_out[-1]["dur"] + cfg["segPadTail"]
        segs_out.append({"id": seg["id"], "chapter": seg["chapter"],
                         "start": round(seg_start, 3), "end": round(seg_end, 3),
                         "lines": lines_out})
        cursor = seg_end
        print(f"== {seg['id']} {seg_start:.2f} -> {seg_end:.2f}")

    total = cursor
    for s in segs_out:
        s["startFrame"] = round(s["start"] * fps)
        s["frames"] = round((s["end"] - s["start"]) * fps)
        for ln in s["lines"]:
            ln["startFrame"] = round(ln["start"] * fps)
            ln["frames"] = round((ln["dur"] + cfg["gap"]) * fps)
            ln["audioFrames"] = round(ln["dur"] * fps)

    tl = {"fps": fps, "totalFrames": round(total * fps),
          "totalSeconds": round(total, 2), "segments": segs_out}
    out = os.path.join(ROOT, "src", "timeline.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump(tl, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"\n总时长 {total:.1f}s / {tl['totalFrames']} 帧 -> src/timeline.json")
    print("分段帧区间：")
    for s in segs_out:
        print(f"  {s['id']:6s} {s['startFrame']:6d} ~ {s['startFrame'] + s['frames']:6d}")


asyncio.run(main())
