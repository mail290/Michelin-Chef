
import React, { useState } from 'react';
import { AppView, ChefRequest, SavedRecipe } from './types';
import { generateRecipe } from './geminiService';
import { useRecipeHistory } from './hooks/useRecipeHistory';

import Header from './components/Header';
import IngredientStep from './components/IngredientStep';
import PreferenceStep from './components/PreferenceStep';
import RecipeResult from './components/RecipeResult';
import ShoppingListModal from './components/ShoppingListModal';
import HistoryPage from './components/HistoryPage';

const LOADING_TIPS = [
  'Mise en place – forbered alt før du starter å lage mat.',
  'La kjøtt hvile 5–10 minutter etter steking for saftigere resultat.',
  'Salt pastavannet – det skal smake som havet.',
  'Varm alltid pannen før du tilsetter olje.',
  'Bruk romtemperert smør for bedre sauser.',
  'Syre (sitron/eddik) balanserer fete og kraftige retter.',
  'Friske urter tilsettes på slutten – tørkede urter i starten.',
  'Karamelliser løk på lav varme i minst 20 minutter.',
  'Reduser kraft for konsentrert, dyp smak.',
  'Smak og juster alltid rett før servering.',
];

const LoadingScreen: React.FC = () => {
  const [tipIndex, setTipIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % LOADING_TIPS.length), 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 animate-fade-in">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-t-2 border-[#d4af37] rounded-full animate-spin" />
        <div className="absolute inset-3 border-t border-[#d4af37]/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🍳</div>
      </div>
      <div className="text-center space-y-3 max-w-sm px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 animate-pulse">Komponerer din oppskrift...</p>
        <div className="h-12 flex items-center justify-center">
          <p key={tipIndex} className="text-sm text-gray-400 italic text-center animate-fade-in">
            💡 {LOADING_TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

const HomeScreen: React.FC<{ onStart: () => void; recentCount: number }> = ({ onStart, recentCount }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-10 text-center px-4 animate-fade-up relative">
    <div className="flex gap-1 justify-center">
      {[1, 2, 3].map((i) => (
        <svg key={i} className="w-7 h-7 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <div className="space-y-4">
      <h1 className="serif text-6xl md:text-8xl font-bold tracking-tighter gold-gradient leading-none">
        Michelin<br />Chef AI
      </h1>
      <p className="text-gray-500 uppercase tracking-[0.4em] text-xs">Gastronomi i ditt eget hjem</p>
    </div>
    <div className="flex flex-wrap gap-2 justify-center max-w-lg">
      {['📷 Bilde-gjenkjenning', '🌍 13 kjøkken', '🔥 Grill & Air Fryer', '🛒 Handleliste', '⭐ Michelin-teknikker', '📖 Lagre favoritter'].map((f) => (
        <span key={f} className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">{f}</span>
      ))}
    </div>
    <div className="space-y-3">
      <button onClick={onStart}
        className="px-12 py-5 bg-[#d4af37] text-black text-sm font-bold uppercase tracking-[0.25em] rounded-2xl hover:bg-[#f1d592] transition-all animate-pulse-gold">
        Start å lage mat
      </button>
      {recentCount > 0 && (
        <p className="text-xs text-gray-700">Du har {recentCount} lagret oppskrift{recentCount !== 1 ? 'er' : ''}</p>
      )}
    </div>
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />
    </div>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState<string | null>(null);
  const [recipeId, setRecipeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShopping, setShowShopping] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<ChefRequest | null>(null);

  const { history, saveRecipe, deleteRecipe, isSaved } = useRecipeHistory();

  const handleGenerate = async (request: ChefRequest) => {
    setLoading(true);
    setError(null);
    setCurrentRequest(request);
    setView('recipe');
    try {
      const result = await generateRecipe(request);
      setRecipe(result);
      setRecipeId(Date.now().toString());
    } catch (err: any) {
      setError(err.message || 'Noe gikk galt under matlagingen.');
      setView('preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!recipe || !currentRequest) return;
    const titleMatch = recipe.match(/^##\s+(.+)/m);
    saveRecipe({
      id: recipeId,
      title: titleMatch ? titleMatch[1].trim() : 'Uten navn',
      markdown: recipe,
      request: currentRequest,
      savedAt: new Date().toISOString(),
    });
  };

  const handleLoadFromHistory = (saved: SavedRecipe) => {
    setRecipe(saved.markdown);
    setRecipeId(saved.id);
    setCurrentRequest(saved.request);
    setIngredients(saved.request.ingredients);
    setView('recipe');
  };

  const handleNew = () => {
    setRecipe(null); setIngredients(''); setCurrentRequest(null); setError(null); setView('home');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <Header
        view={view}
        historyCount={history.length}
        onNavigate={(v) => { if (v === 'home') handleNew(); else setView(v); }}
      />

      <main className="pt-14 px-4 max-w-5xl mx-auto">
        {view === 'home' && <HomeScreen onStart={() => setView('ingredients')} recentCount={history.length} />}

        {view === 'ingredients' && (
          <div className="py-10">
            <IngredientStep initialIngredients={ingredients} onNext={(ing) => { setIngredients(ing); setView('preferences'); }} />
          </div>
        )}

        {view === 'preferences' && (
          <div className="py-10">
            <PreferenceStep ingredients={ingredients} onSubmit={handleGenerate} onBack={() => setView('ingredients')} isLoading={loading} />
          </div>
        )}

        {view === 'recipe' && (
          <div className="py-10">
            {loading && <LoadingScreen />}
            {error && !loading && (
              <div className="max-w-lg mx-auto text-center space-y-4 animate-fade-up">
                <div className="bg-red-900/20 border border-red-500/40 rounded-2xl p-6 text-red-200 text-sm">{error}</div>
                <button onClick={() => setView('preferences')} className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors">← Tilbake</button>
              </div>
            )}
            {recipe && !loading && (
              <RecipeResult markdown={recipe} isSaved={isSaved(recipeId)}
                onSave={handleSave} onShoppingList={() => setShowShopping(true)} onNew={handleNew} />
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="py-10">
            <HistoryPage history={history} onLoad={handleLoadFromHistory} onDelete={deleteRecipe} />
          </div>
        )}
      </main>

      {showShopping && recipe && (
        <ShoppingListModal recipeMarkdown={recipe} onClose={() => setShowShopping(false)} />
      )}

      <footer className="mt-10 py-8 text-center border-t border-white/5">
        <p className="text-gray-700 text-xs uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Michelin Chef AI &bull; Drevet av Gemini AI
        </p>
      </footer>
    </div>
  );
};

export default App;
