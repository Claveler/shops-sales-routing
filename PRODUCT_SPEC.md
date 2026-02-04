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

### Catalog Integration
A connection to an external system (Square or Shopify) that allows importing products into Fever. **Each partner can have only one catalog integration.**

### Warehouses
Represent product inventory locations. Each warehouse maps 1:1 to a location in the external system (e.g., a Square location). Products exist in warehouses with location-specific prices and stock levels.

### Sales Routing
Configuration that makes products available for sale at specific events. Two types:
- **Onsite** - Products sold at physical point-of-sale (Box Office)
- **Online** - Products sold through digital channels (website, apps, OTAs)

### Channels
Where products are published for online sales:
- Fever Marketplace (fever.com)
- Whitelabel (partner's branded site)
- Kiosk (self-service terminals)
- OTAs (GetYourGuide, Viator, etc.)

### Box Office Setup
Physical POS device configuration for onsite sales. Multiple setups can use the same sales routing but pull stock from different warehouses.

---

## 3. Data Model

### Entity Relationship Diagram

```
┌─────────────────────┐
│ CatalogIntegration  │
│─────────────────────│
│ id                  │
│ name                │
│ provider (square/   │
│   shopify)          │
│ externalAccountId   │
│ createdAt           │
└─────────┬───────────┘
          │ 1:N
          ▼
┌─────────────────────┐       ┌─────────────────────┐
│     Warehouse       │       │      Product        │
│─────────────────────│       │─────────────────────│
│ id                  │       │ id                  │
│ name                │       │ name                │
│ integration         │       │ sku                 │
│ externalLocationId  │       │ imageUrl            │
│ masterCatalogId     │       │ category            │
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
│    SalesRouting     │       │       Event         │
│─────────────────────│       │─────────────────────│
│ id                  │──────▶│ id                  │
│ name                │       │ name                │
│ type (onsite/online)│       │ venue               │
│ eventId             │       │ city                │
│ warehouseIds[]      │       │ date                │
│ priceReferenceId    │       └─────────────────────┘
│ selectedProductIds[]│
│ channelIds[]        │       ┌─────────────────────┐
│ status              │       │      Channel        │
└─────────────────────┘       │─────────────────────│
                              │ id                  │
┌─────────────────────┐       │ name                │
│   BoxOfficeSetup    │       │ type                │
│─────────────────────│       └─────────────────────┘
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
4. **SalesRouting references warehouses** to determine which products are available
5. **BoxOfficeSetup determines stock source** for onsite sales when multiple warehouses exist

---

## 4. Business Logic

### Onsite Sales Routing

| Aspect | Rule |
|--------|------|
| Warehouses | Multiple allowed |
| Price Reference | Required when >1 warehouse (resolves price conflicts) |
| Product Selection | Automatic - ALL products in selected warehouses |
| Channel | Implicit "Box Office" channel (shared across Fever) |
| Stock Source | Determined by Box Office Setup configuration |
| New Products | Auto-published when synced to a routed warehouse |

**Why no explicit product selection for onsite?**
Onsite POS operators need access to the full catalog. Limiting products would create friction at checkout.

**Why price reference?**
When the same product exists in multiple warehouses with different prices, the system needs a single source of truth for the selling price.

### Online Sales Routing

| Aspect | Rule |
|--------|------|
| Warehouses | Single warehouse only |
| Price Reference | N/A (only one warehouse) |
| Product Selection | Explicit - choose which products to publish |
| Channel Selection | Required - choose where to publish |
| Stock Source | The single selected warehouse |
| New Products | NOT auto-published (must be manually added) |

**Why explicit product selection for online?**
Online add-ons are curated. A museum gift shop with 500 items may only want 6 specific products as ticket add-ons.

**Why single warehouse?**
Simplifies inventory management and prevents stock/price conflicts in the online purchase flow.

### Publication Rules

A product is considered **published** if:

```
IF routing.type === 'onsite':
  product is in a warehouse that's in routing.warehouseIds
  
IF routing.type === 'online':
  product.id is in routing.selectedProductIds
  AND routing.channelIds.length > 0
```

### Unpublished Product Warnings

After syncing new products, the system identifies unpublished items and categorizes them:

| Warning Type | Condition | Actionability |
|--------------|-----------|---------------|
| "No sales routing" | Warehouse has no routing configured | Low - requires creating a routing |
| "Not added to sales routing" | Online routing exists but product not selected | High - can add to existing routing |

---

## 5. Demo Flow

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

#### Step 3: Create Onsite Routing
1. Navigate to Products → Sales Routing
2. Click "Create new sales routing"
3. Select type: **Onsite**
4. Select event: **Candlelight: Tribute to Taylor Swift**
5. Select warehouses: **Main Store** + **Gift Shop**
6. Set price reference: **Main Store**
7. Enter name: "Taylor Swift Candlelight - Box Office"
8. Create routing

#### Step 4: Create Online Routing
1. Create another routing
2. Select type: **Online**
3. Select event: **Van Gogh: The Immersive Experience**
4. Select warehouse: **Pop-up Store**
5. Select ~4 products to publish
6. Select channels: **Fever Marketplace** + **Whitelabel**
7. Enter name: "Van Gogh - Online Store"
8. Create routing

#### Step 5: Second Product Sync
1. Return to Catalog Integration
2. Click "Sync new products"
3. 5 new products are imported:
   - 2 to Main Store (auto-published via onsite routing)
   - 1 to Gift Shop (auto-published via onsite routing)
   - 2 to Pop-up Store (NOT published - need manual addition)
4. Toast notification shows warning about unpublished products
5. Products table shows differentiated warnings

#### Step 6: Resolve Unpublished Products
1. Click "Add to [routing name]" CTA on unpublished product
2. Edit the online routing to include new products
3. Products now show as published

---

## 6. UI Components

### Sales Routing List
- Table showing all configured routings
- Columns: Name, Type (badge), Event, Warehouse(s), Status, Box Office count (onsite only)
- "Create new sales routing" CTA
- Click row to edit

### Create Routing Wizard
**Onsite flow (4 steps):**
1. Type Selection
2. Event Selection
3. Warehouse Selection (with price reference)
4. Review & Create

**Online flow (6 steps):**
1. Type Selection
2. Event Selection
3. Warehouse Selection
4. Product Selection
5. Channel Selection
6. Review & Create

### Edit Routing
- **Immutable fields**: Type, Event (shown as read-only cards)
- **Editable fields**: Name, Warehouses, Channels (online), Status
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

## 7. Technical Implementation

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
│       └── [Step components]
```

---

## 8. Design Constraints

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

## 9. Future Considerations

### Not in Current Scope
- Multiple catalog integrations per partner
- Multiple channels for onsite (per-POS product selection)
- Automated channel assignment rules
- Inventory sync back to external systems
- Real API integration

### Potential Enhancements
- Bulk product selection for online routings
- Product category filters
- Sales analytics per routing
- Warehouse transfer functionality

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Partner** | A Fever business client (museum, venue, organizer) |
| **Catalog Integration** | Connection to external product system |
| **Warehouse** | Product location with inventory |
| **Sales Routing** | Configuration linking products to events |
| **Channelization** | Selecting which channels to publish products to |
| **Box Office** | Physical POS system for onsite sales |
| **Price Reference** | Designated warehouse for resolving price conflicts |
| **Session Type ID** | Internal Fever identifier for a product publication |

---

*Last updated: February 2026*
