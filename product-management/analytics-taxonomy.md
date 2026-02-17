# POS Analytics Taxonomy

This document defines **what we want to understand about POS usage and why**, organized by behavioral domain. It serves as the single reference for all Mixpanel analytics work on the Fever Zone POS.

> **Caveat on naming**: The event names, property names, and naming conventions throughout this document are **suggestions** derived from analyzing Fever's [Mixpanel basics guide](https://docs.google.com/document/d/MIXPANEL_BASICS) and the [Mixpanel Change Log](https://docs.google.com/spreadsheets/d/1K0JNs7mS9YLvSIBxQ6QNZPPIMneWUrXSQ3zgqh_f3Co/edit?gid=261590517#gid=261590517). They follow existing Fever patterns (pipe-delimited `Platform|Section|Action` format, `FZ|` namespace for FeverZone) but **must be reviewed and agreed upon by the tech lead** before implementation. The purpose of this document is to define *what* we want to track and *why* — the tech lead will confirm or adjust the *how*.

---

## Naming Conventions (Suggested)

### Event naming

Based on Fever's existing `Platform|Section|Action` pattern and the `FZ|` prefix used in the FeverZone Mixpanel Change Log:

```
FZ|POS|<Section>|<Action>
```

- `FZ` — FeverZone namespace (consistent with existing FZ events like `FZ|Cancel|Click`)
- `POS` — the Point of Sale interface
- `Section` — the behavioral area (e.g., Cart, Checkout, Timeslot)
- `Action` — what happened (e.g., Item_Added, Payment_Completed)

### Property naming

The Mixpanel basics guide warns about inconsistent property naming across teams (`plan_id` vs `product_id` vs `plan_id_string`). To avoid this, all POS events should use canonical `snake_case` property names defined once.

**Suggested canonical names** (tech lead to confirm):

| Property | Description | Example values |
|----------|-------------|----------------|
| `venue_id` | Venue identifier | `"venue_12345"` |
| `setup_id` | Box Office setup identifier | `"setup_789"` |
| `shift_id` | Current shift identifier | `"shift_456"` |
| `device_id` | Payment device identifier | `"device_001"` |
| `cashier_id` | Logged-in cashier identifier | `"user_abc"` |
| `event_id` | Fever event identifier | `"event_999"` |
| `product_type` | Type of product | `"ticket"`, `"addon"`, `"merch"`, `"variant"` |
| `category_path` | Full category hierarchy | `"Gifts > Gift Aid"` |
| `payment_method` | Payment method used | `"cash"`, `"card"` |
| `total_amount` | Transaction total (cents) | `2500` |
| `item_count` | Number of items in cart | `4` |
| `timeslot_id` | Selected timeslot identifier | `"ts_123"` |

### Suggested global properties

These provide context on every event, enabling slicing by venue, shift, cashier, etc.:

- `venue_id`, `setup_id`, `shift_id`, `device_id`, `cashier_id`

Without these, we can't filter or segment data by operational context — e.g., "transactions per shift" or "average cart size at venue X."

---

## Funnel Best Practices

Per the Fever Mixpanel basics guide:

- **Use "totals" not "uniques"** in funnel reports — a single cashier may process many transactions in a shift.
- **Hold context properties constant** in funnels — for POS, hold `event_id`, `setup_id`, or `shift_id` constant so funnel steps belong to the same operational context.
- **Use per-step filters** by default to keep funnels meaningful (e.g., filter checkout events by `payment_method = card` when analyzing card payment failures).
- **Recommended hold-constant properties for POS funnels**: `event_id`, `setup_id`, `shift_id`.

---

## Behavioral Domains

Each domain below describes **what we want to understand** and the **business questions** we're trying to answer, followed by suggested events.

### 1. Transaction Lifecycle

**Why we track this**: Understand conversion rates from browsing to payment, identify where transactions fail or are abandoned, measure average transaction size and composition, and detect payment issues early.

**Business questions**:
- What's the average cart size (items and value) per transaction?
- What's the payment failure rate, and does it vary by device or venue?
- How often do cashiers clear the cart entirely vs. removing individual items?
- What's the ratio of cash to card payments?

**Suggested events**:

