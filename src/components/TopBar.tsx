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
    <header className="fixed top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
      {/* Brand & Table Status (Left) */}
      <div className="pointer-events-auto flex items-center gap-2.5 bg-stone-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-700/80 shadow-xl text-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-sm">
            <Beer className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-serif leading-tight">
              QUÁN NHẬU ANH ÚT GIÀO
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{onlineCount} người online</span>
            </div>
          </div>
        </div>

        {/* Current Table Badge */}
        <div className="h-6 w-px bg-stone-800 mx-1 hidden sm:block" />

        <button
          onClick={onOpenTableList}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentTableName ? `Đang ngồi: ${currentTableName}` : 'Chọn Trong 10 Bàn'}</span>
        </button>
      </div>

      {/* User info & Settings (Right) */}
      <div className="pointer-events-auto flex items-center gap-2 bg-stone-950/85 backdrop-blur-md p-1.5 rounded-2xl border border-stone-700/80 shadow-xl text-stone-100">
        {/* Profile / Character trigger */}
        <button
          onClick={onOpenCharacterCreator}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700/80 transition-all cursor-pointer"
          title="Tùy chỉnh nhân vật & tên"
        >
          <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
            {playerName.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[100px] truncate">{playerName}</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-amber-300 border border-stone-700/80 transition-all cursor-pointer"
          title={isMuted ? 'Bật âm thanh quán' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Help guide toggle */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-amber-300 border border-stone-700/80 transition-all cursor-pointer"
          title="Hướng dẫn chơi & điều khiển 3D"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Help Popup */}
      {showHelp && (
        <div className="pointer-events-auto absolute top-16 right-3 w-80 p-4 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-200 text-xs space-y-3 animate-in fade-in">
          <div className="font-bold text-amber-300 text-sm border-b border-stone-800 pb-2">
            Hướng Dẫn Trải Nghiệm Quán Nhậu 3D
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-stone-100">🖱️ Xoay & Phóng to 3D:</span> Kéo chuột trái để xoay camera quanh quán. Lăn chuột để phóng to/thu nhỏ. Kéo chuột phải để di chuyển vùng nhìn.
            </div>
            <div>
              <span className="font-semibold text-stone-100">🪑 Chọn bàn & Ghế:</span> Nhấp vào bất kỳ bàn nào trong 10 bàn để xem thông tin và kéo ghế ngồi vào bàn.
            </div>
            <div>
              <span className="font-semibold text-stone-100">🍻 Cụng ly & Uống bia:</span> Bấm nút &ldquo;1 2 3 DZÔ!&rdquo; hoặc &ldquo;Uống Bia&rdquo; ở thanh dưới để nâng ly cùng bạn bè.
            </div>
            <div>
              <span className="font-semibold text-stone-100">🍲 Gọi món:</span> Mở Menu để đặt bia và 30 món ăn. Nhân viên Chú Ba phục vụ sẽ bưng khay món dọn lên bàn của bạn!
            </div>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="w-full py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      )}
    </header>
  );
};
