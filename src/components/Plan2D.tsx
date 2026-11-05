import { useId, useState } from "react";
import { getFloorPlan, getPlan } from "../lib/plan";
import { orientationGuide, type PlanFloor, type Project, type Room } from "../types";

type FloorId = "ground" | "first" | "roof";

interface Colors {
  sheet: string;
  grid: string;
  ink: string;
  wall: string;
  muted: string;
  accent: string;
  glass: string;
  private: string;
  shared: string;
  wet: string;
  service: string;
  green: string;
  furniture: string;
  outdoors: string;
}

function palette(mode: "paper" | "blueprint"): Colors {
  if (mode === "blueprint") {
    return {
      sheet: "#0f1c22",
      grid: "rgba(183, 208, 212, .09)",
      ink: "#d3e6e7",
      wall: "#c3dbdd",
      muted: "#789398",
      accent: "#e08a6e",
      glass: "#6a8e91",
      private: "#13242b",
      shared: "#112128",
      wet: "#163039",
      service: "#132329",
      green: "#142b2a",
      furniture: "#9dbabd",
      outdoors: "#12242a",
    };
  }
  return {
    sheet: "#f4efe4",
    grid: "rgba(72, 67, 58, .09)",
    ink: "#343b37",
    wall: "#4b4d45",
    muted: "#898276",
    accent: "#b76348",
    glass: "#9cb8b0",
    private: "#f8f2e7",
    shared: "#f1eadd",
    wet: "#e8ede7",
    service: "#eee8dc",
    green: "#e2e9d9",
    furniture: "#8b867b",
    outdoors: "#e6ecdf",
  };
}

const roomFill = (room: Room, c: Colors) => {
  if (room.outdoor) return c.outdoors;
  if (["bath", "utility"].includes(room.kind)) return c.wet;
  if (["bedroom", "roofroom", "study"].includes(room.kind)) return c.private;
  if (["living", "dining", "lounge"].includes(room.kind)) return c.shared;
  if (["garage", "stair", "entry", "storage"].includes(room.kind)) return c.service;
  if (["terrace", "balcony", "pergola"].includes(room.kind)) return c.green;
  return c.shared;
};

