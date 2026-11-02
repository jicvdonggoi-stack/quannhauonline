import * as THREE from 'three';
import { PubMaterials } from '../materials';
import { createNameBadgeSprite } from '../utils/nameBadge';
import { createSpeechBubbleSprite, SpeechBubbleRef } from '../utils/speechBubble';

export interface AtmosphereNPCRef {
  group: THREE.Group;
  speechBubble: SpeechBubbleRef;
  showSpeechBubble: (text: string, durationSeconds?: number) => void;
  update: (elapsed: number, delta?: number) => void;
}

export function buildMusicianNPC(materials: PubMaterials): AtmosphereNPCRef {
  const group = new THREE.Group();
  group.position.set(-11.5, 0.25, 1.2);
  group.rotation.y = Math.PI / 4;

  const skinMat = new THREE.MeshStandardMaterial({ color: 0x9a6538, roughness: 0.7 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.65 }); // Traditional violet silk bà ba
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.7 }); // Silver-gray hair (veteran artist)

  // 1. Seated Lower Body (Pelvis & legs on bench)
  const pelvisGeo = new THREE.BoxGeometry(0.32, 0.16, 0.28);
  const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
  pelvis.position.y = 0.52;
  group.add(pelvis);

  for (let sx of [-0.09, 0.09]) {
    const thighGeo = new THREE.BoxGeometry(0.12, 0.12, 0.32);
    const thigh = new THREE.Mesh(thighGeo, pantsMat);
    thigh.position.set(sx, 0.5, 0.18);
    group.add(thigh);

    const shinGeo = new THREE.BoxGeometry(0.1, 0.38, 0.1);
    const shin = new THREE.Mesh(shinGeo, pantsMat);
    shin.position.set(sx, 0.25, 0.34);
    group.add(shin);
  }

  // 2. Torso (Áo bà ba)
  const torsoGeo = new THREE.BoxGeometry(0.34, 0.42, 0.22);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 0.78;
  torso.castShadow = true;
  group.add(torso);

  // Khăn rằn around neck
  const scarfGeo = new THREE.TorusGeometry(0.16, 0.045, 8, 16);
  const scarf = new THREE.Mesh(scarfGeo, materials.khanRan);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.set(0, 0.95, 0);
  group.add(scarf);

  // 3. Head & Beard
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.05, 0);

  const headGeo = new THREE.SphereGeometry(0.14, 14, 14);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(headMesh);

  // Silver hair & small chin beard
  const hairGeo = new THREE.SphereGeometry(0.142, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 0.04;
  headGroup.add(hair);

  const beardGeo = new THREE.ConeGeometry(0.06, 0.12, 8);
  const beard = new THREE.Mesh(beardGeo, hairMat);
  beard.rotation.x = Math.PI / 6;
  beard.position.set(0, -0.12, 0.12);
  headGroup.add(beard);

  group.add(headGroup);

  // 4. Arms holding Vietnamese Đờn Kìm (Moon Lute)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.18, 0.92, 0.05);
  const armGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.3, 8);
  const rArmUpper = new THREE.Mesh(armGeo, shirtMat);
  rArmUpper.rotation.x = -0.5;
  rArmUpper.rotation.z = -0.3;
  rArmUpper.position.set(0, -0.1, 0.1);
  rightArm.add(rArmUpper);
  group.add(rightArm);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.18, 0.92, 0.05);
  const lArmUpper = new THREE.Mesh(armGeo, shirtMat);
  lArmUpper.rotation.x = -0.8;
  lArmUpper.rotation.z = 0.4;
  lArmUpper.position.set(0, -0.1, 0.12);
  leftArm.add(lArmUpper);
  group.add(leftArm);

  // Moon lute in hands
  const lute = new THREE.Group();
  const luteBodyGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.07, 16);
  const luteMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4, metalness: 0.2 });
  const luteBody = new THREE.Mesh(luteBodyGeo, luteMat);
  luteBody.rotation.x = Math.PI / 2;
  lute.add(luteBody);

  const luteNeckGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8);
  const luteNeck = new THREE.Mesh(luteNeckGeo, luteMat);
  luteNeck.position.y = 0.45;
  lute.add(luteNeck);

  lute.position.set(-0.05, 0.72, 0.3);
  lute.rotation.z = 0.45;
  lute.rotation.y = 0.2;
  group.add(lute);

  // 5. Overhead Name Badge
  const nameBadge = createNameBadgeSprite({
    name: 'Bác Sáu Đờn Ca',
    roleType: 'musician',
    roleTag: '🎶 ĐỜN CA TÀI TỬ',
    tableText: 'Sân Khấu',
  });
  nameBadge.sprite.position.set(0, 1.55, 0);
  nameBadge.sprite.userData = { type: 'hotspot', action: 'music' };
  group.add(nameBadge.sprite);

  // 6. Overhead Speech Bubble
  const speechBubble = createSpeechBubbleSprite();
  speechBubble.sprite.position.set(0, 1.85, 0);
  group.add(speechBubble.sprite);

  const showSpeechBubble = (text: string, durationSeconds: number = 6.0) => {
    speechBubble.show(text, false, false, durationSeconds);
  };

  // Dynamic animation (gentle swaying with the Vietnamese traditional folk song)
  const update = (elapsed: number, delta: number = 0.016) => {
    speechBubble.update(delta);
    headGroup.rotation.y = Math.sin(elapsed * 1.5) * 0.12;
    headGroup.rotation.x = Math.sin(elapsed * 2.2) * 0.08 - 0.05;
    rightArm.rotation.x = Math.sin(elapsed * 3.5) * 0.15; // Plucking lute strings
    torso.rotation.z = Math.sin(elapsed * 1.2) * 0.03;
  };

  return { group, speechBubble, showSpeechBubble, update };
}