| Suggested Name | Trigger | Key Properties |
|---------------|---------|----------------|
| `FZ\|POS\|Cart\|Item_Added` | Cashier taps a product tile (or variant is selected) | product_type, event_id, category_path, price |
| `FZ\|POS\|Cart\|Item_Removed` | Cashier removes a single item from cart | product_type, event_id |
| `FZ\|POS\|Cart\|Quantity_Changed` | Cashier adjusts quantity via +/- controls | product_type, new_quantity, delta |
| `FZ\|POS\|Cart\|Cleared` | Cashier clears the entire cart | item_count (at time of clear) |
| `FZ\|POS\|Checkout\|Started` | Cashier taps Cash or Card button | payment_method, total_amount, item_count |
| `FZ\|POS\|Checkout\|Payment_Completed` | Payment succeeds | payment_method, total_amount, item_count, event_count, timeslot_count |
| `FZ\|POS\|Checkout\|Payment_Failed` | Payment fails | payment_method, failure_reason |

**Key funnel**: Item_Added → Checkout Started → Payment_Completed (hold `setup_id` constant).

---

### 2. Product Interaction

**Why we track this**: Understand which products cashiers tap most, whether variant pickers cause friction (opened but dismissed without selection), and what the add-on attach rate is.

**Business questions**:
- Which products are tapped most frequently? Does this vary by event?
- What's the add-on attach rate (add-ons added / tickets sold)?
- Do variant pickers cause friction? (How often are they opened but dismissed without a selection?)
- What's the average price point of products sold?

**Suggested events**:

| Suggested Name | Trigger | Key Properties |
|---------------|---------|----------------|
| `FZ\|POS\|Product\|Tile_Tapped` | Cashier taps any product tile | product_type, category_path, event_id, price |
| `FZ\|POS\|Variant\|Picker_Opened` | Variant picker modal opens | product_type, variant_count |
| `FZ\|POS\|Variant\|Selected` | Cashier selects a variant in the picker | variant_label, price |
| `FZ\|POS\|Variant\|Picker_Dismissed` | Picker closed without selection | product_type |

**Key metric**: Add-on attach rate = count of `Item_Added` where `product_type = addon` / count of `Item_Added` where `product_type = ticket`.

---

### 3. Category Navigation

**Why we track this**: Understand how cashiers find products — do they use category chips, drill into tiles, or navigate via breadcrumbs? This tells us whether the catalog structure is intuitive or if cashiers struggle to find what they need.

**Business questions**:
- Which navigation pattern is most common: chips, tile drill-down, or breadcrumbs?
- How deep do cashiers drill into the category tree on average?
- Do cashiers switch tabs frequently, or do they stay on one tab per transaction?
- Which categories get the most traffic?

**Suggested events**:

| Suggested Name | Trigger | Key Properties |
|---------------|---------|----------------|
| `FZ\|POS\|Category\|Chip_Selected` | Cashier taps an explode pipe chip | category_name, tab |
| `FZ\|POS\|Category\|Tile_Drilled` | Cashier taps a category tile to go deeper | category_path, depth_level |
| `FZ\|POS\|Category\|Breadcrumb_Navigated` | Cashier taps a breadcrumb to go back | target_level, from_level |
| `FZ\|POS\|Tab\|Switched` | Cashier switches between Tickets/Merch/Add-Ons tabs | from_tab, to_tab |

---

### 4. Timeslot Selection

**Why we track this**: Understand how often the timeslot selector is triggered (manual vs. enforced), how many date changes happen per transaction, and whether timeslot selection is a friction point slowing down cashiers.

**Business questions**:
- How often is the timeslot modal triggered by enforcement vs. opened manually?
- How many date changes does a cashier make before confirming a timeslot?
- Is timeslot selection a bottleneck (time from modal open to confirmation)?
- Which timeslots are selected most?

**Suggested events**:

| Suggested Name | Trigger | Key Properties |
|---------------|---------|----------------|
| `FZ\|POS\|Timeslot\|Modal_Opened` | Modal appears (manual tap or enforcement) | trigger (manual / enforcement) |
| `FZ\|POS\|Timeslot\|Date_Changed` | Cashier scrolls to a different date | from_date, to_date |
| `FZ\|POS\|Timeslot\|Selected` | Cashier taps a timeslot card | timeslot_id, time_of_day_group |
| `FZ\|POS\|Timeslot\|Confirmed` | Cashier taps "Confirm selection" | timeslot_id, date_changes_count |

