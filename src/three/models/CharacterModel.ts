import * as THREE from 'three';
import { Player } from '../../types/game';
import { PubMaterials } from '../materials';

export interface CharacterRef {
  group: THREE.Group;
  rightArm: THREE.Group;
  leftArm: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  beerMug: THREE.Group;
  player: Player;
  updateAnimation: (time: number) => void;
}

export function buildCharacterModel(player: Player, materials: PubMaterials): CharacterRef {
  const group = new THREE.Group();
  group.userData = { type: 'character', playerId: player.id };

  const avatar = player.avatar;
  const skinMat = new THREE.MeshStandardMaterial({
    color: avatar.skinColor || '#f1c27d',
    roughness: 0.65,
    metalness: 0.05,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: avatar.shirtColor || '#2563eb',
    roughness: 0.7,
    metalness: 0.05,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: avatar.pantsColor || '#1e293b',
    roughness: 0.8,
    metalness: 0.05,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: avatar.hairColor || '#111827',
    roughness: 0.6,
  });

  // 1. Pelvis / Hips (Seated base at y = 0.48m)
  const pelvisGeo = new THREE.BoxGeometry(0.32, 0.16, 0.28);
  const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
  pelvis.position.y = 0.52;
  group.add(pelvis);

  // 2. Seated Thighs (Horizontal extending forward from hips)
  for (let sx of [-0.09, 0.09]) {
    const thighGeo = new THREE.BoxGeometry(0.12, 0.12, 0.32);
    const thigh = new THREE.Mesh(thighGeo, pantsMat);
    thigh.position.set(sx, 0.5, 0.18);
    group.add(thigh);

    // Shin (Vertical going down to ground)
    const shinGeo = new THREE.BoxGeometry(0.1, 0.38, 0.1);
    const shin = new THREE.Mesh(shinGeo, pantsMat);
    shin.position.set(sx, 0.25, 0.34);
    group.add(shin);

    // Foot / Sandal
    const footGeo = new THREE.BoxGeometry(0.11, 0.06, 0.18);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.9 });
    const foot = new THREE.Mesh(footGeo, footMat);
    foot.position.set(sx, 0.03, 0.38);
    group.add(foot);
  }

  // 3. Torso (Bà ba / Shirt)
  const torsoGeo = new THREE.BoxGeometry(0.34, 0.42, 0.22);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 0.78;
  torso.castShadow = true;
  group.add(torso);

  // 4. Neck & Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.05, 0);

  const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.scale.set(1, 1.15, 1);
  headGroup.add(headMesh);

  // Hair
  if (avatar.hairStyle !== 'bald') {
    const hairGeo = new THREE.SphereGeometry(0.145, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 0.04;
    headGroup.add(hairMesh);

    if (avatar.hairStyle === 'stylish') {
      const quiffGeo = new THREE.BoxGeometry(0.1, 0.08, 0.12);
      const quiff = new THREE.Mesh(quiffGeo, hairMat);
      quiff.position.set(0, 0.16, 0.06);
      headGroup.add(quiff);
    } else if (avatar.hairStyle === 'tied') {
      const bunGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const bun = new THREE.Mesh(bunGeo, hairMat);
      bun.position.set(0, 0.08, -0.14);
      headGroup.add(bun);
    }
  }

  // Accessories: Nón lá / Khăn rằn / Kính mát
  if (avatar.accessory === 'non_la') {
    // Vietnamese conical hat (Nón lá)
    const hatGeo = new THREE.ConeGeometry(0.32, 0.18, 24);
    const hat = new THREE.Mesh(hatGeo, materials.nonLaStraw);
    hat.position.set(0, 0.18, 0);
    hat.rotation.x = -0.05;
    headGroup.add(hat);
  } else if (avatar.accessory === 'sunglasses') {
    // Cool sunglasses
    const glassesGeo = new THREE.BoxGeometry(0.22, 0.05, 0.04);
    const glassesMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.8 });
    const glasses = new THREE.Mesh(glassesGeo, glassesMat);
    glasses.position.set(0, 0.02, 0.14);
    headGroup.add(glasses);
  }

  group.add(headGroup);

  // Scarf accessory: Khăn rằn draped over shoulders
  if (avatar.accessory === 'khan_ran') {
    const scarfGeo = new THREE.TorusGeometry(0.18, 0.045, 8, 16);
    const scarf = new THREE.Mesh(scarfGeo, materials.khanRan);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.set(0, 0.95, 0);
    group.add(scarf);
  }

  // 5. Left Arm (resting gently on table)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.2, 0.94, 0);

  const lArmGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.28, 8);
  const lArmUpper = new THREE.Mesh(lArmGeo, shirtMat);
  lArmUpper.position.set(0, -0.12, 0);
  leftArm.add(lArmUpper);

  const lForearmGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.26, 8);
  const lForearm = new THREE.Mesh(lForearmGeo, skinMat);
  lForearm.rotation.x = Math.PI / 2.5;
  lForearm.position.set(0, -0.22, 0.14);
  leftArm.add(lForearm);

  group.add(leftArm);

  // 6. Right Arm (dynamic: cheers / drink / wave / idle holding beer mug)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.2, 0.94, 0);

  const rArmUpperGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.28, 8);
  const rArmUpper = new THREE.Mesh(rArmUpperGeo, shirtMat);
  rArmUpper.position.set(0, -0.12, 0);
  rightArm.add(rArmUpper);

  const rForearmGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.26, 8);
  const rForearm = new THREE.Mesh(rForearmGeo, skinMat);
  rForearm.rotation.x = Math.PI / 2.8;
  rForearm.position.set(0, -0.22, 0.14);
  rightArm.add(rForearm);

  // Beer mug in right hand
  const beerMug = new THREE.Group();
  const mugCupGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.18, 10);
  const mugCup = new THREE.Mesh(mugCupGeo, materials.beerGlass);
  mugCup.position.y = 0.09;
  beerMug.add(mugCup);

  const mugBeerGeo = new THREE.CylinderGeometry(0.058, 0.05, 0.14, 10);
  const mugBeer = new THREE.Mesh(mugBeerGeo, materials.beerAmberLiquid);
  mugBeer.position.y = 0.08;
  beerMug.add(mugBeer);

  const mugFoamGeo = new THREE.CylinderGeometry(0.06, 0.056, 0.03, 10);
  const mugFoam = new THREE.Mesh(mugFoamGeo, materials.beerFoam);
  mugFoam.position.y = 0.16;
  beerMug.add(mugFoam);

  beerMug.position.set(0, -0.22, 0.26);
  rightArm.add(beerMug);

  group.add(rightArm);

  // Animation controller
  const updateAnimation = (time: number) => {
    const action = player.currentAction;

    if (action === 'cheers' || action === 'toast_all') {
      // Raise arm high forward to center of table ("1, 2, 3 DZÔÔÔ!")
      rightArm.rotation.x = -Math.PI / 2.2 + Math.sin(time * 8) * 0.1;
      rightArm.rotation.z = -0.3;
      headGroup.rotation.x = -0.15;
    } else if (action === 'drink') {
      // Tilt beer glass to mouth and head tilt back
      rightArm.rotation.x = -Math.PI / 1.5;
      rightArm.rotation.z = -0.2;
      headGroup.rotation.x = -0.35 + Math.sin(time * 6) * 0.08;
    } else if (action === 'wave') {
      // Wave hand high up in the air
      rightArm.rotation.x = -Math.PI * 0.85;
      rightArm.rotation.z = Math.sin(time * 10) * 0.4 - 0.2;
      headGroup.rotation.y = Math.sin(time * 4) * 0.2;
    } else if (action === 'laugh') {
      // Bob head laughing
      rightArm.rotation.x = -0.2 + Math.sin(time * 6) * 0.1;
      headGroup.rotation.x = Math.sin(time * 12) * 0.2;
      headGroup.position.y = 1.05 + Math.abs(Math.sin(time * 12)) * 0.04;
    } else {
      // Gentle idle pub breathing
      headGroup.rotation.x = Math.sin(time * 1.5 + (player.seatIndex || 0)) * 0.04;
      headGroup.rotation.y = Math.sin(time * 0.8 + (player.seatIndex || 0)) * 0.08;
      rightArm.rotation.x = -0.25 + Math.sin(time * 1.2) * 0.03;
      rightArm.rotation.z = 0;
      headGroup.position.y = 1.05;
    }
  };

  return {
    group,
    rightArm,
    leftArm,
    head: headGroup,
    torso,
    beerMug,
    player,
    updateAnimation,
  };
}
