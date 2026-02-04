import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faCashRegister, faGlobe, faChevronDown, faChevronRight, faStar, faDesktop, faStore, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Card, CardHeader, CardTitle, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Breadcrumb } from '../common/Breadcrumb';
import { SalesRoutingEmptyState } from './SalesRoutingEmptyState';
import { useDemo } from '../../context/DemoContext';
import { getEventById, getWarehouseById, channels, hasBoxOfficeChannel, isBoxOfficeChannel } from '../../data/mockData';
import type { RoutingStatus } from '../../data/mockData';
import styles from './SalesRoutingList.module.css';

const statusVariantMap: Record<RoutingStatus, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  draft: 'warning',
  inactive: 'secondary'
};

const channelTypeIcons: Record<string, typeof faGlobe> = {
  onsite: faCashRegister,
  marketplace: faGlobe,
  whitelabel: faDesktop,
  kiosk: faStore,
  ota: faExternalLinkAlt
};

export function SalesRoutingList() {
  const navigate = useNavigate();
  const demo = useDemo();
  const salesRoutings = demo.getSalesRoutings();
  const demoWarehouses = demo.getWarehouses();
  const integration = demo.getIntegration();
  
  // State for expanded rows - first routing expanded by default
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // Initialize with first routing expanded
  useEffect(() => {
    if (salesRoutings.length > 0 && expandedIds.size === 0) {
      setExpandedIds(new Set([salesRoutings[0].id]));
    }
  }, [salesRoutings]);

  // Helper to get warehouse by ID - use demo context first, then static data
  const getWarehouse = (id: string) => {
    const demoWarehouse = demoWarehouses.find(w => w.id === id);
    return demoWarehouse || getWarehouseById(id);
  };
  
  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateNew = () => {
    navigate('/products/sales-routing/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/products/sales-routing/edit/${id}`);
  };

  const handleGoToIntegration = () => {
    navigate('/products/catalog-integration');
  };

  // Show empty state if no routings
  if (salesRoutings.length === 0) {
    return (
      <div className={styles.container}>
        <Breadcrumb 
          items={[
            { label: 'Products', path: '/products' },
            { label: 'Sales routing' }
          ]} 
        />
        
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Sales routing</h1>
        </div>

        <SalesRoutingEmptyState 
          hasIntegration={!!integration}
          onCreateNew={handleCreateNew}
          onGoToIntegration={handleGoToIntegration}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Breadcrumb 
        items={[
          { label: 'Products', path: '/products' },
          { label: 'Sales routing' }
        ]} 
      />
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Sales routing</h1>
      </div>

      <Card padding="none">
        <div className={styles.cardInner}>
          <CardHeader 
            actions={
              <Button 
                variant="primary" 
                icon={faPlus}
                onClick={handleCreateNew}
              >
                Create new sales routing
              </Button>
            }
          >
            <CardTitle subtitle="Configure product availability for events">
              Sales Routings
            </CardTitle>
          </CardHeader>

          <CardBody>
            {/* Table Header */}
            <div className={styles.tableHeader}>
              <div className={styles.headerCell} style={{ flex: 2 }}>Event</div>
              <div className={styles.headerCell} style={{ flex: 3 }}>Distribution</div>
              <div className={styles.headerCell} style={{ width: 100 }}>Status</div>
              <div className={styles.headerCell} style={{ width: 80, textAlign: 'right' }}>Actions</div>
            </div>

            {/* Collapsible Rows */}
            <div className={styles.routingList}>
              {salesRoutings.map((routing) => {
                const event = getEventById(routing.eventId);
                const isExpanded = expandedIds.has(routing.id);
                const hasBoxOffice = hasBoxOfficeChannel(routing.channelIds);
                const onlineChannelIds = routing.channelIds.filter(id => !isBoxOfficeChannel(id));
                const onlineChannelObjects = channels.filter(c => onlineChannelIds.includes(c.id));
                const boxOfficeWarehouses = routing.warehouseIds.map(id => getWarehouse(id)).filter(Boolean);

                return (
                  <div key={routing.id} className={`${styles.routingRow} ${isExpanded ? styles.expanded : ''}`}>
                    {/* Main Row */}
                    <div className={styles.mainRow} onClick={() => toggleExpanded(routing.id)}>
                      <div className={styles.expandToggle}>
                        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                      </div>
                      <div className={styles.rowContent}>
                        <div className={styles.eventCell} style={{ flex: 2 }}>
                          {event ? (
                            <>
                              <span className={styles.eventName}>{event.name}</span>
                              <span className={styles.eventMeta}>{event.venue}, {event.city}</span>
                            </>
                          ) : (
                            <span className={styles.unknown}>Unknown event</span>
                          )}
                        </div>
                        <div className={styles.distributionPreview} style={{ flex: 3 }}>
                          {hasBoxOffice && (
                            <span className={styles.previewTag}>
                              <FontAwesomeIcon icon={faCashRegister} />
                              Box Office ({boxOfficeWarehouses.length})
                            </span>
                          )}
                          {onlineChannelObjects.length > 0 && (
                            <span className={styles.previewTag}>
                              <FontAwesomeIcon icon={faGlobe} />
                              {onlineChannelObjects.length} online channel{onlineChannelObjects.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ width: 100 }}>
                          <Badge variant={statusVariantMap[routing.status]}>
                            {routing.status.charAt(0).toUpperCase() + routing.status.slice(1)}
                          </Badge>
                        </div>
                        <div className={styles.actions} style={{ width: 80 }}>
                          <button 
                            className={styles.actionBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(routing.id);
                            }}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Detail Section */}
                    <div className={`${styles.detailSection} ${isExpanded ? styles.visible : ''}`}>
                      <div className={styles.channelWarehouseTable}>
                        <div className={styles.subTableHeader}>
                          <span className={styles.columnHeader}>Channel</span>
                          <span className={styles.columnHeader}>Warehouse</span>
                        </div>
                        {/* Box Office rows */}
                        {hasBoxOffice && boxOfficeWarehouses.map((warehouse, index) => (
                          <div key={`box-office-${warehouse?.id}`} className={`${styles.tableRow} ${index < boxOfficeWarehouses.length - 1 ? styles.noBorder : ''}`}>
                            <div className={styles.channelCell}>
                              {index === 0 && (
                                <>
                                  <FontAwesomeIcon icon={faCashRegister} className={styles.channelIcon} />
                                  <span>Box Office</span>
                                </>
                              )}
                            </div>
                            <div className={styles.warehouseCell}>
                              <span>{warehouse?.name}</span>
                              {routing.priceReferenceWarehouseId === warehouse?.id && (
                                <span className={styles.priceRefBadge}>
                                  <FontAwesomeIcon icon={faStar} /> Price Ref
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {/* Online channel rows */}
                        {onlineChannelObjects.map(channel => {
                          const warehouseId = routing.channelWarehouseMapping[channel.id];
                          const warehouse = warehouseId ? getWarehouse(warehouseId) : null;
                          return (
                            <div key={channel.id} className={styles.tableRow}>
                              <div className={styles.channelCell}>
                                <FontAwesomeIcon 
                                  icon={channelTypeIcons[channel.type] || faGlobe} 
                                  className={styles.channelIcon}
                                />
                                <span>{channel.name}</span>
                              </div>
                              <div className={styles.warehouseCell}>
                                <span>{warehouse?.name || 'Not configured'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </div>
      </Card>
    </div>
  );
}
