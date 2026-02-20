/**
 * B2BS-933 / B2BS-935 / B2BS-936 — Membership Pricing
 *
 * Demonstrates:
 *  - Member identification modal (QR + manual input)
 *  - Member pill in header (name + tier badge + role icon)
 *  - Crown indicators on tiles and category chips
 *  - Strikethrough pricing in cart with crown icon
 *
 * Timeline (local frames at 30fps):
 *   0–74    Title card
 *   75–224  Product grid showing crown badges on tiles + callout
 *   225–404 Cart with member pricing (strikethrough + crown) + callouts
 *   405–449 Fade out
 */
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { TitleCard } from "../components/TitleCard";
import { Callout } from "../components/Callout";
import { ProductGrid } from "../../components/fever-pos/ProductGrid";
import { CartItem } from "../../components/fever-pos/CartItem";
import type { Product, CartItemData } from "../../data/feverPosData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faStar, faXmark } from "@fortawesome/free-solid-svg-icons";
import "../../styles/global.css";

// ----- Fixture data -----

const MEMBER_PRODUCTS: Product[] = [
  {
    id: "t-vip",
    name: "VIP Experience",
    price: 55.0,
    memberPrice: 44.0,
    type: "ticket",
    categoryId: "experiences",
    tab: "tickets",
  },
  {
    id: "t-std",
    name: "General Admission",
    price: 28.0,
    memberPrice: 22.0,
    type: "ticket",
    categoryId: "tickets",
    tab: "tickets",
  },
  {
    id: "t-tour",
    name: "Guided Tour",
    price: 35.0,
    type: "ticket",
    categoryId: "experiences",
    tab: "tickets",
  },
  {
    id: "s-mug",
    name: "Museum Mug",
    price: 12.0,
    memberPrice: 9.6,
    type: "retail",
    categoryId: "souvenirs",
    tab: "shop",
  },
  {
    id: "s-hat",
    name: "Exhibition Cap",
    price: 18.0,
    type: "retail",
    categoryId: "clothing",
    tab: "shop",
  },
  {
    id: "s-print",
    name: "Art Print",
    price: 24.99,
    memberPrice: 19.99,
    type: "retail",
    categoryId: "souvenirs",
    tab: "shop",
  },
];

const CART_ITEMS_WITH_MEMBER: CartItemData[] = [
  {
    id: "ci-1",
    productId: "t-vip",
    name: "VIP Experience",
    price: 44.0,
    originalPrice: 55.0,
    quantity: 2,
    bookingFee: 0.6,
  },
  {
    id: "ci-2",
    productId: "t-std",
    name: "General Admission",
    price: 22.0,
    originalPrice: 28.0,
    quantity: 1,
    bookingFee: 0.6,
  },
  {
    id: "ci-3",
    productId: "s-mug",
    name: "Museum Mug",
    price: 9.6,
    originalPrice: 12.0,
    quantity: 1,
  },
];

// ----- Sub-scenes -----

const TIER_COLOR = "#B8860B";

const MemberPillDemo: React.FC = () => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#F0F4F7",
      borderRadius: 64,
      padding: "6px 12px 6px 10px",
      fontFamily: "Montserrat, sans-serif",
      fontSize: 14,
      fontWeight: 600,
      color: "#06232C",
    }}
  >
    <FontAwesomeIcon icon={faAddressCard} style={{ color: "#0089E3", fontSize: 16 }} />
    <span>Anderson Collingwood</span>
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        color: TIER_COLOR,
        border: `1.5px solid ${TIER_COLOR}`,
        borderRadius: 64,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <FontAwesomeIcon icon={faStar} style={{ fontSize: 10 }} />
      Gold
    </span>
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: "50%",
        color: "#788890",
        fontSize: 11,
        cursor: "pointer",
      }}
    >
      <FontAwesomeIcon icon={faXmark} />
    </span>
  </div>
);

const GridWithCrownBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: fadeIn }}>
      {/* Member pill at the top */}
      <div style={{ padding: "36px 48px 0" }}>
        <div
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#788890",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Identified Member
        </div>
        <MemberPillDemo />
      </div>

      <div style={{ padding: "24px 48px 48px" }}>
        <div
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#788890",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Product Grid — Member Active
        </div>
        <ProductGrid
          products={MEMBER_PRODUCTS}
          onProductClick={() => {}}
          isMemberActive
        />
      </div>

      <Callout
        text={"AC: Member pill shows name + tier badge (Gold) + star icon for primary member"}
        x={520}
        y={30}
        appearAt={20}
        width={380}
      />

      <Callout
        text={"AC: Tiles with member pricing show yellow corner badge with crown icon"}
        x={500}
        y={310}
        appearAt={55}
        width={360}
      />

      <Callout
        text={"Guided Tour & Cap have no member pricing → no crown"}
        x={900}
        y={310}
        appearAt={90}
        width={300}
      />
    </AbsoluteFill>
  );
};

const CartWithMemberBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#06232C", opacity: fadeIn }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 440,
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "24px 0",
          boxShadow: "0 16px 64px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: "#788890",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "0 20px",
            marginBottom: 16,
          }}
        >
          Cart — Member Pricing Active
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 20px" }}>
          {CART_ITEMS_WITH_MEMBER.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onIncrement={() => {}}
              onDecrement={() => {}}
              onSetQuantity={() => {}}
              onRemove={() => {}}
              isMemberActive
            />
          ))}
        </div>
      </div>

      <Callout
        text={"AC: Strikethrough original price + member price + crown icon on eligible items"}
        x={1000}
        y={350}
        appearAt={30}
        width={380}
      />

      <Callout
        text={"AC: Mid-transaction identification retroactively updates all eligible items"}
        x={1000}
        y={530}
        appearAt={75}
        width={380}
      />
    </AbsoluteFill>
  );
};

// ----- Main composition -----

export const MemberStoryScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={75}>
        <TitleCard
          storyId="B2BS-933 / 935 / 936"
          title="Membership Pricing"
          epicLabel="Epic 5 — Member Identification, Crown Indicators, Cart Pricing"
        />
      </Sequence>

      <Sequence from={75} durationInFrames={150}>
        <GridWithCrownBeat />
      </Sequence>

      <Sequence from={225} durationInFrames={180}>
        <CartWithMemberBeat />
      </Sequence>

      <Sequence from={405} durationInFrames={45}>
        <FadeOut />
      </Sequence>
    </AbsoluteFill>
  );
};

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 45], [1, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#06232C", opacity }} />;
};
