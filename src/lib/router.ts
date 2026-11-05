import { useCallback, useEffect, useState } from "react";

export type RouteName =
  | { view: "project"; id: string; tab: "overview" | "plan" | "model" | "cost" | "refs" }
  | { view: "projects" }
  | { view: "new" }
  | { view: "settings" };

function parse(hash: string): RouteName {
  const clean = hash.replace(/^#\/?/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "projects") return { view: "projects" };
  if (parts[0] === "new") return { view: "new" };
  if (parts[0] === "settings") return { view: "settings" };
  if (parts[0] === "p" && parts[1]) {
    const tab = parts[2];
    const allowed = ["overview", "plan", "model", "cost", "refs"] as const;
    return {
      view: "project",
      id: parts[1],
      tab: (allowed as readonly string[]).includes(tab ?? "") ? (tab as (typeof allowed)[number]) : "overview",
    };
  }
  return { view: "project", id: "project1", tab: "overview" };
}

export function useHashRoute() {
  const [route, setRoute] = useState<RouteName>(() => parse(window.location.hash));

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/p/project1/overview");
      setRoute(parse("#/p/project1/overview"));
    }
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((path: string) => {
    const next = path.startsWith("#") ? path : `#${path.startsWith("/") ? "" : "/"}${path}`;
    if (window.location.hash === next) {
      setRoute(parse(next));
      return;
    }
    window.location.hash = next;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return { route, navigate };
}

export const projectPath = (id: string, tab: "overview" | "plan" | "model" | "cost" | "refs" = "overview") =>
  `#/p/${id}/${tab}`;
