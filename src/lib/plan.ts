import {
  FACADES,
  FINISH_TIERS,
  FLOORING,
  FURNITURE_PACKS,
  type CostBreakdown,
  type CostLine,
  type PlanFloor,
  type Project,
  type Room,
} from "../types";

const BASE_W = 7.5;
const BASE_D = 12.4;
const BASE_ROOM_W = 3.7;
const BASE_ROOM_D = 5.0;

type BaseFloorKey = "ground" | "first" | "roof" | "second";

const baseRooms: Record<BaseFloorKey, Room[]> = {
  ground: [
    { id: "garage", name: "Garage", kind: "garage", x: 0, y: 0, w: 3.05, h: 5.2, furniture: "car" },
    { id: "foyer", name: "Entry", kind: "entry", x: 3.05, y: 0, w: 2.25, h: 2.2, furniture: "none" },
    { id: "stair", name: "Stair", kind: "stair", x: 5.3, y: 0, w: 2.2, h: 3.3, furniture: "stair" },
    { id: "passage", name: "Passage", kind: "open", x: 3.05, y: 2.2, w: 2.25, h: 3.0, furniture: "none" },
    { id: "powder", name: "W.C.", kind: "bath", x: 6.15, y: 3.55, w: 1.35, h: 1.65, furniture: "bath" },
    { id: "living", name: "Living", kind: "living", x: 0, y: 5.2, w: 4.4, h: 3.3, furniture: "sofa" },
    { id: "dining", name: "Dining", kind: "dining", x: 4.4, y: 5.2, w: 3.1, h: 3.3, furniture: "dining" },
    { id: "kitchen", name: "Kitchen", kind: "kitchen", x: 0, y: 8.5, w: 2.7, h: 2.7, furniture: "kitchen" },
    { id: "utility", name: "Utility", kind: "utility", x: 0, y: 11.2, w: 2.7, h: 1.2, furniture: "none" },
    { id: "bed-g", name: "Bedroom", kind: "bedroom", x: 2.7, y: 8.5, w: 4.8, h: 3.9, furniture: "bed" },
    { id: "bath-g", name: "Bath", kind: "bath", x: 5.55, y: 10.55, w: 1.95, h: 1.85, furniture: "bath" },
  ],
  first: [
    { id: "bed-2", name: "Bedroom 02", kind: "bedroom", x: 0, y: 0, w: 3.8, h: 4.6, furniture: "bed" },
    { id: "bath-2", name: "Bath", kind: "bath", x: 2.4, y: 3.15, w: 1.4, h: 1.45, furniture: "bath" },
    { id: "balcony", name: "Balcony", kind: "balcony", x: 3.8, y: 0, w: 3.7, h: 1.5, furniture: "garden", outdoor: true },
    { id: "lobby", name: "Landing", kind: "open", x: 3.8, y: 1.5, w: 1.6, h: 3.15, furniture: "none" },
    { id: "stair-f", name: "Stair", kind: "stair", x: 5.4, y: 1.5, w: 2.1, h: 3.15, furniture: "stair" },
    { id: "study", name: "Study", kind: "study", x: 0, y: 4.65, w: 2.6, h: 2.95, furniture: "desk" },
    { id: "lounge", name: "Family Lounge", kind: "lounge", x: 2.7, y: 4.65, w: 4.8, h: 2.95, furniture: "sofa" },
    { id: "master", name: "Master Bedroom", kind: "bedroom", x: 0, y: 7.6, w: 4.4, h: 4.8, furniture: "bed" },
    { id: "bath-m", name: "Bath", kind: "bath", x: 2.25, y: 10.35, w: 2.15, h: 2.05, furniture: "bath" },
    { id: "wardrobe", name: "Dressing", kind: "storage", x: 0, y: 10.35, w: 2.0, h: 2.05, furniture: "none" },
    { id: "bed-3", name: "Bedroom 03", kind: "bedroom", x: 4.4, y: 7.6, w: 3.1, h: 4.8, furniture: "bed" },
    { id: "bath-3", name: "Bath", kind: "bath", x: 5.85, y: 10.25, w: 1.65, h: 2.15, furniture: "bath" },
  ],
  roof: [
    { id: "roof-room", name: "Roof Room", kind: "roofroom", x: 0, y: 7.4, w: 3.7, h: 5.0, furniture: "bed" },
    { id: "roof-bath", name: "Bath", kind: "bath", x: 2.15, y: 10.25, w: 1.55, h: 1.75, furniture: "bath" },
    { id: "roof-stair", name: "Mumty", kind: "stair", x: 5.4, y: 1.5, w: 2.1, h: 3.15, furniture: "stair" },
    { id: "terrace", name: "Terrace", kind: "terrace", x: 0, y: 0, w: 7.5, h: 7.4, furniture: "garden", outdoor: true },
    { id: "pergola", name: "Pergola", kind: "pergola", x: 3.8, y: 7.8, w: 2.9, h: 3.2, furniture: "pergola", outdoor: true },
    { id: "solar", name: "Solar Array", kind: "terrace", x: 4.2, y: 1.0, w: 2.5, h: 2.2, furniture: "solar", outdoor: true },
    { id: "tank", name: "Water Tank", kind: "utility", x: 4.75, y: 4.2, w: 1.3, h: 1.1, furniture: "tank", outdoor: true },
  ],
  second: [
    { id: "bed-4", name: "Bedroom 04", kind: "bedroom", x: 0, y: 0, w: 3.8, h: 4.6, furniture: "bed" },
    { id: "bath-4", name: "Bath", kind: "bath", x: 2.4, y: 3.15, w: 1.4, h: 1.45, furniture: "bath" },
    { id: "terrace-s", name: "Terrace", kind: "terrace", x: 3.8, y: 0, w: 3.7, h: 1.5, furniture: "garden", outdoor: true },
    { id: "lobby-s", name: "Landing", kind: "open", x: 3.8, y: 1.5, w: 1.6, h: 3.15, furniture: "none" },
    { id: "stair-s", name: "Stair", kind: "stair", x: 5.4, y: 1.5, w: 2.1, h: 3.15, furniture: "stair" },
    { id: "play", name: "Bedroom 05", kind: "bedroom", x: 0, y: 4.65, w: 2.6, h: 2.95, furniture: "bed" },
    { id: "lounge-s", name: "Family Lounge", kind: "lounge", x: 2.7, y: 4.65, w: 4.8, h: 2.95, furniture: "sofa" },
    { id: "master-s", name: "Master Bedroom", kind: "bedroom", x: 0, y: 7.6, w: 4.4, h: 4.8, furniture: "bed" },
    { id: "bath-ms", name: "Bath", kind: "bath", x: 2.25, y: 10.35, w: 2.15, h: 2.05, furniture: "bath" },
    { id: "wardrobe-s", name: "Dressing", kind: "storage", x: 0, y: 10.35, w: 2.0, h: 2.05, furniture: "none" },
    { id: "bed-6", name: "Bedroom 06", kind: "bedroom", x: 4.4, y: 7.6, w: 3.1, h: 4.8, furniture: "bed" },
    { id: "bath-6", name: "Bath", kind: "bath", x: 5.85, y: 10.25, w: 1.65, h: 2.15, furniture: "bath" },
  ],
};

