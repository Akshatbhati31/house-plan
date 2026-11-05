import {
  ArrowUpRight,
  Box,
  Check,
  Compass,
  Layers3,
  Move3d,
  Palette,
  Ruler,
  Sun,
} from "lucide-react";
import { Customizer } from "../components/Customizer";
import { HouseScene } from "../components/HouseScene";
import { PageHeader } from "../components/PageHeader";
import { getPlan } from "../lib/plan";
import { useStore } from "../lib/store";
import { FACADES, FLOORING, num, orientationGuide, sqft, sqm, type Project } from "../types";

export function ModelPage({ project }: { project: Project }) {
  const plan = getPlan(project);
  const { settings } = useStore();
  const facade = FACADES[project.settings.facade];
  const flooring = FLOORING[project.settings.flooring];
  const orientation = orientationGuide(project.orientation);
  const roofFloor = plan.floors[plan.floors.length - 1];
  const upperLevels = plan.floors.filter((floor) => floor.level !== undefined && floor.level !== 0 && floor.level !== 3);

  return (
    <div className="page model-page">
      <PageHeader
        eyebrow={`${project.name} · spatial model`}
        title={<>Walk the house <em>before</em> it exists</>}
        lead="A live dollhouse cutaway of your plan. Isolate a floor, explode the stack, move the sun, then take a snapshot for the site meeting."
        actions={
          <>
            <a className="btn btn-secondary btn-sm" href={`#/p/${project.id}/plan`}><Ruler /> 2D plan</a>
            <a className="btn btn-secondary btn-sm" href={`#/p/${project.id}/cost`}>Cost & budget <ArrowUpRight /></a>
          </>
        }
      />

      <div className="model-layout">
        <section className="model-main">
          <HouseScene project={project} />

          <div className="model-facts">
            <ModelFact icon={<Move3d />} label="Model type" value="Live dollhouse" note="Low interior walls reveal the plan" />
            <ModelFact icon={<Layers3 />} label="Levels" value={`${project.settings.floors + (project.settings.roofRoom ? 1 : 0)} volumes`} note={`${project.settings.floors === 1 ? "Ground" : `G + ${project.settings.floors - 1}`}${project.settings.roofRoom ? " + roof room" : " + open roof"}`} />
            <ModelFact icon={<Ruler />} label="Built envelope" value={sqm(plan.totalBuilt)} note={sqft(plan.totalBuilt)} />
            <ModelFact icon={<Sun />} label="Orientation" value={`${project.orientation} light`} note="Frontage faces the approach road" />
          </div>

          <div className="model-cards">
            <article className="model-card">
              <span className="eyebrow no-rule">Reading the model</span>
              <h2 className="section-title" style={{ marginTop: 6 }}>A study, not a showpiece</h2>
              <p className="model-card-copy">
                Walls are cut at 1.15 m so you can read the rooms from above. The garage, entry, stair and service core stay where the plan puts them. Materials follow your studio choices.
              </p>
              <ul className="model-list">
                <li><Check /> Drag to orbit · scroll to zoom · right-drag to pan</li>
                <li><Check /> Isolate G, F, S or R to review a single stacked level</li>
                <li><Check /> Explode the stack to check slabs and roof volumes</li>
                <li><Check /> Move the sun to test morning and evening shadow</li>
              </ul>
              <a className="link-arrow" href={`#/p/${project.id}/plan`}>Compare with the 2D sheet <ArrowUpRight /></a>
            </article>

            <article className="model-card material-card">
              <span className="eyebrow no-rule">Material story</span>
              <h2 className="section-title" style={{ marginTop: 6 }}>What the model is wearing</h2>
              <div className="material-swatch-large">
                <span style={{ background: facade.wall }} />
                <span style={{ background: facade.accent }} />
                <span style={{ background: facade.trim }} />
                <span style={{ background: flooring.color }} />
              </div>
              <div className="material-rows">
                <div className="mini-row"><span>Façade</span><strong>{facade.name}</strong></div>
                <div className="mini-row"><span>Flooring</span><strong>{flooring.name}</strong></div>
                <div className="mini-row"><span>Package</span><strong style={{ textTransform: "capitalize" }}>{project.settings.finish}</strong></div>
                <div className="mini-row"><span>Garage</span><strong>{project.settings.garage ? (project.settings.garageType === "carport" ? "MS carport" : "Covered bay") : "Open court"}</strong></div>
              </div>
              <div className="callout-sage">
                <Palette size={15} />
                <p>The model responds to every finish change in the studio panel. Try <strong>Sandstone & teak</strong> or <strong>Lime wash & sage</strong> to test the frontage before it is built.</p>
              </div>
            </article>

            <article className="model-card level-area-card">
              <span className="eyebrow no-rule">Levels</span>
              <h2 className="section-title" style={{ marginTop: 6 }}>Stack at a glance</h2>
              <div className="level-area-list">
                <div className="level-area-row">
                  <span className="level-chip">G</span>
                  <span><strong>Ground floor</strong><em>Garage · living · kitchen · bedroom</em></span>
                  <span className="mono">{num(plan.floors[0].rooms.reduce((sum, room) => sum + room.w * room.h, 0), 1)} m²</span>
                </div>
                {upperLevels.map((floor) => (
                  <div className="level-area-row" key={floor.level}>
                    <span className="level-chip">{floor.short}</span>
                    <span><strong>{floor.name}</strong><em>Master · bedrooms · lounge · balcony</em></span>
                    <span className="mono">{num(floor.rooms.reduce((sum, room) => sum + room.w * room.h, 0), 1)} m²</span>
                  </div>
                ))}
                <div className="level-area-row">
                  <span className="level-chip">R</span>
                  <span><strong>Roof terrace</strong><em>{project.settings.roofRoom ? "Roof room · terrace · pergola" : "Terrace · pergola · solar"}</em></span>
                  <span className="mono">{num(roofFloor.rooms.reduce((sum, room) => sum + room.w * room.h, 0), 1)} m²</span>
                </div>
              </div>
              <p className="tiny" style={{ marginTop: 12 }}>Room envelopes, excluding walls. Total built area is {sqm(plan.totalBuilt)}.</p>
            </article>

            <article className="model-card orientation-card">
              <span className="orientation-rose" aria-hidden="true"><Compass /> <em>{orientation.compass}</em></span>
              <span className="eyebrow no-rule">Site rhythm</span>
              <h2 className="section-title" style={{ marginTop: 6 }}>{orientation.title}</h2>
              <p className="model-card-copy">
                The {project.plot.width} m frontage opens {orientation.lower}, so {orientation.model}. The rear service court pulls cool air through the depth of the plan.
              </p>
              <div className="row gap-4 wrap">
                <span className="chip">{settings.theme === "dark" ? "Dark studio view" : "Light studio view"}</span>
                <span className="chip sage">{project.orientation} entry</span>
                <span className="chip">9 m approach road</span>
              </div>
            </article>
          </div>
        </section>

        <Customizer project={project} compact />
      </div>

      <div className="model-bottom-strip">
        <div className="row gap-8"><Box /><strong>Dollhouse model</strong><span className="tiny">Generated live from the same plan as the 2D sheet</span></div>
        <a className="link-arrow" href={`#/p/${project.id}/cost`}>See what it costs to build <ArrowUpRight /></a>
      </div>
    </div>
  );
}

function ModelFact({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <div className="model-fact">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <strong className="mono">{value}</strong>
      <span className="stat-hint">{note}</span>
    </div>
  );
}
