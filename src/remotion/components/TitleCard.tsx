import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface TitleCardProps {
  storyId: string;
  title: string;
  epicLabel?: string;
}

export const TitleCard: React.FC<TitleCardProps> = ({
  storyId,
  title,
  epicLabel,
}) => {
  const frame = useCurrentFrame();

  const badgeOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [10, 30], [20, 0], {
    extrapolateRight: "clamp",
  });

  const epicOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#06232C",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            opacity: badgeOpacity,
            background: "#0089E3",
            color: "#FFFFFF",
            padding: "6px 20px",
            borderRadius: 64,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          {storyId}
        </div>

        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: 44,
            fontWeight: 600,
            color: "#FFFFFF",
            textAlign: "center",
            maxWidth: 900,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>

        {epicLabel && (
          <div
            style={{
              opacity: epicOpacity,
              fontSize: 18,
              fontWeight: 400,
              color: "#788890",
            }}
          >
            {epicLabel}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
