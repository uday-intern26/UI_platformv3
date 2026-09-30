import { useEffect, useRef, useState } from 'react';
import { createUnityTryOnBridge, UnityTryOnBridge } from '../../unity/UnityTryOnBridge';
import './TryOnViewer.css';

interface TryOnViewerProps {
  productAssetUrl?: string;
  productId?: string;
  userImageUrl?: string;
  onCapture?: (imageUrl: string) => void;
  onReady?: () => void;
}

const UNITY_BUILD_URL = '/unity-tryon/Build';
const UNITY_LOADER_URL = '/unity-tryon/Build/Build.loader.js';

export function TryOnViewer({
  productAssetUrl,
  productId,
  userImageUrl,
  onCapture,
  onReady,
}: TryOnViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bridgeRef = useRef<UnityTryOnBridge | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bridge = createUnityTryOnBridge({
      buildUrl: UNITY_BUILD_URL,
      loaderUrl: UNITY_LOADER_URL,
      productName: 'AIJewelTryOn',
      loadingTimeout: 60000,
    });
    bridgeRef.current = bridge;

    bridge.on('loading', (e) => {
      setLoading(true);
      const p = (e.data?.progress as number) ?? 0;
      setProgress(p);
    });

    bridge.on('ready', () => {
      setLoading(false);
      setReady(true);
      onReady?.();
    });

    bridge.on('error', (e) => {
      setLoading(false);
      setError(e.message ?? 'Unity failed to load');
    });

    bridge.on('capture_complete', (e) => {
      const url = e.data?.imageUrl as string;
      if (url) onCapture?.(url);
    });

    bridge.on('tryon_complete', () => {
      setLoading(false);
    });

    setLoading(true);
    bridge.initialize(canvas).catch(() => {
      setLoading(false);
      setError('Unity WebGL build not available. Place build files in /unity-tryon/');
    });

    return () => {
      bridge.dispose();
      bridgeRef.current = null;
    };
  }, [onCapture, onReady]);

  useEffect(() => {
    const bridge = bridgeRef.current;
    if (!bridge?.isReady() || !userImageUrl) return;
    bridge.loadUserImage({ url: userImageUrl });
  }, [userImageUrl]);

  useEffect(() => {
    const bridge = bridgeRef.current;
    if (!bridge?.isReady() || !productId || !productAssetUrl) return;

    bridge.loadJewelryAsset({
      id: productId,
      url: productAssetUrl,
      category: 'jewelry',
      format: 'glb',
    });
  }, [productId, productAssetUrl]);

  return (
    <div className="tryon-viewer">
      <canvas ref={canvasRef} className="tryon-canvas" id="unity-canvas" />

      {!ready && !error && (
        <div className="tryon-viewer-placeholder">
          <span className="icon">◇</span>
          <p>Unity WebGL Virtual Try-On Viewport</p>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Deploy WebGL build to enable live rendering
          </p>
        </div>
      )}

      {loading && (
        <div className="tryon-loading-overlay">
          <span>Loading Unity...</span>
          <div className="loading-bar">
            <div
              className="loading-bar-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="tryon-viewer-placeholder">
          <span className="icon">⚠</span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export function getTryOnBridge(): UnityTryOnBridge | null {
  return null;
}
