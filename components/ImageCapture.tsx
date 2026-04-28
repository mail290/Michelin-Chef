
import React, { useRef, useState, useCallback } from 'react';
import { identifyIngredientsFromImage } from '../geminiService';

interface ImageCaptureProps {
  onIngredientsFound: (ingredients: string) => void;
}

const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ data: result.split(',')[1], mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ImageCapture: React.FC<ImageCaptureProps> = ({ onIngredientsFound }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Kun bildefiler støttes.'); return; }
    setPreview(URL.createObjectURL(file));
    setError(null);
    setAnalyzing(true);
    try {
      const { data, mimeType } = await fileToBase64(file);
      const result = await identifyIngredientsFromImage(data, mimeType);
      if (result === 'Ingen ingredienser funnet') {
        setError('Ingen matvarer funnet. Prøv et annet bilde eller skriv manuelt.');
      } else {
        onIngredientsFound(result);
      }
    } catch {
      setError('Kunne ikke analysere bildet. Prøv igjen.');
    } finally {
      setAnalyzing(false);
    }
  }, [onIngredientsFound]);

  const reset = () => {
    setPreview(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        className="hidden" />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <img src={preview} alt="Valgt bilde" className="w-full max-h-64 object-cover" />
          {analyzing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-t-2 border-[#d4af37] rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-widest text-gray-300 animate-pulse">Analyserer ingredienser...</p>
            </div>
          )}
          {!analyzing && (
            <button onClick={reset}
              className="absolute top-3 right-3 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black transition-colors">
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
            <p className="text-sm text-gray-300 mb-1">Ta bilde av kjøkkenet ditt</p>
            <p className="text-xs text-gray-600">AI gjenkjenner alle ingrediensene automatisk</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={() => { if (fileInputRef.current) { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); } }}
              className="px-5 py-2.5 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#f1d592] transition-colors">
              Last opp bilde
            </button>
            <button onClick={() => { if (fileInputRef.current) { fileInputRef.current.setAttribute('capture', 'environment'); fileInputRef.current.click(); } }}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
              Kamera
            </button>
          </div>
          <p className="text-xs text-gray-700">eller dra og slipp et bilde her</p>
        </div>
      )}
      {error && (
        <p className="text-xs text-red-400 text-center bg-red-900/20 border border-red-500/30 rounded-xl p-3">{error}</p>
      )}
    </div>
  );
};

export default ImageCapture;
