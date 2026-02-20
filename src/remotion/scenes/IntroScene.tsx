import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from "remotion";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  const logoOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 25], [0.85, 1], {
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [20, 45], [30, 0], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#06232C",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Montserrat, sans-serif",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <Img
          src={staticFile("fever-logo.svg")}
          style={{
            width: 280,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
          }}
        />

        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: 52,
            fontWeight: 600,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}
        >
          Introducing Fever POS
        </div>

        <div
          style={{
            opacity: subtitleOpacity,
            fontSize: 22,
            fontWeight: 400,
            color: "#A7B2BA",
            letterSpacing: "0.02em",
          }}
        >
          Unified ticketing, retail, and F&B — one touchscreen
        </div>
      </div>
    </AbsoluteFill>
  );
};
