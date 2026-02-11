# Product Specification: Sales Routing & Catalog Integration

This document captures the data model, business logic, and product requirements for the Sales Routing and Catalog Integration features in the Fever Zone back-office.

---

## 1. Overview

### Purpose
This is a high-fidelity front-end mockup of new functionality for the **Fever Zone**, Fever's back-office platform where partners (business clients) manage their events and operations.

### Scope
A new **Products** section in the left sidebar containing:
- **Guide** - Step-by-step onboarding reference for operations teams explaining the full setup process
- **Catalog Integration** - Connect external product catalogs (Square, Shopify)
- **Sales Routing** - Configure how products are made available for sale at events
- **Channels** - Configure per-product channel visibility (granular control over which products appear in each channel)

### Target Users
- Fever operations staff
- Partner administrators
- Demos for potential new partners

---

## 2. Core Concepts

### Fever Zone
The back-office interface for Fever partners to manage events, tickets, and now physical products.

### Partners
Business clients (e.g., museums, venues, event organizers) who use Fever to sell tickets and merchandise. Each partner manages multiple events.

### Catalog Integration (RetailSetup)
A connection to an external system (Square or Shopify) that allows importing products into Fever. **Each partner can have only one catalog integration.**

### Warehouses
Represent product inventory locations. Each warehouse maps 1:1 to a location in the external system (e.g., a Square location). Products exist in warehouses with location-specific prices and stock levels.

### Sales Routing (RetailPlan)
Configuration that makes products available for sale at specific events through selected channels. **There is a 1:1 relationship between events and sales routings** - each event can have at most one routing, and the routing is identified by the event name (no separate routing name).

Combines:
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

**Box Office is special**: It's the only onsite channel. When selected, it removes the warehouse count limit entirely (unlimited warehouses). Multiple online channels also allow multi-warehouse selection, but capped at the number of online channels.

### Box Office Setup
Physical POS device configuration for onsite sales. Multiple setups can use the same sales routing but pull stock from different warehouses.

---

## 3. Data Model

### Entity Relationship Diagram

```
┌─────────────────────┐
│   RetailSetup       │
│ (CatalogIntegration)│
│─────────────────────│
│ id                  │
│ name                │
│ partnerId           │
│ masterCatalogId     │
│ type (square/       │
│   shopify)          │
└─────────┬───────────┘
          │ 1:N
          ▼
┌─────────────────────┐       ┌─────────────────────┐
│     Warehouse       │       │      Product        │
│─────────────────────│       │─────────────────────│
│ id                  │       │ id                  │
│ name                │       │ name                │
│ retailSetupId       │       │ sku                 │
│ externalLocationId  │       │ category            │
└─────────┬───────────┘       │ imageUrl            │
                              └─────────┬───────────┘
          │                             │
          │         N:M                 │
          └──────────┬──────────────────┘
                     ▼
          ┌─────────────────────┐
          │  ProductWarehouse   │
          │─────────────────────│
          │ productId           │
          │ warehouseId         │
          │ price               │
          │ currency            │
          │ stock               │
          └─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│   RetailPlan        │  1:1  │       Event         │
│  (SalesRouting)     │       │─────────────────────│
│─────────────────────│──────▶│ id                  │
│ id                  │       │ name                │
│ eventId             │       │ venue               │
│ channelIds[]        │       │ city                │
│ warehouseIds[]      │       │ date                │
│ priceReferenceId    │       │ status              │
│ channelWarehouse-   │       └─────────────────────┘
│   Mapping{}         │
│ channelDefault-     │       ┌─────────────────────┐
│   Visibility{}      │       │      Channel        │
│ status              │       │─────────────────────│
└─────────────────────┘       │ id                  │
                              │ name                │
┌─────────────────────┐       │ type (onsite/       │
│   BoxOfficeSetup    │       │   marketplace/      │
│─────────────────────│       │   whitelabel/       │
│ id                  │       │   kiosk/ota)        │
│ name                │       └─────────────────────┘
│ salesRoutingId      │
│ warehouseId         │       ┌─────────────────────┐
└─────────────────────┘       │   Hierarchy         │
                              │─────────────────────│
┌─────────────────────┐       │ id                  │
│  HierarchyElement   │       │ name                │
│  (Category)         │       │ retailSetupId       │
│─────────────────────│       └─────────┬───────────┘
│ id                  │                 │ 1:N
│ hierarchyId         │◀────────────────┘
│ parentId (nullable) │
│ name                │       ┌─────────────────────┐
│ externalId          │       │HierarchyElement-    │
└─────────────────────┘       │  Product            │
                              │─────────────────────│
                              │ hierarchyElementId  │
                              │ productId           │
                              └─────────────────────┘
```