export function Plan2D({
  project,
  floorId,
  mode,
  showFurniture,
  showDimensions,
  onExpand,
  level,
}: {
  project: Project;
  floorId: FloorId;
  mode: "paper" | "blueprint";
  showFurniture: boolean;
  showDimensions: boolean;
  onExpand?: () => void;
  level?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<Room | null>(null);
  const C = palette(mode);
  const plan = getPlan(project);
  const floor = getFloorPlan(project, floorId, level);
  const W = project.plot.width;
  const D = project.plot.depth;
  const ox = plan.offset.x;
  const oy = plan.offset.y;
  const bw = plan.buildWidth;
  const bd = plan.buildDepth;
  const sx = bw / 7.5;
  const sy = bd / 12.4;
  const sheetX = -1.25;
  const sheetY = -1.25;
  const sheetW = W + 2.6;
  const sheetH = D + 3.15;

  const groundFloor = floorId === "ground";
  const roof = floorId === "roof";
  const firstOrUpper = floorId === "first";

  const bedFill = mode === "blueprint" ? "#1b3037" : "#fbf6ec";
  const chairFill = mode === "blueprint" ? "#173039" : "#efe7d8";
  const carFill = mode === "blueprint" ? "#19333c" : "#d6d2c7";

  const floorName = floorId === "ground" ? "Ground floor" : roof ? "Roof terrace" : level === 2 || (level === undefined && project.settings.floors === 3) ? "Second floor" : "First floor";
  const sheetNo = floorId === "ground" ? "A-101" : roof ? "A-301" : level === 2 ? "A-201" : "A-201";
  const orientation = orientationGuide(project.orientation);

  const doors = doorsFor(floorId, project);
  const windows = windowsFor(floorId, project);

  return (
    <div className={`plan-canvas ${mode === "blueprint" ? "is-blueprint" : ""}`}>
      <svg
        viewBox={`${sheetX} ${sheetY} ${sheetW} ${sheetH}`}
        className="plan-svg"
        role="img"
        aria-label={`${floorName} plan of ${project.name}, ${W.toFixed(1)} by ${D.toFixed(1)} metres`}
      >
        <rect x={sheetX} y={sheetY} width={sheetW} height={sheetH} rx={0.06} fill={C.sheet} />
        <rect x={sheetX + 0.1} y={sheetY + 0.1} width={sheetW - 0.2} height={sheetH - 0.2} fill="none" stroke={C.muted} strokeWidth={0.012} opacity={0.35} />

        {/* sheet grid */}
        <g opacity={0.65}>
          {Array.from({ length: Math.ceil((W + 2.6) / 0.5) }).map((_, i) => (
            <line key={`gx-${i}`} x1={sheetX + i * 0.5} y1={sheetY} x2={sheetX + i * 0.5} y2={sheetY + sheetH} stroke={C.grid} strokeWidth={0.007} />
          ))}
          {Array.from({ length: Math.ceil((D + 3.2) / 0.5) }).map((_, i) => (
            <line key={`gy-${i}`} x1={sheetX} y1={sheetY + i * 0.5} x2={sheetX + sheetW} y2={sheetY + i * 0.5} stroke={C.grid} strokeWidth={0.007} />
          ))}
        </g>

        {/* road */}
        <g>
          <rect x={-0.05} y={-1.02} width={W + 0.1} height={0.46} fill={C.outdoors} opacity={0.7} />
          <line x1={-0.05} y1={-0.56} x2={W + 0.05} y2={-0.56} stroke={C.muted} strokeWidth={0.02} strokeDasharray="0.18 0.14" opacity={0.6} />
          <text x={W / 2} y={-0.73} textAnchor="middle" fill={C.muted} fontSize={0.145} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.08">
            {project.orientation.toUpperCase()} · 9 M APPROACH ROAD
          </text>
          <path d={`M-0.05 -0.6v0.05M${W + 0.05} -0.6v0.05`} stroke={C.muted} strokeWidth={0.02} />
        </g>

        {/* plot boundary */}
        <rect x={0} y={0} width={W} height={D} fill={C.outdoors} opacity={0.5} />
        <rect x={0} y={0} width={W} height={D} fill="none" stroke={C.wall} strokeWidth={0.028} strokeDasharray="0.22 0.12" opacity={0.8} />

        {/* landscaping */}
        {project.settings.landscaping && (
          <g opacity={0.9}>
            <path d={`M0.26 ${D - 0.36}c0.14-0.15 0.36-0.15 0.5 0s0.36 0.15 0.5 0`} stroke={C.green} strokeWidth={0.025} fill="none" />
            <circle cx={W - 0.4} cy={D - 0.35} r={0.22} fill={C.green} />
            <circle cx={W - 0.62} cy={D - 0.27} r={0.12} fill={C.green} opacity={0.7} />
            {groundFloor && (
              <>
                <circle cx={W - 0.35} cy={oy / 2 + 0.1} r={0.14} fill={C.green} />
                <path d={`M0.25 ${oy / 2 + 0.25}q0.2-0.2 0.4 0`} stroke={C.green} strokeWidth={0.02} fill="none" />
              </>
            )}
          </g>
        )}

        {/* front court / driveway */}
        {groundFloor && (
          <g>
            <rect x={ox} y={0.08} width={bw} height={Math.max(0.2, oy - 0.16)} fill={mode === "blueprint" ? "#132228" : "#ded8cc"} opacity={0.7} />
            {Array.from({ length: Math.max(1, Math.floor(bw / 0.7)) }).map((_, i) => (
              <line key={i} x1={ox + i * 0.7} y1={0.08} x2={ox + i * 0.7} y2={Math.max(0.2, oy - 0.16)} stroke={C.muted} strokeWidth={0.009} opacity={0.35} />
            ))}
            <line x1={ox} y1={oy - 0.25} x2={ox + bw} y2={oy - 0.25} stroke={C.muted} strokeWidth={0.01} opacity={0.3} />
            {project.settings.garage && <text x={ox + bw / 2} y={Math.min(oy - 0.12, oy / 2 + 0.12)} textAnchor="middle" fill={C.muted} fontSize={0.11} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.05">DRIVE</text>}
          </g>
        )}

        {/* building shadow */}
        <rect x={ox + 0.1} y={oy + 0.12} width={bw} height={bd} fill={C.ink} opacity={0.06} />

        {/* building base */}
        {!roof && <rect x={ox} y={oy} width={bw} height={bd} fill={C.sheet} />}
        {roof && <rect x={ox} y={oy} width={bw} height={bd} fill={C.outdoors} />}

        {/* rooms */}
        {floor.rooms.map((room) => {
          const isHover = hover?.id === room.id;
          const isOverlay = ["bath-g", "bath-2", "bath-m", "bath-3", "roof-bath", "powder"].includes(room.id) || (firstOrUpper && room.id === "wardrobe");
          return (
            <g
              key={room.id}
              className={`plan-room ${isHover ? "is-hover" : ""}`}
              onMouseEnter={() => setHover(room)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(room)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              role="group"
              aria-label={`${room.name}, ${room.w.toFixed(2)} by ${room.h.toFixed(2)} metres`}
            >
              <rect
                x={room.x}
                y={room.y}
                width={room.w}
                height={room.h}
                fill={roomFill(room, C)}
                stroke={C.wall}
                strokeWidth={isOverlay ? 0.045 : 0.06}
                strokeLinejoin="round"
                opacity={roof && ["solar", "pergola", "tank"].includes(room.id) ? 0 : 1}
              />
              {isHover && <rect x={room.x} y={room.y} width={room.w} height={room.h} fill={C.accent} opacity={0.08} pointerEvents="none" />}
              {isHover && <rect x={room.x} y={room.y} width={room.w} height={room.h} fill="none" stroke={C.accent} strokeWidth={0.03} pointerEvents="none" />}
            </g>
          );
        })}

        {/* roof-specific terrace base / parapet */}
        {roof && (
          <>
            <rect x={ox} y={oy} width={bw} height={bd} fill="none" stroke={C.wall} strokeWidth={0.18} />
            <rect x={ox + 0.09} y={oy + 0.09} width={bw - 0.18} height={bd - 0.18} fill="none" stroke={C.muted} strokeWidth={0.018} opacity={0.4} />
          </>
        )}

        {/* floor slab outline */}
        {!roof && <rect x={ox} y={oy} width={bw} height={bd} fill="none" stroke={C.wall} strokeWidth={0.17} />}
        {roof && <rect x={ox} y={oy} width={bw} height={bd} fill="none" stroke={C.wall} strokeWidth={0.04} />}

        {/* outdoor roof deck items */}
        {roof && floorId === "roof" && <RoofDetails project={project} C={C} sx={sx} sy={sy} ox={ox} oy={oy} />}

        {/* furniture */}
        {showFurniture &&
          floor.rooms.map((room) => {
            if (["bath", "utility", "storage"].includes(room.kind) && room.id !== "utility") return null;
            return (
              <Furniture
                key={`f-${room.id}`}
                room={room}
                C={C}
                bedFill={bedFill}
                chairFill={chairFill}
                carFill={carFill}
              />
            );
          })}

        {/* stair details */}
        {floor.rooms.filter((r) => r.furniture === "stair").map((room) => (
          <Stair key={`st-${room.id}`} room={room} C={C} />
        ))}

        {/* bath fixtures */}
        {showFurniture &&
          floor.rooms.filter((r) => r.kind === "bath").map((room) => (
            <BathFixtures key={`bath-${room.id}`} room={room} C={C} />
          ))}

        {/* doors & windows */}
        <g>
          {windows.map((spec, i) => (
            <Window key={`w-${i}`} spec={spec} C={C} sx={sx} sy={sy} ox={ox} oy={oy} />
          ))}
          {doors.map((spec, i) => (
            <Door key={`d-${i}`} spec={spec} C={C} sx={sx} sy={sy} ox={ox} oy={oy} />
          ))}
        </g>

        {/* room labels */}
        <g pointerEvents="none">
          {floor.rooms.map((room) => {
            if (roof && ["solar", "tank", "pergola"].includes(room.id)) return null;
            if (room.w < 0.7 || room.h < 0.6) return null;
            const isBath = room.kind === "bath";
            const longName = room.name.length + (room.kind === "bedroom" ? 0 : 0);
            const nameSize = room.w < 1.8 || isBath ? 0.105 : room.w < 2.4 ? 0.14 : 0.17;
            const area = room.w * room.h;
            const showArea = room.w > 1.55 && room.h > 1.25 && !isBath;
            const labelX = room.x + 0.15;
            const labelY = room.y + (isBath ? room.h / 2 + 0.02 : 0.26);
            return (
              <g key={`label-${room.id}`}>
                <text
                  x={isBath ? room.x + room.w / 2 : labelX}
                  y={labelY}
                  textAnchor={isBath ? "middle" : "start"}
                  fill={C.ink}
                  fontSize={nameSize}
                  fontWeight={620}
                  fontFamily="Manrope Variable, sans-serif"
                  letterSpacing="0.005"
                  style={{ paintOrder: "stroke" }}
                  stroke={roomFill(room, C)}
                  strokeWidth={0.055}
                >
                  {longName > 13 && room.w < 3 ? room.name.replace("Master ", "").replace("Family ", "") : room.name}
                </text>
                {showArea && (
                  <text
                    x={labelX}
                    y={labelY + nameSize + 0.055}
                    fill={C.muted}
                    fontSize={Math.max(0.085, nameSize * 0.58)}
                    fontFamily="Manrope Variable, sans-serif"
                    letterSpacing="0.015"
                    style={{ paintOrder: "stroke" }}
                    stroke={roomFill(room, C)}
                    strokeWidth={0.04}
                  >
                    {area.toFixed(1)} m²
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* entry marker */}
        {groundFloor && (
          <g>
            <path d={`M${ox + 3.15 * sx} ${oy - 0.02}l-.09-.16m.09.16l.09-.16`} stroke={C.accent} strokeWidth={0.035} fill="none" />
            <text x={ox + 3.15 * sx} y={oy - 0.2} textAnchor="middle" fill={C.accent} fontSize={0.1} fontWeight={700} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.08">
              ENTRY
            </text>
          </g>
        )}

        {/* dimensions */}
        {showDimensions && <Dimensions W={W} D={D} ox={ox} oy={oy} bw={bw} bd={bd} C={C} />}

        {/* compass */}
        <Compass x={W + 0.88} y={0.19} C={C} top={orientation.compass} left={orientation.compassLeft} />

        {/* sheet title block */}
        <g>
          <line x1={0} y1={D + 0.58} x2={W + 0.16} y2={D + 0.58} stroke={C.muted} strokeWidth={0.018} opacity={0.55} />
          <text x={0} y={D + 0.8} fill={C.ink} fontSize={0.135} fontWeight={700} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.04">
            BHOOMI STUDIO
          </text>
          <text x={0} y={D + 0.98} fill={C.muted} fontSize={0.1} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.025">
            {project.name.toUpperCase()} · {project.location.toUpperCase()}
          </text>
          <text x={W + 0.16} y={D + 0.8} textAnchor="end" fill={C.ink} fontSize={0.13} fontWeight={650} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.035">
            {floorName.toUpperCase()} PLAN
          </text>
          <text x={W + 0.16} y={D + 0.98} textAnchor="end" fill={C.muted} fontSize={0.095} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.03">
            {sheetNo} · SCALE 1:100 · {W.toFixed(2)} × {D.toFixed(2)} M
          </text>
          <text x={W / 2} y={D + 0.8} textAnchor="middle" fill={C.muted} fontSize={0.09} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.045">
            {project.settings.vastu ? "VASTU-GUIDED" : "STUDIO LAYOUT"}
          </text>
          <text x={W / 2} y={D + 0.98} textAnchor="middle" fill={C.muted} fontSize={0.09} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.045">
            {project.settings.floors === 1 ? "G" : `G + ${project.settings.floors - 1}`} · {project.settings.roofRoom ? "ROOF ROOM" : "OPEN TERRACE"}
          </text>
        </g>

        <defs>
          <pattern id={`${uid}-hatch`} width="0.18" height="0.18" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="0.18" stroke={C.muted} strokeWidth="0.035" opacity="0.3" />
          </pattern>
        </defs>
        <path d={`M0 ${D + 1.15}h${W + 0.16}`} stroke={C.muted} strokeWidth={0.01} opacity={0.25} />
        <text x={W + 0.16} y={D + 1.45} textAnchor="end" fill={C.muted} fontSize={0.09} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.04">
          DRAWING NOT TO SCALE ON SCREEN · VERIFY ON SITE
        </text>
      </svg>

      {hover && (
        <div className="room-pop">
          <span className="eyebrow no-rule">{hover.kind === "bath" ? "Wet zone" : hover.outdoor ? "Outdoor" : floorName}</span>
          <strong>{hover.name}</strong>
          <span>
            {hover.w.toFixed(2)} × {hover.h.toFixed(2)} m · {(hover.w * hover.h).toFixed(1)} m²
          </span>
        </div>
      )}

      {onExpand && (
        <button type="button" className="plan-expand-pill" onClick={onExpand} aria-label="Expand plan">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M9 3H3v6M15 21h6v-6M3 9l6-6M21 15l-6 6" />
          </svg>
          Expand
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Architectural primitives                                            */
/* ------------------------------------------------------------------ */

type DoorSpec = {
  x: number;
  y: number;
  w: number;
  wall: "h" | "v";
  dir: 1 | -1;
  leaf: 1 | -1;
};

function doorsFor(floor: FloorId, project: Project): DoorSpec[] {
  if (floor === "ground") {
    return [
      { x: 3.18, y: 0, w: 0.78, wall: "h", dir: 1, leaf: 1 },
      { x: 3.08, y: 2.55, w: 0.72, wall: "h", dir: 1, leaf: 1 },
      { x: 0.95, y: 8.5, w: 0.72, wall: "h", dir: 1, leaf: 1 },
      { x: 3.3, y: 8.5, w: 0.78, wall: "h", dir: 1, leaf: 1 },
      { x: 0.48, y: 11.2, w: 0.62, wall: "h", dir: 1, leaf: -1 },
      { x: 5.7, y: 10.55, w: 0.58, wall: "h", dir: 1, leaf: 1 },
      { x: 6.15, y: 3.7, w: 0.6, wall: "v", dir: 1, leaf: 1 },
      { x: 3.05, y: 4.28, w: 0.64, wall: "v", dir: 1, leaf: -1 },
      ...(project.settings.openKitchen ? [] : [{ x: 2.1, y: 8.5, w: 0.55, wall: "h" as const, dir: -1 as const, leaf: 1 as const }]),
    ];
  }
  if (floor === "first") {
    return [
      { x: 3.8, y: 3.45, w: 0.75, wall: "v", dir: 1, leaf: -1 },
      { x: 2.6, y: 5.35, w: 0.68, wall: "v", dir: 1, leaf: -1 },
      { x: 3.35, y: 7.6, w: 0.78, wall: "h", dir: 1, leaf: 1 },
      { x: 5.15, y: 7.6, w: 0.72, wall: "h", dir: 1, leaf: 1 },
      { x: 2.52, y: 10.35, w: 0.6, wall: "h", dir: 1, leaf: 1 },
      { x: 5.85, y: 10.5, w: 0.6, wall: "v", dir: 1, leaf: 1 },
      { x: 3.8, y: 2.1, w: 0.7, wall: "v", dir: 1, leaf: 1 },
    ];
  }
  return [
    { x: 0.9, y: 7.4, w: 0.74, wall: "h", dir: 1, leaf: 1 },
    { x: 5.7, y: 4.65, w: 0.68, wall: "h", dir: 1, leaf: -1 },
    { x: 2.4, y: 10.25, w: 0.58, wall: "h", dir: 1, leaf: 1 },
  ];
}

type WindowSpec = {
  x: number;
  y: number;
  w: number;
  wall: "h" | "v";
};

function windowsFor(floor: FloorId, project: Project): WindowSpec[] {
  if (floor === "ground") {
    return [
      { x: 0, y: 6.35, w: 1.35, wall: "v" },
      { x: 0, y: 9.15, w: 1.0, wall: "v" },
      { x: 7.5, y: 6.1, w: 1.25, wall: "v" },
      { x: 7.5, y: 9.0, w: 1.15, wall: "v" },
      { x: 4.15, y: 0, w: 1.15, wall: "h" },
      { x: 3.75, y: 12.4, w: 1.25, wall: "h" },
      { x: 1.25, y: 12.4, w: 0.95, wall: "h" },
    ];
  }
  if (floor === "first") {
    const base = [
      { x: 1.4, y: 0, w: 1.5, wall: "h" as const },
      { x: 0, y: 1.8, w: 1.2, wall: "v" as const },
      { x: 0, y: 5.35, w: 0.9, wall: "v" as const },
      { x: 0, y: 8.6, w: 1.35, wall: "v" as const },
      { x: 7.5, y: 8.4, w: 1.2, wall: "v" as const },
      { x: 0.9, y: 12.4, w: 1.2, wall: "h" as const },
      { x: 5.15, y: 12.4, w: 1.0, wall: "h" as const },
    ];
    if (!project.settings.balcony) base.push({ x: 4.15, y: 0, w: 1.1, wall: "h" as const });
    return base;
  }
  return [
    { x: 0.75, y: 7.4, w: 1.15, wall: "h" as const },
    { x: 0, y: 9.2, w: 1.1, wall: "v" as const },
  ];
}

function Door({
  spec,
  C,
  sx,
  sy,
  ox,
  oy,
}: {
  spec: DoorSpec;
  C: Colors;
  sx: number;
  sy: number;
  ox: number;
  oy: number;
}) {
  const x = ox + spec.x * sx;
  const y = oy + spec.y * sy;
  const w = spec.w * (spec.wall === "h" ? sx : sy);
  const wallVec = spec.wall === "h" ? { x: spec.dir * w, y: 0 } : { x: 0, y: spec.dir * w };
  const leafVec = spec.wall === "h" ? { x: 0, y: spec.leaf * w } : { x: spec.leaf * w, y: 0 };
  const closed = { x: x + wallVec.x, y: y + wallVec.y };
  const open = { x: x + leafVec.x, y: y + leafVec.y };
  const cross = wallVec.x * leafVec.y - wallVec.y * leafVec.x;
  const sweep = cross > 0 ? 1 : 0;
  const path = `M${closed.x} ${closed.y} A${w} ${w} 0 0 ${sweep} ${open.x} ${open.y}`;
  return (
    <g stroke={C.wall} strokeWidth={0.025} fill="none">
      <line x1={x} y1={y} x2={closed.x} y2={closed.y} stroke={C.sheet} strokeWidth={0.17} />
      <line x1={x} y1={y} x2={open.x} y2={open.y} />
      <path d={path} strokeWidth={0.017} opacity={0.7} />
      <line x1={open.x} y1={open.y} x2={open.x + leafVec.x * 0.18} y2={open.y + leafVec.y * 0.18} stroke={C.accent} strokeWidth={0.035} opacity={0.9} />
    </g>
  );
}

function Window({ spec, C, sx, sy, ox, oy }: { spec: WindowSpec; C: Colors; sx: number; sy: number; ox: number; oy: number }) {
  const isH = spec.wall === "h";
  const x = ox + spec.x * sx;
  const y = oy + spec.y * sy;
  const w = spec.w * (isH ? sx : sy);
  if (isH) {
    return (
      <g stroke={C.wall} strokeWidth={0.022}>
        <line x1={x} y1={y} x2={x + w} y2={y} stroke={C.sheet} strokeWidth={0.2} />
        <rect x={x} y={y - 0.05} width={w} height={0.1} fill={C.glass} opacity={0.9} stroke="none" />
        <line x1={x} y1={y - 0.05} x2={x + w} y2={y - 0.05} />
        <line x1={x} y1={y + 0.05} x2={x + w} y2={y + 0.05} />
        <line x1={x + w / 2} y1={y - 0.05} x2={x + w / 2} y2={y + 0.05} strokeWidth={0.015} opacity={0.65} />
      </g>
    );
  }
  return (
    <g stroke={C.wall} strokeWidth={0.022}>
      <line x1={x} y1={y} x2={x} y2={y + w} stroke={C.sheet} strokeWidth={0.2} />
      <rect x={x - 0.05} y={y} width={0.1} height={w} fill={C.glass} opacity={0.9} stroke="none" />
      <line x1={x - 0.05} y1={y} x2={x - 0.05} y2={y + w} />
      <line x1={x + 0.05} y1={y} x2={x + 0.05} y2={y + w} />
      <line x1={x - 0.05} y1={y + w / 2} x2={x + 0.05} y2={y + w / 2} strokeWidth={0.015} opacity={0.65} />
    </g>
  );
}

function DoorsAndWindows() {
  return null;
}

function Dimensions({ W, D, ox, oy, bw, bd, C }: { W: number; D: number; ox: number; oy: number; bw: number; bd: number; C: Colors }) {
  return (
    <g stroke={C.muted} fill={C.muted} fontFamily="Manrope Variable, sans-serif">
      <g strokeWidth={0.012}>
        <line x1={0} y1={D + 0.14} x2={0} y2={D + 0.5} opacity={0.35} />
        <line x1={W} y1={D + 0.14} x2={W} y2={D + 0.5} opacity={0.35} />
        <line x1={0} y1={D + 0.34} x2={W} y2={D + 0.34} />
        <line x1={0} y1={D + 0.27} x2={W} y2={D + 0.27} strokeWidth={0.008} opacity={0.35} />
        <path d={`M0 ${D + 0.34}l0.12 -0.045v0.09Zm${W} 0l-0.12 -0.045v0.09Z`} fill={C.muted} stroke="none" />
        <line x1={-0.38} y1={0} x2={-0.15} y2={0} opacity={0.35} />
        <line x1={-0.38} y1={D} x2={-0.15} y2={D} opacity={0.35} />
        <line x1={-0.29} y1={0} x2={-0.29} y2={D} />
        <line x1={-0.22} y1={0} x2={-0.22} y2={D} strokeWidth={0.008} opacity={0.35} />
        <path d={`M-0.29 0v0.12l0.05 -0.012h-0.1Zm0 ${D}v-0.12l0.05 0.012h-0.1Z`} fill={C.muted} stroke="none" />
        <line x1={ox} y1={oy - 0.6} x2={ox} y2={oy - 0.24} opacity={0.35} />
        <line x1={ox + bw} y1={oy - 0.6} x2={ox + bw} y2={oy - 0.24} opacity={0.35} />
        <line x1={ox} y1={oy - 0.5} x2={ox + bw} y2={oy - 0.5} strokeWidth={0.009} opacity={0.55} />
        <line x1={ox} y1={oy - 0.5} x2={ox + bw} y2={oy - 0.5} strokeDasharray="0.06 0.11" />
      </g>
      <text x={W / 2} y={D + 0.29} textAnchor="middle" fontSize={0.16} stroke="none" letterSpacing="0.02">
        {W.toFixed(2)} m
      </text>
      <text x={-0.48} y={D / 2} textAnchor="middle" fontSize={0.16} stroke="none" transform={`rotate(-90 -0.48 ${D / 2})`} letterSpacing="0.02">
        {D.toFixed(2)} m
      </text>
      <text x={ox + bw / 2} y={oy - 0.56} textAnchor="middle" fontSize={0.105} stroke="none" opacity={0.75}>
        BUILD {bw.toFixed(2)} × {bd.toFixed(2)} M
      </text>
      <text x={ox + bw + 0.12} y={oy + bd / 2} textAnchor="middle" fontSize={0.09} stroke="none" transform={`rotate(90 ${ox + bw + 0.12} ${oy + bd / 2})`} opacity={0.7}>
        PLOT {D.toFixed(2)} M
      </text>
    </g>
  );
}

function Compass({ x, y, C, top, left }: { x: number; y: number; C: Colors; top: string; left: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={C.wall} strokeWidth={0.015} opacity={0.85}>
      <circle r={0.34} strokeWidth={0.01} opacity={0.3} />
      <path d="M0 0.25V-0.27" />
      <path d="M0 -0.27l-0.055 0.13M0 -0.27l0.055 0.13" fill={C.wall} />
      <path d="M-0.24 0H0.24" strokeWidth={0.01} opacity={0.6} />
      <text x={0} y={-0.38} textAnchor="middle" fontSize={0.11} fill={C.accent} stroke="none" fontWeight={700} fontFamily="Manrope Variable, sans-serif">{top}</text>
      <text x={-0.42} y={0.04} textAnchor="middle" fontSize={0.09} fill={C.muted} stroke="none" fontFamily="Manrope Variable, sans-serif">{left}</text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Furniture                                                           */
/* ------------------------------------------------------------------ */

function Furniture({
  room,
  C,
  bedFill,
  chairFill,
  carFill,
}: {
  room: Room;
  C: Colors;
  bedFill: string;
  chairFill: string;
  carFill: string;
}) {
  const type = room.furniture;
  if (!type || type === "none") return null;
  const { x, y, w, h } = room;
  const stroke = { stroke: C.furniture, strokeWidth: 0.02 };

  if (type === "bed") {
    const bw = Math.min(1.45, w * 0.46);
    const bh = Math.min(1.95, h * 0.56);
    const bx = x + w - bw - 0.25;
    const by = y + Math.min(0.55, h * 0.16);
    return (
      <g>
        <rect x={bx + 0.06} y={by + 0.06} width={bw} height={bh} rx={0.04} fill={C.ink} opacity={0.06} />
        <rect x={bx} y={by} width={bw} height={bh} rx={0.04} fill={bedFill} {...stroke} />
        <rect x={bx + 0.06} y={by + 0.09} width={bw - 0.12} height={0.34} rx={0.03} fill={chairFill} stroke={C.furniture} strokeWidth={0.013} opacity={0.85} />
        <line x1={bx} y1={by + 0.6} x2={bx + bw} y2={by + 0.6} stroke={C.furniture} strokeWidth={0.012} opacity={0.4} />
        <path d={`M${bx + 0.06} ${by + bh * 0.66}h${bw - 0.12}v${bh * 0.24}a0.04 0.04 0 0 1 -0.04 0.04h-${bw - 0.14}a0.04 0.04 0 0 1 -0.04 -0.04Z`} fill={C.accent} opacity={0.12} stroke="none" />
        {Array.from({ length: 3 }).map((_, i) => (
          <circle key={i} cx={bx + 0.18 + i * 0.13} cy={by + 0.25} r={0.022} fill={C.furniture} opacity={0.5} />
        ))}
        <rect x={bx - 0.05} y={by + 0.08} width={0.34} height={0.42} rx={0.03} fill={chairFill} stroke={C.furniture} strokeWidth={0.012} opacity={0.75} />
      </g>
    );
  }

  if (type === "sofa") {
    const sw = Math.min(2.05, w * 0.62);
    const sd = Math.min(0.76, h * 0.3);
    const sx = x + 0.32;
    const sy = y + h - sd - 0.38;
    return (
      <g>
        <rect x={sx} y={sy} width={sw} height={sd} rx={0.08} fill={chairFill} {...stroke} />
        <rect x={sx + 0.1} y={sy + 0.06} width={sw - 0.2} height={sd * 0.52} rx={0.06} fill="none" stroke={C.furniture} strokeWidth={0.012} opacity={0.7} />
        <line x1={sx + sw * 0.38} y1={sy + 0.06} x2={sx + sw * 0.38} y2={sy + sd - 0.07} stroke={C.furniture} strokeWidth={0.012} opacity={0.5} />
        <line x1={sx + sw * 0.68} y1={sy + 0.06} x2={sx + sw * 0.68} y2={sy + sd - 0.07} stroke={C.furniture} strokeWidth={0.012} opacity={0.5} />
        <rect x={sx + sw * 0.35} y={sy - 0.36} width={Math.min(0.78, sw * 0.4)} height={0.48} rx={0.04} fill={bedFill} {...stroke} opacity={0.9} />
        <circle cx={sx + sw * 0.5} cy={sy - 0.48} r={0.12} fill="none" stroke={C.furniture} strokeWidth={0.012} opacity={0.55} />
      </g>
    );
  }

  if (type === "dining") {
    const tw = Math.min(1.25, w * 0.48);
    const th = Math.min(0.85, h * 0.4);
    const tx = x + w / 2 - tw / 2;
    const ty = y + h / 2 - th / 2;
    return (
      <g>
        <rect x={tx} y={ty} width={tw} height={th} rx={0.06} fill={chairFill} {...stroke} />
        <rect x={tx + 0.09} y={ty + 0.09} width={tw - 0.18} height={th - 0.18} rx={0.03} fill="none" stroke={C.furniture} strokeWidth={0.01} opacity={0.35} />
        {[0.16, tw - 0.32].map((dx, i) => (
          <g key={i}>
            <rect x={tx + dx} y={ty - 0.25} width={0.18} height={0.17} rx={0.025} fill={chairFill} {...stroke} />
            <rect x={tx + dx} y={ty + th + 0.08} width={0.18} height={0.17} rx={0.025} fill={chairFill} {...stroke} />
          </g>
        ))}
        <rect x={tx - 0.26} y={ty + th / 2 - 0.1} width={0.18} height={0.2} rx={0.02} fill={chairFill} {...stroke} />
        <rect x={tx + tw + 0.08} y={ty + th / 2 - 0.1} width={0.18} height={0.2} rx={0.02} fill={chairFill} {...stroke} />
        <circle cx={tx + tw / 2} cy={ty + th / 2} r={0.07} fill={C.green} opacity={0.7} />
      </g>
    );
  }

  if (type === "kitchen") {
    return (
      <g fill={chairFill} stroke={C.furniture} strokeWidth={0.018}>
        <path d={`M${x + 0.12} ${y + 0.12}h${w * 0.44}v0.5h-${w * 0.44}Z`} />
        <path d={`M${x + 0.12} ${y + 0.62}h0.5v${h - 0.74}h-0.5Z`} />
        <circle cx={x + 0.38} cy={y + 0.37} r={0.11} fill="none" />
        <circle cx={x + 0.38} cy={y + 0.37} r={0.035} fill={C.furniture} opacity={0.5} />
        <rect x={x + w * 0.72} y={y + 0.17} width={0.34} height={0.34} rx={0.03} fill="none" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={x + w * 0.72 + (i % 2 === 0 ? 0.1 : 0.24)} cy={y + 0.17 + (i < 2 ? 0.1 : 0.24)} r={0.032} fill="none" />
        ))}
        <rect x={x + 0.24} y={y + h - 0.46} width={0.34} height={0.34} rx={0.03} fill="none" />
        <circle cx={x + 0.41} cy={y + h - 0.29} r={0.1} fill="none" strokeWidth={0.012} />
      </g>
    );
  }

  if (type === "car") {
    const cw = Math.min(1.72, w * 0.62);
    const ch = Math.min(3.65, h * 0.72);
    const cx = x + w / 2 - cw / 2;
    const cy = y + h / 2 - ch / 2;
    return (
      <g>
        <rect x={cx} y={cy} width={cw} height={ch} rx={0.23} fill={carFill} stroke={C.furniture} strokeWidth={0.025} />
        <path d={`M${cx + 0.16} ${cy + ch * 0.26}q0 -0.12 0.12 -0.12h${cw - 0.56}q0.12 0 0.12 0.12l-0.08 0.3h-${cw - 0.32}Z`} fill={C.glass} opacity={0.59} stroke="none" />
        <path d={`M${cx + 0.16} ${cy + ch * 0.74}q0 0.12 0.12 0.12h${cw - 0.56}q0.12 0 0.12 -0.12l-0.08 -0.3h-${cw - 0.32}Z`} fill={C.glass} opacity={0.36} stroke="none" />
        <line x1={cx + 0.1} y1={cy + ch * 0.52} x2={cx + cw - 0.1} y2={cy + ch * 0.52} stroke={C.furniture} strokeWidth={0.012} opacity={0.35} />
        <rect x={cx - 0.05} y={cy + 0.32} width={0.1} height={0.35} rx={0.025} fill={C.furniture} opacity={0.45} />
        <rect x={cx + cw - 0.05} y={cy + 0.32} width={0.1} height={0.35} rx={0.025} fill={C.furniture} opacity={0.45} />
        <rect x={cx - 0.05} y={cy + ch - 0.67} width={0.1} height={0.35} rx={0.025} fill={C.furniture} opacity={0.45} />
        <rect x={cx + cw - 0.05} y={cy + ch - 0.67} width={0.1} height={0.35} rx={0.025} fill={C.furniture} opacity={0.45} />
        <circle cx={cx + cw / 2} cy={cy + ch / 2} r={0.11} fill="none" stroke={C.furniture} strokeWidth={0.012} opacity={0.4} />
      </g>
    );
  }

  if (type === "desk") {
    return (
      <g fill={chairFill} stroke={C.furniture} strokeWidth={0.018}>
        <rect x={x + 0.22} y={y + 0.24} width={0.95} height={0.45} rx={0.03} />
        <circle cx={x + 0.7} cy={y + 0.95} r={0.16} fill="none" />
        <line x1={x + 1.28} y1={y + 0.24} x2={x + 1.28} y2={y + h - 0.25} strokeWidth={0.012} opacity={0.5} />
        <rect x={x + 0.28} y={y + 0.33} width={0.2} height={0.27} rx={0.02} fill="none" />
        <rect x={x + 0.56} y={y + 0.33} width={0.2} height={0.27} rx={0.02} fill="none" />
      </g>
    );
  }

  if (type === "garden") {
    return (
      <g stroke={C.green} fill={C.green} strokeWidth={0.014}>
        {Array.from({ length: Math.max(2, Math.floor(w / 0.7)) }).map((_, i) => (
          <circle key={i} cx={x + 0.35 + i * 0.62} cy={y + h - 0.28} r={0.13} opacity={0.55} />
        ))}
        <path d={`M${x + 0.2} ${y + 0.3}q0.2 -0.18 0.4 0t0.4 0`} fill="none" opacity={0.5} />
      </g>
    );
  }

  if (type === "pergola") {
    return (
      <g stroke={C.furniture} strokeWidth={0.018} opacity={0.55}>
        <rect x={x + 0.18} y={y + 0.18} width={w - 0.36} height={h - 0.36} fill="none" />
        {Array.from({ length: Math.floor(w / 0.25) }).map((_, i) => (
          <line key={i} x1={x + 0.2 + i * 0.25} y1={y + 0.2} x2={x + 0.2 + i * 0.25} y2={y + h - 0.2} />
        ))}
        <circle cx={x + w * 0.32} cy={y + h * 0.7} r={0.2} fill={C.green} opacity={0.4} />
      </g>
    );
  }

  if (type === "solar") {
    return (
      <g stroke={C.furniture} strokeWidth={0.015} opacity={0.6}>
        {Array.from({ length: 3 }).map((_, row) =>
          Array.from({ length: 2 }).map((_, col) => (
            <rect key={`${row}-${col}`} x={x + 0.18 + col * (w - 0.4) / 2} y={y + 0.18 + row * (h - 0.4) / 3} width={(w - 0.5) / 2} height={(h - 0.5) / 3} fill={C.glass} opacity={0.35} />
          )),
        )}
      </g>
    );
  }

  if (type === "tank") {
    return (
      <g stroke={C.furniture} strokeWidth={0.018} fill="none" opacity={0.6}>
        <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) * 0.32} fill={C.glass} opacity={0.3} />
        <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) * 0.22} />
      </g>
    );
  }

  return null;
}

function BathFixtures({ room, C }: { room: Room; C: Colors }) {
  const { x, y, w, h } = room;
  if (w < 0.9 || h < 0.8) return null;
  return (
    <g stroke={C.furniture} fill="none" strokeWidth={0.014} opacity={0.7}>
      <rect x={x + 0.1} y={y + 0.12} width={Math.min(0.52, w * 0.34)} height={Math.min(0.3, h * 0.22)} rx={0.09} fill={C.sheet} />
      <ellipse cx={x + 0.23} cy={y + 0.27} rx={0.12} ry={0.085} />
      <circle cx={x + w - 0.25} cy={y + 0.27} r={Math.min(0.12, w * 0.1)} />
      <circle cx={x + w - 0.25} cy={y + 0.27} r={0.025} fill={C.furniture} />
      <path d={`M${x + w - Math.min(0.55, w * 0.3)} ${y + h - 0.12}v-${Math.min(0.55, h * 0.35)}h${Math.min(0.45, w * 0.26)}`} opacity={0.45} />
      <line x1={x + 0.12} y1={y + h - 0.17} x2={x + Math.min(0.4, w * 0.3)} y2={y + h - 0.17} opacity={0.45} />
    </g>
  );
}

function Stair({ room, C }: { room: Room; C: Colors }) {
  const count = Math.max(7, Math.min(12, Math.floor(room.h / 0.24)));
  const step = room.h / count;
  return (
    <g stroke={C.furniture} strokeWidth={0.012} opacity={0.5} fill="none">
      {Array.from({ length: count }).map((_, i) => (
        <line key={i} x1={room.x + 0.06} y1={room.y + step * (i + 1)} x2={room.x + room.w - 0.06} y2={room.y + step * (i + 1)} />
      ))}
      <line x1={room.x + room.w / 2} y1={room.y + room.h - 0.15} x2={room.x + room.w / 2} y2={room.y + 0.25} stroke={C.accent} strokeWidth={0.022} />
      <path d={`M${room.x + room.w / 2 - 0.08} ${room.y + 0.33}l0.08 -0.13l0.08 0.13`} stroke={C.accent} strokeWidth={0.022} fill="none" />
      <text x={room.x + room.w / 2 + 0.06} y={room.y + room.h - 0.22} fill={C.muted} fontSize={0.085} stroke="none" fontFamily="Manrope Variable, sans-serif" letterSpacing="0.06">UP</text>
    </g>
  );
}

function RoofDetails({
  project,
  C,
  sx,
  sy,
  ox,
  oy,
}: {
  project: Project;
  C: Colors;
  sx: number;
  sy: number;
  ox: number;
  oy: number;
}) {
  const room = project.settings.roofRoom;
  return (
    <g>
      {project.settings.terraceGarden && (
        <>
          <g stroke={C.green} fill={C.green} opacity={0.35} strokeWidth={0.02}>
            {Array.from({ length: 7 }).map((_, i) => (
              <circle key={i} cx={ox + 0.36 + (i % 2) * 0.25 + i * 0.04} cy={oy + 2.3 + i * 0.7} r={0.16} />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <circle key={`b-${i}`} cx={ox + 5.4 + i * 0.35} cy={oy + 5.5 + (i % 2) * 0.3} r={0.13} />
            ))}
          </g>
          <text x={ox + 0.4} y={oy + 2.05} fill={C.muted} fontSize={0.085} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.03">PLANTERS</text>
        </>
      )}
      {project.settings.solar && (
        <g>
          <text x={ox + 4.15 * sx} y={oy + 0.8 * sy} fill={C.muted} fontSize={0.085} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.03">SOLAR</text>
        </g>
      )}
      {room && (
        <text x={ox + 0.35} y={oy + 7.2} fill={C.muted} fontSize={0.085} fontFamily="Manrope Variable, sans-serif" letterSpacing="0.04">ROOF ROOM · GUEST STUDIO</text>
      )}
    </g>
  );
}
