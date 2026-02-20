import { useCurrentFrame, interpolate } from "remotion";

interface CalloutProps {
  text: string;
  x: number;
  y: number;
  /** Frame (local to parent Sequence) when the callout appears */
  appearAt?: number;
  /** Frame when the callout disappears; omit to keep it visible */
  disappearAt?: number;
  /** Anchor side for the callout arrow. Default "left" */
  anchor?: "left" | "right" | "top" | "bottom";
  width?: number;
}

export const Callout: React.FC<CalloutProps> = ({
  text,
  x,
  y,
  appearAt = 0,
  disappearAt,
  width = 320,
}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [appearAt, appearAt + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleIn = interpolate(frame, [appearAt, appearAt + 12], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut =
    disappearAt != null
      ? interpolate(frame, [disappearAt, disappearAt + 10], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: fadeIn * fadeOut,
        transform: `scale(${scaleIn})`,
        transformOrigin: "left center",
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "rgba(0, 137, 227, 0.92)",
          color: "#FFFFFF",
          padding: "10px 18px",
          borderRadius: 10,
          fontSize: 17,
          fontWeight: 600,
          fontFamily: "Montserrat, sans-serif",
          lineHeight: 1.4,
          width,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </div>
    </div>
  );
};
