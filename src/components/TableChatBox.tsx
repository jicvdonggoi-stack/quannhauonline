import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Player } from '../types/game';
import { MessageSquare, Send, Sparkles, X, ChevronUp, ChevronDown } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TableChatBoxProps {
  tableId: number;
  tableName: string;
  messages: ChatMessage[];
  myPlayer: Player | null;
  onSendMessage: (text: string, type?: 'text' | 'shout' | 'cheers') => void;
  onTriggerAction: (action: string) => void;
  onClose?: () => void;
}

const QUICK_SHOUTS = [
  '1, 2, 3 DZÔÔÔ! 🍻',
  'Cạn ly anh em ơi! 🥂',
  'Mời cả bàn một ly!',
  'Mồi bén quá trời bén!',
  'Làm thêm kết bia nữa đê!',
];

const QUICK_EMOJIS = ['🍻', '🍺', '🔥', '🎉', '😂', '😀', '👍', '❤️'];

export const TableChatBox: React.FC<TableChatBoxProps> = ({
  tableName,
  messages,
  myPlayer,
  onSendMessage,
  onTriggerAction,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    onSendMessage(text, 'text');
    setInputText('');
  };

  const handleQuickShout = (shout: string) => {
    soundManager.playCheers();
    onTriggerAction('cheers');
    onSendMessage(shout, 'shout');
  };

  const handleEmoji = (emoji: string) => {
    onSendMessage(emoji, 'text');
  };

  return (
    <div className="fixed inset-x-0 bottom-0 sm:bottom-24 sm:right-4 sm:left-auto sm:w-96 z-40 max-h-[75vh] sm:max-h-[520px] rounded-t-3xl sm:rounded-2xl border-t sm:border border-stone-700/80 bg-stone-900/98 backdrop-blur-xl shadow-2xl flex flex-col text-stone-100 overflow-hidden transition-all duration-300">
      {/* Mobile drag bar */}
      <div className="w-12 h-1 bg-stone-700 rounded-full mx-auto my-1.5 sm:hidden" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300">Trò Chuyện • {tableName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 cursor-pointer hidden sm:block"
            title="Thu gọn chat"
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 cursor-pointer"
              title="Đóng chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Quick Shouts Bar */}
          <div className="flex overflow-x-auto gap-1.5 px-3 py-2 bg-stone-950/60 border-b border-stone-800 scrollbar-none">
            {QUICK_SHOUTS.map((shout) => (
              <button
                key={shout}
                onClick={() => handleQuickShout(shout)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 whitespace-nowrap active:scale-95 transition-transform cursor-pointer shrink-0"
              >
                {shout}
              </button>
            ))}
          </div>

          {/* Messages List */}
          <div className="flex-1 min-h-[160px] max-h-[42vh] sm:h-56 overflow-y-auto p-3 space-y-2.5 text-xs overscroll-contain">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-500 text-center py-6">
                Chưa có tin nhắn nào. Hãy gửi lời chào hoặc hô &ldquo;1, 2, 3 DZÔ!&rdquo;
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === myPlayer?.id;
                const isSystem = msg.type === 'system';
                const isShout = msg.type === 'shout';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center text-[11px] text-amber-400/80 italic py-1">
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-stone-400">
                      <span className="font-bold text-stone-300">{msg.senderName}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                        isShout
                          ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-sm shadow-md'
                          : isMe
                          ? 'bg-amber-500 text-stone-950 font-medium rounded-br-none'
                          : 'bg-stone-800 text-stone-100 rounded-bl-none border border-stone-700/60'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji row */}
          <div className="flex items-center justify-around px-2 py-1.5 bg-stone-950/70 border-t border-stone-800">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmoji(emoji)}
                className="text-lg p-1 hover:scale-125 active:scale-95 transition-transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input form */}
          <div className="p-2 sm:p-2.5 bg-stone-950 border-t border-stone-800 flex items-center gap-2 pb-safe">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhắn tin với anh em trong bàn..."
              maxLength={120}
              className="flex-1 px-3 py-2.5 rounded-xl bg-stone-800 text-sm sm:text-xs text-stone-100 placeholder-stone-500 border border-stone-700 focus:border-amber-500 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 disabled:opacity-40 disabled:hover:bg-amber-500 cursor-pointer shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
