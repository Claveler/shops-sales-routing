# Product Spec: Sales Routing & Catalog Integration

This document is the consolidated product specification for the **Catalog Integration** and **Sales Routing** features within the Fever Zone back-office. It draws from the internal PRODUCT_SPEC.md and the *Self-Service Linkage to IMS* PRD.

---

## 1. Overview

### What It Does

The Sales Routing and Catalog Integration features allow Fever partners to:

1. **Connect an external Inventory Management System (IMS)** -- currently Square, with Shopify planned -- to import their product catalog (retail, F&B, merchandise) into the Fever platform.
2. **Configure how those products are made available for sale** at specific events through selected sales channels (Box Office, Fever Marketplace, Whitelabel, Kiosks, OTAs).
3. **Control per-product channel visibility** with granular opt-in/opt-out toggles.

### Why It Exists

Prior to this initiative, connecting a partner's external inventory to the Fever platform was a manual, internal technical task. This created:

- **Slow onboarding**: Setting up a new retail/F&B catalog required intervention from the internal engineering team, delaying partner launches.
- **Error-prone configuration**: Manual entry of IDs (Master Catalog ID, Location IDs) and database linkages increased the risk of human error.
- **Lack of transparency**: Partners had no self-managed view of how their external inventory mapped to their Fever plans and POS devices.
- **High opportunity cost**: Internal engineering resources were consumed by repetitive configuration work.

The self-service capability eliminates these bottlenecks, empowering partners to independently set up and manage their product catalog configuration directly within Fever Zone.

### Where It Lives

A **Products** section in the Fever Zone left sidebar containing:

- **Guide** -- Step-by-step onboarding reference for operations teams
- **Catalog Integration** -- Connect external product catalogs (Square, Shopify)
- **Sales Routing** -- Configure how products are made available for sale at events
- **Channels** -- Configure per-product channel visibility

### Target Users

- Fever operations staff
- Partner administrators (Stock Managers, Admins)
- Sales demos for potential new partners

---

## 2. Core Concepts

### Partners

Business clients (museums, venues, event organizers, theme parks, etc.) who use Fever to sell tickets, F&B, and merchandise. Each partner manages multiple events.

### Catalog Integration (RetailSetup)

A connection to an external Inventory Management System (initially Square) that allows importing products into Fever. **Each partner can have only one catalog integration.** The catalog integration captures:

- The partner's external account identifier (Master Catalog ID)
- One or more physical inventory locations (Warehouses)
- Links to Fever Plans where products will be sold

### Warehouses

Represent physical product inventory locations. Each warehouse maps 1:1 to a location in the external system (e.g., a Square location). Products exist in warehouses with location-specific prices and stock levels.

### Sales Routing (RetailPlan)

Configuration that makes **physical products** (retail, F&B, merchandise) available for sale at specific events through selected channels. **There is a 1:1 relationship between events and sales routings** -- each event can have at most one routing, and the routing is identified by the event name (no separate routing name).

> **Important**: Sales routings govern **products only**, not tickets. Tickets are not physical inventory and do not require a sales routing, warehouse, or channel mapping. Tickets for any event can be sold at any POS regardless of which sales routing is configured. The sales routing determines which product catalog is available at the POS -- not which events can have their tickets sold.

A Sales Routing combines:

- Event selection (becomes the routing identifier)
- Channel selection (where products will be sold)
- Warehouse selection (where stock comes from)
- Channel-warehouse mapping (which warehouse serves which channel)

### Channels

Sales channels where products can be published:

| Channel | Type | Description |
|---------|------|-------------|
| **Box Office** | onsite | Physical POS at event venues |
| Fever Marketplace | online | fever.com website/app |
| Whitelabel | online | Partner's branded checkout |
| Kiosk | online | Self-service terminals |
| GetYourGuide | ota | Online travel agency |
| Viator | ota | Online travel agency |
| Tiqets | ota | Online travel agency |

**Box Office is special**: It is the only onsite channel. When selected, it removes the warehouse count limit entirely (unlimited warehouses). Multiple online channels also allow multi-warehouse selection, but capped at the number of online channels.

### Box Office Setup

Physical POS device configuration for onsite sales. The Box Office Setup selects which sales routing provides the **product catalog** for the POS device, determining which retail/F&B items are available in the Gift Shop tab. Multiple setups can use the same sales routing but pull stock from different warehouses. Ticket sales are independent of this configuration -- the POS can sell tickets for any event regardless of which sales routing is selected.

