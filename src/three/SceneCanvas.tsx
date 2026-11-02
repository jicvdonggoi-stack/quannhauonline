import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Table, WaiterState } from '../types/game';
import { PubMaterials } from './materials';
import { buildPubEnvironment, PubEnvironmentRefs } from './models/PubEnvironment';
import { buildSingleTableGroup } from './models/TableModels';
import { buildCharacterModel, CharacterRef } from './models/CharacterModel';
import { buildWaiterModel, WaiterRef } from './models/WaiterModel';

interface SceneCanvasProps {
  tables: Table[];
  waiter: WaiterState;
  selectedTableId: number | null;
  myTableId: number | null;
  onSelectTable: (tableId: number, seatIndex?: number) => void;
  onTriggerHotspot?: (action: string) => void;
  cameraViewPreset?: 'overview' | 'my_table' | 'river' | 'grill' | 'music' | 'beer_tap';
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({
  tables,
  waiter,
  selectedTableId,
  myTableId,
  onSelectTable,
  onTriggerHotspot,
  cameraViewPreset = 'overview',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const tablesRef = useRef<Table[]>(tables);
  const waiterStateRef = useRef<WaiterState>(waiter);
  const selectedTableIdRef = useRef<number | null>(selectedTableId);
  const myTableIdRef = useRef<number | null>(myTableId);
  const onSelectTableRef = useRef(onSelectTable);
  const onTriggerHotspotRef = useRef(onTriggerHotspot);
  const cameraPresetRef = useRef(cameraViewPreset);

  tablesRef.current = tables;
  waiterStateRef.current = waiter;
  selectedTableIdRef.current = selectedTableId;
  myTableIdRef.current = myTableId;
  onSelectTableRef.current = onSelectTable;
  onTriggerHotspotRef.current = onTriggerHotspot;
  cameraPresetRef.current = cameraViewPreset;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Scene & RoomEnvironment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131d2a); // Mekong twilight blue
    scene.fog = new THREE.FogExp2(0x131d2a, 0.016);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Elevated Isometric Camera - Dynamically adapted for Mobile vs Desktop
    const isMobileAspect = container.clientWidth < container.clientHeight || container.clientWidth < 640;
    const initialFov = isMobileAspect ? 58 : 42;
    const camera = new THREE.PerspectiveCamera(
      initialFov,
      container.clientWidth / container.clientHeight,
      0.5,
      140
    );
    
    // Position camera slightly higher and farther on mobile to capture all 10 tables clearly
    if (isMobileAspect) {
      camera.position.set(26, 23, 26);
    } else {
      camera.position.set(22, 19, 22);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.2, 0);
    controls.minDistance = 6;
    controls.maxDistance = 50;
    controls.minPolarAngle = Math.PI / 8; // ~22 deg
    controls.maxPolarAngle = Math.PI * 0.44; // ~79 deg (keep elevated isometric feel)
    controls.maxAzimuthAngle = Math.PI * 0.95;
    controls.minAzimuthAngle = -Math.PI * 0.95;

    // Mobile touch controls configuration
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    // 5. Lighting Rig
    // Warm sun/key light (Sunset Mekong warmth)
    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    keyLight.position.set(18, 26, 14);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.left = -20;
    keyLight.shadow.camera.right = 20;
    keyLight.shadow.camera.top = 20;
    keyLight.shadow.camera.bottom = -20;
    scene.add(keyLight);

    // Cool blue river sky fill
    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x27272a, 0.9);
    scene.add(hemiLight);

    // Pub Materials & Environment
    const materials = new PubMaterials();
    const envRefs: PubEnvironmentRefs = buildPubEnvironment(materials);
    scene.add(envRefs.group);

    // Table mesh containers
    const tablesGroup = new THREE.Group();
    scene.add(tablesGroup);

    // Characters container & active character refs
    const charactersGroup = new THREE.Group();
    scene.add(charactersGroup);
    let activeCharacterRefs: CharacterRef[] = [];

    // Waiter 3D model
    const waiterRef: WaiterRef = buildWaiterModel(materials);
    scene.add(waiterRef.group);

    // Function to rebuild tables & characters when data updates
    const rebuildTablesAndCharacters = () => {
      // Clear old tables
      while (tablesGroup.children.length > 0) {
        tablesGroup.remove(tablesGroup.children[0]);
      }
      // Clear old characters
      while (charactersGroup.children.length > 0) {
        charactersGroup.remove(charactersGroup.children[0]);
      }
      activeCharacterRefs = [];

      tablesRef.current.forEach((table) => {
        const tableGroup = buildSingleTableGroup(table, materials);
        tablesGroup.add(tableGroup);

        // Add seated characters
        table.seats.forEach((seat) => {
          if (seat.player) {
            const charRef = buildCharacterModel(seat.player, materials);
            const chairDistance = 1.35;
            const chairAngle = (seat.seatIndex * 2 * Math.PI) / 6;

            charRef.group.position.set(
              table.position[0] + Math.sin(chairAngle) * chairDistance,
              table.position[1],
              table.position[2] + Math.cos(chairAngle) * chairDistance
            );
            charRef.group.rotation.y = chairAngle + Math.PI; // Face table center

            charactersGroup.add(charRef.group);
            activeCharacterRefs.push(charRef);
          }
        });
      });
    };

    rebuildTablesAndCharacters();

