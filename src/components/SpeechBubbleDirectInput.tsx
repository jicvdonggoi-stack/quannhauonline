import React, { useState, useRef } from 'react';
import { Send, MessageCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface SpeechBubbleDirectInputProps {
  tableName?: string;
  hasTable: boolean;
  onSendMessage: (text: string, type?: 'text' | 'shout' | 'cheers') => void;
  onTriggerAction?: (action: string) => void;
}

const QUICK_PUB_SHOUTS = [
  { text: '🍻 1, 2, 3 DZÔÔÔ!', type: 'shout' as const, action: 'cheers' },
  { text: '🍺 Khà... Bia mát lạnh!', type: 'text' as const, action: 'drink' },
  { text: '🥂 Cạn ly trăm phần trăm nha!', type: 'shout' as const, action: 'cheers' },
  { text: '🍲 Chú Ba ơi cho thêm dĩa mồi!', type: 'text' as const },
  { text: '🎶 Bác Sáu đờn bài nữa đi bác!', type: 'text' as const },
  { text: '🔥 Mồi bén quá trời bén!', type: 'text' as const },
  { text: '🤣 Haha vui quá anh em ơi!', type: 'text' as const, action: 'laugh' },
  { text: '👋 Chào cả bàn nghen!', type: 'text' as const, action: 'wave' },
];

const QUICK_EMOJIS = ['🍻', '🍺', '🥂', '🔥', '🤣', '👍', '❤️'];

export const SpeechBubbleDirectInput: React.FC<SpeechBubbleDirectInputProps> = ({
  tableName,
  hasTable,
  onSendMessage,
  onTriggerAction,
}) => {
  const [inputText, setInputText] = useState('');
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    onSendMessage(text, 'text');
    setInputText('');
  };

  const handleQuickShout = (item: (typeof QUICK_PUB_SHOUTS)[0]) => {
    if (item.action) {
      if (item.action === 'cheers') soundManager.playCheers();
      else if (item.action === 'drink') soundManager.playGlassClink();
      onTriggerAction?.(item.action);
    }
    onSendMessage(item.text, item.type);
  };

  const handleEmojiClick = (emoji: string) => {
    onSendMessage(emoji, 'text');
  };

  return (
    <div className="fixed bottom-16 sm:bottom-22 left-1/2 -translate-x-1/2 z-35 w-full max-w-[min(680px,96vw)] px-2 pointer-events-none flex flex-col items-center">
      {/* Quick speech phrase chips */}
      <div
        className={`pointer-events-auto w-full transition-all duration-200 overflow-hidden ${
          showQuickPhrases ? 'max-h-40 opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'
        }`}
      >
        <div className="p-2 sm:p-2.5 rounded-2xl bg-stone-950/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Câu Nói Quán Nhậu Miền Tây Nhanh (Hiện ngay bóng thoại 3D):
            </span>
            <div className="flex items-center gap-1">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="hover:scale-125 active:scale-95 transition-transform text-sm cursor-pointer p-0.5"
                  title={`Thả biểu cảm ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none py-0.5">
            {QUICK_PUB_SHOUTS.map((item) => (
              <button
                key={item.text}
                onClick={() => handleQuickShout(item)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-sm ${
                  item.type === 'shout'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border border-red-400/50'
                    : 'bg-stone-800/90 hover:bg-stone-700 text-amber-200 border border-stone-600/60'
                }`}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main sleek speech input pill */}
      <div className="pointer-events-auto w-full p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-stone-950/92 backdrop-blur-xl border border-amber-500/40 shadow-2xl flex items-center gap-1.5 sm:gap-2">
        {/* Toggle quick phrases button */}
        <button
          onClick={() => setShowQuickPhrases((prev) => !prev)}
          className={`px-2.5 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 ${
            showQuickPhrases
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-800 text-amber-300 hover:bg-stone-700 border border-stone-700'
          }`}
          title="Mở danh sách câu nói nhanh miền Tây"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Câu Nhanh</span>
          {showQuickPhrases ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Input box */}
        <div className="relative flex-1 flex items-center min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              hasTable
                ? `💬 Nói ở ${tableName || 'bàn của bạn'} (Hiện bóng thoại 3D)...`
                : '💬 Hô với cả quán (Hiện bóng thoại 3D)...'
            }
            maxLength={100}
            className="w-full px-3 py-2 rounded-xl sm:rounded-full bg-stone-900/90 text-stone-100 placeholder-stone-400 text-xs sm:text-sm border border-stone-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 outline-none transition-all"
          />
        </div>

        {/* Quick shout trigger shortcut */}
        <button
          onClick={() => handleQuickShout(QUICK_PUB_SHOUTS[0])}
          className="hidden sm:flex px-2.5 py-2 rounded-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-[11px] active:scale-95 cursor-pointer shadow items-center gap-1 shrink-0 whitespace-nowrap"
          title="Hô 1, 2, 3 DZÔ!"
        >
          <span>🍻 DZÔ!</span>
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="px-3.5 py-2 rounded-xl sm:rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md transition-all shrink-0"
          title="Gửi câu nói lên bóng thoại 3D"
        >
          <span className="hidden xs:inline">Nói</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
