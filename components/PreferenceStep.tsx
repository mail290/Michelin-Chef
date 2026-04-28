
import React, { useState } from 'react';
import { ChefRequest, CookingMode, Cuisine, FlavorProfile, MealType, SkillLevel } from '../types';

interface PreferenceStepProps {
  ingredients: string;
  onSubmit: (request: ChefRequest) => void;
  onBack: () => void;
  isLoading: boolean;
}

type CardItem = { value: string; label: string; icon: string; desc?: string };

const MEAL_TYPES: CardItem[] = [
  { value: MealType.FROKOST,  label: 'Frokost',      icon: '🍳' },
  { value: MealType.LUNSJ,    label: 'Lunsj',         icon: '🥗' },
  { value: MealType.MIDDAG,   label: 'Middag',        icon: '🍽️' },
  { value: MealType.FORRETT,  label: 'Forrett/Snack', icon: '🫙' },
  { value: MealType.DESSERT,  label: 'Dessert',       icon: '🍮' },
];

const COOKING_MODES: CardItem[] = [
  { value: CookingMode.RASKT,       label: 'Raskt & Enkelt', icon: '⚡', desc: 'Under 30 min' },
  { value: CookingMode.HVERDAGSLIG, label: 'Hverdagslig',    icon: '🏠', desc: 'Enkel matlaging' },
  { value: CookingMode.FESTMAT,     label: 'Festmat',        icon: '🥂', desc: 'Imponér gjestene' },
  { value: CookingMode.GRILL,       label: 'Grill',          icon: '🔥', desc: 'Utendørs matlaging' },
  { value: CookingMode.AIRFRYER,    label: 'Air Fryer',      icon: '💨', desc: 'Sprøtt & raskt' },
  { value: CookingMode.SLOW,        label: 'Slow Cook',      icon: '⏳', desc: 'Mørt & smakfullt' },
  { value: CookingMode.MICHELIN,    label: 'Michelin-nivå',  icon: '⭐', desc: 'Gastronomisk kunst' },
];

const CUISINES: CardItem[] = [
  { value: Cuisine.NORSK,      label: 'Nordisk',    icon: '🇳🇴' },
  { value: Cuisine.ITALIENSK,  label: 'Italiensk',  icon: '🇮🇹' },
  { value: Cuisine.FRANSK,     label: 'Fransk',     icon: '🇫🇷' },
  { value: Cuisine.GRESK,      label: 'Gresk',      icon: '🇬🇷' },
  { value: Cuisine.SPANSK,     label: 'Spansk',     icon: '🇪🇸' },
  { value: Cuisine.MEKSIKANSK, label: 'Meksikansk', icon: '🇲🇽' },
  { value: Cuisine.ASIATISK,   label: 'Asiatisk',   icon: '🥢' },
  { value: Cuisine.JAPANSK,    label: 'Japansk',    icon: '🇯🇵' },
  { value: Cuisine.THAI,       label: 'Thai',       icon: '🌶️' },
  { value: Cuisine.INDISK,     label: 'Indisk',     icon: '🫚' },
  { value: Cuisine.KINESISK,   label: 'Kinesisk',   icon: '🇨🇳' },
  { value: Cuisine.MIDTOSTEN,  label: 'Midtøsten',  icon: '🧆' },
  { value: Cuisine.AMERIKANSK, label: 'BBQ',        icon: '🍖' },
];

const SKILLS: CardItem[] = [
  { value: SkillLevel.ENKEL,    label: 'Enkel',    icon: '👶', desc: 'Nybegynner' },
  { value: SkillLevel.MIDDELS,  label: 'Middels',  icon: '👨‍🍳', desc: 'Hjemmekokk' },
  { value: SkillLevel.AVANSERT, label: 'Avansert', icon: '🎓', desc: 'Erfaren' },
  { value: SkillLevel.MICHELIN, label: 'Michelin', icon: '⭐', desc: 'Profesjonell' },
];

const FLAVORS: CardItem[] = [
  { value: FlavorProfile.SYRLIG,    label: 'Syrlig & Frisk',   icon: '🍋' },
  { value: FlavorProfile.RIK,       label: 'Rik & Kremet',     icon: '🧈' },
  { value: FlavorProfile.KRYDRET,   label: 'Krydret & Intens', icon: '🌶️' },
  { value: FlavorProfile.LETT,      label: 'Lett & Elegant',   icon: '🌿' },
  { value: FlavorProfile.BALANSERT, label: 'Umami & Balanse',  icon: '⚖️' },
  { value: FlavorProfile.SOET,      label: 'Søtt & Rundt',     icon: '🍯' },
];

