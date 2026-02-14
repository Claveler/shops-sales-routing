import { useState, useCallback, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { FeverPosHeader } from './FeverPosHeader';
import { NavigationTabs } from './NavigationTabs';
import type { PosTab } from './NavigationTabs';
import { CategoryFilter } from './CategoryFilter';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import {
  getTicketProductsForEvent,
  getTicketCategoriesForEvent,
  getProductsByCategory,
  initialCartEvents,
  initialCartProducts,
  DEFAULT_EVENT_THUMBNAIL_URL,
} from '../../data/feverPosData';
import { getEventById } from '../../data/mockData';
import type { Product, CartEventGroup, CartItemData } from '../../data/feverPosData';
import { EventSelectionModal } from './EventSelectionModal';
import styles from './FeverPosPage.module.css';

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

  // Cart state
  const [cartEvents, setCartEvents] = useState<CartEventGroup[]>(initialCartEvents);
  const [cartProducts, setCartProducts] = useState<CartItemData[]>(initialCartProducts);
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
        imageUrl: DEFAULT_EVENT_THUMBNAIL_URL,
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

    if (product.type === 'ticket' || product.type === 'addon') {
      // Add to the first event group (or create one)
      setCartEvents((prev) => {
        if (prev.length === 0) {
          return [
            {
              id: `evt-new-${Date.now()}`,
              eventName: activeSelectedEvent?.name ?? 'Candlelight: Tribute to Taylor Swift',
              eventImageUrl: activeSelectedEvent?.imageUrl ?? DEFAULT_EVENT_THUMBNAIL_URL,
              location: activeSelectedEvent?.city ?? 'Madrid',
              date: new Date().toLocaleDateString('en-GB', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              isExpanded: true,
              items: [
                {
                  id: `ci-${Date.now()}`,
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  quantity: 1,
                  bookingFee: 0.60,
                },
              ],
            },
          ];
        }

        const updatedGroups = [...prev];
        const targetGroup = updatedGroups[updatedGroups.length - 1];
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
        targetGroup.isExpanded = true;
        return updatedGroups;
      });
    } else {
      // Food / retail goes to products
      setCartProducts((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            id: `cp-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            quantity: 1,
          },
        ];
      });
    }
  }, [activeSelectedEvent]);

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

  const handleConfirmEventChange = useCallback(() => {
    if (!pendingEventId) return;
    setSelectedEventId(pendingEventId);
    setIsEventSelectorOpen(false);
  }, [pendingEventId]);

  const handleToggleEventExpand = useCallback((eventId: string) => {
    setCartEvents((prev) =>
      prev.map((g) => (g.id === eventId ? { ...g, isExpanded: !g.isExpanded } : g))
    );
  }, []);

  const handleRemoveEvent = useCallback((eventId: string) => {
    setCartEvents((prev) => prev.filter((g) => g.id !== eventId));
  }, []);

  const handleIncrementItem = useCallback((itemId: string) => {
    // Check event items first
    setCartEvents((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i)),
      }))
    );
    setCartProducts((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i))
    );
  }, []);

  const handleDecrementItem = useCallback((itemId: string) => {
    setCartEvents((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) =>
          i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
        ),
      }))
    );
    setCartProducts((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCartEvents((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.id !== itemId),
      }))
    );
    setCartProducts((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const handleClearAll = useCallback(() => {
    setCartEvents([]);
    setCartProducts([]);
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

  return (
    <div className={styles.page}>
      <FeverPosHeader />

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
          productItems={cartProducts}
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
        onSelectEvent={setPendingEventId}
        onClose={handleCloseEventSelector}
        onConfirm={handleConfirmEventChange}
      />
    </div>
  );
}