export function buildChefNPC(materials: PubMaterials): AtmosphereNPCRef {
  const group = new THREE.Group();
  group.position.set(10.5, 0, -7.5);
  group.rotation.y = -Math.PI / 2;

  const skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.7 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.8 }); // White tank top / t-shirt
  const apronMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }); // Red chef apron
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });

  // 1. Standing Legs
  for (let lx of [-0.11, 0.11]) {
    const legGeo = new THREE.BoxGeometry(0.13, 0.8, 0.15);
    const leg = new THREE.Mesh(legGeo, pantsMat);
    leg.position.set(lx, 0.4, 0);
    group.add(leg);
  }

  // 2. Torso & Apron
  const torsoGeo = new THREE.BoxGeometry(0.38, 0.52, 0.24);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 1.04;
  group.add(torso);

  const apronGeo = new THREE.BoxGeometry(0.34, 0.48, 0.04);
  const apron = new THREE.Mesh(apronGeo, apronMat);
  apron.position.set(0, 0.98, 0.12);
  group.add(apron);

  // 3. Head & Red Bandana
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.42, 0);

  const headGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(headMesh);

  // Red headband
  const bandGeo = new THREE.TorusGeometry(0.145, 0.025, 8, 16);
  const bandMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.03;
  headGroup.add(band);

  group.add(headGroup);

  // 4. Arms with BBQ bamboo fan
  const rightArm = new THREE.Group();
  rightArm.position.set(0.2, 1.15, 0);
  const armGeo = new THREE.CylinderGeometry(0.042, 0.038, 0.35, 8);
  const rArm = new THREE.Mesh(armGeo, skinMat);
  rArm.rotation.x = -Math.PI / 3;
  rArm.position.set(0, -0.1, 0.15);
  rightArm.add(rArm);

  // Bamboo fan (Quạt nan quạt than)
  const fanGeo = new THREE.BoxGeometry(0.2, 0.24, 0.02);
  const fanMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
  const fan = new THREE.Mesh(fanGeo, fanMat);
  fan.position.set(0, -0.22, 0.28);
  rightArm.add(fan);
  group.add(rightArm);

  // 5. Overhead Name Badge
  const nameBadge = createNameBadgeSprite({
    name: 'Anh Tư Nướng Than',
    roleType: 'chef',
    roleTag: '🔥 BẾP NƯỚNG',
    tableText: 'Lò Than',
  });
  nameBadge.sprite.position.set(0, 1.82, 0);
  nameBadge.sprite.userData = { type: 'hotspot', action: 'grill' };
  group.add(nameBadge.sprite);

  // 6. Overhead Speech Bubble
  const speechBubble = createSpeechBubbleSprite();
  speechBubble.sprite.position.set(0, 2.12, 0);
  group.add(speechBubble.sprite);

  const showSpeechBubble = (text: string, durationSeconds: number = 6.0) => {
    speechBubble.show(text, false, false, durationSeconds);
  };

  // Dynamic animation (fanning charcoal embers)
  const update = (elapsed: number, delta: number = 0.016) => {
    speechBubble.update(delta);
    rightArm.rotation.z = Math.sin(elapsed * 6) * 0.25;
    rightArm.rotation.x = -Math.PI / 3 + Math.sin(elapsed * 6) * 0.1;
    headGroup.rotation.x = Math.sin(elapsed * 2) * 0.05 + 0.1; // looking at grill
  };

  return { group, speechBubble, showSpeechBubble, update };
}
