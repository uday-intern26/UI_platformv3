import { useCallback, useState } from 'react';
import type { JewelryCategory, JewelryProduct } from '../api/tryonClient';
import {
  addToCart,
  captureResult,
  createSession,
  getRecommendations,
  listProducts,
  startTryOn,
  uploadUserImage,
} from '../api/tryonClient';
import { CameraInput } from '../components/tryon/CameraInput';
import { JewelrySelector } from '../components/tryon/JewelrySelector';
import { TryOnControls } from '../components/tryon/TryOnControls';
import { TryOnViewer } from '../components/tryon/TryOnViewer';
import { mockProducts, mockRecommendations } from '../data/mockData';
import { useApiData } from '../hooks/useApiData';
import './TryOnPage.css';

const CATEGORIES: { id: JewelryCategory; label: string }[] = [
  { id: 'earrings', label: 'Earrings' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'ring', label: 'Ring' },
  { id: 'bracelet', label: 'Bracelet' },
  { id: 'bangles', label: 'Bangles' },
];

export function TryOnPage() {
  const [category, setCategory] = useState<JewelryCategory>('earrings');
  const [selectedProduct, setSelectedProduct] = useState<JewelryProduct | null>(mockProducts[0]);
  const [userImageUrl, setUserImageUrl] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [status, setStatus] = useState<string | null>(null);

  const { data: products } = useApiData(() => listProducts(), mockProducts);

  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;
    try {
      const session = await createSession();
      setSessionId(session.id);
      return session.id;
    } catch {
      const localId = `local-${Date.now()}`;
      setSessionId(localId);
      return localId;
    }
  }, [sessionId]);

  const handleImageSelected = async (file: File, previewUrl: string) => {
    setUserImageUrl(previewUrl);
    const sid = await ensureSession();
    try {
      await uploadUserImage(sid, file);
      setStatus('Photo uploaded via API');
    } catch {
      setStatus('Photo loaded locally');
    }
  };

  const handleTryOn = async () => {
    if (!selectedProduct) {
      setStatus('Select a jewelry item first');
      return;
    }
    const sid = await ensureSession();
    try {
      await startTryOn(sid, selectedProduct.id);
      const recs = await getRecommendations(sid);
      setRecommendations(recs);
      setStatus('Try-on started');
    } catch {
      setRecommendations(mockRecommendations);
      setStatus('Try-on simulated (API unavailable)');
    }
  };

  const handleCapture = async () => {
    const sid = await ensureSession();
    try {
      const result = await captureResult(sid);
      setStatus(`Captured: ${result.imageUrl}`);
    } catch {
      setStatus('Capture simulated');
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    const sid = await ensureSession();
    try {
      await addToCart(sid, selectedProduct.id);
      setStatus(`Added ${selectedProduct.name} to cart`);
    } catch {
      setStatus(`Added ${selectedProduct.name} to cart (local)`);
    }
  };

  return (
    <div className="animate-in tryon-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Try-On</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Unity WebGL virtual try-on for jewelry
          </p>
        </div>
        {status && <span className="chip">{status}</span>}
      </div>

      <div className="tryon-categories">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`tryon-cat ${category === c.id ? 'active' : ''}`}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="tryon-layout">
        <aside className="tryon-panel card card-pad">
          <h3 className="card-title">Upload / Capture</h3>
          <CameraInput onImageSelected={handleImageSelected} currentImageUrl={userImageUrl} />
        </aside>

        <div className="tryon-main">
          <div className="tryon-viewer-wrap card">
            <div className="tryon-webgl-badge">Unity WebGL</div>
            <TryOnViewer
              productId={selectedProduct?.id}
              productAssetUrl={selectedProduct?.assetUrl}
              userImageUrl={userImageUrl}
            />
            <div className="tryon-viewer-tools">
              <button type="button" className="btn btn-sm btn-secondary">
                Rotate
              </button>
              <button type="button" className="btn btn-sm btn-secondary">
                Zoom
              </button>
              <button type="button" className="btn btn-sm btn-secondary">
                Fit
              </button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={handleCapture}>
                Capture
              </button>
            </div>
          </div>
        </div>

        <aside className="tryon-panel card card-pad">
          <h3 className="card-title">Jewelry Selection</h3>
          <JewelrySelector
            products={products ?? mockProducts}
            selectedId={selectedProduct?.id}
            activeCategory={category}
            onCategoryChange={setCategory}
            onSelect={setSelectedProduct}
          />
          {selectedProduct && (
            <div className="tryon-product-detail">
              <h4>{selectedProduct.name}</h4>
              <p className="tryon-price">
                ${selectedProduct.price.toLocaleString()}
              </p>
              <span
                className={`status-badge ${selectedProduct.available ? 'status-active' : 'status-failed'}`}
              >
                {selectedProduct.available ? 'In Stock' : 'Out of Stock'}
              </span>
              <div className="tryon-product-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTryOn}
                  disabled={!selectedProduct}
                >
                  Try On
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddToCart}
                  disabled={!selectedProduct}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="card card-pad tryon-recs">
        <h3 className="card-title">Recommended for you</h3>
        <TryOnControls
          onTryOn={handleTryOn}
          onChangeJewelry={() => setSelectedProduct(null)}
          onRemove={() => setSelectedProduct(null)}
          onCapture={handleCapture}
          onAddToCart={handleAddToCart}
          disabled={!selectedProduct}
          recommendations={recommendations}
        />
      </div>
    </div>
  );
}
