import { ProductTile } from './ProductTile';
import type { Product } from '../../data/feverPosData';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  isMemberActive?: boolean;
}

export function ProductGrid({ products, onProductClick, isMemberActive }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No products in this category</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductTile
          key={product.id}
          product={product}
          onClick={onProductClick}
          isMemberActive={isMemberActive}
        />
      ))}
    </div>
  );
}
