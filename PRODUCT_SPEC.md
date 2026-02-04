# Product Specification: Sales Routing & Catalog Integration

This document captures the data model, business logic, and product requirements for the Sales Routing and Catalog Integration features in the Fever Zone back-office.

---

## 1. Overview

### Purpose
This is a high-fidelity front-end mockup of new functionality for the **Fever Zone**, Fever's back-office platform where partners (business clients) manage their events and operations.

### Scope
A new **Products** section in the left sidebar containing:
- **Catalog Integration** - Connect external product catalogs (Square, Shopify)
- **Sales Routing** - Configure how products are made available for sale

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
Configuration that makes products available for sale at specific events through selected channels. Combines:
- Event selection
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
│ externalLocationId  │       │ imageUrl            │
└─────────┬───────────┘       └─────────┬───────────┘
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
│   RetailPlan        │       │       Event         │
│  (SalesRouting)     │       │─────────────────────│
│─────────────────────│──────▶│ id                  │
│ id                  │       │ name                │
│ name                │       │ venue               │
│ eventId             │       │ city                │
│ channelIds[]        │       │ date                │
│ warehouseIds[]      │       └─────────────────────┘
│ priceReferenceId    │
│ channelWarehouse-   │       ┌─────────────────────┐
│   Mapping{}         │       │      Channel        │
│ status              │       │─────────────────────│
└─────────────────────┘       │ id                  │
                              │ name                │
┌─────────────────────┐       │ type (onsite/online)│
│   BoxOfficeSetup    │       └─────────────────────┘
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

---

## 4. Business Logic

### Channel-Based Warehouse Selection Rules

| Channels Selected | Warehouse Rule | Price Reference |
|-------------------|----------------|-----------------|
| Box Office only | Multiple allowed | Required if >1 warehouse |
| Online only | Single warehouse | N/A |
| Both Box Office + Online | Multiple allowed | Required if >1 warehouse |

**Why these rules?**
- **Box Office** needs multiple warehouses because different POS devices (e.g., main entrance vs gift shop) may pull from different stock locations
- **Online channels** need single warehouse for consistent pricing and inventory management
- **Mixed** follows Box Office rules since it includes onsite

### Channel-Warehouse Mapping

Each channel in a sales routing maps to exactly one warehouse. This determines:
- Where stock is consumed when a sale occurs
- Which price is used for that channel

Example configuration:
```
Channels: [Box Office, Fever Marketplace]
Warehouses: [Main Store, Gift Shop]
Mapping:
  - Box Office → Main Store (individual POS configs can override)
  - Fever Marketplace → Gift Shop
```

### Publication Rules

A product is considered **published** if its warehouse is mapped to at least one channel in an active routing:

```
FOR each routing:
  mappedWarehouses = values(routing.channelWarehouseMapping)
  IF product's warehouse is in mappedWarehouses:
    product is PUBLISHED
```

### Unpublished Product Warnings

After syncing new products, the system identifies unpublished items and categorizes them:

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
- Summary of all selections
- Status selection (Draft/Active)
- Routing name (required)
- Create button

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

#### Step 3: Create Box Office + Online Routing
1. Navigate to Products → Sales Routing
2. Click "Create new sales routing"
3. Select event: **Candlelight: Tribute to Taylor Swift**
4. Select channels: **Box Office** + **Fever Marketplace**
5. Select warehouses: **Main Store** + **Gift Shop**
6. Set price reference: **Main Store**
7. Map channels:
   - Box Office → Main Store
   - Fever Marketplace → Gift Shop
8. Enter name: "Taylor Swift Candlelight - All Channels"
9. Create routing

#### Step 4: Second Product Sync
1. Return to Catalog Integration
2. Click "Sync new products"
3. 5 new products are imported:
   - 2 to Main Store (auto-published via channel mapping)
   - 1 to Gift Shop (auto-published via channel mapping)
   - 2 to Pop-up Store (NOT published - no routing for this warehouse)
4. Toast notification shows warning about unpublished products
5. Products table shows differentiated warnings

---

## 7. UI Components

### Sales Routing List
- Table showing all configured routings
- Columns: Name, Channels, Event, Warehouse(s), Status
- Price reference indicator (star icon) for multi-warehouse routings
- "Create new sales routing" CTA
- Click row to edit

### Create Routing Wizard
See Section 5 for detailed flow.

### Edit Routing
- **Immutable fields**: Channels, Event (shown as locked card)
- **Editable fields**: Name, Channel-Warehouse Mapping, Status
- **Delete** button with confirmation modal

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
- **Status**: All / Published / Unpublished
- **Event**: Filter by event where published
- **Sales Routing**: Filter by specific routing

### Publication Modal
- Master-detail layout
- Left: List of events where product is published
- Right: Publication details (routing name, channels, stock source, session type ID)
- First event auto-expanded

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
│   │   └── PublicationModal.tsx
│   └── sales-routing/
│       ├── SalesRoutingList.tsx
│       ├── CreateRoutingWizard.tsx
│       ├── EditRouting.tsx
│       ├── ChannelSelector.tsx
│       ├── WarehouseSelector.tsx
│       ├── ChannelRoutingStep.tsx
│       └── ReviewStep.tsx
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

### Not in Current Scope
- Multiple catalog integrations per partner
- Product channel visibility (configuring which products appear in which channels)
- Automated channel assignment rules
- Inventory sync back to external systems
- Real API integration

### Potential Enhancements
- Per-product channel visibility configuration
- Product category filters
- Sales analytics per routing
- Warehouse transfer functionality

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
| **Box Office** | Physical POS system for onsite sales |
| **Price Reference** | Designated warehouse for resolving price conflicts |
| **Session Type ID** | Internal Fever identifier for a product publication |

---

*Last updated: February 2026*
