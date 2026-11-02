import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Beer,
  Sparkles,
  LogOut,
  Camera,
  ChevronDown,
  ChevronUp,
  Smile,
  Hand,
  Flame,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface BottomDockProps {
  hasTable: boolean;
  tableName?: string;
  onOpenMenu: () => void;
  onOpenMinigame?: (tab?: 'clicker' | 'dice' | 'wheel' | 'fortune') => void;
  onTriggerAction: (action: string) => void;
  onLeaveTable: () => void;
  cameraPreset: 'overview' | 'my_table' | 'river' | 'grill' | 'music' | 'beer_tap';
  onChangeCameraPreset: (preset: 'overview' | 'my_table' | 'river' | 'grill' | 'music' | 'beer_tap') => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  hasTable,
  tableName,
  onOpenMenu,
  onOpenMinigame,
  onTriggerAction,
  onLeaveTable,
  cameraPreset,
  onChangeCameraPreset,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCheers = () => {
    soundManager.playCheers();
    onTriggerAction('cheers');
  };

  const handleDrink = () => {
    soundManager.playGlassClink();
    onTriggerAction('drink');
  };

  const handleWave = () => {
    onTriggerAction('wave');
  };

  const handleLaugh = () => {
    onTriggerAction('laugh');
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[min(940px,96vw)] w-full flex flex-col items-center pointer-events-none">
      {/* Toggle collapse / expand tab */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="pointer-events-auto mb-1.5 px-3 py-1 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-700/80 text-xs font-medium shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Hiện Thanh Điều Khiển</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Ẩn Điều Khiển</span>
          </>
        )}
      </button>

      {/* Main glassmorphic dock */}
      {!isCollapsed && (
        <div className="pointer-events-auto w-full p-2.5 sm:p-3 rounded-2xl bg-stone-950/85 backdrop-blur-md border border-stone-700/80 shadow-2xl text-stone-100 flex flex-wrap items-center justify-between gap-2.5">
          {/* Section 1: Main Pub Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
            {hasTable ? (
              <>
                <button
                  onClick={onOpenMenu}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 hover:from-amber-400 hover:to-yellow-400 active:scale-95 transition-all font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Gọi Món & Bia</span>
                </button>

                <button
                  onClick={handleCheers}
                  className="px-3 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white active:scale-95 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
                  title="Nâng ly cụng bia 1 2 3 DZÔ!"
                >
                  <Beer className="w-4 h-4" />
                  <span>1 2 3 DZÔ!</span>
                </button>

                <button
                  onClick={handleDrink}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 transition-all text-xs font-semibold text-amber-300 border border-stone-700 flex items-center gap-1.5 cursor-pointer"
                  title="Uống bia"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Uống Bia</span>
                </button>

                <button
                  onClick={() => onOpenMinigame?.('dice')}
                  className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 active:scale-95 transition-all text-xs font-semibold text-purple-300 border border-purple-700/70 flex items-center gap-1.5 cursor-pointer shadow-md"
                  title="Trò chơi lắc xí ngầu, vòng quay & gõ ly"
                >
                  <span>🎲 Trò Chơi</span>
                </button>

                <button
                  onClick={handleWave}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 border border-stone-700 cursor-pointer"
                  title="Vẫy tay chào anh em"
                >
                  <Hand className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLaugh}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 border border-stone-700 cursor-pointer"
                  title="Cười rôm rả"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <button
                  onClick={onLeaveTable}
                  className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 active:scale-95 cursor-pointer"
                  title="Đứng dậy rời bàn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
                <Beer className="w-4 h-4" />
                <span>Nhấp chuột vào một bàn bất kỳ trong 10 bàn để kéo ghế ngồi nhậu!</span>
              </div>
            )}
          </div>

          {/* Section 2: Camera View Presets */}
          <div className="flex items-center gap-1 bg-stone-900/90 border border-stone-800 rounded-xl p-1 text-xs">
            <span className="text-[11px] font-semibold text-stone-400 px-2 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              Góc nhìn:
            </span>

            <button
              onClick={() => onChangeCameraPreset('overview')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                cameraPreset === 'overview'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              Toàn Cảnh
            </button>

            {hasTable && (
              <button
                onClick={() => onChangeCameraPreset('my_table')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  cameraPreset === 'my_table'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
                }`}
              >
                Bàn Của Tôi
              </button>
            )}

            <button
              onClick={() => onChangeCameraPreset('river')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                cameraPreset === 'river'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              Bờ Sông
            </button>

            <button
              onClick={() => onChangeCameraPreset('grill')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                cameraPreset === 'grill'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              Bếp Nướng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
