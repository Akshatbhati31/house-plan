import type { PaletteId, Project, ProjectSettings, ThemeMode } from "../types";

const svgData = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const archSwatch = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d6b89c"/><stop offset="1" stop-color="#b76a4e"/></linearGradient></defs>
  <rect width="800" height="600" fill="#e9e0d2"/>
  <rect x="0" y="420" width="800" height="180" fill="#d8c9b6"/>
  <path d="M190 500 L190 250 C190 130 610 130 610 250 L610 500 Z" fill="url(#g)" opacity=".92"/>
  <path d="M250 500 L250 280 C250 185 550 185 550 280 L550 500 Z" fill="#29251f"/>
  <path d="M280 500 L280 300 C280 225 520 225 520 300 L520 500 Z" fill="#f2e9da"/>
  <circle cx="650" cy="440" r="45" fill="#68785f"/><circle cx="690" cy="470" r="30" fill="#7e8f70"/>
  <rect x="60" y="500" width="100" height="8" fill="#a98565" opacity=".5"/>
  <rect x="0" y="560" width="800" height="14" fill="#c86d51" opacity=".5"/>
  <text x="58" y="80" font-family="Georgia" font-size="26" fill="#4a4035">arch + warm render</text>
</svg>`);

const materialSwatch = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#efece6"/>
  <rect x="50" y="50" width="330" height="220" rx="8" fill="#c86d51"/>
  <rect x="400" y="50" width="350" height="220" rx="8" fill="#b08a63"/>
  <rect x="50" y="290" width="330" height="260" rx="8" fill="#3d4f41"/>
  <rect x="400" y="290" width="350" height="260" rx="8" fill="#d9cdbb"/>
  <circle cx="293" cy="160" r="40" fill="#e0a286" opacity=".5"/>
  <path d="M430 220 C470 130 560 90 690 95" stroke="#f5ecd9" fill="none" stroke-width="2" opacity=".5"/>
  <text x="76" y="520" font-family="Georgia" font-size="24" fill="#f4f1ea">earth</text>
  <text x="430" y="520" font-family="Georgia" font-size="24" fill="#554b40">stone / oak / plaster</text>
</svg>`);

const courtyardSwatch = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#dad6c7"/>
  <rect x="0" y="0" width="800" height="220" fill="#eae5d9"/>
  <rect x="90" y="220" width="620" height="290" fill="#c2b8a3"/>
  <rect x="150" y="300" width="500" height="20" fill="#eee4d5" opacity=".5"/>
  <rect x="240" y="220" width="320" height="290" fill="#4c5d4b"/>
  <circle cx="400" cy="335" r="90" fill="#70856b"/>
  <circle cx="300" cy="390" r="45" fill="#899d7f"/>
  <circle cx="505" cy="420" r="55" fill="#5f745e"/>
  <path d="M250 220 C320 120 480 120 550 220" stroke="#9b8468" stroke-width="10" fill="none"/>
  <text x="70" y="90" font-family="Georgia" font-size="26" fill="#5c5549">courtyard as a room</text>
</svg>`);

export const defaultSettings = (): ProjectSettings => ({
  floors: 2,
  roofRoom: true,
  garage: true,
  garageType: "covered",
  balcony: true,
  pooja: true,
  studyNook: true,
  openKitchen: false,
  terraceGarden: true,
  solar: true,
  rainwater: true,
  evCharger: false,
  liftProvision: false,
  falseCeiling: true,
  acProvision: true,
  automation: false,
  furnishing: true,
  furniturePack: "comfort",
  furnitureBudget: 600000,
  customFurniture: [],
  customAppliances: [],
  landscaping: true,
  vastu: true,
  finish: "signature",
  garageDoor: "wood",
  facade: "terracotta",
  flooring: "vitrified",
  frontSetback: 1.2,
  rearSetback: 1.2,
  sideSetback: 0.3,
  showFurniture: true,
  showDimensions: true,
  planMode: "paper",
  stairType: "straight",
  stairWidth: 1.05,
  windowStyle: "standard",
  doorStyle: "panelled",
});

export const project1: Project = {
  id: "project1",
  name: "Project 01",
  location: "Shastri Nagar, Meerut",
  createdAt: "2026-10-24T09:10:00.000Z",
  updatedAt: "2026-11-05T10:30:00.000Z",
  plot: { width: 7.5, depth: 15 },
  orientation: "East",
  style: "Warm contemporary",
  budget: 6000000,
  mapSource: "sketch",
  detectedNotes: [
    "Plot measures 7.5 m across the front and 15 m deep",
    "Total area reads 112.5 sq. m (≈ 1,211 sq. ft)",
    "Compass marks east toward the shorter frontage",
    "Hand-drawn source · single ownership note",
  ],
  settings: defaultSettings(),
  references: [
    { id: "ref-arch", name: "Arched entry study", dataUrl: archSwatch, note: "A soft arch at the entrance — keeps the narrow frontage from feeling tight." },
    { id: "ref-material", name: "Material direction", dataUrl: materialSwatch, note: "Terracotta, oak and forest sage. Matte over gloss." },
    { id: "ref-court", name: "Courtyard reference", dataUrl: courtyardSwatch, note: "Borrow light from the rear utility court." },
  ],
  approval: "concept",
};

export interface StoredSettings {
  theme: ThemeMode;
  palette: PaletteId;
  reducedMotion: boolean;
  paletteApproved: boolean;
}

export const defaultAppSettings: StoredSettings = {
  theme: "dark",
  palette: "copper",
  reducedMotion: false,
  paletteApproved: false,
};

export function createProject(partial?: Omit<Partial<Project>, "settings"> & { settings?: Partial<ProjectSettings> }): Project {
  const now = new Date().toISOString();
  const base: Project = {
    id: `p-${Math.random().toString(36).slice(2, 9)}`,
    name: "Untitled home",
    location: "Meerut, Uttar Pradesh",
    createdAt: now,
    updatedAt: now,
    plot: { width: 7.5, depth: 15 },
    orientation: "East",
    style: "Warm contemporary",
    budget: 5000000,
    mapSource: "upload",
    detectedNotes: [],
    settings: defaultSettings(),
    references: [],
    approval: "concept",
  };
  return {
    ...base,
    ...partial,
    plot: { ...base.plot, ...partial?.plot },
    settings: { ...base.settings, ...partial?.settings },
    references: partial?.references ?? base.references,
  };
}

export const sampleProjects: Project[] = [project1];
