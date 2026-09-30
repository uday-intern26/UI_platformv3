import type { JewelryCategory, JewelryProduct } from '../../api/tryonClient';
import './JewelrySelector.css';

const CATEGORIES: { id: JewelryCategory; label: string }[] = [
  { id: 'earrings', label: 'Earrings' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'ring', label: 'Ring' },
  { id: 'bracelet', label: 'Bracelet' },
  { id: 'bangles', label: 'Bangles' },
];

interface JewelrySelectorProps {
  products: JewelryProduct[];
  selectedId?: string;
  activeCategory: JewelryCategory;
  onCategoryChange: (category: JewelryCategory) => void;
  onSelect: (product: JewelryProduct) => void;
}

export function JewelrySelector({
  products,
  selectedId,
  activeCategory,
  onCategoryChange,
  onSelect,
}: JewelrySelectorProps) {
  const filtered = products.filter((p) => p.category === activeCategory);

  return (
    <div className="jewelry-selector">
      <h3>Select Jewelry</h3>
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`category-tab${activeCategory === cat.id ? ' active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="product-list">
        {filtered.map((product) => (
          <button
            key={product.id}
            type="button"
            className={`product-item${selectedId === product.id ? ' selected' : ''}`}
            onClick={() => onSelect(product)}
            disabled={!product.available}
          >
            <div className="product-thumb">◇</div>
            <div className="product-info">
              <div className="product-name">{product.name}</div>
              <div className="product-meta">
                <span>
                  {product.currency} {product.price.toLocaleString()}
                </span>
                {!product.available && (
                  <span className="product-unavailable">Out of stock</span>
                )}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            No products in this category
          </p>
        )}
      </div>
    </div>
  );
}
