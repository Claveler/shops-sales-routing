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

## Epic & Story Conventions

### Hierarchy: epics, stories, and design tasks

- **Epics** group related stories around a product capability. They carry the business motivation (Why), suggested analytics events, and the Definition of Done.
- **Stories** describe individual user-facing behavior changes. They carry the user-level motivation in the "so that" clause of the user story sentence.
- **Design tasks** are peer-level Stories with a `[DESIGN]` prefix, owned by the designer. The Figma table in the epic description tracks design readiness. See "Design task conventions" below.

Cross-cutting context (Why, DoD, analytics) lives at the epic level to avoid duplication across child stories.

### Language level

- Write at the **Product Manager level**. Describe what the user needs and why.
- **No code-level references** in acceptance criteria: no field names, state keys, config flags, data model assumptions, or tech stack specifics.
- Tech details (data model, API shape, implementation approach) are added later by the tech lead.

### Epic description format

Epic descriptions in Jira follow this structure:

```
### Context
[Current state and what the epic changes — 1-2 paragraphs]

### Why
[Mandatory — why this group of stories forms a coherent epic,
what strategic objective it serves, why it's sequenced here.
1-3 sentences answering "what happens if we don't build this?"]

---

| Screen / Flow | Figma | Status |
|---|---|---|
| [Screen name] | — | Not started |

*@designer — update this table when designs are ready.*

---

**Mockup reference**
[Vercel URL + navigation instructions]

**Stories**
1. [Story title](Jira link)
2. ...

**Suggested analytics events**
[PM-suggested Mixpanel events for the epic's behavioral domain]

---

**Definition of Done**
- [ ] [Checklist — domain-specific]
```

**Context** describes *where things stand today and what the epic delivers*. **Why** explains *why it matters and why it's structured/sequenced this way*. Both are required.

**Heading levels:** Use `###` for Context and Why so they render as distinct sections in Jira. Other items (Figma table, Mockup reference, Stories, Analytics, DoD) use bold text, not headings, to keep visual hierarchy clean.

The **Figma table** gives the designer a clear place to update status. When commenting on an epic to tag the designer, reference this table explicitly (e.g., "please update the Figma table in the epic description when designs are ready").

### Story description format

- **Summary (Jira title):** Short descriptive name only (e.g., "Multi-event transactions"). Not the full "As a... I want..." sentence.
- **Description body:**
  ```
  **[Story title]**
  As a [role], I want [capability], so that [benefit].

  *Acceptance criteria:*
  - ...

  *Open questions:* (if any)

  ---
  *Mockup walkthrough:* (if applicable)
  ```
- **Open questions:** Include an "Open questions" section when there are unresolved edge cases or decisions.

#### Quality bar for the "so that" clause

The "so that" clause carries the story's motivation. It must answer **"what goes wrong if we don't build this?"** — not restate the capability or describe the mechanism.

| Weak (describes mechanism) | Strong (describes consequence) |
|---|---|
| "so I can filter quickly and drill down visually" | "so I can find products fast in large catalogs instead of scrolling through a flat list" |
| "so each variant is tracked with its own quantity" | "so the receipt is accurate and stock decrements per variant instead of per parent product" |
| "so I can work with the right routing context" | "so I don't accidentally edit visibility for the wrong event or channel" |

Stories do **not** get a separate "Why" section — the "so that" clause is the right vehicle. The epic-level Why provides the broader business context.

### Definition of Done

- Lives at the **epic level**, not on individual stories.
- Each domain (POS, back-office) has its own DoD checklist in the user story files.

### Mockup walkthroughs

- When a story has a demonstrable flow in the mockup, include a brief step-by-step walkthrough in the Jira description.
- Always reference the public Vercel URL (`https://shops-sales-routing.vercel.app/box-office`), not localhost.
- Acknowledge the initial state of the mockup (e.g., pre-populated cart) rather than assuming a blank slate.

### Design task conventions

Design tasks track the designer's deliverables for an epic.

- Created as **Task** issue type with the `prod-design` label, linked to the parent epic (same level as dev stories), with a `[DESIGN]` prefix in the title (e.g., "[DESIGN] Multi-Cart screens").
- **One design task per epic** (covering all stories in that epic), unless the epic is large enough to warrant per-story design tasks.
- The designer (Pablo Rubio Retolaza) owns these tasks and updates the Figma status table in the epic description when designs are ready.
- Design tasks are **not** subtasks of dev stories — they sit alongside them in the epic as peers, because design work often spans multiple stories.
- Acceptance criteria for design tasks: "Figma screens cover all acceptance criteria of stories [list]. Designer walkthrough completed with PM."

