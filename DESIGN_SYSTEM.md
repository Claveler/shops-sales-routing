# Fever Zone Design System Guidelines

> Extracted from the live Fever Zone at `partners.feverup.com` on 2026-02-09 (v12.0.2).
> The Fever Zone is built with **Angular** + **Bootstrap 5**, using **Font Awesome 6 Pro** for icons and **Montserrat** as the primary typeface.

---

## 1. Color Palette

### Dark Theme (Header, Sidebar, Page Title Area)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--fz-bg-dark` | `#06232C` | `rgb(6, 35, 44)` | Header, sidebar, page title bar, filter bar |
| `--fz-bg-sidebar-active` | `#2C4751` | `rgb(44, 71, 81)` | Active sidebar menu item background |
| `--fz-bg-overlay` | `rgba(16, 26, 35, 0.9)` | — | Sidebar backdrop overlay |
| `--fz-bg-scrim` | `rgba(16, 26, 35, 0.9)` | — | Modal scrim overlay |

### Light Theme (Content Area)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--fz-bg-content` | `#F2F3F3` | `rgb(242, 243, 243)` | Main content area background |
| `--fz-bg-card` | `#FFFFFF` | `rgb(255, 255, 255)` | Cards, modals, dropdowns, table backgrounds |

### Text Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--fz-text-primary` | `#212529` | `rgb(33, 37, 41)` | Default body text |
| `--fz-text-dark` | `#101A23` | `rgb(16, 26, 35)` | Input values, dark text |
| `--fz-text-darkest` | `#031419` | `rgb(3, 20, 25)` | Tags, close buttons, very dark accents |
| `--fz-text-heading-dark` | `#364550` | `rgb(54, 69, 80)` | Headings on light backgrounds |
| `--fz-text-secondary` | `#536B75` | `rgb(83, 107, 117)` | Table headers, descriptions, secondary labels |
| `--fz-text-subdued` | `#5A7385` | `rgb(90, 115, 133)` | Location info, subtle text |
| `--fz-text-muted` | `#788890` | `rgb(120, 136, 144)` | Dates, subtitles, muted text |
| `--fz-text-disabled` | `#A7B2BA` | `rgb(167, 178, 186)` | Disabled buttons, placeholder text |
| `--fz-text-light` | `#FFFFFF` | `rgb(255, 255, 255)` | Text on dark backgrounds |
| `--fz-text-light-muted` | `#F2F3F3` | `rgb(242, 243, 243)` | Muted icons/text on dark backgrounds |

### Brand / Primary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--fz-primary` | `#0079CA` | `rgb(0, 121, 202)` | Primary buttons, active filters, interactive links |

### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--fz-status-active` | `#24A865` | Active/positive status tag borders |
| `--fz-status-active-text` | `#18824C` | Active/positive status tag text |
| `--fz-status-inactive` | `#536B75` | Inactive/neutral status |
| `--fz-status-draft` | `#FF8C00` | Draft/pending status |
| `--fz-status-error` | `#DC3545` | Error/danger (Bootstrap danger) |

### Border Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--fz-border-color` | `#CCD2D8` | Input field borders |
| `--fz-border-color-dark` | `#536B75` | Header bottom border, dark-bg dividers |
| `--fz-border-color-light` | `#D9DCDE` | Table separators, subtle dividers |

---

## 2. Typography

### Font Stack

- **Primary**: `Montserrat, sans-serif`
- **Loaded weights**: 400 (Regular), 600 (SemiBold), 700 (Bold)
- **Also defined but unused on primary pages**: Addington CF (400), Circular Std (400, 700)

### Type Scale

| Level | Size | Weight | Line Height | Color | Usage |
|-------|------|--------|-------------|-------|-------|
| Body | 16px | 400 | 1.5 (24px) | `#212529` | Default paragraph text |
| H1 (Page Title) | 18px | 700 | 1.14 (~20.5px) | `#FFFFFF` | Page titles on dark header |
| H4 (Section Title) | 18px | 600 | 1.2 (~21.6px) | `#364550` | Section headings on light bg |
| Table Header | 12px | 600 | — | `#536B75` | Column headers in data tables |
| Tags / Badges | 12px | 400 | — | varies | Status tags, labels |
| Small Button | 14px | 600 | — | varies | Compact action buttons |
| Sidebar Item | 16px | 400 | — | `#FFFFFF` | Sidebar navigation labels |

---

## 3. Layout

### Structure

```
+--------------------------------------------------+
|  HEADER (72px, bg: #06232C)                       |
|  [sidebar toggle] [logo] [create btn] [user menu] |
+----------+---------------------------------------+
| SIDEBAR  | CONTENT AREA (bg: #F2F3F3)            |
| (256px)  |                                       |
| bg:      |  PAGE TITLE BAR (bg: #06232C)         |
| #06232C  |  FILTER BAR (bg: #06232C)             |
|          |                                       |
|          |  TABLE / CONTENT (bg: #FFFFFF)         |
|          |                                       |
|          |  FOOTER (info + support links)         |
+----------+---------------------------------------+
```

