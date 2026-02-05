import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { getChannelById, isBoxOfficeChannel } from '../../data/mockData';
import styles from './BulkEditModal.module.css';

interface BulkEditModalProps {
  isOpen: boolean;
  channelIds: string[];
  onClose: () => void;
}

export function BulkEditModal({ isOpen, channelIds, onClose }: BulkEditModalProps) {
  const demo = useDemo();
  const [addProducts, setAddProducts] = useState(false);
  const [removeProducts, setRemoveProducts] = useState(false);
  const [selectedAddProducts, setSelectedAddProducts] = useState<string[]>([]);
  const [selectedRemoveProducts, setSelectedRemoveProducts] = useState<string[]>([]);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [removeSearchQuery, setRemoveSearchQuery] = useState('');

  // Get all routings that include any of the selected channels
  const relevantRoutings = useMemo(() => {
    return demo.getSalesRoutings().filter(r => 
      r.channelIds.some(cId => channelIds.includes(cId))
    );
  }, [demo, channelIds]);

  // Get all products available across selected channels
  const availableProducts = useMemo(() => {
    const productIds = new Set<string>();
    const productWarehouses = demo.getProductWarehouses();
    
    relevantRoutings.forEach(routing => {
      channelIds.forEach(channelId => {
        if (!routing.channelIds.includes(channelId)) return;
        
        const isBoxOffice = isBoxOfficeChannel(channelId);
        let warehouseIds: string[] = [];
        
        if (isBoxOffice) {
          warehouseIds = routing.warehouseIds;
        } else {
          const mappedWarehouseId = routing.channelWarehouseMapping[channelId];
          if (mappedWarehouseId) {
            warehouseIds = [mappedWarehouseId];
          }
        }
        
        productWarehouses
          .filter(pw => warehouseIds.includes(pw.warehouseId))
          .forEach(pw => productIds.add(pw.productId));
      });
    });
    
    return demo.getProducts().filter(p => productIds.has(p.id));
  }, [demo, channelIds, relevantRoutings]);

  // Filter products for add dropdown
  const filteredAddProducts = useMemo(() => {
    return availableProducts.filter(p => 
      p.name.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(addSearchQuery.toLowerCase())
    );
  }, [availableProducts, addSearchQuery]);

  // Filter products for remove dropdown
  const filteredRemoveProducts = useMemo(() => {
    return availableProducts.filter(p => 
      p.name.toLowerCase().includes(removeSearchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(removeSearchQuery.toLowerCase())
    );
  }, [availableProducts, removeSearchQuery]);

  const handleSave = () => {
    // Apply visibility changes to all selected channels
    relevantRoutings.forEach(routing => {
      channelIds.forEach(channelId => {
        if (!routing.channelIds.includes(channelId)) return;
        
        // Add products (set visible)
        if (addProducts && selectedAddProducts.length > 0) {
          demo.bulkSetProductChannelVisibility(
            selectedAddProducts,
            [channelId],
            routing.id,
            true
          );
        }
        
        // Remove products (set hidden)
        if (removeProducts && selectedRemoveProducts.length > 0) {
          demo.bulkSetProductChannelVisibility(
            selectedRemoveProducts,
            [channelId],
            routing.id,
            false
          );
        }
      });
    });
    
    onClose();
  };

  const toggleAddProduct = (productId: string) => {
    setSelectedAddProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleRemoveProduct = (productId: string) => {
    setSelectedRemoveProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (!isOpen) return null;

  const channelNames = channelIds
    .map(id => getChannelById(id)?.name || id)
    .join(', ');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit in bulk</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Editing {channelIds.length} channel{channelIds.length > 1 ? 's' : ''}: {channelNames}
          </p>

          {/* Add Products Section */}
          <div className={styles.section}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={addProducts}
                onChange={(e) => setAddProducts(e.target.checked)}
                className={styles.checkbox}
              />
              Add products
            </label>
            
            {addProducts && (
              <div className={styles.dropdownContainer}>
                <div className={styles.searchBox}>
                  <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search and select products"
                    value={addSearchQuery}
                    onChange={(e) => setAddSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                <div className={styles.productDropdown}>
                  <label className={styles.selectAllLabel}>
                    <input
                      type="checkbox"
                      checked={selectedAddProducts.length === filteredAddProducts.length && filteredAddProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAddProducts(filteredAddProducts.map(p => p.id));
                        } else {
                          setSelectedAddProducts([]);
                        }
                      }}
                      className={styles.checkbox}
                    />
                    Select all
                  </label>
                  {filteredAddProducts.map(product => (
                    <label key={product.id} className={styles.productOption}>
                      <input
                        type="checkbox"
                        checked={selectedAddProducts.includes(product.id)}
                        onChange={() => toggleAddProduct(product.id)}
                        className={styles.checkbox}
                      />
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productSku}>{product.sku}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Remove Products Section */}
          <div className={styles.section}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={removeProducts}
                onChange={(e) => setRemoveProducts(e.target.checked)}
                className={styles.checkbox}
              />
              Remove products
            </label>
            
            {removeProducts && (
              <div className={styles.dropdownContainer}>
                <div className={styles.searchBox}>
                  <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search and select products"
                    value={removeSearchQuery}
                    onChange={(e) => setRemoveSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                <div className={styles.productDropdown}>
                  <label className={styles.selectAllLabel}>
                    <input
                      type="checkbox"
                      checked={selectedRemoveProducts.length === filteredRemoveProducts.length && filteredRemoveProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRemoveProducts(filteredRemoveProducts.map(p => p.id));
                        } else {
                          setSelectedRemoveProducts([]);
                        }
                      }}
                      className={styles.checkbox}
                    />
                    Select all
                  </label>
                  {filteredRemoveProducts.map(product => (
                    <label key={product.id} className={styles.productOption}>
                      <input
                        type="checkbox"
                        checked={selectedRemoveProducts.includes(product.id)}
                        onChange={() => toggleRemoveProduct(product.id)}
                        className={styles.checkbox}
                      />
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productSku}>{product.sku}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.discardBtn} onClick={onClose}>
            Discard
          </button>
          <button 
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={(!addProducts && !removeProducts) || 
                     (addProducts && selectedAddProducts.length === 0 && !removeProducts) ||
                     (removeProducts && selectedRemoveProducts.length === 0 && !addProducts)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