The Figma table at the top of each epic description is the quick-reference indicator of design readiness. It is updated by the designer when Figma links are attached.

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
| 6 | POS Analytics Tagging | B2BS-947 | POS (retroactive) |
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
| POS Analytics Tagging | B2BS-947 | Feb 23 | Mar 20 | S1–S2 |
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

- **All URLs must use link syntax** (`[text](url)` in markdown, `link` marks in ADF) — bare URLs are NOT auto-linked by the API.
- **All Jira issue references must use links** — the API does NOT auto-detect issue keys. Example: `[B2BS-920](https://feverup.atlassian.net/browse/B2BS-920)`.
- Figma links are placed in a table at the top of the epic description, with a "Not started" status until the designer adds them.
- Mentions use Atlassian account IDs in ADF format when done programmatically.

#### Description format depends on the tool

| Tool | Description format | Conversion |
|------|--------------------|------------|
| **MCP** (`editJiraIssue`) | Markdown | MCP converts to ADF automatically |
| **acli** (`workitem edit --from-json`) | ADF JSON | No conversion — you must supply valid ADF |
| **REST API** (`PUT /rest/api/3/issue/{key}`) | ADF JSON | No conversion — you must supply valid ADF |

**Critical:** `acli --description` and `acli --description-file` accept "plain text or ADF", but they do NOT convert markdown. Passing markdown results in raw syntax (asterisks, underscores, brackets) displayed as literal text in Jira. **Always use `acli --from-json` with a proper ADF `description` object.**

### Tools for Jira operations — MCP vs. acli vs. REST API

Three tools are available for writing to Jira. Each has different formatting behavior.

#### MCP (Atlassian MCP Server)

Accepts **markdown**; the server converts it to ADF automatically.

- Creating and editing issues (fields, descriptions, parent/epic link)
- Searching with JQL
- Transitioning issue status
- Looking up user account IDs
- Adding basic comments (when @mentions are not needed)

**Note:** `editJiraIssue` converts markdown to ADF correctly. `createJiraIssue` sometimes double-escapes newlines — if a newly created issue has bad formatting, re-send the markdown via `editJiraIssue` to fix it.

#### acli (Atlassian CLI)

Available at `/opt/homebrew/bin/acli`. **Does NOT convert markdown to ADF.**

| Task | Command |
|------|---------|
| Read issue | `acli jira workitem view <KEY>` |
| Edit description | `acli jira workitem edit --from-json <file.json> --yes` |
| Edit summary/labels | `acli jira workitem edit --key <KEY> --summary "..." --yes` |
| Generate template | `acli jira workitem edit --generate-json` |

The `--from-json` file must contain an ADF `description` object. Build it programmatically (e.g., a Node.js script) constructing the `doc → paragraph/heading/bulletList/table/rule` tree. See the cursor rule `jira-story-management.mdc` for the ADF node type reference.

#### Decision table — which tool to use

| Scenario | Tool | Description format |
|----------|------|--------------------|
| MCP Server is available and connected | MCP `editJiraIssue` | Markdown |
| MCP Server is not available / not connected | `acli --from-json` | ADF JSON |
| Need @mentions, Smart Links, or backlog ranking | REST API | ADF JSON |

**Always check which tools are available before writing descriptions.** If the MCP server is not connected (no `user-Atlassian-MCP-Server-*` tools listed), fall back to `acli` with ADF JSON.

#### REST API

For tasks that neither MCP nor acli can handle correctly:

| Task | Why others fail | Endpoint |
|------|----------------|----------|
| **@mentions in comments** | MCP escapes mention syntax; acli has no comment-with-mention command | `PUT /rest/api/3/issue/{key}/comment/{id}` with ADF `mention` node |
| **Smart Links** | MCP produces plain `link` marks, not `inlineCard` nodes | `PUT /rest/api/3/issue/{key}` with ADF `inlineCard` node |
| **Backlog reordering** | No MCP/acli tool for ranking | `PUT /rest/agile/1.0/issue/rank` with `rankAfterIssue` or `rankBeforeIssue` |
| **Raw ADF manipulation** | When precise control over formatting is needed | Standard issue/comment endpoints with ADF JSON body |

