import {
  ArrowUpRight,
  Copy,
  FolderKanban,
  IndianRupee,
  Layers3,
  MapPin,
  Plus,
  ScanLine,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getCosts, getPlan } from "../lib/plan";
import { useStore } from "../lib/store";
import { HouseElevation } from "../components/HouseElevation";
import { PageHeader } from "../components/PageHeader";
import { inr, orientationGuide, sqm } from "../types";
import type { Project } from "../types";

const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function ProjectsPage() {
  const { projects, settings, duplicateProject, deleteProject, toast } = useStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...projects].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    if (!q) return sorted;
    return sorted.filter((project) => `${project.name} ${project.location} ${project.style}`.toLowerCase().includes(q));
  }, [projects, query]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const totalArea = projects.reduce((sum, project) => sum + getPlan(project).totalBuilt, 0);
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalEstimate = projects.reduce((sum, project) => sum + getCosts(project).total, 0);

  const duplicate = (project: Project) => {
    const id = duplicateProject(project.id);
    if (id) toast(`${project.name} duplicated — you can shape a fresh version`, "success");
  };

  const remove = (project: Project) => {
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`)) return;
    deleteProject(project.id);
    toast(`${project.name} removed`, "warning");
  };

  return (
    <div className="page projects-page">
      <section className="dash-hero">
        <div className="dash-hero-copy">
          <span className="eyebrow">Bhoomi Studio · Meerut</span>
          <h1 className="display dash-title">
            Land in. <em>Home out.</em>
          </h1>
          <p className="dash-lead">
            Upload a site drawing, read the land, and shape a buildable home — plan, model and real Meerut costs in one quiet workspace.
          </p>
          <div className="row gap-8 wrap dash-cta">
            <a className="btn btn-primary btn-lg" href="#/new">
              <ScanLine /> Scan a new site
            </a>
            <a className="btn btn-secondary btn-lg" href="#/settings">
              <Sparkles /> Studio settings
            </a>
          </div>
          <div className="dash-meta">
            <span><strong>{projects.length}</strong> project{projects.length === 1 ? "" : "s"}</span>
            <span className="dash-meta-divider" />
            <span><strong>{Math.round(totalArea)}</strong> m² shaped</span>
            <span className="dash-meta-divider" />
            <span><strong>{inr(totalBudget, true)}</strong> in budgets</span>
          </div>
        </div>
        <div className="dash-hero-art" aria-hidden="true">
          <div className="hero-sun" />
          <div className="hero-arch" />
          <div className="hero-house">
            <HouseElevation project={featured ?? projects[0]} showLabels />
          </div>
          <div className="hero-caption">
            <span>{featured ? orientationGuide(featured.orientation).light : "East light"}</span>
            <strong>{featured ? `${featured.plot.width} m frontage` : "7.5 m frontage"}</strong>
          </div>
        </div>
      </section>

      <section className="dash-section">
        <div className="section-head">
          <div>
            <span className="eyebrow no-rule">Project shelf</span>
            <h2 className="section-title" style={{ marginTop: 5 }}>Your homes in progress</h2>
            <p className="section-sub">{projects.length === 0 ? "Nothing here yet — start with a land drawing." : `${projects.length} live brief${projects.length === 1 ? "" : "s"} · ${Math.round(totalEstimate / 100000)} L of estimated work`}</p>
          </div>
          <div className="row gap-8 wrap">
            {projects.length > 1 && (
              <label className="search-field">
                <Search />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" aria-label="Search projects" />
              </label>
            )}
            <a className="btn btn-secondary btn-sm" href="#/new"><Plus /> New project</a>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty" style={{ padding: 64 }}>
            <FolderKanban size={26} />
            <strong>Your shelf is empty</strong>
            <p>Upload a land map and the studio will draft your first plan in a few seconds.</p>
            <a className="btn btn-primary" href="#/new"><ScanLine /> Start a project</a>
          </div>
        ) : (
          <>
            {featured && (
              <article className="featured-project card">
                <a className="featured-cover" href={`#/p/${featured.id}/overview`} aria-label={`Open ${featured.name}`}>
                  <div className="featured-cover-inner">
                    <HouseElevation project={featured} showLabels />
                  </div>
                  <span className="featured-pill"><span className="pulse-dot" /> Current focus</span>
                  <span className="featured-open"><ArrowUpRight /></span>
                </a>
                <div className="featured-body">
                  <div className="row gap-8 wrap">
                    <span className="badge">{featured.approval === "approved" ? "Approved concept" : "Concept in progress"}</span>
                    <span className="chip">{featured.style}</span>
                    <span className="chip">{featured.orientation}-facing</span>
                  </div>
                  <h3 className="featured-name display">{featured.name}</h3>
                  <p className="featured-location"><MapPin /> {featured.location}</p>
                  <p className="featured-note">
                    {featured.settings.floors === 1 ? "Ground-floor" : `G+${featured.settings.floors - 1}`} home with {featured.settings.roofRoom ? "roof room" : "open terrace"}
                    {featured.settings.garage ? ", garage" : ""} · {featured.settings.finish} finish.
                  </p>
                  <div className="featured-stats">
                    <FeaturedStat label="Plot" value={sqm(featured.plot.width * featured.plot.depth)} />
                    <FeaturedStat label="Built" value={sqm(getPlan(featured).totalBuilt)} />
                    <FeaturedStat label="Budget" value={inr(featured.budget, true)} />
                    <FeaturedStat label="Estimate" value={inr(getCosts(featured).total, true)} />
                  </div>
                  <div className="featured-actions">
                    <a className="btn btn-primary" href={`#/p/${featured.id}/overview`}>
                      Open project <ArrowUpRight />
                    </a>
                    <a className="btn btn-secondary" href={`#/p/${featured.id}/plan`}>View 2D plan</a>
                    <a className="icon-btn" href={`#/p/${featured.id}/refs`} title="Reference images" aria-label="Reference images"> <Sparkles /> </a>
                    <button className="icon-btn" type="button" onClick={() => duplicate(featured)} title="Duplicate project" aria-label="Duplicate project"><Copy /></button>
                    <button className="icon-btn" type="button" onClick={() => remove(featured)} title="Delete project" aria-label="Delete project"><Trash2 /></button>
                  </div>
                  <div className="featured-foot">
                    <span className="tiny">Edited {dateLabel(featured.updatedAt)}</span>
                    <span className="tiny">{featured.references.length} reference{featured.references.length === 1 ? "" : "s"} · {featured.mapSource === "upload" ? "uploaded land map" : "studio site sketch"}</span>
                  </div>
                </div>
              </article>
            )}

            <div className="projects-grid">
              {rest.map((project) => (
                <ProjectCard key={project.id} project={project} onDuplicate={() => duplicate(project)} onDelete={() => remove(project)} />
              ))}

              <a className="new-project-card" href="#/new">
                <span className="new-project-icon"><Plus /></span>
                <span className="eyebrow no-rule">Start fresh</span>
                <strong className="display">Bring another plot to life</strong>
                <p>Upload a land map, confirm the measurements, and generate a fresh set of drawings and costs.</p>
                <span className="link-arrow">Scan a new site <ArrowUpRight /></span>
              </a>

              <div className="studio-note-card">
                <span className="eyebrow no-rule">Studio note</span>
                <h3 className="display">{settings.paletteApproved ? "Your palette is signed off." : "A palette is waiting for your eye."}</h3>
                <p>
                  {settings.paletteApproved
                    ? "Copper & Sage is locked in for the studio interface. The home materials stay yours to shape per project."
                    : "We picked warm copper and quiet sage for the studio. Approve it, or preview Clay & Olive and Brass & Eucalyptus in settings."}
                </p>
                <div className="palette-strip" aria-hidden="true">
                  <span style={{ background: "#141413" }} />
                  <span style={{ background: "#22211F" }} />
                  <span style={{ background: "#F4F1EA" }} />
                  <span style={{ background: "#A8A49E" }} />
                  <span style={{ background: "#E08A6E" }} />
                  <span style={{ background: "#7A9A80" }} />
                  <span style={{ background: "#F9F8F6" }} />
                  <span style={{ background: "#C86D51" }} />
                </div>
                <a className="btn btn-sage btn-sm" href="#/settings">Review the palette <ArrowUpRight /></a>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="dash-insights">
        <InsightCard icon={<Layers3 />} label="Portfolio footprint" value={sqm(totalArea)} note="Across all live concepts. Carpet area is about 82% of built." />
        <InsightCard icon={<IndianRupee />} label="Estimated build value" value={inr(totalEstimate, true)} note="Meerut turnkey averages, updated with your finish choices." />
        <InsightCard icon={<MapPin />} label="Site context" value={featured ? orientationGuide(featured.orientation).facing : "East-facing"} note={featured ? orientationGuide(featured.orientation).site : "Morning light at the entry, shaded courtyard to the rear."} />
      </section>
    </div>
  );
}

function FeaturedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="featured-stat">
      <span>{label}</span>
      <strong className="mono">{value}</strong>
    </div>
  );
}

function ProjectCard({ project, onDuplicate, onDelete }: { project: Project; onDuplicate: () => void; onDelete: () => void }) {
  const plan = getPlan(project);
  const costs = getCosts(project);
  return (
    <article className="project-card card is-hoverable">
      <a className="project-card-cover" href={`#/p/${project.id}/overview`} aria-label={`Open ${project.name}`}>
        <HouseElevation project={project} />
        <span className="project-card-floor">{project.settings.floors === 1 ? "G" : `G+${project.settings.floors - 1}`}</span>
      </a>
      <div className="project-card-body">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className={`badge ${project.approval === "approved" ? "" : "neutral"}`}>{project.approval === "approved" ? "Approved" : "Concept"}</span>
          <span className="tiny">{dateLabel(project.updatedAt)}</span>
        </div>
        <a href={`#/p/${project.id}/overview`} className="project-card-title display">{project.name}</a>
        <span className="project-card-location"><MapPin /> {project.location}</span>
        <div className="project-card-meta">
          <span>{sqm(plan.totalBuilt)} built</span>
          <span>{inr(project.budget, true)} budget</span>
          <span>{inr(costs.total, true)} est.</span>
        </div>
        <div className="project-card-actions">
          <a className="link-arrow" href={`#/p/${project.id}/overview`}>Open project <ArrowUpRight /></a>
          <span className="row gap-4">
            <button className="icon-btn" type="button" title="Duplicate" aria-label={`Duplicate ${project.name}`} onClick={onDuplicate}><Copy /></button>
            <button className="icon-btn" type="button" title="Delete" aria-label={`Delete ${project.name}`} onClick={onDelete}><Trash2 /></button>
          </span>
        </div>
      </div>
    </article>
  );
}

function InsightCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <div className="insight-card">
      <span className="insight-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <strong className="mono">{value}</strong>
      <p>{note}</p>
    </div>
  );
}
