import * as THREE from 'three';

// Procedural texture generators using HTML5 canvas
function createTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm terracotta / rustic concrete pub tiles
  ctx.fillStyle = '#b35d38';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const alpha = Math.random() * 0.08;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Tile grout lines
  ctx.strokeStyle = '#5a2e1b';
  ctx.lineWidth = 6;
  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createWoodPlankTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#654321';
  ctx.fillRect(0, 0, 256, 256);

  // Wood grain stripes
  for (let y = 0; y < 256; y += 4) {
    const brightness = 50 + Math.sin(y * 0.15) * 15 + Math.random() * 10;
    ctx.fillStyle = `rgb(${brightness + 30}, ${brightness}, ${brightness - 20})`;
    ctx.fillRect(0, y, 256, 3);
  }

  // Plank seams
  ctx.strokeStyle = '#2b1a0d';
  ctx.lineWidth = 4;
  for (let y = 0; y <= 256; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Retro yellow-red wooden pub signboard
  ctx.fillStyle = '#b91c1c'; // Deep rustic red
  ctx.fillRect(0, 0, 1024, 256);

  // Border frame
  ctx.strokeStyle = '#fbbf24'; // Golden yellow border
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 1004, 236);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 984, 216);

  // Neon text
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 74px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 18;
  ctx.fillText('QUÁN NHẬU ANH ÚT GIÀO', 512, 95);

  // Subtitle
  ctx.font = '600 32px "Be Vietnam Pro", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.fillText('⭐ ĐẶC SẢN ĐỒNG QUÊ • BIA HƠI BIA CHAI • CỤNG LY BỐN PHƯƠNG ⭐', 512, 175);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCheckeredScarfTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const size = 16;
  for (let x = 0; x < 128; x += size) {
    for (let y = 0; y < 128; y += size) {
      const isBlack = (x / size + y / size) % 2 === 0;
      ctx.fillStyle = isBlack ? '#111827' : '#f9fafb';
      ctx.fillRect(x, y, size, size);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Materials library
export class PubMaterials {
  public floorTile: THREE.MeshStandardMaterial;
  public woodPlank: THREE.MeshStandardMaterial;
  public stainlessSteel: THREE.MeshStandardMaterial;
  public plasticRed: THREE.MeshStandardMaterial;
  public plasticBlue: THREE.MeshStandardMaterial;
  public zincRoof: THREE.MeshStandardMaterial;
  public thatchRoof: THREE.MeshStandardMaterial;
  public beerGlass: THREE.MeshPhysicalMaterial;
  public beerAmberLiquid: THREE.MeshStandardMaterial;
  public beerFoam: THREE.MeshStandardMaterial;
  public riverWater: THREE.MeshStandardMaterial;
  public neonSign: THREE.MeshStandardMaterial;
  public palmTrunk: THREE.MeshStandardMaterial;
  public palmLeaf: THREE.MeshStandardMaterial;
  public charcoalGlow: THREE.MeshStandardMaterial;
  public boatWood: THREE.MeshStandardMaterial;
  public nonLaStraw: THREE.MeshStandardMaterial;
  public khanRan: THREE.MeshStandardMaterial;

  constructor() {
    const tileTex = createTileTexture();
    const woodTex = createWoodPlankTexture();
    const signTex = createSignTexture();
    const scarfTex = createCheckeredScarfTexture();

    this.floorTile = new THREE.MeshStandardMaterial({
      map: tileTex,
      roughness: 0.65,
      metalness: 0.1,
    });

    this.woodPlank = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.7,
      metalness: 0.05,
    });

    // Inox bàn nhậu sáng bóng phản chiếu
    this.stainlessSteel = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      roughness: 0.22,
      metalness: 0.92,
    });

    // Ghế nhựa đỏ & xanh đặc trưng
    this.plasticRed = new THREE.MeshStandardMaterial({
      color: 0xd92d20,
      roughness: 0.35,
      metalness: 0.08,
    });

    this.plasticBlue = new THREE.MeshStandardMaterial({
      color: 0x1d68bd,
      roughness: 0.35,
      metalness: 0.08,
    });

    // Mái tôn lượn sóng
    this.zincRoof = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.4,
      metalness: 0.6,
    });

    // Mái lá dừa nước
    this.thatchRoof = new THREE.MeshStandardMaterial({
      color: 0x785332,
      roughness: 0.9,
      metalness: 0.0,
    });

    // Ly bia thủy tinh
    this.beerGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
      depthWrite: false,
    });

    // Nước bia vàng óng
    this.beerAmberLiquid = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.1,
    });

    // Bọt bia trắng xóa
    this.beerFoam = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      roughness: 0.9,
      metalness: 0.0,
    });

    // Nước sông Mekong phù sa xanh lam biếc
    this.riverWater = new THREE.MeshStandardMaterial({
      color: 0x24556a,
      roughness: 0.25,
      metalness: 0.3,
      transparent: true,
      opacity: 0.88,
    });

    // Bảng hiệu neon phát sáng rực rỡ
    this.neonSign = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x991b1b,
      emissiveIntensity: 0.45,
    });

    // Thân dừa
    this.palmTrunk = new THREE.MeshStandardMaterial({
      color: 0x543d2b,
      roughness: 0.85,
    });

    // Tàu lá dừa xanh
    this.palmLeaf = new THREE.MeshStandardMaterial({
      color: 0x22642a,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    // Than hoa đỏ rực
    this.charcoalGlow = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      emissive: 0xef4444,
      emissiveIntensity: 0.9,
      roughness: 0.9,
    });

    // Ghe xuồng gỗ
    this.boatWood = new THREE.MeshStandardMaterial({
      color: 0x4a2e18,
      roughness: 0.75,
      metalness: 0.05,
    });

    // Nón lá đan
    this.nonLaStraw = new THREE.MeshStandardMaterial({
      color: 0xead9ad,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    // Khăn rằn Nam Bộ kẻ ô trắng đen
    this.khanRan = new THREE.MeshStandardMaterial({
      map: scarfTex,
      roughness: 0.85,
      metalness: 0.0,
    });
  }
}
