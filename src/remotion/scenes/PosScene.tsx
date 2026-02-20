import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { MemoryRouter } from "react-router-dom";
import { DemoProvider } from "../../context/DemoContext";
import { FeverPosPage } from "../../components/fever-pos";
import "../../styles/global.css";

export const PosScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 270], [0.92, 1.0], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [250, 270], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fadeIn * fadeOut,
        backgroundColor: "#06232C",
      }}
    >
      {/* Scaled container for the POS — renders at native size then scales down */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 1920,
          height: 1080,
          transform: `translate(-50%, -50%) scale(${scale})`,
          overflow: "hidden",
          borderRadius: 12,
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
        }}
      >
        <MemoryRouter initialEntries={["/box-office"]}>
          <DemoProvider>
            <FeverPosPage />
          </DemoProvider>
        </MemoryRouter>
      </div>
    </AbsoluteFill>
  );
};
