# Product Spec: Fever POS (One-Stop Shop)

This document is the consolidated product specification for the **Fever POS**, previously known as the One-Stop Shop (OSS). It draws from the *One-Stop Shop PRD*, live Fever Zone POS exploration, and the Figma redesign.

---

## 1. Overview

### What It Is

The Fever POS is a touchscreen-first Point of Sale interface within Fever Zone that allows front-of-house staff to process **unified transactions** for tickets, F&B (food and beverage), and retail merchandise in a single checkout flow.

### Problem It Solves

Before the Fever POS, partners who needed to sell tickets alongside F&B and retail items used a Square POS for non-ticket sales, then manually issued tickets through Fever Zone after the customer paid. This approach:

1. **Slows down onsite sales**: Staff must operate two separate systems per transaction.
2. **Complicates staff training**: New hires need to learn both Square and Fever Zone workflows.
3. **Risks double-counting**: Manual ticket issuance after a Square transaction creates reconciliation problems.
4. **Under-utilizes Fever Zone**: Shift management, reporting, and other capabilities are bypassed for non-ticket sales.

### What It Enables

- **Single transaction**: Tickets, F&B, and merchandise purchased together in one checkout.
- **Unified reporting**: All onsite sales consolidated within Fever Zone for centralized analytics.
- **Simpler staff workflow**: One interface for all product types, reducing training time and errors.
- **Real-time inventory**: Stock levels synced with external inventory systems (Square).
- **Stronger partner value proposition**: Native POS capabilities make Fever compelling for partners with significant retail/F&B revenue (museums with gift shops, sporting venues, theatres, theme parks, etc.).

---

## 2. Key Features

1. **Touchscreen POS Interface**: A touchscreen-first grid interface designed for speed and muscle memory.
2. **Product Scanning**: Products can be added to a cart by scanning their SKU/GTIN.
3. **Navigable Categories**: Products organized into navigable categories accessible via a breadcrumbs path.
4. **Large Catalog Support**: Capacity to handle catalogs much larger than the actual capabilities.
5. **Variant Handling**: Products with variants (e.g., t-shirt sizes S, M, L) can be selected in the UI.
6. **Unified Checkout**: A single checkout process handles tickets, F&B, and merchandise.
7. **Real-time Inventory Syncing**: Inventory synced in real-time with external systems (initially Square).
8. **Payment Gateway Integration**: Integrates with onsite payment gateways (e.g., Adyen).
9. **Centralized Reporting**: All onsite transactions consolidated for centralized reporting.
10. **Scalability**: Designed to support future integrations beyond Square.

---

## 3. Target Hardware

The Fever POS is designed for the **iMin Swan 1 Pro** dual-screen device:

| Property | Value |
|----------|-------|
| Pixel resolution | 1920 x 1080 px |
| Effective resolution (dp) | 1397 x 786 px |
| Form factor | Dual-screen countertop POS |
| Input | Touchscreen-first |

The customer-facing display (second screen) is planned for a future phase. After the initial launch, the UI will be optimized for mobile devices (Adyen mobile POS, iMin handheld validation devices).

---

## 4. Page Layout

The Fever POS is a full-screen interface that renders **outside** the standard Fever Zone layout (no sidebar). It has its own header and occupies the entire viewport.

```
+-------------------------------------------------------+
|  Header (72px, dark #06232C)                           |
|  [Hamburger] [fever ZONE]     [Date/Time] [Start Shift] [User] |
+-------------------------------------------------------+
|  Main Content Area                    |  Cart Panel    |
|  +--------------------------------+   |  (400px)       |
|  | Navigation Tabs                |   |                |
|  | [Event Name] [Meals] [Shop]   |   |  Cart          |
|  +--------------------------------+   |  Clear all     |
|  | Category Filters / Breadcrumbs |   |                |
|  | [Gift Aid] [Non Gift Aid] ... |   |  Event groups  |
|  +--------------------------------+   |  with items    |
|  |                                |   |                |
|  |  Product Tile Grid             |   |  Products      |
|  |  (responsive columns)          |   |                |
|  |                                |   |  Total         |
|  |                                |   |  Discount      |
|  |                                |   |  [Cash] [Card] |
|  +--------------------------------+   +----------------+
+-------------------------------------------------------+
```

### Header

