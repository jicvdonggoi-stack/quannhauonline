import * as THREE from 'three';

export interface NameBadgeOptions {
  name: string;
  isSelf?: boolean;
  roleType?: 'self' | 'guest' | 'waiter' | 'musician' | 'chef';
  roleTag?: string;
  tableText?: string;
  actionText?: string;
}

export function drawNameBadgeCanvas(canvas: HTMLCanvasElement, options: NameBadgeOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Clear background
  ctx.clearRect(0, 0, w, h);

  const {
    name,
    isSelf = false,
    roleType = isSelf ? 'self' : 'guest',
    roleTag,
    tableText,
    actionText,
  } = options;

  // Pill container geometry
  const padX = 16;
  const padY = 12;
  const boxW = w - padX * 2;
  const boxH = h - padY * 2;
  const radius = 22;

  // Shadow for 3D depth and readability against any backdrop
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  // Badge background gradient
  const grad = ctx.createLinearGradient(padX, padY, padX + boxW, padY + boxH);
  let strokeColor = 'rgba(245, 158, 11, 0.85)'; // Default warm amber
  let defaultTag = '🍺 KHÁCH NHẬU';
  let tagBg = 'rgba(245, 158, 11, 0.25)';
  let tagTextColor = '#fbbf24';
  let nameColor = '#ffffff';

  if (isSelf || roleType === 'self') {
    grad.addColorStop(0, 'rgba(6, 78, 59, 0.95)'); // Emerald 900
    grad.addColorStop(1, 'rgba(4, 120, 87, 0.95)'); // Emerald 700
    strokeColor = 'rgba(52, 211, 153, 0.95)'; // Bright Emerald
    defaultTag = '⭐ BẠN';
    tagBg = 'rgba(52, 211, 153, 0.35)';
    tagTextColor = '#6ee7b7';
    nameColor = '#ffffff';
  } else if (roleType === 'waiter') {
    grad.addColorStop(0, 'rgba(30, 27, 75, 0.95)'); // Indigo 950
    grad.addColorStop(1, 'rgba(67, 56, 202, 0.95)'); // Indigo 600
    strokeColor = 'rgba(251, 191, 36, 0.95)'; // Amber/Gold
    defaultTag = '🛎️ PHỤC VỤ';
    tagBg = 'rgba(251, 191, 36, 0.3)';
    tagTextColor = '#fde68a';
    nameColor = '#fef08a';
  } else if (roleType === 'musician') {
    grad.addColorStop(0, 'rgba(59, 7, 100, 0.95)'); // Purple 950
    grad.addColorStop(1, 'rgba(107, 33, 168, 0.95)'); // Purple 700
    strokeColor = 'rgba(192, 132, 252, 0.95)'; // Lavender
    defaultTag = '🎶 ĐỜN CA TÀI TỬ';
    tagBg = 'rgba(192, 132, 252, 0.3)';
    tagTextColor = '#e9d5ff';
    nameColor = '#f3e8ff';
  } else if (roleType === 'chef') {
    grad.addColorStop(0, 'rgba(69, 10, 10, 0.95)'); // Red 950
    grad.addColorStop(1, 'rgba(153, 27, 27, 0.95)'); // Red 800
    strokeColor = 'rgba(248, 113, 113, 0.95)'; // Warm Coral
    defaultTag = '🔥 BẾP NƯỚNG';
    tagBg = 'rgba(248, 113, 113, 0.3)';
    tagTextColor = '#fecaca';
    nameColor = '#ffffff';
  } else {
    // Regular guest / bot
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.92)'); // Slate 900
    grad.addColorStop(1, 'rgba(30, 41, 59, 0.92)'); // Slate 800
    strokeColor = 'rgba(245, 158, 11, 0.85)'; // Amber
    defaultTag = '🍺 KHÁCH NHẬU';
    tagBg = 'rgba(245, 158, 11, 0.2)';
    tagTextColor = '#fcd34d';
    nameColor = '#ffffff';
  }

  // Draw rounded main box
  ctx.fillStyle = grad;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(padX, padY, boxW, boxH, radius);
  } else {
    ctx.rect(padX, padY, boxW, boxH);
  }
  ctx.fill();

  // Border outline
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
  ctx.restore();

  // 1. Tag / Status Pill on Top Line (e.g., "⭐ BẠN", "Bàn 03", or Action "🍻 1, 2, 3 DZÔ!")
  const currentTag = actionText ? actionText : (roleTag || defaultTag);
  const tagFontSize = 21;
  ctx.font = `bold ${tagFontSize}px "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textBaseline = 'middle';

  const tagTextWidth = ctx.measureText(currentTag).width;
  const tagPillW = Math.min(tagTextWidth + 24, boxW - 24);
  const tagPillH = 30;
  const tagPillX = w / 2 - tagPillW / 2;
  const tagPillY = padY + 14;

  ctx.fillStyle = actionText ? 'rgba(239, 68, 68, 0.85)' : tagBg;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(tagPillX, tagPillY, tagPillW, tagPillH, 12);
  } else {
    ctx.rect(tagPillX, tagPillY, tagPillW, tagPillH);
  }
  ctx.fill();

  ctx.fillStyle = actionText ? '#ffffff' : tagTextColor;
  ctx.textAlign = 'center';
  ctx.fillText(currentTag, w / 2, tagPillY + tagPillH / 2);

  // 2. Character Name on Lower Line
  let nameFontSize = 38;
  ctx.font = `bold ${nameFontSize}px "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  
  // Truncate or scale font if name is very long
  const maxTextW = boxW - 32;
  while (ctx.measureText(name).width > maxTextW && nameFontSize > 22) {
    nameFontSize -= 2;
    ctx.font = `bold ${nameFontSize}px "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  }

  const nameY = padY + 82;
  ctx.fillStyle = nameColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, w / 2, nameY);

  // Small optional table location subtitle at bottom right/left if needed
  if (tableText && !actionText) {
    ctx.font = '16px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = 'rgba(203, 213, 225, 0.75)';
    ctx.textAlign = 'right';
    ctx.fillText(tableText, padX + boxW - 14, padY + 28);
  }
}

export function createNameBadgeSprite(options: NameBadgeOptions): {
  sprite: THREE.Sprite;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  update: (newOptions: Partial<NameBadgeOptions>) => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;

  let currentOptions: NameBadgeOptions = { ...options };
  drawNameBadgeCanvas(canvas, currentOptions);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  // Aspect ratio is 512 / 160 = 3.2. Setting scale to (1.45, 0.453)
  sprite.scale.set(1.45, 0.453, 1);
  sprite.center.set(0.5, 0.5);
  sprite.renderOrder = 999;

  const update = (newOptions: Partial<NameBadgeOptions>) => {
    currentOptions = { ...currentOptions, ...newOptions };
    drawNameBadgeCanvas(canvas, currentOptions);
    texture.needsUpdate = true;
  };

  return {
    sprite,
    canvas,
    texture,
    update,
  };
}
