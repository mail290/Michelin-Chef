
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  view: AppView;
  historyCount: number;
  onNavigate: (view: AppView) => void;
}

const StarIcon = () => (
  <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ view, historyCount, onNavigate }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-14 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
    <button
      onClick={() => onNavigate('home')}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <div className="flex gap-0.5">
        <StarIcon /><StarIcon /><StarIcon />
      </div>
      <span className="serif text-sm font-bold gold-gradient hidden sm:block">Michelin Chef AI</span>
    </button>

    {(view === 'ingredients' || view === 'preferences') && (
      <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
        <span className={view === 'ingredients' ? 'text-[#d4af37]' : 'text-gray-600'}>Ingredienser</span>
        <span className="text-gray-700">›</span>
        <span className={view === 'preferences' ? 'text-[#d4af37]' : 'text-gray-600'}>Preferanser</span>
        <span className="text-gray-700">›</span>
        <span className="text-gray-600">Oppskrift</span>
      </div>
    )}

    <button
      onClick={() => onNavigate(view === 'history' ? 'home' : 'history')}
      className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gray-400 hover:text-[#d4af37] transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="hidden sm:block">{view === 'history' ? 'Tilbake' : 'Historikk'}</span>
      {historyCount > 0 && view !== 'history' && (
        <span className="bg-[#d4af37] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {historyCount > 9 ? '9+' : historyCount}
        </span>
      )}
    </button>
  </nav>
);

export default Header;