### Product Hierarchy (Categories)

Product categories imported from the external system (e.g., Square categories). Categories form a tree structure via parent-child relationships:

- Root categories: Apparel, Art & Prints, Music, Home & Living, Books, Experiences, Food & Wine
- Subcategories: e.g., Apparel -> T-Shirts, Apparel -> Accessories

---

## 3. Data Model

### Entity Relationship Diagram

```
+---------------------+
|   RetailSetup       |
| (CatalogIntegration)|
|---------------------|
| id                  |
| name                |
| partnerId           |
| masterCatalogId     |
| type (square/       |
|   shopify)          |
+---------+-----------+
          | 1:N
          v
+---------------------+       +---------------------+
|     Warehouse       |       |      Product        |
|---------------------|       |---------------------|
| id                  |       | id                  |
| name                |       | name                |
| retailSetupId       |       | sku                 |
| externalLocationId  |       | category            |
+---------------------+       | imageUrl            |
                              +---------+-----------+
          |                             |
          |         N:M                 |
          +-------------+------ -------+
                        v
          +---------------------+
          |  ProductWarehouse   |
          |---------------------|
          | productId           |
          | warehouseId         |
          | price               |
          | currency            |
          | stock               |
          +---------------------+

+---------------------+       +---------------------+
|   RetailPlan        |  1:1  |       Event         |
|  (SalesRouting)     |       |---------------------|
|---------------------|------>| id                  |
| id                  |       | name                |
| eventId             |       | venue               |
| channelIds[]        |       | city                |
| warehouseIds[]      |       | date                |
| priceReferenceId    |       | status              |
| channelWarehouse-   |       +---------------------+
|   Mapping{}         |
| channelDefault-     |       +---------------------+
|   Visibility{}      |       |      Channel        |
| status              |       |---------------------|
+---------------------+       | id                  |
                              | name                |
+---------------------+       | type (onsite/       |
|   BoxOfficeSetup    |       |   marketplace/      |
|---------------------|       |   whitelabel/       |
| id                  |       |   kiosk/ota)        |
| name                |       +---------------------+
| salesRoutingId      |
| warehouseId         |       +---------------------+
+---------------------+       |   Hierarchy         |
                              |---------------------|
+---------------------+       | id                  |
|  HierarchyElement   |       | name                |
|  (Category)         |       | retailSetupId       |
|---------------------|       +---------+-----------+
| id                  |                 | 1:N
| hierarchyId         |<----------------+
| parentId (nullable) |
| name                |       +---------------------+
| externalId          |       | HierarchyElement-   |
+---------------------+       |   Product           |
                              |---------------------|
                              | hierarchyElementId  |
                              | productId           |
                              +---------------------+
```

### Key Relationships

1. **Products belong to the Catalog Integration**, not to individual warehouses.
2. **ProductWarehouse** is a junction table storing warehouse-specific attributes (price, stock).
3. **A product can exist in multiple warehouses** with different prices and stock levels.
4. **SalesRouting references channels and warehouses** with explicit channel-warehouse mapping.
5. **BoxOfficeSetup determines stock source** for onsite sales when multiple warehouses exist.
6. **Price Reference determines pricing** for SessionTypes; channel-warehouse mapping determines stock source only.
7. **HierarchyElement** represents product categories imported from the external system. Categories form a tree via `parentId` (null = root category). The `HierarchyElementProduct` junction table maps products to categories.
8. **Product Variants** — Products may optionally have variants (e.g. sizes S/M/L/XL). Variant support uses three types:
   - **VariantAxis**: Defines a variant dimension (`name`: e.g. "Size", `values`: e.g. ["S","M","L","XL"])
   - **ProductVariant**: A concrete combination with its own `id`, `sku`, `attributes` map, and display `label`
   - Products gain optional `variantAxes` and `variants` arrays; products without variants are unchanged
   - **ProductWarehouse** gains an optional `variantId` field. For variant products, each variant has its own warehouse entry with independent price and stock. For simple products, `variantId` is omitted.

---

## 4. Business Logic

### Channel-Based Warehouse Selection Rules