- Dark background (`#06232C`)
- Height: 72px (matches `--fz-header-height`)
- Header parity with standard Fever Zone: same hamburger control, same Fever Zone logo asset, and same user identity block (name, profile icon, and partner/org)
- POS difference: sidebar is collapsed for Box Office context and a dedicated shifts widget appears (date/time + "Start shift")
- The date/time banner has a muted background (`#F2F3F3`) with a shadow overlay

### Main Content Area

Occupies all horizontal space left of the cart panel. Contains:

- **Navigation Tabs** at the top
- **Folder-like tab connection**: the active event tab is visually connected to the content panel below (shared border seam), creating a folder-style container
- **Folder frame spacing**: the connected tab+panel block is inset with horizontal and bottom padding so it does not touch the outer viewport/container edges
- **Background palette**: page background `#F8F9F9`; folder surface (active tab + panel) `#FFFFFF`
- **Tab sizing model**: only the event tab uses the expanded active width; `Meal Deals` and `Shop` keep compact active widths
- **Tab rail alignment**: all nav tabs share a consistent 48px rail height/baseline across active and inactive states to prevent visual jumps when switching tabs
- **Top-row stability**: right-side action controls stay anchored while switching tabs; tab activation does not push or collapse the row
- **Utility icon buttons** on the right of tabs: contacts and search as circular (44px) outlined buttons
- **Top navigation row below tabs**: a compact row that switches between explode pipes (root) and breadcrumbs (nested)
- **Explode pipes spacing**: the category-filter row ("Gift Aid", "Non Gift Aid", "Groups", etc.) sits close to the top of the folder panel with a compact top inset, matching the Figma density
- **Home icon in nav row**: a house button is always shown before chips/breadcrumbs; it is disabled at root and enabled while nested
- **Calendar utility button** beside category filters is Tickets-only (circular 44px, blue icon style) and is hidden in Gift Shop
- **Control alignment to folder border**: top-right utility buttons are right-aligned to the folder outer border line; the calendar button is right-aligned to the inner tile area edge below
- **Circular control borders**: utility circle buttons use a thicker border stroke to match Figma
- **Product Tile Grid** filling the remaining space
- **Event thumbnail consistency**: the ticket tab header and cart event rows use the same event thumbnail image source

### Cart Panel

- Fixed width: 400px
- Right side of the viewport
- Separated from main content by a left border
- Contains: cart header, scrollable item list, sticky footer with totals and payment buttons

---

## 5. Navigation Tabs

The POS now uses two primary tabs: `Tickets & Add-Ons` and `Gift Shop`.

### Tickets & Add-Ons Tab

- **Purpose**: Sell tickets to the selected event and related ticket upgrades (entry priority, flexible changes, premium access, experiential upgrades)
- **Event-specific catalog**: ticket and add-on products are not shared globally; changing the active event swaps in that event's own ticket/add-on set
- **Event title marquee**: If the selected event name overflows, it auto-scrolls horizontally back-and-forth once when POS opens at a slower, readable pace, then returns to the truncated state; tapping the event name replays that single run.
- **Left sidebar**: Date picker + timeslot selector (calendar, day pills, morning/afternoon slots with availability counts)
- **Top-level category behavior varies by event**:
  - some events expose explode-pipe chips (e.g., `General Admission`, `VIP Experience`, `Premium`)
  - others show all tickets and add-ons directly with no top-level chips
- **Add-on placement rule**: add-ons are assigned to the primary/high-volume first-level group when categories exist (usually `General Admission`-style categories)
- **Add-on scope rule**: ticket-tab add-ons must be ticket/experience upgrades only; physical inventory items belong in `Gift Shop` (retail tab)
- **Calendar control**: shown in the top-right of the filter row only in Tickets & Add-Ons (timeslot/date concept)
- **Grid**: Ticket tiles (blue stripe `#0089E3`) and add-on tiles (orange stripe `#FF8C00`)
- **Event selector**: Dropdown at top showing which event/plan is being sold (e.g., "Candlelight: Tribute to Taylor Swift")
- **Event edit modal**: tapping the edit icon on the event tab opens a centered modal (`Select your event`) with:
  - city chips under **Select the city**
  - event cards under **Select the event** (thumbnail, event title, venue)
  - `Cancel` and `Change event` actions
  - typography aligned to the POS base scale (16px body/event text, 14px section labels, 16px modal title) for consistency with the rest of the UI