### Dimensions

| Element | Value |
|---------|-------|
| Header height | 72px |
| Sidebar width (expanded) | 256px |
| Sidebar width (collapsed) | 56px |
| Header padding | 0 16px |
| Sidebar padding | 16px 0 16px 16px |
| Modal max-width | 500px |
| Content padding-top | 72px (header height offset) |

---

## 4. Components

### Buttons

Buttons use a **pill shape** (`border-radius: 64px`) with `font-weight: 600` and a `2px` border. The Fever Zone defines these button variants:

#### Sizes

| Size | Height | Font Size | Padding |
|------|--------|-----------|---------|
| Small (`button--small`) | 32px | 14px | 0 12px |
| Large (`button--large`) | 48px | 16px | 0 24px |

#### Variants

| Variant | Background | Text Color | Border |
|---------|-----------|------------|--------|
| **Primary** (`button--primary`) | `#0079CA` | `#FFFFFF` | 2px solid transparent |
| **Primary Disabled** | `#F2F3F3` | `#A7B2BA` | 2px solid transparent |
| **Secondary Contrast** (`button--sharp-secondary-contrast`) | transparent | `#FFFFFF` | 2px solid `#F2F3F3` |
| **Tertiary** (`button--tertiary`) | transparent | `#0079CA` | 2px solid transparent |
| **Icon Button** (`icon-button--sharp-tertiary`) | transparent | `#000000` | none |

### Form Inputs

| Property | Standard Input | Combobox/Typeahead |
|----------|---------------|-------------------|
| Background | `#FFFFFF` | `#FFFFFF` |
| Border | 1px solid `#CCD2D8` | 1px solid `#101A23` |
| Border Radius | 8px | 4px |
| Height | 56px | 40px |
| Padding | 24px 12px 8px (floating label) | 8px 30px 8px 12px |
| Font Size | 16px | 16px |
| Text Color | `#031419` | `#101A23` |

Standard inputs use a **floating label** pattern where the label sits inside the input field and floats above the value on focus/fill.

### Tags / Badges

Tags are compact inline status indicators using `border-radius: 4px`, `padding: 4px`, `font-size: 12px`:

| Variant | Text Color | Border | Background |
|---------|-----------|--------|------------|
| Positive Outline (`tag--positive-outline`) | `#18824C` | 1px solid `#24A865` | transparent |
| Sharp Outline (`tag--sharp-outline`) | `#031419` | 1px solid `#06232C` | transparent |

### Data Tables

- **Container**: `border-radius: 12px`, no visible border, white background
- **Class**: `table table--striped table__container`
- **Header**: 12px, font-weight 600, color `#536B75`, white background
- **Rows**: Striped pattern (alternating backgrounds implied by `table--striped` class)
- **Row actions**: Dropdown with items at 12px font-size

### Sidebar Navigation

- **Menu items**: 16px, weight 400, white text, padding 12px, border-radius 8px
- **Active item**: Background `#2C4751` (slightly lighter than sidebar bg)
- **Open group**: Items appear expanded beneath the parent
- **Icons**: Rendered via `ng-fa-icon` (Font Awesome 6 Pro), color `#F2F3F3`
- **BEM naming**: `menu-item`, `menu-item--is-active`, `menu-item--is-open`, `menu-item__label`, `menu-item__icon`

### Modals / Dialogs

- **Content**: Background `#FFFFFF`, border-radius `16px`
- **Dialog**: max-width `500px`
- **Close button**: `btn-close` class, border-radius 6px, padding ~19px 16px
- **Primary action button**: Same as primary button variant (pill, `#0079CA`)
- **Scrim/backdrop**: `rgba(16, 26, 35, 0.9)`

### Dropdowns

- **Container**: Background `#FFFFFF`, border-radius `8px`
- **Items**: padding 4-8px 16px, font-size 16px, hover border-radius 8px
- **Active item**: Color `#0079CA`
- **Item description**: 12px, color `#536B75`

---

## 5. Icon System

The Fever Zone uses **Font Awesome 6 Pro** with the following families available:

- **Solid** (weight 900) — `Font Awesome 6 Free`
- **Regular** (weight 400) — `Font Awesome 6 Free`
- **Light** (weight 300) — `Font Awesome 6 Pro`
- **Thin** (weight 100) — `Font Awesome 6 Pro`
- **Duotone** (weight 900) — `Font Awesome 6 Duotone`
- **Sharp Solid/Regular/Light/Thin** — `Font Awesome 6 Sharp`
- **Sharp Duotone** — `Font Awesome 6 Sharp Duotone`
- **Brands** (weight 400) — `Font Awesome 6 Brands`

