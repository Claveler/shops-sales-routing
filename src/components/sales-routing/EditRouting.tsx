import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTimes, 
  faGlobe, 
  faCashRegister, 
  faStore, 
  faDesktop, 
  faExternalLinkAlt, 
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardBody, CardHeader, CardTitle } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Breadcrumb } from '../common/Breadcrumb';
import { useDemo } from '../../context/DemoContext';
import { 
  getSalesRoutingById, 
  getEventById,
  getWarehouseById,
  channels,
  isBoxOfficeChannel,
  type RoutingStatus,
  type SalesRouting 
} from '../../data/mockData';
import styles from './EditRouting.module.css';

const statusOptions: { value: RoutingStatus; label: string; description: string }[] = [
  { value: 'draft', label: 'Draft', description: 'Not yet published, visible only in Fever Zone' },
  { value: 'active', label: 'Active', description: 'Live and accepting orders' },
  { value: 'inactive', label: 'Inactive', description: 'Paused, not accepting new orders' }
];

const statusVariantMap: Record<RoutingStatus, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  draft: 'warning',
  inactive: 'secondary'
};

const channelIcons: Record<string, typeof faGlobe> = {
  onsite: faCashRegister,
  marketplace: faGlobe,
  whitelabel: faDesktop,
  kiosk: faStore,
  ota: faExternalLinkAlt
};

