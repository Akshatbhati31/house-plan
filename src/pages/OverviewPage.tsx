import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Box,
  Check,
  ChevronRight,
  Circle,
  Images,
  IndianRupee,
  Layers3,
  MapPin,
  Palette,
  PencilRuler,
  Ruler,
  Sparkles,
  Sun,
  Wand2,
} from "lucide-react";
import { Customizer } from "../components/Customizer";
import { HouseElevation } from "../components/HouseElevation";
import { Plan2D } from "../components/Plan2D";
import { SiteSketch } from "../components/SiteSketch";
import { StatBlock } from "../components/PageHeader";
import { getBudgetReadout, getCosts, getPlan } from "../lib/plan";
import { useStore } from "../lib/store";
import { inr, num, orientationGuide, sqft, sqm, type Project } from "../types";

type PreviewFloor = "ground" | "first" | "roof";

export function OverviewPage({ project }: { project: Project }) {
  const { updateProject, settings, toast } = useStore();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [previewFloor, setPreviewFloor] = useState<PreviewFloor>("ground");
  const plan = getPlan(project);
  const costs = getCosts(project);
  const readout = getBudgetReadout(project);
  const orientation = orientationGuide(project.orientation);
  const gap = project.budget - costs.total;
  const floorName = previewFloor === "ground" ? "Ground" : previewFloor === "roof" ? "Roof" : project.settings.floors === 3 ? "Second" : "First";

  const toggleApproval = () => {
    const next = project.approval === "approved" ? "concept" : "approved";
    updateProject(project.id, { approval: next });
    toast(next === "approved" ? "Concept approved — the design is ready to develop" : "Concept moved back to in progress", next === "approved" ? "success" : "default");
  };

  return (
    <div className="page overview-page">
      <div className="project-topline">
        <span className="eyebrow">Project file · {project.approval === "approved" ? "approved" : "concept in progress"}</span>
        <div className="row gap-4 wrap project-topline-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={toggleApproval}>
            {project.approval === "approved" ? <Check /> : <Circle />}
            {project.approval === "approved" ? "Approved" : "Approve concept"}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCustomizeOpen(true)}><Wand2 /> Customize</button>
          <a className="btn btn-primary btn-sm" href={`#/p/${project.id}/plan`}>Open drawings <ArrowUpRight /></a>
        </div>
      </div>

      <section className="overview-hero">
        <div className="overview-copy">
          <div className="row gap-8 wrap">
            <span className="badge">{project.orientation}-facing entry</span>
            <span className="chip">{project.style}</span>
            <span className="chip">{project.settings.finish} finish</span>
          </div>
          <h1 className="display overview-title">{project.name}</h1>
          <p className="overview-location"><MapPin /> {project.location}</p>
          <p className="overview-lead">
            A {project.settings.floors === 1 ? "single-level" : `G+${project.settings.floors - 1}`} home for a {num(project.plot.width, 1)} × {num(project.plot.depth, 1)} m {orientation.facing} plot.
            {" "}{project.settings.roofRoom ? "A roof room and terrace sit above the family floors." : "The roof stays open to the sky."}
          </p>
          <div className="overview-actions">
            <a className="btn btn-secondary" href={`#/p/${project.id}/plan`}><PencilRuler /> 2D floor plan</a>
            <a className="btn btn-secondary" href={`#/p/${project.id}/model`}><Box /> 3D model</a>
            <a className="btn btn-ghost" href={`#/p/${project.id}/cost`}><IndianRupee /> Cost & budget</a>
          </div>
          <div className="overview-tags">
            <Tag icon={<Layers3 />}>{project.settings.floors === 1 ? "Ground floor" : `G + ${project.settings.floors - 1}`}</Tag>
            <Tag icon={<Ruler />}>{sqm(plan.totalBuilt)} built</Tag>
            <Tag icon={<Sun />}>{orientation.light}</Tag>
            <Tag icon={<Palette />}>{project.settings.facade === "terracotta" ? "Basalt & terracotta" : project.settings.facade === "sandstone" ? "Sandstone & teak" : project.settings.facade === "limewash" ? "Lime wash & sage" : "Exposed brick"}</Tag>
          </div>
        </div>

        <div className="overview-art">
          <div className="overview-art-glow" />
          <HouseElevation project={project} showLabels className="overview-elevation" />
          <div className="overview-art-bar">
            <div>
              <span className="tiny">Turnkey estimate</span>
              <strong className="mono">{inr(costs.total, true)}</strong>
            </div>
            <div>
              <span className="tiny">Budget</span>
              <strong className="mono">{inr(project.budget, true)}</strong>
            </div>
            <div>
              <span className="tiny">Status</span>
              <strong className={gap < 0 ? "is-over" : "is-under"}>{gap < 0 ? `${inr(Math.abs(gap), true)} over` : `${inr(gap, true)} headroom`}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="overview-stats">
        <StatBlock label="Plot area" value={sqm(plan.plotArea)} hint={`${sqft(plan.plotArea)} · ${plan.coverage.toFixed(0)}% ground coverage`} />
        <StatBlock label="Built-up area" value={sqm(plan.totalBuilt)} hint={`${plan.floors.length - 1 === 0 ? "" : ""}${sqft(plan.totalBuilt)} across ${project.settings.floors} live level${project.settings.floors === 1 ? "" : "s"} + roof`} />
        <StatBlock label="Carpet area" value={sqm(plan.carpetArea)} hint="About 82% of built-up, after walls" />
        <StatBlock label="Estimate" value={inr(costs.total, true)} hint={`₹${Math.round(costs.perSqft).toLocaleString("en-IN")}/ft² · ${costs.tierName} finish`} />
      </div>

      <section className="overview-grid">
        <article className="overview-card site-card">
          <div className="overview-card-head">
            <div>
              <span className="eyebrow no-rule">The land</span>
              <h2 className="section-title" style={{ marginTop: 6 }}>{num(project.plot.width, 1)} m of {orientation.lower} frontage</h2>
              <p className="section-sub">{project.mapSource === "upload" ? "Uploaded site drawing · recreated as a working record." : "Original site sketch · hand-drawn measurements."}</p>
            </div>
            <span className="chip sage"><Check /> Verified</span>
          </div>
          <div className="site-map-frame">
            {project.mapImage ? (
              <img src={project.mapImage} alt={`Land map uploaded for ${project.name}`} className="site-map-image" />
            ) : (
              <SiteSketch compact width={project.plot.width} depth={project.plot.depth} orientation={project.orientation} />
            )}
            <div className="site-map-stamp">
              <span>Plot</span>
              <strong className="mono">{num(project.plot.width, 1)} × {num(project.plot.depth, 1)} m</strong>
              <span>{sqm(plan.plotArea)} · Meerut</span>
            </div>
          </div>
          <ul className="detected-list">
            {project.detectedNotes.length > 0 ? project.detectedNotes.map((note) => (
              <li key={note}><Check /> {note}</li>
            )) : (
              <li><Check /> Dimensions confirmed with the studio · {sqm(plan.plotArea)}</li>
            )}
          </ul>
        </article>

        <article className="overview-card plan-card">
          <div className="overview-card-head">
            <div>
              <span className="eyebrow no-rule">Spatial sketch</span>
              <h2 className="section-title" style={{ marginTop: 6 }}>The plan at a glance</h2>
              <p className="section-sub">Furniture shown for scale. Hover any room for its dimensions.</p>
            </div>
            <div className="segmented overview-floor-tabs">
              {(["ground", "first", "roof"] as PreviewFloor[]).map((floor) => (
                <button key={floor} type="button" className={`seg ${previewFloor === floor ? "is-active" : ""}`} onClick={() => setPreviewFloor(floor)}>
                  {floor === "ground" ? "G" : floor === "roof" ? "R" : project.settings.floors === 3 ? "S" : "F"}
                </button>
              ))}
            </div>
          </div>
          <div className="overview-plan-frame">
            <Plan2D
              project={project}
              floorId={previewFloor}
              mode={project.settings.planMode}
              showFurniture={project.settings.showFurniture}
              showDimensions={project.settings.showDimensions}
            />
          </div>
          <div className="overview-plan-foot">
            <span className="tiny">{floorName} floor · {plan.floors[previewFloor === "ground" ? 0 : previewFloor === "first" ? (project.settings.floors === 3 ? 2 : 1) : plan.floors.length - 1].rooms.length} rooms · scale 1:100</span>
            <a className="link-arrow" href={`#/p/${project.id}/plan`}>Room schedule <ArrowUpRight /></a>
          </div>
        </article>
      </section>

      <section className="overview-lower">
        <article className="overview-card budget-panel">
          <div className="overview-card-head">
            <div>
              <span className="eyebrow no-rule">Money, in Meerut</span>
              <h2 className="section-title" style={{ marginTop: 6 }}>{gap < 0 ? "A little over budget" : "Comfortably within budget"}</h2>
            </div>
            <span className={`badge ${gap < 0 ? "amber" : ""}`}>{gap < 0 ? "Needs a trim" : "Budget fit"}</span>
          </div>
          <div className="budget-bar-large">
            <span className="budget-bar-fill" style={{ width: `${Math.min(100, (costs.total / project.budget) * 100)}%` }} />
            <span className="budget-bar-marker" style={{ left: `${Math.min(96, readout.coverage)}%` }} aria-hidden="true" />
          </div>
          <div className="budget-bar-labels">
            <span><strong className="mono">{inr(costs.total, true)}</strong> estimate</span>
            <span><strong className="mono">{inr(project.budget, true)}</strong> budget</span>
          </div>
          <div className="budget-mini-rows">
            <MiniRow label="Core construction" value={inr(costs.construction, true)} />
            <MiniRow label="Design & approvals" value={`${inr(costs.professional + costs.statutory + costs.contingency, true)}`} />
            <MiniRow label="Add-ons & interiors" value={inr(costs.enhancements + costs.interiors, true)} />
          </div>
          <a className="btn btn-secondary btn-sm" href={`#/p/${project.id}/cost`}>Adjust the budget <ChevronRight /></a>
        </article>

        <article className="overview-card refs-panel">
          <div className="overview-card-head">
            <div>
              <span className="eyebrow no-rule">Reference shelf</span>
              <h2 className="section-title" style={{ marginTop: 6 }}>The feeling of home</h2>
              <p className="section-sub">{project.references.length} image{project.references.length === 1 ? "" : "s"} guiding materials, light and detail.</p>
            </div>
            <a className="icon-btn" href={`#/p/${project.id}/refs`} aria-label="Open references"><Images /></a>
          </div>
          <div className="overview-refs">
            {project.references.slice(0, 3).map((ref) => (
              <a key={ref.id} className="overview-ref" href={`#/p/${project.id}/refs`}>
                <img src={ref.dataUrl} alt={ref.name} />
                <span>{ref.name}</span>
              </a>
            ))}
            {project.references.length === 0 && (
              <a className="overview-ref-empty" href={`#/p/${project.id}/refs`}>
                <Images />
                <span>Add your first reference</span>
              </a>
            )}
          </div>
          <a className="link-arrow" href={`#/p/${project.id}/refs`}>Open inspiration board <ArrowUpRight /></a>
        </article>

        <article className="overview-card next-panel">
          <div className="overview-card-head">
            <div>
              <span className="eyebrow no-rule">Next steps</span>
              <h2 className="section-title" style={{ marginTop: 6 }}>Where this is going</h2>
            </div>
            <Sparkles className="next-spark" />
          </div>
          <ul className="check-list">
            <CheckRow done label="Land measurements read" hint={`${num(project.plot.width, 1)} × ${num(project.plot.depth, 1)} m`} />
            <CheckRow done label="Spatial plan generated" hint={`${plan.floors[0].rooms.length} ground-floor rooms`} />
            <CheckRow done={settings.paletteApproved} label="Studio palette approved" hint={settings.paletteApproved ? "Copper & Sage selected" : "See settings"} href="#/settings" />
            <CheckRow done={project.approval === "approved"} label="Concept approved" hint={project.approval === "approved" ? "Locked for development" : "Approve when ready"} action={toggleApproval} />
          </ul>
          <div className="next-foot">
            <span className="tiny">Saved to this device automatically</span>
            <button type="button" className="link-arrow" onClick={() => setCustomizeOpen(true)}>Open design studio <ArrowUpRight /></button>
          </div>
        </article>
      </section>

      <AnimatePresence>
        {customizeOpen && (
          <>
            <motion.div
              className="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomizeOpen(false)}
            />
            <motion.div
              className="overlay-sheet"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 38 }}
              role="dialog"
              aria-modal="true"
              aria-label="Customize the home"
            >
              <Customizer project={project} onClose={() => setCustomizeOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tag({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <span className="overview-tag">{icon}{children}</span>;
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-row">
      <span>{label}</span>
      <strong className="mono">{value}</strong>
    </div>
  );
}

function CheckRow({
  done,
  label,
  hint,
  href,
  action,
}: {
  done: boolean;
  label: string;
  hint: string;
  href?: string;
  action?: () => void;
}) {
  const content = (
    <>
      <span className={`check-dot ${done ? "is-done" : ""}`}>{done ? <Check /> : <Circle />}</span>
      <span className="check-copy">
        <strong>{label}</strong>
        <span>{hint}</span>
      </span>
      {href && <ChevronRight className="check-arrow" />}
    </>
  );
  if (href) return <li className="check-row is-link"><a href={href}>{content}</a></li>;
  if (action) return <li className="check-row"><button type="button" onClick={action}>{content}</button></li>;
  return <li className="check-row">{content}</li>;
}
