import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faMagnifyingGlass, faStar, faTabletScreenButton, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';
import iminDeviceImg from '../../assets/imin-swan-1-pro-3d.webp';
import feverLogo from '../../assets/fever-logo.svg';
import { FeverPosHeader } from './FeverPosHeader';
import { NavigationTabs } from './NavigationTabs';
import type { PosTab } from './NavigationTabs';
import { CategoryFilter } from './CategoryFilter';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import {
  getTicketProductsForEvent,
  getTicketCategoriesForEvent,
  getEventThumbnailById,
  getProductsByCategory,
  initialCartEvents,
  DEFAULT_EVENT_THUMBNAIL_URL,
  eventTicketCatalogs,
  eventSchedules,
  formatTimeslotForCart,
  formatTimeslotTime,
  formatDatePillWithMonth,
  eventHasSeating,
  getSeatingConfigForEvent,
  getAddOnProductsForEvent,
} from '../../data/feverPosData';
import type { Product, ProductVariant, CartEventGroup, EventTimeslot, CartItemData } from '../../data/feverPosData';
import { SeatingMapView } from './seating';
import { getEventById } from '../../data/mockData';
import { EventSelectionModal } from './EventSelectionModal';
import { MemberIdentifyModal } from './MemberIdentifyModal';
import type { MemberInfo } from './MemberIdentifyModal';
import { TimeslotModal } from './TimeslotModal';
import { VariantPicker } from './VariantPicker';
import type { PaymentDevice, Venue, CashRegister, ShiftInfo } from './FeverPosHeader';
import styles from './FeverPosPage.module.css';

// Mock Adyen payment devices for demo (S1F1 = Adyen S1F1 terminal series)
const MOCK_PAYMENT_DEVICES: PaymentDevice[] = [
  { id: 'S1F1-000158243349174', name: 'S1F1-000158243349174' },
  { id: 'S1F1-000158243349175', name: 'S1F1-000158243349175' },
  { id: 'S1F1-000158243349176', name: 'S1F1-000158243349176' },
];

// Mock cash registers for demo
const MOCK_CASH_REGISTERS: CashRegister[] = [
  { id: 'cr-001', name: 'Main Lobby Register' },
  { id: 'cr-002', name: 'Gift Shop Register' },
  { id: 'cr-003', name: 'VIP Lounge Register' },
  { id: 'cr-004', name: 'Mobile Register 1' },
];

// Mock venues and POS setups for demo (Fonck Museum context)
// Each setup can have 0, 1, 2, or 3 linked payment devices (Adyen terminals physically at that station)
const MOCK_VENUES: Venue[] = [
  {
    id: 'venue-fonck-concert',
    name: 'Fonck Concert Hall',
    setups: [
      { id: 'setup-concert-lobby', name: 'Main Lobby', linkedDeviceIds: ['S1F1-000158243349174', 'S1F1-000158243349175', 'S1F1-000158243349176'] }, // 3 devices
      { id: 'setup-concert-balcony', name: 'Balcony Bar', linkedDeviceIds: ['S1F1-000158243349175', 'S1F1-000158243349176'] }, // 2 devices
      { id: 'setup-concert-vip', name: 'VIP Lounge', linkedDeviceIds: ['S1F1-000158243349176'] }, // 1 device
      { id: 'setup-concert-merch', name: 'Merchandise Stand', linkedDeviceIds: [] }, // 0 devices
    ],
  },
  {
    id: 'venue-fonck-barcelona',
    name: 'Fonck Barcelona',
    setups: [
      { id: 'setup-bcn-entrance', name: 'Main Entrance', linkedDeviceIds: ['S1F1-000158243349174', 'S1F1-000158243349175'] }, // 2 devices
      { id: 'setup-bcn-cafe', name: 'Café', linkedDeviceIds: ['S1F1-000158243349174'] }, // 1 device
      { id: 'setup-bcn-gift', name: 'Gift Shop', linkedDeviceIds: ['S1F1-000158243349175'] }, // 1 device
      { id: 'setup-bcn-mobile', name: 'Mobile POS', linkedDeviceIds: [] }, // 0 devices
    ],
  },
  {
    id: 'venue-fonck-madrid',
    name: 'Fonck Madrid',
    setups: [
      { id: 'setup-mad-entrance', name: 'Main Entrance', linkedDeviceIds: ['S1F1-000158243349174', 'S1F1-000158243349175', 'S1F1-000158243349176'] }, // 3 devices
      { id: 'setup-mad-terrace', name: 'Rooftop Terrace', linkedDeviceIds: [] }, // 0 devices
      { id: 'setup-mad-gift', name: 'Gift Shop', linkedDeviceIds: ['S1F1-000158243349174', 'S1F1-000158243349176'] }, // 2 devices
    ],
  },
];

/**
 * The Box Office is configured against a single sales routing (= one event).
 * That event's routing determines which retail products are available at this POS.
 * Changing the ticket event selector does NOT change the retail product source.
 */
const BOX_OFFICE_EVENT_ID = 'evt-001';
const MEMBERSHIP_TIER_COLORS: Record<'Gold' | 'Silver' | 'Basic', string> = {
  Gold: '#B8860B',
  Silver: '#5C6B7A',
  Basic: '#8B7355',
};

function findClosestTimeslot(eventId: string): EventTimeslot | undefined {
  const schedule = eventSchedules[eventId];
  if (!schedule || schedule.timeslots.length === 0) return undefined;
  const now = Date.now();
  let best: EventTimeslot | undefined;
  let bestDiff = Infinity;
  for (const ts of schedule.timeslots) {
    if (ts.availability === 'sold_out') continue;
    const tsTime = new Date(`${ts.date}T${ts.startTime}`).getTime();
    const diff = Math.abs(tsTime - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = ts;
    }
  }
  return best;
}

interface FeverPosPageProps {
  /** When true, renders in iMin Swan 1 Pro simulation mode */
  isSimulation?: boolean;
}

