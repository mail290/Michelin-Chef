
import React, { useState } from 'react';
import ImageCapture from './ImageCapture';

interface IngredientStepProps {
  initialIngredients?: string;
  onNext: (ingredients: string) => void;
}

const CHIPS = [
  'Laks, sitron, dill, asparges',
  'Kylling, pasta, tomat, basilikum',
  'Kjøttdeig, løk, poteter, gulrøtter',
  'Reker, avokado, lime, chili',
  'Aubergine, tomat, mozzarella',
];

const IngredientStep: React.FC<IngredientStepProps> = ({ initialIngredients = '', onNext }) => {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [imageDone, setImageDone] = useState(false);

  const handleIngredientsFound = (found: string) => {
    setIngredients((prev) => prev.trim() ? `${prev.trim()}, ${found}` : found);
    setImageDone(true);
    setMode('text');
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-up space-y-6">
      <div className="text-center space-y-2">
        <h2 className="serif text-3xl md:text-4xl font-bold gold-gradient">Hva har du?</h2>
        <p className="text-gray-500 text-sm">Ta bilde av kjøkkenet, eller skriv ingrediensene manuelt</p>
      </div>

      <div className="flex rounded-xl overflow-hidden border border-white/10 p-1 bg-black/30 gap-1">
        {(['image', 'text'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 text-xs uppercase tracking-widest font-semibold rounded-lg transition-all ${mode === m ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}>
            {m === 'image' ? '📷 Bilde' : '✏️ Tekst'}
          </button>
        ))}
      </div>

      {mode === 'image' && (
        <div className="animate-fade-in">
          <ImageCapture onIngredientsFound={handleIngredientsFound} />
          {imageDone && <p className="text-xs text-green-400 text-center mt-2 animate-fade-in">✓ Ingredienser funnet – rediger nedenfor</p>}
        </div>
      )}

      {(mode === 'text' || imageDone) && (
        <div className="animate-fade-up space-y-2">
          <label className="block text-xs uppercase tracking-widest text-gray-500">
            {imageDone ? 'Gjenkjente ingredienser (rediger gjerne)' : 'Ingredienser'}
          </label>
          <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)}
            placeholder="F.eks. Kyllingbryst, sitron, hvitløk, paprika, rødløk, olivenolje..."
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all resize-none" />
          <p className="text-xs text-gray-700">Separer med komma. Basisvarer (salt, pepper, olje, smør) antas alltid tilgjengelig.</p>
        </div>
      )}

      {ingredients.trim().length === 0 && mode === 'text' && (
        <div className="space-y-2 animate-fade-in">
          <p className="text-xs uppercase tracking-widest text-gray-600">Trenger du inspirasjon?</p>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((chip) => (
              <button key={chip} onClick={() => setIngredients(chip)}
                className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-colors text-gray-400">
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {ingredients.trim().length > 2 && (
        <button onClick={() => onNext(ingredients.trim())}
          className="w-full py-4 bg-[#d4af37] text-black font-bold uppercase tracking-[0.2em] text-sm rounded-xl hover:bg-[#f1d592] transition-all animate-fade-up">
          Velg preferanser →
        </button>
      )}
    </div>
  );
};

export default IngredientStep;
