import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { PageHeader } from '../common/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '../common/Card';
import { ChannelList } from './ChannelList';
import { ChannelProductList } from './ChannelProductList';
import { BulkEditModal } from './BulkEditModal';
import { useDemo } from '../../context/DemoContext';
import { channels, getEventById } from '../../data/mockData';
import styles from './ChannelsPage.module.css';

export function ChannelsPage() {
  const demo = useDemo();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedRoutingId, setSelectedRoutingId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [checkedChannelIds, setCheckedChannelIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Get unique cities from events that have routings
  const citiesWithRoutings = useMemo(() => {
    const routings = demo.getSalesRoutings();
    const cities = new Set<string>();
    routings.forEach(r => {
      const event = getEventById(r.eventId);
      if (event) cities.add(event.city);
    });
    return Array.from(cities).sort();
  }, [demo]);

  // Filter events/routings by selected city
  const eventsInCity = useMemo(() => {
    if (!selectedCity) return [];
    return demo.getSalesRoutings()
      .map(r => ({ routing: r, event: getEventById(r.eventId) }))
      .filter(({ event }) => event?.city === selectedCity)
      .filter(({ event }) => event !== undefined) as { routing: ReturnType<typeof demo.getSalesRoutings>[0], event: NonNullable<ReturnType<typeof getEventById>> }[];
  }, [selectedCity, demo]);

  // Get channels for the selected routing
  const routedChannels = useMemo(() => {
    if (!selectedRoutingId) return [];
    const routing = demo.getSalesRoutings().find(r => r.id === selectedRoutingId);
    return routing ? channels.filter(c => routing.channelIds.includes(c.id)) : [];
  }, [selectedRoutingId, demo]);

  // Check if any routings exist at all (for empty state)
  const hasAnyRoutings = demo.getSalesRoutings().length > 0;

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  const handleToggleCheck = (channelId: string) => {
    setCheckedChannelIds(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSelectAll = () => {
    setCheckedChannelIds(routedChannels.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setCheckedChannelIds([]);
  };

  const handleOpenBulkEdit = () => {
    if (checkedChannelIds.length > 1) {
      setShowBulkModal(true);
    }
  };

  // Empty state when no routings exist at all
  if (!hasAnyRoutings) {
    return (
      <>
        <PageHeader
          breadcrumbItems={[
            { label: 'Products', path: '/products' },
            { label: 'Channels' }
          ]}
          title="Channels"
        />
        <div className={styles.pageBody}>
        <Card>
          <div className={styles.emptyContainer}>
            <div className={styles.iconWrapper}>
              <FontAwesomeIcon icon={faSlidersH} className={styles.icon} />
            </div>
            
            <h2 className={styles.emptyTitle}>Product channel visibility</h2>
            
            <p className={styles.emptyDescription}>
              Configure which products are available in each sales channel. This provides 
              granular control beyond warehouse-level routing — choose exactly which items 
              appear in Marketplace, Whitelabel, or other channels.
            </p>
            
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>1</span>
                <span className={styles.featureText}>Create a sales routing first</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>2</span>
                <span className={styles.featureText}>Then configure product visibility per channel</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>3</span>
                <span className={styles.featureText}>Fine-tune which products appear where</span>
              </div>
            </div>

            <p className={styles.emptyHint}>
              No sales routings have been created yet. Create a sales routing to configure product visibility.
            </p>
          </div>
        </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumbItems={[
          { label: 'Products', path: '/products' },
          { label: 'Channels' }
        ]}
        title="Channels"
      >
        <div className={styles.selectorRow}>
          <select 
            className={styles.citySelector}
            value={selectedCity || ''}
            onChange={(e) => {
              setSelectedCity(e.target.value || null);
              setSelectedRoutingId(null);
              setSelectedChannelId(null);
            }}
          >
            <option value="">City</option>
            {citiesWithRoutings.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          
          <select
            className={styles.eventSelector}
            value={selectedRoutingId || ''}
            onChange={(e) => {
              setSelectedRoutingId(e.target.value || null);
              setSelectedChannelId(null);
            }}
            disabled={!selectedCity}
          >
            <option value="">Select a city and search for an event</option>
            {eventsInCity.map(({ routing, event }) => (
              <option key={routing.id} value={routing.id}>
                {event.name} - {event.venue}
              </option>
            ))}
          </select>
          
          <button 
            className={styles.showBtn}
            disabled={!selectedRoutingId}
          >
            Show
          </button>
        </div>
      </PageHeader>
      <div className={styles.pageBody}>
      <Card padding="none">
        <CardHeader>
          <CardTitle subtitle="Configure which products are visible in each sales channel">
            Product Channel Visibility
          </CardTitle>
        </CardHeader>
        <CardBody padding="none">
          <div className={styles.mainContent}>
          <div className={styles.leftPanel}>
            <ChannelList
              selectedChannelId={selectedChannelId}
              onSelectChannel={handleSelectChannel}
              checkedChannelIds={checkedChannelIds}
              onToggleCheck={handleToggleCheck}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              routingId={selectedRoutingId}
            />
            {checkedChannelIds.length > 1 && (
              <button 
                className={styles.bulkEditBtn}
                onClick={handleOpenBulkEdit}
              >
                Edit {checkedChannelIds.length} channels in bulk
              </button>
            )}
          </div>
          
          <div className={styles.rightPanel}>
            {selectedChannelId && selectedRoutingId ? (
              <ChannelProductList channelId={selectedChannelId} routingId={selectedRoutingId} />
            ) : (
              <div className={styles.noSelection}>
                <FontAwesomeIcon icon={faSlidersH} className={styles.noSelectionIcon} />
                <p>Select a channel from the list to view and configure product visibility</p>
              </div>
            )}
          </div>
        </div>
        </CardBody>
      </Card>

      <BulkEditModal
        isOpen={showBulkModal}
        channelIds={checkedChannelIds}
        onClose={() => setShowBulkModal(false)}
      />
      </div>
    </>
  );
}
