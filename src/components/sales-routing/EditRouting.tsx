import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faGlobe, faCashRegister, faStore, faDesktop, faExternalLinkAlt, faArrowRight, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Card, CardHeader, CardTitle, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Breadcrumb } from '../common/Breadcrumb';
import { ImmutableSection } from './ImmutableSection';
import { DeleteConfirmModal } from './DeleteConfirmModal';
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
  
  // Form state
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [channelWarehouseMapping, setChannelWarehouseMapping] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<RoutingStatus>('draft');
  
  // UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);

  // Helper to get warehouse by ID
  const getWarehouse = (warehouseId: string) => {
    const demoWarehouse = demoWarehouses.find(w => w.id === warehouseId);
    return demoWarehouse || getWarehouseById(warehouseId);
  };

  // Load routing data on mount
  useEffect(() => {
    if (id) {
      // Check demo context first, then fall back to static data
      let foundRouting: SalesRouting | undefined;
      if (demo.isResetMode) {
        foundRouting = demo.getSalesRoutings().find(r => r.id === id);
      } else {
        foundRouting = getSalesRoutingById(id);
      }
      
      if (foundRouting) {
        setRouting(foundRouting);
        setSelectedChannelIds(foundRouting.channelIds || []);
        setChannelWarehouseMapping(foundRouting.channelWarehouseMapping || {});
        setStatus(foundRouting.status);
      } else {
        setNotFound(true);
      }
    }
    setLoading(false);
  }, [id, demo.isResetMode, demo]);

  // Track changes
  useEffect(() => {
    if (!routing) return;
    
    const channelsChanged = JSON.stringify([...selectedChannelIds].sort()) !== JSON.stringify([...(routing.channelIds || [])].sort());
    const mappingChanged = JSON.stringify(channelWarehouseMapping) !== JSON.stringify(routing.channelWarehouseMapping || {});
    const statusChanged = status !== routing.status;
    
    setHasChanges(channelsChanged || mappingChanged || statusChanged);
  }, [routing, selectedChannelIds, channelWarehouseMapping, status]);

  const event = routing ? getEventById(routing.eventId) : null;

  // Get channels that can be added (not already selected)
  const availableChannels = channels.filter(c => !selectedChannelIds.includes(c.id));

  // Get the selected channel objects
  const selectedChannels = channels.filter(c => selectedChannelIds.includes(c.id));

  // Handle channel-warehouse mapping changes
  const handleMappingChange = (channelId: string, warehouseId: string) => {
    setChannelWarehouseMapping(prev => ({
      ...prev,
      [channelId]: warehouseId
    }));
  };

  // Add a new channel
  const handleAddChannel = (channelId: string) => {
    setSelectedChannelIds(prev => [...prev, channelId]);
    // Set default warehouse if only one available
    if (routing && routing.warehouseIds.length === 1) {
      setChannelWarehouseMapping(prev => ({
        ...prev,
        [channelId]: routing.warehouseIds[0]
      }));
    }
    setShowAddChannel(false);
  };

  // Remove a channel
  const handleRemoveChannel = (channelId: string) => {
    // Don't allow removing the last channel
    if (selectedChannelIds.length <= 1) return;
    
    setSelectedChannelIds(prev => prev.filter(id => id !== channelId));
    // Also remove the warehouse mapping
    setChannelWarehouseMapping(prev => {
      const newMapping = { ...prev };
      delete newMapping[channelId];
      return newMapping;
    });
  };

  // Check if all channels have warehouse assigned
  const allChannelsHaveWarehouse = selectedChannelIds.every(
    channelId => channelWarehouseMapping[channelId] && channelWarehouseMapping[channelId].trim() !== ''
  );

  const handleSave = () => {
    console.log('Saving routing:', {
      id: routing?.id,
      channelIds: selectedChannelIds,
      channelWarehouseMapping,
      status
    });
    
    navigate('/products/sales-routing');
  };

  const handleCancel = () => {
    navigate('/products/sales-routing');
  };

  const handleDelete = () => {
    console.log('Deleting routing:', routing?.id);
    navigate('/products/sales-routing');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (notFound || !routing || !event) {
    return (
      <div className={styles.container}>
        <Breadcrumb 
          items={[
            { label: 'Products', path: '/products' },
            { label: 'Sales routing', path: '/products/sales-routing' },
            { label: 'Not found' }
          ]} 
        />
        <Card>
          <CardBody>
            <div className={styles.notFound}>
              <h2>Sales routing not found</h2>
              <p>The sales routing you're looking for doesn't exist or has been deleted.</p>
              <Button variant="primary" onClick={() => navigate('/products/sales-routing')}>
                Back to list
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Breadcrumb 
        items={[
          { label: 'Products', path: '/products' },
          { label: 'Sales routing', path: '/products/sales-routing' },
          { label: 'Edit' }
        ]} 
      />
      
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>Edit sales routing</h1>
          <Badge variant={statusVariantMap[routing.status]} size="md">
            {routing.status.charAt(0).toUpperCase() + routing.status.slice(1)}
          </Badge>
        </div>
      </div>

      <Card padding="none">
        <div className={styles.cardInner}>
          <CardHeader>
            <CardTitle subtitle={event ? `${event.venue}, ${event.city}` : `ID: ${routing.id}`}>
              {event?.name || 'Unknown Event'}
            </CardTitle>
          </CardHeader>

          <CardBody>
            {/* Immutable Configuration Section - now shows warehouses */}
            <ImmutableSection warehouseIds={routing.warehouseIds} event={event} />

            {/* Editable Settings Section */}
            <div className={styles.editableSection}>
              <h3 className={styles.sectionTitle}>Operational Settings</h3>
              <p className={styles.sectionSubtitle}>
                These settings can be modified at any time.
              </p>

              {/* Sales Channels Section */}
              <div className={styles.formGroup}>
                <div className={styles.labelWithAction}>
                  <label className={styles.label}>Sales Channels</label>
                  {availableChannels.length > 0 && (
                    <div className={styles.addChannelWrapper}>
                      {showAddChannel ? (
                        <div className={styles.addChannelDropdown}>
                          <select
                            className={styles.addChannelSelect}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddChannel(e.target.value);
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>Select channel...</option>
                            {availableChannels.map(channel => (
                              <option key={channel.id} value={channel.id}>
                                {channel.name}
                              </option>
                            ))}
                          </select>
                          <button 
                            className={styles.cancelAddBtn}
                            onClick={() => setShowAddChannel(false)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className={styles.addChannelBtn}
                          onClick={() => setShowAddChannel(true)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          Add channel
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className={styles.fieldDescription}>
                  Configure which channels this routing serves and assign warehouses
                </p>
                <div className={styles.mappingList}>
                  {selectedChannels.map(channel => {
                    const currentWarehouseId = channelWarehouseMapping[channel.id] || '';
                    const isBoxOffice = isBoxOfficeChannel(channel.id);
                    
                    return (
                      <div key={channel.id} className={`${styles.mappingRow} ${isBoxOffice ? styles.boxOfficeRow : ''}`}>
                        <div className={styles.channelInfo}>
                          <FontAwesomeIcon 
                            icon={channelIcons[channel.type] || faGlobe} 
                            className={`${styles.channelIcon} ${isBoxOffice ? styles.boxOfficeIcon : ''}`}
                          />
                          <span>{channel.name}</span>
                        </div>
                        <FontAwesomeIcon icon={faArrowRight} className={styles.mappingArrow} />
                        <select
                          className={styles.warehouseSelect}
                          value={currentWarehouseId}
                          onChange={(e) => handleMappingChange(channel.id, e.target.value)}
                        >
                          <option value="">Select warehouse...</option>
                          {routing.warehouseIds.map(whId => {
                            const wh = getWarehouse(whId);
                            return wh ? (
                              <option key={wh.id} value={wh.id}>
                                {wh.name}
                              </option>
                            ) : null;
                          })}
                        </select>
                        {selectedChannelIds.length > 1 && (
                          <button
                            className={styles.removeChannelBtn}
                            onClick={() => handleRemoveChannel(channel.id)}
                            title="Remove channel"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!allChannelsHaveWarehouse && (
                  <p className={styles.validationWarning}>
                    All channels must have a warehouse assigned
                  </p>
                )}
              </div>

              {/* Status Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
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
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={!hasChanges || !allChannelsHaveWarehouse || selectedChannelIds.length === 0}
              >
                Save changes
              </Button>
            </div>

            {/* Danger Zone */}
            <div className={styles.dangerZone}>
              <div className={styles.dangerContent}>
                <div className={styles.dangerIcon}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <div className={styles.dangerInfo}>
                  <h4 className={styles.dangerTitle}>Delete this sales routing</h4>
                  <p className={styles.dangerDescription}>
                    Once deleted, this routing cannot be recovered. All configuration will be permanently removed.
                  </p>
                </div>
              </div>
              <Button 
                variant="danger" 
                icon={faTrash}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete routing
              </Button>
            </div>
          </CardBody>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          routingName={event?.name || 'Unknown Event'}
          routingStatus={routing.status}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
