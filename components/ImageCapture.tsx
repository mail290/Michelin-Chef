
import React, { useRef, useState, useCallback } from 'react';
import { identifyIngredientsFromImage } from '../geminiService';

interface ImageCaptureProps {
  onIngredientsFound: (ingredients: string) => void;
}

const MAX_PX = 1536;
const JPEG_QUALITY = 0.88;

/**
 * Resize + convert any image (incl. HEIC previews, huge RAW-style JPEGs)
 * to a canvas-rendered JPEG before sending to Gemini.
 * This handles iPhone HEIC, 20 MB photos, and unsupported formats.
 */
const resizeToJpeg = (file: File): Promise<{ data: string; mimeType: string }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_PX || height > MAX_PX) {
        const ratio = Math.min(MAX_PX / width, MAX_PX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not available')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve({ data: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Kunne ikke laste bildet'));
    };
    img.src = url;
  });

const ImageCapture: React.FC<ImageCaptureProps> = ({ onIngredientsFound }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.match(/\.(heic|heif|jpg|jpeg|png|webp|gif)$/i)) {
      setError('Kun bildefiler støttes (JPG, PNG, HEIC, WebP).');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setError(null);
    setAnalyzing(true);
    setStatus('Tilpasser bildet...');

    try {
      const { data, mimeType } = await resizeToJpeg(file);
      setStatus('Analyserer ingredienser...');
      const result = await identifyIngredientsFromImage(data, mimeType);
      if (!result || result === 'Ingen ingredienser funnet') {
        setError('Ingen matvarer funnet i bildet. Prøv å ta bildet nærmere, med bedre lys, eller skriv ingredienser manuelt.');
      } else {
        onIngredientsFound(result);
      }
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setError(
        err?.message?.includes('API')
          ? 'API-feil. Sjekk at GEMINI_API_KEY er satt i Vercel.'
          : 'Kunne ikke analysere bildet. Prøv igjen eller skriv ingrediensene manuelt.',
      );
    } finally {
      setAnalyzing(false);
      setStatus('');
    }
  }, [onIngredientsFound]);

  const reset = () => {
    setPreview(null);
    setError(null);
    setStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCamera = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.setAttribute('capture', 'environment');
    fileInputRef.current.accept = 'image/*';
    fileInputRef.current.click();
  };

  const openGallery = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.removeAttribute('capture');
    fileInputRef.current.accept = 'image/*';
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <img src={preview} alt="Valgt bilde" className="w-full max-h-72 object-cover" />
          {analyzing && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-t-2 border-[#d4af37] rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-widest text-gray-300 animate-pulse">{status}</p>
            </div>
          )}
          {!analyzing && (
            <button
              onClick={reset}
              className="absolute top-3 right-3 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div
          className={`drop-zone rounded-2xl p-8 flex flex-col items-center gap-4 text-center ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
        >
          <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-300 mb-1">Fotograf kjøleskapet eller kjøkkenbenken</p>
            <p className="text-xs text-gray-600">AI gjenkjenner ingrediensene automatisk</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={openCamera}
              className="px-5 py-2.5 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#f1d592] transition-colors"
            >
              📷 Kamera
            </button>
            <button
              onClick={openGallery}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors"
            >
              🖼️ Galleri
            </button>
          </div>
          <p className="text-xs text-gray-700">Støtter JPG, PNG, HEIC (iPhone), WebP · Automatisk skalering</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 space-y-2">
          <p className="text-xs text-red-400 text-center">{error}</p>
          {preview && (
            <button
              onClick={reset}
              className="w-full text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              Prøv nytt bilde
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCapture;
