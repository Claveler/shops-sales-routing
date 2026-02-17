# Permissions — Products Section & POS Actions

This document defines which Fever Zone roles have access to the new **Products** back-office section (Catalog Integration, Sales Routing, Channels) and which POS actions are restricted by role. It builds on the existing 16-role permission model in Fever Zone's `Settings > Users > Default Roles` matrix.

> **Reference**: Jira task `B2BS-946` — Manage permissions for the different sections and roles.

---

## 1. Existing Fever Zone Role System

Fever Zone uses **flat default roles** combined with **entity-scoped permissions**. Each user is assigned one role and a scope (Full access, Venue, or Event).

### Default Roles (production, Feb 2026)

| # | Role | Baseline Access |
|---|------|-----------------|
| 1 | Admin | Full access to all sections |
| 2 | Supervisor | Full access to all sections |
| 3 | Event manager | Full access to Events; limited elsewhere |
| 4 | Operations manager | Limited access (Events, Box Office) |
| 5 | Box office supervisor | Limited access (Box Office, Events) |
| 6 | Box office | Limited access (Box Office ticketing + shifts) |
| 7 | Access control supervisor | Limited access (Validation) |
| 8 | Access control | Limited access (Validation) |
| 9 | Invitation manager | Limited access (Invitations) |
| 10 | Co-producer | Limited access (Events subset) |
| 11 | Reservation manager | Limited access (Reservations) |
| 12 | Content manager | Limited access (Content) |
| 13 | Report analyst | Limited access (Reports) |
| 14 | Validation and refund agent | Limited access (Validation) |
| 15 | Shops Stock Manager | Limited access (Box Office > Stock Management) |
| 16 | Finance Manager | Limited access (Finance) |

### Scope Model

When assigning a user, admins choose a scope:

| Scope | Effect |
|-------|--------|
| **Full access** | User can act on all events/venues in the partner org |
| **Venue** | User can act only on events assigned to the selected venue(s) |
| **Event** | User can act only on the selected event(s) |

This scope model applies to all sections that are event- or venue-dependent.

### Existing Sidebar Sections with Permission Rows

| Section | Sub-items |
|---------|-----------|
| Events | Dashboard, Content, Event settings, Schedule & Tickets, Channels, Attendees, Invitations, Reviews |
| Validation | Cancel & refund onsite tickets |
| Orders | Order list, Third party codes |
| Box Office | Ticketing, Stats, Shifts, Stock Management, Settings |
| Reservations | Make Reservations, Override Cart Price |
| Reports | — |
| Marketing | — |
| Finance | — |
| Settings | — |
| Create Event | — |
| Partners App | — |

---

## 2. Products Section — Back-Office Permissions

The new **Products** sidebar section introduces three sub-pages that need permission rows in the Default Roles matrix.

### Permission Matrix

| Products sub-section | Admin | Supervisor | Ops manager | Shops Stock Manager | All other roles |
|---------------------|-------|------------|-------------|--------------------:|-----------------|
| **Catalog Integration** | ✓ | ✓ | View only | ✓ | — |
| **Sales Routing** | ✓ | ✓ | ✓ | View only | — |
| **Channels** (product visibility) | ✓ | ✓ | ✓ | — | — |

Section header in the roles chart:

| Products (header) | Admin | Supervisor | Ops manager | Shops Stock Manager | All other roles |
|-------------------|-------|------------|-------------|--------------------:|-----------------|
| Access level | Full | Full | Limited | Limited | No access |

### Role Rationale

**Admin / Supervisor** — full access to all three sub-sections. Consistent with their full-access pattern across every other Fever Zone section.

**Operations manager** — owns product distribution. Creates sales routings, maps channels to warehouses, toggles product visibility per channel. Has **view-only** access to Catalog Integration so they can understand what products and warehouses exist when building routings, but they don't connect Square, sync products, or manage warehouse definitions. This is the "ops user" persona from the user stories (`B2BS-937`, `B2BS-939`, `B2BS-940`, `B2BS-942`, `B2BS-944`, `B2BS-945`).

**Shops Stock Manager** — owns the product catalog. Connects Square, syncs products, manages warehouses and stock levels. Has **view-only** access to Sales Routing so they can see where their products are distributed, but they don't create or edit routings. No access to Channels (product visibility) — that's an ops concern, not a stock concern.

**Event manager** — no access. Event managers work with event content, scheduling, and ticket configuration. Physical product distribution is outside their scope.

**Box office / Box office supervisor** — no access. They consume products at the POS (configured upstream by the ops manager and stock manager). Their permissions are in the Box Office section.

**All remaining roles** (Access control, Invitation manager, Co-producer, Reservation manager, Content manager, Report analyst, Validation and refund agent, Finance Manager) — no access. Products section is outside their functional scope.

### Scope Behavior

