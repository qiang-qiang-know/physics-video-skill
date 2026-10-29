import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { MainDouyin } from "./DouyinMain";
import { CoverH, CoverV } from "./Cover";
import { TIMELINE } from "./lib";
import { W, H, FPS } from "./theme";
import { ORIENTATION } from "./question";

/**
 * ★ 只注册所选方向的 Composition（ORIENTATION 在 src/question.ts 里配置）
 *
 * 这是硬约束：用户选了竖版就只注册 PhysicsExplainDouyin + CoverV，
 * 此时误跑 `remotion render ... PhysicsExplain` 会直接报 composition not found，
 * 不会白等几十分钟渲染出一个用不上的版本。
 *
 * 竖版（默认）：PhysicsExplainDouyin（1080×1920）+ CoverV
 * 横版：       PhysicsExplain（1920×1080）+ CoverH
 */
const VERTICAL = ORIENTATION === "vertical";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {!VERTICAL && (
        <Composition
          id="PhysicsExplain"
          component={Main}
          durationInFrames={TIMELINE.totalFrames}
          fps={FPS}
          width={W}
          height={H}
        />
      )}
      {VERTICAL && (
        <Composition
          id="PhysicsExplainDouyin"
          component={MainDouyin}
          durationInFrames={TIMELINE.totalFrames}
          fps={FPS}
          width={1080}
          height={1920}
        />
      )}
      {!VERTICAL && (
        <Composition id="CoverH" component={CoverH} durationInFrames={30} fps={FPS} width={1920} height={1080} />
      )}
      {VERTICAL && (
        <Composition id="CoverV" component={CoverV} durationInFrames={30} fps={FPS} width={1080} height={1920} />
      )}
    </>
  );
};
