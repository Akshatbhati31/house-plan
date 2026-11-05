import {
  ArrowUpRight,
  Box,
  FolderKanban,
  Images,
  Layers3,
  IndianRupee,
  LayoutDashboard,
  Ruler,
  ScanLine,
  Settings2,
  Sparkles,
} from "lucide-react";
import type { RouteName } from "../lib/router";
import { useStore } from "../lib/store";
import { inr } from "../types";
import { Logo, ThemeToggle } from "./Brand";
import { HouseElevation } from "./HouseElevation";

export function SidebarContent({
  route,
  onNavigate,
}: {
  route: RouteName;
  onNavigate?: () => void;
}) {
  const { projects, settings, lastSaved } = useStore();
  const currentId = route.view === "project" ? route.id : projects[0]?.id;
  const project = projects.find((p) => p.id === currentId);
  const isProjects = route.view === "projects";
  const isNew = route.view === "new";
  const isSettings = route.view === "settings";

  return (
    <div className="sidebar-inner" onClick={onNavigate}>
      <Logo />

      <nav className="nav-group" aria-label="Workspace">
        <p className="nav-label">Workspace</p>
        <a className={`nav-link ${isProjects ? "is-active" : ""}`} href="#/projects">
          <FolderKanban />
          Projects
          <span className="nav-badge">{projects.length}</span>
        </a>
        <a className={`nav-link ${isNew ? "is-active" : ""}`} href="#/new">
          <ScanLine />
          New site scan
          <Sparkles size={11} style={{ marginLeft: "auto", color: "var(--accent)" }} />
        </a>
        <a className={`nav-link ${isSettings ? "is-active" : ""}`} href="#/settings">
          <Settings2 />
          Studio settings
        </a>
      </nav>

      {project && (
        <div className="project-nav">
          <div className="project-nav-head">
            <div className="project-thumb">
              <HouseElevation project={project} />
            </div>
            <div className="project-nav-name">
              <strong>{project.name}</strong>
              <span>{project.location}</span>
            </div>
            <span className="badge" style={{ height: 19, padding: "0 6px", fontSize: 8 }}>
              {project.settings.floors === 1 ? "G" : `G+${project.settings.floors - 1}`}
            </span>
          </div>
          <div className="project-links">
            <ProjectLink active={route.view === "project" && route.tab === "overview"} href={`#/p/${project.id}/overview`} icon={<LayoutDashboard />} label="Overview" />
            <ProjectLink active={route.view === "project" && route.tab === "plan"} href={`#/p/${project.id}/plan`} icon={<Ruler />} label="2D floor plan" />
            <ProjectLink active={route.view === "project" && route.tab === "model"} href={`#/p/${project.id}/model`} icon={<Box />} label="3D model" />
            <ProjectLink active={route.view === "project" && route.tab === "cost"} href={`#/p/${project.id}/cost`} icon={<IndianRupee />} label="Cost & budget" />
            <ProjectLink active={route.view === "project" && route.tab === "refs"} href={`#/p/${project.id}/refs`} icon={<Images />} label="References" />
          </div>
          <div className="row" style={{ justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
            <span className="tiny" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Layers3 size={11} /> {Math.round(project.plot.width * project.plot.depth)} m² plot
            </span>
            <a className="tiny link-arrow" href={`#/p/${project.id}/cost`} style={{ fontSize: 10 }}>
              {inr(project.budget, true)}
              <ArrowUpRight size={11} />
            </a>
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="save-state">
          <span className="pulse-dot" />
          All changes saved · {new Date(lastSaved).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="theme-switch">
          <span>{settings.theme === "dark" ? "Dark studio" : "Light studio"}</span>
          <ThemeToggle />
        </div>
        <a className="user-card" href="#/settings">
          <span className="avatar">A</span>
          <span className="user-meta">
            <strong>Aarav Sharma</strong>
            <span>Homeowner · Meerut</span>
          </span>
          <Settings2 />
        </a>
      </div>
    </div>
  );
}

function ProjectLink({
  active,
  href,
  icon,
  label,
}: {
  active: boolean;
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a className={`project-link ${active ? "is-active" : ""}`} href={href}>
      {icon}
      {label}
      {active && <span className="status-tick" />}
    </a>
  );
}

export function Sidebar({ route }: { route: RouteName }) {
  return (
    <aside className="sidebar">
      <SidebarContent route={route} />
    </aside>
  );
}
