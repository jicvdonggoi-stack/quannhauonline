import React, { useState } from 'react';
import { MENU_ITEMS, CATEGORY_LABELS } from '../data/menuData';
import { MenuCategory, MenuItem } from '../types/game';
import { Utensils, X, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface OrderMenuModalProps {
  tableId: number;
  tableName: string;
  onOrder: (items: Array<{ itemId: string; quantity: number }>) => void;
  onClose: () => void;
}

export const OrderMenuModal: React.FC<OrderMenuModalProps> = ({
  tableId,
  tableName,
  onOrder,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<MenuCategory>('beer');
  const [cart, setCart] = useState<Record<string, number>>({});

  const categories = Object.keys(CATEGORY_LABELS) as MenuCategory[];
  const currentItems = MENU_ITEMS.filter((item) => item.category === activeTab);

  const updateQuantity = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const current = prev[item.id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: next };
    });
    if (delta > 0) {
      if (item.category === 'beer') soundManager.playBeerCrack();
      else soundManager.playGlassClink();
    }
  };

  const totalItemCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const totalCartPrice = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = MENU_ITEMS.find((m) => m.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleConfirmOrder = () => {
    if (totalItemCount === 0) return;
    const itemsPayload = Object.entries(cart).map(([itemId, quantity]) => ({
      itemId,
      quantity,
    }));
    soundManager.playOrderChime();
    onOrder(itemsPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[94vh] sm:h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl border-t sm:border border-stone-700 bg-stone-900 shadow-2xl text-stone-100 overflow-hidden">
        {/* Mobile drag handle */}
        <div className="w-12 h-1 bg-stone-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-800 bg-stone-950/90 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-amber-300">Menu Quán Anh Út Giào</h2>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  {tableName}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Bia ướp xô đá • Nước giải khát • 30 món mồi bén
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto border-b border-stone-800 bg-stone-950/40 px-4 py-2 gap-1.5 scrollbar-none shrink-0">
          {categories.map((catKey) => {
            const cat = CATEGORY_LABELS[catKey];
            const isActive = activeTab === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveTab(catKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider mb-2">
            {CATEGORY_LABELS[activeTab].desc}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentItems.map((item) => {
              const qty = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    qty > 0
                      ? 'border-amber-500/70 bg-amber-500/10'
                      : 'border-stone-800 bg-stone-800/40 hover:bg-stone-800/70 hover:border-stone-700'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-bold border border-stone-700">
                        {item.imageBadge}
                      </span>
                      <h4 className="text-sm font-bold text-stone-100 truncate">{item.name}</h4>
                    </div>
                    <p className="text-xs text-stone-400 line-clamp-1 mt-1">{item.description}</p>
                    <div className="text-sm font-extrabold text-amber-400 font-mono mt-1">
                      {item.price.toLocaleString('vi-VN')} đ{' '}
                      <span className="text-[11px] font-normal text-stone-500">/ {item.unit}</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-stone-900/80 border border-stone-700/80 rounded-xl p-1">
                    <button
                      type="button"
                      disabled={qty === 0}
                      onClick={() => updateQuantity(item, -1)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono text-stone-100">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, 1)}
                      className="p-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-stone-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart Drawer / Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <ShoppingCart className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </div>
            <div>
              <div className="text-xs text-stone-400">
                {totalItemCount === 0 ? 'Chưa chọn món nào' : `Đã chọn ${totalItemCount} phần`}
              </div>
              <div className="text-lg font-black text-amber-400 font-mono">
                {totalCartPrice.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {totalItemCount > 0 && (
              <button
                type="button"
                onClick={() => setCart({})}
                className="px-3.5 py-2.5 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-medium cursor-pointer"
              >
                Xóa giỏ
              </button>
            )}
            <button
              type="button"
              disabled={totalItemCount === 0}
              onClick={handleConfirmOrder}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-stone-900 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Check className="w-4 h-4" />
              <span>GỬI ĐƠN CHO NHÂN VIÊN MANG LÊN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
