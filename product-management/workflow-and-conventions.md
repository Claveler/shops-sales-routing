# Workflow & Conventions

This document describes how this repository fits into the product development pipeline and the conventions we follow when translating mockup work into Jira stories.

---

## This Repo Is a Mockup

**`shop-sales-routing` is a definition vehicle, not the real product.**

This React application is a standalone prototype used to explore, demonstrate, and ground product definitions for the Fever Zone POS and back-office. It is hosted at:

- Local dev: `http://localhost:3000`
- Public: `https://shops-sales-routing.vercel.app`

### What it is

- A tool for the Product Manager to iterate on UX flows, layout, and interaction design before committing to engineering work.
- A reference that designers and engineers can browse to understand intent.
- A source of truth for *what we want to build*, expressed as interactive UI rather than static wireframes.

### What it is NOT

- The real Fever Zone codebase. The data models, state management, API contracts, and architecture in this mockup do not reflect production.
- A spec for how things should be implemented. The tech lead decides implementation details.
- Feature-complete. Things may be simplified, stubbed, or intentionally approximate.

### Key implication

**Never assume the mockup's data model applies to the real product.** Field names like `hasSeating`, `eventId--timeslotId`, `seatsioWorkspaceKey`, etc. exist to make the mockup functional. The real Fever Zone data model may structure things differently.

---

## Pipeline: Mockup → Definitions → Jira → Figma → Sprint

The workflow follows these stages:

```
1. Build / iterate in the mockup
   └─ Explore UX flows, test layout ideas, refine interactions

2. Ground definitions in product-management/ docs
   └─ fever-pos.md, sales-routing-and-catalog-integration.md
   └─ User story files: pos-evolution-user-stories.md, backoffice-user-stories.md

3. Convert to Jira stories (only when definitions are solid)
   └─ Epics and stories in the B2BS project
   └─ Keep Jira in sync with the markdown files

4. Designer adds finalized Figmas to epic/story descriptions
   └─ @Pablo Rubio attaches Figma links when ready for dev

5. Tech lead adds implementation details
   └─ Data model decisions, API contracts, tech spikes

6. Sprint planning
   └─ Stories are ready when they have: definitions + Figma + tech details
```

**Do not rush to Jira.** Stories should only be created or updated in Jira when the mockup and product-management docs reflect a grounded, agreed-upon definition.

---

## User Story Conventions

### Language level

- Write at the **Product Manager level**. Describe what the user needs and why.
- **No code-level references** in acceptance criteria: no field names, state keys, config flags, data model assumptions, or tech stack specifics.
- Tech details (data model, API shape, implementation approach) are added later by the tech lead.

### Format

- **Summary (Jira title):** Short descriptive name only (e.g., "Multi-event transactions"). Not the full "As a... I want..." sentence.
- **Description body:** Full user story format:
  ```
  As a [role], I want [capability], so that [benefit].

  Acceptance criteria:
  - ...
  ```
- **Open questions:** Include an "Open questions" section when there are unresolved edge cases or decisions.

### Definition of Done

- Lives at the **epic level**, not on individual stories.
- Each domain (POS, back-office) has its own DoD checklist in the user story files.

### Mockup walkthroughs

- When a story has a demonstrable flow in the mockup, include a brief step-by-step walkthrough in the Jira description.
- Always reference the public Vercel URL (`https://shops-sales-routing.vercel.app/box-office`), not localhost.
- Acknowledge the initial state of the mockup (e.g., pre-populated cart) rather than assuming a blank slate.

---

## Jira Conventions

### Project

- **Project key:** B2BS
- **Atlassian Cloud ID:** `8387c06f-8d18-40a7-ae38-180b03a43c8a`

### Scope of management

- We manage epics and stories that we created (POS Evolution, Sales Routing, Channel Visibility).
- **Do NOT modify** pre-existing Catalog Integration stories (`B2BS-289`, `B2BS-910`, `B2BS-911`, `B2BS-912`) — those were created by others.

### Epic structure (current)

