# POS Evolution — User Stories

These user stories describe the evolutionary improvements to the Fever POS, building on the current production interface. Each initiative takes the existing POS (tile grid, cart panel, header, tab system) and extends it with incremental capabilities.

> **Current baseline**: The POS today sells tickets for a single event at a time, with a left-sidebar calendar showing dates and timeslots, text-only tiles organized under flat category chips (e.g., Gift Aid, Non Gift Aid, Groups), a simple cart with one event group, the BO setup/device selector inside the cart header, and basic Cash/Card checkout. The screenshot reference is the Portsmouth Historic Dockyard configuration as of Feb 2026.

---

## Epic 1 — Multi-Cart `B2BS-918`

### Design

| Status | Figma |
|--------|-------|
| Not started | _Pending — @Pablo Rubio to add link when ready for dev_ |

### Context

The cart already supports multi-timeslot transactions (items from different timeslots of the same event in one cart) and the timeslot selector has been redesigned as an on-demand modal. The Box Office setup and Adyen device selectors are still embedded in the cart header. This epic's remaining scope is multi-event grouping (items from different events in one cart), relocating the configuration widget to the page header, and the cart panel visual overhaul.

### Why

Venues with multiple attractions lose revenue when visitors must complete separate transactions per event. Multi-cart lets cashiers bundle everything into one checkout, reducing queue time and increasing average transaction value.

### User Stories

**`B2BS-917` — Multi-event transactions**
As a cashier, I want to add tickets from different events into the same cart, so that visitors buying entry to multiple attractions can pay in one transaction.

*Acceptance criteria:*

_Tickets & Add-Ons tab:_
- The Tickets & Add-Ons tab (first tab, shows the event name) has a fixed width of 300px.
- A list icon (☰) appears at the far right of the tab, but only when the BO setup has more than one plan to sell and the tab is active.
- Tapping the list icon opens the event selector.
- The event name uses a marquee animation for long names: 1s delay after load or event change, scrolls right-to-left to reveal the full name, pauses 3s at the end, then scrolls back left-to-right.
- For seated events, this tab splits into a Seating tab + a separate Add-Ons tab (see B2BS-924 for the tab rename and seated cart item redesign).

_Cart grouping:_
- Switching the event selector does not clear the cart; new tickets create a new event group.
- Each event group shows: thumbnail, name, location, collapse/expand chevron, delete button.
- Single-event mode suppresses group headers for a clean flat layout; the UI transitions smoothly when a second group is added or removed.
- Confirmation modal is required for group deletion.
- Retail/merch products always group under the Box Office event regardless of the active event selector.
- Cart total sums across all groups.

**`B2BS-919` — Multi-timeslot cart**
As a cashier, I want to sell tickets for different timeslots of the same event in one transaction, so that split groups can pay together.

*Already implemented (baseline):*
- Multi-timeslot grouping: items from different timeslots of the same event appear in the same cart, grouped by timeslot in a flat layout (no collapsible event headers).
- Each timeslot section has a header showing ticket icon + formatted date/time.
- Venue/location is shown on timeslot headers only when the cart contains items from more than one distinct venue; hidden otherwise.
- Changing the active timeslot targets new tickets only — existing groups are never moved.
- Quantity controls on items in a non-active timeslot are disabled.

*What's new (scope of this story):*
- Inactive timeslot sections are rendered in a grey container (light grey background `#fafbfb`, rounded corners, 8px padding).
- Cart items inside an inactive section have grey backgrounds (`#f6f7f7`), subtle text color (`#536b75`), and disabled (grey) quantity buttons — matching the Figma disabled-item treatment.
- An "Activate time slot" blue link appears below the items in the disabled container.
- Clicking the link or anywhere inside the disabled container switches the active timeslot to that group's timeslot, re-enabling quantity controls.

**`B2BS-920` — POS configuration widget (hamburger menu)**
As a cashier, I want to see and switch my Box Office setup and payment device from a header menu, so I don't have to leave the selling interface.

