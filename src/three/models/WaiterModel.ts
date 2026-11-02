import * as THREE from 'three';
import { WaiterState } from '../../types/game';
import { PubMaterials } from '../materials';
import { createNameBadgeSprite } from '../utils/nameBadge';
import { createSpeechBubbleSprite, SpeechBubbleRef } from '../utils/speechBubble';

export interface WaiterRef {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  tray: THREE.Group;
  head: THREE.Group;
  nameBadgeSprite: THREE.Sprite;
  speechBubble: SpeechBubbleRef;
  showSpeechBubble: (text: string, durationSeconds?: number) => void;
  updateState: (state: WaiterState, delta: number, elapsed: number) => void;
}

export function buildWaiterModel(materials: PubMaterials, waiterName: string = 'Chú Ba Phục Vụ'): WaiterRef {
  const group = new THREE.Group();
  group.position.set(8, 0, -5);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.7 });
  const uniformShirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }); // White shirt
  const apronMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 }); // Black apron
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

  // 1. Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.1, 0.75, 0);
  const lLegGeo = new THREE.BoxGeometry(0.12, 0.75, 0.14);
  const lLegMesh = new THREE.Mesh(lLegGeo, pantsMat);
  lLegMesh.position.y = -0.375;
  leftLeg.add(lLegMesh);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.1, 0.75, 0);
  const rLegGeo = new THREE.BoxGeometry(0.12, 0.75, 0.14);
  const rLegMesh = new THREE.Mesh(rLegGeo, pantsMat);
  rLegMesh.position.y = -0.375;
  rightLeg.add(rLegMesh);
  group.add(rightLeg);

  // 2. Torso
  const torsoGeo = new THREE.BoxGeometry(0.36, 0.48, 0.22);
  const torso = new THREE.Mesh(torsoGeo, uniformShirtMat);
  torso.position.y = 1.0;
  torso.castShadow = true;
  group.add(torso);

  // Apron on front
  const apronGeo = new THREE.BoxGeometry(0.32, 0.44, 0.04);
  const apron = new THREE.Mesh(apronGeo, apronMat);
  apron.position.set(0, 0.96, 0.11);
  group.add(apron);

  // 3. Head & Mustache
  const head = new THREE.Group();
  head.position.set(0, 1.35, 0);

  const headGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  head.add(headMesh);

  // Black hair
  const hairGeo = new THREE.SphereGeometry(0.142, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.6 });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 0.04;
  head.add(hair);

  // Friendly mustache
  const stacheGeo = new THREE.BoxGeometry(0.12, 0.03, 0.04);
  const stache = new THREE.Mesh(stacheGeo, hairMat);
  stache.position.set(0, -0.04, 0.13);
  head.add(stache);

  group.add(head);

  // 4. Arms carrying round stainless steel serving tray
  const armsGroup = new THREE.Group();
  armsGroup.position.set(0, 1.1, 0);

  const armGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.35, 8);
  for (let ax of [-0.19, 0.19]) {
    const arm = new THREE.Mesh(armGeo, uniformShirtMat);
    arm.rotation.x = -Math.PI / 3;
    arm.position.set(ax, -0.1, 0.15);
    armsGroup.add(arm);
  }

  // Round serving tray (Khay phục vụ inox)
  const tray = new THREE.Group();
  const trayGeo = new THREE.CylinderGeometry(0.32, 0.3, 0.03, 16);
  const trayMesh = new THREE.Mesh(trayGeo, materials.stainlessSteel);
  tray.add(trayMesh);

  // Sample props on tray
  const bottlePropGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.22, 8);
  const bottlePropMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.2 });
  const bottleProp = new THREE.Mesh(bottlePropGeo, bottlePropMat);
  bottleProp.position.set(-0.1, 0.11, 0);
  tray.add(bottleProp);

  const bowlPropGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.06, 8);
  const bowlPropMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
  const bowlProp = new THREE.Mesh(bowlPropGeo, bowlPropMat);
  bowlProp.position.set(0.1, 0.03, 0);
  tray.add(bowlProp);

  tray.position.set(0, -0.12, 0.38);
  armsGroup.add(tray);

  group.add(armsGroup);

  // 5. Overhead 3D Name Badge Sprite
  const nameBadge = createNameBadgeSprite({
    name: waiterName,
    roleType: 'waiter',
    roleTag: '🛎️ PHỤC VỤ',
  });
  nameBadge.sprite.position.set(0, 1.82, 0);
  nameBadge.sprite.userData = { type: 'waiter' };
  group.add(nameBadge.sprite);

  // Overhead Speech Bubble
  const speechBubble = createSpeechBubbleSprite();
  speechBubble.sprite.position.set(0, 2.1, 0);
  group.add(speechBubble.sprite);

  const showSpeechBubble = (text: string, durationSeconds: number = 5.0) => {
    speechBubble.show(text, false, false, durationSeconds);
  };

  // Update waiter animation and positioning based on state
  const currentPos = new THREE.Vector3(8, 0, -5);
  const targetPos = new THREE.Vector3(8, 0, -5);
  let lastWaiterState = '';

  const updateState = (state: WaiterState, delta: number, elapsed: number) => {
    speechBubble.update(delta);
    targetPos.set(state.position[0], state.position[1], state.position[2]);
    currentPos.lerp(targetPos, Math.min(1, delta * 3.5));
    group.position.copy(currentPos);

    if (state.state !== lastWaiterState) {
      lastWaiterState = state.state;
      if (state.state === 'serving_table') {
        nameBadge.update({ actionText: '🍲 Dạ món tới liền!' });
        showSpeechBubble('Dạ món nóng hổi của bàn đây ạ! Chúc quý khách ngon miệng! 🍻', 4.5);
      } else if (state.state === 'walking_to_table') {
        nameBadge.update({ actionText: '🏃 Mang món ra bàn' });
      } else {
        nameBadge.update({ actionText: undefined });
      }
    }

    const isMoving = state.state === 'walking_to_table' || state.state === 'returning';

    if (isMoving) {
      // Walk cycle swing
      const walkCycle = Math.sin(elapsed * 8);
      leftLeg.rotation.x = walkCycle * 0.45;
      rightLeg.rotation.x = -walkCycle * 0.45;
      group.position.y = Math.abs(Math.sin(elapsed * 16)) * 0.05;

      // Face direction of movement
      const dirX = targetPos.x - currentPos.x;
      const dirZ = targetPos.z - currentPos.z;
      if (Math.hypot(dirX, dirZ) > 0.05) {
        group.rotation.y = Math.atan2(dirX, dirZ);
      }
    } else {
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      group.position.y = 0;

      if (state.state === 'serving_table') {
        // Polite slight bow to guests
        head.rotation.x = 0.25;
        tray.position.y = -0.18;
      } else {
        head.rotation.x = Math.sin(elapsed * 1.5) * 0.04;
        tray.position.y = -0.12;
      }
    }
  };

  return {
    group,
    leftLeg,
    rightLeg,
    tray,
    head,
    nameBadgeSprite: nameBadge.sprite,
    speechBubble,
    showSpeechBubble,
    updateState,
  };
}
