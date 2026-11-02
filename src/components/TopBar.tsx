import React, { useState } from 'react';
import { Volume2, VolumeX, User, HelpCircle, MapPin, Beer } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TopBarProps {
  onlineCount: number;
  currentTableName: string | null;
  playerName: string;
  onOpenCharacterCreator: () => void;
  onOpenTableList: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onlineCount,
  currentTableName,
  playerName,
  onOpenCharacterCreator,
  onOpenTableList,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showHelp, setShowHelp] = useState(false);

  const toggleSound = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) soundManager.playGlassClink();
  };

  return (
    <header className="fixed top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-30 flex items-center justify-between pointer-events-none">
      {/* Brand & Table Status (Left) */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 bg-stone-950/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-stone-700/80 shadow-xl text-stone-100">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-sm shrink-0">
            <Beer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <div className="font-extrabold text-xs sm:text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-serif leading-tight whitespace-nowrap">
              ÚT GIÀO
              <span className="hidden xs:inline"> • MIỀN TÂY</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{onlineCount} khách</span>
            </div>
          </div>
        </div>

        {/* Current Table Badge / Quick Table Picker on Mobile */}
        <div className="h-5 sm:h-6 w-px bg-stone-800 mx-0.5 sm:mx-1" />

        <button
          onClick={onOpenTableList}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-200 border border-stone-700 transition-all cursor-pointer"
          title="Xem danh sách 10 bàn nhậu"
        >
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <span className="max-w-[85px] sm:max-w-none truncate">
            {currentTableName ? currentTableName : '10 Bàn'}
          </span>
        </button>
      </div>

      {/* User info & Settings (Right) */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 bg-stone-950/90 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-stone-700/80 shadow-xl text-stone-100">
        {/* Profile / Character trigger */}
        <button
          onClick={onOpenCharacterCreator}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-200 text-[11px] sm:text-xs font-semibold border border-stone-700/80 transition-all cursor-pointer"
          title="Tùy chỉnh nhân vật & tên"
        >
          <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
            {playerName.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[65px] sm:max-w-[100px] truncate">{playerName}</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="p-1.5 sm:p-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-amber-300 border border-stone-700/80 transition-all cursor-pointer"
          title={isMuted ? 'Bật âm thanh quán' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
        </button>

        {/* Help guide toggle */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-1.5 sm:p-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-amber-300 border border-stone-700/80 transition-all cursor-pointer"
          title="Hướng dẫn chơi & điều khiển 3D"
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Help Popup */}
      {showHelp && (
        <div className="pointer-events-auto absolute top-14 sm:top-16 right-2 sm:right-3 w-[calc(100vw-1rem)] sm:w-80 max-w-sm p-4 rounded-2xl bg-stone-900/95 backdrop-blur-md border border-stone-700 shadow-2xl text-stone-200 text-xs space-y-3 animate-in fade-in z-50">
          <div className="font-bold text-amber-300 text-sm border-b border-stone-800 pb-2">
            Hướng Dẫn Trải Nghiệm Quán Nhậu 3D
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-stone-100">📱 Thao tác cảm ứng Mobile:</span> Dùng 1 ngón tay vuốt để xoay camera 3D quanh quán. Dùng 2 ngón tay chụm lại hoặc kéo ra để phóng to / thu nhỏ (Pinch-to-zoom).
            </div>
            <div>
              <span className="font-semibold text-stone-100">🪑 Chọn bàn & Ghế:</span> Bấm nút &ldquo;10 Bàn&rdquo; ở trên hoặc chạm vào bàn bất kỳ để kéo ghế ngồi vào bàn.
            </div>
            <div>
              <span className="font-semibold text-stone-100">🍻 Cụng ly & Uống bia:</span> Bấm nút &ldquo;1 2 3 DZÔ!&rdquo; ở thanh điều khiển dưới đáy màn hình để nâng ly cùng bạn bè.
            </div>
            <div>
              <span className="font-semibold text-stone-100">🍲 Gọi món:</span> Mở Menu đặt bia & 30 món ăn miền Tây. Nhân viên Chú Ba phục vụ sẽ bưng khay món dọn lên bàn của bạn!
            </div>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold active:scale-95 cursor-pointer shadow-md"
          >
            Đã hiểu, vào nhậu thôi!
          </button>
        </div>
      )}
    </header>
  );
};
