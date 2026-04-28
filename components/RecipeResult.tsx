
import React, { useState, useMemo } from 'react';

interface RecipeResultProps {
  markdown: string;
  isSaved: boolean;
  onSave: () => void;
  onShoppingList: () => void;
  onNew: () => void;
}

interface ParsedRecipe {
  title: string;
  description: string;
  infoItems: { key: string; value: string }[];
  ingredients: string[];
  steps: { title: string; body: string }[];
  plating: string;
  tips: string[];
  techniques: { name: string; explanation: string }[];
}

const parseRecipe = (md: string): ParsedRecipe => {
  const lines = md.split('\n').map((l) => l.trim()).filter(Boolean);
  const result: ParsedRecipe = { title: '', description: '', infoItems: [], ingredients: [], steps: [], plating: '', tips: [], techniques: [] };
  type Section = 'none'|'info'|'ingredients'|'steps'|'plating'|'tips'|'techniques';
  let section: Section = 'none';

  for (const line of lines) {
    if (line.startsWith('## ')) { result.title = line.replace('## ', '').trim(); continue; }
    if (line.startsWith('**Beskrivelse:**')) { result.description = line.replace('**Beskrivelse:**', '').trim(); continue; }
    if (line.startsWith('**Info:**'))         { section = 'info';        continue; }
    if (line.startsWith('**Ingredienser'))    { section = 'ingredients'; continue; }
    if (line.startsWith('**Fremgangsmåte'))   { section = 'steps';       continue; }
    if (line.startsWith('**Anretning'))       { section = 'plating';     continue; }
    if (line.startsWith('**Kokkens tips'))    { section = 'tips';        continue; }
    if (line.startsWith('**Lær teknikken'))   { section = 'techniques';  continue; }

    if (section === 'info' && line.startsWith('*')) {
      const m = line.replace(/^\*+\s*/, '').match(/\*\*(.+?):\*\*\s*(.*)/);
      if (m) result.infoItems.push({ key: m[1], value: m[2] });
      continue;
    }
    if (section === 'ingredients' && line.startsWith('*')) {
      result.ingredients.push(line.replace(/^\*+\s*/, '').trim()); continue;
    }
    if (section === 'steps' && /^\d+\./.test(line)) {
      const wo = line.replace(/^\d+\.\s*/, '');
      const m = wo.match(/\*\*(.+?):\*\*\s*(.*)/);
      result.steps.push(m ? { title: m[1], body: m[2] } : { title: '', body: wo }); continue;
    }
    if (section === 'plating') {
      const clean = line.replace(/^\*+\s*/, '').replace(/\*\*Anretning[^:]*:\*\*\s*/, '');
      if (clean) result.plating += (result.plating ? ' ' : '') + clean; continue;
    }
    if (section === 'tips' && line.startsWith('*')) {
      result.tips.push(line.replace(/^\*+\s*/, '').trim()); continue;
    }
    if (section === 'techniques' && line.startsWith('*')) {
      const m = line.replace(/^\*+\s*/, '').match(/\*\*(.+?):\*\*\s*(.*)/);
      if (m) result.techniques.push({ name: m[1], explanation: m[2] }); continue;
    }
  }
  return result;
};

const InfoBadge: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white/5 rounded-xl p-3 text-center">
    <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">{label}</p>
    <p className="text-xs text-gray-300 font-medium">{value}</p>
  </div>
);

const IngredientList: React.FC<{ items: string[] }> = ({ items }) => {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setChecked((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} onClick={() => toggle(i)}
          className={`flex items-start gap-3 cursor-pointer ${checked.has(i) ? 'opacity-40' : ''}`}>
          <input type="checkbox" className="ingredient-check mt-0.5" checked={checked.has(i)}
            onChange={() => toggle(i)} onClick={(e) => e.stopPropagation()} />
          <span className={`text-sm text-gray-300 leading-snug ${checked.has(i) ? 'line-through' : ''}`}>{item}</span>
        </li>
      ))}
    </ul>
  );
};