---

### 5. Member Identification

**Why we track this**: Measure member identification adoption, success rate, and the revenue impact of member pricing. This is critical for partners with membership programs.

**Business questions**:
- What percentage of transactions include a member identification?
- What's the identification success/failure rate?
- What's the average pricing difference when a member is identified (revenue impact)?
- How often do cashiers clear a member mid-transaction?

**Suggested events**:

| Suggested Name | Trigger | Key Properties |
|---------------|---------|----------------|
| `FZ\|POS\|Member\|Identify_Attempted` | Cashier initiates member lookup | method (qr / manual_id) |
| `FZ\|POS\|Member\|Identify_Succeeded` | Member found and applied | member_tier, role (primary / beneficiary) |
| `FZ\|POS\|Member\|Identify_Failed` | Member lookup fails | failure_reason |
| `FZ\|POS\|Member\|Cleared` | Cashier removes member from transaction | pricing_delta (price difference reverted) |

**Key metric**: Member identification rate = transactions with `Identify_Succeeded` / total transactions.

---

### 6. Shift & Configuration

**Why we track this**: Understand shift durations, how often setups/events/devices are changed mid-shift, and provide the operational context needed to normalize all other metrics (e.g., transactions per hour per shift).

**Business questions**:
- What's the average shift duration?
- How often do cashiers change the Box Office setup or event selector mid-shift?
- Are device changes correlated with payment failures?

**Suggested events**:

| Suggested Name | Trigger | Key Properties |
|---------------|---------|----------------|
| `FZ\|POS\|Shift\|Started` | Cashier starts a new shift | venue_id, setup_id, cashier_id |
| `FZ\|POS\|Shift\|Ended` | Cashier ends the shift | duration_minutes, transaction_count |
| `FZ\|POS\|Config\|Setup_Changed` | Cashier switches Box Office setup | from_setup_id, to_setup_id |
| `FZ\|POS\|Config\|Device_Changed` | Cashier switches payment device | from_device_id, to_device_id |
| `FZ\|POS\|Config\|Event_Changed` | Cashier switches the active event | from_event_id, to_event_id |

---

### 7. Seated Events

**Why we track this**: Understand cashier behavior in seated-event flows — how often they switch between ticket and add-on tabs, and whether the seating integration (seats.io) causes friction compared to standard non-seated events.

**Business questions**:
- Do seated events take longer to process than non-seated events?
- How often do cashiers switch between the Seating and Add-Ons tabs?
- What's the add-on attach rate for seated vs. non-seated events?

**Suggested events**:

| Suggested Name | Trigger | Key Properties |
|---------------|---------|----------------|
| `FZ\|POS\|Seating\|Tab_Entered` | Cashier enters the Seating tab | event_id |
| `FZ\|POS\|Seating\|Seat_Selected` | Seat selected in seats.io widget | section, row, seat_number |
| `FZ\|POS\|Seating\|Ticket_Type_Chosen` | Ticket type picked for a seat | ticket_type, price |
| `FZ\|POS\|Seating\|Addons_Tab_Switched` | Cashier switches to Add-Ons tab from Seating | items_in_cart |

---

## Scope: Existing vs. New Features

| Domain | Existing POS? | Epic |
|--------|---------------|------|
| Transaction Lifecycle | Yes | POS Analytics Tagging (retroactive) |
| Product Interaction | Yes (tiles/taps); No (variants) | Retroactive + B2BS-931 (Variants) |
| Category Navigation | Yes (chips/tabs); No (drill-down/breadcrumbs) | Retroactive + B2BS-928 (Category Nav) |
| Timeslot Selection | Yes | Retroactive + B2BS-922 (Timeslot Redesign) |
| Member Identification | No | B2BS-934 (Membership Pricing) |
| Shift & Configuration | Yes | POS Analytics Tagging (retroactive) |
| Seated Events | No | B2BS-918 (Multi-Cart, seated event handling) |