| Scenario | Warehouse Rule | Price Reference | Channel Routing | Edit Behavior |
|----------|----------------|-----------------|-----------------|---------------|
| 1 online channel | Exactly 1 warehouse | N/A (only 1 warehouse) | Auto-assigned | Can only swap warehouse |
| N online channels (N > 1) | Up to N warehouses | Required if >1 warehouse | Assign each online channel to a warehouse | Can add warehouses (up to channel count) |
| Box Office + 0..N online | Unlimited warehouses | Required if >1 warehouse | Assign each online channel to a warehouse; Box Office configured separately | Can add warehouses (no cap) |

**Why these rules?**

Sales routings create **SessionTypes and Sessions** in Fever plans. Each SessionType has exactly ONE price. The **price reference warehouse** determines which prices are used for all SessionTypes, regardless of which warehouse the stock comes from.

- **Single online channel** keeps things simple: one warehouse serves as both the price source and stock source. No price reference needed, no channel routing decisions.
- **Multiple online channels** unlock multi-warehouse selection, capped at the number of online channels (one warehouse per channel). This allows different channels to pull stock from different locations. Since multiple warehouses may have different prices, a price reference is required to unify pricing across all SessionTypes.
- **Box Office (with or without online channels)** removes the warehouse cap entirely. Box Office is a physical POS channel where individual devices can pull from different stock locations (configured separately in Box Office Setup). This naturally requires unlimited warehouse access. Online channels in this scenario follow the same assignment rules.
- In the Fever POS UX split, physical inventory (governed by sales routings) is surfaced in the Gift Shop (retail) tab, while the Tickets & Add-Ons tab is reserved for ticket products and ticket-linked upgrades. Tickets do not flow through sales routings -- they can be sold for any event independently of the Box Office's configured sales routing.

### Price Reference vs Channel-Warehouse Mapping

These serve different purposes:

| Concept | Purpose | Affects |
|---------|---------|---------|
| **Price Reference** | Determines which warehouse's prices are used for SessionTypes | Pricing across ALL channels |
| **Channel-Warehouse Mapping** | Determines where stock is consumed when a sale occurs | Inventory only |

**Example:**

```
Channels: [Box Office, Fever Marketplace]
Warehouses: [Main Store ($10), Gift Shop ($12)]
Price Reference: Main Store
Mapping:
  - Box Office -> All warehouses (POS devices choose individually)
  - Fever Marketplace -> Gift Shop

Result:
  - All products priced at $10 (Main Store's prices)
  - Box Office sales decrement Main Store or Gift Shop stock (per POS config)
  - Marketplace sales decrement Gift Shop stock
```

### Distribution Rules

A product is considered **distributed** if its warehouse is mapped to at least one channel in an active routing:

```
FOR each routing:
  mappedWarehouses = values(routing.channelWarehouseMapping)
  IF routing has Box Office:
    mappedWarehouses = mappedWarehouses + routing.warehouseIds
  IF product's warehouse is in mappedWarehouses:
    product is DISTRIBUTED
```

### Undistributed Product Warnings

After syncing new products, the system identifies undistributed items:

| Warning Type | Condition | Actionability |
|--------------|-----------|---------------|
| "No sales routing" | Warehouse has no routing configured | Low -- requires creating a routing |
| "Not added to sales routing" | Routing exists but warehouse not mapped to any channel | Medium -- edit routing to add mapping |

---

## 5. Self-Service Catalog Configuration (from Self-Service Linkage to IMS PRD)

This flow defines how an authorized back-office user (Stock Manager or Admin) creates and manages the Product Catalog Configuration (RetailSetup), which links their external Square inventory to their Fever Plans.

### Accessing Stock Management

- **Path**: Box Office > Stock Management (new section in Fever Zone)
- **Initial View**: Stock Management List View showing all existing Product Catalog Configurations
- **Data Displayed**: Configuration Name, Integration Type (Square), Master Catalog ID, Linked Plans, associated Warehouse count
- **Actions**: Edit existing configuration or "Create new catalog configuration"

### Creating a New Configuration

#### A. Configuration Information

The user fills in the top-level details of the linkage (RetailSetup model):

1. **Name**: Descriptive name (e.g., "Visitor's Centre F&B", "Gift Shop Catalog")
2. **Integration Type**: Read-only, defaults to Square for MVP
3. **Master Catalog ID**: The unique ID of their Square Account

