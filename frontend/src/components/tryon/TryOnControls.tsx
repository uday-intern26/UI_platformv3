import type { AiRecommendation } from '../../api/tryonClient';
import './TryOnControls.css';

interface TryOnControlsProps {
  onTryOn: () => void;
  onChangeJewelry: () => void;
  onRemove: () => void;
  onCapture: () => void;
  onAddToCart: () => void;
  disabled?: boolean;
  recommendations?: AiRecommendation[];
}

export function TryOnControls({
  onTryOn,
  onChangeJewelry,
  onRemove,
  onCapture,
  onAddToCart,
  disabled,
  recommendations = [],
}: TryOnControlsProps) {
  return (
    <>
      <div className="tryon-controls">
        <button type="button" className="btn btn-gold" onClick={onTryOn} disabled={disabled}>
          Try On
        </button>
        <button type="button" className="btn btn-secondary" onClick={onChangeJewelry} disabled={disabled}>
          Change Jewelry
        </button>
        <button type="button" className="btn btn-secondary" onClick={onRemove} disabled={disabled}>
          Remove
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCapture} disabled={disabled}>
          Capture
        </button>
        <button type="button" className="btn btn-primary" onClick={onAddToCart} disabled={disabled}>
          Add to Cart
        </button>
      </div>

      {recommendations.length > 0 && (
        <section className="recommendations">
          <h3>AI Recommendations</h3>
          <div className="recommendation-list">
            {recommendations.map((rec) => (
              <div key={rec.productId} className="recommendation-card">
                <div className="recommendation-score">
                  {Math.round(rec.score * 100)}% match
                </div>
                <div className="recommendation-name">
                  {rec.product?.name ?? rec.productId}
                </div>
                <div className="recommendation-reason">{rec.reason}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
