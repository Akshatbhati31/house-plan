import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
 Box,
  ChevronRight,
  FolderKanban,
  Images,
  IndianRupee,
  LayoutDashboard,
  Menu,
  Ruler,
  ScanLine,
  X,
} from "lucide-react";
import { Logo, ThemeToggle } from "./components/Brand";
import { Sidebar, SidebarContent } from "./components/Sidebar";
import { Toasts } from "./components/UI";
import { useHashRoute, type RouteName } from "./lib/router";
import { useStore } from "./lib/store";
import { CostPage } from "./pages/CostPage";
import { ModelPage } from "./pages/ModelPage";
import { NewProjectPage } from "./pages/NewProjectPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PlanPage } from "./pages/PlanPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ReferencesPage } from "./pages/ReferencesPage";
import { SettingsPage } from "./pages/SettingsPage";

const tabNames: Record<"overview" | "plan" | "model" | "cost" | "refs", string> = {
  overview: "Overview",
  plan: "2D floor plan",
  model: "3D model",
  cost: "Cost & budget",
  refs: "References",
};

const routeKey = (route: RouteName) =>
  route.view === "project" ? `project-${route.id}-${route.tab}` : route.view;

function describeRoute(route: RouteName, projectName?: string) {
  if (route.view === "projects") return { parent: "Workspace", current: "Projects", title: "Projects" };
  if (route.view === "new") return { parent: "Workspace", current: "New site scan", title: "New site scan" };
  if (route.view === "settings") return { parent: "Workspace", current: "Studio settings", title: "Studio settings" };
  return {
    parent: projectName ?? "Project",
    current: tabNames[route.tab],
    title: projectName ? `${projectName} · ${tabNames[route.tab]}` : tabNames[route.tab],
  };
}

export default function App() {
  const { route } = useHashRoute();
  const { projects, settings } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const project = route.view === "project" ? projects.find((item) => item.id === route.id) : undefined;
  const description = describeRoute(route, project?.name);
  const key = routeKey(route);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setDrawerOpen(false);
  }, [key]);

  useEffect(() => {
    document.title = `${description.title} · Bhoomi Studio`;
  }, [description.title]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  let page: ReactNode;
  if (route.view === "projects") {
    page = <ProjectsPage />;
  } else if (route.view === "new") {
    page = <NewProjectPage />;
  } else if (route.view === "settings") {
    page = <SettingsPage />;
  } else if (!project) {
    page = (
      <div className="page missing-page">
        <div className="missing-card">
          <span className="missing-icon"><FolderKanban /></span>
          <span className="eyebrow">Project not found</span>
          <h1 className="display">This plot has wandered off.</h1>
          <p>The project may have been deleted, or the link points to a different browser. Your other homes are safe on the shelf.</p>
          <a className="btn btn-primary" href="#/projects">Back to projects</a>
        </div>
      </div>
    );
  } else {
    switch (route.tab) {
      case "plan":
        page = <PlanPage project={project} />;
        break;
      case "model":
        page = <ModelPage project={project} />;
        break;
      case "cost":
        page = <CostPage project={project} />;
        break;
      case "refs":
        page = <ReferencesPage project={project} />;
        break;
      default:
        page = <OverviewPage project={project} />;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar route={route} />
      <div className="app-main">
        <header className="topbar">
          <button type="button" className="topbar-menu" onClick={() => setDrawerOpen(true)} aria-label="Open navigation"><Menu /></button>
          <div className="topbar-brand"><Logo small /></div>
          <nav className="topbar-crumbs" aria-label="Breadcrumb">
            <a href="#/projects">Workspace</a>
            {description.parent !== "Workspace" && (
              <>
                <ChevronRight />
                <span>{description.parent}</span>
              </>
            )}
            <ChevronRight />
            <strong>{description.current}</strong>
          </nav>
          <div className="topbar-actions">
            <span className="topbar-saved"><span className="pulse-dot" /> All changes saved</span>
            <a className="btn btn-ghost btn-sm topbar-new" href="#/new"><ScanLine /> New site scan</a>
            <ThemeToggle />
          </div>
        </header>

        <main className="app-content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={key}
              className="route-page"
              initial={settings.reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={settings.reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: settings.reducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {page}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="app-foot">
          <div className="row gap-8"><span className="app-foot-mark" /> Bhoomi Studio <span className="app-foot-sep">·</span> <span>Land in. Home out.</span></div>
          <div className="row gap-16 wrap">
            <span>Meerut average rates · 2026</span>
            <span className="app-foot-sep">·</span>
            <a href="#/settings">Palette & settings</a>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div className="scrim drawer-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} />
            <motion.aside
              className="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 40 }}
              aria-label="Navigation"
            >
              <button type="button" className="icon-btn drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation"><X /></button>
              <SidebarContent route={route} onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {route.view === "project" && project && (
        <nav className="mobile-dock" aria-label="Project sections">
          <a className={route.tab === "overview" ? "is-active" : ""} href={`#/p/${project.id}/overview`}><LayoutDashboard /><span>Home</span></a>
          <a className={route.tab === "plan" ? "is-active" : ""} href={`#/p/${project.id}/plan`}><Ruler /><span>Plan</span></a>
          <a className={route.tab === "model" ? "is-active" : ""} href={`#/p/${project.id}/model`}><Box /><span>3D</span></a>
          <a className={route.tab === "cost" ? "is-active" : ""} href={`#/p/${project.id}/cost`}><IndianRupee /><span>Cost</span></a>
          <a className={route.tab === "refs" ? "is-active" : ""} href={`#/p/${project.id}/refs`}><Images /><span>Refs</span></a>
        </nav>
      )}

      <Toasts />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
