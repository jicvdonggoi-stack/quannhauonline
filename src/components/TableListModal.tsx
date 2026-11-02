import React from 'react';
import { Table, Player } from '../types/game';
import { X, Users, MapPin, ChevronRight } from 'lucide-react';

interface TableListModalProps {
  tables: Table[];
  myPlayer: Player | null;
  onSelectTable: (tableId: number) => void;
  onClose: () => void;
}

export const TableListModal: React.FC<TableListModalProps> = ({
  tables,
  myPlayer,
  onSelectTable,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-stone-700 bg-stone-900 shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-300">Sơ Đồ 10 Bàn Quán Anh Út Giào</h2>
              <p className="text-xs text-stone-400">Chọn bàn để tham gia hoặc quan sát hoạt động</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tables list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tables.map((table) => {
            const count = table.seats.filter((s) => s.player !== null).length;
            const isMyTable = myPlayer?.tableId === table.id;

            return (
              <div
                key={table.id}
                onClick={() => {
                  onSelectTable(table.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  isMyTable
                    ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10'
                    : 'border-stone-800 bg-stone-800/40 hover:border-stone-600 hover:bg-stone-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-100">{table.name}</span>
                    {isMyTable && (
                      <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded">
                        BÀN CỦA BẠN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>{count}/6 khách</span>
                    <span>•</span>
                    <span className="text-amber-400 font-mono">
                      {table.totalBill > 0 ? `${table.totalBill.toLocaleString('vi-VN')} đ` : 'Chưa gọi món'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                      count >= table.capacity
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : count === 0
                        ? 'bg-stone-800 text-stone-400'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {count >= table.capacity ? 'Hết chỗ' : count === 0 ? 'Trống' : `${6 - count} chỗ trống`}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
