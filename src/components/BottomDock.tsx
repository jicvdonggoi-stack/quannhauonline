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
  onOpenTableList?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
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
  onOpenTableList,
  onToggleChat,
  isChatOpen,
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
    <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[min(960px,100vw)] px-2 sm:px-4 flex flex-col items-center pointer-events-none">
      {/* Toggle collapse / expand tab */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="pointer-events-auto mb-1 px-3 py-0.5 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-700/80 text-[11px] font-medium shadow-md flex items-center gap-1 cursor-pointer backdrop-blur-sm"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Hiện Bảng Điều Khiển</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Thu Gọn</span>
          </>
        )}
      </button>

      {/* Main glassmorphic dock */}
      {!isCollapsed && (
        <div className="pointer-events-auto w-full p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-stone-950/92 backdrop-blur-xl border border-stone-700/80 shadow-2xl text-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Section 1: Main Pub Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 w-full sm:w-auto">
            {hasTable ? (
              <>
                {/* 1. Gọi món */}
                <button
                  onClick={onOpenMenu}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 hover:from-amber-400 hover:to-yellow-400 active:scale-95 transition-all font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 shrink-0 whitespace-nowrap"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Gọi Món</span>
                </button>

                {/* 2. 1 2 3 DZÔ */}
                <button
                  onClick={handleCheers}
                  className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white active:scale-95 transition-all font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/30 shrink-0 whitespace-nowrap"
                  title="Nâng ly cụng bia 1 2 3 DZÔ!"
                >
                  <Beer className="w-4 h-4" />
                  <span>1 2 3 DZÔ!</span>
                </button>

                {/* 3. Uống bia */}
                <button
                  onClick={handleDrink}
                  className="px-2.5 sm:px-3 py-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 active:scale-95 transition-all text-xs font-semibold text-amber-300 border border-stone-700 flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
                  title="Uống một hớp bia"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Uống</span>
                </button>

                {/* 4. Chat Drawer Toggle on Mobile */}
                {onToggleChat && (
                  <button
                    onClick={onToggleChat}
                    className={`px-2.5 sm:px-3 py-2.5 rounded-xl active:scale-95 transition-all text-xs font-semibold border flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap ${
                      isChatOpen
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                        : 'bg-stone-800/90 text-stone-200 border-stone-700 hover:bg-stone-700'
                    }`}
                    title="Mở trò chuyện bàn"
                  >
                    <span>💬 Chat</span>
                  </button>
                )}

                {/* 5. Trò chơi minigame */}
                <button
                  onClick={() => onOpenMinigame?.('dice')}
                  className="px-2.5 sm:px-3 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 active:scale-95 transition-all text-xs font-semibold text-purple-300 border border-purple-700/70 flex items-center gap-1 cursor-pointer shadow-md shrink-0 whitespace-nowrap"
                  title="Trò chơi xí ngầu, vòng quay & gõ ly"
                >
                  <span>🎲 Game</span>
                </button>

                {/* 6. Quick reactions */}
                <button
                  onClick={handleWave}
                  className="p-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-300 border border-stone-700 cursor-pointer shrink-0"
                  title="Vẫy tay chào"
                >
                  <Hand className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLaugh}
                  className="p-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-300 border border-stone-700 cursor-pointer shrink-0"
                  title="Cười vui"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* 7. Rời bàn */}
                <button
                  onClick={onLeaveTable}
                  className="p-2.5 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/60 active:scale-95 cursor-pointer shrink-0"
                  title="Đứng dậy rời bàn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-1.5 text-amber-300 text-[11px] sm:text-xs font-medium">
                  <Beer className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">Chưa ngồi bàn nào • Chạm vào 10 bàn trên 3D để ngồi</span>
                </div>
                {onOpenTableList && (
                  <button
                    onClick={onOpenTableList}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shrink-0 active:scale-95 transition-all shadow-md cursor-pointer whitespace-nowrap"
                  >
                    Chọn Bàn Nhanh
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Camera View Presets on Mobile */}
          <div className="flex items-center justify-between sm:justify-end gap-1 bg-stone-900/90 border border-stone-800/90 rounded-xl p-1 text-xs shrink-0 overflow-x-auto scrollbar-none">
            <button
              onClick={() => onChangeCameraPreset('overview')}
              className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                cameraPreset === 'overview'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              Toàn Cảnh
            </button>

            {hasTable && (
              <button
                onClick={() => onChangeCameraPreset('my_table')}
                className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  cameraPreset === 'my_table'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
                }`}
              >
                Bàn Của Tôi
              </button>
            )}

            <button
              onClick={() => onChangeCameraPreset('river')}
              className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                cameraPreset === 'river'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              Bờ Sông
            </button>

            <button
              onClick={() => onChangeCameraPreset('grill')}
              className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                cameraPreset === 'grill'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
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
