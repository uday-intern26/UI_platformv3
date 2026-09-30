import { useRef, useState } from 'react';
import './CameraInput.css';

interface CameraInputProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  currentImageUrl?: string;
}

export function CameraInput({ onImageSelected, currentImageUrl }: CameraInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageSelected(file, url);
  };

  return (
    <div className="camera-input">
      <h3>Your Photo</h3>
      <div className="camera-preview">
        {preview ? (
          <img src={preview} alt="Your photo for try-on" />
        ) : (
          <div className="camera-preview-empty">
            Upload a photo or use your camera to begin
          </div>
        )}
      </div>
      <div className="camera-actions">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileRef.current?.click()}
        >
          Upload Photo
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.setAttribute('capture', 'user');
              fileRef.current.click();
            }
          }}
        >
          Use Camera
        </button>
      </div>
    </div>
  );
}