function CardGrid<T extends string>({ items, value, onChange, cols = 3 }: {
  items: CardItem[]; value: T; onChange: (v: T) => void; cols?: number;
}) {
  const gridClass = cols === 4
    ? 'grid grid-cols-2 sm:grid-cols-4 gap-2'
    : 'grid grid-cols-2 sm:grid-cols-3 gap-2';
  return (
    <div className={gridClass}>
      {items.map((item) => (
        <button key={item.value} type="button" onClick={() => onChange(item.value as T)}
          className={`mode-card rounded-xl p-3 text-left ${value === item.value ? 'selected' : ''}`}>
          <span className="text-xl">{item.icon}</span>
          <p className="text-xs font-semibold text-gray-200 mt-1">{item.label}</p>
          {item.desc && <p className="text-[10px] text-gray-600 mt-0.5">{item.desc}</p>}
        </button>
      ))}
    </div>
  );
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{title}</h3>
    {children}
  </div>
);

const PreferenceStep: React.FC<PreferenceStepProps> = ({ ingredients, onSubmit, onBack, isLoading }) => {
  const [mealType,      setMealType]      = useState<MealType>(MealType.MIDDAG);
  const [cookingMode,   setCookingMode]   = useState<CookingMode>(CookingMode.HVERDAGSLIG);
  const [cuisine,       setCuisine]       = useState<Cuisine>(Cuisine.ITALIENSK);
  const [flavorProfile, setFlavorProfile] = useState<FlavorProfile>(FlavorProfile.BALANSERT);
  const [skillLevel,    setSkillLevel]    = useState<SkillLevel>(SkillLevel.MIDDELS);
  const [people,        setPeople]        = useState(2);
  const [extraWishes,   setExtraWishes]   = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ingredients, people, flavorProfile, cookingMode, cuisine, mealType, skillLevel, extraWishes });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full animate-fade-up space-y-8">
      <div className="text-center space-y-2">
        <h2 className="serif text-3xl md:text-4xl font-bold gold-gradient">Dine preferanser</h2>
        <p className="text-gray-500 text-sm">Fortell oss hvordan du vil ha det</p>
      </div>

      <Section title="Måltidstype">
        <CardGrid items={MEAL_TYPES} value={mealType} onChange={setMealType} />
      </Section>
      <Section title="Tilberedningsmåte">
        <CardGrid items={COOKING_MODES} value={cookingMode} onChange={setCookingMode} />
      </Section>
      <Section title="Kjøkken / Matstype">
        <CardGrid items={CUISINES} value={cuisine} onChange={setCuisine} cols={4} />
      </Section>
      <Section title="Smaksprofil">
        <CardGrid items={FLAVORS} value={flavorProfile} onChange={setFlavorProfile} />
      </Section>
      <Section title="Ferdighetsnivå">
        <CardGrid items={SKILLS} value={skillLevel} onChange={setSkillLevel} cols={4} />
      </Section>

      <Section title={`Antall porsjoner: ${people}`}>
        <div className="flex items-center gap-4">
          <input type="range" min={1} max={12} value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer" />
          <span className="text-2xl font-bold text-[#d4af37] w-8 text-center">{people}</span>
        </div>
      </Section>

      <Section title="Ekstra ønsker (valgfritt)">
        <input type="text" value={extraWishes} onChange={(e) => setExtraWishes(e.target.value)}
          placeholder="F.eks. Ingen nøtter, glutenfritt, veldig krydret..."
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
      </Section>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="px-6 py-4 bg-white/5 border border-white/10 text-gray-400 text-sm uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
          ← Tilbake
        </button>
        <button type="submit" disabled={isLoading}
          className="flex-1 py-4 bg-[#d4af37] text-black font-bold uppercase tracking-[0.2em] text-sm rounded-xl hover:bg-[#f1d592] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
          {isLoading ? (
            <><div className="w-4 h-4 border-t-2 border-black rounded-full animate-spin" />Komponerer...</>
          ) : 'Skap oppskrift ✦'}
        </button>
      </div>
    </form>
  );
};

export default PreferenceStep;
