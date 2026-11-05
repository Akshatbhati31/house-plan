export const ORIENTATIONS = ["East", "West", "North", "South"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export interface OrientationGuide {
  lower: string;
  facing: string;
  light: string;
  title: string;
  porch: string;
  passive: string;
  site: string;
  model: string;
  compass: string;
  compassLeft: string;
}

export function orientationGuide(orientation: Orientation): OrientationGuide {
  const guides: Record<Orientation, OrientationGuide> = {
    East: {
      lower: "east",
      facing: "east-facing",
      light: "East light",
      title: "Morning in the living room",
      porch: "The east porch shades the entry by afternoon.",
      passive: "East light in the morning, shade at the entry by afternoon.",
      site: "Morning light at the entry, shaded courtyard to the rear.",
      model: "the porch catches the first light and the living room stays bright without overheating",
      compass: "E",
      compassLeft: "N",
    },
    West: {
      lower: "west",
      facing: "west-facing",
      light: "West light",
      title: "Evening in the living room",
      porch: "The west porch shields the entry from the late sun.",
      passive: "West light in the evening, a cool entry through the afternoon.",
      site: "Evening light at the entry, morning sun in the rear court.",
      model: "the porch filters the low afternoon sun and the living room stays cool into the evening",
      compass: "W",
      compassLeft: "S",
    },
    North: {
      lower: "north",
      facing: "north-facing",
      light: "North light",
      title: "Even light in the living room",
      porch: "The north porch keeps the entry in soft, even light.",
      passive: "Soft north light all day, deep shade at the entry.",
      site: "Soft, even light at the entry, warm sun in the rear court.",
      model: "the porch takes the soft, even light and the living room stays bright without glare",
      compass: "N",
      compassLeft: "W",
    },
    South: {
      lower: "south",
      facing: "south-facing",
      light: "South light",
      title: "Shade through the midday",
      porch: "The south porch and screens cut the midday glare.",
      passive: "High south sun screened at midday, open light morning and evening.",
      site: "Midday sun screened at the entry, gentle light in the rear court.",
      model: "the porch and screens cut the high midday sun while the living room stays open to the garden",
      compass: "S",
      compassLeft: "E",
    },
  };
  return guides[orientation];
}

export type FurniturePackId = "essential" | "comfort" | "luxury" | "custom";

export interface FurniturePack {
  id: FurniturePackId;
  name: string;
  rate: number;
  fabric: string;
  summary: string;
  includes: string[];
}

export const FURNITURE_PACKS: FurniturePack[] = [
  { id: "essential", name: "Essential", rate: 145, fabric: "#cbc6b8", summary: "Fitted, washable basics", includes: ["Beds + wardrobes", "2-seat sofa", "4-seat dining", "Curtains"] },
  { id: "comfort", name: "Comfort", rate: 285, fabric: "#9a9788", summary: "The complete family home", includes: ["All of Essential, plus:", "3-seat sofa + lounge chairs", "6-seat dining, TV unit", "Lighting, décor, bedding"] },
  { id: "luxury", name: "Luxe", rate: 520, fabric: "#4d5250", summary: "Designer, made-to-measure", includes: ["All of Comfort, plus:", "Bespoke joinery + veneer", "Home theatre + bar cart", "Art, rugs, tableware"] },
];

export interface CustomFurnitureItem {
  id: string;
  name: string;
  qty: number;
  cost: number;
  note?: string;
}

// Inline SVG previews for catalog tiles — drawn once, no network images.
const iconSvg = (inner: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="64" viewBox="0 0 96 64"><rect width="96" height="64" fill="#2c2a27"/><g fill="none" stroke="#e08a6e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`)}`;

export const FURNITURE_CATALOG: { id: string; name: string; cost: number; category: string }[] = [
  { id: "sofa-3", name: "3-seat sofa", cost: 48500, category: "Living" },
  { id: "sofa-2", name: "2-seat sofa", cost: 32000, category: "Living" },
  { id: "lounge-chair", name: "Lounge chair (bergère)", cost: 18500, category: "Living" },
  { id: "coffee-table", name: "Coffee table", cost: 12500, category: "Living" },
  { id: "tv-unit", name: "TV unit", cost: 28000, category: "Living" },
  { id: "bookshelf", name: "Bookshelf / bookcase", cost: 19500, category: "Living" },
  { id: "armchair", name: "Armchair", cost: 16500, category: "Living" },
  { id: "club-chair", name: "Club chair", cost: 24000, category: "Living" },
  { id: "chaise", name: "Chaise lounge", cost: 31500, category: "Living" },
  { id: "recliner", name: "Recliner", cost: 29500, category: "Living" },
  { id: "sectional-sofa", name: "Sectional sofa (L)", cost: 68000, category: "Living" },
  { id: "sofa-bed", name: "Sofa bed", cost: 34000, category: "Living" },
  { id: "futon", name: "Futon", cost: 22000, category: "Living" },
  { id: "footrest", name: "Footrest / ottoman", cost: 6500, category: "Living" },
  { id: "tuffet", name: "Tuffet", cost: 5800, category: "Living" },
  { id: "end-table", name: "End table", cost: 7200, category: "Living" },
  { id: "console", name: "Console table", cost: 11800, category: "Living" },
  { id: "credenza", name: "Credenza / sideboard", cost: 26500, category: "Living" },
  { id: "cabinet", name: "Display cabinet", cost: 31000, category: "Living" },
  { id: "display-cabinet", name: "China cabinet", cost: 34000, category: "Living" },
  { id: "card-table", name: "Card / game table", cost: 21000, category: "Living" },
  { id: "tea-cart", name: "Tea cart", cost: 8900, category: "Living" },
  { id: "cushion", name: "Cushion set (5)", cost: 4500, category: "Soft" },
  { id: "throw-rug", name: "Throw rug", cost: 6800, category: "Soft" },
  { id: "standing-lamp", name: "Standing lamp", cost: 8500, category: "Lighting" },
  { id: "chandelier", name: "Chandelier", cost: 22000, category: "Lighting" },
  { id: "sconce", name: "Wall sconces (pair)", cost: 6800, category: "Lighting" },
  { id: "room-divider", name: "Room divider screen", cost: 14500, category: "Living" },
  { id: "folding-screen", name: "Folding screen", cost: 9900, category: "Living" },
  { id: "dining-6", name: "6-seat dining", cost: 42000, category: "Dining" },
  { id: "dining-4", name: "4-seat dining", cost: 29500, category: "Dining" },
  { id: "dining-8", name: "8-seat dining", cost: 56000, category: "Dining" },
  { id: "captain-chair", name: "Captain's chair", cost: 9800, category: "Dining" },
  { id: "bentwood-rocker", name: "Bentwood rocker", cost: 16500, category: "Dining" },
  { id: "bench", name: "Dining bench", cost: 14800, category: "Dining" },
  { id: "bar-stool", name: "Bar stool", cost: 7200, category: "Dining" },
  { id: "gateleg", name: "Gateleg table", cost: 18500, category: "Dining" },
  { id: "kitchen-island", name: "Kitchen island", cost: 32000, category: "Kitchen" },
  { id: "island-cart", name: "Kitchen trolley / island cart", cost: 11500, category: "Kitchen" },
  { id: "bed-queen", name: "Queen bed + headboard", cost: 38000, category: "Bedrooms" },
  { id: "bed-king", name: "King bed + headboard", cost: 52000, category: "Bedrooms" },
  { id: "canopy-bed", name: "Canopy bed", cost: 61000, category: "Bedrooms" },
  { id: "four-poster", name: "Four-poster bed", cost: 68000, category: "Bedrooms" },
  { id: "bunk-bed", name: "Bunk bed", cost: 24000, category: "Bedrooms" },
  { id: "trundle", name: "Trundle bed", cost: 13500, category: "Bedrooms" },
  { id: "murphy-bed", name: "Murphy bed (wall)", cost: 44000, category: "Bedrooms" },
  { id: "bassinet", name: "Bassinet / crib", cost: 11500, category: "Bedrooms" },
  { id: "cradle", name: "Cradle", cost: 8200, category: "Bedrooms" },
  { id: "wardrobe", name: "2-door wardrobe", cost: 34000, category: "Bedrooms" },
  { id: "armoire", name: "Armoire", cost: 41000, category: "Bedrooms" },
  { id: "chest-drawers", name: "Chest of drawers", cost: 19500, category: "Bedrooms" },
  { id: "dresser", name: "Dresser + mirror", cost: 18500, category: "Bedrooms" },
  { id: "vanity", name: "Vanity + stool", cost: 15200, category: "Bedrooms" },
  { id: "nightstand", name: "Nightstand", cost: 5800, category: "Bedrooms" },
  { id: "headboard", name: "Headboard panel", cost: 6800, category: "Bedrooms" },
  { id: "hope-chest", name: "Hope chest", cost: 12400, category: "Bedrooms" },
  { id: "curtains", name: "Sheer + blackout curtains", cost: 22500, category: "Soft" },
  { id: "rug", name: "Handloom rug", cost: 11500, category: "Soft" },
  { id: "bedding", name: "Bedding + cushion set", cost: 13500, category: "Soft" },
  { id: "desk", name: "Writing desk", cost: 14500, category: "Study" },
  { id: "desk-chair", name: "Desk chair", cost: 9800, category: "Study" },
  { id: "office-chair", name: "Office chair", cost: 12500, category: "Work" },
  { id: "secretary", name: "Secretary desk", cost: 16500, category: "Study" },
  { id: "file-cabinet", name: "File cabinet (3-drawer)", cost: 7800, category: "Work" },
  { id: "bookshelf-2", name: "Bookshelf (study)", cost: 16500, category: "Study" },
  { id: "rocker", name: "Rocking chair", cost: 15200, category: "Living" },
  { id: "glider", name: "Glider rocker", cost: 18500, category: "Living" },
  { id: "beach-chair", name: "Beach / sun lounger", cost: 11500, category: "Outdoor" },
  { id: "deck-chair", name: "Deck chair", cost: 6800, category: "Outdoor" },
  { id: "garden-bench", name: "Garden bench", cost: 9800, category: "Outdoor" },
  { id: "patio-chair", name: "Patio chair", cost: 6500, category: "Outdoor" },
  { id: "patio-table", name: "Patio table", cost: 8500, category: "Outdoor" },
  { id: "picnic-table", name: "Picnic / fold-out table", cost: 9800, category: "Outdoor" },
  { id: "porch-swing", name: "Porch swing", cost: 14500, category: "Outdoor" },
  { id: "hammock", name: "Hammock + stand", cost: 8900, category: "Outdoor" },
  { id: "highchair", name: "Highchair", cost: 6200, category: "Dining" },
  { id: "grandfather-clock", name: "Grandfather clock", cost: 32000, category: "Décor" },
  { id: "hall-tree", name: "Hall tree", cost: 7200, category: "Entry" },
  { id: "hat-stand", name: "Hat stand", cost: 6800, category: "Entry" },
  { id: "rack", name: "Wall shelf + hooks", cost: 4500, category: "Entry" },
  { id: "mirror", name: "Full-length mirror", cost: 8900, category: "Décor" },
  { id: "mantel", name: "Fireplace mantel", cost: 19500, category: "Décor" },
  { id: "art", name: "Framed art set", cost: 9800, category: "Décor" },
  { id: "plant", name: "Indoor plants (set of 4)", cost: 4200, category: "Décor" },
  { id: "vanity-2", name: "Vanity mirror + stool", cost: 9200, category: "Bedrooms" },
  { id: "ottoman", name: "Ottoman", cost: 5800, category: "Living" },
  { id: "easy-chair", name: "Easy chair", cost: 15800, category: "Living" },
  { id: "fauteuil", name: "Fauteuil (accent chair)", cost: 17500, category: "Living" },
  { id: "ladderback", name: "Ladderback chair", cost: 6500, category: "Dining" },
  { id: "windsor", name: "Windsor chair", cost: 8900, category: "Dining" },
  { id: "wing-chair", name: "Wing chair", cost: 16500, category: "Living" },
  { id: "lift-chair", name: "Lift / recliner chair", cost: 24500, category: "Living" },
  { id: "cabinet-hutch", name: "Kitchen hutch", cost: 15500, category: "Kitchen" },
  { id: "pantry", name: "Pantry unit (tall)", cost: 24500, category: "Kitchen" },
  { id: "work-table", name: "Work table", cost: 12500, category: "Work" },
  { id: "bean-bag", name: "Bean bag", cost: 3200, category: "Living" },
  { id: "hassock", name: "Hassock", cost: 2100, category: "Living" },
  { id: "bench-entry", name: "Entry bench", cost: 8900, category: "Entry" },
  { id: "pew", name: "Pew / long bench", cost: 12500, category: "Living" },
  { id: "vitrine", name: "Vitrine / display case", cost: 21000, category: "Living" },
  { id: "venetian", name: "Venetian blinds (per window)", cost: 2500, category: "Soft" },
  { id: "window-shades", name: "Roman window shade", cost: 3200, category: "Soft" },
  { id: "valet", name: "Clothes valet stand", cost: 3500, category: "Bedrooms" },
  { id: "waste-basket", name: "Waste basket set", cost: 900, category: "Décor" },
  { id: "director-chair", name: "Director's chair", cost: 13500, category: "Living" },
  { id: "lawn-chair", name: "Lawn chair", cost: 4500, category: "Outdoor" },
  { id: "easel", name: "Art easel", cost: 2800, category: "Study" },
  { id: "clothes-valet", name: "Clothes valet (bedroom)", cost: 3200, category: "Bedrooms" },
  { id: "piano-bench", name: "Piano bench", cost: 6800, category: "Music" },
  { id: "lift-recliner-2", name: "Power recliner", cost: 28500, category: "Living" },
  { id: "sleeper-sofa", name: "Sleeper sofa", cost: 36500, category: "Living" },
  { id: "love-seat", name: "Loveseat (2-seater)", cost: 26500, category: "Living" },
  { id: "settee", name: "Settee", cost: 31500, category: "Living" },
  { id: "footstool", name: "Footstool (pair)", cost: 3800, category: "Living" },
  { id: "fridge", name: "Refrigerator / freezer (double-door)", cost: 48500, category: "Kitchen · Cooking" },
  { id: "gas-range", name: "Gas range / stove (4-burner)", cost: 38500, category: "Kitchen · Cooking" },
  { id: "induction", name: "Induction cooktop", cost: 12500, category: "Kitchen · Cooking" },
  { id: "wall-oven", name: "Wall oven (built-in)", cost: 42000, category: "Kitchen · Cooking" },
  { id: "microwave", name: "Microwave oven", cost: 11500, category: "Kitchen · Cooking" },
  { id: "dishwasher", name: "Dishwasher", cost: 28500, category: "Kitchen · Cooking" },
  { id: "chimney", name: "Range hood / chimney", cost: 9500, category: "Kitchen · Cooking" },
  { id: "wine-cooler", name: "Wine cooler", cost: 38000, category: "Kitchen · Cooking" },
  { id: "blender", name: "Blender & mixer grinder", cost: 4500, category: "Kitchen · Countertop" },
  { id: "food-processor", name: "Food processor", cost: 6800, category: "Kitchen · Countertop" },
  { id: "air-fryer", name: "Air fryer", cost: 6500, category: "Kitchen · Countertop" },
  { id: "rice-cooker", name: "Rice cooker / multicooker", cost: 4200, category: "Kitchen · Countertop" },
  { id: "slow-cooker", name: "Slow cooker", cost: 3500, category: "Kitchen · Countertop" },
  { id: "toaster", name: "Toaster / toaster oven", cost: 3800, category: "Kitchen · Countertop" },
  { id: "coffee-maker", name: "Coffee maker / espresso machine", cost: 8500, category: "Kitchen · Countertop" },
  { id: "kettle", name: "Electric kettle", cost: 1800, category: "Kitchen · Countertop" },
  { id: "juicer", name: "Juicer", cost: 2800, category: "Kitchen · Countertop" },
  { id: "washer", name: "Washing machine (front-load)", cost: 38500, category: "Laundry" },
  { id: "dryer", name: "Clothes dryer", cost: 32000, category: "Laundry" },
  { id: "iron", name: "Steam iron", cost: 2800, category: "Laundry" },
  { id: "sewing", name: "Electric sewing machine", cost: 9500, category: "Laundry" },
  { id: "split-ac", name: "Split AC (1.5 ton)", cost: 42000, category: "Climate" },
  { id: "window-ac", name: "Window AC", cost: 28500, category: "Climate" },
  { id: "air-cooler", name: "Air cooler", cost: 9500, category: "Climate" },
  { id: "heater", name: "Room heater", cost: 3200, category: "Climate" },
  { id: "ceiling-fan", name: "Ceiling fan", cost: 3800, category: "Climate" },
  { id: "air-purifier", name: "Air purifier", cost: 12500, category: "Climate" },
  { id: "humidifier", name: "Humidifier", cost: 3500, category: "Climate" },
  { id: "geyser", name: "Water heater / geyser (25 L)", cost: 11500, category: "Climate" },
  { id: "vacuum", name: "Vacuum cleaner", cost: 6500, category: "Cleaning" },
  { id: "steam-cleaner", name: "Steam cleaner", cost: 8500, category: "Cleaning" },
  { id: "water-purifier", name: "Water purifier (RO)", cost: 14500, category: "Cleaning" },
  { id: "sound-system", name: "Sound system / speakers", cost: 18500, category: "Entertainment" },
  { id: "hair-dryer", name: "Hair dryer + straightener", cost: 3200, category: "Personal care" },
  { id: "trimmer", name: "Electric trimmer", cost: 2500, category: "Personal care" },
];
export const APPLIANCE_CATALOG: { id: string; name: string; cost: number; category: string }[] = [
  { id: "fridge", name: "Refrigerator / freezer (double-door)", cost: 48500, category: "Kitchen - Cooking" },
  { id: "gas-range", name: "Gas range / stove (4-burner)", cost: 38500, category: "Kitchen - Cooking" },
  { id: "induction", name: "Induction cooktop", cost: 12500, category: "Kitchen - Cooking" },
  { id: "wall-oven", name: "Wall oven (built-in)", cost: 42000, category: "Kitchen - Cooking" },
  { id: "microwave", name: "Microwave oven", cost: 11500, category: "Kitchen - Cooking" },
  { id: "dishwasher", name: "Dishwasher", cost: 28500, category: "Kitchen - Cooking" },
  { id: "chimney", name: "Range hood / chimney", cost: 9500, category: "Kitchen - Cooking" },
  { id: "wine-cooler", name: "Wine cooler", cost: 38000, category: "Kitchen - Cooking" },
  { id: "blender", name: "Blender and mixer grinder", cost: 4500, category: "Kitchen - Countertop" },
  { id: "food-processor", name: "Food processor", cost: 6800, category: "Kitchen - Countertop" },
  { id: "air-fryer", name: "Air fryer", cost: 6500, category: "Kitchen - Countertop" },
  { id: "rice-cooker", name: "Rice cooker / multicooker", cost: 4200, category: "Kitchen - Countertop" },
  { id: "slow-cooker", name: "Slow cooker", cost: 3500, category: "Kitchen - Countertop" },
  { id: "toaster", name: "Toaster / toaster oven", cost: 3800, category: "Kitchen - Countertop" },
  { id: "coffee-maker", name: "Coffee maker / espresso machine", cost: 8500, category: "Kitchen - Countertop" },
  { id: "kettle", name: "Electric kettle", cost: 1800, category: "Kitchen - Countertop" },
  { id: "juicer", name: "Juicer", cost: 2800, category: "Kitchen - Countertop" },
  { id: "washer", name: "Washing machine (front-load)", cost: 38500, category: "Laundry" },
  { id: "dryer", name: "Clothes dryer", cost: 32000, category: "Laundry" },
  { id: "iron", name: "Steam iron", cost: 2800, category: "Laundry" },
  { id: "sewing", name: "Electric sewing machine", cost: 9500, category: "Laundry" },
  { id: "split-ac", name: "Split AC (1.5 ton)", cost: 42000, category: "Climate" },
  { id: "window-ac", name: "Window AC", cost: 28500, category: "Climate" },
  { id: "air-cooler", name: "Air cooler", cost: 9500, category: "Climate" },
  { id: "heater", name: "Room heater", cost: 3200, category: "Climate" },
  { id: "ceiling-fan", name: "Ceiling fan", cost: 3800, category: "Climate" },
  { id: "air-purifier", name: "Air purifier", cost: 12500, category: "Climate" },
  { id: "humidifier", name: "Humidifier", cost: 3500, category: "Climate" },
  { id: "geyser", name: "Water heater / geyser (25 L)", cost: 11500, category: "Climate" },
  { id: "vacuum", name: "Vacuum cleaner", cost: 6500, category: "Cleaning" },
  { id: "steam-cleaner", name: "Steam cleaner", cost: 8500, category: "Cleaning" },
  { id: "water-purifier", name: "Water purifier (RO)", cost: 14500, category: "Cleaning" },
  { id: "tv-55", name: "TV (55 inch)", cost: 48000, category: "Entertainment" },
  { id: "sound-system", name: "Sound system / speakers", cost: 18500, category: "Entertainment" },
  { id: "hair-dryer", name: "Hair dryer + straightener", cost: 3200, category: "Personal care" },
  { id: "trimmer", name: "Electric trimmer", cost: 2500, category: "Personal care" },
];

export type FinishTier = "essential" | "standard" | "signature" | "luxe";
export type FacadeId = "terracotta" | "sandstone" | "limewash" | "brick";
export type FlooringId = "vitrified" | "marble" | "kota" | "oak";
export type ThemeMode = "dark" | "light";
export type PaletteId = "copper" | "clay" | "brass";

export interface ProjectSettings {
  floors: 1 | 2 | 3;
  roofRoom: boolean;
  garage: boolean;
  garageType: "covered" | "carport";
  balcony: boolean;
  pooja: boolean;
  studyNook: boolean;
  openKitchen: boolean;
  terraceGarden: boolean;
  solar: boolean;
  rainwater: boolean;
  evCharger: boolean;
  liftProvision: boolean;
  falseCeiling: boolean;
  acProvision: boolean;
  automation: boolean;
  furnishing: boolean;
  furniturePack: "none" | "essential" | "comfort" | "luxury" | "custom";
  furnitureBudget: number;
  customFurniture: CustomFurnitureItem[];
  customAppliances: CustomFurnitureItem[];
  landscaping: boolean;
  vastu: boolean;
  finish: FinishTier;
  garageDoor: "wood" | "metal";
  facade: FacadeId;
  flooring: FlooringId;
  frontSetback: number;
  rearSetback: number;
  sideSetback: number;
  showFurniture: boolean;
  showDimensions: boolean;
  planMode: "paper" | "blueprint";
  stairType: "straight" | "l-shaped" | "spiral";
  stairWidth: number;
  windowStyle: "standard" | "arched" | "full-height";
  doorStyle: "flush" | "panelled" | "glass";
}

export interface ReferenceImage {
  id: string;
  name: string;
  dataUrl: string;
  note?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  plot: {
    width: number;
    depth: number;
  };
  orientation: "East" | "West" | "North" | "South";
  style: "Warm contemporary" | "Quiet minimal" | "Modern Indian" | "Soft brutalist";
  budget: number;
  mapImage?: string;
  mapSource: "sketch" | "upload";
  detectedNotes: string[];
  settings: ProjectSettings;
  references: ReferenceImage[];
  approval: "concept" | "approved";
}

export interface Room {
  id: string;
  name: string;
  kind:
    | "garage"
    | "entry"
    | "stair"
    | "living"
    | "dining"
    | "kitchen"
    | "utility"
    | "bedroom"
    | "bath"
    | "balcony"
    | "terrace"
    | "roofroom"
    | "lounge"
    | "study"
    | "open"
    | "pergola"
    | "storage";
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  dims?: string;
  furniture?: "bed" | "sofa" | "dining" | "kitchen" | "car" | "stair" | "bath" | "desk" | "garden" | "pergola" | "solar" | "tank" | "none";
  outdoor?: boolean;
}

export interface PlanFloor {
  id: "ground" | "first" | "roof";
  name: string;
  short: string;
  rooms: Room[];
  stair?: Room;
  label: string;
  level?: number;
}

export interface PlanGeometry {
  width: number;
  depth: number;
  plotWidth: number;
  plotDepth: number;
  buildWidth: number;
  buildDepth: number;
  plotArea: number;
  buildArea: number;
  floors: PlanFloor[];
  totalBuilt: number;
  carpetArea: number;
  coverage: number;
  roofRoomArea: number;
  balconyArea: number;
  garageArea: number;
}

export interface CostLine {
  id: string;
  label: string;
  group: "Core build" | "Design & statutory" | "Enhancements" | "Interiors";
  amount: number;
  note?: string;
}

export interface CostBreakdown {
  lines: CostLine[];
  construction: number;
  professional: number;
  statutory: number;
  contingency: number;
  enhancements: number;
  interiors: number;
  total: number;
  perSqft: number;
  areaSqft: number;
  rate: number;
  tierName: string;
}

export const FINISH_TIERS: {
  id: FinishTier;
  name: string;
  rate: number;
  summary: string;
  details: string;
}[] = [
  {
    id: "essential",
    name: "Essential",
    rate: 1680,
    summary: "Honest materials, smart planning.",
    details: "Vitrified floors, powder-coated aluminium windows, basic modular kitchen, Jaquar-equivalent bath fittings.",
  },
  {
    id: "standard",
    name: "Standard",
    rate: 1980,
    summary: "The thoughtfully comfortable home.",
    details: "Large-format tiles, full modular kitchen, branded sanitaryware, flush doors, emulsion paint, MS railings.",
  },
  {
    id: "signature",
    name: "Signature",
    rate: 2320,
    summary: "Material warmth, elevated detailing.",
    details: "Double-height entry feel, veneer accents, stone kitchen counters, premium fittings, designer lighting, composite façade.",
  },
  {
    id: "luxe",
    name: "Luxe",
    rate: 2880,
    summary: "Quiet luxury, built to last.",
    details: "Italian marble or oak floors, imported fittings, full-height glazing, bespoke joinery, home automation, landscape lighting.",
  },
];

export const BUDGET_STEPS = [10, 20, 30, 40, 50, 60, 70, 80].map((lakh) => lakh * 100000);

export const FACADES: Record<FacadeId, { name: string; wall: string; accent: string; trim: string }> = {
  terracotta: { name: "Basalt & terracotta", wall: "#e9e1d4", accent: "#b8613f", trim: "#2b2a27" },
  sandstone: { name: "Sandstone & teak", wall: "#e8dcc4", accent: "#b79362", trim: "#3a332b" },
  limewash: { name: "Lime wash & sage", wall: "#e3e3d8", accent: "#667c6c", trim: "#2e332e" },
  brick: { name: "Exposed brick & black", wall: "#c1876b", accent: "#8c4f38", trim: "#222222" },
};

export const FLOORING: Record<FlooringId, { name: string; color: string; cost: number }> = {
  vitrified: { name: "Ivory vitrified", color: "#d8d0c2", cost: 0 },
  marble: { name: "Italian marble", color: "#e7e1d5", cost: 165 },
  kota: { name: "Kota stone", color: "#9da49a", cost: 30 },
  oak: { name: "Oak engineered wood", color: "#b78d63", cost: 240 },
};

export const inr = (value: number, compact = false) => {
  if (!Number.isFinite(value)) return "—";
  if (compact) {
    if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(value < 1000000 ? 1 : 0)} L`;
    return `₹${Math.round(value).toLocaleString("en-IN")}`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const num = (value: number, digits = 1) =>
  value.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const sqm = (value: number) => `${num(value, 1)} m²`;
export const sqft = (value: number) => `${Math.round(value * 10.7639).toLocaleString("en-IN")} ft²`;
export const meters = (value: number) => `${num(value, 2)} m`;
