
import React, { useEffect, useState } from 'react';
import { extractShoppingList } from '../geminiService';

interface ShoppingListModalProps {
  recipeMarkdown: string;
  onClose: () => void;
}

const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ recipeMarkdown, onClose }) => {
  const [items, setItems] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    extractShoppingList(recipeMarkdown)
      .then((list) => { setItems(list); if (list.length === 0) setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [recipeMarkdown]);

  const toggle = (i: number) =>
    setChecked((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(items.filter((_, i) => !checked.has(i)).join('\n')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <h2 className="serif text-lg font-bold text-white">Handleliste</h2>
          </div>
          <button onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10">
            ✕
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-8 h-8 border-t-2 border-[#d4af37] rounded-full animate-spin" />
              <p className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">Genererer handleliste...</p>
            </div>
          )}
          {error && !loading && (
            <p className="text-sm text-gray-400 text-center py-8">Kunne ikke generere handleliste.</p>
          )}
          {!loading && !error && items.length > 0 && (
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} onClick={() => toggle(i)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${checked.has(i) ? 'opacity-40 bg-white/2' : 'bg-white/3 hover:bg-white/5'}`}>
                  <input type="checkbox" className="ingredient-check" checked={checked.has(i)}
                    onChange={() => toggle(i)} onClick={(e) => e.stopPropagation()} />
                  <span className={`text-sm text-gray-300 ${checked.has(i) ? 'line-through' : ''}`}>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && items.length > 0 && (
          <div className="p-5 border-t border-white/5 flex gap-3">
            <button onClick={copyToClipboard}
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all">
              {copied ? '✓ Kopiert!' : 'Kopier liste'}
            </button>
            <button onClick={onClose}
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl bg-[#d4af37] text-black hover:bg-[#f1d592] transition-all">
              Ferdig
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListModal;
