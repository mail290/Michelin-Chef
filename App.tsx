
import React, { useState } from 'react';
import ChefForm from './components/ChefForm';
import RecipeResult from './components/RecipeResult';
import { ChefRequest } from './types';
import { generateMichelinRecipe } from './geminiService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRecipe = async (request: ChefRequest) => {
    setLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const result = await generateMichelinRecipe(request);
      setRecipe(result);
    } catch (err: any) {
      setError(err.message || 'Noe gikk galt under matlagingen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Hero Section */}
      <header className="relative h-[40vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="High-end Kitchen" 
            className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-1">
              {[1, 2, 3].map(i => (
                <svg key={i} className="w-6 h-6 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-2 tracking-tighter gold-gradient">
            Michelin Chef AI
          </h1>
          <p className="text-gray-400 uppercase tracking-[0.4em] text-sm">Gastronomi i ditt eget hjem</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 gap-12">
          
          {/* Input Form */}
          {!recipe && (
            <div className="max-w-2xl mx-auto w-full">
               <ChefForm onSubmit={handleCreateRecipe} isLoading={loading} />
            </div>
          )}

          {/* Loading State */}
          {loading && !recipe && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-t-2 border-[#d4af37] rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 animate-pulse uppercase tracking-[0.2em] text-xs">Analyserer smaksnyanser...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl text-red-200 text-center">
              {error}
              <button 
                onClick={() => setError(null)}
                className="block mx-auto mt-4 text-sm underline opacity-70 hover:opacity-100"
              >
                Prøv igjen
              </button>
            </div>
          )}

          {/* Result */}
          {recipe && (
            <div className="space-y-8">
              <RecipeResult markdown={recipe} />
              <div className="flex justify-center">
                <button 
                  onClick={() => setRecipe(null)}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors uppercase tracking-widest text-xs"
                >
                  Start ny kreasjon
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 py-10 text-center border-t border-white/5">
        <p className="text-gray-600 text-xs uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Michelin Chef AI • Drevet av Gemini
        </p>
      </footer>
    </div>
  );
};

export default App;