- **Data source for modal options**: city chips and event cards are generated from loaded Sales Routing events (via `getSalesRoutings()` + event lookup), so the selector only shows currently loaded routing cities/events (currently Madrid and Barcelona in demo data)
- **Event switch behavior**: confirming `Change event` updates the active tickets event context shown on the top tab and is used as the default event metadata when creating a new ticket event group in cart state
- **Per-event thumbnails**: each event uses its own thumbnail image (not a shared placeholder) in the event tab, event-selection modal, and cart event headers

### Gift Shop Tab

- **Purpose**: Sell products from the same catalog/hierarchy source used in Catalog Integration's Products view
- **No calendar sidebar**: Full-width grid
- **No calendar control in top row**: Gift Shop does not show the calendar icon/button
- **Root state nav**: top row shows disabled home icon + explode pipes for top-level categories (e.g., Apparel, Books, Home & Living)
- **Nested category navigation**: second/third level categories appear as tiles with purple left indicator stripe; tapping drills into that category view
- **Nested state nav**: once drilled into category depth, explode pipes are hidden and replaced by breadcrumbs in the same top row; home icon becomes clickable and returns to root
- **Leaf product tiles**: retail product tiles remain green and add items to the cart
- **Breadcrumb interaction**: clicking an ancestor breadcrumb trims the category path back to that level

---

## 6. Product Tile Specifications

These specifications are extracted from the **live Fever Zone POS production CSS** (February 2026).

### Tile Container

```css
.tile {
  position: relative;
  display: flex;
  flex-direction: row;        /* stripe | main */
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  aspect-ratio: 13 / 7;       /* KEY: responsive sizing, not fixed height */
  background: #fff;
  border: 1px solid #ccd2d8;
  border-radius: 4px;
  box-shadow: 0 3px 3px rgba(0, 70, 121, 0.06);
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  text-align: start;
  box-sizing: border-box;
}
```

- The tile is a `flex-direction: row` container with two children: the color stripe and the main content area.
- `aspect-ratio: 13/7` makes tiles scale fluidly with their container width. At a typical 249px width, this yields ~134px height.

### Color Stripe

The left-edge stripe is a **flex child** (not absolutely positioned). It is rendered as a `::before` pseudo-element in production, but can also be a `<div>`.

```css
.stripe {
  display: block;
  width: 0.5rem;    /* 8px */
  height: 100%;
  flex-shrink: 0;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
```

### Stripe Colors by Tile Type

| Tile Type | CSS Class | Color | Hex |
|-----------|-----------|-------|-----|
| Ticket (session) | `tile--session` | Blue | `#0089E3` |
| Add-on | `tile--addon` | Orange | `#FF8C00` |
| Retail / non-ticket product tiles | `tile--product` | Green | `#24A865` |

### Main Content Area

```css
.tile__main {
  padding: 0.5rem;      /* 8px all sides */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
```

### Typography

**Product name** (top of tile):

```css
.tile__name {
  width: 100%;
  font: 400 1rem / 1.5rem Montserrat, sans-serif;   /* 16px / 24px */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**Price** (bottom-left of tile):

```css
.tile__price {
  font: 400 1rem / 1 Montserrat, sans-serif;   /* 16px / 16px */
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
```

### Bottom Section

The bottom of the tile contains the price on the left and a category icon on the right:

```css
.tile__bottom-content {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: space-between;
  align-self: stretch;
  align-items: flex-end;
}
```

### Hover / Focus States

```css
.tile:not(.tile--disabled):hover {
  border-color: #0068b0;    /* primary-700 */
}

.tile:not(.tile--disabled):focus-visible {
  border-color: #0068b0;
  outline: rgba(0, 137, 227, 0.32) solid 4px;
}
```

### Ripple Effect

Production tiles have a material-design-style ripple animation on click:

```css
.tile__ripple--active {
  animation: tile-ripple 0.4s linear forwards;
}

@keyframes tile-ripple {
  0%   { width: 0; height: 0; opacity: 0.5; }
  100% { width: 500px; height: 500px; opacity: 0; }
}
```

---

## 7. Responsive Grid Behavior

The tile grid uses CSS Grid with `auto-fill` and `minmax` for fully fluid column layout.

### Grid CSS (from production)

```css
/* Base (mobile-first) */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(max(9rem, 34%), 1fr));
  grid-auto-rows: minmax(7rem, auto);    /* 112px minimum row height */
  gap: 0.75rem;                          /* 12px */
  width: 100%;
  box-sizing: border-box;
  min-height: 0;
}

