import React, { useState, useEffect } from 'react';
import { Beer, Dices, Disc, Sparkles, X, RotateCcw, Volume2, Trophy } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface DrinkingMinigamesModalProps {
  initialTab?: 'clicker' | 'dice' | 'wheel' | 'fortune';
  onClose: () => void;
  onAnnounceChat?: (text: string) => void;
}

const WHEEL_SEGMENTS = [
  { label: 'Uống 100% 🍻', color: '#ef4444' },
  { label: 'Người bên phải uống ➡️', color: '#f59e0b' },
  { label: 'Hát 1 câu vọng cổ 🎤', color: '#10b981' },
  { label: 'Uống 50% nửa ly 🍺', color: '#3b82f6' },
  { label: 'Qua tua may mắn ✨', color: '#8b5cf6' },
  { label: 'Kể 1 chuyện vui 🤣', color: '#ec4899' },
  { label: 'Chỉ định 1 người 🎯', color: '#f97316' },
  { label: 'Cả bàn cùng 1 2 3 DZÔ! 🎉', color: '#dc2626' },
];

const FORTUNES = [
  { title: 'Quẻ Thượng Thượng: Sông Nước Hào Sảng', desc: 'Hôm nay mồi bén cá lóc thơm lừng, bạn hiền hội ngộ, tài lộc dồi dào như nước phù sa sông Tiền sông Hậu!', action: 'Mời cả bàn một ly đầy!' },
  { title: 'Quẻ Đại Cát: Tiền Vô Như Nước', desc: 'Công việc sắp tới hanh thông thuận lợi, buôn may bán đắt, anh em đồng lòng tát biển Đông cũng cạn.', action: 'Uống nửa ly mừng vận may!' },
  { title: 'Quẻ Tình Duyên: Duyên Thắm Bến Đò', desc: 'Có người thầm thương trộm nhớ, như hoa lục bình trôi gặp nhánh sông hiền. Nhậu xong nhớ nhắn tin hỏi thăm.', action: 'Cười tươi và cụng ly!' },
  { title: 'Quẻ Tri Kỷ: Nghĩa Tình Miền Tây', desc: 'Ngồi chung bàn nhậu là cái duyên, uống cạn ly này mai sau gặp lại vẫn là anh em chí cốt.', action: 'Hô to 1, 2, 3 DZÔÔÔ!' },
  { title: 'Quẻ Bình An: Về Nhà An Vui', desc: 'Nhậu vui vẻ không quậy phá, biết điểm dừng là bậc cao thủ. Say mồi chứ đừng say xỉn quá đà!', action: 'Uống một ngụm trà đá thanh nhiệt.' },
];

