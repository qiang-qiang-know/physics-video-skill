import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { MainDouyin } from "./DouyinMain";
import { CoverH, CoverV } from "./Cover";
import { TIMELINE } from "./lib";
import { W, H, FPS } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PhysicsExplain"
        component={Main}
        durationInFrames={TIMELINE.totalFrames}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="PhysicsExplainDouyin"
        component={MainDouyin}
        durationInFrames={TIMELINE.totalFrames}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition id="CoverH" component={CoverH} durationInFrames={30} fps={FPS} width={1920} height={1080} />
      <Composition id="CoverV" component={CoverV} durationInFrames={30} fps={FPS} width={1080} height={1920} />
    </>
  );
};
