import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from "remotion";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentY = interpolate(frame, [0, 20], [40, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#06232C",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Montserrat, sans-serif",
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          transform: `translateY(${contentY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 600,
            color: "#FFFFFF",
            letterSpacing: "-0.01em",
            textAlign: "center",
          }}
        >
          One POS for every venue
        </div>

        <div
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: "#A7B2BA",
            textAlign: "center",
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          Tickets, seated events, gift shop, F&B — all in one system.
          <br />
          Powered by Fever Zone.
        </div>

        <div style={{ marginTop: 16 }}>
          <Img
            src={staticFile("fever-logo.svg")}
            style={{ width: 160, opacity: 0.7 }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