/* Screens >= 576px */
@media (min-width: 576px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));  /* 208px min */
    align-content: start;
  }
}
```

### How It Works

- `minmax(13rem, 1fr)` means each column is at least 208px wide but can grow to fill available space equally.
- `auto-fill` creates as many columns as fit in the container width.
- At 1580px viewport width: Tickets tab shows **3 columns** (due to the calendar sidebar), Retail tab shows **4 columns** (full width).
- At narrower viewports, the grid automatically drops to fewer columns.
- `grid-auto-rows: minmax(7rem, auto)` sets a minimum row height of 112px but allows rows to grow if tile content requires it.
- Combined with `aspect-ratio: 13/7` on each tile, the tiles maintain their proportions as the grid scales.

### Column Count by Container Width (approximate)

| Container Width | Columns | Tile Width |
|-----------------|---------|------------|
| ~500px | 2 | ~244px |
| ~720px | 3 | ~232px |
| ~940px | 4 | ~226px |
| ~1150px | 5 | ~222px |

---

## 8. Cart Panel

The cart panel occupies the right side of the POS interface.

### Structure

- **Header**: "Cart" title + "Clear all" link (danger-red text)
- **Scrollable body**: Event-grouped items and standalone product items
- **Sticky footer**: Total, discount link, and payment buttons
- **Surfaces**: cart panel background `#FFFFFF`; cart item cards `#FAFBFB`
- **Empty state**: centered receipt icon in a 60px area + text "The cart is empty" in subtle `18px/24px` heading style with 16px icon/text gap

### Event-Grouped Cart Items

Ticket and add-on items are grouped by event:

- **Event header**: Event image placeholder, event name (bold), location (with map-pin icon), trash icon, expand/collapse chevron
- **Expanded body**: Date row (calendar icon + date + location), list of cart item rows
- **Cart item row**: Item name (max 2 lines, semibold), price row (strikethrough original price + current price + optional crown icon for premium), booking fee line, quantity controls

### Quantity Controls

- **Decrement/Remove button**: Pink circular button (36px) with trash icon; decrements quantity or removes item when quantity is 1
- **Quantity display**: Number centered between buttons
- **Increment button**: Blue circular button (36px) with plus icon

### Products Section

Non-ticket items (F&B, retail) listed separately under a "Products" heading with a box icon.

### Footer

- **Total row**: "Total (N items)" left-aligned, total amount right-aligned (18px semibold)
- **Discount link**: "Select discount type" right-aligned (12px, primary blue)
- **Currency display**: POS prices are displayed in euros (`€`) for consistency with Sales Routing and Catalog Integration
- **Payment buttons**: Two pill-shaped buttons side-by-side:
  - **Cash**: White background, gray border, wallet icon
  - **Card**: Primary blue background, white text, credit card icon

---

## 9. Category System

### Navigable Categories (Retail Tab)

Products in the Retail tab are organized into a navigable category tree imported from the external inventory system (Square). The hierarchy is displayed via:

1. **Breadcrumb path**: Shows the current navigation depth (e.g., Home > Books > Guide Book)
2. **Category tiles**: Parent categories displayed as tiles with a **purple stripe** (`#AE92ED`). Clicking a category tile navigates deeper into the hierarchy.
3. **Product tiles**: Leaf products displayed as tiles with a **green stripe** (`#24A865`). Clicking adds the product to the cart.

### Category Tiles vs Product Tiles

| Property | Category Tile | Product Tile |
|----------|---------------|--------------|
| Stripe color | Purple `#AE92ED` | Green `#24A865` |
| CSS class | `tile--product tile--parent` | `tile--product` |
| Click action | Navigate into category | Add to cart |
| Price shown | No | Yes |
| Icon | Category grid icon | Cart-plus icon |

### Tickets & Add-Ons Categories

The Tickets tab uses event-scoped category behavior rather than one fixed global chip set:

- Some events expose a flat first-level chip filter (for example, `General Admission` vs `VIP Experience`)
- Other events expose no top-level chips and show all ticket/add-on products in one list
- Active category (when present) has a blue border (`#0079CA`)
- Clicking a category filters the event-specific ticket grid to that group

