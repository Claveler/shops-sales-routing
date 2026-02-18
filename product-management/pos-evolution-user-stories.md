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

The current cart supports a single event and a single timeslot per transaction, with the Box Office setup and Adyen device selectors embedded in the cart header. The redesign introduces event grouping, multi-timeslot support, and relocates the configuration widget to the page header to free up cart space for the richer group structure.

### User Stories

**`B2BS-917` — Multi-event transactions**
As a cashier, I want to add tickets from different events into the same cart, so that visitors buying entry to multiple attractions can pay in one transaction.

*Acceptance criteria:*
- Switching the event selector does not clear the cart; new tickets create a new event group.
- Each event group shows: thumbnail, name, location, collapse/expand chevron, delete button.
- Single-event mode suppresses group headers for a clean flat layout; the UI transitions smoothly when a second group is added or removed.
- Confirmation modal is required for group deletion.
- Retail/merch products always group under the Box Office event regardless of the active event selector.
- Cart total sums across all groups.

**`B2BS-919` — Multi-timeslot cart**
As a cashier, I want to sell tickets for different timeslots of the same event in one transaction, so that split groups can pay together.

*Acceptance criteria:*
- When the timeslots are from the same event, the cart groups items by timeslot.
- Changing the active timeslot targets new tickets only — existing groups are never moved.
- A way should be given to go back to a timeslot that cart items belong to, so the increase/decrease buttons are re-enabled.

*Note:* **This is already in prod code:** If a timeslot is active, then the cart items that are not in that timeslot should have the increase/decrease buttons disabled.

**`B2BS-920` — POS configuration widget**
As a cashier, I want to see and switch my Box Office setup and payment device from the page header, so I don't have to leave the selling interface.

*Acceptance criteria:*
- Widget in the header trail shows: venue name (label), setup name + truncated device ID (value), gear icon.
- Dropdown has two sections: Box Office Setup (accordion by venue, one expanded at a time) and Payment Device (filtered to the selected setup's linked devices).
- Changing setup cascades to re-filter devices; if the current device is invalid, the first valid one is auto-selected (or cleared).
- Dropdown stays open during selections; closes on outside click.

**`B2BS-924` — Seated event tab layout and add-on separation**
As a cashier, I want seated events to automatically split into a Seating tab and a separate Add-Ons tab, so that seat selection (via seats.io) and add-on purchasing are clearly separated.

*Acceptance criteria:*
- When an event is configured for assigned seating, the tab layout changes from "[Event Name] | Merch" to "[Event Name] | Add-Ons | Merch".
- The Add-Ons tab shows the same add-on product grid used in non-seated events, but without seated tickets (tickets are handled through seat selection).
- Seats selected via the seats.io widget are added to the cart as individual line items (qty = 1 each) with a seat info badge showing section, row, and seat number.
- Non-seated events are unaffected — they continue using the single "Tickets & Add-Ons" tab.

*Note:* The seating map itself is provided by a **seats.io integration**. This story covers only the POS tab restructuring, add-on separation, and cart integration for seat-specific line items. Deletion of cart items is not allowed from the cart; all actions are done from the seats.io integration.

---

## Epic 2 — Timeslot Selector Redesign `B2BS-922`

### Design

| Status | Figma |
|--------|-------|
| Not started | _Pending — @Pablo Rubio to add link when ready for dev_ |

### Context

The current timeslot picker is a permanent left-sidebar panel consuming horizontal space. The redesign replaces it with an on-demand modal, giving the tile grid full width.

### User Stories

**`B2BS-921` — Timeslot selector modal**
As a cashier, I want to pick a date and timeslot from an on-demand modal with availability indicators, so the tile grid keeps full width when I'm not scheduling.

*Acceptance criteria:*
- Horizontal date pill strip (only dates with sessions); first available date pre-selected.
- Timeslot cards grouped by time-of-day; groups with no slots hidden.
- Availability indicators: Available (green), Filling up (amber + remaining count), Almost gone (red + remaining count), Sold out (grey, disabled).
- Event context banner at the top (thumbnail, name, venue, city).
- Two-step selection: tap highlights (blue border) → "Confirm selection" button applies.
- Previously confirmed slot shows "Selected" label; date pill shows checkmark.

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

### User Stories

**`B2BS-927` — Explode pipes and category tiles**
As a cashier, I want first-level categories as chip pills and deeper categories as purple tiles in the grid, so I can filter quickly and drill down visually.

*Acceptance criteria:*
- Tickets tab: explode pipe chips vary by event (some events have them, others don't).
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

### User Stories

**`B2BS-930` — Variant tile and picker**
As a cashier, I want variant products to show "from" pricing and open a picker on tap, so I can select the specific size/color the customer wants.

*Acceptance criteria:*
- Variant tiles show "from" + lowest variant price; tapping opens a centered Variant Picker modal.
- Picker shows: product name, axis label (e.g., "Select Size"), pill button per variant with its specific price.
- Out-of-stock variants greyed out and disabled.
- Selecting a pill adds to cart and closes the picker; clicking outside or Escape dismisses without adding.

**`B2BS-932` — Variants in the cart**
As a cashier, I want each variant to appear as a separate cart line with a size/color label, so each variant is tracked with its own quantity.

*Acceptance criteria:*
- Each variant is a distinct cart line with a grey variant-label pill below the product name.
- Adding the same variant again increments the existing line instead of creating a duplicate.
- Quantity controls and pricing work identically to non-variant items.

---

## Epic 5 — Membership Pricing `B2BS-934`

### Context

The POS today shows standard pricing for all visitors. Partners with membership programs need cashiers to identify members and see tiered pricing applied across tiles, categories, and the cart — including retroactive application mid-transaction.

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
