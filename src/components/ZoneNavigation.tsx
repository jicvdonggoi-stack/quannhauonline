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
    <div className="fixed top-18 left-3 z-30 flex flex-col gap-2 pointer-events-none">
      {/* Zone pills bar */}
      <div className="pointer-events-auto flex flex-wrap gap-1 bg-stone-950/85 backdrop-blur-md p-1.5 rounded-2xl border border-stone-700/80 shadow-xl max-w-sm sm:max-w-none">
        <span className="text-[11px] font-bold text-stone-400 px-2 flex items-center gap-1.5 shrink-0">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          Tham quan:
        </span>

        {ZONES.map((zone) => {
          const isActive = currentPreset === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              <span>{zone.icon}</span>
              <span>{zone.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Quick Activity Pills (giống tương tác Chùa 3D) */}
      <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={onFeedFish}
          className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/70 text-cyan-300 text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          title="Ném thức ăn cho cá sông Mekong bơi quẫy nước"
        >
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cho Cá Sông Ăn 🐟</span>
        </button>

        <button
          onClick={onPlayFolkMusic}
          className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/70 text-purple-300 text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          title="Nghe một khúc đờn ca tài tử Nam Bộ mộc mạc"
        >
          <Music className="w-3.5 h-3.5 text-purple-400" />
          <span>Đờn Ca Tài Tử 🎶</span>
        </button>

        <button
          onClick={() => onOpenMinigame('clicker')}
          className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-300 text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          title="Gõ ly rót bia tích điểm sảng khoái (giống gõ mõ online)"
        >
          <Beer className="w-3.5 h-3.5 text-amber-400" />
          <span>Gõ Ly Tích Điểm 🍻</span>
        </button>

        <button
          onClick={() => onOpenMinigame('dice')}
          className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/70 text-red-300 text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          title="Lắc xí ngầu & quay vòng xoay sát phạt"
        >
          <Dices className="w-3.5 h-3.5 text-red-400" />
          <span>Lắc Xí Ngầu 🎲</span>
        </button>
      </div>
    </div>
  );
};