Icons are rendered via Angular's `ng-fa-icon` component (`<fa-icon>` custom element).

---

## 6. CSS Architecture

### Framework

- **Bootstrap 5** as the base CSS framework (all `--bs-*` CSS custom properties)
- Bootstrap variables are mostly at their **defaults** — Fever customizations happen via component-level CSS, not by overriding Bootstrap tokens
- The primary external stylesheet is a single bundled CSS file (`styles-*.css`)
- 30+ inline `<style>` blocks (Angular component styles)

### Naming Convention

The Fever Zone uses a **BEM-like** naming convention for custom components:

```
block__element--modifier

Examples:
  button--primary
  button--small
  button--fill
  menu-item__label
  menu-item--is-active
  table__header-filter-button
  table__header-filter-button--active
  tag--positive-outline
  tag--sharp-outline
  modal-content
  field__input
  sidebar-backdrop--is-open
```

### Key CSS Classes

| Class | Purpose |
|-------|---------|
| `bl-main bl-main--logged` | Main wrapper for logged-in layout |
| `headerbar` | Top header bar |
| `sidebar sidebar--is-open` | Left navigation sidebar |
| `sidebar-is-open` | Content section class when sidebar is expanded |
| `bl-page-title` | Page title bar (dark bg area) |
| `bl-filters` | Filter bar (dark bg area) |
| `button button--primary button--large` | Primary CTA button |
| `button button--small button--sharp-secondary-contrast` | Secondary button on dark bg |
| `field__input` | Standard form input |
| `table table--striped table__container` | Data table wrapper |
| `tag tag--positive-outline` | Positive/active status tag |
| `tag tag--sharp-outline` | Neutral/info tag |
| `modal-content` | Modal panel content |
| `dropdown-item` | Dropdown menu item |

---

## 7. Responsive Behavior

- Bootstrap breakpoints are at their defaults: `sm: 576px`, `md: 768px`, `lg: 992px`, `xl: 1200px`, `xxl: 1400px`
- Sidebar collapses to a toggleable overlay on smaller viewports
- Content area takes full width when sidebar is collapsed

---

## 8. Key Differences from Current Implementation

Changes applied to `variables.css` to align with the live Fever Zone:

| Token | Previous | Updated | Notes |
|-------|----------|---------|-------|
| `--fz-bg-content` | `#f5f5f5` | `#F2F3F3` | Slightly different gray |
| `--fz-primary` | `#0089E3` | `#0079CA` | Actual primary blue from live site |
| `--fz-text-secondary` | `#6c757d` | `#536B75` | Fever-specific secondary color |
| `--fz-text-muted` | `#9ca3af` | `#788890` | Matches live muted text |
| `--fz-border-color` | `#e5e7eb` | `#CCD2D8` | Actual input border color |
| `--fz-border-radius` | `6px` | `8px` | Default radius is 8px |
| `--fz-border-radius-lg` | `8px` | `12px` | Table container radius |
| `--fz-sidebar-width` | `240px` | `256px` | Live sidebar is wider |
| `--fz-header-height` | `56px` | `72px` | Live header is taller |
| `--fz-font-size-xs` | `11px` | `12px` | Live smallest text is 12px |
| `--fz-font-size-md` | `15px` | `16px` | Body text is 16px |
| `--fz-status-error` | `#EB0052` | `#DC3545` | Aligns with Bootstrap danger |
| `--fz-font-family` | Long fallback chain | `'Montserrat', sans-serif` | Simpler, matching live |

### New Tokens Added

- `--fz-bg-sidebar-active`, `--fz-bg-disabled`, `--fz-bg-overlay`, `--fz-bg-scrim`
- `--fz-text-light-muted`, `--fz-text-disabled`, `--fz-text-dark`, `--fz-text-darkest`, `--fz-text-heading-dark`, `--fz-text-subdued`
- `--fz-status-active-text`
- `--fz-border-color-dark`, `--fz-border-color-light`, `--fz-border-radius-xl`, `--fz-border-radius-pill`
- `--fz-shadow-md`
- `--fz-spacing-2xl`
- `--fz-modal-width`
- `--fz-font-weight-regular`, `--fz-font-weight-semibold`, `--fz-font-weight-bold`
- `--fz-line-height-body`, `--fz-line-height-heading`
- Button size tokens: `--fz-btn-height-sm`, `--fz-btn-height-lg`, `--fz-btn-padding-sm`, `--fz-btn-padding-lg`, `--fz-btn-border-width`
- Input size tokens: `--fz-input-height`, `--fz-input-height-sm`, `--fz-input-padding`, `--fz-input-padding-sm`