#### B. Defining Warehouses (Square Locations)

The user manually links physical Square locations:

1. **Input Fields**: Pairs of Location Name + Location ID (External ID)
2. **Add/Remove**: + Add button to add new location pairs
3. **Future Enhancement**: Auto-pull locations from Square API based on Master Catalog ID

#### C. Linking Plans

The user defines which Fever Plans will sell products from this linked inventory:

1. **Plans Selector**: Multi-select dropdown for Fever Plans
2. **Constraint**: A Plan can only be associated with one Product Catalog Configuration
3. **Link Available Warehouses per Plan**
4. **Define Warehouse Used as Price Reference**

### Saving and Initial Sync

1. User clicks "Create" or "Save changes"
2. System validates required fields (Name, Master Catalog ID, at least one Plan, at least one Warehouse)
3. RetailSetup, RetailPlan records, and Warehouse records are created/updated in the Shops microservice
4. System triggers product synchronization from the Square Master Catalog
5. Notification informs user of sync progress and links to the Products overview

---

## 6. Sales Routing Wizard

### Unified 5-Step Flow

```
Event -> Channels -> Warehouses -> Channel Routing -> Review
```

#### Step 1: Event Selection

- Choose the Fever event/plan where products will be sold
- Search/filter available events
- Events with existing routings are disabled (1:1 relationship)

#### Step 2: Channel Selection

- Multi-select available channels
- Box Office highlighted as special (onsite)
- Online channels grouped separately
- Explanatory text about implications

#### Step 3: Warehouse Selection

- **If 1 online channel**: Single warehouse selection (radio buttons)
- **If N online channels (N > 1)**: Multiple warehouse selection (checkboxes), up to N warehouses, with price reference selector when >1 selected
- **If Box Office included**: Multiple warehouse selection (checkboxes), unlimited warehouses, with price reference selector when >1 selected
- Dynamic explanation based on selected channels and count

#### Step 4: Channel Routing

- Map each selected channel to one warehouse
- If only 1 warehouse selected, auto-populate all mappings
- Box Office note: "POS devices can be configured individually later"
- Default visibility selection for each online channel (All visible / None visible)

#### Step 5: Review & Create

- Summary of all selections (event, channels, warehouses, mappings)
- Status selection (Draft / Active / Inactive)
- Create button
- Routing is identified by the event name (no separate name field)

---

## 7. Product Channel Visibility

### Overview

The **Channels** page (Products > Channels) provides granular control over which products are visible in each sales channel. This is analogous to the ticket-type channel visibility feature in Fever Zone's Events section.

### Default Visibility

When creating a sales routing, users choose the default visibility for each channel:

- **All visible** (opt-out model): All products start visible; users hide specific products
- **None visible** (opt-in model): No products visible initially; users add products they want to show

### User Interface

**Navigation**: Users must first select an event:

1. **City Selector**: Dropdown showing cities with events that have sales routings
2. **Event Selector**: Dropdown showing events in the selected city
3. **Show Button**: Loads the channels for the selected event/routing

**Page Layout** (after event selection):

- **Left Panel (30%)**: Channel list filtered to channels in the selected routing; checkboxes for bulk selection; "Edit in bulk" button
- **Right Panel (70%)**: Products in selected channel; product count indicator; "Show all" / "Hide all" buttons; Save and Discard buttons (appear when changes are pending); table with visibility toggles

**Single Channel Editing**: Click a channel > view all products > toggle visibility with eye icons > Save to commit or Discard to revert.

**Bulk Editing**: Select multiple channels via checkboxes > "Edit in bulk" > modal to add/remove product visibility across selected channels.

### Data Model

```typescript
interface ProductChannelVisibility {
  productId: string;
  channelId: string;
  routingId: string;  // Scoped to a specific sales routing
  visible: boolean;
}

// SalesRouting extended with:
channelDefaultVisibility?: Record<string, 'all' | 'none'>;
```

---

## 8. UI Components

### Sales Routing List

- Table showing all configured routings
- Columns: Event (name + venue), Status, Distribution (expandable), Actions
- Expandable rows show channel-warehouse mappings
- "Create new sales routing" CTA
- Empty state when no routings exist

### Create Routing Wizard

See Section 6 for the full 5-step flow.

### Edit Routing

