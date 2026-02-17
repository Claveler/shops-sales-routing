# Back-Office Evolution — User Stories

User stories for the Catalog Integration, Sales Routing, and Channel Visibility features within the Fever Zone back-office (Products section).

> **Current baseline**: These are net-new self-service capabilities. Today, connecting a partner's external inventory to Fever requires manual internal engineering work — entering IDs, creating database records, and configuring channel mappings by hand.

---

## Epic 7 — Catalog Integration `B2BS-863`

### Context

Partners need to connect their external Inventory Management System (currently Square, Shopify planned) to import products into Fever. This includes defining warehouse locations and syncing the product catalog with stock levels, pricing, variants, and category hierarchy.

### User Stories (pre-existing in Jira)

**`B2BS-289` — Add/edit a shop setup (only setup and warehouses)**
Covers the creation and editing of the catalog integration record: name, integration type (Square), Master Catalog ID, and warehouse definitions (location name + external location ID pairs).

**`B2BS-910` — Implement Products Catalog List, Syncing & Filtering**
Covers the product sync flow ("Sync products" button, import from Square, progress notification) and the products table (search, pagination, filters, variants column with expandable sub-rows, undistributed product warnings).

**`B2BS-911` — Implement Catalog Integration - Warehouses Tab Management**
Covers the warehouse detail panel: per-warehouse stock and price breakdown, per-variant detail (label pill, stock, price) for variant products.

**`B2BS-912` — Remove old stock management view**
Cleanup task: remove the legacy stock management screen from Events > Inventory and redirect to the new Products section.

---

## Epic 8 — Sales Routing `B2BS-938`

### Design

| Status | Figma |
|--------|-------|
| Not started | _Pending — @Pablo Rubio to add link when ready for dev_ |

### Context

Sales routings make physical products available for sale at events through selected channels. Each routing ties 1:1 to an event and defines which channels sell the products, which warehouses supply stock, and how channels map to warehouses. The wizard guides ops users through this multi-step configuration.

### User Stories

**`B2BS-937` — Browse sales routings**
As an ops user, I want to see all configured routings in a table with status and distribution summaries, so I can monitor my product distribution at a glance.

*Acceptance criteria:*
- Table columns: event name + venue, status (Draft / Active / Inactive), distribution summary, actions.
- Expandable rows show channel-warehouse mappings per routing.
- "Create new sales routing" CTA; empty state with prompt when no routings exist.
- Status badge styling distinguishes Draft, Active, and Inactive.

**`B2BS-939` — Create routing wizard**
As an ops user, I want to create a routing through a guided 5-step wizard, so products become available at an event's sales channels.

*Acceptance criteria:*
- Step 1 — Event: search/filter events; events with existing routings disabled (1:1 constraint).
- Step 2 — Channels: multi-select; Box Office flagged as onsite; online channels grouped separately.
- Step 3 — Warehouses: dynamic rules based on channels (1 online → 1 warehouse; N online → up to N; Box Office → unlimited). Price reference selector when >1 warehouse.
- Step 4 — Channel Routing: map each channel to a warehouse; auto-populate if single warehouse. Default visibility per online channel (All visible / None visible). Box Office note about per-device config.
- Step 5 — Review: full summary; status picker; create button.
- Routing identified by event name (no separate name field).
- Price reference determines SessionType pricing across ALL channels; channel-warehouse mapping determines stock source only.
- Changing the price reference updates all SessionType prices accordingly.
- Contextual explanation text adapts to the current channel/warehouse combination.

*Open questions:*
- What happens if the user abandons the wizard mid-flow? (Draft saved, discarded, or confirmation prompt?)

**`B2BS-940` — Edit a sales routing**
As an ops user, I want to edit an existing routing's warehouses, channels, mappings, and status on a single page, so I can adjust distribution without re-running the wizard.

*Acceptance criteria:*
- Single scrollable edit view; event is immutable (read-only header).
- Editable: warehouses, price reference, channels, channel-warehouse mapping, status.
- Same dynamic warehouse rules as the wizard (limits recalculated if channels change).
- Constraints: nothing can be deleted — warehouses, channels, and relationships can only be added or reassigned. Routings can be deactivated but not deleted.
- Same dynamic warehouse rules as the wizard: 1 online = 1 warehouse; N online = up to N; Box Office = unlimited. Price reference required when >1 warehouse.
- Changing the price reference updates all SessionType prices accordingly.
- Contextual explanation text adapts to the current channel/warehouse combination.

---

## Epic 9 — Channel Visibility `B2BS-943`

### Context

After a sales routing is created, ops users need granular control over which products appear in each channel — for example, hiding seasonal items from the marketplace while keeping them visible at the Box Office.

### User Stories

**`B2BS-942` — Filter by routing and channel**
As an ops user, I want to pick a city, event, and channel to load the product visibility grid, so I can work with the right routing context.

*Acceptance criteria:*
- City dropdown filters to cities with events that have sales routings.
- Event dropdown filters to events in the selected city.
- "Show" button loads channels and products for the selected routing.
- Left panel lists channels in the routing; selecting one loads its product visibility state.

**`B2BS-944` — Toggle product visibility**
As an ops user, I want to toggle individual product visibility within a channel using eye icons, so I can fine-tune what's available for sale.

*Acceptance criteria:*
- Right panel: product table with eye-icon toggles per product; product count indicator.
- "Show all" / "Hide all" buttons for quick bulk within the channel.
- Save and Discard buttons appear when there are pending (unsaved) changes.
- Default visibility (set during routing creation) determines the starting state: "All visible" = opt-out model; "None visible" = opt-in model.

**`B2BS-945` — Bulk-edit visibility across channels**
As an ops user, I want to select multiple channels and add or remove product visibility across all of them at once, so I don't have to repeat the same changes channel by channel.

*Acceptance criteria:*
- Checkboxes on the channel list allow multi-selection.
- "Edit in bulk" button opens a modal showing products with add/remove actions.
- Changes apply to all selected channels simultaneously.
- Save/Discard behavior consistent with single-channel editing.

---

## Definition of Done

Every story in this file is considered done when:

- [ ] Functional on standard desktop viewports (1280px+)
- [ ] Validation and error states implemented for all form inputs
- [ ] No regression in existing back-office flows
- [ ] Matches Figma (when linked)
- [ ] Relevant Mixpanel events instrumented per `product-management/analytics-taxonomy.md`

---

## Cross-Cutting Considerations

### Delivery Order

```
Epic 7 (Catalog Integration)    ← foundation; must exist before routing
Epic 8 (Sales Routing)          ← depends on Epic 7 (needs warehouses and products)
Epic 9 (Channel Visibility)     ← depends on Epic 8 (needs routings with channels)
```

Strictly sequential — each epic builds on the previous one.

### Relationship to POS Epics

The back-office epics feed the POS:

```
Epic 7 (Catalog Integration) → products, warehouses, categories, variants
Epic 8 (Sales Routing)       → event-channel-warehouse mappings used by POS
Epic 9 (Channel Visibility)  → controls which products appear in POS tile grid
```

POS Epics 4 (Category Nav), 5 (Product Variants), and 6 (Membership Pricing) consume catalog data configured here.

---

*Last updated: February 2026*
