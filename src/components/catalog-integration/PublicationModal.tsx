import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes,
  faExternalLinkAlt, 
  faCopy, 
  faCheck, 
  faGlobe, 
  faBoxes,
  faCashRegister,
  faImage,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { 
  getProductWarehouseDetails, 
  getWarehouseById as getStaticWarehouseById, 
  getBoxOfficeSetupsByRoutingId, 
  getChannelById,
  hasBoxOfficeChannel,
  isBoxOfficeChannel
} from '../../data/mockData';
import type { ResolvedProductPublication } from '../../data/mockData';
import { DesignPendingBanner } from '../common/DesignPendingBanner';
import styles from './PublicationModal.module.css';

interface PublicationModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  publications: ResolvedProductPublication[];
  onClose: () => void;
}

// Get the price warehouse for a sales routing
function getPriceWarehouseId(salesRouting: ResolvedProductPublication['salesRouting']): string {
  // For Box Office with multiple warehouses, use price reference warehouse
  if (salesRouting.priceReferenceWarehouseId) {
    return salesRouting.priceReferenceWarehouseId;
  }
  // Otherwise, use the first (or only) warehouse
  return salesRouting.warehouseIds[0];
}

export function PublicationModal({ 
  isOpen, 
  productId, 
  productName, 
  publications, 
  onClose 
}: PublicationModalProps) {
  const demo = useDemo();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper to get warehouse by ID (checks demo context first)
  const getWarehouseById = (id: string) => {
    if (demo.isResetMode) {
      return demo.getWarehouses().find(w => w.id === id);
    }
    return getStaticWarehouseById(id);
  };

  // Helper to get product-warehouse details (checks demo context first)
  const getProductWarehouseDetailsLocal = (pId: string, whId: string) => {
    if (demo.isResetMode) {
      const pw = demo.getProductWarehouses().find(
        pw => pw.productId === pId && pw.warehouseId === whId
      );
      if (pw) {
        return { price: pw.price, currency: pw.currency, stock: pw.stock };
      }
      return null;
    }
    return getProductWarehouseDetails(pId, whId);
  };

  if (!isOpen) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleCopySessionType = async (sessionTypeId: string) => {
    try {
      await navigator.clipboard.writeText(sessionTypeId);
      setCopiedId(sessionTypeId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get data for selected publication
  const selectedPub = publications[selectedIndex];
  const priceWarehouseId = getPriceWarehouseId(selectedPub.salesRouting);
  const priceDetails = getProductWarehouseDetailsLocal(productId, priceWarehouseId);
  const hasBoxOffice = hasBoxOfficeChannel(selectedPub.salesRouting.channelIds);
  
  // Get warehouse names
  const warehouseNames = selectedPub.salesRouting.warehouseIds
    .map(id => getWarehouseById(id)?.name)
    .filter(Boolean);
  const priceRefWarehouse = selectedPub.salesRouting.priceReferenceWarehouseId 
    ? getWarehouseById(selectedPub.salesRouting.priceReferenceWarehouseId)?.name 
    : null;
  
  // Get Box Office setups
  const boxOfficeSetups = hasBoxOffice 
    ? getBoxOfficeSetupsByRoutingId(selectedPub.salesRouting.id) 
    : [];
  
  // Get ALL channels for the Channels card with visibility status
  const allChannels = selectedPub.salesRouting.channelIds
    ? selectedPub.salesRouting.channelIds
        .map(id => {
          const channel = getChannelById(id);
          if (!channel) return null;
          
          // Check visibility for this product in this channel
          const isBoxOffice = isBoxOfficeChannel(id);
          // Box Office channels don't have per-product visibility settings
          const isVisible = isBoxOffice 
            ? true 
            : demo.isProductVisibleInChannel(productId, id, selectedPub.salesRouting.id);
          
          return {
            id,
            name: channel.name,
            isBoxOffice,
            isVisible
          };
        })
        .filter(Boolean) as { id: string; name: string; isBoxOffice: boolean; isVisible: boolean }[]
    : [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.productName}>{productName}</h2>
            <span className={styles.subtitle}>
              Distributed through {publications.length} event{publications.length > 1 ? 's' : ''}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <DesignPendingBanner variant="inline" />

        {/* Two-column body */}
        <div className={styles.body}>
          {/* Left column - List */}
          <div className={styles.listColumn}>
            {publications.map((pub, index) => {
              const isSelected = index === selectedIndex;
              const pubHasBoxOffice = hasBoxOfficeChannel(pub.salesRouting.channelIds);
              const pubHasOnlineChannels = pub.salesRouting.channelIds.some(id => id !== 'box-office');
              
              return (
                <button
                  key={`${pub.salesRouting.id}-${index}`}
                  className={`${styles.listItem} ${isSelected ? styles.active : ''}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className={styles.eventThumbnail}>
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                  <div className={styles.listItemInfo}>
                    <span className={styles.listEventName}>
                      {pub.event.name}
                    </span>
                    <span className={styles.listRoutingName}>{pub.event.venue}</span>
                    <div className={styles.channelBadges}>
                      {pubHasBoxOffice && (
                        <span className={styles.channelBadge}>
                          <FontAwesomeIcon icon={faCashRegister} />
                          Box Office
                        </span>
                      )}
                      {pubHasOnlineChannels && (
                        <span className={`${styles.channelBadge} ${styles.onlineBadge}`}>
                          <FontAwesomeIcon icon={faGlobe} />
                          Online
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right column - Details */}
          <div className={styles.detailColumn}>
            {/* Detail Header */}
            <div className={styles.detailHeader}>
              <span className={styles.detailThumbnail}>
                <FontAwesomeIcon icon={faImage} />
              </span>
              <div className={styles.detailHeaderInfo}>
                <h3 className={styles.detailEventName}>{selectedPub.event.name}</h3>
                <span className={styles.detailRoutingName}>{selectedPub.event.venue}, {selectedPub.event.city}</span>
              </div>
              {priceDetails && (
                <span className={styles.detailPrice}>
                  {formatPrice(priceDetails.price, priceDetails.currency)}
                </span>
              )}
            </div>

            {/* Detail Cards */}
            <div className={styles.detailCards}>
              {/* Stock From */}
              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <FontAwesomeIcon icon={faBoxes} className={styles.cardIcon} />
                  <span className={styles.cardLabel}>Stock from</span>
                </div>
                <div className={styles.cardContent}>
                  <span className={styles.cardValue}>{warehouseNames.join(', ')}</span>
                  {priceRefWarehouse && warehouseNames.length > 1 && (
                    <span className={styles.priceRef}>(price from {priceRefWarehouse})</span>
                  )}
                </div>
              </div>

              {/* Channels */}
              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <FontAwesomeIcon icon={faGlobe} className={styles.cardIcon} />
                  <span className={styles.cardLabel}>Channels</span>
                </div>
                <div className={styles.cardContent}>
                  {allChannels.length > 0 ? (
                    <div className={styles.channelsList}>
                      {allChannels.map(channel => (
                        <div key={channel.id} className={styles.channelRow}>
                          <span className={styles.channelName}>{channel.name}</span>
                          {!channel.isBoxOffice && (
                            <span className={`${styles.visibilityIndicator} ${channel.isVisible ? styles.visible : styles.hidden}`}>
                              <FontAwesomeIcon icon={channel.isVisible ? faEye : faEyeSlash} />
                              {channel.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.emptyMessage}>No channels configured</span>
                  )}
                </div>
              </div>

              {/* Box Office Setups */}
              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <FontAwesomeIcon icon={faCashRegister} className={styles.cardIcon} />
                  <span className={styles.cardLabel}>Box Office Setups</span>
                </div>
                <div className={styles.cardContent}>
                  {hasBoxOffice ? (
                    <span className={styles.cardValue}>
                      {boxOfficeSetups.length > 0 
                        ? boxOfficeSetups.map(s => s.name).join(', ')
                        : 'Box Office channel configured (no setups assigned)'}
                    </span>
                  ) : (
                    <span className={styles.emptyMessage}>
                      Not distributed via Box Office
                    </span>
                  )}
                </div>
              </div>

              {/* Session Type */}
              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardLabel}>Session Type ID</span>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.sessionType}>
                    <code className={styles.sessionTypeId}>{selectedPub.sessionTypeId}</code>
                    <button 
                      className={styles.copyBtn}
                      onClick={() => handleCopySessionType(selectedPub.sessionTypeId)}
                      title="Copy Session Type ID"
                    >
                      <FontAwesomeIcon icon={copiedId === selectedPub.sessionTypeId ? faCheck : faCopy} />
                      {copiedId === selectedPub.sessionTypeId ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.detailFooter}>
              <Link 
                to={`/products/sales-routing/edit/${selectedPub.salesRouting.id}`}
                className={styles.routingLink}
                onClick={onClose}
              >
                View routing
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
