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

### Device Preview Simulation

The POS includes a browser-based device preview that renders the full POS UI inside a 3D photo of the iMin Swan 1 Pro. The device frame image (7680 x 4320 `.webp`) is eagerly preloaded on page mount so it is typically cached before the user enters preview mode. If the image has not finished loading when the user toggles into device preview, a lightweight loading indicator is shown in place of the device frame. Once the image is ready, the device frame fades in (0.4 s ease-out) to avoid a jarring pop-in of content before the frame appears.

---

## 4. Page Layout

The Fever POS is a full-screen interface that renders **outside** the standard Fever Zone layout (no sidebar). It has its own header and occupies the entire viewport.

```
+-------------------------------------------------------+
|  Header (72px, dark #06232C)                           |
|  [Hamburger] [fever ZONE]     [Date/Time] [Start Shift] [User] |
+-------------------------------------------------------+
|  Main Content Area                    |  Cart Panel    |
|  +--------------------------------+   |  (400px/28.6vw)|
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
- The shifts widget follows live Fever Zone density: 48px high white card, muted left time panel, subtle divider, and 32px outlined rounded `Start shift` CTA
- Date/time label reflects current system time while the POS is open (live updates)

### Main Content Area

Occupies all horizontal space left of the cart panel. Contains:

- **Navigation Tabs** at the top
- **Folder-like tab connection**: the active tab is visually connected to the content panel below, creating a folder-style container. The content panel has its own top border; the active tab has `margin-bottom: -1px` to overlap it and a white `border-bottom` to cover the content's grey border beneath it, producing a seamless folder cut-out effect. When the first tab is active, the content panel's top-left corner is square (flush with the tab); otherwise all top corners are rounded
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
- **No layout shift on tab switch**: when calendar is hidden (Gift Shop), an equal-width trailing slot is reserved so chips/breadcrumbs keep the same horizontal alignment as Tickets
- **Control alignment to folder border**: top-right utility buttons are right-aligned to the folder outer border line; the calendar button is right-aligned to the inner tile area edge below
- **Circular control borders**: utility circle buttons use a thicker border stroke to match Figma
- **Product Tile Grid** filling the remaining space
- **Event thumbnail consistency**: the ticket tab header and cart event rows use the same event thumbnail image source

### Cart Panel

- **Viewport-dependent width** (mirrors live Fever Zone POS sizing):
  - Below 1397px: fixed at 400px (`min-width` + `max-width` lock)
  - At 1397px and above: `28.633vw` (`400 / 1397 × 100`), scaling proportionally with the viewport
  - The `28.633vw` value equals exactly 400px at the 1397px breakpoint, creating a seamless transition
- `flex: 0 0 auto` — the cart never grows or shrinks from flex distribution; the main content area absorbs all remaining space
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
  - compact header/title row with close action
  - city chips under **Select the city** only when more than one city is available
  - event cards under **Select the event and the venue** (thumbnail, event title, venue)
  - immediate event switch on card click (no footer CTA row)
  - compact Fever Zone-like spacing/typography (dense card list, 14px labels, ~13px event-title text, small venue text, tighter panel paddings)
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

- **Header**: "Cart" title (14px bold) + "Clear all" link (14px, danger-red `#EB0052`)
- **Scrollable body**: Event-grouped items (unified: tickets, add-ons, AND retail products per event)
- **Sticky footer**: Total, discount link, and payment buttons
- **Surfaces**: cart panel background `#FFFFFF`; event group wrapper `#FAFBFB`; cart item cards `#FFFFFF` with `1px solid #CCD2D8` border
- **Empty state**: centered receipt icon in a 60px area + text "The cart is empty" in subtle `18px/24px` heading style with 16px icon/text gap; the cart header ("Cart" title and "Clear all" button) is hidden when the cart is empty
- **Shadow**: left-side shadow `-2px 0 5px rgba(167,178,186,0.5)` on the cart panel