const StepList: React.FC<{ steps: { title: string; body: string }[] }> = ({ steps }) => {
  const [active, setActive] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggleDone = (i: number) => setDone((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={i} className={`rounded-xl border transition-all ${done.has(i) ? 'border-white/5 opacity-50' : active === i ? 'border-[#d4af37]/40 bg-[#d4af37]/5' : 'border-white/8 bg-white/3'}`}>
          <button type="button" className="w-full text-left p-4 flex items-start gap-4" onClick={() => setActive(active === i ? null : i)}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-colors ${done.has(i) ? 'bg-green-900/50 text-green-400' : 'bg-[#d4af37]/15 text-[#d4af37]'}`}>
              {done.has(i) ? '✓' : i + 1}
            </span>
            <div className="flex-1 min-w-0">
              {step.title && <p className="text-sm font-semibold text-gray-200 mb-1">{step.title}</p>}
              <p className="text-sm text-gray-400 leading-relaxed">{step.body}</p>
            </div>
          </button>
          {!done.has(i) && (
            <div className="px-4 pb-3 flex justify-end">
              <button type="button" onClick={() => toggleDone(i)}
                className="text-[10px] uppercase tracking-widest text-gray-600 hover:text-green-400 transition-colors">
                Marker som ferdig
              </button>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
};

const RecipeResult: React.FC<RecipeResultProps> = ({ markdown, isSaved, onSave, onShoppingList, onNew }) => {
  const recipe = useMemo(() => parseRecipe(markdown), [markdown]);

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-up space-y-8">
      <div className="chef-card rounded-3xl p-6 md:p-10 space-y-6">
        {recipe.title && <h1 className="serif text-4xl md:text-5xl font-bold gold-gradient leading-tight">{recipe.title}</h1>}
        {recipe.description && (
          <p className="text-lg text-gray-300 italic border-l-2 border-[#d4af37]/50 pl-4 leading-relaxed">{recipe.description}</p>
        )}
        {recipe.infoItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {recipe.infoItems.map(({ key, value }) => <InfoBadge key={key} label={key} value={value} />)}
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          <button onClick={onSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all ${isSaved ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-[#d4af37]/40 hover:text-[#d4af37]'}`}>
            {isSaved ? '★ Lagret' : '☆ Lagre'}
          </button>
          <button onClick={onShoppingList}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all">
            🛒 Handleliste
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all no-print">
            🖨️ Skriv ut
          </button>
        </div>
      </div>

      {recipe.ingredients.length > 0 && (
        <section className="chef-card rounded-2xl p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">✦ Ingredienser</h2>
          <IngredientList items={recipe.ingredients} />
          <p className="text-[10px] text-gray-700">Klikk for å huke av ingredienser</p>
        </section>
      )}

      {recipe.steps.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold px-1">✦ Fremgangsmåte</h2>
          <StepList steps={recipe.steps} />
        </section>
      )}

      {recipe.plating && (
        <section className="chef-card rounded-2xl p-6 border border-[#d4af37]/20 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">✦ Anretning</h2>
          <p className="text-sm text-gray-300 leading-relaxed">{recipe.plating}</p>
        </section>
      )}

      {recipe.tips.length > 0 && (
        <section className="bg-black border border-[#d4af37]/30 rounded-2xl p-6 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">✦ Kokkens tips</h2>
          <ul className="space-y-2">
            {recipe.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300 leading-snug">
                <span className="text-[#d4af37] mt-0.5 flex-shrink-0">✦</span>{tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.techniques.length > 0 && (
        <section className="chef-card rounded-2xl p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">✦ Lær teknikken</h2>
          <div className="space-y-3">
            {recipe.techniques.map((t, i) => (
              <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/5">
                <p className="text-sm font-semibold text-gray-200 mb-1">{t.name}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{t.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-center pb-8">
        <button onClick={onNew}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors uppercase tracking-widest text-xs text-gray-400 hover:text-white">
          + Ny oppskrift
        </button>
      </div>
    </div>
  );
};

export default RecipeResult;
