# Product Specification: Sales Routing & Catalog Integration

This document captures the data model, business logic, and product requirements for the Sales Routing and Catalog Integration features in the Fever Zone back-office.

---

## 1. Overview

### Purpose
This is a high-fidelity front-end mockup of new functionality for the **Fever Zone**, Fever's back-office platform where partners (business clients) manage their events and operations.

### Scope
A new **Products** section in the left sidebar containing:
- **Catalog Integration** - Connect external product catalogs (Square, Shopify)
- **Sales Routing** - Configure how products are made available for sale at events
- **Channels** - (Placeholder) Configure per-product channel visibility

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

**Box Office is special**: It's the only onsite channel. When selected, it allows multiple warehouses with a price reference.

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

| Channels Selected | Warehouse Rule | Price Reference | Edit Behavior |
|-------------------|----------------|-----------------|---------------|
| Box Office only | Multiple allowed | Required if >1 warehouse | Can add warehouses |
| Online only | Single warehouse | N/A (only 1 warehouse) | Can only swap warehouse |
| Both Box Office + Online | Multiple allowed | Required if >1 warehouse | Can add warehouses |

**Why these rules? The Price Reference is the key factor.**

Sales routings create **SessionTypes and Sessions** in Fever plans. Each SessionType has exactly ONE price. The **price reference warehouse** determines which prices are used for all SessionTypes, regardless of which warehouse the stock comes from.

- **Box Office** requires multiple warehouses (different POS devices pull from different stock locations). This necessitates a price reference to unify pricing. Once a price reference exists, there's no additional complexity in allowing online channels to also pick from multiple warehouses.

- **Online-only** is restricted to a single warehouse to avoid introducing price reference complexity for simple use cases. With one warehouse, it serves as both the price source AND stock source - no ambiguity.

- **Mixed (Box Office + Online)** already has a price reference (required by Box Office), so online channels can freely map to any available warehouse for stock without affecting pricing.

**Edit constraints:**
- Routings with Box Office (multi-warehouse): Users can add new warehouses
- Online-only routings (single-warehouse): Users can only swap the warehouse for a different one; this automatically updates all channel mappings

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
- **If only online channels**: Single warehouse selection (radio buttons)
- **If Box Office included**: Multiple warehouse selection (checkboxes) with price reference selector
- Dynamic explanation based on selected channels

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
3. Select single warehouse: **ES - Shops Shopify Testing** (online-only = single warehouse)
4. Warehouse auto-assigned to both channels
5. Create routing

**Concept introduced:** Multiple online channels can share the same warehouse/stock source.

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
- **Warehouses**: Can add new warehouses (if multi-warehouse/Box Office) or swap warehouse (if single/online-only)
- **Price Reference**: Can change which warehouse provides the price reference
- **Channels**: Can add new channels
- **Channel-Warehouse Mapping**: Can change which warehouse serves each channel
- **Status**: Draft / Active / Inactive

**Constraints:**
- Nothing can be deleted (warehouses, channels, or channel-warehouse relationships)
- Routings cannot be deleted, only deactivated (set to Inactive status)
- When swapping a single warehouse (online-only routing), all channel mappings auto-update

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
│       └── ChannelsPage.tsx      # Placeholder for future feature
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

## 10. Future Considerations

### Channels Page (Placeholder Added)
A placeholder page has been added at **Products → Channels** for future implementation of per-product channel visibility. This will allow:
- Selecting a sales channel to configure
- Choosing which products to show or hide per channel
- Fine-tuning visibility per event if needed

This is analogous to the ticket-type channel visibility feature in Fever Zone's Events section.

### Not in Current Scope
- Multiple catalog integrations per partner
- Full product channel visibility implementation (placeholder exists)
- Automated channel assignment rules
- Inventory sync back to external systems
- Real API integration

### Potential Enhancements
- Complete Channels page with product visibility configuration
- Sales analytics per routing
- Warehouse transfer functionality
- Bulk product operations

---

## 11. Glossary

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
| **Multi-warehouse Routing** | Routing with Box Office channel, allowing multiple warehouses |
| **Single-warehouse Routing** | Online-only routing, restricted to one warehouse |
| **Category** | Product categorization imported from external system (Square/Shopify) |

---

*Last updated: February 2026*
