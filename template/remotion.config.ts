import { Config } from "@remotion/cli/config";
import { existsSync } from "fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// 16 逻辑核（Ryzen 7 6800H 实测基准）：并发 4 → 10，渲染提速约 2 倍
Config.setConcurrency(10);
Config.setChromiumOpenGlRenderer("angle");
// x264 veryfast 编码档：编码耗时约为默认 medium 的一半，1080p 讲解视频画质差异可忽略
Config.setX264Preset("veryfast");

// 浏览器选择（按顺序探测）：
// 1) 项目内 browsers/chrome-win64/chrome.exe —— 推荐下载 Chrome for Testing：
//    curl -o chrome.zip https://registry.npmmirror.com/-/binary/chrome-for-testing/138.0.7204.94/win64/chrome-win64.zip
//    解压到 <项目>/browsers/ 下（国内可直连，Google CDN 不通也没关系）
// 2) 本机 Edge —— 注意 Edge 156+ 无头模式可能秒退（exit 0），此时必须用方案 1
const candidates = [
  "browsers/chrome-win64/chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const browser = candidates.find((p) => existsSync(p));
if (browser) {
  Config.setBrowserExecutable(browser);
}
// Chrome for Testing（Chromium 132+）必须用 new headless：
Config.setChromeMode("chrome-for-testing");