const kindNames: Record<Room["kind"], string> = {
  garage: "Open parking",
  entry: "Welcome",
  stair: "Connective",
  living: "Gathering",
  dining: "Shared meals",
  kitchen: "The hearth",
  utility: "Service",
  bedroom: "Rest",
  bath: "Wet zone",
  balcony: "Open air",
  terrace: "Sky deck",
  roofroom: "Flexible",
  lounge: "Family time",
  study: "Focus",
  open: "Circulation",
  pergola: "Shaded",
  storage: "Storage",
};

function scaleRoom(room: Room, sx: number, sy: number, ox: number, oy: number): Room {
  return {
    ...room,
    x: ox + room.x * sx,
    y: oy + room.y * sy,
    w: room.w * sx,
    h: room.h * sy,
  };
}

const dimsFor = (room: Room) => `${room.w.toFixed(2)} × ${room.h.toFixed(2)} m`;

export function getPlan(project: Project) {
  const side = project.settings.sideSetback;
  const buildWidth = Math.max(4.8, project.plot.width - side * 2);
  const buildDepth = Math.max(7.2, project.plot.depth - project.settings.frontSetback - project.settings.rearSetback);
  const sx = buildWidth / BASE_W;
  const sy = buildDepth / BASE_D;
  const ox = side;
  const oy = project.settings.frontSetback;

  const decorate = (floor: BaseFloorKey, label: string, level: number): PlanFloor => {
    let rooms = baseRooms[floor].map((r) => scaleRoom(r, sx, sy, ox, oy));

    if (floor === "ground") {
      if (!project.settings.garage) {
        rooms = rooms.map((r) =>
          r.id === "garage"
            ? { ...r, name: "Courtyard", kind: "open", furniture: "garden", outdoor: true }
            : r,
        );
      } else if (project.settings.garageType === "carport") {
        rooms = rooms.map((r) => (r.id === "garage" ? { ...r, name: "Carport" } : r));
      }
      if (!project.settings.pooja) rooms = rooms.filter((r) => r.id !== "pooja");
    }

    if (floor === "first" || floor === "second") {
      if (!project.settings.balcony) rooms = rooms.filter((r) => r.id !== "balcony" && r.id !== "terrace-s");
      if (!project.settings.studyNook) {
        const loungeId = floor === "second" ? "lounge-s" : "lounge";
        const studyId = floor === "second" ? "play" : "study";
        rooms = rooms
          .filter((r) => r.id !== studyId)
          .map((r) => (r.id === loungeId ? { ...r, x: ox, w: 7.5 * sx } : r));
      }
    }

    if (floor === "roof") {
      if (!project.settings.roofRoom) {
        rooms = rooms.filter((r) => r.id !== "roof-room" && r.id !== "roof-bath");
      }
      if (!project.settings.terraceGarden) {
        rooms = rooms.filter((r) => !["pergola", "tank"].includes(r.id));
      }
      if (!project.settings.solar) rooms = rooms.filter((r) => r.id !== "solar");
    }

    if (floor !== "ground") {
      const stairId = floor === "roof" ? "roof-stair" : floor === "second" ? "stair-s" : "stair-f";
      const stair = rooms.find((r) => r.id === stairId);
      return {
        id: floor === "second" ? "first" : floor,
        name: label,
        short: floor === "roof" ? "R" : floor === "second" ? "S" : floor === "first" ? "F" : "G",
        rooms: rooms.map((r) => ({ ...r, dims: dimsFor(r) })),
        stair,
        label: `${kindNames[stair?.kind ?? "stair"]} · ${stair ? dimsFor(stair) : ""}`,
        level,
      };
    }

    return {
      id: floor,
      name: label,
      short: "G",
      rooms: rooms.map((r) => ({ ...r, dims: dimsFor(r) })),
      label: "G + 1 · east entry",
      level,
    };
  };

  const ground = decorate("ground", "Ground floor", 0);
  const first = decorate("first", "First floor", 1);
  const second = decorate("second", "Second floor", 2);
  const roof = decorate("roof", "Roof terrace", 3);

  const floors: PlanFloor[] = project.settings.floors === 3
    ? [ground, first, second, roof]
    : project.settings.floors === 2
      ? [ground, first, roof]
      : [ground, roof];

  const buildArea = buildWidth * buildDepth;
  const roofRoom = roof.rooms.find((r) => r.id === "roof-room");
  const roofRoomArea = roofRoom ? roofRoom.w * roofRoom.h : 0;
  const balcony = first.rooms.find((r) => r.id === "balcony");
  const balconyArea = balcony ? balcony.w * balcony.h : 0;
  const garage = ground.rooms.find((r) => r.id === "garage");
  const garageArea = garage ? garage.w * garage.h : 0;
  const plotArea = project.plot.width * project.plot.depth;
  const habitableFloors = project.settings.floors;
  const totalBuilt = buildArea * habitableFloors + roofRoomArea;
  const carpetArea = totalBuilt * 0.82;

  return {
    width: project.plot.width,
    depth: project.plot.depth,
    plotWidth: project.plot.width,
    plotDepth: project.plot.depth,
    buildWidth,
    buildDepth,
    plotArea,
    buildArea,
    floors,
    totalBuilt,
    carpetArea,
    coverage: (buildArea / plotArea) * 100,
    roofRoomArea,
    balconyArea,
    garageArea,
    offset: { x: side, y: project.settings.frontSetback },
  };
}

