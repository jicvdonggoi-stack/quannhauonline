import React from 'react';
import { Table, Player } from '../types/game';
import { Users, X, Utensils, LogOut, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TableDetailModalProps {
  table: Table;
  myPlayer: Player | null;
  onJoinTable: (tableId: number, seatIndex: number) => void;
  onLeaveTable: () => void;
  onOpenMenu: () => void;
  onClose: () => void;
}

export const TableDetailModal: React.FC<TableDetailModalProps> = ({
  table,
  myPlayer,
  onJoinTable,
  onLeaveTable,
  onOpenMenu,
  onClose,
}) => {
  const isMyTable = myPlayer?.tableId === table.id;
  const occupiedCount = table.seats.filter((s) => s.player !== null).length;
  const freeCount = table.capacity - occupiedCount;

  const handleSeatClick = (seatIndex: number) => {
    if (table.seats[seatIndex].player !== null) return;
    soundManager.playBeerCrack();
    onJoinTable(table.id, seatIndex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border-t sm:border border-amber-600/40 bg-stone-900 shadow-2xl text-stone-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Mobile drag bar */}
        <div className="w-12 h-1 bg-stone-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/90 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {table.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                occupiedCount === 0 ? 'bg-stone-800 text-stone-400' :
                occupiedCount >= table.capacity ? 'bg-red-950 text-red-300 border border-red-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {occupiedCount >= table.capacity ? 'ĐÃ ĐẦY' : occupiedCount === 0 ? 'BÀN TRỐNG' : 'ĐANG CÓ KHÁCH'}
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-0.5">
              {occupiedCount}/{table.capacity} NGƯỜI • Còn {freeCount} chỗ trống
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Seats Layout */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
          <div>
            <div className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-3">
              Danh Sách 6 Ghế Ngồi Quanh Bàn
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {table.seats.map((seat) => {
                const isOccupied = seat.player !== null;
                const isMe = isOccupied && seat.player?.id === myPlayer?.id;

                return (
                  <div
                    key={seat.seatIndex}
                    onClick={() => !isOccupied && handleSeatClick(seat.seatIndex)}
                    className={`relative p-3 rounded-xl border transition-all ${
                      isMe
                        ? 'border-amber-400 bg-amber-500/20 shadow-md shadow-amber-500/10'
                        : isOccupied
                        ? 'border-stone-800 bg-stone-800/40 opacity-90'
                        : 'border-dashed border-stone-700 bg-stone-800/20 hover:border-amber-400/70 hover:bg-stone-800/60 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-stone-400">
                        Ghế #{seat.seatIndex + 1}
                      </span>
                      {isMe ? (
                        <span className="text-[10px] bg-amber-400 text-stone-950 font-extrabold px-1.5 py-0.2 rounded">
                          BẠN
                        </span>
                      ) : isOccupied ? (
                        <span className="text-[10px] text-stone-400 font-medium">Đã ngồi</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-semibold">Còn trống</span>
                      )}
                    </div>

                    {isOccupied ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-stone-100 truncate">
                          {seat.player?.name}
                        </div>
                        <div className="text-[11px] text-amber-400/90 truncate">
                          {seat.player?.avatar.presetName ||
                            (seat.player?.avatar.accessory === 'non_la'
                              ? 'Nón lá'
                              : seat.player?.avatar.accessory === 'khan_ran'
                              ? 'Khăn rằn'
                              : 'Khách quen')}
                        </div>
                      </div>
                    ) : (
                      <div className="py-1 text-center">
                        <span className="text-xs text-amber-300 font-semibold hover:underline">
                          + Kéo ghế ngồi
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table Items & Bill */}
          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Mồi bén & Bia trên bàn:</span>
              <span className="font-semibold text-stone-200">
                {table.itemsOnTable.length} món đã dọn lên
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-300">Tổng hóa đơn bàn:</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {table.totalBill.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {isMyTable ? (
              <>
                <button
                  onClick={onOpenMenu}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-stone-900 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Gọi Món & Bia Cho Bàn</span>
                </button>

                <button
                  onClick={onLeaveTable}
                  className="py-3 px-4 rounded-xl font-semibold text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Rời Bàn</span>
                </button>
              </>
            ) : freeCount > 0 ? (
              <button
                onClick={() => {
                  const firstFree = table.seats.findIndex((s) => s.player === null);
                  if (firstFree !== -1) handleSeatClick(firstFree);
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-stone-900 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kéo Ghế Tham Gia Bàn Này</span>
              </button>
            ) : (
              <div className="w-full py-2.5 text-center text-xs text-red-400 bg-red-950/30 rounded-xl border border-red-900/40 font-medium">
                Bàn này đã đầy 6/6 khách. Vui lòng chọn bàn khác!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
