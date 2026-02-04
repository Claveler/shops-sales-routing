import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes,
  faExternalLinkAlt, 
  faCopy, 
  faCheck, 
  faStore, 
  faGlobe, 
  faBoxes, 
  faShoppingCart 
} from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { 
  getProductWarehouseDetails, 
  getWarehouseById as getStaticWarehouseById, 
  getBoxOfficeSetupsByRoutingId, 
  getChannelById 
} from '../../data/mockData';
import type { ResolvedProductPublication } from '../../data/mockData';
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
  // For onsite with multiple warehouses, use price reference warehouse
  if (salesRouting.type === 'onsite' && salesRouting.priceReferenceWarehouseId) {
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
  const isOnsite = selectedPub.salesRouting.type === 'onsite';
  
  // Get warehouse names
  const warehouseNames = selectedPub.salesRouting.warehouseIds
    .map(id => getWarehouseById(id)?.name)
    .filter(Boolean);
  const priceRefWarehouse = selectedPub.salesRouting.priceReferenceWarehouseId 
    ? getWarehouseById(selectedPub.salesRouting.priceReferenceWarehouseId)?.name 
    : null;
  
  // Get selling locations
  const boxOfficeSetups = isOnsite 
    ? getBoxOfficeSetupsByRoutingId(selectedPub.salesRouting.id) 
    : [];
  const channels = !isOnsite && selectedPub.salesRouting.channelIds
    ? selectedPub.salesRouting.channelIds
        .map(id => getChannelById(id)?.name)
        .filter(Boolean)
    : [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.productName}>{productName}</h2>
            <span className={styles.subtitle}>
              Published in {publications.length} event{publications.length > 1 ? 's' : ''}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Two-column body */}
        <div className={styles.body}>
          {/* Left column - List */}
          <div className={styles.listColumn}>
            {publications.map((pub, index) => {
              const pubIsOnsite = pub.salesRouting.type === 'onsite';
              const isSelected = index === selectedIndex;
              
              return (
                <button
                  key={`${pub.salesRouting.id}-${index}`}
                  className={`${styles.listItem} ${isSelected ? styles.active : ''}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className={`${styles.typeIcon} ${pubIsOnsite ? styles.onsite : styles.online}`}>
                    <FontAwesomeIcon icon={pubIsOnsite ? faStore : faGlobe} />
                  </span>
                  <div className={styles.listItemInfo}>
                    <span className={styles.listEventName}>{pub.event.name}</span>
                    <span className={styles.listRoutingName}>{pub.salesRouting.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right column - Details */}
          <div className={styles.detailColumn}>
            {/* Detail Header */}
            <div className={styles.detailHeader}>
              <span className={`${styles.detailTypeIcon} ${isOnsite ? styles.onsite : styles.online}`}>
                <FontAwesomeIcon icon={isOnsite ? faStore : faGlobe} />
              </span>
              <div className={styles.detailHeaderInfo}>
                <h3 className={styles.detailEventName}>{selectedPub.event.name}</h3>
                <span className={styles.detailRoutingName}>via {selectedPub.salesRouting.name}</span>
              </div>
              {priceDetails && (
                <span className={styles.detailPrice}>
                  {formatPrice(priceDetails.price, priceDetails.currency)}
                </span>
              )}
            </div>

            {/* Detail Cards */}
            <div className={styles.detailCards}>
              {/* Warehouse sources */}
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

              {/* Selling locations */}
              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <FontAwesomeIcon 
                    icon={isOnsite ? faShoppingCart : faGlobe} 
                    className={styles.cardIcon} 
                  />
                  <span className={styles.cardLabel}>
                    {isOnsite ? 'Sold at' : 'Channels'}
                  </span>
                </div>
                <div className={styles.cardContent}>
                  <span className={styles.cardValue}>
                    {isOnsite 
                      ? (boxOfficeSetups.length > 0 
                          ? boxOfficeSetups.map(s => s.name).join(', ')
                          : 'No Box Office setups configured')
                      : (channels.length > 0 
                          ? channels.join(', ')
                          : 'No channels configured')
                    }
                  </span>
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