Single-page layout with all configuration in one scrollable view.

**Immutable**: Event (cannot be changed; routing is tied to event)

**Editable**: Warehouses, Price Reference, Channels, Channel-Warehouse Mapping, Status (Draft / Active / Inactive)

**Constraints**: Nothing can be deleted (warehouses, channels, or relationships). Routings cannot be deleted, only deactivated.

### Catalog Integration Page

- **Empty state**: Prompts to create first integration; shows benefits and supported providers
- **Provider Modal**: Full-screen overlay for choosing Square/Shopify
- **Existing integration**: Integration header, "Sync products" button, tab-based view (Products / Warehouses), search/pagination/filters
- **Variants column**: The Products table includes a "Variants" column. Products with variants show a clickable badge (e.g. "4 sizes") that expands inline sub-rows showing each variant's label, SKU, total stock, and price range across warehouses. Products without variants show "—".
- **Warehouse side panel with variants**: When viewing warehouse details for a variant product, the side panel shows a per-variant breakdown within each warehouse (variant label pill, stock count, and price).

### Guide Page

In-app onboarding reference for ops teams. Sections: Overview, Step 1 (Catalog Integration), Step 2 (Sales Routings), Step 3 (Channel Visibility), Key Concepts, Tips & FAQ.

---

## 9. Demo Flow

The mockup supports two modes: a **preloaded static mode** with existing data, and a **reset demo mode** that walks through the full setup from a blank slate.

### Unified Data

The preloaded (static) product data is identical to the demo data used during the reset flow. Both modes use the same 25 products (`demo-p-001` through `demo-p-025`), 3 warehouses (Main Store, Gift Shop, Pop-up Store), and the same product-warehouse mappings. This ensures a consistent product catalog regardless of which mode is active.

### Static Mode (Default)

The app loads with a pre-configured catalog integration, 3 warehouses, 25 products, 5 sales routings, and 4 Box Office setups already in place. Users can browse the full UI, edit routings, and explore channel visibility without running the setup wizard.

### Reset Demo Mode

Click "Reset Demo" in the footer to clear all state and walk through the full end-to-end setup:

1. **Create Catalog Integration**: Navigate to Catalog Integration > create integration > select Square > enter Master Catalog ID > add 3 warehouses (Main Store, Gift Shop, Pop-up Store) > review and create
2. **First Product Sync**: Click "Sync products" > 20 products imported across 3 warehouses > all show as "Unpublished"
3. **Single-Channel Online Routing (simplest)**: Select event (Taylor Swift) > Fever Marketplace only > single warehouse > create
4. **Multi-Channel Online Routing (medium)**: Select event (Van Gogh) > Fever Marketplace + Whitelabel > 2 warehouses > set price reference > assign channels > create
5. **Hybrid Routing with Box Office (complex)**: Select event (Hans Zimmer) > Box Office + Fever Marketplace > unlimited warehouses > set price reference > map channels > create
6. **Second Product Sync**: Return to Catalog Integration > sync 5 new products > auto-distributed based on channel mappings > warnings for unmapped products

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Partner** | A Fever business client (museum, venue, organizer) |
| **RetailSetup** | Internal name for Catalog Integration |
| **RetailPlan** | Internal name for Sales Routing |
| **Warehouse** | Product location with inventory, maps 1:1 to an external system location |
| **Channel** | Sales point (Box Office, Marketplace, Whitelabel, Kiosk, OTA) |
| **Channel-Warehouse Mapping** | Configuration linking each channel to a warehouse for stock sourcing |
| **Box Office** | Physical POS system for onsite sales (only onsite channel) |
| **Price Reference** | Designated warehouse whose prices are used for ALL SessionTypes in the routing |
| **Distribution** | Making a product available for sale through channels (formerly "Publication") |
| **Session Type ID** | Internal Fever identifier for a product distribution |
| **Category / HierarchyElement** | Product categorization imported from external system, stored as a tree |
| **Product Channel Visibility** | Configuration controlling which products appear in each sales channel |
| **Default Visibility** | Setting determining if products start visible (opt-out) or hidden (opt-in) |
| **Master Catalog ID** | The unique identifier for a partner's Square Account used to link Fever to their inventory |
| **IMS** | Inventory Management System (Square, Shopify, or future integrations) |

---

*Last updated: February 2026*
