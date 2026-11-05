import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Box,
  Check,
  Download,
  Eye,
  FileCode2,
  Image as ImageIcon,
  Layers3,
  Maximize2,
  PencilRuler,
  Printer,
  Ruler,
  Sparkles,
  X,
} from "lucide-react";
import { Customizer } from "../components/Customizer";
import { PageHeader } from "../components/PageHeader";
import { Plan2D } from "../components/Plan2D";
import { Switch } from "../components/UI";
import { downloadBlob, downloadSvgElement, safeFileStem, svgElementToPng } from "../lib/files";
import { getPlan } from "../lib/plan";
import { useStore } from "../lib/store";
import { inr, num, orientationGuide, sqft, sqm, type Project, type Room } from "../types";

type FloorId = "ground" | "first" | "roof";

const kindLabel: Record<Room["kind"], string> = {
  garage: "Garage",
  entry: "Entry",
  stair: "Stair",
  living: "Living",
  dining: "Dining",
  kitchen: "Kitchen",
  utility: "Utility",
  bedroom: "Bedroom",
  bath: "Bath",
  balcony: "Balcony",
  terrace: "Terrace",
  roofroom: "Roof room",
  lounge: "Lounge",
  study: "Study",
  open: "Circulation",
  pergola: "Pergola",
  storage: "Storage",
};

