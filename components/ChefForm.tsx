
import React from 'react';
import { ChefRequest, FlavorProfile } from '../types';

interface ChefFormProps {
  onSubmit: (data: ChefRequest) => void;
  isLoading: boolean;
}

const ChefForm: React.FC<ChefFormProps> = ({ onSubmit, isLoading }) => {
  const [ingredients, setIngredients] = React.useState('');
  const [people, setPeople] = React.useState(2);
  const [flavorProfile, setFlavorProfile] = React.useState(FlavorProfile.BALANSERT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ingredients, people, flavorProfile });
  };

  return (
    <form onSubmit={handleSubmit} className="chef-card p-6 rounded-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Hva har du på kjøkkenet?</label>
        <textarea
          required
          placeholder="F.eks. Laks, asparges, sitron, sjalottløk..."
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all min-h-[100px]"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Antall gjester</label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="12"
              value={people}
              onChange={(e) => setPeople(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
            />
            <span className="text-xl font-semibold w-8 text-[#d4af37]">{people}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Smaksprofil</label>
          <select
            value={flavorProfile}
            onChange={(e) => setFlavorProfile(e.target.value as FlavorProfile)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
          >
            {Object.values(FlavorProfile).map((profile) => (
              <option key={profile} value={profile} className="bg-neutral-900">
                {profile}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !ingredients.trim()}
        className="w-full py-4 bg-[#d4af37] text-black font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[#f1d592] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Komponerer...
          </span>
        ) : (
          "Skap Gastronomi"
        )}
      </button>
    </form>
  );
};

export default ChefForm;
