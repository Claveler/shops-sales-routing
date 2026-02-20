import { Composition } from "remotion";
import { ProductVideo } from "./Video";
import { VariantStoryScene } from "./scenes/VariantStoryScene";
import { MemberStoryScene } from "./scenes/MemberStoryScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Full product video (intro + stories + outro) */}
      <Composition
        id="ProductVideo"
        component={ProductVideo}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Individual story compositions — preview and render independently */}
      <Composition
        id="B2BS-930-Variants"
        component={VariantStoryScene}
        durationInFrames={510}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="B2BS-933-Membership"
        component={MemberStoryScene}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