### Key Relationships

1. **Products belong to the Catalog Integration**, not to individual warehouses
2. **ProductWarehouse** is a junction table storing warehouse-specific attributes (price, stock)
3. **A product can exist in multiple warehouses** with different prices/stock
4. **SalesRouting references channels and warehouses** with explicit channel-warehouse mapping
5. **BoxOfficeSetup determines stock source** for onsite sales when multiple warehouses exist
6. **Price Reference determines pricing** for SessionTypes; channel-warehouse mapping determines stock source only
7. **HierarchyElement** represents product categories imported from the external system (e.g., Square categories). Categories form a tree via `parentId` (null = root category). The `HierarchyElementProduct` junction table maps products to categories.
8. **Product categories** include: Apparel, Art & Prints, Music, Home & Living, Books, Experiences, Food & Wine (root level), each with subcategories (e.g., Apparel → T-Shirts, Apparel → Accessories)

---

## 4. Business Logic

### Channel-Based Warehouse Selection Rules

| Scenario | Warehouse Rule | Price Reference | Channel Routing | Edit Behavior |
|----------|----------------|-----------------|-----------------|---------------|
| 1 online channel | Exactly 1 warehouse | N/A (only 1 warehouse) | Auto-assigned | Can only swap warehouse |
| N online channels (N > 1) | Up to N warehouses | Required if >1 warehouse | Assign each online channel to a warehouse | Can add warehouses (up to channel count) |
| Box Office + 0..N online | Unlimited warehouses | Required if >1 warehouse | Assign each online channel to a warehouse; Box Office configured separately | Can add warehouses (no cap) |

**Why these rules? The number of channels and the Price Reference are the key factors.**

Sales routings create **SessionTypes and Sessions** in Fever plans. Each SessionType has exactly ONE price. The **price reference warehouse** determines which prices are used for all SessionTypes, regardless of which warehouse the stock comes from.

- **Single online channel** keeps things simple: one warehouse serves as both the price source and stock source. No price reference needed, no channel routing decisions.

- **Multiple online channels** unlock multi-warehouse selection, capped at the number of online channels (one warehouse per channel). This allows different channels to pull stock from different locations. Since multiple warehouses may have different prices, a price reference is required to unify pricing across all SessionTypes.

- **Box Office (with or without online channels)** removes the warehouse cap entirely. Box Office is a physical POS channel where individual devices can pull from different stock locations (configured separately in Box Office Setup). This naturally requires unlimited warehouse access. Online channels in this scenario follow the same assignment rules.

**Warning for unassigned warehouses:**
If a user selects X warehouses but only assigns Y of them to channels in the routing step (Y < X), a non-blocking warning is shown: the unassigned warehouses are listed, and the user is advised to either remove them or assign them.

**Edit constraints:**
- Single-channel routings (single-warehouse): Users can only swap the warehouse for a different one; this automatically updates all channel mappings
- Multi-channel routings (multi-warehouse): Users can add new warehouses up to the channel-count cap (or unlimited if Box Office is present)

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
  - Box Office → All warehouses (POS devices choose individually)
  - Fever Marketplace → Gift Shop

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
  // For Box Office, all warehouseIds are implicitly mapped
  IF routing has Box Office:
    mappedWarehouses = mappedWarehouses + routing.warehouseIds
  IF product's warehouse is in mappedWarehouses:
    product is DISTRIBUTED