export function getFloorPlan(project: Project, floor: "ground" | "first" | "roof", level?: number) {
  const plan = getPlan(project);
  if (floor === "roof") return plan.floors[plan.floors.length - 1];
  if (level !== undefined) {
    // The second-floor sheet is its own layout, not the first floor renamed.
    const exact = plan.floors.find((entry) => entry.level === level);
    if (exact) return exact;
  }
  if (floor === "first") {
    // Back-compat: the F tab shows the topmost habitable level.
    return project.settings.floors === 3 ? plan.floors[2] : plan.floors[1];
  }
  return plan.floors[0];
}

export function getCosts(project: Project): CostBreakdown {
  const plan = getPlan(project);
  const tier = FINISH_TIERS.find((t) => t.id === project.settings.finish) ?? FINISH_TIERS[2];
  const areaSqm = plan.totalBuilt;
  const areaSqft = areaSqm * 10.7639;
  const flooringUpgrade = FLOORING[project.settings.flooring].cost * areaSqft;
  const facadeUpgrade =
    (project.settings.facade === "sandstone"
      ? 0.018
      : project.settings.facade === "brick"
        ? 0.026
        : project.settings.facade === "terracotta"
          ? 0.008
          : 0) * areaSqft * tier.rate;
  const construction = areaSqft * tier.rate + flooringUpgrade + facadeUpgrade;

  const coreDistribution: { label: string; pct: number; note: string }[] = [
    { label: "Site prep & foundation", pct: 8, note: "Excavation, PCC, footings, plinth" },
    { label: "RCC frame & slabs", pct: 23, note: "Columns, beams, slabs, staircase" },
    { label: "Masonry & plaster", pct: 12, note: "AAC blocks, internal & external plaster" },
    { label: "Flooring & tiling", pct: 8, note: `${FLOORING[project.settings.flooring].name} finish` },
    { label: "Doors, windows & joinery", pct: 9, note: "Frames, shutters, hardware" },
    { label: "Kitchen", pct: 5, note: "Modular carcass, counters, sink" },
    { label: "Bathrooms & sanitary", pct: 5, note: "CP fittings, tiles, fixtures" },
    { label: "Electrical & lighting", pct: 5, note: "Wiring, boards, light points" },
    { label: "Plumbing & water", pct: 4, note: "Supply, drainage, overhead tank" },
    { label: "Painting & finishes", pct: 4, note: "Putty, primer, emulsion, polish" },
    { label: "Façade & external", pct: 5, note: FACADES[project.settings.facade].name },
    { label: "Roof & terrace", pct: 4, note: "Waterproofing, parapet, mumty" },
    { label: "Garage & driveway", pct: 4, note: project.settings.garage ? "Covered bay, shutter, paving" : "Open court, paving" },
    { label: "Compound & services", pct: 4, note: "Boundary, drainage, external plumbing" },
  ];

  const lines: CostLine[] = coreDistribution.map((item, i) => ({
    id: `core-${i}`,
    label: item.label,
    note: item.note,
    group: "Core build",
    amount: (construction * item.pct) / 100,
  }));

  const professional = construction * 0.05;
  const statutory = Math.max(85000, construction * 0.025);
  const contingency = construction * 0.05;

  lines.push(
    { id: "design", label: "Design, drawings & supervision", group: "Design & statutory", amount: professional, note: "5% of construction · architect, structural, MEP" },
    { id: "approvals", label: "Approvals & municipal charges", group: "Design & statutory", amount: statutory, note: "Sanction, betterment, water & sewer connections" },
    { id: "contingency", label: "Contingency buffer", group: "Design & statutory", amount: contingency, note: "5% · material and rate fluctuations" },
  );

  const enhancements: CostLine[] = [];
  const add = (id: string, amount: number, label: string, note: string) => {
    if (amount > 0) enhancements.push({ id, label, group: "Enhancements", amount, note });
  };
  add("garage-door", project.settings.garage ? (project.settings.garageDoor === "wood" ? 95000 : 68000) : 0, project.settings.garageType === "carport" ? "MS carport frame" : "Garage shutter & finish", "Sectional shutter, motor provision");
  add("solar", project.settings.solar ? 165000 : 0, "Rooftop solar · 3 kW", "Panels, inverter, net-metering");
  add("rainwater", project.settings.rainwater ? 42000 : 0, "Rainwater harvesting", "Pits, filter, recharge");
  add("ev", project.settings.evCharger ? 48000 : 0, "EV charger point", "7.4 kW AC wallbox provision");
  add("lift", project.settings.liftProvision ? 175000 : 0, "Lift shaft provision", "Shaft, pit & future lift wiring");
  add("false-ceiling", project.settings.falseCeiling ? Math.round(areaSqft * 38) : 0, "False ceiling & cove lighting", "Living, dining, bedrooms");
  add("ac", project.settings.acProvision ? 90000 : 0, "Air-conditioning provision", "5 indoor points, conduits, outdoor platforms");
  add("automation", project.settings.automation ? 135000 : 0, "Smart home essentials", "Lighting, fans, locks, app control");
  add("landscape", project.settings.landscaping ? 85000 : 0, "Landscape & planting", "Softscape, pots, drip irrigation");
  add("terrace", project.settings.terraceGarden ? 55000 : 0, "Terrace garden & pergola", "Planters, shade, outdoor lighting");
  add("stair", project.settings.stairType === "spiral" ? 185000 : project.settings.stairType === "l-shaped" ? 95000 : 0, `${project.settings.stairType === "spiral" ? "Spiral" : "L-shaped"} staircase`, "Steel + stone treads, handrail");
  add("windows", project.settings.windowStyle === "full-height" ? Math.round(areaSqft * 28) : project.settings.windowStyle === "arched" ? Math.round(areaSqft * 14) : 0, `${project.settings.windowStyle === "full-height" ? "Full-height" : "Arched"} glazing`, "Taller openings, better daylight");
  add("doors", project.settings.doorStyle === "glass" ? 78000 : project.settings.doorStyle === "panelled" ? 32000 : 0, `${project.settings.doorStyle === "glass" ? "Glass" : "Panelled"} doors`, "Interior + entry leaf upgrade");

  // saved projects from before furniture existed have no list yet
  const customFurnitureTotal = (project.settings.customFurniture ?? []).reduce((sum, item) => sum + item.cost * item.qty, 0);
  const customApplianceTotal = (project.settings.customAppliances ?? []).reduce((sum, item) => sum + item.cost * item.qty, 0);
  const interiors = project.settings.furnishing
    ? project.settings.furniturePack === "custom"
      ? project.settings.furnitureBudget + customFurnitureTotal
      : Math.round(areaSqft * (FURNITURE_PACKS.find((pack) => pack.id === project.settings.furniturePack)?.rate ?? 285)) + customFurnitureTotal
    : 0;
  if (interiors) {
    const pack = FURNITURE_PACKS.find((item) => item.id === project.settings.furniturePack) ?? FURNITURE_PACKS[1];
    const interiorLabel = project.settings.furniturePack === "custom" ? "Interiors — your own mix" : `Interiors — ${pack.name} pack`;
    const extra = customFurnitureTotal > 0 ? ` · +${Math.round(customFurnitureTotal / 1000)}k furniture` : "";
    const interiorNote = project.settings.furniturePack === "custom" ? "Your own furniture budget + picked pieces" : pack.includes.join(" · ");
    lines.push({ id: "interiors", label: `${interiorLabel}${extra}`, group: "Interiors", amount: interiors, note: interiorNote });
    for (const item of project.settings.customFurniture ?? []) {
      lines.push({ id: `custom-${item.id}`, label: `— ${item.name} × ${item.qty}`, group: "Interiors", amount: item.cost * item.qty, note: item.note ?? "Picked piece" });
    }
  }
  if (customApplianceTotal > 0) {
    lines.push({ id: "appliances", label: "Appliances", group: "Enhancements", amount: customApplianceTotal, note: "Kitchen, laundry, climate, cleaning, entertainment" });
    for (const item of project.settings.customAppliances ?? []) {
      lines.push({ id: `appliance-${item.id}`, label: `— ${item.name} × ${item.qty}`, group: "Enhancements", amount: item.cost * item.qty, note: item.note ?? "Appliance" });
    }
  }
  lines.push(...enhancements);

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const areaSqftRounded = Math.round(areaSqft);

  return {
    lines,
    construction,
    professional,
    statutory,
    contingency,
    enhancements: enhancements.reduce((sum, line) => sum + line.amount, 0),
    interiors,
    total,
    perSqft: total / areaSqftRounded,
    areaSqft: areaSqftRounded,
    rate: tier.rate,
    tierName: tier.name,
  };
}

