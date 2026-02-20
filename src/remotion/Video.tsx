import { AbsoluteFill, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { IntroScene } from "./scenes/IntroScene";
import { PosScene } from "./scenes/PosScene";
import { VariantStoryScene } from "./scenes/VariantStoryScene";
import { MemberStoryScene } from "./scenes/MemberStoryScene";
import { OutroScene } from "./scenes/OutroScene";

loadFont("normal", { weights: ["400", "600"] });

/**
 * Full product video combining all scenes.
 *
 * Timeline:
 *   0–89     Intro (3s)
 *   90–359   POS overview (9s)
 *   360–869  B2BS-930 Variant story (17s)
 *   870–1319 B2BS-933 Membership story (15s)
 *   1320–1349 Outro (1s fade, shared with membership outro)
 */
export const ProductVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#06232C" }}>
      <Sequence from={0} durationInFrames={90}>
        <IntroScene />
      </Sequence>

      <Sequence from={90} durationInFrames={270}>
        <PosScene />
      </Sequence>

      <Sequence from={360} durationInFrames={510}>
        <VariantStoryScene />
      </Sequence>

      <Sequence from={870} durationInFrames={450}>
        <MemberStoryScene />
      </Sequence>

      <Sequence from={1320} durationInFrames={30}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
