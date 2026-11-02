import * as THREE from 'three';
import { PubMaterials } from '../materials';

export interface PubEnvironmentRefs {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  fans: THREE.Group[];
  boat: THREE.Group;
  smokeParticles: THREE.Points;
  fishes: THREE.Group[];
  hotspotMarkers: THREE.Group[];
}

export function buildPubEnvironment(materials: PubMaterials): PubEnvironmentRefs {
  const group = new THREE.Group();
  const fans: THREE.Group[] = [];

  // ================= 1. NỀN QUÁN & SÂN NHẬU =================
  // Main concrete/tile floor: 26m wide x 22m deep, sitting from z = -11 to z = 10
  const floorGeo = new THREE.BoxGeometry(28, 0.4, 23);
  const floorMesh = new THREE.Mesh(floorGeo, materials.floorTile);
  floorMesh.position.set(0, -0.2, -0.5);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Riverbank embankment / soil under floor
  const soilGeo = new THREE.BoxGeometry(36, 1.2, 36);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.95 });
  const soilMesh = new THREE.Mesh(soilGeo, soilMat);
  soilMesh.position.set(0, -0.9, -1);
  group.add(soilMesh);

  // ================= 2. BỜ SÔNG & NƯỚC SÔNG MEKONG =================
  // River plane spanning along z = 10.5 to z = 28
  const waterGeo = new THREE.PlaneGeometry(36, 16, 32, 32);
  const waterMesh = new THREE.Mesh(waterGeo, materials.riverWater);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(0, -0.4, 18);
  group.add(waterMesh);

  // Wooden dock / pier jutting out to the river
  const pierGroup = new THREE.Group();
  const pierDeckGeo = new THREE.BoxGeometry(5, 0.2, 7);
  const pierDeck = new THREE.Mesh(pierDeckGeo, materials.woodPlank);
  pierDeck.position.set(-8, -0.2, 13.5);
  pierDeck.receiveShadow = true;
  pierGroup.add(pierDeck);

  // Pier wood posts
  for (let px of [-10.2, -5.8]) {
    for (let pz of [11, 14, 16.8]) {
      const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8);
      const post = new THREE.Mesh(postGeo, materials.woodPlank);
      post.position.set(px, -0.8, pz);
      pierGroup.add(post);
    }
  }
  group.add(pierGroup);

  // Moored Vietnamese wooden sampan boat (Xuồng ba lá)
  const boat = new THREE.Group();
  // Boat hull
  const boatShape = new THREE.Shape();
  boatShape.moveTo(0, -2.5);
  boatShape.quadraticCurveTo(0.9, 0, 0, 2.5);
  boatShape.quadraticCurveTo(-0.9, 0, 0, -2.5);

  const extrudeSettings = {
    steps: 1,
    depth: 0.45,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 2,
  };
  const boatGeo = new THREE.ExtrudeGeometry(boatShape, extrudeSettings);
  const boatMesh = new THREE.Mesh(boatGeo, materials.boatWood);
  boatMesh.rotation.x = Math.PI / 2;
  boatMesh.rotation.z = Math.PI / 6;
  boat.add(boatMesh);

  // Wooden oar (Mái chèo gỗ)
  const oarPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6);
  const oar = new THREE.Mesh(oarPoleGeo, materials.woodPlank);
  oar.rotation.z = Math.PI / 3;
  oar.rotation.y = 0.2;
  oar.position.set(0.3, 0.25, 0.2);
  boat.add(oar);

  boat.position.set(-6, -0.35, 15);
  group.add(boat);

  // Low bamboo / wood railing along river edge
  const railGroup = new THREE.Group();
  const railBeamGeo = new THREE.CylinderGeometry(0.05, 0.05, 26, 8);
  const topRail = new THREE.Mesh(railBeamGeo, materials.woodPlank);
  topRail.rotation.z = Math.PI / 2;
  topRail.position.set(0, 0.85, 10.8);
  railGroup.add(topRail);

  const midRail = new THREE.Mesh(railBeamGeo, materials.woodPlank);
  midRail.rotation.z = Math.PI / 2;
  midRail.position.set(0, 0.45, 10.8);
  railGroup.add(midRail);

  for (let rx = -12.5; rx <= 12.5; rx += 2.5) {
    if (rx > -10 && rx < -6) continue; // Gap for pier access
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    const post = new THREE.Mesh(postGeo, materials.woodPlank);
    post.position.set(rx, 0.4, 10.8);
    railGroup.add(post);
  }
  group.add(railGroup);

  // ================= 3. QUÁN NHẬU SÂN VƯỜN NGOÀI TRỜI (HOÀN TOÀN BỎ HẾT MÁI CHE) =================
  // Thay thế quạt trần bằng 2 Quạt Đứng Công Nghiệp Quán Nhậu đặt ở 2 bên lối đi
  const fanPositions = [
    [-8.5, -2.5],
    [8.5, -2.5],
  ];

  fanPositions.forEach(([fx, fz]) => {
    const fanStandGroup = new THREE.Group();
    fanStandGroup.position.set(fx, 0, fz);

    // Round heavy cast iron base
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.06, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7, metalness: 0.5 });
    const fanBase = new THREE.Mesh(baseGeo, baseMat);
    fanBase.position.y = 0.03;
    fanStandGroup.add(fanBase);

    // Vertical steel pole (1.7m high)
    const poleGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.7, 8);
    const pole = new THREE.Mesh(poleGeo, materials.stainlessSteel);
    pole.position.y = 0.88;
    fanStandGroup.add(pole);

    // Rotating fan head group
    const fanHeadGroup = new THREE.Group();
    fanHeadGroup.position.set(0, 1.75, 0);

    // Motor housing
    const motorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12);
    const motor = new THREE.Mesh(motorGeo, baseMat);
    motor.rotation.x = Math.PI / 2;
    fanHeadGroup.add(motor);

    // Round protective wire cage rim
    const cageGeo = new THREE.TorusGeometry(0.45, 0.015, 8, 24);
    const cage = new THREE.Mesh(cageGeo, materials.stainlessSteel);
    fanHeadGroup.add(cage);

    // 3 spinning blades
    const rotatingBlades = new THREE.Group();
    for (let b = 0; b < 3; b++) {
      const bladeGeo = new THREE.BoxGeometry(0.12, 0.42, 0.015);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.z = (b * 2 * Math.PI) / 3;
      blade.position.set(
        Math.sin((b * 2 * Math.PI) / 3) * 0.22,
        Math.cos((b * 2 * Math.PI) / 3) * 0.22,
        0.02
      );
      rotatingBlades.add(blade);
    }
    fanHeadGroup.add(rotatingBlades);
    fans.push(rotatingBlades);

    fanStandGroup.add(fanHeadGroup);
    group.add(fanStandGroup);
  });

  // ================= 4. BẢNG HIỆU LỚN "QUÁN NHẬU ANH ÚT GIÀO" (CỔNG ĐỨNG TỰ DO) =================
  const signGroup = new THREE.Group();
  const signBoardGeo = new THREE.BoxGeometry(11, 2.2, 0.25);
  const signBoard = new THREE.Mesh(signBoardGeo, materials.neonSign);
  signBoard.position.set(0, 3.8, -10.5); // Placed standing at the back border
  signGroup.add(signBoard);

  // 2 Freestanding entrance timber posts
  for (let sx of [-5, 5]) {
    const sPillarGeo = new THREE.CylinderGeometry(0.16, 0.16, 4.0, 8);
    const sPillar = new THREE.Mesh(sPillarGeo, materials.woodPlank);
    sPillar.position.set(sx, 2.0, -10.5);
    signGroup.add(sPillar);
  }

  // Neon point light illuminating sign warmly
  const signLight = new THREE.PointLight(0xffedd5, 1.8, 12);
  signLight.position.set(0, 3.8, -9.6);
  signGroup.add(signLight);

  group.add(signGroup);

  // ================= 5. DÂY ĐÈN TREO NGOÀI TRỜI (FESTOON STRING LIGHTS) =================
  // 4 corner wooden light posts
  const postPositions: [number, number][] = [
    [-13, -10], [13, -10],
    [-13, 9],   [13, 9],
  ];

  postPositions.forEach(([px, pz]) => {
    const lightPostGeo = new THREE.CylinderGeometry(0.08, 0.1, 3.4, 8);
    const lightPost = new THREE.Mesh(lightPostGeo, materials.woodPlank);
    lightPost.position.set(px, 1.7, pz);
    group.add(lightPost);
  });

  const stringLightsGroup = new THREE.Group();
  const bulbGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });

  // Perimeter String Lights along borders (không che phủ giữa bàn)
  // Left perimeter string
  for (let lz = -9; lz <= 8; lz += 2.0) {
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(-13, 3.2 - Math.sin((lz + 9) / 17 * Math.PI) * 0.35, lz);
    stringLightsGroup.add(bulb);
  }

  // Right perimeter string
  for (let lz = -9; lz <= 8; lz += 2.0) {
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(13, 3.2 - Math.sin((lz + 9) / 17 * Math.PI) * 0.35, lz);
    stringLightsGroup.add(bulb);
  }

  // Back perimeter string
  for (let lx = -11; lx <= 11; lx += 2.2) {
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(lx, 3.3 - Math.sin((lx + 11) / 22 * Math.PI) * 0.3, -10);
    stringLightsGroup.add(bulb);
  }

  // Front river border string
  for (let lx = -11; lx <= 11; lx += 2.2) {
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(lx, 3.2 - Math.sin((lx + 11) / 22 * Math.PI) * 0.3, 9);
    stringLightsGroup.add(bulb);
  }

  // Warm localized ambient glow under lights
  const tavernWarmGlow1 = new THREE.PointLight(0xf59e0b, 1.2, 16);
  tavernWarmGlow1.position.set(-4, 3.0, 1);
  group.add(tavernWarmGlow1);

  const tavernWarmGlow2 = new THREE.PointLight(0xf59e0b, 1.2, 16);
  tavernWarmGlow2.position.set(4, 3.0, 1);
  group.add(tavernWarmGlow2);

  group.add(stringLightsGroup);

  // ================= 6. QUẦY PHỤC VỤ & BIA NƯỚC =================
  const counterGroup = new THREE.Group();
  counterGroup.position.set(-10, 0, -8.5);

  // Counter desk (Inox top, wood body)
  const counterBaseGeo = new THREE.BoxGeometry(4.2, 1.1, 1.2);
  const counterBase = new THREE.Mesh(counterBaseGeo, materials.woodPlank);
  counterBase.position.set(0, 0.55, 0);
  counterGroup.add(counterBase);

  const counterTopGeo = new THREE.BoxGeometry(4.5, 0.08, 1.4);
  const counterTop = new THREE.Mesh(counterTopGeo, materials.stainlessSteel);
  counterTop.position.set(0, 1.14, 0);
  counterGroup.add(counterTop);

  // Beer tap tower on counter
  const tapTowerGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8);
  const tapTower = new THREE.Mesh(tapTowerGeo, materials.stainlessSteel);
  tapTower.position.set(0.6, 1.4, 0);
  counterGroup.add(tapTower);

  // Beer bottle glass refrigerator / display cooler
  const coolerGeo = new THREE.BoxGeometry(2.4, 2.6, 1.0);
  const coolerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 });
  const cooler = new THREE.Mesh(coolerGeo, coolerMat);
  cooler.position.set(0, 1.3, -2);
  counterGroup.add(cooler);

  // Cooler glass door with green glow
  const coolerDoorGeo = new THREE.PlaneGeometry(2.1, 2.2);
  const coolerDoorMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.7,
  });
  const coolerDoor = new THREE.Mesh(coolerDoorGeo, coolerDoorMat);
  coolerDoor.position.set(0, 1.3, -1.48);
  counterGroup.add(coolerDoor);

  // Beer crates stacked next to counter (Két bia Tiger & Saigon)
  const crateColors = [0xb91c1c, 0x15803d, 0xd97706]; // Red, Green, Yellow crates
  for (let ci = 0; ci < 5; ci++) {
    const crateGeo = new THREE.BoxGeometry(0.8, 0.45, 0.6);
    const crateMat = new THREE.MeshStandardMaterial({ color: crateColors[ci % 3], roughness: 0.6 });
    const crate = new THREE.Mesh(crateGeo, crateMat);
    crate.position.set(2.8 + (ci > 2 ? 0.7 : 0), 0.23 + (ci % 3) * 0.45, -0.2);
    counterGroup.add(crate);
  }

  group.add(counterGroup);

  // ================= 7. BẾP NƯỚNG THAN & LÒ NƯỚNG CÁ LÓC =================
  const bbqGroup = new THREE.Group();
  bbqGroup.position.set(10.5, 0, -8.5);

  // Clay / Brick charcoal BBQ station
  const bbqBaseGeo = new THREE.BoxGeometry(3.6, 0.9, 1.5);
  const bbqBaseMat = new THREE.MeshStandardMaterial({ color: 0x573c2a, roughness: 0.9 });
  const bbqBase = new THREE.Mesh(bbqBaseGeo, bbqBaseMat);
  bbqBase.position.set(0, 0.45, 0);
  bbqGroup.add(bbqBase);

  // Glowing charcoal bed
  const charcoalGeo = new THREE.BoxGeometry(3.2, 0.1, 1.2);
  const charcoal = new THREE.Mesh(charcoalGeo, materials.charcoalGlow);
  charcoal.position.set(0, 0.92, 0);
  bbqGroup.add(charcoal);

  // Steel wire grill mesh
  const grillGeo = new THREE.BoxGeometry(3.3, 0.04, 1.3);
  const grill = new THREE.Mesh(grillGeo, materials.stainlessSteel);
  grill.position.set(0, 1.0, 0);
  bbqGroup.add(grill);

  // Grill skewers (Cá lóc nướng, sườn xiên)
  for (let sk = -1.2; sk <= 1.2; sk += 0.6) {
    const skewerGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6);
    const skewerMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const skewer = new THREE.Mesh(skewerGeo, skewerMat);
    skewer.rotation.z = Math.PI / 2;
    skewer.position.set(sk, 1.05, 0);
    bbqGroup.add(skewer);
  }

  // Charcoal red ambient light
  const bbqLight = new THREE.PointLight(0xef4444, 1.6, 6);
  bbqLight.position.set(0, 1.3, 0);
  bbqGroup.add(bbqLight);

  // Smoke particles above grill
  const smokeCount = 35;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePositions = new Float32Array(smokeCount * 3);
  for (let s = 0; s < smokeCount; s++) {
    smokePositions[s * 3] = (Math.random() - 0.5) * 1.5;
    smokePositions[s * 3 + 1] = 1.2 + Math.random() * 2.5;
    smokePositions[s * 3 + 2] = (Math.random() - 0.5) * 0.8;
  }
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
  const smokeMat = new THREE.PointsMaterial({
    color: 0x9ca3af,
    size: 0.35,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
  bbqGroup.add(smokeParticles);

  group.add(bbqGroup);

  // ================= 8. CÂY DỪA MIỀN TÂY & CÂY XANH =================
  const palmPositions: [number, number, number][] = [
    [-13.5, 0, 7.5],
    [13.2, 0, 8.0],
    [-13.8, 0, -3.0],
    [13.5, 0, 1.5],
  ];

  palmPositions.forEach(([px, py, pz], palmIdx) => {
    const palm = new THREE.Group();
    palm.position.set(px, py, pz);

    // Segmented curved trunk
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(palmIdx % 2 === 0 ? 0.3 : -0.3, 2.2, 0.2),
      new THREE.Vector3(palmIdx % 2 === 0 ? 0.8 : -0.7, 4.5, 0.4),
      new THREE.Vector3(palmIdx % 2 === 0 ? 1.2 : -1.0, 6.2, 0.6),
    ]);
    const trunkGeo = new THREE.TubeGeometry(curve, 16, 0.28, 8, false);
    const trunk = new THREE.Mesh(trunkGeo, materials.palmTrunk);
    palm.add(trunk);

    // Palm fronds (Lá dừa xòe rộng)
    const crownPos = new THREE.Vector3(palmIdx % 2 === 0 ? 1.2 : -1.0, 6.2, 0.6);
    for (let f = 0; f < 9; f++) {
      const angle = (f * 2 * Math.PI) / 9;
      const frondGeo = new THREE.BoxGeometry(0.35, 0.04, 2.8);
      const frond = new THREE.Mesh(frondGeo, materials.palmLeaf);
      frond.position.copy(crownPos);
      frond.rotation.y = angle;
      frond.rotation.x = 0.55;
      palm.add(frond);
    }

    // Coconut cluster (Chùm dừa)
    for (let c = 0; c < 4; c++) {
      const nutGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const nutMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.6 });
      const nut = new THREE.Mesh(nutGeo, nutMat);
      nut.position.set(crownPos.x + Math.sin(c * 1.5) * 0.25, crownPos.y - 0.25, crownPos.z + Math.cos(c * 1.5) * 0.25);
      palm.add(nut);
    }

    group.add(palm);
  });

  // ================= 9. GÓC ĐỜN CA TÀI TỬ / HÁT VỚI NHAU =================
  const musicStage = new THREE.Group();
  musicStage.position.set(-11.5, 0, 1.5);

  // Wooden low stage
  const stageGeo = new THREE.BoxGeometry(3.2, 0.25, 2.8);
  const stageMesh = new THREE.Mesh(stageGeo, materials.woodPlank);
  stageMesh.position.y = 0.125;
  musicStage.add(stageMesh);

  // Bamboo bench
  const benchGeo = new THREE.BoxGeometry(1.6, 0.45, 0.5);
  const benchMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
  const bench = new THREE.Mesh(benchGeo, benchMat);
  bench.position.set(0, 0.35, -0.6);
  musicStage.add(bench);

  // Vietnamese Moon Lute (Đờn Kìm Nam Bộ)
  const luteGroup = new THREE.Group();
  const luteBodyGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16);
  const luteMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4, metalness: 0.1 });
  const luteBody = new THREE.Mesh(luteBodyGeo, luteMat);
  luteBody.rotation.x = Math.PI / 2;
  luteGroup.add(luteBody);

  const luteNeckGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8);
  const luteNeck = new THREE.Mesh(luteNeckGeo, luteMat);
  luteNeck.position.y = 0.48;
  luteGroup.add(luteNeck);

  luteGroup.position.set(-0.4, 0.65, -0.4);
  luteGroup.rotation.z = 0.3;
  musicStage.add(luteGroup);

  // Vintage microphone stand
  const micPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.3, 6);
  const micMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });
  const micPole = new THREE.Mesh(micPoleGeo, micMat);
  micPole.position.set(0.4, 0.75, 0.4);
  musicStage.add(micPole);

  const micHeadGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const micHead = new THREE.Mesh(micHeadGeo, micMat);
  micHead.position.set(0.4, 1.42, 0.4);
  musicStage.add(micHead);

  // Traditional Southern lantern (Đèn lồng Hội An / Nam Bộ)
  const lanternGeo = new THREE.SphereGeometry(0.3, 12, 12);
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.8,
    roughness: 0.3,
  });
  const lantern = new THREE.Mesh(lanternGeo, lanternMat);
  lantern.position.set(0, 2.5, 0);
  musicStage.add(lantern);

  const lanternLight = new THREE.PointLight(0xf59e0b, 1.4, 6);
  lanternLight.position.set(0, 2.3, 0);
  musicStage.add(lanternLight);

  group.add(musicStage);

  // ================= 10. CÁ SÔNG MEKONG BƠI GẦN CẦU TÀU =================
  const fishes: THREE.Group[] = [];
  const fishMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 }); // Orange river fish / chép vàng
  for (let fi = 0; fi < 5; fi++) {
    const fish = new THREE.Group();
    const fBodyGeo = new THREE.ConeGeometry(0.09, 0.38, 8);
    const fBody = new THREE.Mesh(fBodyGeo, fishMat);
    fBody.rotation.x = Math.PI / 2;
    fish.add(fBody);

    const fTailGeo = new THREE.BoxGeometry(0.02, 0.12, 0.14);
    const fTail = new THREE.Mesh(fTailGeo, fishMat);
    fTail.position.z = -0.22;
    fish.add(fTail);

    fish.position.set(-8.5 + (fi % 3) * 1.6, -0.36, 14 + Math.floor(fi / 3) * 2.2);
    fishes.push(fish);
    group.add(fish);
  }

  // ================= 11. CÁC ĐIỂM TƯƠNG TÁC 3D (HOTSPOTS) =================
  const hotspotMarkers: THREE.Group[] = [];
  const hotspotDefs = [
    { name: 'Đờn Ca Tài Tử', action: 'music', pos: [-11.5, 0.3, 1.5], color: 0xf59e0b },
    { name: 'Cho Cá Sông Ăn', action: 'fish', pos: [-7.8, 0.1, 13.5], color: 0x06b6d4 },
    { name: 'Lò Nướng Than', action: 'grill', pos: [10.5, 1.1, -8.5], color: 0xef4444 },
    { name: 'Quầy Rót Bia', action: 'beer_tap', pos: [-9.5, 1.2, -8.5], color: 0xeab308 },
  ];

  hotspotDefs.forEach((def) => {
    const markerGroup = new THREE.Group();
    markerGroup.position.set(def.pos[0], def.pos[1], def.pos[2]);
    markerGroup.userData = { type: 'hotspot', action: def.action, name: def.name };

    // Glowing ground ring
    const ringGeo = new THREE.RingGeometry(0.35, 0.45, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: def.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.userData = { type: 'hotspot', action: def.action, name: def.name };
    markerGroup.add(ring);

    // Subtle pulsing center dot
    const dotGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: def.color });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.y = 0.15;
    dot.userData = { type: 'hotspot', action: def.action, name: def.name };
    markerGroup.add(dot);

    hotspotMarkers.push(markerGroup);
    group.add(markerGroup);
  });

  return {
    group,
    waterMesh,
    fans,
    boat,
    smokeParticles,
    fishes,
    hotspotMarkers,
  };
}
