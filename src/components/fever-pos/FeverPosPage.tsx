import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faMagnifyingGlass, faTabletScreenButton } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import iminDeviceImg from '../../assets/imin-swan-1-pro-3d.webp';
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
} from '../../data/feverPosData';
import { getEventById } from '../../data/mockData';
import type { Product, CartEventGroup } from '../../data/feverPosData';
import { EventSelectionModal } from './EventSelectionModal';
import styles from './FeverPosPage.module.css';

/**
 * The Box Office is configured against a single sales routing (= one event).
 * That event's routing determines which retail products are available at this POS.
 * Changing the ticket event selector does NOT change the retail product source.
 */
const BOX_OFFICE_EVENT_ID = 'evt-001';

export function FeverPosPage() {
  const demo = useDemo();
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

  // Device preview state (iMin Swan 1 Pro: 1397×786 dp)
  const [isDevicePreview, setIsDevicePreview] = useState(false);
  const handleToggleDevicePreview = useCallback(() => setIsDevicePreview((prev) => !prev), []);

  // Scale the device frame to fit within the browser viewport
  const TABLET_OUTER_W = 7680; // 3D image width
  const TABLET_OUTER_H = 4320; // 3D image height
  const backdropRef = useRef<HTMLDivElement>(null);
  const [tabletScale, setTabletScale] = useState(1);

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
  const [selectedEventId, setSelectedEventId] = useState('');
  const [pendingEventId, setPendingEventId] = useState('');
  const [eventPickerCity, setEventPickerCity] = useState('');

  const salesRoutingEvents = useMemo(() => {
    const uniqueEventIds = Array.from(new Set(demo.getSalesRoutings().map((routing) => routing.eventId)));

    return uniqueEventIds
      .map((eventId) => getEventById(eventId))
      .filter((event): event is NonNullable<ReturnType<typeof getEventById>> => Boolean(event))
      .map((event) => ({
        id: event.id,
        city: event.city,
        name: event.name,
        venue: event.venue,
        imageUrl: getEventThumbnailById(event.id),
      }));
  }, [demo]);

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
  const ticketCategories = useMemo(
    () => getTicketCategoriesForEvent(ticketsEventId),
    [ticketsEventId]
  );
  const ticketProducts = useMemo(
    () => getTicketProductsForEvent(ticketsEventId),
    [ticketsEventId]
  );
  const categories = activeTab === 'tickets' ? ticketCategories : topLevelGiftShopCategories;

  // When switching tabs, reset to first category
  const handleTabChange = useCallback((tab: PosTab) => {
    setActiveTab(tab);
    if (tab === 'tickets') {
      setActiveCategoryId(ticketCategories[0]?.id ?? '');
      return;
    }

    const firstGiftShopCategoryId = topLevelGiftShopCategories[0]?.id ?? '';
    setActiveCategoryId(firstGiftShopCategoryId);
    setGiftShopPathIds(firstGiftShopCategoryId ? [firstGiftShopCategoryId] : []);
  }, [ticketCategories, topLevelGiftShopCategories]);

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
  const productWarehouses = demo.getProductWarehouses();

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
        const warehouseEntry = productWarehouses.find((pw) => pw.productId === product.id);
        return {
          id: product.id,
          name: product.name,
          price: warehouseEntry?.price ?? 0,
          type: 'retail' as const,
          categoryId: currentGiftShopCategoryId,
          imageUrl: product.imageUrl,
          tab: 'shop' as const,
        };
      });
  }, [hierarchyElementProducts, currentGiftShopCategoryId, catalogProducts, productWarehouses]);

  const giftShopCategoryTiles = useMemo(
    () =>
      childGiftShopCategories.map((category) => ({
        id: `cat-${category.id}`,
        name: category.name,
        price: 0,
        type: 'retail' as const,
        categoryId: category.id,
        tab: 'shop' as const,
      })),
    [childGiftShopCategories]
  );

  const giftShopProducts = useMemo(
    () => [...giftShopCategoryTiles, ...productsForCurrentGiftShopCategory],
    [giftShopCategoryTiles, productsForCurrentGiftShopCategory]
  );

  const filteredProducts = activeTab === 'tickets' ? ticketFilteredProducts : giftShopProducts;

  // ---- Cart handlers ----
  const handleAddToCart = useCallback((product: Product) => {
    if (product.id.startsWith('cat-')) {
      const categoryId = product.id.replace('cat-', '');
      setGiftShopPathIds((prev) => [...prev, categoryId]);
      return;
    }

    const isTicketOrAddon = product.type === 'ticket' || product.type === 'addon';

    // Tickets/add-ons go to the active ticket event group.
    // Retail/food always goes to the Box Office event group (fixed routing).
    const targetEvent = isTicketOrAddon ? activeSelectedEvent : boxOfficeEvent;

    setCartEvents((prev) => {
      const eventId = targetEvent?.id ?? BOX_OFFICE_EVENT_ID;
      let groupIndex = prev.findIndex((g) => g.id === eventId);

      const updatedGroups = prev.map((g) => ({
        ...g,
        items: g.items.map((i) => ({ ...i })),
        retailItems: g.retailItems.map((i) => ({ ...i })),
      }));

      if (groupIndex === -1) {
        updatedGroups.push({
          id: eventId,
          eventName: targetEvent?.name ?? 'Event',
          eventImageUrl: targetEvent?.imageUrl ?? DEFAULT_EVENT_THUMBNAIL_URL,
          location: targetEvent?.city ?? '',
          date: new Date().toLocaleDateString('en-GB', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          isExpanded: true,
          items: [],
          retailItems: [],
        });
        groupIndex = updatedGroups.length - 1;
      }

      const targetGroup = updatedGroups[groupIndex];

      if (isTicketOrAddon) {
        const existingItem = targetGroup.items.find((i) => i.productId === product.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          targetGroup.items.push({
            id: `ci-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
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
            price: product.price,
            originalPrice: product.originalPrice,
            quantity: 1,
          });
        }
      }

      targetGroup.isExpanded = true;
      return updatedGroups;
    });
  }, [activeSelectedEvent, boxOfficeEvent]);

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
  }, []);

  const handleToggleEventExpand = useCallback((eventId: string) => {
    setCartEvents((prev) =>
      prev.map((g) => (g.id === eventId ? { ...g, isExpanded: !g.isExpanded } : g))
    );
  }, []);

  const handleRemoveEvent = useCallback((eventId: string) => {
    setCartEvents((prev) => prev.filter((g) => g.id !== eventId));
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

  const handleRemoveItem = useCallback((itemId: string) => {
    setCartEvents((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.id !== itemId),
        retailItems: g.retailItems.filter((i) => i.id !== itemId),
      }))
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setCartEvents([]);
  }, []);

  const handleClearCategory = useCallback(() => {
    if (activeTab === 'gift-shop') {
      const firstGiftShopCategoryId = topLevelGiftShopCategories[0]?.id ?? '';
      setActiveCategoryId(firstGiftShopCategoryId);
      setGiftShopPathIds(firstGiftShopCategoryId ? [firstGiftShopCategoryId] : []);
      return;
    }
    setActiveCategoryId(ticketCategories[0]?.id ?? '');
  }, [activeTab, ticketCategories, topLevelGiftShopCategories]);

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
    <div className={pageClasses}>
      <FeverPosHeader
        isDevicePreview={isDevicePreview}
        onToggleDevicePreview={isDevicePreview ? undefined : handleToggleDevicePreview}
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
            />
            <div className={styles.actions}>
              <button className={styles.actionBtn} type="button" aria-label="Contacts">
                <FontAwesomeIcon icon={faAddressCard} />
              </button>
              <button className={styles.actionBtn} type="button" aria-label="Search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className={styles.content}>
            <div className={styles.contentInner}>
              {/* Category filters */}
              <CategoryFilter
                categories={categories}
                activeCategoryId={activeCategoryId}
                onCategoryChange={handleCategoryChange}
                onClear={activeTab === 'tickets' ? handleClearCategory : undefined}
                showBreadcrumbs={showTopBreadcrumbs}
                breadcrumbs={topBreadcrumbItems}
                onBreadcrumbClick={handleBreadcrumbClick}
                onHomeClick={handleHomeClick}
                isHomeDisabled={!showTopBreadcrumbs}
              />

              {/* Product grid */}
              <ProductGrid
                products={filteredProducts}
                onProductClick={handleAddToCart}
              />

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
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
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
    </div>
  );

  if (!isDevicePreview) return pageContent;

  return (
    <div className={styles.devicePreviewRoot}>
      {/* Toggle sits outside the backdrop, fixed at the top center of the viewport */}
      <button
        className={styles.devicePreviewToggleFloat}
        onClick={handleToggleDevicePreview}
        type="button"
        aria-label="Toggle iMin device preview"
        aria-pressed={isDevicePreview}
      >
        <FontAwesomeIcon icon={faTabletScreenButton} />
        <span>iMin Swan 1 Pro</span>
      </button>

      <div ref={backdropRef} className={styles.devicePreviewBackdrop}>
        <div className={styles.deviceFrame} style={tabletStyle}>
          <img
            src={iminDeviceImg}
            alt="iMin Swan 1 Pro"
            className={styles.deviceImage}
            draggable={false}
          />
          <div className={styles.deviceScreen}>
            {pageContent}
            <div className={styles.deviceScreenDofOverlay} />
            <div className={styles.deviceScreenGlare} />
          </div>
        </div>
      </div>
    </div>
  );
}
