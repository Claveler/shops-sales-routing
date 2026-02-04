import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faGlobe, faDesktop, faStore, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { channels, getProductsByWarehouseIds } from '../../data/mockData';
import styles from './ChannelProductMapping.module.css';

interface ChannelProductMappingProps {
  warehouseIds: string[];
  value: Record<string, string[]>;
  onChange: (mapping: Record<string, string[]>) => void;
}

const channelIcons: Record<string, typeof faGlobe> = {
  marketplace: faGlobe,
  whitelabel: faDesktop,
  kiosk: faStore,
  ota: faExternalLinkAlt
};

export function ChannelProductMapping({ warehouseIds, value, onChange }: ChannelProductMappingProps) {
  const products = useMemo(() => getProductsByWarehouseIds(warehouseIds), [warehouseIds]);
  const [bulkChannels, setBulkChannels] = useState<string[]>([]);

  const handleBulkChannelToggle = (channelId: string) => {
    const newBulkChannels = bulkChannels.includes(channelId)
      ? bulkChannels.filter(id => id !== channelId)
      : [...bulkChannels, channelId];
    
    setBulkChannels(newBulkChannels);
  };

  const applyBulkToAll = () => {
    const newMapping: Record<string, string[]> = {};
    products.forEach(product => {
      newMapping[product.id] = [...bulkChannels];
    });
    onChange(newMapping);
  };

  const handleProductChannelToggle = (productId: string, channelId: string) => {
    const currentChannels = value[productId] || [];
    const newChannels = currentChannels.includes(channelId)
      ? currentChannels.filter(id => id !== channelId)
      : [...currentChannels, channelId];
    
    onChange({
      ...value,
      [productId]: newChannels
    });
  };

  const isProductChannelSelected = (productId: string, channelId: string) => {
    return (value[productId] || []).includes(channelId);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Configure channel distribution</h2>
      <p className={styles.subtitle}>Select which channels each product should be published to</p>

      {/* Bulk Selection */}
      <div className={styles.bulkSection}>
        <h3 className={styles.bulkTitle}>Quick selection</h3>
        <p className={styles.bulkSubtitle}>Select channels and apply to all products at once</p>
        
        <div className={styles.bulkChannels}>
          {channels.map(channel => (
            <button
              key={channel.id}
              className={`${styles.bulkChannelBtn} ${bulkChannels.includes(channel.id) ? styles.selected : ''}`}
              onClick={() => handleBulkChannelToggle(channel.id)}
            >
              <FontAwesomeIcon icon={channelIcons[channel.type]} className={styles.channelIcon} />
              <span>{channel.name}</span>
              {bulkChannels.includes(channel.id) && (
                <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />
              )}
            </button>
          ))}
        </div>
        
        <button 
          className={styles.applyAllBtn}
          onClick={applyBulkToAll}
          disabled={bulkChannels.length === 0}
        >
          Apply to all {products.length} products
        </button>
      </div>

      {/* Product Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.productCol}>Product</th>
              {channels.map(channel => (
                <th key={channel.id} className={styles.channelCol}>
                  <div className={styles.channelHeader}>
                    <FontAwesomeIcon icon={channelIcons[channel.type]} />
                    <span>{channel.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td className={styles.productCell}>
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{product.name}</span>
                    <span className={styles.sku}>{product.sku}</span>
                  </div>
                </td>
                {channels.map(channel => (
                  <td key={channel.id} className={styles.channelCell}>
                    <button
                      className={`${styles.channelToggle} ${isProductChannelSelected(product.id, channel.id) ? styles.active : ''}`}
                      onClick={() => handleProductChannelToggle(product.id, channel.id)}
                    >
                      {isProductChannelSelected(product.id, channel.id) && (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <strong>{products.length}</strong> products
        </div>
        <div className={styles.summaryItem}>
          <strong>{Object.values(value).filter(v => v.length > 0).length}</strong> configured
        </div>
        <div className={styles.summaryItem}>
          <strong>{products.length - Object.values(value).filter(v => v.length > 0).length}</strong> unconfigured
        </div>
      </div>
    </div>
  );
}