    // 6. Raycasting Interaction (Click table or chair)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const clickableTargets = [...tablesGroup.children, ...envRefs.hotspotMarkers];
      const intersects = raycaster.intersectObjects(clickableTargets, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.type && obj.parent && obj.parent !== scene) {
          obj = obj.parent;
        }

        if (obj && obj.userData) {
          if (obj.userData.type === 'table') {
            onSelectTableRef.current(obj.userData.tableId);
          } else if (obj.userData.type === 'seat') {
            onSelectTableRef.current(obj.userData.tableId, obj.userData.seatIndex);
          } else if (obj.userData.type === 'hotspot') {
            onTriggerHotspotRef.current?.(obj.userData.action);
          }
        }
      }
    };

    const onPointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const clickableTargets = [...tablesGroup.children, ...envRefs.hotspotMarkers];
      const intersects = raycaster.intersectObjects(clickableTargets, true);
      container.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // 7. Smooth Camera Transition Logic
    const targetCameraPos = new THREE.Vector3(22, 19, 22);
    const targetLookAt = new THREE.Vector3(0, 1.2, 0);

    const applyCameraPreset = (preset: string) => {
      if (preset === 'my_table' && myTableIdRef.current) {
        const table = tablesRef.current.find((t) => t.id === myTableIdRef.current);
        if (table) {
          targetLookAt.set(table.position[0], 1.0, table.position[2]);
          targetCameraPos.set(table.position[0] + 5.5, 5.0, table.position[2] + 5.5);
          return;
        }
      }

      if (preset === 'river') {
        targetLookAt.set(-6, 0.4, 14);
        targetCameraPos.set(0, 4.5, 19);
        return;
      }

      if (preset === 'grill') {
        targetLookAt.set(10.5, 1.2, -8.5);
        targetCameraPos.set(14, 4.5, -4);
        return;
      }

      if (preset === 'music') {
        targetLookAt.set(-11.5, 1.2, 1.5);
        targetCameraPos.set(-7, 4.2, 6);
        return;
      }

      if (preset === 'beer_tap') {
        targetLookAt.set(-9.5, 1.2, -8.5);
        targetCameraPos.set(-6, 3.8, -5);
        return;
      }

      // Default overview
      const isMob = container.clientWidth < container.clientHeight || container.clientWidth < 640;
      targetLookAt.set(0, 1.2, 0);
      if (isMob) {
        targetCameraPos.set(26, 23, 26);
      } else {
        targetCameraPos.set(22, 19, 22);
      }
    };

    // 8. Render Loop with Smooth Animations
    let frameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera preset smooth damping
      applyCameraPreset(cameraPresetRef.current);
      camera.position.lerp(targetCameraPos, Math.min(1, delta * 3.0));
      controls.target.lerp(targetLookAt, Math.min(1, delta * 3.0));
      controls.update();

      // Animate water gentle wave displacement
      const waterPos = envRefs.waterMesh.geometry.attributes.position;
      for (let i = 0; i < waterPos.count; i++) {
        const u = waterPos.getX(i);
        const v = waterPos.getY(i);
        const wave = Math.sin(u * 0.4 + elapsed * 1.5) * 0.08 + Math.cos(v * 0.5 + elapsed * 1.2) * 0.05;
        waterPos.setZ(i, wave);
      }
      waterPos.needsUpdate = true;

      // Boat gentle bobbing in water
      envRefs.boat.position.y = -0.35 + Math.sin(elapsed * 1.8) * 0.04;
      envRefs.boat.rotation.z = Math.PI / 6 + Math.sin(elapsed * 1.2) * 0.03;

      // Mekong fish gentle swimming around pier
      envRefs.fishes.forEach((fish, fi) => {
        const angle = elapsed * 0.9 + fi * 1.3;
        fish.position.x = -7.5 + Math.cos(angle) * 2.2;
        fish.position.z = 14.5 + Math.sin(angle) * 1.8;
        fish.rotation.y = -angle + Math.PI / 2;
        fish.position.y = -0.38 + Math.sin(elapsed * 4 + fi) * 0.03;
      });

      // Standing industrial fans rotation
      envRefs.fans.forEach((f) => {
        f.rotation.z += delta * 14;
      });

      // BBQ smoke particles gentle upward drift
      const smokePos = envRefs.smokeParticles.geometry.attributes.position;
      for (let s = 0; s < smokePos.count; s++) {
        let y = smokePos.getY(s);
        y += delta * 0.8;
        if (y > 3.6) y = 1.2;
        smokePos.setY(s, y);
      }
      smokePos.needsUpdate = true;

      // Waiter animation and movement
      waiterRef.updateState(waiterStateRef.current, delta, elapsed);

      // Characters dynamic animation
      activeCharacterRefs.forEach((char) => {
        char.updateAnimation(elapsed);
      });

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    };

    if (isSoftwareGl) {
      afterDraw(animate);
    } else {
      frameId = requestAnimationFrame(animate);
    }

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const isMob = container.clientWidth < container.clientHeight || container.clientWidth < 640;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.fov = isMob ? 58 : 42;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Save update triggers for prop changes
    const intervalChecker = setInterval(() => {
      // Rebuild if table counts or players changed
      rebuildTablesAndCharacters();
    }, 1500);

    return () => {
      clearInterval(intervalChecker);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none outline-none"
      style={{ touchAction: 'none' }}
    />
  );
};