```

### Undistributed Product Warnings

After syncing new products, the system identifies undistributed items and categorizes them:

| Warning Type | Condition | Actionability |
|--------------|-----------|---------------|
| "No sales routing" | Warehouse has no routing configured | Low - requires creating a routing |
| "Not added to sales routing" | Routing exists but warehouse not mapped to any channel | Medium - edit routing to add mapping |

---

## 5. Sales Routing Wizard

### Unified 5-Step Flow

```
Event → Channels → Warehouses → Channel Routing → Review
```

#### Step 1: Event Selection
- Choose the Fever event/plan where products will be sold
- Search/filter available events

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

#### Step 5: Review & Create
- Summary of all selections (event, channels, warehouses, mappings)
- Status selection (Draft/Active/Inactive)
- Create button
- Note: Routing is identified by the event name (no separate name field due to 1:1 relationship)

---

## 6. Demo Flow

The mockup supports a full end-to-end demo starting from a blank slate.

### Prerequisites
- Click "Reset Demo" in footer to clear all state

### Step-by-Step Flow

#### Step 1: Create Catalog Integration
1. Navigate to Products → Catalog Integration
2. See empty state prompting to create integration
3. Click "Create catalog integration"
4. Select provider: **Square**
5. Enter Master Catalog ID: `sq_merchant_demo_12345`
6. Add 3 warehouses:
   - **Main Store** (LOC_MAIN_001)
   - **Gift Shop** (LOC_GIFT_001)
   - **Pop-up Store** (LOC_POPUP_001)
7. Review and create

#### Step 2: First Product Sync
1. On integration details page, click "Sync products"
2. ~20 products are imported across the 3 warehouses
3. All products show as "Unpublished" (no routings yet)

#### Step 3: Create Single-Channel Online Routing (Taylor Swift) - Simplest
1. Navigate to Products → Sales Routing
2. Click "Create new sales routing"
3. Select event: **Candlelight: Tribute to Taylor Swift** (1st in list - St. James Church, Madrid)
4. Select channel: **Fever Marketplace** (single online channel)
5. Select warehouse: **ES - Shops Square Testing** (only one warehouse needed)
6. Create routing

**Concept introduced:** Basic flow - products from one warehouse sold online at one event.

#### Step 4: Create Multi-Channel Online Routing (Van Gogh) - Medium
1. Create another routing for **Van Gogh: The Immersive Experience** (2nd in list - Exhibition Hall, Barcelona)
2. Select channels: **Fever Marketplace** + **Whitelabel** (two online channels)
3. Two online channels unlock multi-warehouse: select **ES - Shops Square Testing** + **ES - Shops Shopify Testing** (up to 2 warehouses, one per channel)
4. Set price reference: **ES - Shops Square Testing**
5. Assign channels:
   - Fever Marketplace → ES - Shops Square Testing
   - Whitelabel → ES - Shops Shopify Testing
6. Create routing

**Concepts introduced:** Multiple online channels unlock multi-warehouse selection (capped at channel count), price reference for unified pricing, per-channel warehouse assignment.

#### Step 5: Create Hybrid Routing with Box Office (Hans Zimmer) - Complex
1. Create routing for **Candlelight: Best of Hans Zimmer** (3rd in list - Teatro Real, Madrid)
2. Select channels: **Box Office** + **Fever Marketplace** (hybrid: onsite + online)
3. Box Office unlocks multi-warehouse selection
4. Select warehouses: **ES - Shops Square Testing** + **ES - Shops Shopify Testing**
5. Set price reference: **ES - Shops Square Testing** (determines pricing for all SessionTypes)
6. Map channels:
   - Box Office → All warehouses (each POS device chooses individually)
   - Fever Marketplace → ES - Shops Shopify Testing (stock source only; uses price ref pricing)
7. Create routing

**Concepts introduced:** Box Office, multi-warehouse, price reference, channel-warehouse mapping for stock source.

#### Step 6: Second Product Sync
1. Return to Catalog Integration
2. Click "Sync new products"
3. New products are imported and auto-distributed based on channel mappings
4. Products in mapped warehouses show as "Distributed"
5. Products in unmapped warehouses show warnings

---

## 7. UI Components

### Sales Routing List
- Table showing all configured routings
- Columns: Event (name + venue), Status, Distribution (expandable), Actions
- Expandable rows show channel-warehouse mappings:
  - Box Office channels group warehouses together (label shown once)
  - Online channels show individual warehouse assignments
  - Price reference indicator (star icon) for multi-warehouse routings
- "Create new sales routing" CTA
- Events with existing routings are disabled in the creation wizard (1:1 relationship)
- Click edit button to modify routing
- Empty state (`SalesRoutingEmptyState`) when no routings exist
- Distribution details modal for viewing full routing details
- Delete confirm modal for routing deletion
- Design Pending banner shown on page

### Create Routing Wizard
See Section 5 for detailed flow.

### Edit Routing
Single-page layout with all configuration in one scrollable view.

**Immutable:**
- Event (cannot be changed; routing is tied to event)

**Editable:**
- **Warehouses**: Can add new warehouses (if multi-warehouse: up to channel count for online-only, or unlimited for Box Office) or swap warehouse (if single online channel)
- **Price Reference**: Can change which warehouse provides the price reference
- **Channels**: Can add new channels
- **Channel-Warehouse Mapping**: Can change which warehouse serves each channel
- **Status**: Draft / Active / Inactive

**Constraints:**
- Nothing can be deleted (warehouses, channels, or channel-warehouse relationships)
- Routings cannot be deleted, only deactivated (set to Inactive status)
- When swapping a single warehouse (single-channel routing), all channel mappings auto-update

### Catalog Integration Page

**Empty state:**
- Prompts to create first integration
- Shows benefits and supported providers
- Triggers provider modal for provider selection (Square/Shopify)

**Provider Modal:**
- Full-screen overlay modal for choosing an integration provider
- Displays Square and Shopify as selectable options via `ProviderSelector`
- Continue button navigates to the Create Integration Wizard with the selected provider
- Cancel returns to the empty state

**Existing integration:**
- Integration header with provider logo, name, account ID
- "Sync products" button with loading animation
- Tab-based view: **Products** tab (default) and **Warehouses** tab
- Products table with search, pagination (10 per page), and filter side panel
- Warehouses table with warehouse details
- Edit integration name via side panel (`EditIntegrationSidePanel`)
- View product warehouse details via side panel (`WarehouseSidePanel`)
- View product distribution details via publication modal (`PublicationModal`)
- Warehouse popover for quick warehouse info in product rows

**Edit Integration Side Panel:**
- Slide-in panel from the right with overlay backdrop
- Floating label input for editing integration name
- Validation (non-empty name required)
- Enter key to save, Escape to close

**Filter Side Panel:**
- Slide-in panel from the right for product filtering
- Filters: Warehouse, Distribution Status, Event, Channel, Category
- Floating label select inputs
- Warning alert when no sales routing is configured
- "Apply filters" button showing result count
- "Clear filters" button to reset all

**Warehouse Side Panel:**
- Slide-in panel showing product availability across warehouses
- Displays warehouse name, stock level, and formatted price per warehouse
- Icon-decorated rows

### "New" Badge on Products

After a product sync, newly imported products display a **"New" badge** next to their name in the product list. This helps users quickly identify which items were recently added to the catalog.

**Behavior:**
- The "New" badge appears on products that were imported in the **most recent sync** and whose `syncedAt` timestamp is within the last **3 days**
- When a new manual sync is triggered, the badge is removed from previously-synced products — only the products from the latest sync batch are considered "new"
- After 3 days from the sync date, the badge automatically stops being shown (auto-expiry fallback)
- The badge is purely visual — it does not affect the product's background row color or any other styling; the row background remains the same as non-new products
- The badge uses the info/solid tag style (light blue background `#73bff6`, dark text)