#### REST API auth

Basic auth using `base64(email:api_token)`. The API token must be passed as a script argument at runtime — never hardcoded or committed.

#### ADF node reference

**Mention** (triggers notification):
```json
{"type": "mention", "attrs": {"id": "712020:account-id-here", "text": "@Display Name", "accessLevel": ""}}
```

**Inline card / Smart Link** (renders as rich Jira issue card):
```json
{"type": "inlineCard", "attrs": {"url": "https://feverup.atlassian.net/browse/B2BS-123"}}
```

#### Smart Link workflow

When creating new stories via MCP, markdown links produce clickable text but not Smart Links. To upgrade:

1. `GET /rest/api/3/issue/{key}?fields=description` — fetch the current ADF.
2. Walk the ADF tree: replace any `text` node with a `link` mark pointing to `feverup.atlassian.net/browse/B2BS-*` with an `inlineCard` node.
3. `PUT /rest/api/3/issue/{key}` with `{ "fields": { "description": <modified ADF> } }`.

A batch conversion script can be recreated from this pattern. It requires a Jira API token passed as the first argument, followed by issue keys.

### Team account IDs

| Name | Role | Account ID |
|------|------|------------|
| Andrés Clavel | Product Manager | `712020:78fa4307-e42a-4357-90ee-df00c41a1500` |
| Pablo Rubio Retolaza | Product Designer | `712020:cad11526-b0ee-439c-8f58-bd790e994206` |

### Sync process

1. Make changes in the mockup and/or the `product-management/` docs.
2. When definitions are grounded, update Jira to match.
3. The markdown files in `product-management/` are the source of truth for story content. Jira mirrors them.

---

## Analytics Conventions

### Taxonomy document

`product-management/analytics-taxonomy.md` is the single reference for all Mixpanel analytics work on the POS. It defines:

- **What we want to understand and why**, organized by behavioral domain (transaction lifecycle, product interaction, category navigation, timeslot selection, member identification, shift/config, seated events).
- **Suggested event names and properties** using Fever's `FZ|POS|Section|Action` naming convention — these are proposals for the tech lead to review and finalize, not prescriptive specs.
- **A changelog-ready table** matching the column structure of Fever's official [Mixpanel Change Log](https://docs.google.com/spreadsheets/d/1K0JNs7mS9YLvSIBxQ6QNZPPIMneWUrXSQ3zgqh_f3Co/edit?gid=261590517#gid=261590517) (FeverZone sheet).

### How analytics fits the DoD

Every POS and back-office epic has a DoD line:

> "Relevant Mixpanel events instrumented per `product-management/analytics-taxonomy.md`."

Developers check the taxonomy doc for their epic's behavioral domains. No event names or properties in individual story ACs — DRY. The taxonomy doc defines *what we want to understand*; the tech lead and squad decide *how* to implement it.

### Retroactive tagging

The existing production POS has never been tagged. Epic **B2BS-947 (POS Analytics Tagging)** covers the retroactive instrumentation. New features are tagged as part of their respective epics via the DoD line.

### Mixpanel Changelog workflow

When a developer implements an event:

1. Reference the taxonomy doc for what to track and the suggested names/properties (as finalized by the tech lead).
2. After the PR is merged, copy the corresponding row from the taxonomy doc's changelog table into the [Google Sheet](https://docs.google.com/spreadsheets/d/1K0JNs7mS9YLvSIBxQ6QNZPPIMneWUrXSQ3zgqh_f3Co/edit?gid=261590517#gid=261590517), filling in the Date and Links to code columns.

---

## File Index

| File | Purpose |
|------|---------|
| `product-management/fever-pos.md` | POS product spec (features, layout, behavior) |
| `product-management/sales-routing-and-catalog-integration.md` | Back-office product spec |
| `product-management/pos-evolution-user-stories.md` | POS user stories grouped by epic |
| `product-management/backoffice-user-stories.md` | Back-office user stories grouped by epic |
| `product-management/analytics-taxonomy.md` | Mixpanel analytics taxonomy (what to track and why) |
| `product-management/permissions.md` | Cross-cutting permissions considerations |
| `product-management/workflow-and-conventions.md` | This file |

---

*Last updated: February 19, 2026*