export function EditRouting() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const demo = useDemo();
  const demoWarehouses = demo.getWarehouses();
  
  // Load routing data
  const [routing, setRouting] = useState<SalesRouting | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Editable state (initialized from routing)
  const [status, setStatus] = useState<RoutingStatus>('draft');
  const [warehouseIds, setWarehouseIds] = useState<string[]>([]);
  const [priceRefId, setPriceRefId] = useState<string>('');
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const [channelMapping, setChannelMapping] = useState<Record<string, string>>({});
  
  // UI state
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);

  // Helper to get warehouse by ID
  const getWarehouse = (warehouseId: string) => {
    const demoWarehouse = demoWarehouses.find(w => w.id === warehouseId);
    return demoWarehouse || getWarehouseById(warehouseId);
  };

  // Load routing data on mount
  useEffect(() => {
    if (id) {
      let foundRouting: SalesRouting | undefined;
      if (demo.isResetMode) {
        foundRouting = demo.getSalesRoutings().find(r => r.id === id);
      } else {
        foundRouting = getSalesRoutingById(id);
      }
      
      if (foundRouting) {
        setRouting(foundRouting);
        setStatus(foundRouting.status);
        setWarehouseIds(foundRouting.warehouseIds || []);
        setPriceRefId(foundRouting.priceReferenceWarehouseId || '');
        setChannelIds(foundRouting.channelIds || []);
        setChannelMapping(foundRouting.channelWarehouseMapping || {});
      } else {
        setNotFound(true);
      }
    }
    setLoading(false);
  }, [id, demo.isResetMode, demo]);

  // Track changes across all editable fields
  useEffect(() => {
    if (!routing) return;
    const statusChanged = status !== routing.status;
    const warehousesChanged = JSON.stringify(warehouseIds) !== JSON.stringify(routing.warehouseIds);
    const priceRefChanged = priceRefId !== routing.priceReferenceWarehouseId;
    const channelsChanged = JSON.stringify(channelIds) !== JSON.stringify(routing.channelIds);
    const mappingChanged = JSON.stringify(channelMapping) !== JSON.stringify(routing.channelWarehouseMapping || {});
    
    setHasChanges(statusChanged || warehousesChanged || priceRefChanged || channelsChanged || mappingChanged);
  }, [routing, status, warehouseIds, priceRefId, channelIds, channelMapping]);

  const event = routing ? getEventById(routing.eventId) : null;

  // Derive data from editable state
  const availableChannels = channels.filter(c => !channelIds.includes(c.id));
  const availableWarehouses = demoWarehouses.filter(w => !warehouseIds.includes(w.id));
  const selectedChannels = channels.filter(c => channelIds.includes(c.id));
  const hasBoxOffice = channelIds.some(id => isBoxOfficeChannel(id));
  const isMultiWarehouse = hasBoxOffice;
  const warehouses = warehouseIds.map(id => getWarehouse(id)).filter(Boolean);
  const onlineChannels = selectedChannels.filter(c => !isBoxOfficeChannel(c.id));
  const priceRefWarehouse = priceRefId ? getWarehouse(priceRefId) : null;

  // Handlers for editable fields
  const handleAddWarehouse = (warehouseId: string) => {
    if (warehouseId && !warehouseIds.includes(warehouseId)) {
      setWarehouseIds(prev => [...prev, warehouseId]);
      // If this is the first warehouse, make it the price reference
      if (warehouseIds.length === 0) {
        setPriceRefId(warehouseId);
      }
    }
    setShowAddWarehouse(false);
  };

  const handleSwapWarehouse = (newWarehouseId: string) => {
    if (newWarehouseId && warehouseIds.length === 1) {
      const oldWarehouseId = warehouseIds[0];
      setWarehouseIds([newWarehouseId]);
      setPriceRefId(newWarehouseId);
      // Update all channel mappings to use the new warehouse
      const updatedMapping: Record<string, string> = {};
      for (const channelId of Object.keys(channelMapping)) {
        if (channelMapping[channelId] === oldWarehouseId) {
          updatedMapping[channelId] = newWarehouseId;
        } else {
          updatedMapping[channelId] = channelMapping[channelId];
        }
      }
      setChannelMapping(updatedMapping);
    }
  };

  const handlePriceRefChange = (warehouseId: string) => {
    setPriceRefId(warehouseId);
  };

  const handleAddChannel = (channelId: string) => {
    if (channelId && !channelIds.includes(channelId)) {
      setChannelIds(prev => [...prev, channelId]);
      // For online channels, default to first warehouse
      if (!isBoxOfficeChannel(channelId) && warehouseIds.length > 0) {
        setChannelMapping(prev => ({ ...prev, [channelId]: warehouseIds[0] }));
      }
    }
    setShowAddChannel(false);
  };

  const handleMappingChange = (channelId: string, warehouseId: string) => {
    setChannelMapping(prev => ({ ...prev, [channelId]: warehouseId }));
  };

  // Validation: all online channels must have a warehouse assigned
  const allMappingsValid = onlineChannels.every(c => 
    channelMapping[c.id] && channelMapping[c.id].trim() !== ''
  );

  const handleSave = () => {
    if (routing?.id) {
      demo.updateRouting(routing.id, {
        warehouseIds,
        priceReferenceWarehouseId: priceRefId,
        channelIds,
        channelWarehouseMapping: channelMapping,
        status
      });
    }
    navigate('/products/sales-routing');
  };

  const handleCancel = () => navigate('/products/sales-routing');

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
  }

  if (notFound || !routing || !event) {
    return (
      <div className={styles.container}>
        <Breadcrumb items={[
          { label: 'Products', path: '/products' },
          { label: 'Sales routing', path: '/products/sales-routing' },
          { label: 'Not found' }
        ]} />
        <Card>
          <CardBody>
            <div className={styles.notFound}>
              <h2>Sales routing not found</h2>
              <p>The sales routing you're looking for doesn't exist or has been deleted.</p>
              <Button variant="primary" onClick={() => navigate('/products/sales-routing')}>Back to list</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Breadcrumb items={[
        { label: 'Products', path: '/products' },
        { label: 'Sales routing', path: '/products/sales-routing' },
        { label: 'Edit' }
      ]} />
      
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>{event.name}</h1>
          <span className={styles.headerMeta}>{event.venue}, {event.city}</span>
        </div>
        <Badge variant={statusVariantMap[routing.status]} size="md">
          {routing.status.charAt(0).toUpperCase() + routing.status.slice(1)}
        </Badge>
      </div>

      {/* Main Card - Single Page Layout */}
      <Card padding="none">
        <CardHeader>
          <CardTitle subtitle="Edit warehouses, channels, and stock routing.">
            Configuration
          </CardTitle>
        </CardHeader>
        <CardBody padding="lg">
          {/* Warehouses Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Warehouse{isMultiWarehouse ? 's' : ''}</span>
              {isMultiWarehouse && availableWarehouses.length > 0 && !showAddWarehouse && (
                <Button variant="ghost" size="sm" onClick={() => setShowAddWarehouse(true)}>
                  <FontAwesomeIcon icon={faPlus} /> Add
                </Button>
              )}
            </div>
            <p className={styles.sectionHint}>
              {isMultiWarehouse 
                ? 'Select which warehouse provides the price reference for Fever sessions.'
                : 'Select which warehouse provides stock and prices for this routing.'}
            </p>
            
            {isMultiWarehouse ? (
              <div className={styles.warehouseList}>
                {warehouses.map(warehouse => (
                  <label key={warehouse!.id} className={styles.warehouseItem}>
                    <input
                      type="radio"
                      name="priceRef"
                      checked={priceRefId === warehouse!.id}
                      onChange={() => handlePriceRefChange(warehouse!.id)}
                      className={styles.priceRefRadio}
                    />
                    <span className={styles.warehouseName}>{warehouse!.name}</span>
                    {priceRefId === warehouse!.id && (
                      <span className={styles.priceRefBadge}>
                        <FontAwesomeIcon icon={faStar} /> Price Ref
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <div className={styles.warehouseSwap}>
                <select
                  className={styles.selectInput}
                  value={warehouseIds[0] || ''}
                  onChange={(e) => handleSwapWarehouse(e.target.value)}
                >
                  {demoWarehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
            )}

            {isMultiWarehouse && showAddWarehouse && (
              <div className={styles.addRow}>
                <select
                  className={styles.selectInput}
                  onChange={(e) => { if (e.target.value) handleAddWarehouse(e.target.value); }}
                  defaultValue=""
                >
                  <option value="" disabled>Select warehouse...</option>
                  {availableWarehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
                <button className={styles.cancelBtn} onClick={() => setShowAddWarehouse(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}
          </div>

          {/* Channel Routing Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Channel Routing</span>
              {availableChannels.length > 0 && !showAddChannel && (
                <Button variant="ghost" size="sm" onClick={() => setShowAddChannel(true)}>
                  <FontAwesomeIcon icon={faPlus} /> Add Channel
                </Button>
              )}
            </div>
            <p className={styles.sectionHint}>Configure which warehouse serves each sales channel.</p>

            <div className={styles.routingTable}>
              <div className={styles.routingHeader}>
                <span>Channel</span>
                <span>Warehouse</span>
              </div>
              
              {/* Box Office row */}
              {hasBoxOffice && (
                <div className={styles.routingRow}>
                  <div className={styles.routingChannel}>
                    <FontAwesomeIcon icon={faCashRegister} className={styles.channelIcon} />
                    <span>Box Office</span>
                  </div>
                  <div className={styles.routingWarehouse}>
                    <span className={styles.allWarehouses}>All warehouses</span>
                  </div>
                </div>
              )}
              
              {/* Online channel rows - editable */}
              {onlineChannels.map(channel => (
                <div key={channel.id} className={styles.routingRow}>
                  <div className={styles.routingChannel}>
                    <FontAwesomeIcon icon={channelIcons[channel.type] || faGlobe} className={styles.channelIcon} />
                    <span>{channel.name}</span>
                  </div>
                  <div className={styles.routingWarehouse}>
                    <select
                      className={styles.selectInput}
                      value={channelMapping[channel.id] || ''}
                      onChange={(e) => handleMappingChange(channel.id, e.target.value)}
                    >
                      <option value="">Select warehouse...</option>
                      {warehouseIds.map(whId => {
                        const wh = getWarehouse(whId);
                        return wh ? <option key={wh.id} value={wh.id}>{wh.name}</option> : null;
                      })}
                    </select>
                  </div>
                </div>
              ))}

              {/* Add channel row */}
              {showAddChannel && (
                <div className={styles.addChannelRow}>
                  <select
                    className={styles.selectInput}
                    onChange={(e) => { if (e.target.value) handleAddChannel(e.target.value); }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select channel...</option>
                    {availableChannels.map(channel => (
                      <option key={channel.id} value={channel.id}>{channel.name}</option>
                    ))}
                  </select>
                  <button className={styles.cancelBtn} onClick={() => setShowAddChannel(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              )}
            </div>

            {!allMappingsValid && onlineChannels.length > 0 && (
              <p className={styles.warning}>All online channels must have a warehouse assigned</p>
            )}

            {priceRefWarehouse && (
              <p className={styles.priceRefNote}>
                <FontAwesomeIcon icon={faStar} /> Product prices in Fever are based on <strong>{priceRefWarehouse.name}</strong>
              </p>
            )}
          </div>

          {/* Status Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Status</span>
            </div>
            <div className={styles.statusOptions}>
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.statusOption} ${status === option.value ? styles.selected : ''}`}
                  onClick={() => setStatus(option.value)}
                >
                  <span className={styles.statusLabel}>{option.label}</span>
                  <span className={styles.statusDescription}>{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={!hasChanges || !allMappingsValid}>
              Save changes
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