*Acceptance criteria:*

_Cart header cleanup:_
- The old BO setup name, venue, and device selector row is removed from the cart header. Configuration now lives exclusively in the hamburger menu (below).
- The resulting cart header shows "Cart" title on the left and "Clear all" link (red text) on the right.
- When the cart is empty, the header is hidden and an empty state is shown (receipt icon + "The cart is empty").

_Hamburger menu:_
- Hamburger icon (☰) sits at the far right of the page header, after the user avatar.
- Tapping opens a popover anchored to the icon with the following items in order: "Change setup" (gear icon), an info box showing the current venue (building icon) and setup (cash-register icon), "Link device" (mobile icon) with the linked device ID as subtitle, a divider, "Get universal share link" (share icon), and "Log out" (arrow-right-from-bracket icon).
- Popover closes on outside click.

_Change setup modal:_
- "Change setup" opens a full-screen modal titled "Select Your Setup — {current setup name}".
- Step 1: venue grid with search input; selecting a venue highlights it and reveals step 2.
- Step 2: setup grid filtered to the selected venue; selecting a setup confirms and closes the modal.
- Changing setup cascades to re-filter devices; if the current device is invalid, the first valid one is auto-selected (or cleared).

_Link device modal:_
- "Link device" opens a modal titled "Link Payment Device".
- Shows a list of Adyen terminals linked to the current setup; each card shows device ID and device name.
- The currently linked device is highlighted with a "Connected" badge.
- Selecting a different device updates the link and closes the modal.
- Empty state shown if no devices are linked to the setup.

**`B2BS-962` — Cart panel visual redesign**
As a cashier, I want an updated cart layout with modernized controls and clearer information hierarchy, so the cart is easier to read and faster to operate.

*Prerequisite:* B2BS-920 (config moves to hamburger menu and cart header is simplified).

*Already implemented (baseline):*
- Timeslot row shows ticket icon + date/time on the left, location-dot icon + venue on the right (replaces old "Tickets" label + date format).
- Cash (outlined, wallet icon) and Card (filled blue, card icon) split payment buttons.
- "Select discount type" blue link (currently with gear icon).

*What's new (scope of this story):*

_Cart item cards:_
- Quantity controls redesigned as a pill-shaped container (bordered capsule, `rounded-200px`) wrapping circular trash/plus buttons + centered count. Replaces the current standalone buttons + rectangular input field.
- Booking fee is shown below the price when applicable (e.g., "+ €0.60 booking fee").

_Footer:_
- Total row shows "Total (N items)" with item count, not just "Total".
- "Select discount type" link drops the gear icon (blue text only).

**`B2BS-924` — Seated event tab layout and add-on separation**
As a cashier, I want seated events to have a clearly separated Add-Ons tab and a redesigned cart layout for seat-specific items, so that the purchasing flow for seated events is intuitive and consistent with the seats.io integration.

*Already implemented (baseline):*
- For seated events, the Tickets & Add-Ons tab splits: a "Seating" tab shows the seats.io widget, and a separate "Add-Ons" tab appears between it and Merch.
- The Add-Ons tab shows the same add-on product grid used in non-seated events, but without seated tickets (tickets are handled through seat selection).
- The timeslot pill appears inside the seating tab above the seats.io widget (see B2BS-921).
- For non-seated events, the Tickets & Add-Ons tab remains a single tab. No change.

*What's new (scope of this story):*

_Add-Ons tab:_
- For seated events, any ticket type that does not require seat allocation is moved out of the seating tab into its own independent tab, labelled "Add-Ons". This covers add-on products (the most common case), though there may be marginal exceptions such as non-seated upgrade passes.

