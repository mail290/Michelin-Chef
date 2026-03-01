
import React from 'react';

interface RecipeResultProps {
  markdown: string;
}

const RecipeResult: React.FC<RecipeResultProps> = ({ markdown }) => {
  // Simple markdown processor for the specific Michelin format
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('##')) {
        return <h2 key={i} className="text-4xl font-bold mb-6 mt-8 gold-gradient">{line.replace('##', '').trim()}</h2>;
      }
      if (line.startsWith('**Beskrivelse:**')) {
        return <p key={i} className="text-lg italic text-gray-300 mb-6 border-l-2 border-[#d4af37] pl-4">{line.replace('**Beskrivelse:**', '').trim()}</p>;
      }
      if (line.startsWith('**Info:**')) {
        return <h3 key={i} className="text-xl font-semibold uppercase tracking-widest text-[#d4af37] mt-8 mb-4">Informasjon</h3>;
      }
      if (line.startsWith('**Ingredienser')) {
        return <h3 key={i} className="text-xl font-semibold uppercase tracking-widest text-[#d4af37] mt-10 mb-4">Ingredienser</h3>;
      }
      if (line.startsWith('**Fremgangsmåte')) {
        return <h3 key={i} className="text-xl font-semibold uppercase tracking-widest text-[#d4af37] mt-10 mb-4">Fremgangsmåte</h3>;
      }
      if (line.startsWith('**Anretning')) {
        return (
          <div key={i} className="bg-white/5 p-6 rounded-2xl mt-12 border border-[#d4af37]/20">
            <h3 className="text-xl font-semibold uppercase tracking-widest text-[#d4af37] mb-4">Anretning (Plating)</h3>
            <p className="text-gray-300 leading-relaxed">{line.replace('**Anretning (Plating):**', '').trim()}</p>
          </div>
        );
      }
      if (line.startsWith('**Chef\'s Tip:**')) {
        return (
          <div key={i} className="bg-black border border-[#d4af37] p-6 rounded-2xl mt-8">
            <span className="text-[#d4af37] font-bold uppercase tracking-widest block mb-2">Chef's Tip</span>
            <p className="text-gray-300 italic">{line.replace('**Chef\'s Tip:**', '').trim()}</p>
          </div>
        );
      }
      if (line.startsWith('*')) {
        return <li key={i} className="ml-4 mb-2 text-gray-300 list-none flex items-start"><span className="text-[#d4af37] mr-2">✦</span> {line.replace('*', '').trim()}</li>;
      }
      if (/^\d+\./.test(line)) {
        return (
          <div key={i} className="mb-6">
            <p className="text-gray-100 font-medium">{line}</p>
          </div>
        );
      }
      return <p key={i} className="text-gray-400 mb-2 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="chef-card p-8 md:p-12 rounded-3xl animate-fade-in shadow-2xl">
      <div className="max-w-3xl mx-auto">
        {formatText(markdown)}
      </div>
      <div className="mt-12 flex justify-center">
        <button 
          onClick={() => window.print()}
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-[#d4af37] transition-colors"
        >
          Lagre som PDF / Skriv ut
        </button>
      </div>
    </div>
  );
};

export default RecipeResult;