| Scope | Catalog Integration | Sales Routing | Channels |
|-------|-------------------|---------------|----------|
| **Full access** | Full catalog | All routings | All routings |
| **Venue** | Read-only (catalog is partner-wide) | Routings for events at assigned venues | Same as Sales Routing |
| **Event** | Read-only (catalog is partner-wide) | Routings for assigned events only | Same as Sales Routing |

Catalog Integration is partner-wide (one integration per partner), not scoped per event or venue. Venue- and event-scoped users see it in read-only mode so they can understand the product catalog without modifying the Square connection.

Sales Routing and Channels respect scoping naturally: each routing is tied 1:1 to an event, so a venue-scoped user sees only routings for events at their venues.

---

## 3. POS Actions — Box Office Permissions

The POS evolution introduces actions that should be restricted by role. These become new sub-rows under the existing **Box Office** section in the permissions matrix.

### Current Box Office Permission Rows (production)

| Box Office sub-item | Admin | Supervisor | Ops mgr | BO supervisor | BO (cashier) |
|---------------------|-------|------------|---------|---------------|--------------|
| Ticketing (POS) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Stats | ✓ | ✓ | — | ✓ | — |
| Shifts | ✓ | ✓ | ✓ | ✓ | ✓ |
| Stock Management | ✓ | ✓ | — | ✓ | — |
| Settings | ✓ | ✓ | — | ✓ | — |

### Proposed New Box Office Permission Rows

| Box Office sub-item | Admin | Supervisor | Ops mgr | BO supervisor | BO (cashier) |
|---------------------|-------|------------|---------|---------------|--------------|
| Apply discounts | ✓ | ✓ | — | ✓ | — |
| Process refunds / voids | ✓ | ✓ | — | ✓ | — |
| Change BO setup / device | ✓ | ✓ | — | ✓ | — |
| End-of-day reconciliation | ✓ | ✓ | — | ✓ | — |

The **Box office** (cashier) role can sell, manage the cart, identify members, and start/end their own shift. Elevated actions (discounts, refunds, setup changes, reconciliation) require **Box office supervisor** or higher.

### Supervisor PIN Override (POS UX Pattern)

On a physical POS touchscreen, logging out and back in to perform one supervisor action is impractical. The industry-standard pattern is a **supervisor override**:

1. The cashier taps an action they don't have permission for (e.g., "Apply discount").
2. The POS shows a prompt: **"Supervisor authorization required"** with a PIN input.
3. A supervisor walks over, enters their PIN, and the action is unlocked for that single operation.
4. The cashier's session continues — no logout/login needed.

This pattern applies to: discounts, refunds/voids, and any future restricted POS actions. It requires:

- A PIN field on each user profile (set in Settings > Users)
- A PIN entry modal in the POS UI
- Backend validation that the entered PIN belongs to a user with BO supervisor (or higher) role

> **Open question**: Should changing the Box Office setup/payment device also require a supervisor PIN, or is it acceptable for any BO supervisor to do it without a second authorization?

---

## 4. Open Questions

1. **Ops manager + Catalog Integration**: Should the Operations manager have view-only access to Catalog Integration, or no access at all? Recommendation: view-only, because they need to understand the product catalog to build sensible routings.

2. **Shops Stock Manager + Sales Routing**: Should the Shops Stock Manager have view-only access to Sales Routing, or no access at all? Recommendation: view-only, because they need to see where products are distributed to troubleshoot stock issues.

3. **Read vs. write granularity**: The current permissions matrix uses binary checkmarks (access or no access). The Products section introduces a "view-only" concept for some role/section combinations. Does this require a UI change in the Default Roles chart (e.g., showing "View" vs "Full" instead of just a checkmark), or should it be a hidden backend distinction?

4. **Supervisor PIN implementation priority**: Is the PIN override pattern needed for launch, or can it be a fast-follow? For launch, hiding the restricted buttons entirely (not showing them to cashiers) is simpler but less flexible.

5. **Custom roles**: The current system uses fixed default roles. Should partners be able to create custom roles with cherry-picked permissions? Not recommended for MVP — adds significant complexity and the 16 defaults cover the known personas.

---

## 5. Implementation Stories (Suggested Breakdown)

Once the permission matrix is validated with the team, B2BS-946 should be broken into:

| Story | Scope | Dependency |
|-------|-------|------------|
| Products sidebar visibility by role | Back-office | None |
| Catalog Integration read/write guards | Back-office | Sidebar visibility |
| Sales Routing read/write guards | Back-office | Sidebar visibility |
| Channels read/write guards | Back-office | Sidebar visibility |
| Products section scope filtering (venue/event) | Back-office | Read/write guards |
| POS action restrictions (discount, refund, setup, reconciliation) | POS | None |
| Supervisor PIN override modal | POS | POS action restrictions |
| PIN field on user profiles | Settings | None |
| Update Default Roles chart with new rows | Settings | All above |

---

*Last updated: February 2026*