export function FeverPosPage({ isSimulation = false }: FeverPosPageProps) {
  const demo = useDemo();
  const navigate = useNavigate();
  // Tab & category state
  const [activeTab, setActiveTab] = useState<PosTab>('tickets');
  const [activeCategoryId, setActiveCategoryId] = useState(getTicketCategoriesForEvent()[0]?.id ?? '');
  const [giftShopPathIds, setGiftShopPathIds] = useState<string[]>([]);

  const topLevelGiftShopCategories = useMemo(
    () =>
      demo
        .getHierarchyElements()
        .filter((he) => he.parentId === null)
        .map((he) => ({ id: he.id, name: he.name, color: '#AE92ED' })),
    [demo]
  );

  // Device preview mode is now controlled via URL route
  const isDevicePreview = isSimulation;
  const handleToggleDevicePreview = useCallback(() => {
    navigate(isSimulation ? '/box-office' : '/box-office/simulation');
  }, [navigate, isSimulation]);

  // Preload the device frame image so it's cached before the user enters preview
  const [deviceImageLoaded, setDeviceImageLoaded] = useState(false);
  const handleDeviceImageLoad = useCallback(() => setDeviceImageLoaded(true), []);

  useEffect(() => {
    const img = new Image();
    img.src = iminDeviceImg;
    img.onload = () => setDeviceImageLoaded(true);
  }, []);

  // Scale the device frame to fit within the browser viewport
  const TABLET_OUTER_W = 7680; // 3D image width
  const TABLET_OUTER_H = 4320; // 3D image height
  const backdropRef = useRef<HTMLDivElement>(null);
  const deviceScreenRef = useRef<HTMLDivElement>(null);
  const touchCursorRef = useRef<SVGSVGElement>(null);
  const [tabletScale, setTabletScale] = useState(1);

  // Touch cursor - uses direct DOM manipulation for zero-latency updates
  // Disabled when using a real touchscreen device (detected via touch events)
  useEffect(() => {
    if (!isDevicePreview) {
      // Hide cursor when not in device preview
      const cursor = touchCursorRef.current;
      if (cursor) {
        cursor.classList.remove(styles.visible, styles.pressed);
      }
      return;
    }

    const cursor = touchCursorRef.current;
    const screen = deviceScreenRef.current;
    if (!cursor || !screen) return;

    // Track whether we're using touch input - if so, disable the simulated cursor
    let isTouchDevice = false;

    const handleTouchStart = () => {
      // Real touch detected - disable simulated cursor and restore normal cursor
      isTouchDevice = true;
      cursor.classList.remove(styles.visible, styles.pressed);
      screen.style.cursor = '';
      // Remove cursor: none from all children
      screen.querySelectorAll('*').forEach((el) => {
        (el as HTMLElement).style.cursor = '';
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Skip if using real touch input
      if (isTouchDevice) return;
      // Direct DOM manipulation - no React state updates
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursor.classList.add(styles.visible);
    };

    const handleMouseLeave = () => {
      if (isTouchDevice) return;
      cursor.classList.remove(styles.visible);
    };

    const handleMouseDown = () => {
      if (isTouchDevice) return;
      cursor.classList.add(styles.pressed);
    };

    const handleMouseUp = () => {
      if (isTouchDevice) return;
      cursor.classList.remove(styles.pressed);
    };

    // Listen for touch events to detect real touchscreen usage
    screen.addEventListener('touchstart', handleTouchStart, { passive: true });
    screen.addEventListener('mousemove', handleMouseMove);
    screen.addEventListener('mouseleave', handleMouseLeave);
    screen.addEventListener('mousedown', handleMouseDown);
    screen.addEventListener('mouseup', handleMouseUp);

    // Also listen globally for mouseup in case cursor leaves while pressed
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      screen.removeEventListener('touchstart', handleTouchStart);
      screen.removeEventListener('mousemove', handleMouseMove);
      screen.removeEventListener('mouseleave', handleMouseLeave);
      screen.removeEventListener('mousedown', handleMouseDown);
      screen.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDevicePreview]);

  useEffect(() => {
    if (!isDevicePreview) return;
    const el = backdropRef.current;
    if (!el) return;

    const computeScale = () => {
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const pad = 40; // breathing room around the tablet
      const sx = (vw - pad) / TABLET_OUTER_W;
      const sy = (vh - pad) / TABLET_OUTER_H;
      setTabletScale(Math.min(1, sx, sy));
    };

    computeScale();
    const ro = new ResizeObserver(computeScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDevicePreview]);

  const tabletStyle = useMemo<CSSProperties>(
    () => ({ transform: `scale(${tabletScale})` }),
    [tabletScale],
  );

  // Cart state
  const [cartEvents, setCartEvents] = useState<CartEventGroup[]>(initialCartEvents);
  const [isEventSelectorOpen, setIsEventSelectorOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('evt-001');
  const [pendingEventId, setPendingEventId] = useState('');
  const [eventPickerCity, setEventPickerCity] = useState('');

  // Member identification state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [identifiedMember, setIdentifiedMember] = useState<MemberInfo | null>(null);

  const isMemberActive = identifiedMember !== null;

  // Device selection state
  const [linkedDeviceId, setLinkedDeviceId] = useState<string | null>(MOCK_PAYMENT_DEVICES[0].id);

  const handleSelectDevice = useCallback((deviceId: string) => {
    setLinkedDeviceId(deviceId);
  }, []);

  // POS Setup selection state
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>('setup-concert-lobby');

  const handleSelectSetup = useCallback((setupId: string, _venueId: string) => {
    setSelectedSetupId(setupId);

    // Find the new setup to check its linked devices
    const newSetup = MOCK_VENUES
      .flatMap((v) => v.setups)
      .find((s) => s.id === setupId);

    if (newSetup?.linkedDeviceIds) {
      // Check if current device is still valid for the new setup
      setLinkedDeviceId((currentDeviceId) => {
        if (currentDeviceId && newSetup.linkedDeviceIds!.includes(currentDeviceId)) {
          // Current device is valid, keep it
          return currentDeviceId;
        }
        // Auto-select first available device, or null if none
        return newSetup.linkedDeviceIds!.length > 0 ? newSetup.linkedDeviceIds![0] : null;
      });
    }
  }, []);

  // Shift state
  const [activeShift, setActiveShift] = useState<ShiftInfo | null>(null);

  const handleStartShift = useCallback((cashRegisterId: string, openingCash: number) => {
    const cashRegister = MOCK_CASH_REGISTERS.find((cr) => cr.id === cashRegisterId);
    setActiveShift({
      id: `shift-${Date.now()}`,
      startTime: new Date(),
      cashRegisterId,
      cashRegisterName: cashRegister?.name ?? 'Unknown Register',
      openingCash,
    });
  }, []);

  const handleEndShift = useCallback(() => {
    setActiveShift(null);
  }, []);

  // Variant picker state
  const [variantPickerProduct, setVariantPickerProduct] = useState<Product | null>(null);

  // Timeslot modal state
  const [isTimeslotModalOpen, setIsTimeslotModalOpen] = useState(false);
  // Track pending product to add after timeslot selection
  const [pendingProductForTimeslot, setPendingProductForTimeslot] = useState<Product | null>(null);
  // Track the confirmed timeslot per event: eventId -> EventTimeslot
  // Pre-seed with timeslots matching the preloaded cart events
  const [selectedTimeslots, setSelectedTimeslots] = useState<Record<string, EventTimeslot>>(() => {
    const seed: Record<string, EventTimeslot> = {};
    // evt-001: ts-001-06 (March 15, 21:30) — matches preloaded cart (Taylor Swift)
    const ts001 = eventSchedules['evt-001']?.timeslots.find((ts) => ts.id === 'ts-001-06');
    if (ts001) seed['evt-001'] = ts001;
    // evt-003: ts-003-05 (March 27, 19:30) — matches preloaded cart (Hans Zimmer seated event)
    const ts003 = eventSchedules['evt-003']?.timeslots.find((ts) => ts.id === 'ts-003-05');
    if (ts003) seed['evt-003'] = ts003;
    return seed;
  });

  // Warehouse data needed for member pricing on gift shop products
  const productWarehouses = demo.getProductWarehouses();
  const salesRoutings = demo.getSalesRoutings();

  const boxOfficeSalesRouting = useMemo(
    () => salesRoutings.find((routing) => routing.eventId === BOX_OFFICE_EVENT_ID) ?? salesRoutings[0],
    [salesRoutings]
  );

  const priceReferenceWarehouseId = useMemo(
    () => boxOfficeSalesRouting?.priceReferenceWarehouseId ?? boxOfficeSalesRouting?.warehouseIds[0],
    [boxOfficeSalesRouting]
  );

  const warehouseScopedEntries = useMemo(
    () =>
      priceReferenceWarehouseId
        ? productWarehouses.filter((pw) => pw.warehouseId === priceReferenceWarehouseId)
        : [],
    [productWarehouses, priceReferenceWarehouseId]
  );

  const retailPricingLookup = useMemo(() => {
    const lookup = new Map<
      string,
      {
        productPrice?: number;
        productMemberPrice?: number;
        variantPrices: Record<string, number>;
        variantMemberPrices: Record<string, number>;
        variantStock: Record<string, number>;
      }
    >();

    for (const entry of warehouseScopedEntries) {
      const current = lookup.get(entry.productId) ?? {
        variantPrices: {},
        variantMemberPrices: {},
        variantStock: {},
      };

      if (entry.variantId) {
        current.variantPrices[entry.variantId] = entry.price;
        if (entry.memberPrice != null) {
          current.variantMemberPrices[entry.variantId] = entry.memberPrice;
        }
        current.variantStock[entry.variantId] = (current.variantStock[entry.variantId] ?? 0) + entry.stock;
      } else {
        current.productPrice = entry.price;
        current.productMemberPrice = entry.memberPrice;
      }

      lookup.set(entry.productId, current);
    }

    for (const value of lookup.values()) {
      if (value.productPrice == null) {
        const variantPrices = Object.values(value.variantPrices);
        if (variantPrices.length > 0) {
          value.productPrice = Math.min(...variantPrices);
        }
      }

      if (value.productMemberPrice == null) {
        const variantMemberPrices = Object.values(value.variantMemberPrices);
        if (variantMemberPrices.length > 0) {
          value.productMemberPrice = Math.min(...variantMemberPrices);
        }
      }
    }

    return lookup;
  }, [warehouseScopedEntries]);

  const getRetailVariantPricing = useCallback((productId: string, variantId?: string) => {
    const pricing = retailPricingLookup.get(productId);
    if (!pricing) return null;
    if (!variantId) {
      return {
        price: pricing.productPrice,
        memberPrice: pricing.productMemberPrice,
      };
    }
    return {
      price: pricing.variantPrices[variantId] ?? pricing.productPrice,
      memberPrice: pricing.variantMemberPrices[variantId] ?? pricing.productMemberPrice,
    };
  }, [retailPricingLookup]);

  const handleOpenMemberModal = useCallback(() => setIsMemberModalOpen(true), []);
  const handleCloseMemberModal = useCallback(() => setIsMemberModalOpen(false), []);

  // Build a lookup map for member prices from all available product sources
  const memberPriceLookup = useMemo(() => {
    const map = new Map<string, number>();
    // Ticket products from all event catalogs
    for (const catalog of Object.values(eventTicketCatalogs)) {
      for (const p of catalog.products) {
        if (p.memberPrice != null) map.set(p.id, p.memberPrice);
      }
    }
    return map;
  }, []);

  const handleIdentifyMember = useCallback((member: MemberInfo) => {
    setIdentifiedMember(member);
    setIsMemberModalOpen(false);

    // Apply member pricing to existing cart items
    setCartEvents((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          const mp = memberPriceLookup.get(item.productId);
          if (mp != null && item.originalPrice == null) {
            return { ...item, originalPrice: item.price, price: mp };
          }
          return item;
        }),
        retailItems: group.retailItems.map((item) => {
          const mp = getRetailVariantPricing(item.productId, item.variantId)?.memberPrice;
          if (mp != null && item.originalPrice == null) {
            return { ...item, originalPrice: item.price, price: mp };
          }
          return item;
        }),
      }))
    );
  }, [getRetailVariantPricing, memberPriceLookup]);

  const handleClearMember = useCallback(() => {
    setIdentifiedMember(null);

    // Revert member pricing on all cart items
    setCartEvents((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.originalPrice != null
            ? { ...item, price: item.originalPrice, originalPrice: undefined }
            : item
        ),
        retailItems: group.retailItems.map((item) =>
          item.originalPrice != null
            ? { ...item, price: item.originalPrice, originalPrice: undefined }
            : item
        ),
      }))
    );
  }, []);

  // Timeslot modal handlers
  const handleOpenTimeslotModal = useCallback(() => setIsTimeslotModalOpen(true), []);
  const handleCloseTimeslotModal = useCallback(() => {
    setIsTimeslotModalOpen(false);
    setPendingProductForTimeslot(null);
  }, []);

  const salesRoutingEvents = useMemo(() => {
    const uniqueEventIds = Array.from(new Set(salesRoutings.map((routing) => routing.eventId)));

    return uniqueEventIds
      .map((eventId) => getEventById(eventId))
      .filter((event): event is NonNullable<ReturnType<typeof getEventById>> => Boolean(event))
      .map((event) => ({
        id: event.id,
        city: event.city,
        name: event.name,
        venue: event.venue,
        imageUrl: getEventThumbnailById(event.id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [salesRoutings]);

  const availableCities = useMemo(
    () => Array.from(new Set(salesRoutingEvents.map((event) => event.city))),
    [salesRoutingEvents]
  );

  const activeSelectedEvent = useMemo(
    () => salesRoutingEvents.find((event) => event.id === selectedEventId) ?? salesRoutingEvents[0],
    [salesRoutingEvents, selectedEventId]
  );

  // The Box Office event whose sales routing provides all retail products
  const boxOfficeEvent = useMemo(
    () => salesRoutingEvents.find((event) => event.id === BOX_OFFICE_EVENT_ID) ?? salesRoutingEvents[0],
    [salesRoutingEvents]
  );

  const cityFilteredEvents = useMemo(
    () => salesRoutingEvents.filter((event) => event.city === eventPickerCity),
    [salesRoutingEvents, eventPickerCity]
  );

  const ticketsEventId = activeSelectedEvent?.id ?? selectedEventId;

  const handleClearTimeslot = useCallback(() => {
    setSelectedTimeslots((prev) => {
      const next = { ...prev };
      delete next[ticketsEventId];
      return next;
    });
  }, [ticketsEventId]);

  const handleConfirmTimeslot = useCallback((timeslot: EventTimeslot) => {
    setSelectedTimeslots((prev) => ({ ...prev, [timeslot.eventId]: timeslot }));
    setIsTimeslotModalOpen(false);
    // Existing cart groups keep their own timeslot — no overwriting.
    // New tickets will land in a group keyed by the new timeslot.

    // If there's a pending product waiting for timeslot selection, add it now
    if (pendingProductForTimeslot) {
      const product = pendingProductForTimeslot;
      setPendingProductForTimeslot(null);

      const isTicketOrAddon = product.type === 'ticket' || product.type === 'addon';
      const targetEvent = isTicketOrAddon ? activeSelectedEvent : boxOfficeEvent;

      setCartEvents((prev) => {
        const eventId = targetEvent?.id ?? BOX_OFFICE_EVENT_ID;
        const groupKey = `${eventId}--${timeslot.id}`;

        let groupIndex = prev.findIndex((g) => g.id === groupKey);

        const updatedGroups = prev.map((g) => ({
          ...g,
          items: g.items.map((i) => ({ ...i })),
          retailItems: g.retailItems.map((i) => ({ ...i })),
        }));

        if (groupIndex === -1) {
          const dateStr = formatTimeslotForCart(timeslot.date, timeslot.startTime);

          updatedGroups.push({
            id: groupKey,
            eventId,
            timeslotId: timeslot.id,
            eventName: targetEvent?.name ?? 'Event',
            eventImageUrl: targetEvent?.imageUrl ?? DEFAULT_EVENT_THUMBNAIL_URL,
            location: targetEvent?.venue ?? '',
            date: dateStr,
            isExpanded: true,
            items: [],
            retailItems: [],
          });
          groupIndex = updatedGroups.length - 1;
        }

        const targetGroup = updatedGroups[groupIndex];

        // Determine effective price: use member price when member is active and eligible
        const useMemberPrice = identifiedMember != null && product.memberPrice != null;
        const effectivePrice = useMemberPrice ? product.memberPrice! : product.price;

        if (isTicketOrAddon) {
          const existingItem = targetGroup.items.find((i) => i.productId === product.id);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            targetGroup.items.push({
              id: `ci-${Date.now()}`,
              productId: product.id,
              name: product.name,
              price: effectivePrice,
              originalPrice: useMemberPrice ? product.price : undefined,
              quantity: 1,
              bookingFee: 0.60,
            });
          }
        } else {
          const existingItem = targetGroup.retailItems.find((i) => i.productId === product.id);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            targetGroup.retailItems.push({
              id: `cp-${Date.now()}`,
              productId: product.id,
              name: product.name,
              price: effectivePrice,
              originalPrice: useMemberPrice ? product.price : undefined,
              quantity: 1,
            });
          }
        }

        targetGroup.isExpanded = true;
        return updatedGroups;
      });
    }
  }, [pendingProductForTimeslot, activeSelectedEvent, boxOfficeEvent, identifiedMember]);

  const ticketCategories = useMemo(
    () => getTicketCategoriesForEvent(ticketsEventId),
    [ticketsEventId]
  );
  const ticketProducts = useMemo(
    () => getTicketProductsForEvent(ticketsEventId),
    [ticketsEventId]
  );

  // Check if the current event has assigned seating
  const currentEventHasSeating = useMemo(
    () => eventHasSeating(ticketsEventId),
    [ticketsEventId]
  );

  // Whether the current seated event already has seated items in the cart
  const hasSeatedCartItems = useMemo(() => {
    const group = cartEvents.find((g) => g.eventId === ticketsEventId);
    return Boolean(group?.items.some((i) => i.seatInfoList && i.seatInfoList.length > 0));
  }, [cartEvents, ticketsEventId]);

  // Get seating configuration for seated events
  const seatingConfig = useMemo(
    () => getSeatingConfigForEvent(ticketsEventId),
    [ticketsEventId]
  );

  // Get add-on products for seated events (shown in Add-Ons tab)
  const addOnProducts = useMemo(
    () => getAddOnProductsForEvent(ticketsEventId),
    [ticketsEventId]
  );

  // Filter add-on products by active category (for Add-Ons tab)
  const filteredAddOnProducts = useMemo(() => {
    if (!activeCategoryId || addOnProducts.length === 0) {
      return addOnProducts;
    }
    return addOnProducts.filter((p) => p.categoryId === activeCategoryId);
  }, [addOnProducts, activeCategoryId]);

  const ticketCategoriesWithMember = useMemo(
    () =>
      ticketCategories.map((cat) => ({
        ...cat,
        hasMemberPricing: ticketProducts.some(
          (p) => p.categoryId === cat.id && p.memberPrice != null
        ),
      })),
    [ticketCategories, ticketProducts]
  );

  // When switching tabs, reset to first category
  const handleTabChange = useCallback((tab: PosTab) => {
    setActiveTab(tab);
    if (tab === 'tickets' || tab === 'seating') {
      setActiveCategoryId(ticketCategories[0]?.id ?? '');
      return;
    }
    if (tab === 'addons') {
      // Add-ons tab uses the same categories as tickets
      setActiveCategoryId(ticketCategories[0]?.id ?? '');
      return;
    }

    const firstGiftShopCategoryId = topLevelGiftShopCategories[0]?.id ?? '';
    setActiveCategoryId(firstGiftShopCategoryId);
    setGiftShopPathIds(firstGiftShopCategoryId ? [firstGiftShopCategoryId] : []);
  }, [ticketCategories, topLevelGiftShopCategories]);

  // When event changes and has seating, switch to seating tab; otherwise to tickets
  useEffect(() => {
    if (currentEventHasSeating && activeTab === 'tickets') {
      setActiveTab('seating');
    } else if (!currentEventHasSeating && (activeTab === 'seating' || activeTab === 'addons')) {
      setActiveTab('tickets');
    }
  }, [currentEventHasSeating, activeTab]);

  useEffect(() => {
    if (activeTab !== 'gift-shop') return;
    if (giftShopPathIds.length > 0) return;
    const firstGiftShopCategoryId = topLevelGiftShopCategories[0]?.id ?? '';
    if (!firstGiftShopCategoryId) return;
    setActiveCategoryId(firstGiftShopCategoryId);
    setGiftShopPathIds([firstGiftShopCategoryId]);
  }, [activeTab, giftShopPathIds.length, topLevelGiftShopCategories]);

  useEffect(() => {
    if (salesRoutingEvents.length === 0) return;

    if (!selectedEventId || !salesRoutingEvents.some((event) => event.id === selectedEventId)) {
      const firstEvent = salesRoutingEvents[0];
      setSelectedEventId(firstEvent.id);
      setPendingEventId(firstEvent.id);
      setEventPickerCity(firstEvent.city);
      return;
    }

    if (!pendingEventId || !salesRoutingEvents.some((event) => event.id === pendingEventId)) {
      setPendingEventId(selectedEventId);
    }

    if (!eventPickerCity || !availableCities.includes(eventPickerCity)) {
      const selectedEvent = salesRoutingEvents.find((event) => event.id === selectedEventId);
      setEventPickerCity(selectedEvent?.city ?? availableCities[0] ?? '');
    }
  }, [salesRoutingEvents, selectedEventId, pendingEventId, eventPickerCity, availableCities]);

  useEffect(() => {
    if (activeTab !== 'tickets') return;
    if (ticketCategories.length === 0) {
      setActiveCategoryId('');
      return;
    }
    if (!ticketCategories.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(ticketCategories[0]?.id ?? '');
    }
  }, [activeTab, ticketCategories, activeCategoryId]);

  // Get filtered products
  const ticketFilteredProducts = useMemo(() => {
    if (ticketCategories.length === 0) {
      return ticketProducts;
    }
    return activeCategoryId
      ? getProductsByCategory(ticketProducts, activeCategoryId)
      : ticketProducts;
  }, [ticketCategories, ticketProducts, activeCategoryId]);

  const hierarchyElements = demo.getHierarchyElements();
  const hierarchyElementProducts = demo.getHierarchyElementProducts();
  const catalogProducts = demo.getProducts();

  const currentGiftShopCategoryId = giftShopPathIds[giftShopPathIds.length - 1] ?? activeCategoryId;
  const childGiftShopCategories = useMemo(
    () => hierarchyElements.filter((he) => he.parentId === currentGiftShopCategoryId),
    [hierarchyElements, currentGiftShopCategoryId]
  );

  const productsForCurrentGiftShopCategory = useMemo(() => {
    const productIds = hierarchyElementProducts
      .filter((link) => link.hierarchyElementId === currentGiftShopCategoryId)
      .map((link) => link.productId);

    return catalogProducts
      .filter((product) => productIds.includes(product.id))
      .map((product) => {
        const pricing = getRetailVariantPricing(product.id);
        return {
          id: product.id,
          name: product.name,
          price: pricing?.price ?? 0,
          memberPrice: pricing?.memberPrice,
          type: 'retail' as const,
          categoryId: currentGiftShopCategoryId,
          imageUrl: product.imageUrl,
          tab: 'shop' as const,
          // Carry variant data through to POS tiles
          variantAxes: product.variantAxes,
          variants: product.variants,
        };
      });
  }, [hierarchyElementProducts, currentGiftShopCategoryId, catalogProducts, getRetailVariantPricing]);

  // Check whether a hierarchy category (or its descendants) contains any
  // product with member pricing, so we can show a crown on the folder tile.
  const categoryHasMemberPricing = useCallback(
    (categoryId: string): boolean => {
      // Direct products in this category
      const directProductIds = hierarchyElementProducts
        .filter((link) => link.hierarchyElementId === categoryId)
        .map((link) => link.productId);

      const hasDirect = directProductIds.some((pid) => {
        return getRetailVariantPricing(pid)?.memberPrice != null;
      });
      if (hasDirect) return true;

      // Recurse into child categories
      const children = hierarchyElements.filter((he) => he.parentId === categoryId);
      return children.some((child) => categoryHasMemberPricing(child.id));
    },
    [getRetailVariantPricing, hierarchyElements, hierarchyElementProducts]
  );

  const topLevelGiftShopCategoriesWithMember = useMemo(
    () =>
      topLevelGiftShopCategories.map((cat) => ({
        ...cat,
        hasMemberPricing: categoryHasMemberPricing(cat.id),
      })),
    [topLevelGiftShopCategories, categoryHasMemberPricing]
  );

  // Categories for the filter bar - tickets and addons use ticket categories, gift-shop uses merch categories
  const categories = (activeTab === 'tickets' || activeTab === 'seating' || activeTab === 'addons')
    ? ticketCategoriesWithMember
    : topLevelGiftShopCategoriesWithMember;

  const giftShopCategoryTiles = useMemo(
    () =>
      childGiftShopCategories.map((category) => ({
        id: `cat-${category.id}`,
        name: category.name,
        price: 0,
        memberPrice: categoryHasMemberPricing(category.id) ? 0 : undefined,
        type: 'retail' as const,
        categoryId: category.id,
        tab: 'shop' as const,
      })),
    [childGiftShopCategories, categoryHasMemberPricing]
  );

  const giftShopProducts = useMemo(
    () => [...giftShopCategoryTiles, ...productsForCurrentGiftShopCategory],
    [giftShopCategoryTiles, productsForCurrentGiftShopCategory]
  );

  const filteredProducts = activeTab === 'tickets' ? ticketFilteredProducts : giftShopProducts;

  // ---- Cart handlers ----

  // Handler for adding seated tickets from the seating map.
  // Groups seats by ticket type (tier + adult/child): if a cart item with the
  // same productId exists, the new seat is appended to its seatInfoList.
  const handleAddSeatedTicketToCart = useCallback((item: Omit<CartItemData, 'id'>) => {
    const targetEvent = activeSelectedEvent;
    const activeTimeslot = selectedTimeslots[ticketsEventId];

    if (!activeTimeslot) {
      setIsTimeslotModalOpen(true);
      return;
    }

    setCartEvents((prev) => {
      const eventId = targetEvent?.id ?? BOX_OFFICE_EVENT_ID;
      const groupKey = `${eventId}--${activeTimeslot.id}`;

      let groupIndex = prev.findIndex((g) => g.id === groupKey);

      const updatedGroups = prev.map((g) => ({
        ...g,
        items: g.items.map((i) => ({
          ...i,
          seatInfoList: i.seatInfoList ? [...i.seatInfoList] : undefined,
        })),
        retailItems: g.retailItems.map((i) => ({ ...i })),
      }));

      if (groupIndex === -1) {
        const dateStr = formatTimeslotForCart(activeTimeslot.date, activeTimeslot.startTime);

        updatedGroups.push({
          id: groupKey,
          eventId,
          timeslotId: activeTimeslot.id,
          eventName: targetEvent?.name ?? 'Event',
          eventImageUrl: targetEvent?.imageUrl ?? DEFAULT_EVENT_THUMBNAIL_URL,
          location: targetEvent?.venue ?? '',
          date: dateStr,
          isExpanded: true,
          items: [],
          retailItems: [],
        });
        groupIndex = updatedGroups.length - 1;
      }

      const targetGroup = updatedGroups[groupIndex];

      // Try to merge into an existing item with the same productId (ticket type key)
      const existingItem = targetGroup.items.find((i) => i.productId === item.productId);

      if (existingItem && existingItem.seatInfoList && item.seatInfoList?.length) {
        existingItem.seatInfoList.push(...item.seatInfoList);
        existingItem.quantity = existingItem.seatInfoList.length;
      } else {
        targetGroup.items.push({
          id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...item,
          seatInfoList: item.seatInfoList,
        });
      }

      targetGroup.isExpanded = true;
      return updatedGroups;
    });
  }, [activeSelectedEvent, selectedTimeslots, ticketsEventId]);

  // Handler for removing a single seat from the cart when deselected on the seating map.
  // Finds the cart item containing the seat, removes the entry, and deletes the item if empty.
  const handleRemoveSeatedTicket = useCallback((seatId: string) => {
    setCartEvents((prev) =>
      prev
        .map((g) => ({
          ...g,
          items: g.items
            .map((i) => {
              if (!i.seatInfoList) return i;
              const filtered = i.seatInfoList.filter((s) => s.seatId !== seatId);
              if (filtered.length === i.seatInfoList.length) return i;
              return { ...i, seatInfoList: filtered, quantity: filtered.length };
            })
            .filter((i) => !i.seatInfoList || i.seatInfoList.length > 0),
          retailItems: [...g.retailItems],
        }))
        .filter((g) => g.items.length > 0 || g.retailItems.length > 0)
    );
  }, []);

  // Clear all seated ticket items from the cart (triggered by "Clear selection" on the seating map)
  const handleClearAllSeatedTickets = useCallback(() => {
    setCartEvents((prev) =>
      prev
        .map((g) => ({
          ...g,
          items: g.items.filter((i) => !i.seatInfoList || i.seatInfoList.length === 0),
          retailItems: [...g.retailItems],
        }))
        .filter((g) => g.items.length > 0 || g.retailItems.length > 0)
    );
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    if (product.id.startsWith('cat-')) {
      const categoryId = product.id.replace('cat-', '');
      setGiftShopPathIds((prev) => [...prev, categoryId]);
      return;
    }

    // Gate: if product has variants, open the variant picker instead of adding directly
    if (product.variants && product.variants.length > 0) {
      setVariantPickerProduct(product);
      return;
    }

    const isTicketOrAddon = product.type === 'ticket' || product.type === 'addon';

    // Tickets/add-ons go to the active ticket event group.
    // Retail/food always goes to the Box Office event group (fixed routing).
    const targetEvent = isTicketOrAddon ? activeSelectedEvent : boxOfficeEvent;

    // Gate: require a timeslot before adding tickets or add-ons
    if (isTicketOrAddon && !selectedTimeslots[targetEvent?.id ?? BOX_OFFICE_EVENT_ID]) {
      setPendingProductForTimeslot(product);
      setIsTimeslotModalOpen(true);
      return;
    }

    setCartEvents((prev) => {
      const eventId = targetEvent?.id ?? BOX_OFFICE_EVENT_ID;

      // For tickets/add-ons, use composite key eventId--timeslotId so the same
      // event can have multiple timeslot groups in the cart.
      // For retail, attach to the first existing group for this event (or create one).
      const activeTimeslot = isTicketOrAddon ? selectedTimeslots[eventId] : undefined;
      const groupKey = activeTimeslot
        ? `${eventId}--${activeTimeslot.id}`
        : eventId;

      // For tickets: exact composite-key match.
      // For retail: find any group belonging to this event (retail piggybacks on existing groups).
      let groupIndex = isTicketOrAddon
        ? prev.findIndex((g) => g.id === groupKey)
        : prev.findIndex((g) => g.eventId === eventId);

      const updatedGroups = prev.map((g) => ({
        ...g,
        items: g.items.map((i) => ({ ...i })),
        retailItems: g.retailItems.map((i) => ({ ...i })),
      }));

      if (groupIndex === -1) {
        const dateStr = activeTimeslot
          ? formatTimeslotForCart(activeTimeslot.date, activeTimeslot.startTime)
          : new Date().toLocaleDateString('en-GB', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

        updatedGroups.push({
          id: groupKey,
          eventId,
          timeslotId: activeTimeslot?.id,
          eventName: targetEvent?.name ?? 'Event',
          eventImageUrl: targetEvent?.imageUrl ?? DEFAULT_EVENT_THUMBNAIL_URL,
          location: targetEvent?.venue ?? '',
          date: dateStr,
          isExpanded: true,
          items: [],
          retailItems: [],
        });
        groupIndex = updatedGroups.length - 1;
      }

      const targetGroup = updatedGroups[groupIndex];

      // Determine effective price: use member price when member is active and eligible
      const useMemberPrice = identifiedMember != null && product.memberPrice != null;
      const effectivePrice = useMemberPrice ? product.memberPrice! : product.price;

      if (isTicketOrAddon) {
        const existingItem = targetGroup.items.find((i) => i.productId === product.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          targetGroup.items.push({
            id: `ci-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: effectivePrice,
            originalPrice: useMemberPrice ? product.price : undefined,
            quantity: 1,
            bookingFee: 0.60,
          });
        }
      } else {
        const existingItem = targetGroup.retailItems.find((i) => i.productId === product.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          targetGroup.retailItems.push({
            id: `cp-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: effectivePrice,
            originalPrice: useMemberPrice ? product.price : undefined,
            quantity: 1,
          });
        }
      }

      targetGroup.isExpanded = true;
      return updatedGroups;
    });
  }, [activeSelectedEvent, boxOfficeEvent, identifiedMember, selectedTimeslots]);

  // Handler for when a variant is selected from the VariantPicker
  const handleVariantSelected = useCallback((product: Product, variant: ProductVariant) => {
    setVariantPickerProduct(null);

    // Resolve variant-specific price from warehouse data (gift shop products)
    // or fall back to the parent product price
    const variantPricing = getRetailVariantPricing(product.id, variant.id);
    const variantPrice = variantPricing?.price ?? product.price;
    const variantMemberPrice = variantPricing?.memberPrice ?? product.memberPrice;

    // Retail products always go to the Box Office event group
    const targetEvent = boxOfficeEvent;

    setCartEvents((prev) => {
      const eventId = targetEvent?.id ?? BOX_OFFICE_EVENT_ID;
      let groupIndex = prev.findIndex((g) => g.eventId === eventId);

      const updatedGroups = prev.map((g) => ({
        ...g,
        items: g.items.map((i) => ({ ...i })),
        retailItems: g.retailItems.map((i) => ({ ...i })),
      }));

      if (groupIndex === -1) {
        const dateStr = new Date().toLocaleDateString('en-GB', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        updatedGroups.push({
          id: eventId,
          eventId,
          eventName: targetEvent?.name ?? 'Event',
          eventImageUrl: targetEvent?.imageUrl ?? DEFAULT_EVENT_THUMBNAIL_URL,
          location: targetEvent?.venue ?? '',
          date: dateStr,
          isExpanded: true,
          items: [],
          retailItems: [],
        });
        groupIndex = updatedGroups.length - 1;
      }

      const targetGroup = updatedGroups[groupIndex];

      // Determine effective price: use member price when member is active and eligible
      const useMemberPrice = identifiedMember != null && variantMemberPrice != null;
      const effectivePrice = useMemberPrice ? variantMemberPrice! : variantPrice;

      // Match by both productId AND variantId for deduplication
      const existingItem = targetGroup.retailItems.find(
        (i) => i.productId === product.id && i.variantId === variant.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        targetGroup.retailItems.push({
          id: `cp-${Date.now()}`,
          productId: product.id,
          variantId: variant.id,
          variantLabel: variant.label,
          name: product.name,
          price: effectivePrice,
          originalPrice: useMemberPrice ? variantPrice : undefined,
          quantity: 1,
        });
      }

      targetGroup.isExpanded = true;
      return updatedGroups;
    });
  }, [boxOfficeEvent, getRetailVariantPricing, identifiedMember]);

  const handleOpenEventSelector = useCallback(() => {
    if (salesRoutingEvents.length === 0) return;
    const currentEvent = activeSelectedEvent ?? salesRoutingEvents[0];
    setPendingEventId(currentEvent.id);
    setEventPickerCity(currentEvent.city);
    setIsEventSelectorOpen(true);
  }, [activeSelectedEvent, salesRoutingEvents]);

  const handleCloseEventSelector = useCallback(() => {
    setIsEventSelectorOpen(false);
  }, []);

  const handleSelectEventCity = useCallback((city: string) => {
    setEventPickerCity(city);
    setPendingEventId((previousEventId) => {
      const isCurrentEventInCity = salesRoutingEvents.some(
        (event) => event.id === previousEventId && event.city === city
      );
      if (isCurrentEventInCity) return previousEventId;
      return salesRoutingEvents.find((event) => event.city === city)?.id ?? '';
    });
  }, [salesRoutingEvents]);

  const handleSelectEventAndApply = useCallback((eventId: string) => {
    setPendingEventId(eventId);
    setSelectedEventId(eventId);
    setIsEventSelectorOpen(false);
    // Auto-preselect the closest timeslot if the new event has none selected
    setSelectedTimeslots((prev) => {
      if (prev[eventId]) return prev;
      const closest = findClosestTimeslot(eventId);
      if (!closest) return prev;
      return { ...prev, [eventId]: closest };
    });
  }, []);

  const handleToggleEventExpand = useCallback((eventId: string) => {
    setCartEvents((prev) =>
      prev.map((g) => (g.id === eventId ? { ...g, isExpanded: !g.isExpanded } : g))
    );
  }, []);

  const handleRemoveEvent = useCallback((eventId: string) => {
    setCartEvents((prev) => prev.filter((g) => g.id !== eventId));
  }, []);

  const handleSwitchTimeslot = useCallback((eventId: string, timeslotId: string) => {
    const schedule = eventSchedules[eventId];
    const ts = schedule?.timeslots.find((t) => t.id === timeslotId);
    if (ts) {
      setSelectedTimeslots((prev) => ({ ...prev, [eventId]: ts }));
    }
  }, []);

  const handleIncrementItem = useCallback((itemId: string) => {
    setCartEvents((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i)),
        retailItems: g.retailItems.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i)),
      }))
    );
  }, []);

  const handleDecrementItem = useCallback((itemId: string) => {
    setCartEvents((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) =>
          i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
        ),
        retailItems: g.retailItems.map((i) =>
          i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
        ),
      }))
    );
  }, []);

  const handleSetItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove the item if quantity is 0 or less
      setCartEvents((prev) =>
        prev
          .map((g) => ({
            ...g,
            items: g.items.filter((i) => i.id !== itemId),
            retailItems: g.retailItems.filter((i) => i.id !== itemId),
          }))
          .filter((g) => g.items.length > 0 || g.retailItems.length > 0)
      );
    } else {
      setCartEvents((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
          retailItems: g.retailItems.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        }))
      );
    }
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCartEvents((prev) =>
      prev
        .map((g) => ({
          ...g,
          items: g.items.filter((i) => i.id !== itemId),
          retailItems: g.retailItems.filter((i) => i.id !== itemId),
        }))
        // Remove groups that have no items left
        .filter((g) => g.items.length > 0 || g.retailItems.length > 0)
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setCartEvents([]);
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    if (activeTab === 'gift-shop') {
      setActiveCategoryId(categoryId);
      setGiftShopPathIds([categoryId]);
      return;
    }
    setActiveCategoryId(categoryId);
  }, [activeTab]);

  const breadcrumbCategories = useMemo(
    () =>
      giftShopPathIds
        .map((id) => hierarchyElements.find((he) => he.id === id))
        .filter((category): category is NonNullable<typeof category> => Boolean(category)),
    [giftShopPathIds, hierarchyElements]
  );

  const showTopBreadcrumbs = activeTab === 'gift-shop' && breadcrumbCategories.length > 1;

  const topBreadcrumbItems = useMemo(
    () => breadcrumbCategories.map((category) => ({ id: category.id, label: category.name })),
    [breadcrumbCategories]
  );

  const handleBreadcrumbClick = useCallback((categoryId: string) => {
    setGiftShopPathIds((prev) => {
      const index = prev.indexOf(categoryId);
      if (index === -1) return prev;
      return prev.slice(0, index + 1);
    });
  }, []);

  const handleHomeClick = useCallback(() => {
    if (activeTab === 'gift-shop') {
      const firstGiftShopCategoryId = topLevelGiftShopCategories[0]?.id ?? '';
      setActiveCategoryId(firstGiftShopCategoryId);
      setGiftShopPathIds(firstGiftShopCategoryId ? [firstGiftShopCategoryId] : []);
      return;
    }

    const firstTicketCategoryId = ticketCategories[0]?.id ?? '';
    setActiveCategoryId(firstTicketCategoryId);
  }, [activeTab, ticketCategories, topLevelGiftShopCategories]);

  const pageClasses = isDevicePreview
    ? `${styles.page} ${styles.pageConstrained}`
    : styles.page;

  const pageContent = (
    <div className={pageClasses} data-touch-mode={isDevicePreview ? 'true' : undefined}>
      <FeverPosHeader
        isDevicePreview={isDevicePreview}
        onToggleDevicePreview={isDevicePreview ? undefined : handleToggleDevicePreview}
        linkedDeviceId={linkedDeviceId}
        paymentDevices={MOCK_PAYMENT_DEVICES}
        onSelectDevice={handleSelectDevice}
        venues={MOCK_VENUES}
        selectedSetupId={selectedSetupId}
        onSelectSetup={handleSelectSetup}
        activeShift={activeShift}
        cashRegisters={MOCK_CASH_REGISTERS}
        onStartShift={handleStartShift}
        onEndShift={handleEndShift}
      />

      <div className={styles.body}>
        {/* Main content area */}
        <div className={styles.main}>
          {/* Top bar: Navigation tabs + action buttons */}
          <div className={styles.topBar}>
            <NavigationTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              eventName={activeSelectedEvent?.name ?? 'Candlelight: Tribute to Taylor Swift'}
              eventImageUrl={activeSelectedEvent?.imageUrl ?? DEFAULT_EVENT_THUMBNAIL_URL}
              onEditEvent={handleOpenEventSelector}
              eventHasSeating={currentEventHasSeating}
            />
            <div className={styles.actions}>
              {identifiedMember ? (
                <div className={styles.memberPill} role="button" tabIndex={0} onClick={handleOpenMemberModal}>
                  <FontAwesomeIcon icon={faAddressCard} className={styles.memberPillIcon} />
                  <span className={styles.memberPillName}>{identifiedMember.name}</span>
                  {identifiedMember.membershipTier && (
                    <span
                      className={styles.memberPillTier}
                      style={{
                        color: MEMBERSHIP_TIER_COLORS[identifiedMember.membershipTier],
                        borderColor: MEMBERSHIP_TIER_COLORS[identifiedMember.membershipTier],
                      }}
                    >
                      <FontAwesomeIcon
                        icon={identifiedMember.membershipRole === 'primary' ? faStar : faUserPlus}
                        className={styles.memberPillTierIcon}
                        title={identifiedMember.membershipRoleLabel || (identifiedMember.membershipRole === 'primary' ? 'Primary Member' : 'Beneficiary')}
                      />
                      {identifiedMember.membershipTier}
                    </span>
                  )}
                  <button
                    type="button"
                    className={styles.memberPillClose}
                    aria-label="Clear member"
                    onClick={(e) => { e.stopPropagation(); handleClearMember(); }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              ) : (
                <button className={styles.actionBtn} type="button" aria-label="Identify member" onClick={handleOpenMemberModal}>
                  <FontAwesomeIcon icon={faAddressCard} />
                </button>
              )}
              <button className={styles.actionBtn} type="button" aria-label="Search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className={`${styles.content} ${activeTab === 'tickets' || activeTab === 'seating' ? styles.contentFirstTab : ''}`}>
            <div className={`${styles.contentInner} ${activeTab === 'seating' ? styles.contentInnerSeating : ''}`}>
              {/* Category filters - shown for non-seating tabs */}
              {activeTab !== 'seating' && (
                <CategoryFilter
                  categories={categories}
                  activeCategoryId={activeCategoryId}
                  onCategoryChange={handleCategoryChange}
                  onCalendarClick={activeTab === 'tickets' || activeTab === 'addons' ? handleOpenTimeslotModal : undefined}
                  onClearTimeslot={handleClearTimeslot}
                  timeslotLabel={
                    (activeTab === 'tickets' || activeTab === 'addons') && selectedTimeslots[ticketsEventId]
                      ? `${formatDatePillWithMonth(selectedTimeslots[ticketsEventId].date)}, ${formatTimeslotTime(selectedTimeslots[ticketsEventId].startTime)}`
                      : undefined
                  }
                  showBreadcrumbs={showTopBreadcrumbs}
                  breadcrumbs={topBreadcrumbItems}
                  onBreadcrumbClick={handleBreadcrumbClick}
                  onHomeClick={handleHomeClick}
                  isHomeDisabled={!showTopBreadcrumbs}
                  isMemberActive={isMemberActive}
                />
              )}

              {/* Seating map view (for seated events) - includes its own timeslot selector */}
              {activeTab === 'seating' && seatingConfig && (
                <SeatingMapView
                  key={ticketsEventId}
                  seatingConfig={seatingConfig}
                  onAddToCart={handleAddSeatedTicketToCart}
                  onRemoveSeatedTicket={handleRemoveSeatedTicket}
                  onClearAllSeatedTickets={handleClearAllSeatedTickets}
                  hasSeatedCartItems={hasSeatedCartItems}
                  eventId={ticketsEventId}
                  timeslotLabel={
                    selectedTimeslots[ticketsEventId]
                      ? `${formatDatePillWithMonth(selectedTimeslots[ticketsEventId].date)}, ${formatTimeslotTime(selectedTimeslots[ticketsEventId].startTime)}`
                      : undefined
                  }
                  onCalendarClick={handleOpenTimeslotModal}
                  onClearTimeslot={handleClearTimeslot}
                  isDevicePreview={isDevicePreview}
                />
              )}

              {/* Product grid (for non-seating tabs) */}
              {activeTab !== 'seating' && (
                <ProductGrid
                  products={activeTab === 'addons' ? filteredAddOnProducts : filteredProducts}
                  onProductClick={handleAddToCart}
                  isMemberActive={isMemberActive}
                />
              )}
            </div>
          </div>
        </div>

        {/* Cart panel */}
        <Cart
          eventGroups={cartEvents}
          onToggleEventExpand={handleToggleEventExpand}
          onRemoveEvent={handleRemoveEvent}
          onIncrementItem={handleIncrementItem}
          onDecrementItem={handleDecrementItem}
          onSetItemQuantity={handleSetItemQuantity}
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
          hideClearAll={false}
          isMemberActive={isMemberActive}
          activeTimeslots={selectedTimeslots}
          selectedTicketEventId={ticketsEventId}
          isDevicePreview={isDevicePreview}
          onSwitchTimeslot={handleSwitchTimeslot}
        />
      </div>

      <EventSelectionModal
        isOpen={isEventSelectorOpen}
        cities={availableCities}
        selectedCity={eventPickerCity}
        events={cityFilteredEvents}
        selectedEventId={pendingEventId}
        onSelectCity={handleSelectEventCity}
        onSelectEvent={handleSelectEventAndApply}
        onClose={handleCloseEventSelector}
      />

      <MemberIdentifyModal
        isOpen={isMemberModalOpen}
        onIdentify={handleIdentifyMember}
        onClose={handleCloseMemberModal}
        isDevicePreview={isDevicePreview}
      />

      <TimeslotModal
        isOpen={isTimeslotModalOpen}
        eventId={ticketsEventId}
        eventName={activeSelectedEvent?.name ?? 'Event'}
        eventVenue={getEventById(ticketsEventId)?.venue ?? ''}
        eventCity={activeSelectedEvent?.city ?? ''}
        eventImageUrl={activeSelectedEvent?.imageUrl}
        selectedTimeslot={selectedTimeslots[ticketsEventId] ?? null}
        onConfirm={handleConfirmTimeslot}
        onClose={handleCloseTimeslotModal}
      />

      {variantPickerProduct && (
        <VariantPicker
          product={variantPickerProduct}
          onSelectVariant={handleVariantSelected}
          onClose={() => setVariantPickerProduct(null)}
          isMemberActive={isMemberActive}
          variantPrices={
            variantPickerProduct.variants
              ? Object.fromEntries(
                  variantPickerProduct.variants.map((v) => {
                    const pricing = getRetailVariantPricing(variantPickerProduct.id, v.id);
                    return [v.id, pricing?.price ?? variantPickerProduct.price];
                  })
                )
              : undefined
          }
          variantMemberPrices={
            variantPickerProduct.variants
              ? Object.fromEntries(
                  variantPickerProduct.variants.map((v) => {
                    const pricing = getRetailVariantPricing(variantPickerProduct.id, v.id);
                    return [v.id, pricing?.memberPrice];
                  })
                )
              : undefined
          }
          variantStock={
            variantPickerProduct.variants
              ? Object.fromEntries(
                  variantPickerProduct.variants.map((v) => {
                    const pricing = retailPricingLookup.get(variantPickerProduct.id);
                    return [v.id, pricing?.variantStock[v.id] ?? 0];
                  })
                )
              : undefined
          }
        />
      )}
    </div>
  );

  if (!isDevicePreview) return pageContent;

  return (
    <div className={styles.devicePreviewRoot}>
      {/* Logo positioned to match header placement (after hamburger menu space) */}
      <img src={feverLogo} alt="Fever Zone" className={styles.devicePreviewLogo} />
      {/* Toggle button positioned to match exact header placement */}
      <button
        className={styles.devicePreviewToggleFloat}
        onClick={handleToggleDevicePreview}
        type="button"
        aria-label="Toggle iMin device preview"
        aria-pressed={isDevicePreview}
      >
        <FontAwesomeIcon icon={faTabletScreenButton} />
        <span className={styles.devicePreviewToggleText}>
          <span>Simulate</span>
          <span>iMin Swan 1 Pro</span>
        </span>
      </button>

      <div ref={backdropRef} className={styles.devicePreviewBackdrop}>
        {!deviceImageLoaded ? (
          <div className={styles.devicePreviewLoading}>
            <FontAwesomeIcon icon={faTabletScreenButton} spin />
            <span>Loading device…</span>
          </div>
        ) : (
          <div className={`${styles.deviceFrame} ${styles.deviceFrameReady}`} style={tabletStyle}>
            <img
              src={iminDeviceImg}
              alt="iMin Swan 1 Pro"
              className={styles.deviceImage}
              draggable={false}
              onLoad={handleDeviceImageLoad}
            />
            <div ref={deviceScreenRef} className={styles.deviceScreen}>
              {pageContent}
              <div className={styles.deviceScreenDofOverlay} />
              <div className={styles.deviceScreenGlare} />
            </div>
          </div>
        )}
      </div>

      {/* Touchscreen-style cursor - SVG ellipse skewed to match device screen perspective */}
      <svg
        ref={touchCursorRef}
        className={styles.touchCursor}
        aria-hidden="true"
        width="38"
        height="38"
        viewBox="0 0 38 38"
      >
        {/*
          * The device screen maps to a parallelogram, not a rectangle.
          * From the matrix3d corner coordinates:
          *   - Vertical edges tilt ~12.6° from true vertical (average of left/right edges)
          *   - Horizontal edges tilt ~-0.5° from true horizontal (average of top/bottom)
          * We apply a skewX to make the ellipse axes non-perpendicular, matching the screen.
          */}
        <ellipse
          cx="19"
          cy="19"
          rx="14"
          ry="17"
          fill="rgba(0, 121, 202, 0.12)"
          stroke="rgba(0, 121, 202, 0.35)"
          strokeWidth="2"
          transform="skewX(12)"
        />
      </svg>
    </div>
  );
}
