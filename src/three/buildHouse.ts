import * as THREE from "three";
import { FACADES, FLOORING, type PlanFloor, type Project, type Room } from "../types";
import { getPlan } from "../lib/plan";

const FLOOR_H = 3.0;
const SLAB = 0.18;
const INT_WALL_H = 1.15;
const EXT_WALL = 0.16;

export interface Level {
  index: number;
  group: THREE.Group;
  baseY: number;
  label: string;
  roof?: boolean;
}

export interface BuiltHouse {
  group: THREE.Group;
  site: THREE.Group;
  levels: Level[];
  dispose: () => void;
}

type OpeningType = "window" | "door" | "garage" | "slider" | "open";

interface Opening {
  start: number;
  width: number;
  bottom: number;
  top: number;
  type: OpeningType;
}

export function buildHouse(project: Project): BuiltHouse {
  const plan = getPlan(project);
  const plotW = project.plot.width;
  const plotD = project.plot.depth;
  const L = plan.offset.x - plotW / 2;
  const R = L + plan.buildWidth;
  const zFront = plotD / 2 - plan.offset.y;
  const zRear = zFront - plan.buildDepth;
  const facade = FACADES[project.settings.facade];
  const floorFinish = FLOORING[project.settings.flooring];
  const group = new THREE.Group();
  const site = new THREE.Group();
  group.add(site);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const sphereGeo = new THREE.SphereGeometry(1, 20, 16);
  const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 24);
  const coneGeo = new THREE.ConeGeometry(1, 1, 14);
  geometries.push(boxGeo, sphereGeo, cylinderGeo, coneGeo);

  const mat = (color: string, roughness = 0.8, metalness = 0) => {
    const material = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.push(material);
    return material;
  };

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#7c9d97",
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.36,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  materials.push(glassMaterial);

  const M = {
    wall: mat(facade.wall, 0.9),
    wallInner: mat("#e3dccf", 0.92),
    accent: mat(facade.accent, 0.68),
    trim: mat(facade.trim, 0.55),
    wood: mat("#6d4f38", 0.62),
    woodDark: mat("#4f392a", 0.58),
    glass: glassMaterial,
    metal: mat("#33322f", 0.42, 0.5),
    concrete: mat("#c9c0b1", 0.95),
    lawn: mat("#95a085", 0.98),
    gravel: mat("#c4baa8", 1),
    deck: mat("#b28a60", 0.78),
    white: mat("#f3eee4", 0.82),
    sage: mat("#71856b", 0.8),
    dark: mat("#28241f", 0.7),
    solar: mat("#2f4547", 0.28, 0.4),
    bed: mat("#eee7da", 0.95),
    pillow: mat("#faf6ed", 0.92),
    fabric: mat("#9d9a86", 0.98),
    rust: mat("#b66146", 0.86),
    stone: mat("#c7bba8", 0.95),
    roofDeck: mat("#c2b6a4", 0.95),
  };

  const stoneFloor = mat(project.settings.flooring === "oak" ? "#a77b51" : floorFinish.color, 0.72);
  const tileFloor = mat("#c7cfc5", 0.6);
  const sharedFloor = mat(floorFinish.color, 0.58);
  const garageFloor = mat("#b9b2a5", 0.95);

  const addBox = (
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    cast = true,
    receive = true,
  ) => {
    const mesh = new THREE.Mesh(boxGeo, material);
    mesh.scale.set(Math.max(w, 0.001), Math.max(h, 0.001), Math.max(d, 0.001));
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    parent.add(mesh);
    return mesh;
  };

  const addSphere = (
    parent: THREE.Object3D,
    r: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    scaleY = 1,
  ) => {
    const mesh = new THREE.Mesh(sphereGeo, material);
    mesh.scale.set(r, r * scaleY, r);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const addCylinder = (
    parent: THREE.Object3D,
    radius: number,
    height: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    segments = 24,
  ) => {
    const mesh = new THREE.Mesh(cylinderGeo, material);
    mesh.scale.set(radius, height, radius);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const addCone = (
    parent: THREE.Object3D,
    radius: number,
    height: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
  ) => {
    const mesh = new THREE.Mesh(coneGeo, material);
    mesh.scale.set(radius, height, radius);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const mapX = (x: number) => x - plotW / 2;
  const mapZ = (y: number) => plotD / 2 - y;
  const roomCenter = (room: Room) => ({
    x: mapX(room.x + room.w / 2),
    z: mapZ(room.y + room.h / 2),
  });

  const findRoom = (floor: PlanFloor, id: string) => floor.rooms.find((r) => r.id === id);

  /* ---------------- site & landscape ---------------- */

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), mat("#a9a293", 1));
  (ground.material as THREE.Material).name = "ground";
  geometries.push(ground.geometry);
  materials.push(ground.material as THREE.Material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.34;
  ground.receiveShadow = true;
  site.add(ground);

  addBox(site, plotW + 0.7, 0.28, plotD + 0.7, 0, -0.2, 0, M.gravel, false, true);
  addBox(site, plotW + 0.5, 0.06, plotD + 0.5, 0, -0.02, 0, M.lawn, false, true);
  addBox(site, plotW, 0.05, plotD, 0, 0.02, 0, M.stone, false, true);

  const groundPlan = plan.floors[0];
  const garage = findRoom(groundPlan, "garage");
  const frontYardDepth = project.settings.frontSetback;
  const driveX0 = garage ? mapX(garage.x) : L;
  const driveX1 = garage ? mapX(garage.x + garage.w) : L + 2.6;
  addBox(site, driveX1 - driveX0, 0.06, Math.max(0.4, frontYardDepth), (driveX0 + driveX1) / 2, 0.055, zFront + frontYardDepth / 2, M.concrete, false, true);
  addBox(site, 1.15, 0.06, Math.max(0.4, frontYardDepth), L + 3.4, 0.056, zFront + frontYardDepth / 2, M.gravel, false, true);
  for (let i = 0; i < 5; i++) {
    addBox(site, 0.025, 0.005, Math.max(0.4, frontYardDepth), driveX0 + 0.4 + i * 0.55, 0.09, zFront + frontYardDepth / 2, M.trim, false, false);
  }

  // rear garden + side planting
  const rearDepth = project.settings.rearSetback;
  addBox(site, plan.buildWidth, 0.04, Math.max(0.25, rearDepth - 0.15), mapX(plan.offset.x + plan.buildWidth / 2), 0.09, zRear - rearDepth / 2, M.lawn, false, true);
  addBox(site, 0.7, 0.06, plan.buildDepth, mapX(plan.offset.x) - 0.1, 0.08, zFront - plan.buildDepth / 2, M.lawn, false, true);
  addBox(site, 0.7, 0.06, plan.buildDepth, mapX(plan.offset.x + plan.buildWidth) + 0.1, 0.08, zFront - plan.buildDepth / 2, M.lawn, false, true);

  // boundary wall
  const boundaryH = 0.55;
  addBox(site, 0.12, boundaryH, plotD, -plotW / 2 + 0.12, boundaryH / 2 + 0.03, 0, M.stone);
  addBox(site, 0.12, boundaryH, plotD, plotW / 2 - 0.12, boundaryH / 2 + 0.03, 0, M.stone);
  addBox(site, plotW, boundaryH, 0.12, 0, boundaryH / 2 + 0.03, -plotD / 2 + 0.12, M.stone);
  addBox(site, 0.34, 1.15, 0.34, -plotW / 2 + 0.17, 0.58, plotD / 2 - 0.17, M.wall);
  addBox(site, 0.34, 1.15, 0.34, plotW / 2 - 0.17, 0.58, plotD / 2 - 0.17, M.wall);
  addBox(site, 0.28, 0.1, 0.28, -plotW / 2 + 0.17, 1.19, plotD / 2 - 0.17, M.accent);
  addBox(site, 0.28, 0.1, 0.28, plotW / 2 - 0.17, 1.19, plotD / 2 - 0.17, M.accent);

  // road
  addBox(site, 26, 0.03, 3.4, 0, -0.02, plotD / 2 + 2.7, mat("#5a5853", 0.95), false, true);
  addBox(site, 26, 0.06, 0.35, 0, 0.015, plotD / 2 + 1.05, M.gravel, false, true);
  for (let i = 0; i < 9; i++) {
    addBox(site, 0.9, 0.008, 0.08, -11 + i * 2.8, 0.005, plotD / 2 + 2.7, mat("#d7cdb8", 0.9), false, false);
  }

  // trees and shrubs — a broader, softer canopy so street trees don't read as lollipops
  const tree = (x: number, z: number, scale: number, hue = 0) => {
    const g = new THREE.Group();
    const leaf = hue > 0.5 ? mat("#75866b", 0.95) : mat("#687b60", 0.95);
    addCylinder(g, 0.09 * scale, 1.3 * scale, 0, 0.65 * scale, 0, M.woodDark);
    addSphere(g, 0.85 * scale, 0, 1.7 * scale, 0, leaf);
    addSphere(g, 0.62 * scale, 0.45 * scale, 1.45 * scale, 0.18 * scale, leaf);
    addSphere(g, 0.55 * scale, -0.4 * scale, 1.5 * scale, -0.15 * scale, leaf);
    addSphere(g, 0.48 * scale, 0.08 * scale, 2.05 * scale, -0.2 * scale, leaf);
    g.position.set(x, 0, z);
    site.add(g);
  };
  tree(-plotW / 2 - 1.5, plotD / 2 - 1.1, 1.05, 0.1);
  tree(plotW / 2 + 1.6, -plotD / 2 + 1.8, 1.25, 0.7);
  tree(plotW / 2 + 2.3, plotD / 2 - 3.6, 0.8, 0.2);
  tree(-plotW / 2 - 2.2, -plotD / 2 + 3.2, 0.7, 0.4);

  const shrub = (x: number, z: number, r: number, color?: THREE.Material) => {
    addSphere(site, r, x, r * 0.72, z, color ?? M.sage, 0.75);
  };
  if (project.settings.landscaping) {
    shrub(-plotW / 2 + 0.55, plotD / 2 - 0.7, 0.28);
    shrub(plotW / 2 - 0.45, plotD / 2 - 0.65, 0.23, M.accent);
    shrub(-plotW / 2 + 0.45, -plotD / 2 + 0.6, 0.3);
    shrub(plotW / 2 - 0.5, -plotD / 2 + 0.55, 0.26);
    shrub(-plotW / 2 + 0.4, -plotD / 2 + 1.8, 0.22);
  }

  const potted = (x: number, z: number, s = 1) => {
    addCylinder(site, 0.16 * s, 0.28 * s, x, 0.14 * s, z, M.rust);
    addSphere(site, 0.25 * s, x, 0.44 * s, z, M.sage, 1.15);
  };
  potted(L + 0.8, zFront + 0.45);
  potted(R - 0.7, zFront + 0.5, 0.85);

  const stairs = new THREE.Group();

  /* ---------------- architectural walls ---------------- */

  const cleanOpenings = (openings: Opening[], start: number, end: number, height: number) => {
    const sorted = openings
      .map((opening) => ({
        ...opening,
        start: Math.max(start, Math.min(end, opening.start)),
        width: Math.max(0, opening.width),
        bottom: Math.max(0, Math.min(height, opening.bottom)),
        top: Math.max(0, Math.min(height, opening.top)),
      }))
      .filter((opening) => opening.width > 0.05 && opening.top > opening.bottom + 0.05)
      .sort((a, b) => a.start - b.start);
    let cursor = start;
    return sorted
      .map((opening) => {
        const clippedStart = Math.max(opening.start, cursor);
        const clippedWidth = Math.max(0, opening.width - (clippedStart - opening.start));
        cursor = Math.max(cursor, clippedStart + clippedWidth);
        return { ...opening, start: clippedStart, width: clippedWidth };
      })
      .filter((opening) => opening.width > 0.05);
  };

  // deeper, darker frames with a stone sill so windows sit *in* the wall,
  // and a faint interior glow so glass never reads as a flat grey panel
  const addWindowX = (parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number) => {
    addBox(parent, w - 0.06, h - 0.06, 0.05, x, y, z, M.glass, false, false);
    addBox(parent, w + 0.08, 0.09, 0.16, x, y + h / 2 + 0.02, z, M.trim);
    addBox(parent, w + 0.08, 0.09, 0.16, x, y - h / 2 - 0.02, z, M.trim);
    addBox(parent, 0.09, h + 0.08, 0.16, x - w / 2 - 0.02, y, z, M.trim);
    addBox(parent, 0.09, h + 0.08, 0.16, x + w / 2 + 0.02, y, z, M.trim);
    addBox(parent, 0.05, h, 0.09, x, y, z + 0.02, M.trim);
    addBox(parent, w, 0.05, 0.09, x, y, z + 0.02, M.trim);
    addBox(parent, w - 0.12, h - 0.12, 0.02, x, y, z - 0.045, mat("#8a7a5c", 0.9), false, false);
    addBox(parent, w + 0.24, 0.07, 0.34, x, y - h / 2 - 0.08, z + 0.05, M.stone, false, true);
  };

  const addWindowZ = (parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number) => {
    addBox(parent, 0.05, h - 0.06, w - 0.06, x, y, z, M.glass, false, false);
    addBox(parent, 0.16, 0.09, w + 0.08, x, y + h / 2 + 0.02, z, M.trim);
    addBox(parent, 0.16, 0.09, w + 0.08, x, y - h / 2 - 0.02, z, M.trim);
    addBox(parent, 0.16, h + 0.08, 0.09, x, y, z - w / 2 - 0.02, M.trim);
    addBox(parent, 0.16, h + 0.08, 0.09, x, y, z + w / 2 + 0.02, M.trim);
    addBox(parent, 0.09, h, 0.05, x, y, z, M.trim);
    addBox(parent, 0.09, 0.05, w, x, y, z, M.trim);
    addBox(parent, 0.02, h - 0.12, w - 0.12, x - Math.sign(x) * 0.045, y, z, mat("#8a7a5c", 0.9), false, false);
    addBox(parent, 0.34, 0.07, w + 0.24, x + Math.sign(x) * 0.05, y - h / 2 - 0.08, z, M.stone, false, true);
  };

  const addOpeningFillX = (parent: THREE.Object3D, op: Opening, z: number, baseY: number) => {
    const centerX = op.start + op.width / 2;
    const height = op.top - op.bottom;
    const cy = baseY + op.bottom + height / 2;
    if (op.type === "window") addWindowX(parent, centerX, cy, z, op.width, height);
    if (op.type === "slider") {
      addBox(parent, op.width - 0.12, op.top - 0.18, 0.03, centerX, baseY + op.bottom + (op.top - 0.18) / 2, z, M.glass, false, false);
      addBox(parent, 0.06, op.top, 0.1, centerX, baseY + op.top / 2, z, M.trim);
      addBox(parent, op.width, 0.06, 0.1, centerX, baseY + op.top, z, M.trim);
      addBox(parent, op.width, 0.05, 0.1, centerX, baseY + op.bottom + 0.02, z, M.trim);
      addBox(parent, 0.05, op.top, 0.1, op.start + 0.02, baseY + op.top / 2, z, M.trim);
      addBox(parent, 0.05, op.top, 0.1, op.start + op.width - 0.02, baseY + op.top / 2, z, M.trim);
    }
    if (op.type === "door") {
      // layered door: leaf, inset glass, handle, side lights and a step
      addBox(parent, op.width - 0.08, op.top - 0.08, 0.07, centerX, baseY + (op.top - 0.08) / 2, z, M.woodDark);
      addBox(parent, op.width - 0.18, op.top - 0.18, 0.04, centerX, baseY + (op.top - 0.18) / 2, z + 0.055, M.wood);
      addBox(parent, op.width * 0.42, op.top * 0.32, 0.015, centerX - op.width * 0.2, baseY + op.top * 0.68, z + 0.085, M.glass, false, false);
      addBox(parent, 0.16, 0.05, 0.05, centerX + op.width * 0.28, baseY + 1.02, z + 0.11, M.trim);
      addBox(parent, op.width + 0.02, 0.1, 0.16, centerX, baseY + op.top + 0.02, z, M.accent);
      addBox(parent, 0.1, op.top + 0.04, 0.16, op.start - 0.01, baseY + op.top / 2, z, M.accent);
      addBox(parent, 0.1, op.top + 0.04, 0.16, op.start + op.width + 0.01, baseY + op.top / 2, z, M.accent);
      addBox(parent, op.width + 0.3, 0.09, 0.5, centerX, baseY + 0.035, z + 0.22, M.stone, false, true);
      addSphere(parent, 0.045, centerX + op.width * 0.28, baseY + 1.02, z + 0.09, M.trim);
    }
    if (op.type === "garage") {
      const slats = project.settings.garageDoor === "wood" ? M.wood : M.metal;
      const thickness = 0.035;
      const count = 9;
      const slatH = (op.top - 0.1) / count;
      for (let i = 0; i < count; i++) {
        addBox(
          parent,
          op.width - 0.1,
          slatH - 0.035,
          thickness,
          centerX,
          baseY + 0.08 + i * slatH + slatH / 2,
          z + 0.03,
          slats,
        );
      }
      addBox(parent, 0.09, op.top, 0.12, op.start + 0.04, baseY + op.top / 2, z, M.trim);
      addBox(parent, 0.09, op.top, 0.12, op.start + op.width - 0.04, baseY + op.top / 2, z, M.trim);
      addBox(parent, op.width, 0.12, 0.12, centerX, baseY + op.top, z, M.trim);
      addBox(parent, op.width + 0.24, 0.1, 0.34, centerX, baseY + op.top + 0.09, z + 0.02, M.accent);
    }
  };

  const addOpeningFillZ = (parent: THREE.Object3D, op: Opening, x: number, baseY: number) => {
    const centerZ = op.start + op.width / 2;
    const height = op.top - op.bottom;
    const cy = baseY + op.bottom + height / 2;
    if (op.type === "window") addWindowZ(parent, x, cy, centerZ, op.width, height);
    if (op.type === "door") {
      addBox(parent, 0.07, op.top - 0.08, op.width - 0.08, x, baseY + (op.top - 0.08) / 2, centerZ, M.woodDark);
    }
  };

  const addWallX = (
    parent: THREE.Object3D,
    x0: number,
    x1: number,
    z: number,
    baseY: number,
    height: number,
    openings: Opening[],
    material = M.wall,
    thickness = EXT_WALL,
  ) => {
    const ops = cleanOpenings(openings, Math.min(x0, x1), Math.max(x0, x1), height);
    const start = Math.min(x0, x1);
    const end = Math.max(x0, x1);
    let cursor = start;
    for (const op of ops) {
      if (op.start > cursor + 0.01) {
        addBox(parent, op.start - cursor, height, thickness, (cursor + op.start) / 2, baseY + height / 2, z, material);
      }
      if (op.bottom > 0.01) {
        addBox(parent, op.width, op.bottom, thickness, op.start + op.width / 2, baseY + op.bottom / 2, z, material);
      }
      if (op.top < height - 0.01) {
        addBox(parent, op.width, height - op.top, thickness, op.start + op.width / 2, baseY + op.top + (height - op.top) / 2, z, material);
      }
      addOpeningFillX(parent, op, z, baseY);
      cursor = Math.max(cursor, op.start + op.width);
    }
    if (cursor < end - 0.01) {
      addBox(parent, end - cursor, height, thickness, (cursor + end) / 2, baseY + height / 2, z, material);
    }
  };

  const addWallZ = (
    parent: THREE.Object3D,
    x: number,
    z0: number,
    z1: number,
    baseY: number,
    height: number,
    openings: Opening[],
    material = M.wall,
    thickness = EXT_WALL,
  ) => {
    const start = Math.min(z0, z1);
    const end = Math.max(z0, z1);
    const ops = cleanOpenings(openings, start, end, height);
    let cursor = start;
    for (const op of ops) {
      if (op.start > cursor + 0.01) {
        addBox(parent, thickness, height, op.start - cursor, x, baseY + height / 2, (cursor + op.start) / 2, material);
      }
      if (op.bottom > 0.01) {
        addBox(parent, thickness, op.bottom, op.width, x, baseY + op.bottom / 2, op.start + op.width / 2, material);
      }
      if (op.top < height - 0.01) {
        addBox(parent, thickness, height - op.top, op.width, x, baseY + op.top + (height - op.top) / 2, op.start + op.width / 2, material);
      }
      addOpeningFillZ(parent, op, x, baseY);
      cursor = Math.max(cursor, op.start + op.width);
    }
    if (cursor < end - 0.01) {
      addBox(parent, thickness, height, end - cursor, x, baseY + height / 2, (cursor + end) / 2, material);
    }
  };

  const addRailingX = (parent: THREE.Object3D, x0: number, x1: number, z: number, baseY: number, height = 1.05) => {
    const w = Math.abs(x1 - x0);
    const cx = (x0 + x1) / 2;
    addBox(parent, w, 0.05, 0.09, cx, baseY + height, z, M.trim);
    addBox(parent, w, 0.03, 0.06, cx, baseY + 0.14, z, M.trim);
    addBox(parent, w - 0.1, height - 0.36, 0.025, cx, baseY + height / 2 + 0.06, z, M.glass, false, false);
    const posts = Math.max(2, Math.ceil(w / 0.85));
    for (let i = 0; i <= posts; i++) {
      addBox(parent, 0.045, height, 0.06, x0 + (w * i) / posts, baseY + height / 2, z, M.trim);
    }
  };

  const addRailingZ = (parent: THREE.Object3D, x: number, z0: number, z1: number, baseY: number, height = 1.05) => {
    const d = Math.abs(z1 - z0);
    const cz = (z0 + z1) / 2;
    addBox(parent, 0.09, 0.05, d, x, baseY + height, cz, M.trim);
    addBox(parent, 0.06, 0.03, d, x, baseY + 0.14, cz, M.trim);
    addBox(parent, 0.025, height - 0.36, d - 0.1, x, baseY + height / 2 + 0.06, cz, M.glass, false, false);
    const posts = Math.max(2, Math.ceil(d / 0.85));
    for (let i = 0; i <= posts; i++) {
      addBox(parent, 0.06, height, 0.045, x, baseY + height / 2, z0 + (d * i) / posts, M.trim);
    }
  };

  /* ---------------- floor envelope ---------------- */

  const sideOpenings = (floorPlan: PlanFloor, side: "left" | "right"): Opening[] => {
    const buildingLeft = plan.offset.x;
    const buildingRight = plan.offset.x + plan.buildWidth;
    const allowed = ["bedroom", "living", "dining", "lounge", "study", "kitchen", "roofroom"];
    return floorPlan.rooms
      .filter((room) => !room.outdoor && allowed.includes(room.kind))
      .filter((room) =>
        side === "left"
          ? Math.abs(room.x - buildingLeft) < 0.05
          : Math.abs(room.x + room.w - buildingRight) < 0.05,
      )
      .map((room) => {
        const centerZ = mapZ(room.y + room.h / 2);
        const width = Math.min(1.5, Math.max(0.8, room.h * 0.44));
        return {
          start: centerZ - width / 2,
          width,
          bottom: 0.92,
          top: 2.28,
          type: "window" as const,
        };
      });
  };

  const rearOpenings = (floorPlan: PlanFloor): Opening[] => {
    const buildingRear = plan.offset.y + plan.buildDepth;
    const allowed = ["bedroom", "living", "dining", "lounge", "study", "kitchen", "utility", "roofroom"];
    return floorPlan.rooms
      .filter((room) => !room.outdoor && allowed.includes(room.kind))
      .filter((room) => Math.abs(room.y + room.h - buildingRear) < 0.08)
      .map((room) => {
        const centerX = mapX(room.x + room.w / 2);
        const width = Math.min(1.35, Math.max(0.75, room.w * 0.36));
        return {
          start: centerX - width / 2,
          width,
          bottom: 0.92,
          top: 2.28,
          type: "window" as const,
        };
      });
  };

  const buildEnvelope = (parent: THREE.Group, floorPlan: PlanFloor, levelIndex: number, isTopFloor: boolean) => {
    const baseY = 0;
    const balcony = floorPlan.rooms.find((room) => room.id === "balcony");
    const frontOps: Opening[] = [];

    if (levelIndex === 0) {
      if (project.settings.garage && garage) {
        frontOps.push({
          start: mapX(garage.x),
          width: garage.w,
          bottom: 0.08,
          top: 2.38,
          type: "garage",
        });
      }
      frontOps.push({
        start: L + (3.14 / 7.5) * plan.buildWidth,
        width: Math.min(1.05, plan.buildWidth * 0.145),
        bottom: 0.03,
        top: 2.25,
        type: "door",
      });
      frontOps.push({
        start: L + (4.38 / 7.5) * plan.buildWidth,
        width: Math.min(1.2, plan.buildWidth * 0.16),
        bottom: 0.86,
        top: 2.25,
        type: "window",
      });
      addWallX(parent, L, R, zFront, baseY, FLOOR_H, frontOps);
    } else if (balcony && project.settings.balcony) {
      const bX0 = mapX(balcony.x);
      const bX1 = mapX(balcony.x + balcony.w);
      const zRecess = mapZ(balcony.y + balcony.h);
      const leftOps: Opening[] = [
        {
          start: L + (1.4 / 7.5) * plan.buildWidth,
          width: Math.min(1.55, plan.buildWidth * 0.2),
          bottom: 0.9,
          top: 2.3,
          type: "window",
        },
      ];
      addWallX(parent, L, bX0, zFront, baseY, FLOOR_H, leftOps);
      addWallZ(parent, bX0, zRecess, zFront, baseY, FLOOR_H, [
        { start: zRecess + 0.25, width: 0.75, bottom: 0.92, top: 2.3, type: "window" },
      ]);
      addWallX(parent, bX0, R, zRecess, baseY, FLOOR_H, [
        {
          start: bX0 + Math.max(0.3, (bX1 - bX0) * 0.2),
          width: Math.min(1.6, (bX1 - bX0) * 0.55),
          bottom: 0.05,
          top: 2.35,
          type: "slider",
        },
      ]);
      addRailingX(parent, bX0, R, zFront, baseY, 1.05);
      addRailingZ(parent, R, zRecess, zFront, baseY, 1.05);
      addBox(parent, bX1 - bX0, 0.06, 0.34, (bX0 + bX1) / 2, baseY + 0.02, zFront - 0.23, M.stone, false, true);
    } else {
      addWallX(parent, L, R, zFront, baseY, FLOOR_H, [
        {
          start: L + (1.5 / 7.5) * plan.buildWidth,
          width: Math.min(1.55, plan.buildWidth * 0.2),
          bottom: 0.9,
          top: 2.3,
          type: "window",
        },
        {
          start: L + (4.65 / 7.5) * plan.buildWidth,
          width: Math.min(1.3, plan.buildWidth * 0.17),
          bottom: 0.9,
          top: 2.3,
          type: "window",
        },
      ]);
    }

    addWallZ(parent, L, zRear, zFront, baseY, FLOOR_H, sideOpenings(floorPlan, "left"));
    addWallZ(parent, R, zRear, zFront, baseY, FLOOR_H, sideOpenings(floorPlan, "right"));

    const rearOps = rearOpenings(floorPlan);
    if (rearOps.length === 0) {
      rearOps.push({ start: L + plan.buildWidth * 0.3, width: plan.buildWidth * 0.18, bottom: 0.92, top: 2.28, type: "window" });
    }
    addWallX(parent, L, R, zRear, baseY, FLOOR_H, rearOps);

    // horizontal fascias at each level — a shadow gap plus a coping band
    // so stacked floors read as separate plates instead of one flat box
    addBox(parent, plan.buildWidth + 0.12, 0.05, 0.12, 0, FLOOR_H - 0.08, zFront + 0.03, M.dark, false, true);
    addBox(parent, plan.buildWidth + 0.12, 0.17, 0.1, 0, FLOOR_H - 0.16, zFront + 0.02, M.accent, false, true);
    addBox(parent, plan.buildWidth + 0.12, 0.09, 0.08, 0, FLOOR_H - 0.36, zFront + 0.02, M.trim, false, true);
    addBox(parent, 0.1, 0.17, plan.buildDepth + 0.12, L - 0.02, FLOOR_H - 0.16, centerZ, M.accent, false, true);
    addBox(parent, 0.1, 0.17, plan.buildDepth + 0.12, R + 0.02, FLOOR_H - 0.16, centerZ, M.accent, false, true);

    if (levelIndex === 0) {
      const doorX = L + (3.14 / 7.5) * plan.buildWidth + Math.min(1.05, plan.buildWidth * 0.145) / 2;
      // slim entry portal
      addBox(parent, 0.12, 2.5, 0.18, doorX - 0.7, 1.25, zFront + 0.06, M.accent);
      addBox(parent, 0.12, 2.5, 0.18, doorX + 0.7, 1.25, zFront + 0.06, M.accent);
      addBox(parent, 1.55, 0.16, 0.58, doorX, 2.64, zFront + 0.26, M.trim, false, true);
      // canopy over entry
      addBox(parent, 1.8, 0.1, 1.0, doorX, FLOOR_H - 0.25, zFront + 0.5, M.trim, true, true);
      addBox(parent, 0.06, 1.55, 0.06, doorX - 0.78, 1.95, zFront + 0.88, M.trim);
      addBox(parent, 0.06, 1.55, 0.06, doorX + 0.78, 1.95, zFront + 0.88, M.trim);
      // low planter by entry
      addBox(parent, 0.42, 0.36, 0.22, L + plan.buildWidth - 0.52, 0.18, zFront + 0.17, M.accent);
      addSphere(parent, 0.2, L + plan.buildWidth - 0.52, 0.47, zFront + 0.18, M.sage, 0.9);
    }

    if (isTopFloor) {
      addBox(parent, plan.buildWidth + 0.16, 0.1, 0.16, 0, FLOOR_H - 0.05, zFront + 0.03, M.trim);
    }
  };

  /* ---------------- furniture ---------------- */

  const addBed = (parent: THREE.Group, room: Room) => {
    const { x, z } = roomCenter(room);
    const g = new THREE.Group();
    g.position.set(x, 0.03, z);
    const bw = Math.min(1.65, room.w * 0.55);
    const bd = Math.min(2.05, room.h * 0.52);
    addBox(g, bw + 0.5, 0.012, bd + 0.7, 0, 0.004, 0.1, M.fabric, false, true);
    addBox(g, bw, 0.22, bd, 0, 0.15, 0, M.wood);
    addBox(g, bw - 0.12, 0.16, bd - 0.12, 0, 0.32, 0, M.bed);
    addBox(g, bw - 0.18, 0.11, 0.52, 0, 0.42, -bd * 0.25, M.pillow);
    addBox(g, bw - 0.18, 0.09, 0.5, 0, 0.43, -bd * 0.03, M.bed);
    addBox(g, bw + 0.02, 0.08, bd * 0.42, 0, 0.41, bd * 0.25, M.fabric);
    addBox(g, bw + 0.15, 0.9, 0.1, 0, 0.47, -bd / 2 - 0.04, M.woodDark);
    addBox(g, 0.4, 0.36, 0.34, -bw / 2 - 0.28, 0.19, -bd / 2 + 0.25, M.wood);
    addBox(g, 0.4, 0.36, 0.34, bw / 2 + 0.28, 0.19, -bd / 2 + 0.25, M.wood);
    addSphere(g, 0.07, -bw / 2 - 0.28, 0.42, -bd / 2 + 0.25, M.accent);
    addSphere(g, 0.07, bw / 2 + 0.28, 0.42, -bd / 2 + 0.25, M.accent);
    // bedside lamps, a throw and a bedside book
    for (const px of [-bw / 2 - 0.28, bw / 2 + 0.28]) {
      addCylinder(g, 0.06, 0.045, px, 0.39, -0.05, M.trim, 12);
      addCylinder(g, 0.13, 0.11, px, 0.49, -0.05, M.fabric, 12);
    }
    addBox(g, bw * 0.5, 0.035, 0.5, 0, 0.425, bd * 0.18, M.rust);
    addBox(g, 0.18, 0.035, 0.24, bw / 2 + 0.28, 0.39, 0.05, M.sage);
    parent.add(g);
  };

  const addSofa = (parent: THREE.Group, room: Room, lounge = false) => {
    const { x, z } = roomCenter(room);
    const g = new THREE.Group();
    g.position.set(x, 0.03, z);
    const sw = Math.min(lounge ? 2.6 : 2.2, room.w * 0.64);
    const sd = Math.min(0.9, room.h * 0.32);
    addBox(g, sw + 0.5, 0.012, sd + 1.15, 0, 0.004, 0.22, M.fabric, false, true);
    addBox(g, sw, 0.35, sd * 0.72, 0, 0.2, 0.08, M.fabric);
    addBox(g, sw, 0.56, 0.16, 0, 0.36, -sd * 0.32, M.fabric);
    addBox(g, 0.16, 0.48, sd * 0.7, -sw / 2 + 0.08, 0.28, 0.08, M.fabric);
    addBox(g, 0.16, 0.48, sd * 0.7, sw / 2 - 0.08, 0.28, 0.08, M.fabric);
    [-sw * 0.28, 0, sw * 0.28].forEach((px) => {
      addBox(g, sw * 0.26, 0.14, sd * 0.6, px, 0.44, 0.09, M.bed);
    });
    addBox(g, 0.36, 0.22, sd * 0.42, sw * 0.22, 0.47, -sd * 0.22, M.rust);
    addBox(g, 1.15, 0.32, 0.56, 0, 0.17, sd * 0.95, M.wood);
    addBox(g, 0.2, 0.12, 0.2, 0.3, 0.36, sd * 0.95, M.accent);
    // floor lamp + books bring the living room to life
    addCylinder(g, 0.14, 0.025, -sw / 2 - 0.35, 0.02, 0.15, M.dark);
    addCylinder(g, 0.025, 0.62, -sw / 2 - 0.35, 0.33, 0.15, M.trim);
    addCylinder(g, 0.14, 0.14, -sw / 2 - 0.35, 0.68, 0.15, M.fabric, 12);
    for (let i = 0; i < 3; i++) {
      addBox(g, 0.22 + i * 0.02, 0.045, 0.15, sw * 0.12 - i * 0.02, 0.355 + i * 0.046, 0.05, i % 2 ? M.accent : M.sage);
    }
    if (!lounge) {
      addBox(parent, Math.min(2.0, room.w * 0.45), 0.42, 0.3, x, 0.22, mapZ(room.y) - 0.02, M.wood);
      addBox(parent, Math.min(1.45, room.w * 0.32), 0.9, 0.04, x, 1.05, mapZ(room.y) - 0.02, M.dark);
      addBox(parent, Math.min(1.35, room.w * 0.3), 0.72, 0.02, x, 1.05, mapZ(room.y) - 0.048, mat("#556d6d", 0.25, 0.25), false, false);
    }
  };

  const addDining = (parent: THREE.Group, room: Room) => {
    const { x, z } = roomCenter(room);
    const g = new THREE.Group();
    g.position.set(x, 0.03, z);
    const tw = Math.min(1.9, room.w * 0.48);
    const td = Math.min(0.95, room.h * 0.4);
    addBox(g, tw, 0.09, td, 0, 0.77, 0, M.wood);
    addBox(g, 0.1, 0.72, 0.1, -tw / 2 + 0.13, 0.38, -td / 2 + 0.12, M.woodDark);
    addBox(g, 0.1, 0.72, 0.1, tw / 2 - 0.13, 0.38, -td / 2 + 0.12, M.woodDark);
    addBox(g, 0.1, 0.72, 0.1, -tw / 2 + 0.13, 0.38, td / 2 - 0.12, M.woodDark);
    addBox(g, 0.1, 0.72, 0.1, tw / 2 - 0.13, 0.38, td / 2 - 0.12, M.woodDark);
    const chairAt = (cx: number, cz: number) => {
      addBox(g, 0.42, 0.09, 0.42, cx, 0.47, cz, M.woodDark);
      addBox(g, 0.42, 0.55, 0.07, cx, 0.62, cz - 0.18, M.woodDark);
      addBox(g, 0.06, 0.45, 0.06, cx - 0.15, 0.24, cz - 0.15, M.woodDark);
      addBox(g, 0.06, 0.45, 0.06, cx + 0.15, 0.24, cz - 0.15, M.woodDark);
    };
    chairAt(-tw * 0.28, -td / 2 - 0.3);
    chairAt(tw * 0.28, -td / 2 - 0.3);
    chairAt(-tw * 0.28, td / 2 + 0.3);
    chairAt(tw * 0.28, td / 2 + 0.3);
    chairAt(tw / 2 + 0.32, 0);
    chairAt(-tw / 2 - 0.32, 0);
    addBox(g, 0.24, 0.12, 0.24, 0, 0.88, 0, M.accent);
    addSphere(g, 0.09, 0, 0.99, 0, M.sage);
    // pendant lights + fruit bowl for a lived-in dining scene
    for (const px of [-tw * 0.3, 0, tw * 0.3]) {
      addCylinder(g, 0.012, 0.55, px, 2.62, 0, M.dark);
      addCylinder(g, 0.055, 0.07, px, 2.32, 0, M.trim, 12);
    }
    for (let i = 0; i < 5; i++) {
      addSphere(g, 0.05, -0.14 + (i % 3) * 0.14, 0.94 + (i >= 3 ? 0.09 : 0), -0.08 + Math.floor(i / 3) * 0.13, i % 2 ? mat("#c46a48", 0.8) : mat("#9caf6a", 0.8));
    }
    parent.add(g);
  };

  const addKitchen = (parent: THREE.Group, room: Room, open: boolean) => {
    const { x, z } = roomCenter(room);
    const g = new THREE.Group();
    g.position.set(x, 0.03, z);
    const rw = room.w;
    const rd = room.h;
    // L-shaped counter along left + rear
    addBox(g, 0.62, 0.88, rd - 0.15, -rw / 2 + 0.31, 0.44, 0, M.white);
    addBox(g, 0.66, 0.06, rd - 0.08, -rw / 2 + 0.33, 0.9, 0, M.trim);
    addBox(g, rw - 1.05, 0.88, 0.62, 0.25, 0.44, -rd / 2 + 0.31, M.white);
    addBox(g, rw - 0.97, 0.06, 0.66, 0.25, 0.9, -rd / 2 + 0.33, M.trim);
    addBox(g, 0.56, 0.04, 0.45, -rw / 2 + 0.33, 0.935, -rd / 2 + 1.0, M.metal);
    addBox(g, 0.44, 0.02, 0.32, -rw / 2 + 0.31, 0.948, -rd / 2 + 1.0, M.dark);
    for (let i = 0; i < 4; i++) {
      addCylinder(g, 0.055, 0.012, -rw / 2 + 0.33 + (i % 2 === 0 ? -0.1 : 0.1), 0.91, -rd / 2 - 0.25 + (i < 2 ? 0 : 0.18), M.metal);
    }
    addBox(g, 0.42, 0.015, 0.32, -rw / 2 + 0.31, 0.91, 0.35, M.glass, false, false);
    addBox(g, 0.06, 0.2, 0.06, -rw / 2 + 0.31, 1.05, 0.35, M.trim);
    // tall fridge
    addBox(g, 0.62, 1.85, 0.66, rw / 2 - 0.35, 0.93, -rd / 2 + 0.36, M.stone);
    addBox(g, 0.6, 0.012, 0.02, rw / 2 - 0.35, 1.18, -rd / 2 + 0.7, M.trim);
    // upper cabinets
    addBox(g, rw - 1.65, 0.7, 0.35, 0, 2.05, -rd / 2 + 0.18, M.wood);
    addBox(g, 0.32, 0.7, 1.15, -rw / 2 + 0.17, 2.05, 0.45, M.wood);
    // chimney, kettle and a stool complete the kitchen
    addBox(g, 0.5, 0.95, 0.5, -rw / 2 + 0.33, 1.42, -rd / 2 + 1.0, M.metal);
    addBox(g, 0.62, 0.16, 0.62, -rw / 2 + 0.33, 1.94, -rd / 2 + 1.0, M.dark);
    addCylinder(g, 0.09, 0.22, rw / 2 - 0.7, 1.02, 0.4, M.stone, 14);
    addCylinder(g, 0.07, 0.05, rw / 2 - 0.7, 1.15, 0.4, M.dark, 14);
    addCylinder(g, 0.16, 0.04, 0.4, 0.02, rd * 0.35, M.wood, 14);
    addCylinder(g, 0.15, 0.44, 0.4, 0.24, rd * 0.35, M.woodDark, 14);
    if (open) {
      addBox(g, 1.5, 0.88, 0.66, 0.1, 0.44, rd * 0.22, M.white);
      addBox(g, 1.58, 0.06, 0.72, 0.1, 0.9, rd * 0.22, M.accent);
    }
    parent.add(g);
  };

  const addBath = (parent: THREE.Group, room: Room) => {
    const { x, z } = roomCenter(room);
    const g = new THREE.Group();
    g.position.set(x, 0.04, z);
    const rw = room.w;
    const rd = room.h;
    addBox(g, Math.min(0.44, rw * 0.35), 0.44, 0.32, -rw / 2 + 0.3, 0.22, -rd / 2 + 0.26, M.white);
    addBox(g, Math.min(0.52, rw * 0.4), 0.08, 0.4, -rw / 2 + 0.3, 0.47, -rd / 2 + 0.3, M.white);
    addCylinder(g, 0.075, 0.03, -rw / 2 + 0.3, 0.49, -rd / 2 + 0.3, M.trim);
    addBox(g, Math.min(0.62, rw * 0.45), 0.16, 0.4, rw / 2 - 0.34, 0.8, -rd / 2 + 0.25, M.white);
    addCylinder(g, 0.12, 0.05, rw / 2 - 0.34, 0.56, -rd / 2 + 0.25, M.stone);
    addBox(g, 0.03, 1.9, Math.min(0.75, rd * 0.5), rw / 2 - 0.03, 0.95, rd / 2 - 0.5, M.glass, false, false);
    addBox(g, 0.06, 1.95, Math.min(0.8, rd * 0.52), rw / 2 - 0.04, 0.97, rd / 2 - 0.51, M.trim);
    addCylinder(g, 0.035, 0.7, rw / 2 - 0.25, 1.55, -rd / 2 + 0.2, M.metal);
    parent.add(g);
  };

  const addDesk = (parent: THREE.Group, room: Room) => {
    const { x, z } = roomCenter(room);
    const g = new THREE.Group();
    g.position.set(x, 0.03, z);
    addBox(g, Math.min(1.7, room.w * 0.55), 0.07, 0.62, 0, 0.74, -room.h * 0.16, M.wood);
    addBox(g, 0.06, 0.72, 0.55, -0.65, 0.37, -room.h * 0.16, M.woodDark);
    addBox(g, 0.06, 0.72, 0.55, 0.65, 0.37, -room.h * 0.16, M.woodDark);
    addBox(g, 0.52, 0.5, 0.06, 0, 1.3, -room.h * 0.34, M.woodDark);
    addBox(g, 0.46, 0.5, 0.06, 0, 1.3, -room.h * 0.27, M.wood);
    // desk lamp and a stack of books
    addCylinder(g, 0.09, 0.025, 0.5, 0.79, -room.h * 0.18, M.dark, 12);
    addCylinder(g, 0.018, 0.28, 0.5, 0.93, -room.h * 0.18, M.trim);
    addSphere(g, 0.07, 0.5, 1.09, -room.h * 0.18 + 0.08, M.fabric);
    addBox(g, 0.26, 0.04, 0.19, -0.45, 0.8, -room.h * 0.14, M.rust);
    addBox(g, 0.22, 0.04, 0.17, -0.46, 0.84, -room.h * 0.14, M.sage);
    addBox(g, 0.46, 0.07, 0.46, -0.2, 0.46, 0.2, M.fabric);
    addBox(g, 0.46, 0.5, 0.06, -0.2, 0.72, 0.42, M.fabric);
    parent.add(g);
  };

  const addCar = (parent: THREE.Group, room: Room) => {
    const { x, z } = roomCenter(room);
    const g = new THREE.Group();
    g.position.set(x, 0.04, z);
    const carMat = mat("#72827b", 0.42, 0.2);
    addBox(g, 1.66, 0.5, 3.55, 0, 0.45, 0, carMat);
    addBox(g, 1.52, 0.46, 1.85, 0, 0.85, 0.18, carMat);
    addBox(g, 1.36, 0.34, 1.62, 0, 0.88, 0.19, M.dark);
    addBox(g, 1.38, 0.18, 0.02, 0, 0.85, 1.13, M.glass, false, false);
    addBox(g, 1.38, 0.18, 0.02, 0, 0.85, -0.74, M.glass, false, false);
    addBox(g, 0.18, 0.11, 0.16, -0.55, 0.54, 1.78, M.white);
    addBox(g, 0.18, 0.11, 0.16, 0.55, 0.54, 1.78, M.white);
    addBox(g, 0.18, 0.09, 0.14, -0.55, 0.53, -1.78, M.rust);
    addBox(g, 0.18, 0.09, 0.14, 0.55, 0.53, -1.78, M.rust);
    for (const wx of [-0.84, 0.84]) {
      for (const wz of [-1.12, 1.14]) {
        const wheel = new THREE.Mesh(cylinderGeo, M.dark);
        wheel.scale.set(0.26, 0.12, 0.26);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.28, wz);
        wheel.castShadow = true;
        g.add(wheel);
      }
    }
    parent.add(g);
  };

  const addUtility = (parent: THREE.Group, room: Room) => {
    const { x, z } = roomCenter(room);
    const g = new THREE.Group();
    g.position.set(x, 0.03, z);
    addBox(g, Math.min(0.7, room.w * 0.4), 0.88, 0.65, -room.w * 0.22, 0.44, 0, M.white);
    addCylinder(g, 0.18, 0.04, -room.w * 0.22, 0.72, 0, M.glass);
    addBox(g, 0.5, 0.88, 0.55, room.w * 0.18, 0.44, -room.h * 0.15, M.stone);
    parent.add(g);
  };

  const addPlants = (parent: THREE.Group, x: number, z: number, scale = 1) => {
    addCylinder(parent, 0.12 * scale, 0.3 * scale, x, 0.15 * scale, z, M.rust);
    addSphere(parent, 0.24 * scale, x, 0.5 * scale, z, M.sage, 1.2);
    addSphere(parent, 0.16 * scale, x + 0.12 * scale, 0.65 * scale, z - 0.05, M.lawn);
    // a trailing smaller pot so corners never look staged-empty
    addCylinder(parent, 0.09 * scale, 0.2 * scale, x + 0.22 * scale, 0.1 * scale, z + 0.12 * scale, M.accent);
    addSphere(parent, 0.13 * scale, x + 0.22 * scale, 0.3 * scale, z + 0.12 * scale, M.lawn, 1.1);
  };

  const addRoomFurniture = (parent: THREE.Group, room: Room, openKitchen: boolean) => {
    if (room.furniture === "stair" || room.kind === "terrace" || room.kind === "pergola") return;
    if (room.kind === "garage") {
      addCar(parent, room);
      addBox(parent, 0.32, 1.8, Math.min(1.8, room.h * 0.4), mapX(room.x + room.w) - 0.3, 0.9, mapZ(room.y + 0.65), M.stone);
      return;
    }
    if (room.kind === "bedroom" || room.kind === "roofroom") {
      addBed(parent, room);
      const direction = room.id === "bed-3" || room.id === "bed-g" ? -1 : 1;
      addPlants(parent, mapX(room.x + room.w) - 0.3, mapZ(room.y + 0.3), 0.62);
      if (room.id === "master") {
        addBox(parent, 0.48, 1.9, 1.9, mapX(room.x + 0.25), 0.95, mapZ(room.y + room.h - 0.65), M.wood);
      }
      void direction;
      return;
    }
    if (room.kind === "living") {
      addSofa(parent, room);
      addPlants(parent, mapX(room.x + 0.3), mapZ(room.y + 0.35), 0.8);
      return;
    }
    if (room.kind === "lounge") {
      addSofa(parent, room, true);
      addPlants(parent, mapX(room.x + room.w - 0.28), mapZ(room.y + 0.25), 0.7);
      return;
    }
    if (room.kind === "dining") {
      addDining(parent, room);
      return;
    }
    if (room.kind === "kitchen") {
      addKitchen(parent, room, openKitchen);
      return;
    }
    if (room.kind === "bath") {
      addBath(parent, room);
      return;
    }
    if (room.kind === "study") {
      addDesk(parent, room);
      addPlants(parent, mapX(room.x + room.w - 0.25), mapZ(room.y + room.h - 0.25), 0.55);
      return;
    }
    if (room.kind === "utility") {
      addUtility(parent, room);
    }
    if (room.kind === "entry") {
      // a console, mirror and a bench make the arrival read warm
      const cx = roomCenter(room);
      addBox(parent, 1.1, 0.52, 0.3, cx.x - room.w * 0.22, 0.5, cx.z - room.h * 0.1, M.wood);
      addBox(parent, 0.7, 0.9, 0.04, cx.x - room.w * 0.22, 1.45, cx.z - room.h * 0.1, M.glass, false, false);
      addBox(parent, 0.08, 0.8, 0.3, cx.x + room.w * 0.28, 0.22, cx.z + room.h * 0.15, M.woodDark);
      addCylinder(parent, 0.06, 0.04, cx.x + room.w * 0.28, 0.66, cx.z + room.h * 0.15, M.trim, 12);
    }
  };

  /* ---------------- stairs ---------------- */

  const buildStaircase = (parent: THREE.Group, room: Room, startY = 0, rise = FLOOR_H) => {
    const { x, z } = roomCenter(room);
    const width = Math.min(2.0, room.w * 0.86) * project.settings.stairWidth;
    const stairType = project.settings.stairType;
    if (stairType === "spiral") {
      const g = new THREE.Group();
      g.position.set(x, startY, z);
      const steps = 14;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const ang = t * Math.PI * 1.6;
        const r = 0.85;
        const sx = Math.cos(ang) * r;
        const sz = Math.sin(ang) * r;
        const stepH = (i + 1) * (rise / steps);
        addBox(g, 0.7, 0.04, 0.22, sx, stepH, sz, i % 2 ? M.stone : M.concrete, true, true);
        addBox(g, 0.7, 0.02, 0.22, sx, stepH + 0.02, sz, M.wood, false, true);
      }
      // central newel + handrail
      addCylinder(g, 0.08, rise + 0.2, 0, rise / 2, 0, M.woodDark);
      for (let i = 0; i < 14; i++) {
        const t = i / 13;
        const ang = t * Math.PI * 1.6;
        const r = 1.05;
        addBox(g, 0.03, 0.03, 0.03, Math.cos(ang) * r, t * rise + 0.6, Math.sin(ang) * r, M.trim);
      }
      parent.add(g);
      return;
    }
    const count = stairType === "l-shaped" ? 10 : 15;
    const run = Math.min(0.27, (room.h - 0.35) / count);
    const totalRun = run * count;
    const g = new THREE.Group();
    g.position.set(x, startY, z + totalRun / 2);
    for (let i = 0; i < count; i++) {
      const stepHeight = ((i + 1) / count) * rise;
      addBox(g, width, stepHeight, run, 0, stepHeight / 2, -totalRun / 2 + (i + 0.5) * run, i % 2 === 0 ? M.stone : M.concrete, true, true);
      addBox(g, width, 0.035, run, 0, stepHeight, -totalRun / 2 + (i + 0.5) * run, M.wood, false, true);
    }
    if (stairType === "l-shaped") {
      // a landing halfway up with a 90° turn
      const landingY = rise * 0.5;
      addBox(g, width + 0.6, 0.12, width + 0.6, width / 2 + 0.3, landingY, -totalRun / 2 + totalRun * 0.5, M.stone, true, true);
      for (let i = 0; i < 5; i++) {
        const stepHeight = landingY + ((i + 1) / 5) * (rise * 0.5);
        addBox(g, width, stepHeight - landingY, run, width / 2 + 0.3, landingY + (stepHeight - landingY) / 2, -totalRun / 2 + totalRun * 0.5 - (i + 0.5) * run, i % 2 ? M.stone : M.concrete, true, true);
        addBox(g, width, 0.035, run, width / 2 + 0.3, stepHeight, -totalRun / 2 + totalRun * 0.5 - (i + 0.5) * run, M.wood, false, true);
      }
    }
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      addBox(g, 0.035, 1.0, 0.035, -width / 2 + 0.03, rise * t + 0.5, -totalRun / 2 + totalRun * t, M.trim);
      addBox(g, 0.035, 1.0, 0.035, width / 2 - 0.03, rise * t + 0.5, -totalRun / 2 + totalRun * t, M.trim);
      addBox(g, width, 0.035, 0.035, 0, rise * t + 1.0, -totalRun / 2 + totalRun * t, M.woodDark);
    }
    addBox(g, 0.04, 1.06, totalRun * 1.05, -width / 2 + 0.02, rise * 0.56 + 0.5, 0, M.trim);
    addBox(g, 0.04, 1.06, totalRun * 1.05, width / 2 - 0.02, rise * 0.56 + 0.5, 0, M.trim);
    // under-stair storage hint
    addBox(g, width * 0.7, 0.4, totalRun * 0.4, 0, 0.2, totalRun * 0.28, M.woodDark);
    parent.add(g);
  };

  /* ---------------- levels ---------------- */

  const levels: Level[] = [];
  const levelLabels = ["Ground floor", "First floor", "Second floor"];
  const centerX = mapX(plan.offset.x + plan.buildWidth / 2);
  const centerZ = zFront - plan.buildDepth / 2;

  for (let index = 0; index < project.settings.floors; index++) {
    const floorPlan = plan.floors[index];
    const levelGroup = new THREE.Group();
    levelGroup.userData.baseY = index * FLOOR_H;
    levelGroup.position.y = index * FLOOR_H;

    // A proper load-bearing floor plate: slab, edge band and plinth line.
    addBox(levelGroup, plan.buildWidth + 0.08, SLAB, plan.buildDepth + 0.08, centerX, -SLAB / 2, centerZ, M.concrete, true, true);
    addBox(levelGroup, plan.buildWidth + 0.2, 0.08, 0.16, centerX, -0.04, zFront + 0.03, M.trim, false, true);
    addBox(levelGroup, plan.buildWidth + 0.3, 0.22, 0.3, centerX, -0.13, zFront + 0.06, M.stone, true, true);
    addBox(levelGroup, plan.buildWidth + 0.3, 0.22, 0.3, centerX, -0.13, zRear - 0.06, M.stone, true, true);
    addBox(levelGroup, 0.3, 0.22, plan.buildDepth + 0.3, L - 0.06, -0.13, centerZ, M.stone, true, true);
    addBox(levelGroup, 0.3, 0.22, plan.buildDepth + 0.3, R + 0.06, -0.13, centerZ, M.stone, true, true);
    // Column hints at the four plate corners: stacked floors read as a frame.
    for (const [cx, cz] of [
      [L + 0.15, zFront - 0.15],
      [R - 0.15, zFront - 0.15],
      [L + 0.15, zRear + 0.15],
      [R - 0.15, zRear + 0.15],
    ] as const) {
      addBox(levelGroup, 0.2, FLOOR_H, 0.2, cx, FLOOR_H / 2, cz, M.concrete, true, true);
    }

    for (const room of floorPlan.rooms) {
      const cx = mapX(room.x + room.w / 2);
      const cz = mapZ(room.y + room.h / 2);
      let surface = sharedFloor;
      if (room.kind === "bath") surface = tileFloor;
      else if (room.kind === "garage" || room.kind === "utility") surface = garageFloor;
      else if (room.outdoor || room.kind === "balcony") surface = M.deck;
      else if (["bedroom", "study", "roofroom"].includes(room.kind)) surface = stoneFloor;
      else if (room.kind === "kitchen") surface = M.white;
      addBox(levelGroup, room.w - 0.03, 0.025, room.h - 0.03, cx, 0.018, cz, surface, false, true);
    }

    // low partition walls - dollhouse style
    for (const room of floorPlan.rooms) {
      if (room.outdoor || ["terrace", "pergola", "balcony", "open"].includes(room.kind)) continue;
      const xTop0 = mapX(room.x);
      const xTop1 = mapX(room.x + room.w);
      const zTop = mapZ(room.y);
      const zBottom = mapZ(room.y + room.h);
      const interiorTop = room.y > plan.offset.y + 0.05;
      const interiorLeft = room.x > plan.offset.x + 0.05;
      const overlay = ["bath", "storage"].includes(room.kind);
      if (interiorTop) {
        addBox(levelGroup, room.w - 0.04, INT_WALL_H, 0.08, (xTop0 + xTop1) / 2, INT_WALL_H / 2 + 0.02, zTop, M.wallInner, false, true);
      }
      if (interiorLeft) {
        addBox(levelGroup, 0.08, INT_WALL_H, room.h - 0.04, xTop0, INT_WALL_H / 2 + 0.02, (zTop + zBottom) / 2, M.wallInner, false, true);
      }
      if (overlay) {
        if (room.y + room.h < plan.offset.y + plan.buildDepth - 0.05) {
          addBox(levelGroup, room.w - 0.04, INT_WALL_H, 0.08, (xTop0 + xTop1) / 2, INT_WALL_H / 2 + 0.02, zBottom, M.wallInner, false, true);
        }
        if (room.x + room.w < plan.offset.x + plan.buildWidth - 0.05) {
          addBox(levelGroup, 0.08, INT_WALL_H, room.h - 0.04, xTop1, INT_WALL_H / 2 + 0.02, (zTop + zBottom) / 2, M.wallInner, false, true);
        }
      }
    }

    buildEnvelope(levelGroup, floorPlan, index, index === project.settings.floors - 1);

    if (project.settings.showFurniture) {
      for (const room of floorPlan.rooms) {
        addRoomFurniture(levelGroup, room, project.settings.openKitchen);
      }
    }

    const stairRoom = floorPlan.rooms.find((room) => room.furniture === "stair");
    if (stairRoom) buildStaircase(levelGroup, stairRoom, 0, FLOOR_H);

    const warmLight = new THREE.PointLight(0xffdcb0, 1.6, 9, 2);
    warmLight.position.set(centerX, 2.3, centerZ);
    levelGroup.add(warmLight);
    // a soft rectangular rug under the main living area, so rooms read finished
    const livingRoom = floorPlan.rooms.find((room) => room.kind === "living" || room.kind === "lounge");
    if (livingRoom) {
      const rc = roomCenter(livingRoom);
      addBox(levelGroup, Math.min(2.4, livingRoom.w * 0.52), 0.018, Math.min(1.7, livingRoom.h * 0.5), rc.x, 0.035, rc.z, mat("#b3a182", 0.95), false, true);
      addBox(levelGroup, Math.min(2.4, livingRoom.w * 0.52) - 0.14, 0.02, Math.min(1.7, livingRoom.h * 0.5) - 0.14, rc.x, 0.036, rc.z, mat("#a3906e", 0.95), false, true);
      // ceiling fans, fans' pull cords and downlights
      addCylinder(levelGroup, 0.03, 0.35, rc.x, 2.7, rc.z, M.dark);
      addCylinder(levelGroup, 0.52, 0.02, rc.x, 2.5, rc.z, M.wood, 18);
      addCylinder(levelGroup, 0.14, 0.06, rc.x, 2.5, rc.z, M.dark, 18);
      for (const [fx, fz] of [
        [mapX(livingRoom.x + 0.6), mapZ(livingRoom.y + 0.6)],
        [mapX(livingRoom.x + livingRoom.w - 0.6), mapZ(livingRoom.y + livingRoom.h - 0.6)],
      ] as const) {
        addCylinder(levelGroup, 0.06, 0.02, fx, 2.82, fz, mat("#ffe8bb", 0.6), 12);
      }
    }

    group.add(levelGroup);
    levels.push({ index, group: levelGroup, baseY: index * FLOOR_H, label: levelLabels[index] ?? `Floor ${index + 1}` });
  }

  /* ---------------- roof terrace ---------------- */

  const roofPlan = plan.floors[plan.floors.length - 1];
  const roofGroup = new THREE.Group();
  roofGroup.userData.baseY = project.settings.floors * FLOOR_H;
  roofGroup.position.y = project.settings.floors * FLOOR_H;

  const roofStair = findRoom(roofPlan, "roof-stair");
  const sx0 = roofStair ? mapX(roofStair.x) : centerX - 1;
  const sx1 = roofStair ? mapX(roofStair.x + roofStair.w) : centerX + 1;
  const szFront = roofStair ? mapZ(roofStair.y) : centerZ + 1;
  const szRear = roofStair ? mapZ(roofStair.y + roofStair.h) : centerZ - 1;

  // deck strips around the stair opening
  addBox(roofGroup, Math.max(0.05, sx0 - L), 0.16, plan.buildDepth, (L + sx0) / 2, -0.08, centerZ, M.roofDeck, true, true);
  addBox(roofGroup, Math.max(0.05, R - sx1), 0.16, plan.buildDepth, (sx1 + R) / 2, -0.08, centerZ, M.roofDeck, true, true);
  addBox(roofGroup, Math.max(0.05, sx1 - sx0), 0.16, Math.max(0.05, zFront - szFront), (sx0 + sx1) / 2, -0.08, (szFront + zFront) / 2, M.roofDeck, true, true);
  addBox(roofGroup, Math.max(0.05, sx1 - sx0), 0.16, Math.max(0.05, szRear - zRear), (sx0 + sx1) / 2, -0.08, (zRear + szRear) / 2, M.roofDeck, true, true);
  addBox(roofGroup, Math.max(0.1, sx1 - sx0), 0.02, Math.max(0.1, szFront - szRear), (sx0 + sx1) / 2, -0.16, (szFront + szRear) / 2, M.dark, false, false);

  // parapet with a coping course, accent band and planter ledge
  const parapetH = 0.92;
  addBox(roofGroup, plan.buildWidth + 0.15, parapetH, 0.16, centerX, parapetH / 2, zFront + 0.02, M.wall);
  addBox(roofGroup, plan.buildWidth + 0.15, parapetH, 0.16, centerX, parapetH / 2, zRear - 0.02, M.wall);
  addBox(roofGroup, 0.16, parapetH, plan.buildDepth + 0.15, L - 0.02, parapetH / 2, centerZ, M.wall);
  addBox(roofGroup, 0.16, parapetH, plan.buildDepth + 0.15, R + 0.02, parapetH / 2, centerZ, M.wall);
  addBox(roofGroup, plan.buildWidth + 0.28, 0.06, 0.26, centerX, parapetH + 0.02, zFront + 0.02, M.stone, false, true);
  addBox(roofGroup, plan.buildWidth + 0.28, 0.06, 0.26, centerX, parapetH + 0.02, zRear - 0.02, M.stone, false, true);
  addBox(roofGroup, 0.26, 0.06, plan.buildDepth + 0.28, L - 0.02, parapetH + 0.02, centerZ, M.stone, false, true);
  addBox(roofGroup, 0.26, 0.06, plan.buildDepth + 0.28, R + 0.02, parapetH + 0.02, centerZ, M.stone, false, true);
  addBox(roofGroup, plan.buildWidth + 0.1, 0.18, 0.1, centerX, parapetH - 0.18, zFront + 0.03, M.accent, false, true);
  addBox(roofGroup, plan.buildWidth + 0.1, 0.18, 0.1, centerX, parapetH - 0.18, zRear - 0.03, M.accent, false, true);
  // a pergola-grade clothes line, a deck chair and string lights for evening use
  addBox(roofGroup, 1.6, 0.04, 0.04, centerX - 1.2, 1.1, centerZ - 1.4, M.trim);
  addBox(roofGroup, 0.04, 0.04, 0.04, centerX - 2.0, 1.1, centerZ - 1.4, M.trim);
  addBox(roofGroup, 0.04, 0.04, 0.04, centerX - 0.4, 1.1, centerZ - 1.4, M.trim);
  for (let i = 0; i < 5; i++) {
    addSphere(roofGroup, 0.04, centerX - 1.85 + i * 0.33, 1.02 - Math.sin((i / 4) * Math.PI) * 0.12, centerZ - 1.4, M.white);
  }
  const deckChair = new THREE.Group();
  deckChair.position.set(centerX + 1.7, 0.02, centerZ + 1.9);
  deckChair.rotation.y = -0.5;
  addBox(deckChair, 0.55, 0.06, 0.55, 0, 0.32, 0, M.wood);
  addBox(deckChair, 0.55, 0.5, 0.06, 0, 0.55, -0.28, M.wood);
  addBox(deckChair, 0.06, 0.3, 0.06, -0.24, 0.16, 0.24, M.woodDark);
  addBox(deckChair, 0.06, 0.3, 0.06, 0.24, 0.16, 0.24, M.woodDark);
  roofGroup.add(deckChair);

  // stair opening railing
  addRailingX(roofGroup, sx0, sx1, szFront, 0, 0.95);
  addRailingZ(roofGroup, sx0, szRear, szFront, 0, 0.95);
  addRailingZ(roofGroup, sx1, szRear, szFront, 0, 0.95);
  addBox(roofGroup, sx1 - sx0, 0.08, szFront - szRear, (sx0 + sx1) / 2, 0.01, (szFront + szRear) / 2, M.stone, false, true);

  // roof room
  const roofRoom = findRoom(roofPlan, "roof-room");
  if (roofRoom && project.settings.roofRoom) {
    const rx0 = mapX(roofRoom.x);
    const rx1 = mapX(roofRoom.x + roofRoom.w);
    const rzFront = mapZ(roofRoom.y);
    const rzRear = mapZ(roofRoom.y + roofRoom.h);
    const rcx = (rx0 + rx1) / 2;
    const rcz = (rzFront + rzRear) / 2;
    const roofRoomH = 2.68;

    addBox(roofGroup, roofRoom.w - 0.02, 0.025, roofRoom.h - 0.02, rcx, 0.02, rcz, stoneFloor, false, true);
    addWallX(roofGroup, rx0, rx1, rzFront, 0, roofRoomH, [
      {
        start: rx0 + roofRoom.w * 0.24,
        width: Math.min(0.8, roofRoom.w * 0.23),
        bottom: 0.02,
        top: 2.18,
        type: "door",
      },
      {
        start: rx0 + roofRoom.w * 0.62,
        width: Math.min(1.3, roofRoom.w * 0.3),
        bottom: 0.88,
        top: 2.15,
        type: "window",
      },
    ]);
    addWallX(roofGroup, rx0, rx1, rzRear, 0, roofRoomH, [
      {
        start: rx0 + roofRoom.w * 0.3,
        width: Math.min(1.2, roofRoom.w * 0.32),
        bottom: 0.9,
        top: 2.16,
        type: "window",
      },
    ]);
    addWallZ(roofGroup, rx0, rzRear, rzFront, 0, roofRoomH, [
      {
        start: rzRear + roofRoom.h * 0.35,
        width: Math.min(1.1, roofRoom.h * 0.24),
        bottom: 0.9,
        top: 2.16,
        type: "window",
      },
    ]);
    addWallZ(roofGroup, rx1, rzRear, rzFront, 0, roofRoomH, []);
    addBox(roofGroup, roofRoom.w + 0.25, 0.17, roofRoom.h + 0.25, rcx, roofRoomH + 0.08, rcz, M.concrete, true, true);
    addBox(roofGroup, roofRoom.w + 0.28, 0.06, 0.1, rcx, roofRoomH + 0.16, rzFront + 0.18, M.accent, false, true);
    addBox(roofGroup, 0.08, 0.3, roofRoom.h * 0.7, rx1 + 0.05, roofRoomH - 0.4, rcz, M.wood, false, true);
    addBox(roofGroup, 0.2, 0.08, 0.9, rx1 + 0.05, roofRoomH - 0.58, rcz, M.accent, false, true);
    if (project.settings.showFurniture) {
      addBed(roofGroup, roofRoom);
      addDesk(roofGroup, roofRoom);
      addPlants(roofGroup, rx0 + 0.3, rzRear + 0.3, 0.6);
    }
  }

  // pergola + lounge
  const pergola = findRoom(roofPlan, "pergola");
  if (pergola && project.settings.terraceGarden) {
    const px0 = mapX(pergola.x);
    const px1 = mapX(pergola.x + pergola.w);
    const pzFront = mapZ(pergola.y);
    const pzRear = mapZ(pergola.y + pergola.h);
    const pcx = (px0 + px1) / 2;
    const pcz = (pzFront + pzRear) / 2;
    const pergolaH = 2.42;
    for (const [px, pz] of [
      [px0 + 0.1, pzFront - 0.1],
      [px1 - 0.1, pzFront - 0.1],
      [px0 + 0.1, pzRear + 0.1],
      [px1 - 0.1, pzRear + 0.1],
    ]) {
      addBox(roofGroup, 0.1, pergolaH, 0.1, px, pergolaH / 2 + 0.05, pz, M.wood);
    }
    addBox(roofGroup, px1 - px0 + 0.1, 0.09, 0.12, pcx, pergolaH + 0.06, pzFront - 0.1, M.woodDark);
    addBox(roofGroup, px1 - px0 + 0.1, 0.09, 0.12, pcx, pergolaH + 0.06, pzRear + 0.1, M.woodDark);
    for (let i = 0; i < 11; i++) {
      addBox(roofGroup, 0.05, 0.06, pergola.h + 0.15, px0 + 0.1 + (i * (px1 - px0 - 0.2)) / 10, pergolaH + 0.15, pcz, M.wood);
    }
    addBox(roofGroup, (px1 - px0) * 0.58, 0.015, (pzFront - pzRear) * 0.55, pcx, 0.03, pcz, M.fabric, false, true);
    addBox(roofGroup, 1.45, 0.4, 0.65, pcx, 0.22, pcz - 0.45, M.fabric);
    addBox(roofGroup, 1.45, 0.55, 0.12, pcx, 0.42, pcz - 0.78, M.fabric);
    addBox(roofGroup, 0.55, 0.3, 0.55, pcx, 0.16, pcz + 0.55, M.wood);
    addSphere(roofGroup, 0.08, pcx + 0.1, 0.35, pcz + 0.55, M.accent);
    addPlants(roofGroup, px0 + 0.25, pzRear + 0.3, 0.75);
    addPlants(roofGroup, px1 - 0.25, pzRear + 0.3, 0.6);
    // festoon lights
    for (let i = 0; i < 7; i++) {
      addSphere(roofGroup, 0.045, px0 + 0.25 + (i * (px1 - px0 - 0.5)) / 6, pergolaH - 0.12, pcz + Math.sin(i) * 0.2, M.white);
    }
    // terrace planters along parapet
    for (let i = 0; i < 4; i++) {
      addBox(roofGroup, 0.7, 0.32, 0.32, L + 0.28, 0.16, zRear + 1.2 + i * 1.3, M.accent);
      addSphere(roofGroup, 0.22, L + 0.28, 0.46, zRear + 1.2 + i * 1.3, M.sage, 1.1);
    }
  }

  // solar array — a framed, tilted rack so panels read as panels
  const solarRoom = findRoom(roofPlan, "solar");
  if (solarRoom && project.settings.solar) {
    const scx = mapX(solarRoom.x + solarRoom.w / 2);
    const scz = mapZ(solarRoom.y + solarRoom.h / 2);
    for (let col = 0; col < 3; col++) {
      const rack = new THREE.Group();
      rack.position.set(scx - 1.1 + col * 1.1, 0.12, scz);
      rack.rotation.x = -0.32;
      addBox(rack, 0.95, 0.04, 1.35, 0, 0.42, 0, M.solar, true, true);
      addBox(rack, 0.95 + 0.04, 0.03, 1.35 + 0.04, 0, 0.38, 0, M.trim, false, false);
      for (let i = 1; i < 4; i++) {
        addBox(rack, 0.02, 0.05, 1.35, -0.45 + i * 0.24, 0.44, 0, mat("#8fb6b4", 0.2, 0.4), false, false);
      }
      addBox(rack, 0.9, 0.5, 0.06, 0, 0.1, -0.55, M.metal);
      addBox(rack, 0.9, 0.22, 0.06, 0, 0.32, 0.55, M.metal);
      roofGroup.add(rack);
    }
    addBox(roofGroup, 0.14, 0.5, 0.1, scx + 1.45, 0.25, scz + 0.5, M.dark);
    addBox(roofGroup, 0.1, 0.06, 0.12, scx + 1.45, 0.53, scz + 0.5, mat("#5f8a6b", 0.6), false, false);
  }

  // water tank — the black "Sintex" tank local roofs actually have
  const tankRoom = findRoom(roofPlan, "tank");
  if (tankRoom && project.settings.terraceGarden) {
    const tcx = mapX(tankRoom.x + tankRoom.w / 2);
    const tcz = mapZ(tankRoom.y + tankRoom.h / 2);
    const tankMat = mat("#232321", 0.55, 0.15);
    addBox(roofGroup, 1.1, 0.3, 0.8, tcx, 0.15, tcz, M.stone, true, true);
    addCylinder(roofGroup, 0.46, 0.95, tcx - 0.22, 0.78, tcz, tankMat);
    addCylinder(roofGroup, 0.38, 0.78, tcx + 0.4, 0.69, tcz, tankMat);
    addCylinder(roofGroup, 0.47, 0.06, tcx - 0.22, 1.28, tcz, tankMat);
    addCylinder(roofGroup, 0.39, 0.06, tcx + 0.4, 1.11, tcz, tankMat);
    addCylinder(roofGroup, 0.14, 0.1, tcx - 0.22, 1.36, tcz, tankMat);
    addBox(roofGroup, 0.04, 1.1, 0.04, tcx - 0.5, 1.35, tcz, M.metal, false, false);
    addCylinder(roofGroup, 0.16, 0.05, tcx - 0.22, 1.27, tcz, M.trim);
    // a vent pipe so the tank reads as a working roof, not a black blob
    addCylinder(roofGroup, 0.05, 0.5, tcx + 0.62, 0.85, tcz - 0.2, M.metal);
    addCylinder(roofGroup, 0.07, 0.06, tcx + 0.62, 1.12, tcz - 0.2, M.metal);
  }

  if (project.settings.terraceGarden) {
    addBox(roofGroup, 1.35, 0.3, 0.38, mapX(plan.offset.x + plan.buildWidth - 0.9), 0.16, mapZ(plan.offset.y + 1.0), M.accent);
    addSphere(roofGroup, 0.28, mapX(plan.offset.x + plan.buildWidth - 0.9), 0.43, mapZ(plan.offset.y + 1.0), M.sage, 1.1);
  }
  // roof lantern / glowing entry
  const glowMat = new THREE.MeshStandardMaterial({ color: "#ffd8a3", emissive: "#ffb066", emissiveIntensity: 2.3, roughness: 0.4 });
  materials.push(glowMat);
  addSphere(site, 0.05, L + plan.buildWidth - 0.2, 1.7, zFront + 0.1, glowMat);

  group.add(roofGroup);
  levels.push({
    index: project.settings.floors,
    group: roofGroup,
    baseY: project.settings.floors * FLOOR_H,
    label: "Roof terrace",
    roof: true,
  });

  // fine site details: entry threshold, wall lights and a bicycle for scale
  addBox(site, plan.buildWidth * 0.5, 0.1, 0.45, L + plan.buildWidth * 0.5, 0.07, zFront + 0.32, M.stone, false, true);
  addBox(site, 0.1, 0.02, 0.1, L + 2, 0.1, zFront + 0.3, M.dark, false, false);
  addSphere(site, 0.05, L + 1.7, 1.05, zFront + 0.09, glowMat);
  addSphere(site, 0.05, L + 3.7, 1.05, zFront + 0.09, glowMat);
  addBox(site, 1.35, 0.06, 0.5, L + 2.4, 0.1, zFront + 0.35, M.wood, false, true);
  addBox(site, 0.1, 0.18, 0.06, L + 2.0, 1.05, zFront + 0.09, M.dark);
  addBox(site, 0.1, 0.18, 0.06, L + 2.8, 1.05, zFront + 0.09, M.dark);
  const bike = new THREE.Group();
  const wheelGeo = new THREE.TorusGeometry(0.28, 0.025, 10, 28);
  geometries.push(wheelGeo);
  for (const wx of [-0.42, 0.42]) {
    const wheel = new THREE.Mesh(wheelGeo, M.dark);
    wheel.position.set(wx, 0.28, 0);
    wheel.rotation.y = Math.PI / 2;
    wheel.castShadow = true;
    bike.add(wheel);
  }
  addCylinder(bike, 0.02, 0.62, -0.18, 0.62, 0, M.metal);
  addCylinder(bike, 0.02, 0.45, 0.28, 0.55, 0, M.metal);
  addBox(bike, 0.5, 0.05, 0.18, 0.02, 0.96, 0, M.wood);
  addBox(bike, 0.28, 0.04, 0.22, -0.52, 0.92, 0, M.dark);
  bike.position.set(L + 1.35, 0.06, zFront - 0.35);
  bike.rotation.y = 0.35;
  site.add(bike);

  // a quiet scale figure on the path
  const figure = new THREE.Group();
  addCylinder(figure, 0.11, 0.62, 0, 1.0, 0, M.dark);
  addSphere(figure, 0.13, 0, 1.42, 0, M.dark);
  figure.position.set(L + 4.6, 0.05, zFront + 0.7);
  site.add(figure);

  const dispose = () => {
    const seenGeometries = new Set<THREE.BufferGeometry>();
    const seenMaterials = new Set<THREE.Material>();
    group.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        if (mesh.geometry && !seenGeometries.has(mesh.geometry)) {
          seenGeometries.add(mesh.geometry);
          mesh.geometry.dispose();
        }
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (m && !seenMaterials.has(m)) {
            seenMaterials.add(m);
            m.dispose();
          }
        });
      }
    });
  };

  return { group, site, levels, dispose };
}
