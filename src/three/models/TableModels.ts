import * as THREE from 'three';
import { Table, TableItem3D } from '../../types/game';
import { PubMaterials } from '../materials';

// Generate table number badge canvas texture
function createTableNumberTexture(tableNumber: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#dc2626'; // Red tent card
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 244, 116);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const numStr = tableNumber < 10 ? `0${tableNumber}` : `${tableNumber}`;
  ctx.fillText(`BÀN ${numStr}`, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 3D Food and Drink model generators
export function createTableItemMesh(item: TableItem3D, materials: PubMaterials): THREE.Group {
  const itemGroup = new THREE.Group();

  switch (item.type) {
    case 'beer_bottle': {
      // Bottle body (green/amber)
      const isGreen = item.name.includes('Lager') || item.name.includes('Ken');
      const bottleMat = new THREE.MeshStandardMaterial({
        color: isGreen ? 0x15803d : 0x78350f,
        roughness: 0.15,
        metalness: 0.2,
      });
      const bodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12);
      const body = new THREE.Mesh(bodyGeo, bottleMat);
      body.position.y = 0.175;
      itemGroup.add(body);

      // Neck
      const neckGeo = new THREE.CylinderGeometry(0.03, 0.07, 0.18, 12);
      const neck = new THREE.Mesh(neckGeo, bottleMat);
      neck.position.y = 0.44;
      itemGroup.add(neck);

      // Crown cap
      const capGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8);
      const capMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.3 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.54;
      itemGroup.add(cap);
      break;
    }

    case 'beer_can': {
      // Aluminum can
      const is333 = item.name.includes('333');
      const canMat = new THREE.MeshStandardMaterial({
        color: is333 ? 0xdc2626 : 0xd1d5db,
        metalness: 0.85,
        roughness: 0.3,
      });
      const canGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.32, 12);
      const can = new THREE.Mesh(canGeo, canMat);
      can.position.y = 0.16;
      itemGroup.add(can);
      break;
    }

    case 'beer_mug': {
      // Glass mug with amber beer & white foam
      const mugGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.32, 12);
      const mug = new THREE.Mesh(mugGeo, materials.beerGlass);
      mug.position.y = 0.16;
      itemGroup.add(mug);

      // Amber beer inside
      const beerGeo = new THREE.CylinderGeometry(0.088, 0.08, 0.26, 12);
      const beer = new THREE.Mesh(beerGeo, materials.beerAmberLiquid);
      beer.position.y = 0.14;
      itemGroup.add(beer);

      // Thick frothy foam head
      const foamGeo = new THREE.CylinderGeometry(0.092, 0.088, 0.06, 12);
      const foam = new THREE.Mesh(foamGeo, materials.beerFoam);
      foam.position.y = 0.28;
      itemGroup.add(foam);
      break;
    }

    case 'food_fish': {
      // Banana leaf plate (Lá chuối xanh)
      const leafGeo = new THREE.BoxGeometry(0.55, 0.02, 0.3);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.7 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.y = 0.01;
      itemGroup.add(leaf);

      // Grilled snakehead fish (Cá lóc nướng trui)
      const fishGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.45, 8);
      const fishMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 }); // charcoal grilled
      const fish = new THREE.Mesh(fishGeo, fishMat);
      fish.rotation.z = Math.PI / 2;
      fish.position.y = 0.06;
      itemGroup.add(fish);

      // Scallion oil garnish (Mỡ hành đậu phộng)
      const garnishGeo = new THREE.BoxGeometry(0.3, 0.02, 0.06);
      const garnishMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
      const garnish = new THREE.Mesh(garnishGeo, garnishMat);
      garnish.position.y = 0.12;
      itemGroup.add(garnish);
      break;
    }

    case 'food_hotpot': {
      // Hotpot burner base (Bếp cồn inox)
      const burnerGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.12, 16);
      const burner = new THREE.Mesh(burnerGeo, materials.stainlessSteel);
      burner.position.y = 0.06;
      itemGroup.add(burner);

      // Stainless steel hotpot with soup (Nồi lẩu mắm)
      const potGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.18, 16);
      const pot = new THREE.Mesh(potGeo, materials.stainlessSteel);
      pot.position.y = 0.18;
      itemGroup.add(pot);

      // Boiling red/amber broth
      const brothGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.02, 16);
      const brothMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        emissive: 0x9a3412,
        emissiveIntensity: 0.25,
        roughness: 0.2,
      });
      const broth = new THREE.Mesh(brothGeo, brothMat);
      broth.position.y = 0.26;
      itemGroup.add(broth);
      break;
    }

    case 'food_clams': {
      // Bowl of clams / snails with lemongrass
      const bowlGeo = new THREE.CylinderGeometry(0.22, 0.14, 0.12, 12);
      const bowlMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      bowl.position.y = 0.06;
      itemGroup.add(bowl);

      for (let s = 0; s < 5; s++) {
        const shellGeo = new THREE.SphereGeometry(0.045, 6, 6);
        const shellMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.6 });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.position.set(Math.sin(s * 1.3) * 0.1, 0.11, Math.cos(s * 1.3) * 0.1);
        itemGroup.add(shell);
      }
      break;
    }

    case 'snack_peanuts': {
      // Plate of pickled shallots & roasted peanuts (Củ kiệu đậu phộng)
      const plateGeo = new THREE.CylinderGeometry(0.2, 0.16, 0.03, 12);
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.y = 0.015;
      itemGroup.add(plate);

      // Peanuts pile
      const pileGeo = new THREE.SphereGeometry(0.12, 8, 6);
      const pileMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
      const pile = new THREE.Mesh(pileGeo, pileMat);
      pile.scale.set(1, 0.35, 1);
      pile.position.y = 0.04;
      itemGroup.add(pile);
      break;
    }

    default: {
      // Standard dish plate (Món xào / chiên)
      const plateGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.04, 16);
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.y = 0.02;
      itemGroup.add(plate);

      // Food pile
      const foodFoodGeo = new THREE.DodecahedronGeometry(0.14);
      const foodFoodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
      const foodMesh = new THREE.Mesh(foodFoodGeo, foodFoodMat);
      foodMesh.position.y = 0.09;
      itemGroup.add(foodMesh);
      break;
    }
  }

  return itemGroup;
}

