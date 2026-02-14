/**
 * Mock data for the Fever POS (One-Stop Shop) interface.
 * Models tickets, F&B, and retail products organized by categories,
 * along with sample cart state grouped by event.
 */

export type ProductType = 'ticket' | 'addon' | 'food' | 'retail';

export interface Category {
  id: string;
  name: string;
  color: string; // left-stripe color on tiles
  hasMemberPricing?: boolean; // true when category contains member-priced products
}

export interface Product {
  id: string;
  name: string;
  price: number;
  memberPrice?: number;
  type: ProductType;
  categoryId: string;
  imageUrl?: string;
  tab: 'tickets' | 'meals' | 'shop';
}

export interface CartItemData {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number; // Set when member pricing is active — stores the non-discounted price for display
  quantity: number;
  bookingFee?: number;
}

export interface CartEventGroup {
  id: string;
  eventName: string;
  eventImageUrl?: string;
  location: string;
  date: string;
  isExpanded: boolean;
  items: CartItemData[];
  /** Retail / gift-shop products linked to this event via sales routing */
  retailItems: CartItemData[];
}

export const DEFAULT_EVENT_THUMBNAIL_URL =
  'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=256&q=80';

export const EVENT_THUMBNAIL_BY_ID: Record<string, string> = {
  'evt-001': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=256&q=80',
  'evt-002': 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=256&q=80',
  'evt-003': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=256&q=80',
  'evt-004': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=256&q=80',
  'evt-005': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=256&q=80',
  'evt-006': 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=256&q=80',
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

interface EventTicketCatalog {
  categories: Category[];
  products: Product[];
}

export const eventTicketCatalogs: Record<string, EventTicketCatalog> = {
  'evt-001': {
    categories: [
      { id: 'taylor-general', name: 'General Admission', color: '#0079CA' },
      { id: 'taylor-vip', name: 'VIP Experience', color: '#0079CA' },
    ],
    products: [
      { id: 't-1', name: 'Zone A Ticket', price: 39.00, type: 'ticket', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 't-2', name: 'Zone B Ticket', price: 29.00, type: 'ticket', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 't-3', name: 'Balcony View Ticket', price: 24.00, type: 'ticket', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 't-4', name: 'VIP Front Row Ticket', price: 89.00, memberPrice: 66.75, type: 'ticket', categoryId: 'taylor-vip', tab: 'tickets' },
      { id: 't-5', name: 'VIP Meet & Greet Pass', price: 129.00, memberPrice: 96.75, type: 'ticket', categoryId: 'taylor-vip', tab: 'tickets' },
      { id: 'a-1', name: 'Seat Selection Upgrade', price: 6.00, memberPrice: 4.50, type: 'addon', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 'a-2', name: 'Flexible Ticket Change', price: 9.00, type: 'addon', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 'a-3', name: 'Fast Track Entry', price: 12.00, type: 'addon', categoryId: 'taylor-general', tab: 'tickets' },
    ],
  },
  'evt-002': {
    categories: [],
    products: [
      { id: 'vg-1', name: 'Standard Adult Entry', price: 22.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-2', name: 'Child Entry (4-12)', price: 14.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-3', name: 'Student Entry', price: 18.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-4', name: 'Family Pack (2+2)', price: 62.00, memberPrice: 46.50, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-a1', name: 'Audio Narrative Access', price: 5.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-a2', name: 'VR Masterpieces Add-on', price: 8.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-a3', name: 'Priority Access Lane', price: 10.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
    ],
  },
  'evt-003': {
    categories: [
      { id: 'hans-general', name: 'General Admission', color: '#0079CA' },
      { id: 'hans-premium', name: 'Premium', color: '#0079CA' },
    ],
    products: [
      { id: 'hz-1', name: 'Stalls Seat', price: 44.00, type: 'ticket', categoryId: 'hans-general', tab: 'tickets' },
      { id: 'hz-2', name: 'Circle Seat', price: 38.00, type: 'ticket', categoryId: 'hans-general', tab: 'tickets' },
      { id: 'hz-3', name: 'Restricted View Seat', price: 27.00, type: 'ticket', categoryId: 'hans-general', tab: 'tickets' },
      { id: 'hz-4', name: 'Premium Orchestra Seat', price: 78.00, memberPrice: 58.50, type: 'ticket', categoryId: 'hans-premium', tab: 'tickets' },
      { id: 'hz-5', name: 'Premium Lounge Access', price: 99.00, memberPrice: 74.25, type: 'ticket', categoryId: 'hans-premium', tab: 'tickets' },
      { id: 'hz-a1', name: 'Fast Track Check-in', price: 11.00, type: 'addon', categoryId: 'hans-general', tab: 'tickets' },
      { id: 'hz-a2', name: 'Premium Seat Upgrade', price: 7.00, type: 'addon', categoryId: 'hans-general', tab: 'tickets' },
      { id: 'hz-a3', name: 'Aftershow Q&A Access', price: 16.00, type: 'addon', categoryId: 'hans-general', tab: 'tickets' },
    ],
  },
  'evt-004': {
    categories: [],
    products: [
      { id: 'sf-1', name: 'Tapas Route Ticket', price: 49.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-2', name: 'Tapas + Dessert Route', price: 57.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-3', name: 'Veggie Friendly Route', price: 49.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-a1', name: 'Private Guide Upgrade', price: 15.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-a2', name: 'Chef-led Market Stop', price: 12.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-a3', name: 'Flexible Route Reschedule', price: 6.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
    ],
  },
  'evt-005': {
    categories: [
      { id: 'st-standard', name: 'Standard Entry', color: '#0079CA' },
      { id: 'st-vip', name: 'VIP Access', color: '#0079CA' },
    ],
    products: [
      { id: 'st-1', name: 'General Entry Pass', price: 36.00, type: 'ticket', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-2', name: 'Group Entry (4+)', price: 31.00, type: 'ticket', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-3', name: 'Priority Entry Pass', price: 43.00, type: 'ticket', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-4', name: 'VIP Hawkins Lab Access', price: 74.00, memberPrice: 55.50, type: 'ticket', categoryId: 'st-vip', tab: 'tickets' },
      { id: 'st-5', name: 'VIP Actor Photo Moment', price: 94.00, memberPrice: 70.50, type: 'ticket', categoryId: 'st-vip', tab: 'tickets' },
      { id: 'st-a1', name: 'Arcade Access Add-on', price: 8.00, type: 'addon', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-a2', name: 'Demogorgon Photo Add-on', price: 10.00, type: 'addon', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-a3', name: 'Fast Queue Access', price: 5.00, type: 'addon', categoryId: 'st-standard', tab: 'tickets' },
    ],
  },
};

const defaultTicketEventId = 'evt-001';

export const ticketCategories: Category[] = eventTicketCatalogs[defaultTicketEventId].categories;

export const mealCategories: Category[] = [
  { id: 'hot-drinks', name: 'Hot Drinks', color: '#E67E22' },
  { id: 'cold-drinks', name: 'Cold Drinks', color: '#3498DB' },
  { id: 'sandwiches', name: 'Sandwiches', color: '#27AE60' },
  { id: 'snacks', name: 'Snacks', color: '#F39C12' },
  { id: 'meal-deals', name: 'Meal Deals', color: '#8E44AD' },
];

export const shopCategories: Category[] = [
  { id: 'souvenirs', name: 'Souvenirs', color: '#E74C3C' },
  { id: 'books', name: 'Books', color: '#2ECC71' },
  { id: 'clothing', name: 'Clothing', color: '#9B59B6' },
  { id: 'toys', name: 'Toys', color: '#F1C40F' },
  { id: 'accessories', name: 'Accessories', color: '#1ABC9C' },
];

// ---------------------------------------------------------------------------
// Products — Tickets tab
// ---------------------------------------------------------------------------

export const ticketProducts: Product[] = eventTicketCatalogs[defaultTicketEventId].products;

// ---------------------------------------------------------------------------
// Products — Meals tab
// ---------------------------------------------------------------------------

export const mealProducts: Product[] = [
  { id: 'm-1', name: 'Cappuccino', price: 3.50, type: 'food', categoryId: 'hot-drinks', tab: 'meals' },
  { id: 'm-2', name: 'Latte', price: 3.80, type: 'food', categoryId: 'hot-drinks', tab: 'meals' },
  { id: 'm-3', name: 'English Tea', price: 2.50, type: 'food', categoryId: 'hot-drinks', tab: 'meals' },
  { id: 'm-4', name: 'Hot Chocolate', price: 3.90, type: 'food', categoryId: 'hot-drinks', tab: 'meals' },
  { id: 'm-5', name: 'Cola', price: 2.50, type: 'food', categoryId: 'cold-drinks', tab: 'meals' },
  { id: 'm-6', name: 'Orange Juice', price: 3.00, type: 'food', categoryId: 'cold-drinks', tab: 'meals' },
  { id: 'm-7', name: 'Water', price: 1.50, type: 'food', categoryId: 'cold-drinks', tab: 'meals' },
  { id: 'm-8', name: 'Lemonade', price: 2.80, type: 'food', categoryId: 'cold-drinks', tab: 'meals' },
  { id: 'm-9', name: 'Ham & Cheese', price: 5.50, type: 'food', categoryId: 'sandwiches', tab: 'meals' },
  { id: 'm-10', name: 'BLT Sandwich', price: 6.00, type: 'food', categoryId: 'sandwiches', tab: 'meals' },
  { id: 'm-11', name: 'Tuna Mayo', price: 5.00, type: 'food', categoryId: 'sandwiches', tab: 'meals' },
  { id: 'm-12', name: 'Veggie Wrap', price: 5.50, type: 'food', categoryId: 'sandwiches', tab: 'meals' },
  { id: 'm-13', name: 'Crisps', price: 1.50, type: 'food', categoryId: 'snacks', tab: 'meals' },
  { id: 'm-14', name: 'Flapjack', price: 2.50, type: 'food', categoryId: 'snacks', tab: 'meals' },
  { id: 'm-15', name: 'Cookie', price: 2.00, type: 'food', categoryId: 'snacks', tab: 'meals' },
  { id: 'm-16', name: 'Fruit Pot', price: 3.00, type: 'food', categoryId: 'snacks', tab: 'meals' },
  { id: 'm-17', name: 'Sandwich + Drink', price: 7.50, type: 'food', categoryId: 'meal-deals', tab: 'meals' },
  { id: 'm-18', name: 'Soup + Roll + Drink', price: 8.00, type: 'food', categoryId: 'meal-deals', tab: 'meals' },
  { id: 'm-19', name: 'Kids Meal Deal', price: 5.00, type: 'food', categoryId: 'meal-deals', tab: 'meals' },
  { id: 'm-20', name: 'Afternoon Tea', price: 12.00, type: 'food', categoryId: 'meal-deals', tab: 'meals' },
];

// ---------------------------------------------------------------------------
// Products — Shop tab
// ---------------------------------------------------------------------------

export const shopProducts: Product[] = [
  { id: 's-1', name: 'HMS Victory Model', price: 24.99, type: 'retail', categoryId: 'souvenirs', tab: 'shop' },
  { id: 's-2', name: 'Fridge Magnet', price: 4.50, type: 'retail', categoryId: 'souvenirs', tab: 'shop' },
  { id: 's-3', name: 'Postcard Set', price: 3.00, type: 'retail', categoryId: 'souvenirs', tab: 'shop' },
  { id: 's-4', name: 'Keyring', price: 5.00, type: 'retail', categoryId: 'souvenirs', tab: 'shop' },
  { id: 's-5', name: 'Dockyard History', price: 12.99, type: 'retail', categoryId: 'books', tab: 'shop' },
  { id: 's-6', name: 'Nelson Biography', price: 9.99, type: 'retail', categoryId: 'books', tab: 'shop' },
  { id: 's-7', name: 'Children\'s Guide', price: 6.99, type: 'retail', categoryId: 'books', tab: 'shop' },
  { id: 's-8', name: 'Map & Guide', price: 4.99, type: 'retail', categoryId: 'books', tab: 'shop' },
  { id: 's-9', name: 'Navy T-Shirt', price: 18.00, type: 'retail', categoryId: 'clothing', tab: 'shop' },
  { id: 's-10', name: 'Cap', price: 12.00, type: 'retail', categoryId: 'clothing', tab: 'shop' },
  { id: 's-11', name: 'Hoodie', price: 35.00, type: 'retail', categoryId: 'clothing', tab: 'shop' },
  { id: 's-12', name: 'Scarf', price: 15.00, type: 'retail', categoryId: 'clothing', tab: 'shop' },
  { id: 's-13', name: 'Toy Battleship', price: 8.99, type: 'retail', categoryId: 'toys', tab: 'shop' },
  { id: 's-14', name: 'Sailor Teddy', price: 14.99, type: 'retail', categoryId: 'toys', tab: 'shop' },
  { id: 's-15', name: 'Puzzle 500pc', price: 11.99, type: 'retail', categoryId: 'toys', tab: 'shop' },
  { id: 's-16', name: 'Pirate Set', price: 7.99, type: 'retail', categoryId: 'toys', tab: 'shop' },
  { id: 's-17', name: 'Tote Bag', price: 8.00, type: 'retail', categoryId: 'accessories', tab: 'shop' },
  { id: 's-18', name: 'Umbrella', price: 15.00, type: 'retail', categoryId: 'accessories', tab: 'shop' },
  { id: 's-19', name: 'Pen Set', price: 6.50, type: 'retail', categoryId: 'accessories', tab: 'shop' },
  { id: 's-20', name: 'Water Bottle', price: 10.00, type: 'retail', categoryId: 'accessories', tab: 'shop' },
];

// ---------------------------------------------------------------------------
// All products combined
// ---------------------------------------------------------------------------

export const allProducts: Product[] = [
  ...ticketProducts,
  ...mealProducts,
  ...shopProducts,
];

// ---------------------------------------------------------------------------
// Sample cart state
// ---------------------------------------------------------------------------

export const initialCartEvents: CartEventGroup[] = [
  {
    id: 'evt-001',
    eventName: 'Candlelight: Tribute to Taylor Swift',
    eventImageUrl: EVENT_THUMBNAIL_BY_ID['evt-001'],
    location: 'Madrid',
    date: 'March 15, 2026 8:00PM',
    isExpanded: true,
    items: [
      {
        id: 'ci-1',
        productId: 't-1',
        name: 'Zone A Ticket',
        price: 39.00,
        quantity: 2,
        bookingFee: 0.60,
      },
      {
        id: 'ci-2',
        productId: 'a-1',
        name: 'Seat Selection Upgrade',
        price: 6.00,
        quantity: 2,
      },
    ],
    retailItems: [
      {
        id: 'cp-1',
        productId: 's-9',
        name: 'Navy T-Shirt',
        price: 18.00,
        quantity: 1,
      },
      {
        id: 'cp-2',
        productId: 'm-1',
        name: 'Cappuccino',
        price: 3.50,
        quantity: 2,
      },
    ],
  },
  {
    id: 'evt-002',
    eventName: 'Van Gogh: The Immersive Experience',
    eventImageUrl: EVENT_THUMBNAIL_BY_ID['evt-002'],
    location: 'Barcelona',
    date: 'April 1, 2026 6:00PM',
    isExpanded: true,
    items: [
      {
        id: 'ci-3',
        productId: 'vg-1',
        name: 'Standard Adult Entry',
        price: 22.00,
        quantity: 1,
        bookingFee: 0.60,
      },
      {
        id: 'ci-4',
        productId: 'vg-a1',
        name: 'Audio Narrative Access',
        price: 5.00,
        quantity: 1,
      },
    ],
    retailItems: [],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getProductsForTab(tab: 'tickets' | 'meals' | 'shop'): Product[] {
  if (tab === 'tickets') {
    return ticketProducts;
  }
  return allProducts.filter(p => p.tab === tab);
}

export function getCategoriesForTab(tab: 'tickets' | 'meals' | 'shop'): Category[] {
  switch (tab) {
    case 'tickets':
      return ticketCategories;
    case 'meals':
      return mealCategories;
    case 'shop':
      return shopCategories;
  }
}

export function getTicketProductsForEvent(eventId?: string): Product[] {
  const catalog = (eventId && eventTicketCatalogs[eventId]) ? eventTicketCatalogs[eventId] : eventTicketCatalogs[defaultTicketEventId];
  return catalog.products;
}

export function getTicketCategoriesForEvent(eventId?: string): Category[] {
  const catalog = (eventId && eventTicketCatalogs[eventId]) ? eventTicketCatalogs[eventId] : eventTicketCatalogs[defaultTicketEventId];
  return catalog.categories;
}

export function getEventThumbnailById(eventId?: string): string {
  if (!eventId) {
    return DEFAULT_EVENT_THUMBNAIL_URL;
  }
  return EVENT_THUMBNAIL_BY_ID[eventId] ?? DEFAULT_EVENT_THUMBNAIL_URL;
}

export function getProductsByCategory(products: Product[], categoryId: string): Product[] {
  return products.filter(p => p.categoryId === categoryId);
}

export function formatPrice(amount: number): string {
  return `€${amount.toFixed(2).replace('.', ',')}`;
}
