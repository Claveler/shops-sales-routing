# Fever B2C Calendar - Detailed Visual Description

**Screenshots Captured:**
- `fever-page-loaded.png` - Initial page with cookie banner
- `fever-after-scroll.png` - First view of calendar after scrolling
- `fever-calendar-full-view.png` - Full calendar view
- `fever-calendar-complete.png` - Complete view with time slots and tickets
- `fever-calendar-centered.png` - Best centered view of calendar

## CALENDAR VISUAL BREAKDOWN

### 1. SECTION HEADER
- **Icon + Text:** Calendar icon (📅) followed by "Select date and session"
- **Font:** Medium weight, dark gray/black text
- **Position:** Top of the right sidebar card

### 2. MONTH SELECTOR (Toggle Buttons)
Located immediately below the section header.

#### Active Button (FEB 2026):
- **Background:** Solid black (#000000 or very dark gray)
- **Text:** White, uppercase "FEB 2026"
- **Shape:** Pill-shaped (rounded ends)
- **Font:** Bold, sans-serif
- **Size:** Medium height (~36-40px estimated)

#### Inactive Button (MAR 2026):
- **Background:** White or very light gray
- **Text:** Dark gray/black, uppercase "MAR 2026"
- **Shape:** Pill-shaped (rounded ends)
- **Border:** Appears to have a subtle border or is just white
- **Font:** Same as active but in dark color

**Layout:** The two buttons are side-by-side, touching or very close together, creating a segmented control appearance.

### 3. WEEKDAY HEADER ROW
Below the month selector, there's a row of weekday abbreviations:

**Layout:** `S  M  T  W  T  F  S`

- **Text Color:** Light gray (#999999 or similar)
- **Font Size:** Small (~12-14px)
- **Font Weight:** Regular (400)
- **Spacing:** Evenly distributed across 7 columns
- **Case:** Uppercase single letters

### 4. CALENDAR GRID - DATE CELLS

The calendar shows a standard month grid with 7 columns (Sun-Sat).

#### DATE CELL STATES OBSERVED:

**A. PAST/UNAVAILABLE DATES (1-17 in Feb):**
- **Date Number:** Very light gray, almost invisible
- **Styling:** Muted, appears disabled
- **No price shown**
- **Examples visible:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17

**B. SELECTED DATE (18):**
- **Date Number:** Bold black "18"
- **Border:** 2px solid bright blue border (#0099FF or similar azure blue)
- **Border Radius:** Rounded corners (~8-12px)
- **Background:** White
- **Price Below:** "€15" in teal/green color below the date number
- **Price Color:** Appears to be a teal/turquoise (#00B8A9 or similar)
- **This is the CURRENT SELECTION** - clearly distinguished by the blue border

**C. AVAILABLE DATES WITH PRICING (19, 20, 21, 22, 25, 26, 27, 28):**

Each available date shows:
1. **Date Number** (top):
   - Bold black text
   - Font size: ~16-18px
   - Font weight: 600-700

2. **Price** (bottom):
   - Teal/turquoise green color
   - Smaller font (~11-13px)
   - Format: "€XX"

**Specific dates visible:**
- **19:** €15 (teal)
- **20:** €15 (teal)
- **21:** €18 (teal) - higher price
- **22:** €16 (teal)
- **23:** Not available (grayed out)
- **24:** Not available (grayed out)
- **25:** €15 (teal)
- **26:** €15 (teal)
- **27:** €15 (teal)
- **28:** €18 (teal) - higher price

**D. UNAVAILABLE FUTURE DATES (23, 24):**
- **Styling:** Light gray, similar to past dates
- **No pricing shown**
- **These are in the future but not available for booking**

### 5. DATE CELL DESIGN DETAILS

**Cell Dimensions:**
- **Shape:** Square or nearly square
- **Estimated Size:** 48-56px width/height
- **Spacing:** Very tight grid gaps (2-4px between cells)
- **Border Radius:** Rounded corners on all cells (~8-12px)

**Layout Structure:**
- 2 lines per cell:
  - Line 1: Date number (bold, larger)
  - Line 2: Price (smaller, colored) OR empty if unavailable

**Alignment:**
- Both date and price appear center-aligned within the cell
- Vertical centering with appropriate padding

### 6. VISUAL HIERARCHY - COLOR SYSTEM

**Primary Colors:**
1. **Selection Blue:** Bright blue (#0099FF or similar) - used for selected date border
2. **Price Teal:** Teal/turquoise green (#00B8A9 or similar) - used for all prices
3. **Available Text:** Black (#000000 or #1A1A1A) - date numbers
4. **Unavailable Text:** Very light gray (#CCCCCC to #E5E5E5)
5. **Background:** Pure white (#FFFFFF)
6. **Header Text:** Medium gray (#999999 or #AAAAAA)

### 7. SPACING AND LAYOUT

**Calendar Container:**
- White background card
- Appears to have subtle shadow or border
- Padding around all edges (~16-24px)

**Grid Layout:**
- Clean 7-column grid (Sun-Sat)
- Consistent cell sizes
- Minimal gaps between cells create a cohesive grid appearance

**Month Selector to Calendar:**
- Moderate spacing (~12-16px) between month toggle and weekday headers
- Smaller spacing (~8px) between weekday headers and first row of dates

### 8. ADDITIONAL ELEMENTS VISIBLE

Below the calendar (visible in complete screenshots):

**A. "All prices shown in euros" text:**
- Small gray text
- Disclaimer style

**B. "Best price" indicator:**
- Green horizontal line/dash (——)
- Green text "Best price"
- Positioned below the calendar grid

**C. TIME SLOT SELECTOR:**
- Horizontal scrollable row of time pills
- Times shown: "4:00 PM", "4:30 PM", "5:00 PM"
- Selected time (4:00 PM) has:
  - White background
  - Blue accent triangle/flag in top-right corner
  - Appears elevated/selected
- Unselected times have plain white background
- Arrow button (→) on the right to scroll for more times

**D. TICKET SELECTOR:**
- Card with light blue border
- Shows "General Ticket (ages 3+)"
- Blue "More info" link
- Quantity controls: "-" button, quantity number, "+" button
- Price shown: varies by selection

### 9. TYPOGRAPHY DETAILS

**Font Family:** Appears to be a modern sans-serif (possibly Inter, Open Sans, or similar)

**Font Sizes Observed:**
- Month selector: ~14-16px
- Date numbers: ~16-18px
- Prices: ~11-13px
- Weekday headers: ~12-14px

**Font Weights:**
- Month selector active: 700 (bold)
- Month selector inactive: 600 (semi-bold)
- Date numbers: 600-700 (semi-bold to bold)
- Prices: 500-600 (medium)
- Weekday headers: 400 (regular)

### 10. INTERACTION STATES (Inferred)

Based on visual design:
- **Hover:** Likely shows subtle background change or border
- **Focus:** Would use focus ring or border enhancement
- **Active/Pressed:** Likely shows slight scale or color shift
- **Selected:** Shows blue border (as seen on date 18)

### 11. RESPONSIVE DESIGN NOTES

- Calendar maintains aspect ratio
- Grid is responsive (7 columns always visible)
- Touch-friendly cell sizes (appears to be ~48px minimum)
- Adequate spacing for mobile touch targets

## KEY DESIGN PATTERNS

1. **Inline Pricing:** Every available date shows its price directly on the calendar
2. **Color-Coded States:** Different colors for different states (unavailable=gray, available=black+teal, selected=blue)
3. **Subtle Selection:** Blue border for selected date doesn't obscure the content
4. **Price Differentiation:** Different prices (€15, €16, €18) shown in same color style
5. **Clean Grid:** Minimal gaps create a cohesive calendar appearance
6. **Progressive Flow:** Calendar → Time → Tickets creates natural booking flow

## COMPARISON TO STANDARD PATTERNS

- **Not a modal/popup:** Calendar is embedded in the page flow
- **Always visible:** No need to click to reveal
- **Price transparency:** Prices shown upfront, not hidden
- **Month toggle:** Simple toggle instead of arrows
- **Compact grid:** Tight spacing maximizes information density
- **Two-line cells:** Date + price in same cell

This design prioritizes transparency and efficiency, showing all relevant information (availability + pricing) at a glance.