export function getBudgetReadout(project: Project) {
  const costs = getCosts(project);
  const gap = project.budget - costs.total;
  const coverage = Math.min(999, (project.budget / costs.total) * 100);
  const phases = [
    { name: "Foundation & ground structure", share: 17, detail: "Excavation, plinth, columns, GF slab" },
    { name: "Ground floor completion", share: 20, detail: "Walls, plaster, flooring, kitchen, bath" },
    { name: "First floor structure", share: 19, detail: "Columns, beams, slab, staircase" },
    { name: "First floor completion", share: 18, detail: "Envelope, wet areas, fit-out" },
    { name: "Roof room & terrace", share: 10, detail: "Mumty, waterproofing, pergola, solar" },
    { name: "Interiors & handover", share: 16, detail: "Furniture, styling, snagging, keys" },
  ];
  let running = 0;
  const phaseRows = phases.map((p) => {
    const amount = (costs.total * p.share) / 100;
    const start = running;
    running += amount;
    return {
      ...p,
      amount,
      covered: project.budget >= running,
      partial: project.budget > start && project.budget < running,
      progress: Math.max(0, Math.min(1, (project.budget - start) / amount)),
    };
  });
  return { costs, gap, coverage, phases: phaseRows };
}

export function suggestedTier(project: Project, budget: number): { tier: (typeof FINISH_TIERS)[number]; fits: boolean } {
  const base = { ...project, settings: { ...project.settings, furnishing: false, solar: false, automation: false, liftProvision: false, evCharger: false } };
  let best = FINISH_TIERS[0];
  for (const tier of FINISH_TIERS) {
    const test = { ...base, settings: { ...base.settings, finish: tier.id } };
    if (getCosts(test).total <= budget) best = tier;
  }
  return { tier: best, fits: getCosts({ ...base, settings: { ...base.settings, finish: best.id } }).total <= budget };
}

export function annualEnergySaving(project: Project) {
  return project.settings.solar ? 42000 : 0;
}