### Tickets vs Products: Different Routing Rules

A fundamental distinction governs how items reach the POS:

- **Tickets** are not physical goods. They do not require a sales routing, warehouse, or inventory. The POS can sell tickets to **any event** in the system -- the staff member simply selects the event from the event selector and sells tickets for it. Ticket availability is independent of which sales routing is configured for the Box Office.
- **Products** (retail, F&B, merchandise) are physical inventory items. They are only available at the POS if a **sales routing** has been created that maps them to the Box Office channel. In the Box Office Setup screen, the operator selects which sales routing (and therefore which event's product catalog) the POS device will use. Since sales routings map 1:1 to events, we refer to the configured routing by its event name (e.g., "the Box Office is configured with the Taylor Swift event").

### Smart Event Grouping

Cart items are grouped by event, but tickets and products follow different grouping rules:

- **Tickets & add-ons**: grouped under whichever event the user is currently selling tickets for (the active ticket event selector choice). The POS can sell tickets for multiple events in the same transaction. Changing the ticket event selector changes which group new tickets land in.
- **Retail / gift-shop products**: **always** grouped under the **Box Office event** -- the single event whose sales routing was used to configure this POS device. Changing the ticket event selector does NOT change where retail products are grouped, because the product catalog comes from the Box Office setup, not the ticket event selector.
- **Single-event mode**: when only one event exists in the cart, event subsection headers are suppressed entirely; items are shown flat with just the time-slot header and optional products sub-section
- **Multi-event mode**: each event gets a collapsible card with its own header (thumbnail, name, location, delete, chevron)

> **Example**: The Box Office is configured with the Taylor Swift event (`evt-001`) as its product source. A staff member sells 2x Zone A Tickets for Taylor Swift, then switches the event selector to Van Gogh and sells 1x Standard Adult Entry. They also add a Navy T-Shirt from the Gift Shop. The cart now shows two event groups: Taylor Swift (with tickets + the T-shirt) and Van Gogh (with tickets only). The T-shirt is in the Taylor Swift group because that's the Box Office event whose sales routing provides the product catalog -- not because it's related to the Taylor Swift event specifically.

### Event Group Card (multi-event mode)

- **Wrapper**: `#FAFBFB` background, `border-radius: 8px`, 16px bottom margin between groups
- **Event header row**: 8px vertical padding, 16px horizontal padding
  - Thumbnail: `32x32px`, `border-radius: 4px`
  - Event name: `14px` bold, single-line with ellipsis
  - Location: location-dot icon + text, `12px` regular
  - Delete button: `44x44px` tap area, `16px` icon, subtle (no background, `#536B75` color)
  - Chevron button: `44x44px` tap area, `16px` icon, subtle style
- **Border separator**: when expanded, the event header row gets a `border-bottom: 1px solid #CCD2D8`
- **Expanded body**:
  - **Time-slot section**: ticket icon + date/time (left), location-dot + location (right), all `12px` caption; followed by cart item cards
  - **Products sub-section**: gift icon + "Products" label (`12px`), followed by retail cart item cards

### Cart Item Card

- **Card**: `background: #FFFFFF`, `border: 1px solid #CCD2D8`, `border-radius: 8px`, `padding: 8px`
- **Item name**: `12px` regular weight, max 2 lines with ellipsis
- **Price row**: current price `12px` semibold
- **Booking fee**: `10px` regular `#536B75`

### Quantity Controls (Pill Counter)

The quantity control is a **pill-shaped capsule** containing both action buttons and the count:

- **Pill container**: `border: 1px solid #A7B2BA`, `border-radius: 200px`, `padding: 2px`, `max-width: 140px`, `width: 132px`
- **Left button** (40x40 circle):
  - **Quantity = 1**: trash-can icon, `background: #0079CA`, white icon -- removes the item
  - **Quantity >= 2**: minus icon, `background: #0079CA`, white icon -- decrements quantity
- **Count text**: centered, `16px` regular, `color: #536B75`
- **Right button** (plus): 40x40 circle, `background: #0079CA`, white icon -- increments quantity

### Member Identify Modal

The cart header includes an **Identify member** action button (address-card icon). Tapping it opens a centered modal:

- **Header**: "Identify member" title + close (×) button
- **Instruction row**: address-card icon + "Scan the QR code or enter the ID manually"
- **Input field**: floating-label text input ("Member ID") with a crosshairs icon
- **Demo prefill button**: a purple-gradient "Enter demo member" button (magic-wand icon) that immediately identifies demo member **Anderson Collingwood** (ID `7261322`) without requiring manual input. This button uses the same `fillDemoBtn` visual style (purple gradient, white text, wand icon) as the demo prefill buttons in the Sales Routing wizard.
- **Behavior**: on successful identification the modal closes and the header shows the member's name in a badge; tapping the badge's × clears the member

### Footer

- **Top divider**: `1px solid #CCD2D8` full-width line
- **Total row**: "Total (N items)" left-aligned `14px` regular, total amount right-aligned `14px` bold
- **Discount link**: "Select discount type" right-aligned below amount (`12px` semibold, primary blue `#0079CA`)
- **Bottom divider**: `1px solid #CCD2D8` full-width line
- **Currency display**: POS prices are displayed in euros (`€`) for consistency with Sales Routing and Catalog Integration
- **Payment buttons**: Two pill-shaped buttons side-by-side (`48px` height, `border-radius: 64px`, `16px` font, `24px` horizontal padding):
  - **Cash**: White background, `2px solid #CCD2D8` border, wallet icon, primary blue text
  - **Card**: Primary blue `#0079CA` background, white text, credit card icon
- **Footer shadow**: `0 -6px 6px rgba(0,70,121,0.2)` top shadow

---

## 9. Category System

### Terminology: Explode Pipes vs Category Tiles

The POS uses two distinct category navigation mechanisms. These are separate UI elements and should not be confused:

- **Explode pipes** are the **first-level category chip buttons** in the top filter bar. They appear as compact pill-shaped chips (e.g., "General Admission", "VIP Experience" on the Tickets tab; "Apparel", "Art & Prints", "Music" on the Gift Shop tab). Explode pipes are always visible at the root navigation level and are replaced by breadcrumbs when the user drills into nested categories (Gift Shop only).
- **Category tiles** are **second-level and deeper folder tiles** in the product grid. They appear as full-sized tiles with a purple left stripe (`#AE92ED`) and a stacked-boxes icon. Clicking a category tile navigates deeper into the hierarchy. Category tiles are only present in the Gift Shop tab.

### Member Pricing Crown Indicators

When a member is identified, both explode pipes and category tiles display a **crown icon** if the category (or any of its descendant categories/products) contains products with member pricing:

- **Explode pipe chips**: a small orange crown icon (`#FF8C00`, 10px) appears inline after the category name
- **Category tiles**: a triangular corner badge (top-right, light yellow `#FFF3D6` background) with an orange crown icon

This aids discovery by letting staff quickly see which categories contain member-priced products without having to drill into each one.

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
| Icon | Stacked-boxes icon (bottom-right) | Gift icon (retail/food), Cart-plus icon (add-ons) |

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
- **Memberships Integration**: Allow customers to claim perks on all purchases and log transactions against member profiles. This will introduce member pricing (strikethrough original price + discounted price) and a premium indicator (crown icon) on cart items for members. The **Identify member** modal is already implemented (see §8, Cart Panel header) and includes a demo prefill button for quick testing
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
| **Explode pipes** | First-level category chip buttons in the top filter bar (e.g., "General Admission", "VIP Experience", "Apparel"). Distinct from category tiles |
| **Category tile** | A second-level or deeper navigable category tile in the Gift Shop grid (purple stripe). Distinct from explode pipes |
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