**Data:**
- Based on the `syncedAt` field on the `Product` entity (ISO 8601 timestamp set at sync time)
- Compared against the `lastSyncTimestamp` stored on the demo state — only products whose `syncedAt` matches the last sync timestamp are shown as "new"
- No separate tracking of "new" product IDs is required — the badge is derived from `syncedAt` and `lastSyncTimestamp` at render time

### Product Filters
- **Search**: Text search by name or SKU (inline in the table header)
- **Filter Side Panel**: Dedicated slide-in panel with advanced filters:
  - **Warehouse**: Filter by specific warehouse
  - **Distribution Status**: All / Distributed / Not distributed
  - **Event**: Filter by event where distributed
  - **Channel**: Filter by sales channel
  - **Category**: Filter by product category (imported from external system)
- Filter button in the table header opens the side panel
- Result count shown on the Apply button
- Clear all filters option

### Distribution Modal
Renamed from "Publication Modal" for consistency with Sales Routing terminology.

- Master-detail layout
- Left sidebar: List of events where product is distributed
- Right panel: Distribution details per event:
  - Stock source (warehouse)
  - Channels (with icons: Box Office, Online, or both)
  - Box Office setups (if applicable)
  - Session Type ID
- First event auto-expanded
- Channel icons displayed as small badges below venue name

