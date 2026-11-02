import * as THREE from 'three';

export interface SpeechBubbleOptions {
  text: string;
  isSelf?: boolean;
  isShout?: boolean;
  senderName?: string;
}

export function drawSpeechBubbleCanvas(canvas: HTMLCanvasElement, options: SpeechBubbleOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Clear previous canvas content
  ctx.clearRect(0, 0, w, h);

  const { text, isSelf = false, isShout = false } = options;
  if (!text) return;

  // Comic speech bubble geometry
  // Bubble box sits in upper 80% of canvas, with a tail pointing down at bottom center
  const padX = 16;
  const padY = 14;
  const bubbleW = w - padX * 2;
  const bubbleH = h - 68; // Reserve bottom area for downward tail
  const radius = 24;

  // Shadow for 3D comic pop & crisp legibility
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6;

  // Background style
  let bgColor = '#ffffff';
  let borderColor = '#0f172a';
  let textColor = '#0f172a';
  let borderWidth = 3.5;

  if (isShout) {
    // Vibrant comic shout style (amber-red)
    bgColor = '#fff7ed'; // warm light orange
    borderColor = '#dc2626'; // bright red
    textColor = '#991b1b';
    borderWidth = 4.5;
  } else if (isSelf) {
    // Player's own speech bubble (emerald/green accent)
    bgColor = '#f0fdf4';
    borderColor = '#059669';
    textColor = '#064e3b';
  }

  // Draw rounded bubble body
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(padX, padY, bubbleW, bubbleH, radius);
  } else {
    ctx.rect(padX, padY, bubbleW, bubbleH);
  }
  ctx.fillStyle = bgColor;
  ctx.fill();

  // Draw tail pointing down to speaker's head (bottom center)
  const tailCenterX = w / 2;
  const tailBaseW = 28;
  const tailTipY = h - padY;

  ctx.beginPath();
  ctx.moveTo(tailCenterX - tailBaseW / 2, padY + bubbleH - 1);
  ctx.lineTo(tailCenterX, tailTipY);
  ctx.lineTo(tailCenterX + tailBaseW / 2, padY + bubbleH - 1);
  ctx.closePath();
  ctx.fillStyle = bgColor;
  ctx.fill();

  ctx.restore(); // Restore to remove shadow before stroking outline

  // Stroke outline around entire bubble + tail
  ctx.beginPath();
  // We can trace the outline:
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(padX, padY, bubbleW, bubbleH, radius);
  } else {
    ctx.rect(padX, padY, bubbleW, bubbleH);
  }
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  // Tail outline with fill to cover overlapping line
  ctx.beginPath();
  ctx.moveTo(tailCenterX - tailBaseW / 2 + 1, padY + bubbleH - 2);
  ctx.lineTo(tailCenterX, tailTipY);
  ctx.lineTo(tailCenterX + tailBaseW / 2 - 1, padY + bubbleH - 2);
  ctx.fillStyle = bgColor;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(tailCenterX - tailBaseW / 2, padY + bubbleH);
  ctx.lineTo(tailCenterX, tailTipY);
  ctx.lineTo(tailCenterX + tailBaseW / 2, padY + bubbleH);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  // Draw Text (Auto-wrapped up to 3 lines)
  let fontSize = isShout ? 28 : 26;
  ctx.font = `bold ${fontSize}px "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxTextWidth = bubbleW - 36;
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = currentLine ? currentLine + ' ' + words[n] : words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTextWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[n];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Cap lines to max 3
  const displayLines = lines.slice(0, 3);
  if (lines.length > 3) {
    displayLines[2] = displayLines[2] + '...';
  }

  const lineHeight = fontSize * 1.25;
  const totalTextH = displayLines.length * lineHeight;
  const startY = padY + bubbleH / 2 - totalTextH / 2 + lineHeight / 2;

  displayLines.forEach((line, idx) => {
    ctx.fillText(line, w / 2, startY + idx * lineHeight);
  });
}

export interface SpeechBubbleRef {
  sprite: THREE.Sprite;
  show: (text: string, isSelf?: boolean, isShout?: boolean, durationSeconds?: number) => void;
  hide: () => void;
  update: (deltaSeconds: number) => void;
}

export function createSpeechBubbleSprite(): SpeechBubbleRef {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  // Aspect ratio is 512 / 256 = 2.0
  const baseScaleX = 1.9;
  const baseScaleY = 0.95;
  sprite.scale.set(0.001, 0.001, 1);
  sprite.center.set(0.5, 0); // Origin at the bottom tip of the tail
  sprite.visible = false;
  sprite.renderOrder = 1000;

  let remainingTime = 0;
  let totalDuration = 6.0;
  let currentScale = 0;
  let targetScale = 0;

  const show = (text: string, isSelf: boolean = false, isShout: boolean = false, durationSeconds: number = 6.0) => {
    drawSpeechBubbleCanvas(canvas, { text, isSelf, isShout });
    texture.needsUpdate = true;
    sprite.visible = true;
    totalDuration = durationSeconds;
    remainingTime = durationSeconds;
    currentScale = 0.2; // Start small for pop-in bounce
    targetScale = 1.0;
    material.opacity = 1.0;
  };

  const hide = () => {
    targetScale = 0;
    remainingTime = 0;
  };

  const update = (deltaSeconds: number) => {
    if (!sprite.visible) return;

    if (remainingTime > 0) {
      remainingTime -= deltaSeconds;
      if (remainingTime <= 0) {
        hide();
      }
    }

    // Smooth spring/pop animation
    currentScale += (targetScale - currentScale) * Math.min(1, deltaSeconds * 12);

    if (targetScale === 0 && currentScale < 0.05) {
      sprite.visible = false;
      material.opacity = 0;
      return;
    }

    // Fade out near end of life
    if (remainingTime < 1.0 && remainingTime > 0) {
      material.opacity = Math.max(0, remainingTime);
    } else if (targetScale > 0) {
      material.opacity = 1.0;
    }

    sprite.scale.set(baseScaleX * currentScale, baseScaleY * currentScale, 1);
  };

  return {
    sprite,
    show,
    hide,
    update,
  };
}
