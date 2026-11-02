import React from 'react';
import {
  Compass,
  Beer,
  Waves,
  Flame,
  Music,
  Dices,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface ZoneNavigationProps {
  currentPreset: string;
  onSelectZone: (zone: 'overview' | 'my_table' | 'river' | 'grill' | 'music' | 'beer_tap') => void;
  onOpenMinigame: (tab?: 'clicker' | 'dice' | 'wheel' | 'fortune') => void;
  onFeedFish: () => void;
  onPlayFolkMusic: () => void;
}

export const ZoneNavigation: React.FC<ZoneNavigationProps> = ({
  currentPreset,
  onSelectZone,
  onOpenMinigame,
  onFeedFish,
  onPlayFolkMusic,
}) => {
  const ZONES = [
    { id: 'overview' as const, label: 'Toàn Quán', icon: '🏮' },
    { id: 'river' as const, label: 'Bờ Sông & Xuồng', icon: '🌊' },
    { id: 'grill' as const, label: 'Bếp Nướng Cá', icon: '🔥' },
    { id: 'beer_tap' as const, label: 'Quầy Rót Bia', icon: '🍺' },
    { id: 'music' as const, label: 'Đờn Ca Tài Tử', icon: '🎸' },
  ];

  return (
    <div className="fixed top-13 sm:top-18 left-2 right-2 sm:right-auto sm:left-3 z-20 flex flex-col gap-1.5 pointer-events-none max-w-full sm:max-w-xl">
      {/* Scrollable single/dual deck for mobile */}
      <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1 bg-stone-950/80 backdrop-blur-md rounded-2xl border border-stone-800/80 shadow-lg">
        {/* Scenic Zones */}
        {ZONES.map((zone) => {
          const isActive = currentPreset === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'text-stone-300 hover:text-stone-100 bg-stone-900/90 border border-stone-800'
              }`}
            >
              <span>{zone.icon}</span>
              <span>{zone.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-stone-800 shrink-0 mx-0.5" />

        {/* Quick Minigame Shortcuts */}
        <button
          onClick={onFeedFish}
          className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-[11px] sm:text-xs font-semibold shrink-0 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <Waves className="w-3 h-3 text-cyan-400" />
          <span>Cá Sông 🐟</span>
        </button>

        <button
          onClick={onPlayFolkMusic}
          className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-[11px] sm:text-xs font-semibold shrink-0 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <Music className="w-3 h-3 text-purple-400" />
          <span>Đờn Ca 🎶</span>
        </button>

        <button
          onClick={() => onOpenMinigame('clicker')}
          className="px-2.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-300 text-[11px] sm:text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <Beer className="w-3 h-3 text-amber-400" />
          <span>Gõ Ly 🍻</span>
        </button>

        <button
          onClick={() => onOpenMinigame('dice')}
          className="px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 text-[11px] sm:text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <Dices className="w-3 h-3 text-red-400" />
          <span>Xí Ngầu 🎲</span>
        </button>
      </div>
    </div>
  );
};