### Guide Page

An in-app onboarding reference designed for Fever operations teams. Accessible at **Products → Guide** in the sidebar.

**Purpose:** Provides a plain-language, step-by-step walkthrough of the entire product sales setup process so ops teams can self-serve without external documentation.

**Sections:**
1. **Overview** — High-level summary of the three-step setup flow
2. **Step 1: Set up your Catalog Integration** — Connecting Square/Shopify, adding warehouses, syncing products. Links to the Catalog Integration page.
3. **Step 2: Create Sales Routings** — The 5-step wizard, three complexity levels (single-channel, multi-channel, hybrid with Box Office). Links to the Sales Routing page.
4. **Step 3: Configure Channel Visibility** — Per-product visibility control, bulk editing, default visibility. Links to the Channels page.
5. **Key Concepts** — Quick-reference grid for channels, warehouses, price reference, distribution, Box Office, and product visibility.
6. **Tips & FAQ** — Answers to common questions (new product syncs, editing routings, price reference purpose, Box Office behavior, recommended order).

**Design:** Card-based layout using the shared `Card` and `PageHeader` components. Numbered step badges, icon-decorated sections, info callout boxes, and internal navigation links to each relevant page.

### Design Pending Banner

A reusable banner component (`DesignPendingBanner`) displayed on pages/sections where the visual design is still being refined.

- Pencil-ruler icon with customizable message
- Default message: "Design pending"
- Used across Sales Routing List, Channels Page, and other pages during iterative design

---

## 8. Technical Implementation

### State Management
- **DemoContext**: Centralized state for demo mode with two operating modes:
  - **Static Mode** (default): Uses pre-populated mock data for "steady state" demos
  - **Reset Mode** (`isResetMode: true`): Blank-slate state for guided demo flows
- Stores: integration, warehouses, products, productWarehouses, salesRoutings, productPublications, boxOfficeSetups, hierarchyElements, hierarchyElementProducts, productChannelVisibility
- **Actions**: `resetDemo()`, `exitResetMode()`, `createIntegration()`, `updateIntegrationName()`, `syncProducts()`, `createRouting()`, `updateRouting()`, `deleteRouting()`
- **Sync tracking**: `lastSyncTimestamp` records when the most recent sync occurred; used to determine which products display the "New" badge
- **Computed getters**: Unified API (`getIntegration()`, `getWarehouses()`, `getProducts()`, etc.) that works transparently in both modes
- **Category helpers**: `getProductCategory()`, `getProductCategoryPath()` for hierarchy-based categorization
- **Visibility helpers**: `isProductVisibleInChannel()`, `setProductChannelVisibility()`, `bulkSetProductChannelVisibility()`, `initializeChannelVisibility()`
- **Publication helpers**: `isProductPublished()`, `getUnpublishedReason()`

### Data Sources
- **Static mock data** (`mockData.ts`): Pre-configured data for "steady state" demos (6 events, 1 integration, 6 warehouses, 17 products, 5 routings, 4 box office setups, category hierarchy)
- **Dynamic demo data** (`productPool.ts`): Created during demo flow — includes 20 initial products, 5 second-sync products, warehouse assignments, and category assignments