export const DrinkingMinigamesModal: React.FC<DrinkingMinigamesModalProps> = ({
  initialTab = 'clicker',
  onClose,
  onAnnounceChat,
}) => {
  const [activeTab, setActiveTab] = useState<'clicker' | 'dice' | 'wheel' | 'fortune'>(initialTab);

  // --- Clicker state (Gõ Ly Tích Điểm Sảng Khoái) ---
  const [beerPoints, setBeerPoints] = useState(() => {
    try {
      return parseInt(localStorage.getItem('sang_khoai_points') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [floatingTexts, setFloatingTexts] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);
  const [isPouring, setIsPouring] = useState(false);

  // --- Dice state ---
  const [dices, setDices] = useState<[number, number, number]>([3, 4, 5]);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResultText, setDiceResultText] = useState('Bấm nút để lắc 3 hột xúc xắc!');

  // --- Wheel state ---
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  // --- Fortune state ---
  const [currentFortune, setCurrentFortune] = useState(FORTUNES[0]);
  const [isShakingFortune, setIsShakingFortune] = useState(false);

  // Clicker Handler
  const handlePourClick = (e: React.MouseEvent<HTMLDivElement>) => {
    soundManager.playPourBeer();
    const newPoints = beerPoints + 1;
    setBeerPoints(newPoints);
    try {
      localStorage.setItem('sang_khoai_points', newPoints.toString());
    } catch {
      // ignore
    }

    setIsPouring(true);
    setTimeout(() => setIsPouring(false), 200);

    // Add floating text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() - 0.5) * 40;
    const y = e.clientY - rect.top;
    const shouts = ['+1 DZÔ! 🍻', '+10 Sảng Khoái! ✨', 'Mát Rượi! 🧊', 'Tràn Bọt! 🍺'];
    const text = shouts[Math.floor(Math.random() * shouts.length)];

    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1000);
  };

  // Dice Roller
  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    soundManager.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setDices([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      count++;
      if (count > 8) {
        clearInterval(interval);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        setDices([d1, d2, d3]);
        setIsRolling(false);

        const total = d1 + d2 + d3;
        let res = `Tổng: ${total} điểm (${total >= 11 ? 'TÀI' : 'XỈU'}) - `;
        if (d1 === d2 && d2 === d3) {
          res += '🎉 BÃO ĐỒNG CHẤT! Cả bàn đứng dậy 1 2 3 DZÔÔÔ!';
        } else if (total % 2 === 0) {
          res += '👉 Điểm CHẴN: Người ngồi bên PHẢI uống 1 ly!';
        } else {
          res += '👈 Điểm LẺ: Người ngồi bên TRÁI uống 1 ly!';
        }
        setDiceResultText(res);
        onAnnounceChat?.(`🎲 Lắc xí ngầu [${d1}, ${d2}, ${d3}] -> ${res}`);
      }
    }, 80);
  };

  // Wheel Spinner
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelResult(null);

    const randomAngle = 1440 + Math.floor(Math.random() * 360);
    const newTotal = wheelRotation + randomAngle;
    setWheelRotation(newTotal);

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundManager.playWheelClick();
      tickCount++;
      if (tickCount > 18) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      setIsSpinning(false);
      soundManager.playCheers();
      const normalizedAngle = (360 - (newTotal % 360)) % 360;
      const index = Math.floor(normalizedAngle / (360 / WHEEL_SEGMENTS.length));
      const chosen = WHEEL_SEGMENTS[index].label;
      setWheelResult(chosen);
      onAnnounceChat?.(`🎯 Vòng quay bàn nhậu dừng tại: [${chosen}]`);
    }, 3200);
  };

  // Fortune Shaker
  const handleShakeFortune = () => {
    if (isShakingFortune) return;
    setIsShakingFortune(true);
    soundManager.playGlassClink();

    setTimeout(() => {
      const nextFortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      setCurrentFortune(nextFortune);
      setIsShakingFortune(false);
      soundManager.playDonCaTaiTu();
      onAnnounceChat?.(`📜 Rút được [${nextFortune.title}]: ${nextFortune.desc}`);
    }, 1200);
  };

  const getRankTitle = (pts: number) => {
    if (pts < 50) return 'Tập Sự Bàn Nhậu 🌱';
    if (pts < 200) return 'Dân Nhậu Miệt Vườn 🌾';
    if (pts < 500) return 'Bợm Nhậu Sông Tiền 🌊';
    if (pts < 1000) return 'Cao Thủ 100% Không Say 🍻';
    return 'Thần Cồn Sông Mekong 👑';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border-t sm:border border-amber-600/50 bg-stone-900 shadow-2xl text-stone-100 overflow-hidden">
        {/* Mobile drag handle */}
        <div className="w-12 h-1 bg-stone-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-800 bg-stone-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300">Trò Chơi Bàn Nhậu Miền Tây</h2>
              <p className="text-[11px] sm:text-xs text-stone-400">Rót bia tích điểm • Lắc xí ngầu • Vòng quay • Rút quẻ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex overflow-x-auto border-b border-stone-800 bg-stone-950/40 px-3 sm:px-4 py-2 gap-1.5 scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('clicker')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
              activeTab === 'clicker'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Beer className="w-3.5 h-3.5" />
            <span>Rót Bia Tích Điểm</span>
          </button>

          <button
            onClick={() => setActiveTab('dice')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
              activeTab === 'dice'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Lắc Xí Ngầu</span>
          </button>

          <button
            onClick={() => setActiveTab('wheel')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'wheel'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>Vòng Quay Sát Phạt</span>
          </button>

          <button
            onClick={() => setActiveTab('fortune')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'fortune'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Rút Quẻ May Mắn</span>
          </button>
        </div>

        {/* Tab 1: Clicker (Gõ ly tích điểm) */}
        {activeTab === 'clicker' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{getRankTitle(beerPoints)}</span>
            </div>

            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              {beerPoints.toLocaleString()} <span className="text-sm font-sans font-normal text-stone-400">Điểm Sảng Khoái</span>
            </div>

            <p className="text-xs text-stone-400 max-w-sm">
              Nhấp liên tục vào ly bia khổng lồ để rót bia sủi bọt, nghe tiếng xì bọt mát lạnh và tích điểm sảng khoái (tương tự như gõ mõ online)!
            </p>

            {/* Giant interactive Beer Mug */}
            <div
              onClick={handlePourClick}
              className={`relative cursor-pointer transition-transform select-none active:scale-95 ${
                isPouring ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              <div className="w-44 h-52 rounded-3xl bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 border-4 border-amber-300/60 shadow-2xl shadow-amber-500/20 flex flex-col justify-between p-3 relative overflow-hidden">
                {/* Thick foam head */}
                <div className="w-full h-12 bg-white rounded-2xl shadow-md border-b-2 border-stone-200/50 flex items-center justify-center gap-1.5 text-xs font-black text-amber-800 tracking-wider">
                  BỌT BIA MỊN
                </div>

                {/* Bubbles */}
                <div className="flex justify-around opacity-75">
                  <span className="w-2 h-2 rounded-full bg-white/70 animate-bounce" />
                  <span className="w-3 h-3 rounded-full bg-white/60 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-white/80 animate-ping" />
                </div>

                <div className="text-center font-extrabold text-stone-900 text-sm tracking-wide bg-amber-300/40 py-1 rounded-xl">
                  BẤM ĐỂ RÓT BIA!
                </div>
              </div>

              {/* Floating texts */}
              {floatingTexts.map((item) => (
                <div
                  key={item.id}
                  className="absolute pointer-events-none text-sm font-black text-amber-300 animate-out fade-out slide-out-to-top duration-1000"
                  style={{ left: `${item.x}px`, top: `${item.y - 20}px` }}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Dice Game */}
        {activeTab === 'dice' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-100">Lắc 3 Hột Xúc Xắc Ăn Nhậu</h3>
              <p className="text-xs text-stone-400 mt-1">
                Kinh điển bàn nhậu miền Tây: Điểm chẵn người bên phải uống, điểm lẻ người bên trái uống!
              </p>
            </div>

            {/* 3 Dices */}
            <div className="flex gap-4">
              {dices.map((num, i) => (
                <div
                  key={i}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-300 text-stone-950 font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl border-2 border-amber-400/80 transition-all ${
                    isRolling ? 'animate-spin scale-110' : 'hover:scale-105'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Result text */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-sm font-bold text-amber-300 max-w-md w-full">
              {diceResultText}
            </div>

            <button
              onClick={handleRollDice}
              disabled={isRolling}
              className="py-3 px-8 rounded-2xl font-bold text-stone-900 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-95 transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer text-sm"
            >
              <Dices className="w-5 h-5" />
              <span>{isRolling ? 'ĐANG LẮC...' : 'LẮC XÍ NGẦU'}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Wheel of Drinking */}
        {activeTab === 'wheel' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-5">
            <div>
              <h3 className="text-base font-bold text-stone-100">Vòng Xoay Sát Phạt Bàn Nhậu</h3>
              <p className="text-xs text-stone-400 mt-1">Quay để xem ai uống, ai hát hoặc ai được tha!</p>
            </div>

            {/* Wheel Canvas / SVG */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              {/* Pointer indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow" />

              {/* Rotating disk */}
              <div
                className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl relative overflow-hidden transition-transform ease-out"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transitionDuration: isSpinning ? '3.2s' : '0s',
                }}
              >
                {WHEEL_SEGMENTS.map((seg, idx) => {
                  const angle = (360 / WHEEL_SEGMENTS.length) * idx;
                  return (
                    <div
                      key={idx}
                      className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white select-none"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: '50% 50%',
                      }}
                    >
                      <div
                        className="absolute top-2 px-2 py-0.5 rounded shadow text-center max-w-[90px] leading-tight"
                        style={{ backgroundColor: seg.color }}
                      >
                        {seg.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center hub button */}
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-xl flex items-center justify-center cursor-pointer active:scale-90 border-2 border-stone-900"
              >
                QUAY
              </button>
            </div>

            {wheelResult && (
              <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-sm font-black text-amber-300 animate-in zoom-in">
                Kết quả: {wheelResult}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Fortunes */}
        {activeTab === 'fortune' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-5">
            <div>
              <h3 className="text-base font-bold text-stone-100">Gieo Quẻ Đầu Năm & Vui Bàn Nhậu</h3>
              <p className="text-xs text-stone-400 mt-1">Rút một quẻ để xem vận may, tài lộc, tình bạn hôm nay</p>
            </div>

            {/* Fortune Card */}
            <div className={`p-6 rounded-3xl bg-gradient-to-b from-stone-800 to-stone-950 border-2 border-amber-500/60 shadow-2xl max-w-md w-full space-y-3 transition-all ${
              isShakingFortune ? 'animate-bounce' : ''
            }`}>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
                ⭐ Quẻ Nam Bộ ⭐
              </div>

              <h4 className="text-lg font-extrabold text-amber-200 font-serif">
                {currentFortune.title}
              </h4>

              <p className="text-xs text-stone-300 leading-relaxed italic">
                &ldquo;{currentFortune.desc}&rdquo;
              </p>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300">
                Thực hiện: {currentFortune.action}
              </div>
            </div>

            <button
              onClick={handleShakeFortune}
              disabled={isShakingFortune}
              className="py-3 px-8 rounded-2xl font-bold text-stone-900 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 active:scale-95 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isShakingFortune ? 'ĐANG LẮC ỐNG QUẺ...' : 'LẮC QUẺ MỚI'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
