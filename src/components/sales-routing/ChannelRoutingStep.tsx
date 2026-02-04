import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faGlobe, faShoppingCart, faDesktop, faTicketAlt, faArrowRight, faMagicWandSparkles, faCog } from '@fortawesome/free-solid-svg-icons';
import { channels, getWarehouseById, isBoxOfficeChannel } from '../../data/mockData';
import { useDemo } from '../../context/DemoContext';
import styles from './ChannelRoutingStep.module.css';

interface ChannelRoutingStepProps {
  selectedChannelIds: string[];
  selectedWarehouseIds: string[];
  channelWarehouseMapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
}

const channelIcons: Record<string, typeof faGlobe> = {
  'onsite': faStore,
  'marketplace': faGlobe,
  'whitelabel': faShoppingCart,
  'kiosk': faDesktop,
  'ota': faTicketAlt,
};

export function ChannelRoutingStep({
  selectedChannelIds,
  selectedWarehouseIds,
  channelWarehouseMapping,
  onChange,
}: ChannelRoutingStepProps) {
  const demo = useDemo();
  const demoWarehouses = demo.getWarehouses();

  // Get warehouse by ID - check demo context first
  const getWarehouse = (id: string) => {
    const demoWarehouse = demoWarehouses.find(w => w.id === id);
    return demoWarehouse || getWarehouseById(id);
  };

  // Get selected channels with their data
  const selectedChannels = selectedChannelIds
    .map(id => channels.find(c => c.id === id))
    .filter(Boolean);

  // Get selected warehouses with their data
  const selectedWarehouses = selectedWarehouseIds
    .map(id => getWarehouse(id))
    .filter(Boolean);

  // Get only online channels (exclude Box Office)
  const onlineChannelIds = selectedChannelIds.filter(id => !isBoxOfficeChannel(id));

  // Auto-populate mapping if only one warehouse (only for online channels)
  useEffect(() => {
    if (selectedWarehouseIds.length === 1 && onlineChannelIds.length > 0) {
      const warehouseId = selectedWarehouseIds[0];
      const autoMapping: Record<string, string> = {};
      onlineChannelIds.forEach(channelId => {
        autoMapping[channelId] = warehouseId;
      });
      // Only update if different from current mapping for online channels
      const currentOnlineMapping = Object.fromEntries(
        Object.entries(channelWarehouseMapping).filter(([key]) => !isBoxOfficeChannel(key))
      );
      const currentKeys = Object.keys(currentOnlineMapping).sort().join(',');
      const newKeys = Object.keys(autoMapping).sort().join(',');
      if (currentKeys !== newKeys || 
          Object.values(currentOnlineMapping).some(v => v !== warehouseId)) {
        onChange(autoMapping);
      }
    }
  }, [selectedWarehouseIds, selectedChannelIds]);

  const handleWarehouseChange = (channelId: string, warehouseId: string) => {
    onChange({
      ...channelWarehouseMapping,
      [channelId]: warehouseId,
    });
  };

  // Fill demo data - assign only online channels to warehouses
  const handleFillDemoData = () => {
    const mapping: Record<string, string> = {};
    onlineChannelIds.forEach(channelId => {
      // Online → second warehouse if available, else first
      mapping[channelId] = selectedWarehouseIds[1] || selectedWarehouseIds[0];
    });
    onChange(mapping);
  };

  const isSingleWarehouse = selectedWarehouseIds.length === 1;
  const hasOnlineChannels = onlineChannelIds.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Configure channel routing</h2>
          <p className={styles.subtitle}>
            {isSingleWarehouse 
              ? 'Online channels will use your selected warehouse'
              : 'Select which warehouse will serve each online channel'}
          </p>
        </div>
        {demo.isResetMode && !isSingleWarehouse && hasOnlineChannels && (
          <button className={styles.fillDemoBtn} onClick={handleFillDemoData}>
            <FontAwesomeIcon icon={faMagicWandSparkles} />
            Fill demo data
          </button>
        )}
      </div>

      <div className={styles.mappingList}>
        {selectedChannels.map(channel => {
          const icon = channelIcons[channel!.type] || faGlobe;
          const isBoxOffice = isBoxOfficeChannel(channel!.id);
          const currentWarehouseId = channelWarehouseMapping[channel!.id] || '';
          const currentWarehouse = currentWarehouseId ? getWarehouse(currentWarehouseId) : null;

          return (
            <div 
              key={channel!.id} 
              className={`${styles.mappingRow} ${isBoxOffice ? styles.boxOffice : ''}`}
            >
              <div className={styles.channelInfo}>
                <div className={`${styles.channelIcon} ${isBoxOffice ? styles.boxOfficeIcon : ''}`}>
                  <FontAwesomeIcon icon={icon} />
                </div>
                <div className={styles.channelDetails}>
                  <span className={styles.channelName}>{channel!.name}</span>
                  {isBoxOffice && (
                    <span className={styles.channelHint}>
                      Warehouse selection happens per POS device
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.arrow}>
                <FontAwesomeIcon icon={faArrowRight} />
              </div>

              <div className={styles.warehouseSelect}>
                {isBoxOffice ? (
                  <div className={styles.boxOfficeConfig}>
                    <FontAwesomeIcon icon={faCog} className={styles.configIcon} />
                    <span className={styles.configuredElsewhere}>
                      Configured in Box Office Setup
                    </span>
                  </div>
                ) : isSingleWarehouse ? (
                  <div className={styles.autoSelected}>
                    <span className={styles.warehouseName}>
                      {currentWarehouse?.name || 'Not selected'}
                    </span>
                    <span className={styles.autoLabel}>Auto-selected</span>
                  </div>
                ) : (
                  <select
                    className={styles.select}
                    value={currentWarehouseId}
                    onChange={(e) => handleWarehouseChange(channel!.id, e.target.value)}
                  >
                    <option value="">Select warehouse...</option>
                    {selectedWarehouses.map(warehouse => (
                      <option key={warehouse!.id} value={warehouse!.id}>
                        {warehouse!.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isSingleWarehouse && hasOnlineChannels && (
        <p className={styles.note}>
          Each online channel can only be served by one warehouse. Stock will be consumed from the selected warehouse when sales occur through that channel.
        </p>
      )}
    </div>
  );
}
