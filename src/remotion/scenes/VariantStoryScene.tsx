/**
 * B2BS-930 — Variant tile and picker
 *
 * Demonstrates:
 *  - Variant tiles showing "from" + lowest price
 *  - VariantPicker modal with axis label and per-variant prices
 *  - Out-of-stock variant greyed out
 *  - Cart line with variant label
 *
 * Timeline (local frames at 30fps):
 *   0–74    Title card
 *   75–194  Product grid with variant tiles + callout
 *   195–344 VariantPicker modal + callout
 *   345–464 Cart item with variant label + callout
 *   465–509 Fade out
 */
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { TitleCard } from "../components/TitleCard";
import { Callout } from "../components/Callout";
import { ProductGrid } from "../../components/fever-pos/ProductGrid";
import { VariantPicker } from "../../components/fever-pos/VariantPicker";
import { CartItem } from "../../components/fever-pos/CartItem";
import type { Product, CartItemData } from "../../data/feverPosData";
import "../../styles/global.css";

// ----- Fixture data: products for the grid -----

const GRID_PRODUCTS: Product[] = [
  { id: "s-1", name: "HMS Victory Model", price: 24.99, type: "retail", categoryId: "souvenirs", tab: "shop" },
  { id: "s-2", name: "Fridge Magnet", price: 4.5, type: "retail", categoryId: "souvenirs", tab: "shop" },
  {
    id: "s-9",
    name: "Navy T-Shirt",
    price: 18.0,
    type: "retail",
    categoryId: "clothing",
    tab: "shop",
    variantAxes: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
    variants: [
      { id: "s-9-s", parentProductId: "s-9", sku: "NAV-TSH-S", attributes: { Size: "S" }, label: "S" },
      { id: "s-9-m", parentProductId: "s-9", sku: "NAV-TSH-M", attributes: { Size: "M" }, label: "M" },
      { id: "s-9-l", parentProductId: "s-9", sku: "NAV-TSH-L", attributes: { Size: "L" }, label: "L" },
      { id: "s-9-xl", parentProductId: "s-9", sku: "NAV-TSH-XL", attributes: { Size: "XL" }, label: "XL" },
    ],
  },
  { id: "s-10", name: "Cap", price: 12.0, type: "retail", categoryId: "clothing", tab: "shop" },
  {
    id: "s-11",
    name: "Hoodie",
    price: 35.0,
    type: "retail",
    categoryId: "clothing",
    tab: "shop",
    variantAxes: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
    variants: [
      { id: "s-11-s", parentProductId: "s-11", sku: "HOOD-S", attributes: { Size: "S" }, label: "S" },
      { id: "s-11-m", parentProductId: "s-11", sku: "HOOD-M", attributes: { Size: "M" }, label: "M" },
      { id: "s-11-l", parentProductId: "s-11", sku: "HOOD-L", attributes: { Size: "L" }, label: "L" },
      { id: "s-11-xl", parentProductId: "s-11", sku: "HOOD-XL", attributes: { Size: "XL" }, label: "XL" },
    ],
  },
  { id: "s-12", name: "Scarf", price: 15.0, type: "retail", categoryId: "clothing", tab: "shop" },
];

const VARIANT_PRODUCT = GRID_PRODUCTS[2]; // Navy T-Shirt

const VARIANT_CART_ITEM: CartItemData = {
  id: "ci-variant-demo",
  productId: "s-9",
  name: "Navy T-Shirt",
  price: 18.0,
  quantity: 1,
  variantId: "s-9-m",
  variantLabel: "M",
};

// ----- Sub-scenes -----

const GridBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: fadeIn }}>
      <div style={{ padding: 48 }}>
        <div
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: "#788890",
            marginBottom: 12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Gift Shop — Product Grid
        </div>
        <ProductGrid products={GRID_PRODUCTS} onProductClick={() => {}} />
      </div>

      {/* Callout pointing at the Navy T-Shirt tile's "from" price */}
      <Callout
        text={'AC: Variant tiles show "from" + lowest variant price'}
        x={500}
        y={280}
        appearAt={30}
        width={340}
      />

      {/* Second callout for the Hoodie tile */}
      <Callout
        text={'Hoodie also shows "from €35.00" — tapping opens the picker'}
        x={900}
        y={280}
        appearAt={60}
        width={300}
      />
    </AbsoluteFill>
  );
};

const PickerBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1a", opacity: fadeIn }}>
      {/* Render the VariantPicker standalone — it normally sits on a backdrop */}
      <VariantPicker
        product={VARIANT_PRODUCT}
        onSelectVariant={() => {}}
        onClose={() => {}}
        variantPrices={{
          "s-9-s": 18.0,
          "s-9-m": 18.0,
          "s-9-l": 20.0,
          "s-9-xl": 22.0,
        }}
        variantStock={{
          "s-9-s": 5,
          "s-9-m": 12,
          "s-9-l": 3,
          "s-9-xl": 0, // out of stock!
        }}
      />

      <Callout
        text={'AC: Picker shows product name, axis label ("Select Size"), pill per variant with price'}
        x={1050}
        y={320}
        appearAt={25}
        width={360}
      />

      <Callout
        text={"AC: Out-of-stock variants (XL) greyed out and disabled"}
        x={1050}
        y={510}
        appearAt={60}
        width={340}
      />
    </AbsoluteFill>
  );
};

const CartBeat: React.FC = () => {
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
          Cart
        </div>

        <div style={{ padding: "0 20px" }}>
          <CartItem
            item={VARIANT_CART_ITEM}
            onIncrement={() => {}}
            onDecrement={() => {}}
            onSetQuantity={() => {}}
            onRemove={() => {}}
          />
        </div>
      </div>

      <Callout
        text={"AC: Each variant is a distinct cart line with a grey variant-label pill below the product name"}
        x={1020}
        y={420}
        appearAt={25}
        width={380}
      />
    </AbsoluteFill>
  );
};

// ----- Main composition -----

export const VariantStoryScene: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Beat 0: Story title card — 2.5s */}
      <Sequence from={0} durationInFrames={75}>
        <TitleCard
          storyId="B2BS-930"
          title="Variant Tile & Picker"
          epicLabel="Epic 4 — Product Variants"
        />
      </Sequence>

      {/* Beat 1: Product grid showing "from" pricing — 4s */}
      <Sequence from={75} durationInFrames={120}>
        <GridBeat />
      </Sequence>

      {/* Beat 2: VariantPicker with OOS state — 5s */}
      <Sequence from={195} durationInFrames={150}>
        <PickerBeat />
      </Sequence>

      {/* Beat 3: Cart item with variant label — 4s */}
      <Sequence from={345} durationInFrames={120}>
        <CartBeat />
      </Sequence>

      {/* Beat 4: Fade out — 1.5s */}
      <Sequence from={465} durationInFrames={45}>
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