// Build a single 3D Table with 6 chairs and center accessories
export function buildSingleTableGroup(table: Table, materials: PubMaterials): THREE.Group {
  const tableGroup = new THREE.Group();
  tableGroup.position.set(table.position[0], table.position[1], table.position[2]);
  tableGroup.userData = { type: 'table', tableId: table.id };

  // 1. Table Top (Round stainless steel inox tabletop: 1.8m diameter, 0.06m thick, y = 0.82m)
  const topGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.05, 32);
  const tableTop = new THREE.Mesh(topGeo, materials.stainlessSteel);
  tableTop.position.y = 0.82;
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  tableTop.userData = { type: 'table', tableId: table.id };
  tableGroup.add(tableTop);

  // Table Legs (4 curved stainless steel tubes)
  for (let l = 0; l < 4; l++) {
    const angle = (l * Math.PI) / 2 + Math.PI / 4;
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
    const leg = new THREE.Mesh(legGeo, materials.stainlessSteel);
    leg.position.set(Math.sin(angle) * 0.65, 0.4, Math.cos(angle) * 0.65);
    tableGroup.add(leg);
  }

  // Cross brace at bottom of legs
  const crossGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
  const cross1 = new THREE.Mesh(crossGeo, materials.stainlessSteel);
  cross1.rotation.z = Math.PI / 2;
  cross1.position.y = 0.18;
  tableGroup.add(cross1);

  const cross2 = new THREE.Mesh(crossGeo, materials.stainlessSteel);
  cross2.rotation.x = Math.PI / 2;
  cross2.position.y = 0.18;
  tableGroup.add(cross2);

  // 2. Table Number Standing Tent Card (Biển số bàn)
  const numTex = createTableNumberTexture(table.id);
  const numMat = new THREE.MeshStandardMaterial({ map: numTex, roughness: 0.3 });
  const tentGeo = new THREE.BoxGeometry(0.24, 0.14, 0.08);
  const tent = new THREE.Mesh(tentGeo, numMat);
  tent.position.set(0, 0.92, -0.45);
  tent.userData = { type: 'table', tableId: table.id };
  tableGroup.add(tent);

  // Centerpiece: Tissue box & condiment caddy
  const tissueGeo = new THREE.BoxGeometry(0.16, 0.12, 0.14);
  const tissueMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
  const tissue = new THREE.Mesh(tissueGeo, tissueMat);
  tissue.position.set(-0.2, 0.88, 0);
  tableGroup.add(tissue);

  const condimentGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8);
  const condimentMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
  const chiliJar = new THREE.Mesh(condimentGeo, condimentMat);
  chiliJar.position.set(0.18, 0.88, -0.1);
  tableGroup.add(chiliJar);

  // 3. Exactly 6 Chairs around the table
  const chairDistance = 1.35; // Distance from table center
  for (let s = 0; s < 6; s++) {
    const chairGroup = new THREE.Group();
    const chairAngle = (s * 2 * Math.PI) / 6;
    chairGroup.position.set(Math.sin(chairAngle) * chairDistance, 0, Math.cos(chairAngle) * chairDistance);
    chairGroup.rotation.y = chairAngle + Math.PI; // Face inward toward table

    chairGroup.userData = { type: 'seat', tableId: table.id, seatIndex: s };

    // Plastic chair color alternating red & blue
    const chairMat = s % 2 === 0 ? materials.plasticRed : materials.plasticBlue;

    // Chair seat
    const seatGeo = new THREE.BoxGeometry(0.42, 0.05, 0.4);
    const seat = new THREE.Mesh(seatGeo, chairMat);
    seat.position.y = 0.45;
    seat.castShadow = true;
    seat.userData = { type: 'seat', tableId: table.id, seatIndex: s };
    chairGroup.add(seat);

    // Chair backrest (at the back of the chair, facing inward to the table)
    const backGeo = new THREE.BoxGeometry(0.42, 0.4, 0.05);
    const back = new THREE.Mesh(backGeo, chairMat);
    back.position.set(0, 0.65, -0.18);
    back.castShadow = true;
    back.userData = { type: 'seat', tableId: table.id, seatIndex: s };
    chairGroup.add(back);

    // 4 tubular legs
    for (let lx of [-0.17, 0.17]) {
      for (let lz of [-0.16, 0.16]) {
        const cLegGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6);
        const cLeg = new THREE.Mesh(cLegGeo, materials.stainlessSteel);
        cLeg.position.set(lx, 0.225, lz);
        chairGroup.add(cLeg);
      }
    }

    tableGroup.add(chairGroup);
  }

  // 4. Items currently placed on table
  const itemsContainer = new THREE.Group();
  itemsContainer.name = 'itemsContainer';
  itemsContainer.position.y = 0.85; // on top of table surface

  // 12 slot positions in circle
  const slotRadius = 0.55;
  table.itemsOnTable.forEach((item, idx) => {
    const itemMesh = createTableItemMesh(item, materials);
    const slotAngle = (idx * 2 * Math.PI) / 12;
    itemMesh.position.set(Math.sin(slotAngle) * slotRadius, 0, Math.cos(slotAngle) * slotRadius);
    itemsContainer.add(itemMesh);
  });
  tableGroup.add(itemsContainer);

  return tableGroup;
}