### Key Files
```
src/
├── context/
│   └── DemoContext.tsx           # Demo state management (two-mode architecture)
├── data/
│   ├── mockData.ts              # Static entities, types, and relationships
│   └── productPool.ts           # Demo-specific product/warehouse pool data
├── styles/
│   ├── variables.css            # Ignite Design System tokens (100+ CSS variables)
│   └── global.css               # CSS reset, base typography, scrollbar styles
├── components/
│   ├── common/
│   │   ├── Button.tsx           # Reusable button (primary/secondary/outline/ghost/danger)
│   │   ├── Table.tsx            # Table with Head/Body/Row/Cell sub-components
│   │   ├── Card.tsx             # Card with Header/Title/Body sub-components
│   │   ├── Badge.tsx            # Status badge (success/warning/secondary/info/danger)
│   │   ├── PageHeader.tsx       # Page header with breadcrumbs
│   │   ├── Breadcrumb.tsx       # Breadcrumb navigation
│   │   ├── Toast.tsx            # Toast notification
│   │   └── DesignPendingBanner.tsx  # Design-in-progress banner
│   ├── layout/
│   │   ├── Layout.tsx           # Main app layout (sidebar + header + content)
│   │   ├── Header.tsx           # Top navigation bar
│   │   ├── Sidebar.tsx          # Left navigation with expandable menu
│   │   └── Footer.tsx           # Page footer
│   ├── guide/
│   │   └── GuidePage.tsx        # Step-by-step onboarding guide for ops teams
│   ├── catalog-integration/
│   │   ├── CatalogIntegrationPage.tsx   # Main page (empty state or details)
│   │   ├── IntegrationDetails.tsx       # Detail view (tabs, products, warehouses)
│   │   ├── CreateIntegrationWizard.tsx  # Multi-step integration wizard
│   │   ├── EmptyState.tsx               # Empty state prompt
│   │   ├── ProviderSelector.tsx         # Square/Shopify provider cards
│   │   ├── ProviderModal.tsx            # Modal for provider selection
│   │   ├── EditIntegrationSidePanel.tsx # Side panel for editing name
│   │   ├── FilterSidePanel.tsx          # Side panel for product filters
│   │   ├── WarehouseSidePanel.tsx       # Side panel for warehouse details
│   │   ├── WarehousePopover.tsx         # Quick warehouse info popover
│   │   └── PublicationModal.tsx         # Distribution details modal
│   ├── sales-routing/
│   │   ├── SalesRoutingList.tsx          # Routing list with expandable rows
│   │   ├── SalesRoutingEmptyState.tsx   # Empty state for no routings
│   │   ├── CreateRoutingWizard.tsx      # Multi-step routing wizard
│   │   ├── EditRouting.tsx              # Single-page routing editor
│   │   ├── EventSelector.tsx            # Event picker
│   │   ├── ChannelSelector.tsx          # Channel multi-select
│   │   ├── WarehouseSelector.tsx        # Warehouse picker with rules
│   │   ├── ChannelRoutingStep.tsx       # Channel-warehouse mapping
│   │   ├── ProductSelector.tsx          # Product selection for routing
│   │   ├── ChannelProductMapping.tsx    # Channel-product mapping UI
│   │   ├── ReviewStep.tsx               # Review & create step
│   │   ├── DeleteConfirmModal.tsx       # Routing deletion confirmation
│   │   └── DistributionDetailsModal.tsx # Full distribution info modal
│   └── channels/
│       ├── ChannelsPage.tsx        # Main page with city/event selectors
│       ├── ChannelList.tsx         # Left panel channel list with checkboxes
│       ├── ChannelProductList.tsx  # Right panel product visibility table
│       └── BulkEditModal.tsx       # Modal for bulk visibility changes
```

---

## 9. Design Constraints