_Seated cart items:_
- Seats of the same ticket type (same tier + Adult/Child) are grouped into a single cart item.
- The cart item title is the ticket type name (e.g., "General Admission Adult - Tier 1").
- Individual seat references are listed below the title, each showing the seat ID and section (e.g., "B6 (Balcony Left)").
- A "Seats" badge on the right side shows the count of seats in that group, replacing the quantity pill controls used for non-seated items.
- Price and booking fee are shown per unit (all seats in a group share the same price).
- Selecting a new seat of the same ticket type on the map increments the existing cart item instead of creating a new row.
- Deselecting a seat on the map removes that specific seat from the group; if the last seat is removed, the cart item is deleted.
- Quantity cannot be changed from the cart directly; all seat management is done through the seating map. Since seats.io owns seat selection and provides its own "Clear selection" action, all add/remove/clear actions happen on the map — the cart "Clear all" button is hidden for seated events.

*Note:* The seating map itself is provided by a **seats.io integration**. This story covers only the tab rename, cart item redesign for seat-specific line items, and the read-only cart behavior that follows from seats.io owning seat management.

---

## Epic 2 — Timeslot Selector Redesign `B2BS-922`

### Design

| Status | Figma |
|--------|-------|
| Ready for dev | [Timeslot selector modal](https://www.figma.com/design/YHaH7icLUALRpKvvl9S8xE/One-Stop-Shop?node-id=21345-165781) |

### Context

The current timeslot picker is a permanent left-sidebar panel consuming horizontal space. The redesign replaces it with an on-demand modal, giving the tile grid full width.

### Why

The permanent sidebar calendar wastes horizontal space on the POS's already-constrained touch screen. Moving timeslot selection to an on-demand modal gives the product grid full width, making it faster for cashiers to find and sell products.

### User Stories

**`B2BS-921` — Timeslot selector modal**
As a cashier, I want to pick a date and timeslot from an on-demand modal with availability indicators and a calendar fallback for multi-week events, so the tile grid keeps full width when I'm not scheduling and I can quickly browse any date.

*Acceptance criteria:*

_Timeslot pill (trigger):_
- A pill-shaped indicator sits inline with the category filter chips, right-aligned.
- Shows the formatted date/time of the selected timeslot (e.g., "Fri, Mar 27, 7:30 PM") with a calendar icon on the right edge of the pill.
- Tapping the pill opens the timeslot selector modal (described below).
- For seated events, the pill appears above the seats.io widget in the same inline position.

_Date strip:_
- Horizontal date strip showing rectangular date cards (only dates with sessions); first available date pre-selected.
- Each date card shows: day abbreviation (or "TODAY"), date + month (e.g., "31 Jan"), and an availability underline bar when applicable (amber for filling, red for low availability, grey for sold out).
- At most 5 date cards visible at once. A "More dates" underlined link sits inline to the right of the strip, opening the calendar view.
- If the active date falls outside the visible 5 cards, it replaces the last card so the selection is always visible.
- An availability legend appears above the date strip: "Low availability" (amber bar) and "Sold out" (grey bar).
- The date strip, divider, and timeslots are wrapped in a light grey block container.

_Calendar view ("More dates"):_
- Tapping "More dates" replaces the date strip + timeslots with a full month-view calendar. The modal title changes to "More dates" and a back chevron appears in the header.
- The calendar uses a Monday-start week with three-letter weekday labels (MON–SUN). Dates with available sessions show black text (no colored background); the selected date has a blue border. Dates without sessions show grey text and are non-interactive. Today's date has a warm yellow background. Month navigation is via pill-shaped month toggle buttons.
- Calendar grid always renders 6 rows so the modal height stays stable across months.
- Availability underline bars in the calendar: dates with constrained availability show a short colored underline bar beneath the date number — amber for filling, red for low availability. A legend below the grid explains the bar colors.
- Selecting a date from the calendar closes the calendar and returns to the date strip + timeslots view with the chosen date active.
- Tapping the back chevron returns to the date strip without changing the selection. The active date card scrolls into view on return.
- The footer (Today + Confirm selection) is hidden while the calendar is open.

_Timeslot selection:_
- Timeslot chips grouped by time-of-day (Morning / Afternoon / Evening); groups with no slots are hidden.
- Each group heading combines the full date and period, e.g., "Thursday, January 31 - Evening", followed by a time range in lighter text (e.g., "7:00 AM to 2:59 PM" for Morning, "3:00 PM to 6:59 PM" for Afternoon, "7:00 PM to 9:59 PM" for Evening).
- Groups are collapsible accordion sections. A chevron on the right of each heading toggles expand/collapse. Only the first group with available slots is expanded by default; the rest are collapsed.
- Timeslot chip visual states: available = white background with time only; filling = blue tint + amber border + dot + remaining count; low availability = blue tint + red border + dot + remaining count; sold out = grey background, "Sold out" text, disabled.
- Two-step selection: tapping a chip highlights it → "Confirm selection" button applies the choice.

_Footer:_
- "Today" button (calendar icon, tertiary style) on the left jumps to today's date (or the nearest future available date).
- "Confirm selection" primary button on the right; disabled until a timeslot is selected.

**`B2BS-923` — Timeslot enforcement**
As a cashier, I want the system to require a timeslot before selling tickets, so I never sell without a valid session.

*Acceptance criteria:*
- Upon entering the ticketing POS view, a timeslot will be preselected (the one closest to sale date).
- The calendar button shows a filled/active state when a timeslot is selected.
- Hidden in Merch tab; equal-height trailing slot reserved to prevent layout shift.

---

## Epic 3 — Category Navigation & Tile Visuals `B2BS-928`

### Context

Today category chips are flat filters and all tiles are text-only. The evolution standardizes explode pipes as first-level chip selectors (across Tickets and Merch), category tiles for deeper navigation, and adds product thumbnails for faster visual recognition.

### Why

Flat text-only tiles and simple category chips slow cashiers down when the catalog grows. Visual hierarchy (images, drillable categories) is needed for partners with large product catalogs to keep checkout speed acceptable.

### User Stories

**`B2BS-927` — Explode pipes and category tiles**
As a cashier, I want first-level categories as chip pills and deeper categories as purple tiles in the grid, so I can find products fast in large catalogs instead of scrolling through a flat list.

*Acceptance criteria:*
- Tickets & Add-Ons tab: explode pipe chips vary by event (some events have them, others don't).
- Merch tab: root always shows explode pipes for top-level categories.
- Active chip has blue border; inactive chips neutral.
- Category tiles (level 2+): purple stripe, stacked-boxes icon, no price.
- Merch drill-down replaces pipes with breadcrumbs; home icon disabled at root, enabled when nested.

**`B2BS-929` — Product image thumbnails**
As a cashier, I want product tiles to show a thumbnail image when available, so I can identify products by sight.

*Acceptance criteria:*
- With image: 40×40px rounded thumbnail in top-left, name wraps in remaining space.
- Without image: name occupies full width; category icon at bottom-right as before.
- Category tiles never show images.
- Grid dimensions and aspect ratio unchanged.
- Images are sourced from the product catalog (populated from the external inventory system).

---

## Epic 4 — Product Variants `B2BS-931`

### Context

Today each tile is one product at one price. Products with size or color variants need a selection step before adding to cart, without cluttering the grid with one tile per variant.

### Why

Partners selling sized/colored merchandise today need a separate tile per variant, cluttering the grid. A variant picker keeps the grid clean while still surfacing all options at point of sale.

### User Stories

**`B2BS-930` — Variant tile and picker**
As a cashier, I want variant products to show "from" pricing and open a picker on tap, so I can select the specific size/color the customer wants.

*Acceptance criteria:*
- Variant tiles show "from" + lowest variant price; tapping opens a centered Variant Picker modal.
- Picker shows: product name, axis label (e.g., "Select Size"), pill button per variant with its specific price.
- Out-of-stock variants greyed out and disabled.
- Selecting a pill adds to cart and closes the picker; clicking outside or Escape dismisses without adding.

**`B2BS-932` — Variants in the cart**
As a cashier, I want each variant to appear as a separate cart line with a size/color label, so the receipt is accurate and stock decrements per variant instead of per parent product.

*Acceptance criteria:*
- Each variant is a distinct cart line with a grey variant-label pill below the product name.
- Adding the same variant again increments the existing line instead of creating a duplicate.
- Quantity controls and pricing work identically to non-variant items.

---

## Epic 5 — Membership Pricing `B2BS-934`

### Context

The POS today shows standard pricing for all visitors. Partners with membership programs need cashiers to identify members and see tiered pricing applied across tiles, categories, and the cart — including retroactive application mid-transaction.

### Why

Partners with membership programs currently have no way to honor member pricing at the POS, forcing manual workarounds or losing the member value proposition at the point of sale.

### User Stories

**`B2BS-933` — Member identification**
As a cashier, I want to identify a member by QR or ID and see their name and tier in the cart header, so I can apply membership benefits to the transaction.

*Acceptance criteria:*
- "Identify member" button (address-card icon) in cart header opens a modal with QR scan + manual ID input.
- On identification: pill in cart header with name + tier badge (tier-colored) + role icon (star for primary, user-plus for beneficiary).
- Clearing the pill (×) reverts all prices to standard.

*Open questions:*
- What happens when the member ID is invalid or the lookup fails? (Error toast, inline message, retry prompt?)

**`B2BS-935` — Crown indicators on tiles and categories**
As a cashier, I want tiles and category chips to show a crown icon when member pricing exists, so I can guide members to discounted products.

*Acceptance criteria:*
- Product tiles with member pricing: triangular corner badge (top-right, yellow background, orange crown).
- Category tiles: same badge if any descendant has member pricing.
- Explode pipe chips: inline orange crown icon after the category name.

**`B2BS-936` — Member pricing in the cart**
As a cashier, I want cart items to show strikethrough pricing when a member is identified — including retroactive updates — so the member sees the value of their membership.

*Acceptance criteria:*
- Cart lines with member pricing: strikethrough original + member price + crown icon.
- Mid-transaction identification retroactively updates all eligible items.
- Clearing the member reverts all prices.
- Variant items resolve member pricing per variant from the price reference warehouse.

---

## Definition of Done

Every story in this file is considered done when:

- [ ] Tested on iMin Swan 1 Pro resolution (1397×786 dp)
- [ ] All interactive elements meet 44×44px minimum touch targets
- [ ] No regression in existing POS flows
- [ ] Matches Figma (when linked)
- [ ] Relevant Mixpanel events instrumented per `product-management/analytics-taxonomy.md`

---

## Cross-Cutting Considerations

### Performance & Responsiveness
- All new modals must open within 200ms to feel instant at the register.
- Cart re-renders on mid-transaction member identification must not cause visible UI jank.

### Touch Target Compliance
- All interactive elements must meet 44×44px minimum touch targets.
- Crown badges, availability indicators, and variant pills must be legible on the iMin screen (1397×786 dp).

### Backward Compatibility
- Existing POS flows (single event, single timeslot, text-only tiles, no member pricing) must continue without regression.
- Events without seating, products without variants, and setups without linked devices degrade gracefully to simpler UI states.

### Delivery Order (dependency-based)

```
Epic 3 (Category Nav & Tile Visuals)   ← no dependencies, ship anytime
Epic 4 (Product Variants)               ← no dependencies, ship anytime
Epic 2 (Timeslot Selector)              ← prerequisite for Epic 1
Epic 1 (Multi-Cart)                      ← depends on Epic 2; includes seated event tab handling
Epic 5 (Membership Pricing)             ← benefits from Epics 3 and 4 being done
```

Epics 3 and 4 can run in parallel. Epic 2 is the critical-path enabler for the cart evolution (including seated events via seats.io).

---

*Last updated: February 2026*