| # | Epic | Jira Key | Domain |
|---|------|----------|--------|
| 1 | Multi-Cart | B2BS-918 | POS |
| 2 | Timeslot Selector Redesign | B2BS-922 | POS |
| 3 | Category Navigation & Tile Visuals | B2BS-928 | POS |
| 4 | Product Variants | B2BS-931 | POS |
| 5 | Membership Pricing | B2BS-934 | POS |
| 7 | Catalog Integration | B2BS-863 | Back-office (pre-existing) |
| 8 | Sales Routing | B2BS-938 | Back-office |
| 9 | Channel Visibility | B2BS-943 | Back-office |

### Timeline / Roadmap management

The Jira Timeline view is used for roadmapping epics. Dates are managed programmatically via the Atlassian MCP Server.

#### Field mapping

| Purpose | Jira field | Notes |
|---------|-----------|-------|
| **Start date** (timeline reads this) | `customfield_11200` | Set via `editJiraIssue` with `fields: {"customfield_11200": "YYYY-MM-DD"}` |
| **End date** (timeline reads this) | `duedate` | Standard Jira due date field |
| "Start date" (label in Jira) | `customfield_11451` | **NOT used by Timeline** — do not rely on this |
| "Target start" | `customfield_11215` | **NOT used by Timeline** — do not rely on this |

#### How to update epic dates

Use the `editJiraIssue` MCP tool. Example for setting both start and end:

```
Tool: user-Atlassian-MCP-Server-editJiraIssue
  cloudId: 8387c06f-8d18-40a7-ae38-180b03a43c8a
  issueIdOrKey: B2BS-922
  fields: {"customfield_11200": "2026-02-23", "duedate": "2026-03-06"}
```

You can batch multiple epics in parallel (one tool call per epic, all in the same message).

#### Current roadmap (as of February 2026)

| Epic | Key | Start | End | Sprint(s) |
|------|-----|-------|-----|-----------|
| Timeslot Selector Redesign | B2BS-922 | Feb 23 | Mar 06 | S1 |
| Sales Routings | B2BS-938 | Feb 23 | Mar 20 | S1–S2 |
| Multi-Cart | B2BS-918 | Mar 09 | Apr 03 | S2–S3 |
| Product Variants | B2BS-931 | Mar 23 | Apr 03 | S3 |
| Category Navigation & Tile Visuals | B2BS-928 | Mar 23 | Apr 17 | S3–S4 |
| Channel Visibility | B2BS-943 | Mar 23 | Apr 17 | S3–S4 |
| Membership Pricing | B2BS-934 | Apr 20 | May 01 | S5 |

Sprints are two weeks long, starting Feb 23, 2026. Catalog Integration (B2BS-863) is not managed here.

#### When to update the roadmap

- After sprint planning shifts epic boundaries.
- When an epic bleeds into the next sprint or finishes early.
- When new epics are added or existing ones are re-sequenced.

Update the table above **and** the Jira fields together so they stay in sync.

### Descriptions

- Use **markdown** format when updating via the Atlassian MCP Server (the tool converts to ADF).
- Figma links are placed in a table at the top of the epic description, with a "Not started" status until the designer adds them.
- Mentions use Atlassian account IDs in ADF format when done programmatically.

### Sync process

1. Make changes in the mockup and/or the `product-management/` docs.
2. When definitions are grounded, update Jira to match.
3. The markdown files in `product-management/` are the source of truth for story content. Jira mirrors them.

---

## File Index

| File | Purpose |
|------|---------|
| `product-management/fever-pos.md` | POS product spec (features, layout, behavior) |
| `product-management/sales-routing-and-catalog-integration.md` | Back-office product spec |
| `product-management/pos-evolution-user-stories.md` | POS user stories grouped by epic |
| `product-management/backoffice-user-stories.md` | Back-office user stories grouped by epic |
| `product-management/permissions.md` | Cross-cutting permissions considerations |
| `product-management/workflow-and-conventions.md` | This file |

---

*Last updated: February 2026*
