import React from 'react';
import { Beer, Users, Sparkles, MapPin, UtensilsCrossed } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface WelcomeModalProps {
  onlineCount: number;
  onEnter: () => void;
  onCustomize: () => void;
  playerName: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  onlineCount,
  onEnter,
  onCustomize,
  playerName,
}) => {
  const handleStart = () => {
    soundManager.startAmbient();
    soundManager.playGlassClink();
    onEnter();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-amber-600/40 bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/80 shadow-2xl text-stone-100">
        {/* Decorative banner glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-500 to-yellow-400" />
        
        {/* Header content */}
        <div className="p-6 md:p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-amber-300 text-xs font-semibold tracking-wide uppercase">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Quán Nhậu Bờ Sông Nam Bộ
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-serif">
            QUÁN NHẬU ANH ÚT GIÀO
          </h1>

          <p className="text-base md:text-lg text-stone-300 italic">
            &ldquo;Vào quán làm vài ly, gặp bạn bè bốn phương!&rdquo;
          </p>

          <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            Không gian 3D Isometric chuẩn miền Tây Nam Bộ với 10 bàn nhậu, 8 loại bia lạnh, 30 món mồi bén, cụng ly và trò chuyện thời gian thực.
          </p>

          {/* Quick stats badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-lg">
                <Users className="w-4 h-4" />
                <span>{onlineCount}</span>
              </div>
              <div className="text-xs text-stone-400 mt-0.5">Khách đang nhậu</div>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
              <div className="flex items-center justify-center gap-1.5 text-red-400 font-bold text-lg">
                <Beer className="w-4 h-4" />
                <span>10 Bàn</span>
              </div>
              <div className="text-xs text-stone-400 mt-0.5">Bàn Inox 6 Chỗ</div>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-lg">
                <UtensilsCrossed className="w-4 h-4" />
                <span>38 Món</span>
              </div>
              <div className="text-xs text-stone-400 mt-0.5">Mồi bén & Bia ngon</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleStart}
              className="flex-1 py-3.5 px-6 rounded-xl font-bold text-stone-900 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Beer className="w-5 h-5" />
              <span>VÀO QUÁN VỚI TÊN &ldquo;{playerName}&rdquo;</span>
            </button>

            <button
              onClick={onCustomize}
              className="py-3.5 px-5 rounded-xl font-semibold text-stone-200 bg-stone-800/90 hover:bg-stone-700 active:scale-[0.98] border border-stone-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Tạo Nhân Vật</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
