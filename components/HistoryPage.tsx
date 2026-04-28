
import React, { useState } from 'react';
import { SavedRecipe } from '../types';

interface HistoryPageProps {
  history: SavedRecipe[];
  onLoad: (recipe: SavedRecipe) => void;
  onDelete: (id: string) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

const HistoryPage: React.FC<HistoryPageProps> = ({ history, onLoad, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4 animate-fade-up">
        <div className="text-5xl">📖</div>
        <h2 className="serif text-2xl font-bold gold-gradient">Ingen lagrede oppskrifter ennå</h2>
        <p className="text-gray-500 text-sm">Lag din første oppskrift og lagre den – den dukker opp her.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-up space-y-6">
      <div className="text-center space-y-1">
        <h2 className="serif text-3xl font-bold gold-gradient">Dine oppskrifter</h2>
        <p className="text-gray-600 text-xs uppercase tracking-widest">{history.length} lagret</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {history.map((recipe) => (
          <div key={recipe.id}
            className="chef-card rounded-2xl p-5 space-y-3 hover:border-[#d4af37]/30 transition-all group">
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-gray-600 bg-white/5 rounded-full px-2.5 py-1">{recipe.request.cuisine}</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-600 bg-white/5 rounded-full px-2.5 py-1">{recipe.request.cookingMode}</span>
            </div>
            <h3 className="serif text-lg font-bold text-gray-200 leading-snug group-hover:text-[#f1d592] transition-colors">
              {recipe.title}
            </h3>
            <div className="flex items-center gap-3 text-[10px] text-gray-600">
              <span>{formatDate(recipe.savedAt)}</span>
              <span>·</span>
              <span>{recipe.request.people} pers.</span>
              <span>·</span>
              <span>{recipe.request.mealType}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => onLoad(recipe)}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 hover:bg-[#d4af37]/20 transition-all">
                Åpne
              </button>
              <button onClick={() => { confirmDelete === recipe.id ? (onDelete(recipe.id), setConfirmDelete(null)) : setConfirmDelete(recipe.id); }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${confirmDelete === recipe.id ? 'bg-red-900/40 text-red-400 border border-red-500/40' : 'bg-white/5 text-gray-600 border border-white/10 hover:text-red-400 hover:border-red-500/30'}`}>
                {confirmDelete === recipe.id ? 'Bekreft' : 'Slett'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
