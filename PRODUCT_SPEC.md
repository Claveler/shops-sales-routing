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
│ priceReferenceId    │       │ thumbnailUrl        │
│ channelWarehouse-   │       └─────────────────────┘
│   Mapping{}         │
│ status              │       ┌─────────────────────┐
└─────────────────────┘       │      Channel        │
                              │─────────────────────│
┌─────────────────────┐       │ id                  │
│   BoxOfficeSetup    │       │ name                │
│─────────────────────│       │ type (onsite/online)│
│ id                  │       └─────────────────────┘
│─────────────────────│
│ id                  │
│ name                │
│ salesRoutingId      │
│ warehouseId         │
│ location            │
└─────────────────────┘
```

### Key Relationships

1. **Products belong to the Catalog Integration**, not to individual warehouses
2. **ProductWarehouse** is a junction table storing warehouse-specific attributes (price, stock)
3. **A product can exist in multiple warehouses** with different prices/stock
4. **SalesRouting references channels and warehouses** with explicit channel-warehouse mapping
5. **BoxOfficeSetup determines stock source** for onsite sales when multiple warehouses exist
6. **Price Reference determines pricing** for SessionTypes; channel-warehouse mapping determines stock source only

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

**Existing integration:**
- Integration header with provider logo, name, account ID
- "Sync products" button
- Warehouses table (add/edit/delete)
- Products table with filters

### Product Filters
- **Search**: Text search by name or SKU
- **Warehouse**: Filter by specific warehouse
- **Distribution Status**: All / Distributed / Not distributed
- **Event**: Filter by event where distributed
- **Channel**: Filter by sales channel
- **Category**: Filter by product category (imported from external system)

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

---

## 8. Technical Implementation

### State Management
- **DemoContext**: Centralized state for demo mode
- Stores: integration, warehouses, products, productWarehouses, routings
- `resetDemo()`: Clears all state for fresh demo
- `syncProducts()`: Simulates product import

### Data Sources
- **Static mock data**: Pre-configured data for "steady state" demos
- **Dynamic demo data**: Created during demo flow via DemoContext

### Key Files
```
src/
├── context/
│   └── DemoContext.tsx       # Demo state management
├── data/
│   ├── mockData.ts           # Static entities and relationships
│   └── productPool.ts        # Demo-specific product data
├── components/
│   ├── guide/
│   │   └── GuidePage.tsx         # Step-by-step onboarding guide for ops teams
│   ├── catalog-integration/
│   │   ├── CatalogIntegrationPage.tsx
│   │   ├── IntegrationDetails.tsx
│   │   ├── CreateIntegrationWizard.tsx
│   │   └── PublicationModal.tsx  # (Distribution details)
│   ├── sales-routing/
│   │   ├── SalesRoutingList.tsx
│   │   ├── CreateRoutingWizard.tsx
│   │   ├── EditRouting.tsx
│   │   ├── ChannelSelector.tsx
│   │   ├── WarehouseSelector.tsx
│   │   ├── ChannelRoutingStep.tsx
│   │   └── ReviewStep.tsx
│   └── channels/
│       ├── ChannelsPage.tsx        # Main page with city/event selectors
│       ├── ChannelList.tsx         # Left panel channel list
│       ├── ChannelProductList.tsx  # Right panel product visibility table
│       └── BulkEditModal.tsx       # Modal for bulk visibility changes
```

---

## 9. Design Constraints

### Fever Brand Guidelines
- Primary color: `#0089E3` (Fever blue)
- Secondary colors: See color palette in codebase
- Font: Montserrat
- Button styles: Primary (gradient), Outline, Ghost, Danger

### Fever Zone Styling
- Sidebar: 240px wide, dark background (#1a2332)
- Content max-width: Consistent across screens
- Tables: Fever-style with hover states
- Filters: Floating label pattern with custom chevron

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
| **Category** | Product categorization imported from external system (Square/Shopify) |
| **Product Channel Visibility** | Configuration controlling which products appear in each sales channel |
| **Default Visibility** | Setting determining if products start visible (opt-out) or hidden (opt-in) when routing is created |

---

*Last updated: February 2026*