---

## 10. Permissions

### POS Interface Permissions

- **Access One-Stop Shop POS**: Only authorized front-of-house staff
- **Process Refunds/Voids**: Restricted to supervisors or managers
- **Apply Discounts**: Controlled per role (who can apply manual discounts or override prices)
- **Modify Cart**: Basic staff can add/remove items; trainee roles may have limitations
- **End of Day Reconciliation**: Restricted to authorized personnel

### Stock Management Permissions

- **View Stock Levels**: All relevant staff
- **Adjust Stock Levels**: Restricted to inventory managers or authorized back-office staff
- **Configure Products/SKUs**: Restricted to those who can create, edit, or delete product entries
- **Manage Inventory Integrations**: System administrators or specific technical roles only

### Reporting Permissions

- **View Sales Reports**: Role-based access (staff see own sales, managers see team/location, executives see aggregate)
- **Export Reports**: Restricted

---

## 11. Connection to Catalog Integration

The Fever POS consumes products that are configured upstream via the Catalog Integration and Sales Routing features:

```
Catalog Integration     Sales Routing           Fever POS
(connect Square)  --->  (assign to event   ---> (sell at Box Office)
                         + channels + 
                         warehouses)
```

1. **Catalog Integration** imports products from Square into Fever, organized by warehouse and category hierarchy.
2. **Sales Routing** makes those products available at a specific event through selected channels (including Box Office).
3. **Box Office Setup** configures which warehouse each POS device pulls stock from.
4. **Fever POS** displays the products from the configured warehouse in the tile grid, organized by the imported category hierarchy.
5. When a sale occurs, inventory is decremented in the mapped warehouse and synced back to Square.

---

## 12. Future Improvements

Planned enhancements beyond the current scope:

- **Multi-plan Cart**: Support selling items from different plans in the same transaction (architecture already supports this; not refined for launch)
- **Offline Mode**: Continue POS operation during internet outages with data syncing when connectivity is restored
- **E-commerce Enablement**: Make inventory-managed products available in online purchase flows (marketplace, whitelabel)
- **Mobile UI**: Optimize for Adyen mobile POS and iMin handheld validation devices
- **Customer Facing Display**: Use the iMin Swan 1 Pro dual-screen hardware for a customer-facing display showing the cart, pricing, booking questions, and donations
- **Memberships Integration**: Allow customers to claim perks on all purchases and log transactions against member profiles
- **Gift Card Sales & Redemption**: Enable sale and redemption of physical and digital gift cards
- **Refund/Exchange Flow**: Streamlined refund and exchange process for all product types
- **Advanced Reporting**: Deeper analytics and business intelligence dashboards
- **Self-Service Kiosks**: Customer-facing kiosks for independent ticket and simple retail purchases
- **Staff Performance Tracking**: Individual staff metrics and dashboards
- **IMS Agnosticity**: Deprecate reliance on Square; build internal inventory management capabilities
  - Supplier Management Integration (automated reordering, stock alerts)
  - Multi-Location Inventory Management (stock transfers, centralized overview)

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **Fever POS** | The touchscreen Point of Sale interface within Fever Zone for unified onsite transactions |
| **One-Stop Shop (OSS)** | Original name for the Fever POS initiative |
| **Tile** | A clickable product or category card in the POS grid |
| **Session / Ticket** | A purchasable ticket type with a specific timeslot |
| **Add-on** | An optional ticket-linked upgrade (priority access, flexible change, premium/experience upgrade); physical inventory is sold via Gift Shop |
| **Category (Parent)** | A navigable category tile in the Retail tab (purple stripe) |
| **Product (Leaf)** | A purchasable retail item tile (green stripe) |
| **Stripe** | The 8px colored bar on the left edge of each tile indicating its type |
| **Quick Picks** | A configurable favorites grid for frequently-sold items (touchscreen muscle memory) |
| **Box Office Setup** | Configuration linking a physical POS device to a sales routing and warehouse |
| **iMin Swan 1 Pro** | The preferred dual-screen POS hardware for Fever POS deployments |
| **Shift** | A staff work session that must be started before processing transactions |
| **Breadcrumbs** | Top-row navigation path shown after drilling into nested Retail categories |
| **Price Reference** | The warehouse whose prices determine the SessionType pricing |

---

*Last updated: February 2026*