### Design System
Uses the **Fever Zone Ignite Design System** (synced from https://design.fevertools.com/1d4a57dde/p/52e17c). All design tokens are defined as CSS custom properties in `src/styles/variables.css`.

### Fever Brand Guidelines
- Primary color: `--fz-primary: #0089E3` (Fever blue, DS primary-500)
- Primary scale: `--fz-primary-100` through `--fz-primary-900`
- Neutral scale: `--fz-neutral-50` through `--fz-neutral-900`
- Accent: `--fz-accent: #6F41D7`
- Font: Montserrat (`--fz-font-family`), weights 400 (regular) and 600 (semibold) only
- Button styles: Primary, Secondary, Outline, Ghost, Danger
- Button heights: `--fz-btn-height-sm: 32px`, `--fz-btn-height-lg: 48px`
- Border radius: Pill buttons (`--fz-border-radius-pill: 64px`)

### Fever Zone Styling
- Sidebar: `--fz-sidebar-width: 256px` expanded, `--fz-sidebar-collapsed-width: 56px` collapsed
- Dark background: `--fz-bg-dark: #06232C` (header, sidebar, page-title area)
- Content background: `--fz-bg-content: #FFFFFF`
- Header height: `--fz-header-height: 72px`
- Tables: Fever-style with subtle hover rows (`--fz-bg-subtle: #F9FAFB`)
- Inputs: Floating label pattern, `--fz-input-height: 56px`
- Modal scrim: `--fz-bg-scrim: rgba(6, 35, 44, 0.88)`
- Shadows: 4-level elevation scale (`--fz-shadow` to `--fz-shadow-xl`)
- Spacing: 4-unit grid (`--fz-spacing-xs: 4px` to `--fz-spacing-4xl: 48px`)
- Transitions: `--fz-transition: 0.26s cubic-bezier(0.1, 0, 0, 1)`

### Styling Approach
- **CSS Modules**: Every component uses co-located `.module.css` files for scoped styling
- **Global styles**: CSS reset, base typography, and scrollbar customization in `global.css`
- **No CSS-in-JS**: Pure CSS Modules with design token variables

---

## 10. Product Channel Visibility

### Overview
The **Channels** page (Products → Channels) provides granular control over which products are visible in each sales channel. This is analogous to the ticket-type channel visibility feature in Fever Zone's Events section for tickets.

### Key Concepts

**Default Visibility**: When creating a sales routing, users can choose the default visibility for each channel:
- **All visible** (opt-out model): All products from the connected warehouse start visible; users can hide specific products
- **None visible** (opt-in model): No products are visible initially; users must add products they want to show

**Visibility per Channel**: Each product can be independently shown or hidden in each online channel. Box Office channels don't support per-product visibility (all products in connected warehouses are available).

### User Interface

**Channels Page Navigation**:
Before viewing or editing visibility, users must select an event:
1. **City Selector**: Dropdown showing cities that have events with sales routings
2. **Event Selector**: Dropdown showing events in the selected city (enabled after city selection)
3. **Show Button**: Loads the channels for the selected event/routing

This matches the Fever Zone pattern where users first narrow down by geography before seeing channel details.

**Channels Page Layout** (after event selection):
- **Left Panel (30%)**: Channel list filtered to channels in the selected routing
  - Filter by channel type
  - Search channels
  - Checkboxes for bulk selection
  - "Edit in bulk" button (enabled when multiple selected)
- **Right Panel (70%)**: Products in selected channel
  - Product count indicator (e.g., "3 of 14 products visible")
  - "Show all" / "Hide all" buttons
  - Save and Discard buttons (appear when changes are pending)
  - Search and filter by category
  - Table with visibility toggles

**Single Channel Editing**:
1. Click a channel in the left panel
2. View all products from connected warehouses
3. Toggle visibility with eye icons (changes are staged, not saved immediately)
4. Click **Save** to commit changes, or **Discard** to revert

**Batch Save Behavior**:
Visibility changes are staged locally and require explicit saving:
1. Toggle visibility, or click "Show all" / "Hide all" - changes are staged
2. **Save** and **Discard** buttons appear when there are pending changes
3. Click **Save** to commit all changes, or **Discard** to revert
4. Switching to a different channel or routing automatically discards pending changes

This prevents accidental changes and allows users to preview before committing.

**Bulk Editing**:
1. Select multiple channels using checkboxes
2. Click "Edit in bulk" button
3. Modal appears with options to:
   - Add products (make visible across selected channels)
   - Remove products (hide across selected channels)
4. Select products from dropdowns and save

### Integration Points

**Sales Routing Wizard**: 
- Step 4 (Channel Routing) includes default visibility selection for each online channel
- Users choose "All visible" (opt-out) or "None visible" (opt-in) per channel
- When the routing is created, visibility records are initialized based on these defaults:
  - "All visible": Creates records with `visible: true` for all products in the connected warehouse
  - "None visible": Creates records with `visible: false` for all products in the connected warehouse

**Distribution Modal**: 
- Shows visibility status (visible/hidden indicator) for each channel
- Visible channels show green "Visible" badge
- Hidden products show gray "Hidden" badge

### Data Model

New interface added:
```typescript
interface ProductChannelVisibility {
  productId: string;
  channelId: string;
  routingId: string;  // Scoped to a specific sales routing
  visible: boolean;
}
```

SalesRouting extended with:
```typescript
channelDefaultVisibility?: Record<string, DefaultVisibility>;
// Maps channelId -> 'all' | 'none'
```

---

## 11. Future Considerations

### Application Routes

| Route Path | Component | Purpose |
|------------|-----------|---------|
| `/` | Redirect → `/products/catalog-integration` | Default entry point |
| `/products/catalog-integration` | `CatalogIntegrationPage` | Integration management |
| `/products/catalog-integration/create` | `CreateIntegrationWizard` | Create new integration |
| `/products/sales-routing` | `SalesRoutingList` | List all sales routings |
| `/products/sales-routing/create` | `CreateRoutingWizard` | Create new routing |
| `/products/sales-routing/edit/:id` | `EditRouting` | Edit existing routing |
| `/products/channels` | `ChannelsPage` | Channel visibility management |
| `/products/guide` | `GuidePage` | Onboarding guide |
| `*` | Redirect → `/products/catalog-integration` | Catch-all fallback |

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.2.0 | UI framework |
| React Router DOM | ^7.13.0 | Client-side routing |
| TypeScript | ~5.9.3 | Type safety |
| Vite | ^7.2.4 | Build tool and dev server |
| FontAwesome | ^6.x | Icon library (SVG Core, Brands, Regular, Solid) |
| Vercel | — | Deployment platform (SPA rewrites configured) |

### Not in Current Scope
- Multiple catalog integrations per partner
- Automated channel assignment rules
- Inventory sync back to external systems
- Real API integration

### Potential Enhancements
- Sales analytics per routing
- Warehouse transfer functionality
- Bulk product operations across warehouses

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **Partner** | A Fever business client (museum, venue, organizer) |
| **RetailSetup** | Internal name for Catalog Integration |
| **RetailPlan** | Internal name for Sales Routing |
| **Warehouse** | Product location with inventory |
| **Channel** | Sales point (Box Office, Marketplace, etc.) |
| **Channel-Warehouse Mapping** | Configuration linking each channel to a warehouse |
| **Box Office** | Physical POS system for onsite sales (only onsite channel) |
| **Price Reference** | Designated warehouse whose prices are used for ALL SessionTypes in the routing (stock can come from other warehouses) |
| **Distribution** | Making a product available for sale through channels (formerly "Publication") |
| **Session Type ID** | Internal Fever identifier for a product distribution |
| **Multi-warehouse Routing** | Routing with multiple online channels (up to N warehouses) or Box Office (unlimited warehouses) |
| **Single-warehouse Routing** | Routing with a single online channel, restricted to one warehouse |
| **Category** | Product categorization imported from external system (Square/Shopify), stored as `HierarchyElement` tree |
| **HierarchyElement** | A node in the product category tree (root or child), imported from the external catalog system |
| **Product Channel Visibility** | Configuration controlling which products appear in each sales channel |
| **Default Visibility** | Setting determining if products start visible (opt-out) or hidden (opt-in) when routing is created |
| **Channel Type Category** | Grouping of channel types for Fever Zone filters: Box Office, Marketplace, Kiosk, API |
| **Design Pending Banner** | UI indicator shown on pages where visual design is still being refined |

---

*Last updated: February 2026*