export function PlanPage({ project }: { project: Project }) {
  const { updateProject, toast } = useStore();
  const [floor, setFloor] = useState<FloorId>("ground");
  const [zoom, setZoom] = useState(false);
  const [exporting, setExporting] = useState<"svg" | "png" | null>(null);
  const drawingRef = useRef<HTMLDivElement | null>(null);
  const plan = getPlan(project);
  const orientation = orientationGuide(project.orientation);

  // Each level gets its own sheet tab, so G+1 shows F and G+2 shows F + S.
  const floors: { id: FloorId; label: string; short: string; level: number }[] = [
    { id: "ground", label: "Ground floor", short: "G", level: 0 },
    ...(project.settings.floors >= 2 ? [{ id: "first" as FloorId, label: "First floor", short: "F", level: 1 }] : []),
    ...(project.settings.floors >= 3 ? [{ id: "first" as FloorId, label: "Second floor", short: "S", level: 2 }] : []),
    { id: "roof", label: "Roof terrace", short: "R", level: 3 },
  ];
  const [activeLevel, setActiveLevel] = useState(0);

  useEffect(() => {
    // G+1 exposes levels 0, 1 and roof(3); G+2 exposes 0, 1, 2 and roof(3).
    // Keep the roof sheet reachable in both cases.
    if (activeLevel === 2 && project.settings.floors < 3) setActiveLevel(0);
  }, [activeLevel, project.settings.floors]);

  const activeFloor = plan.floors.find((entry) => entry.level === activeLevel) ?? plan.floors[0];
  const set = (patch: { planMode?: "paper" | "blueprint"; showFurniture?: boolean; showDimensions?: boolean }) =>
    updateProject(project.id, { settings: patch });

  const getSvg = () => drawingRef.current?.querySelector<SVGSVGElement>("svg.plan-svg") ?? null;
  const activeSheet = floors.find((entry) => entry.level === activeLevel);
  const baseName = `${safeFileStem(project.name)}-${activeSheet?.short.toLowerCase() ?? "g"}-plan`;

  const exportSvg = () => {
    const svg = getSvg();
    if (!svg) return;
    setExporting("svg");
    try {
      downloadSvgElement(`${baseName}.svg`, svg);
      toast("Vector plan downloaded — ready for print", "success");
    } finally {
      setExporting(null);
    }
  };

  const exportPng = async () => {
    const svg = getSvg();
    if (!svg) return;
    setExporting("png");
    try {
      const blob = await svgElementToPng(svg, 2.2);
      downloadBlob(`${baseName}.png`, blob);
      toast("2× plan image downloaded", "success");
    } catch {
      toast("This browser could not render the PNG. Try the SVG.", "warning");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="page plan-page">
      <PageHeader
        eyebrow={`${project.name} · drawings`}
        title={<>Drawn to <em>live</em> dimensions</>}
        lead="Every room, opening and setback responds to the plan settings. Switch floors, change the finish and watch the drawing follow."
        actions={
          <>
            <a className="btn btn-secondary btn-sm" href={`#/p/${project.id}/model`}><Box /> 3D model</a>
            <a className="btn btn-secondary btn-sm" href={`#/p/${project.id}/cost`}>Cost & budget <ArrowUpRight /></a>
          </>
        }
      />

      <div className="plan-studio">
        <section className="plan-main">
          <div className="plan-toolbar">
            <div className="project-tabs plan-floor-tabs" role="tablist" aria-label="Choose floor">
              {floors.map((option) => (
                <button
                  key={`${option.short}-${option.level}`}
                  type="button"
                  className={`project-tab ${activeLevel === option.level ? "is-active" : ""}`}
                  onClick={() => {
                    setFloor(option.id);
                    setActiveLevel(option.level);
                  }}
                  role="tab"
                  aria-selected={activeLevel === option.level}
                >
                  <span className="floor-letter">{option.short}</span>
                  {option.label}
                </button>
              ))}
            </div>

            <div className="plan-toolbar-controls">
              <div className="segmented" aria-label="Drawing style">
                <button type="button" className={`seg ${project.settings.planMode === "paper" ? "is-active" : ""}`} onClick={() => set({ planMode: "paper" })}>Paper</button>
                <button type="button" className={`seg ${project.settings.planMode === "blueprint" ? "is-active" : ""}`} onClick={() => set({ planMode: "blueprint" })}>Blueprint</button>
              </div>
              <div className="plan-toggle-row">
                <label className="toggle-label"><Switch checked={project.settings.showFurniture} onChange={(value) => set({ showFurniture: value })} label="Toggle furniture" /> Furniture</label>
                <label className="toggle-label"><Switch checked={project.settings.showDimensions} onChange={(value) => set({ showDimensions: value })} label="Toggle dimensions" /> Dimensions</label>
              </div>
              <div className="row gap-4">
                <button type="button" className="icon-btn" onClick={exportSvg} disabled={exporting !== null} title="Download SVG" aria-label="Download SVG plan"><FileCode2 /></button>
                <button type="button" className="icon-btn" onClick={exportPng} disabled={exporting !== null} title="Download PNG" aria-label="Download PNG plan"><ImageIcon /></button>
                <button type="button" className="icon-btn" onClick={() => setZoom(true)} title="Expand drawing" aria-label="Expand drawing"><Maximize2 /></button>
              </div>
            </div>
          </div>

          <div className="plan-sheet-panel" ref={drawingRef}>
            <Plan2D
              project={project}
              floorId={activeSheet?.id ?? "ground"}
              mode={project.settings.planMode}
              showFurniture={project.settings.showFurniture}
              showDimensions={project.settings.showDimensions}
              onExpand={() => setZoom(true)}
              level={activeLevel}
            />
            <div className="plan-sheet-meta">
              <span><PencilRuler /> {activeSheet?.label}</span>
              <span>{activeFloor.rooms.length} rooms · {num(activeFloor.rooms.reduce((sum, room) => sum + room.w * room.h, 0), 1)} m²</span>
              <span className="plan-export-note"><Download /> SVG + 2× PNG export</span>
            </div>
          </div>

          <div className="plan-facts">
            <Fact index="01" label="Plot" value={`${num(project.plot.width, 1)} × ${num(project.plot.depth, 1)} m`} note={sqm(plan.plotArea)} />
            <Fact index="02" label="Ground coverage" value={`${plan.coverage.toFixed(0)}%`} note={`${sqm(plan.buildArea)} footprint`} />
            <Fact index="03" label="Setbacks" value={`${num(project.settings.frontSetback, 1)} / ${num(project.settings.rearSetback, 1)} / ${num(project.settings.sideSetback, 2)}`} note="Front / rear / side, metres" />
            <Fact index="04" label="Total built" value={sqm(plan.totalBuilt)} note={sqft(plan.totalBuilt)} />
          </div>

          <div className="room-schedule">
            <div className="section-head" style={{ marginBottom: 12 }}>
              <div>
                <span className="eyebrow no-rule">Room schedule</span>
                <h2 className="section-title" style={{ marginTop: 5 }}>{activeSheet?.label} · measured areas</h2>
              </div>
              <span className="chip">{activeFloor.rooms.length} spaces</span>
            </div>
            <div className="room-table" role="table" aria-label="Room schedule">
              <div className="room-tr room-th" role="row">
                <span>Space</span><span>Use</span><span>Size</span><span>Area</span>
              </div>
              {activeFloor.rooms.map((room) => (
                <div className="room-tr" role="row" key={room.id}>
                  <span className="room-name"><span className={`room-dot kind-${room.kind}`} />{room.name}</span>
                  <span className="room-kind">{kindLabel[room.kind]}</span>
                  <span className="mono">{room.w.toFixed(2)} × {room.h.toFixed(2)}</span>
                  <span className="mono room-area">{num(room.w * room.h, 1)} m²</span>
                </div>
              ))}
              <div className="room-tr room-total" role="row">
                <span>Furnished envelope</span>
                <span />
                <span />
                <span className="mono">{num(activeFloor.rooms.reduce((sum, room) => sum + room.w * room.h, 0), 1)} m²</span>
              </div>
            </div>
          </div>

          <div className="plan-notes">
            <div className="plan-note-card">
              <span className="eyebrow no-rule">Light & air</span>
              <h3 className="display">Every room has two ways out.</h3>
              <p>Cross ventilation at the living room, a rear utility court, and the stair light well pull daylight deep into the narrow plan. {orientation.porch}</p>
              <div className="row gap-4 wrap"><span className="chip sage">{project.orientation} entry</span><span className="chip">Cross breeze</span><span className="chip">Rear court</span></div>
            </div>
            <div className="plan-note-card plan-note-sage">
              <span className="eyebrow no-rule">Vastu, in spirit</span>
              <h3 className="display">Light before rules.</h3>
              <p>Master bedroom to the south-west, kitchen to the south-east, pooja at the north-east. The plan follows orientation and daily use first, then the guiding grid.</p>
              <div className="row gap-4 wrap"><span className="chip">NE pooja</span><span className="chip">SW master</span><span className="chip">SE kitchen</span></div>
            </div>
          </div>

          <div className="plan-print-row">
            <div>
              <strong>Need a review copy?</strong>
              <span className="tiny">The SVG is print-ready at 1:100. The PNG is rendered at 2× for slides and WhatsApp.</span>
            </div>
            <div className="row gap-4">
              <button className="btn btn-secondary btn-sm" type="button" onClick={exportSvg} disabled={exporting !== null}><Download /> SVG</button>
              <button className="btn btn-secondary btn-sm" type="button" onClick={exportPng} disabled={exporting !== null}><ImageIcon /> PNG</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => window.print()}><Printer /> Print</button>
            </div>
          </div>
        </section>

        <Customizer
          project={project}
          compact
          onStoreySelect={(count) => {
            const nextLevel = count - 1;
            setFloor(nextLevel === 0 ? "ground" : "first");
            setActiveLevel(nextLevel);
          }}
        />
      </div>

      <div className="plan-budget-strip">
        <div className="row gap-12">
          <span className="plan-budget-icon"><Sparkles /></span>
          <div>
            <span className="tiny">This drawing currently costs</span>
            <strong className="mono">{inr(project.budget, true)} budget · {project.settings.finish} finish</strong>
          </div>
        </div>
        <span className="tiny">Open costing to move the budget slider and see exactly what changes.</span>
        <a className="btn btn-secondary btn-sm" href={`#/p/${project.id}/cost`}>Open cost sheet <ArrowUpRight /></a>
      </div>

      <AnimatePresence>
        {zoom && (
          <>
            <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(false)} />
            <motion.div
              className="plan-zoom"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Expanded floor plan"
            >
              <div className="plan-zoom-head">
                <div>
                  <span className="eyebrow no-rule">Full sheet · {activeSheet?.label}</span>
                  <h3 className="display">{project.name} <em>· A-{activeLevel === 0 ? "101" : activeLevel === 3 ? "301" : "201"}</em></h3>
                </div>
                <div className="row gap-4">
                  <button className="icon-btn" type="button" onClick={exportPng} aria-label="Download PNG" title="Download PNG"><Download /></button>
                  <button className="icon-btn" type="button" onClick={() => setZoom(false)} aria-label="Close expanded plan"><X /></button>
                </div>
              </div>
              <div className="plan-zoom-canvas">
                <Plan2D project={project} floorId={activeSheet?.id ?? "ground"} mode={project.settings.planMode} showFurniture={project.settings.showFurniture} showDimensions={project.settings.showDimensions} level={activeLevel} />
              </div>
              <div className="plan-zoom-legend">
                <span><Eye /> Hover rooms for dimensions</span>
                <span>{activeFloor.rooms.length} rooms</span>
                <span>{num(activeFloor.rooms.reduce((sum, room) => sum + room.w * room.h, 0), 1)} m² measured</span>
                <span className="row gap-4"><Check /> {project.settings.vastu ? "Vastu-guided" : "Studio layout"}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Fact({ index, label, value, note }: { index: string; label: string; value: string; note: string }) {
  return (
    <div className="plan-fact">
      <span className="plan-fact-index mono">{index}</span>
      <span className="stat-label">{label}</span>
      <strong className="mono">{value}</strong>
      <span className="stat-hint">{note}</span>
    </div>
  );
}
