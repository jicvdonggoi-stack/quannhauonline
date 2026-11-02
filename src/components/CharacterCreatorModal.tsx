import React, { useState } from 'react';
import { AvatarConfig, AccessoryType } from '../types/game';
import { User, Check, Sparkles, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CharacterCreatorModalProps {
  initialConfig: AvatarConfig;
  initialName: string;
  onSave: (name: string, config: AvatarConfig) => void;
  onClose?: () => void;
}

const PRESET_CHARACTERS: Array<{ name: string; avatar: AvatarConfig; title: string }> = [
  {
    title: 'Chú Hai Miệt Vườn',
    name: 'Chú Hai Vĩnh Long',
    avatar: {
      gender: 'male',
      skinColor: '#8d5524',
      hairStyle: 'classic',
      hairColor: '#2b2b2b',
      shirtColor: '#3d405b',
      pantsColor: '#1a1a1a',
      accessory: 'non_la',
      presetName: 'Chú Hai Miệt Vườn',
    },
  },
  {
    title: 'Anh Bảy Bến Tre',
    name: 'Anh Bảy Dừa',
    avatar: {
      gender: 'male',
      skinColor: '#c68642',
      hairStyle: 'short',
      hairColor: '#1a1a1a',
      shirtColor: '#e07a5f',
      pantsColor: '#3d405b',
      accessory: 'khan_ran',
      presetName: 'Anh Bảy Bến Tre',
    },
  },
  {
    title: 'Cô Ba Cần Thơ',
    name: 'Cô Ba Ninh Kiều',
    avatar: {
      gender: 'female',
      skinColor: '#f1c27d',
      hairStyle: 'tied',
      hairColor: '#1a1a1a',
      shirtColor: '#f4a261',
      pantsColor: '#264653',
      accessory: 'none',
      presetName: 'Cô Ba Cần Thơ',
    },
  },
  {
    title: 'Dân Chơi Miệt Vườn',
    name: 'Út Sang Cà Mau',
    avatar: {
      gender: 'male',
      skinColor: '#e0ac69',
      hairStyle: 'stylish',
      hairColor: '#3d2612',
      shirtColor: '#2a9d8f',
      pantsColor: '#264653',
      accessory: 'sunglasses',
      presetName: 'Dân Chơi Miệt Vườn',
    },
  },
  {
    title: 'Hai Lúa Đồng Tháp',
    name: 'Hai Lúa Tràm Chim',
    avatar: {
      gender: 'male',
      skinColor: '#8d5524',
      hairStyle: 'short',
      hairColor: '#1a1a1a',
      shirtColor: '#1e3a8a',
      pantsColor: '#1f2937',
      accessory: 'non_la',
      presetName: 'Hai Lúa Đồng Tháp',
    },
  },
];

const SKIN_COLORS = ['#ffd1a4', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
const HAIR_COLORS = ['#111827', '#451a03', '#78350f', '#4b5563', '#d97706'];
const SHIRT_COLORS = ['#3d405b', '#e07a5f', '#f4a261', '#2a9d8f', '#1e3a8a', '#b91c1c', '#047857', '#4f46e5'];
const PANTS_COLORS = ['#111827', '#1f2937', '#374151', '#264653', '#1e293b'];

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  initialConfig,
  initialName,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialName || 'Út Nhậu');
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectPreset = (preset: (typeof PRESET_CHARACTERS)[0]) => {
    setName(preset.name);
    setConfig({ ...preset.avatar });
    soundManager.playGlassClink();
  };

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErrorMsg('Tên nhân vật phải có ít nhất 2 ký tự.');
      return;
    }
    if (trimmed.length > 16) {
      setErrorMsg('Tên nhân vật tối đa 16 ký tự.');
      return;
    }
    setErrorMsg('');
    soundManager.playBeerCrack();
    onSave(trimmed, config);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto rounded-2xl border border-stone-700 bg-stone-900 shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-300">Tạo Nhân Vật Quán Nhậu</h2>
              <p className="text-xs text-stone-400">Chọn ngoại hình và phong cách miền Tây</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5">
              Mẫu Nhân Vật Có Sẵn
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_CHARACTERS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    config.presetName === preset.avatar.presetName
                      ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30'
                      : 'border-stone-800 bg-stone-800/40 hover:bg-stone-800/80 hover:border-stone-700'
                  }`}
                >
                  <div className="text-sm font-semibold text-stone-200">{preset.title}</div>
                  <div className="text-xs text-amber-400/80 mt-0.5">
                    {preset.avatar.accessory === 'non_la'
                      ? '🌾 Nón lá'
                      : preset.avatar.accessory === 'khan_ran'
                      ? '🏁 Khăn rằn'
                      : preset.avatar.accessory === 'sunglasses'
                      ? '🕶️ Kính mát'
                      : '✨ Duyên dáng'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Tên Nhân Vật (2 - 16 ký tự)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              maxLength={16}
              placeholder="Ví dụ: Út Lúa, Chú Bảy, Anh Ba..."
              className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-100 placeholder-stone-500 outline-none transition-all"
            />
            {errorMsg && <p className="text-xs text-red-400 mt-1.5">{errorMsg}</p>}
          </div>

          {/* Accessories */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Phụ Kiện Miền Tây
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'none' as AccessoryType, label: 'Không có', icon: '👤' },
                { type: 'non_la' as AccessoryType, label: 'Nón Lá', icon: '🌾' },
                { type: 'khan_ran' as AccessoryType, label: 'Khăn Rằn', icon: '🏁' },
                { type: 'sunglasses' as AccessoryType, label: 'Kính Mát', icon: '🕶️' },
              ].map((acc) => (
                <button
                  key={acc.type}
                  type="button"
                  onClick={() => setConfig({ ...config, accessory: acc.type, presetName: undefined })}
                  className={`py-2.5 px-2 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                    config.accessory === acc.type
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-stone-800 bg-stone-800/40 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div className="text-base mb-1">{acc.icon}</div>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes (Skin, Shirt, Pants) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Skin */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-2">Màu Da</label>
              <div className="flex gap-2">
                {SKIN_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setConfig({ ...config, skinColor: color, presetName: undefined })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      config.skinColor === color ? 'border-amber-400 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Shirt */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-2">Màu Áo Bà Ba / Thun</label>
              <div className="flex flex-wrap gap-1.5">
                {SHIRT_COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setConfig({ ...config, shirtColor: color, presetName: undefined })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      config.shirtColor === color ? 'border-amber-400 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Pants */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-2">Màu Quần</label>
              <div className="flex gap-2">
                {PANTS_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setConfig({ ...config, pantsColor: color, presetName: undefined })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      config.pantsColor === color ? 'border-amber-400 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-800 bg-stone-950/60">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-stone-200 text-sm font-medium"
            >
              Hủy
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl font-bold text-stone-900 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer text-sm"
          >
            <Check className="w-4 h-4" />
            <span>Xác Nhận Nhân Vật</span>
          </button>
        </div>
      </div>
    </div>
  );
};