Domains marked "Yes" for Existing POS need **retroactive tagging** (the POS Analytics Tagging epic). New features will be tagged as part of their respective epics via the Definition of Done.

---

## Changelog-Ready Table

This table mirrors the column structure of the official [Mixpanel Change Log](https://docs.google.com/spreadsheets/d/1K0JNs7mS9YLvSIBxQ6QNZPPIMneWUrXSQ3zgqh_f3Co/edit?gid=261590517#gid=261590517) (FeverZone sheet). When a developer implements an event, they (or the PM) copy the corresponding row into the Google Sheet, filling in the Date and Links to code columns.

> **Reminder**: Event names below are suggestions. The tech lead should confirm final names before rows are added to the official changelog.

| Add/Change/Delete | Event Name (suggested) | Display Name (suggested) | Description | Owner | Reason | Est. Volume | Date | Links to code |
|---|---|---|---|---|---|---|---|---|
| Add | fz_pos_cart_item_added | FZ\|POS\|Cart\|Item_Added | Cashier adds a product to the cart | Andres Clavel | POS Analytics Tagging | High | _TBD_ | _TBD_ |
| Add | fz_pos_cart_item_removed | FZ\|POS\|Cart\|Item_Removed | Cashier removes an item from the cart | Andres Clavel | POS Analytics Tagging | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_cart_quantity_changed | FZ\|POS\|Cart\|Quantity_Changed | Cashier adjusts item quantity | Andres Clavel | POS Analytics Tagging | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_cart_cleared | FZ\|POS\|Cart\|Cleared | Cashier clears the entire cart | Andres Clavel | POS Analytics Tagging | Low | _TBD_ | _TBD_ |
| Add | fz_pos_checkout_started | FZ\|POS\|Checkout\|Started | Cashier taps Cash or Card to start checkout | Andres Clavel | POS Analytics Tagging | High | _TBD_ | _TBD_ |
| Add | fz_pos_checkout_payment_completed | FZ\|POS\|Checkout\|Payment_Completed | Payment succeeds | Andres Clavel | POS Analytics Tagging | High | _TBD_ | _TBD_ |
| Add | fz_pos_checkout_payment_failed | FZ\|POS\|Checkout\|Payment_Failed | Payment fails | Andres Clavel | POS Analytics Tagging | Low | _TBD_ | _TBD_ |
| Add | fz_pos_product_tile_tapped | FZ\|POS\|Product\|Tile_Tapped | Cashier taps a product tile | Andres Clavel | POS Analytics Tagging | High | _TBD_ | _TBD_ |
| Add | fz_pos_variant_picker_opened | FZ\|POS\|Variant\|Picker_Opened | Variant picker modal opens | Andres Clavel | B2BS-931 (Product Variants) | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_variant_selected | FZ\|POS\|Variant\|Selected | Cashier selects a variant | Andres Clavel | B2BS-931 (Product Variants) | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_variant_picker_dismissed | FZ\|POS\|Variant\|Picker_Dismissed | Picker closed without selection | Andres Clavel | B2BS-931 (Product Variants) | Low | _TBD_ | _TBD_ |
| Add | fz_pos_category_chip_selected | FZ\|POS\|Category\|Chip_Selected | Cashier taps an explode pipe chip | Andres Clavel | POS Analytics Tagging | High | _TBD_ | _TBD_ |
| Add | fz_pos_category_tile_drilled | FZ\|POS\|Category\|Tile_Drilled | Cashier drills into a category tile | Andres Clavel | B2BS-928 (Category Nav) | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_category_breadcrumb_navigated | FZ\|POS\|Category\|Breadcrumb_Navigated | Cashier navigates via breadcrumb | Andres Clavel | B2BS-928 (Category Nav) | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_tab_switched | FZ\|POS\|Tab\|Switched | Cashier switches tabs | Andres Clavel | POS Analytics Tagging | High | _TBD_ | _TBD_ |
| Add | fz_pos_timeslot_modal_opened | FZ\|POS\|Timeslot\|Modal_Opened | Timeslot modal appears | Andres Clavel | POS Analytics Tagging | High | _TBD_ | _TBD_ |
| Add | fz_pos_timeslot_date_changed | FZ\|POS\|Timeslot\|Date_Changed | Cashier browses to a different date | Andres Clavel | POS Analytics Tagging | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_timeslot_selected | FZ\|POS\|Timeslot\|Selected | Cashier taps a timeslot card | Andres Clavel | POS Analytics Tagging | High | _TBD_ | _TBD_ |
| Add | fz_pos_timeslot_confirmed | FZ\|POS\|Timeslot\|Confirmed | Cashier confirms timeslot selection | Andres Clavel | POS Analytics Tagging | High | _TBD_ | _TBD_ |
| Add | fz_pos_member_identify_attempted | FZ\|POS\|Member\|Identify_Attempted | Cashier initiates member lookup | Andres Clavel | B2BS-934 (Membership Pricing) | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_member_identify_succeeded | FZ\|POS\|Member\|Identify_Succeeded | Member found and applied | Andres Clavel | B2BS-934 (Membership Pricing) | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_member_identify_failed | FZ\|POS\|Member\|Identify_Failed | Member lookup fails | Andres Clavel | B2BS-934 (Membership Pricing) | Low | _TBD_ | _TBD_ |
| Add | fz_pos_member_cleared | FZ\|POS\|Member\|Cleared | Cashier removes member from transaction | Andres Clavel | B2BS-934 (Membership Pricing) | Low | _TBD_ | _TBD_ |
| Add | fz_pos_shift_started | FZ\|POS\|Shift\|Started | Cashier starts a new shift | Andres Clavel | POS Analytics Tagging | Low | _TBD_ | _TBD_ |
| Add | fz_pos_shift_ended | FZ\|POS\|Shift\|Ended | Cashier ends the shift | Andres Clavel | POS Analytics Tagging | Low | _TBD_ | _TBD_ |
| Add | fz_pos_config_setup_changed | FZ\|POS\|Config\|Setup_Changed | Cashier switches Box Office setup | Andres Clavel | POS Analytics Tagging | Low | _TBD_ | _TBD_ |
| Add | fz_pos_config_device_changed | FZ\|POS\|Config\|Device_Changed | Cashier switches payment device | Andres Clavel | POS Analytics Tagging | Low | _TBD_ | _TBD_ |
| Add | fz_pos_config_event_changed | FZ\|POS\|Config\|Event_Changed | Cashier switches the active event | Andres Clavel | POS Analytics Tagging | Medium | _TBD_ | _TBD_ |
| Add | fz_pos_seating_tab_entered | FZ\|POS\|Seating\|Tab_Entered | Cashier enters the Seating tab | Andres Clavel | B2BS-918 (Multi-Cart) | Low | _TBD_ | _TBD_ |
| Add | fz_pos_seating_seat_selected | FZ\|POS\|Seating\|Seat_Selected | Seat selected in seats.io widget | Andres Clavel | B2BS-918 (Multi-Cart) | Low | _TBD_ | _TBD_ |
| Add | fz_pos_seating_ticket_type_chosen | FZ\|POS\|Seating\|Ticket_Type_Chosen | Ticket type picked for a seat | Andres Clavel | B2BS-918 (Multi-Cart) | Low | _TBD_ | _TBD_ |
| Add | fz_pos_seating_addons_tab_switched | FZ\|POS\|Seating\|Addons_Tab_Switched | Cashier switches to Add-Ons from Seating | Andres Clavel | B2BS-918 (Multi-Cart) | Low | _TBD_ | _TBD_ |

---

## Changelog Workflow

Per Fever's process, every Mixpanel event addition, change, or deletion must be logged in the official changelog:

**URL**: [Mixpanel Change Log (FeverZone sheet)](https://docs.google.com/spreadsheets/d/1K0JNs7mS9YLvSIBxQ6QNZPPIMneWUrXSQ3zgqh_f3Co/edit?gid=261590517#gid=261590517)

### Process

1. Developer references this taxonomy doc for what to track and the suggested event names/properties (as finalized by the tech lead).
2. After the PR is merged, the developer (or PM) copies the corresponding row from the table above into the Google Sheet, filling in the **Date** and **Links to code** columns.

This keeps the taxonomy doc as the source of truth while ensuring the official changelog stays up to date.

---

*Last updated: February 2026*
