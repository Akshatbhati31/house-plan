import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Camera, Layers3, Pause, Play, RotateCcw, SlidersHorizontal, Sparkles, Sun } from "lucide-react";
import { buildHouse, type BuiltHouse, type Level } from "../three/buildHouse";
import type { Project } from "../types";
import { useStore } from "../lib/store";
import { downloadDataUrl, safeFileStem } from "../lib/files";

interface Engine {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  sunLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  house: BuiltHouse | null;
  frame: number;
  observer: ResizeObserver | null;
}

export function HouseScene({ project }: { project: Project }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const { settings, toast } = useStore();
  const [focus, setFocus] = useState<number | "all">("all");
  const [explode, setExplode] = useState(0);
  const [sun, setSun] = useState(55);
  const [autoRotate, setAutoRotate] = useState(false);
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);
  const theme = settings.theme;

  /* scene bootstrap */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth || 800, host.clientHeight || 560);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.domElement.setAttribute("aria-label", `Interactive 3D model of ${project.name}`);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = theme === "dark" ? "#1b1a18" : "#eee7db";
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, 34, 76);

    // a soft gradient backdrop gives the house room to breathe
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 70),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(theme === "dark" ? "#26241f" : "#e7dcc8"), fog: false }),
    );
    backdrop.position.set(0, 18, -34);
    backdrop.rotation.x = -0.18;
    scene.add(backdrop);

    const camera = new THREE.PerspectiveCamera(38, (host.clientWidth || 800) / (host.clientHeight || 560), 0.1, 160);
    // a slightly off-axis three-quarter view that shows the front, the side
    // and the roof in one frame, instead of a flat front elevation
    camera.position.set(
      Math.max(10, project.plot.width * 1.35),
      Math.max(7.2, project.settings.floors * 3.1),
      Math.max(13, project.plot.depth * 1.02),
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.85;
    controls.panSpeed = 0.6;
    controls.minDistance = 5;
    controls.maxDistance = 58;
    controls.maxPolarAngle = Math.PI / 2 - 0.035;
    controls.minPolarAngle = 0.12;
    controls.target.set(0, Math.min(3.5, project.settings.floors * 1.7), 0.2);
    controls.update();

    const hemi = new THREE.HemisphereLight(theme === "dark" ? "#819188" : "#ffffff", theme === "dark" ? "#2b2521" : "#c9bda9", theme === "dark" ? 0.74 : 1.02);
    scene.add(hemi);

    const sunLight = new THREE.DirectionalLight(theme === "dark" ? "#ffe3bd" : "#fff4e1", theme === "dark" ? 2.7 : 2.35);
    sunLight.position.set(16, 19, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left = -24;
    sunLight.shadow.camera.right = 24;
    sunLight.shadow.camera.top = 28;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 70;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.025;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(theme === "dark" ? "#8196a0" : "#dfe8e1", theme === "dark" ? 0.45 : 0.6);
    fillLight.position.set(-18, 9, -14);
    scene.add(fillLight);

    // a gentle rim light separates the facade from the backdrop
    const rimLight = new THREE.DirectionalLight(theme === "dark" ? "#fff1d6" : "#ffffff", theme === "dark" ? 0.55 : 0.4);
    rimLight.position.set(-8, 12, 22);
    scene.add(rimLight);

    const engine: Engine = {
      renderer,
      scene,
      camera,
      controls,
      sunLight,
      fillLight,
      hemi,
      house: null,
      frame: 0,
      observer: null,
    };
    engineRef.current = engine;

    const resize = () => {
      if (!hostRef.current) return;
      const width = Math.max(1, hostRef.current.clientWidth);
      const height = Math.max(1, hostRef.current.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    engine.observer = observer;

    const animate = () => {
      if (!engineRef.current) return;
      engine.controls.update();
      engine.renderer.render(engine.scene, engine.camera);
      engine.frame = requestAnimationFrame(animate);
    };
    engine.frame = requestAnimationFrame(animate);
    setReady(true);

    return () => {
      cancelAnimationFrame(engine.frame);
      observer.disconnect();
      engine.controls.dispose();
      if (engine.house) {
        engine.scene.remove(engine.house.group);
        engine.house.dispose();
        engine.house = null;
      }
      renderer.dispose();
      renderer.domElement.remove();
      engineRef.current = null;
      setReady(false);
    };
    // Scene scaffolding is created once; build and lighting updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* build / rebuild the house when the design changes */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.house) {
      engine.scene.remove(engine.house.group);
      engine.house.dispose();
      engine.house = null;
    }
    const house = buildHouse(project);
    engine.scene.add(house.group);
    engine.house = house;
    setVersion((value) => value + 1);
    return () => {
      // The next build or the scene cleanup removes this house.
    };
  }, [project]);

  /* theme-aware atmosphere */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const dark = theme === "dark";
    const bg = dark ? "#1b1a18" : "#eee7db";
    engine.scene.background = new THREE.Color(bg);
    engine.scene.fog = new THREE.Fog(bg, 34, 76);
    engine.hemi.color = new THREE.Color(dark ? "#819188" : "#ffffff");
    engine.hemi.groundColor = new THREE.Color(dark ? "#2b2521" : "#c9bda9");
    engine.hemi.intensity = dark ? 0.74 : 1.02;
    engine.sunLight.color = new THREE.Color(dark ? "#ffe3bd" : "#fff4e1");
    engine.sunLight.intensity = dark ? 2.7 : 2.35;
    engine.fillLight.color = new THREE.Color(dark ? "#8196a0" : "#dfe8e1");
    engine.fillLight.intensity = dark ? 0.45 : 0.6;
  }, [theme]);

  /* floor stacking: each level sits on top of the one below, plus any explode gap.
     A small lift keeps stacked stories readable as a dollhouse, while a
     fully assembled view is still available through explode at 0. */
  useEffect(() => {
    const house = engineRef.current?.house;
    if (!house) return;
    const baseLift = 0.3;
    house.levels.forEach((level: Level) => {
      level.group.visible = focus === "all" || focus === level.index;
      level.group.position.y = level.baseY + level.index * (baseLift + explode * 1.1);
    });
  }, [focus, explode, version]);

  /* sun path */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const angle = (sun / 100) * Math.PI - Math.PI * 0.42;
    const reach = 21;
    engine.sunLight.position.set(Math.cos(angle) * reach, 15 + Math.sin(angle) * 4, Math.sin(angle) * reach);
    engine.fillLight.position.set(-Math.cos(angle) * 17, 8, -Math.sin(angle) * 16);
  }, [sun]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.controls.autoRotate = autoRotate;
    engine.controls.autoRotateSpeed = 0.62;
  }, [autoRotate]);

  const resetView = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.camera.position.set(Math.max(10, project.plot.width * 1.5), 8.4, Math.max(15, project.plot.depth * 1.1));
    engine.controls.target.set(0, Math.min(3.5, project.settings.floors * 1.7), 0.2);
    engine.controls.update();
    setFocus("all");
    setExplode(0);
    setAutoRotate(false);
  };

  const snapshot = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.renderer.render(engine.scene, engine.camera);
    const url = engine.renderer.domElement.toDataURL("image/png");
    downloadDataUrl(`${safeFileStem(project.name)}-3d.png`, url);
    toast("3D snapshot downloaded", "success");
  };

  const toggleFocus = (value: number | "all") => {
    setFocus(value);
    if (value !== "all") setExplode(0);
  };

  const floorOptions: { value: number | "all"; label: string }[] = [
    { value: "all", label: "All" },
    ...Array.from({ length: project.settings.floors }, (_, index) => ({
      value: index as number | "all",
      label: index === 0 ? "G" : index === 1 ? "F" : index === 2 ? "S" : String(index + 1),
    })),
    { value: project.settings.floors, label: "R" },
  ];

  return (
    <div className="model-stage">
      <div ref={hostRef} className="model-canvas" />
      {!ready && (
        <div className="model-loading">
          <span className="pulse-dot" />
          Building the model…
        </div>
      )}

      <div className="model-live">
        <span className="pulse-dot" />
        Live model · drag to orbit
      </div>

      <div className="model-actions">
        <button type="button" className={`model-action ${autoRotate ? "is-active" : ""}`} onClick={() => setAutoRotate((value) => !value)} title="Toggle auto-rotate" aria-label="Toggle auto-rotate">
          {autoRotate ? <Pause /> : <Play />}
        </button>
        <button type="button" className="model-action" onClick={resetView} title="Reset view" aria-label="Reset view">
          <RotateCcw />
        </button>
        <button type="button" className="model-action" onClick={snapshot} title="Download snapshot" aria-label="Download 3D snapshot">
          <Camera />
        </button>
      </div>

      <div className="model-floors" role="group" aria-label="Isolate a floor">
        <span className="model-control-label"><Layers3 /> Floor</span>
        <div className="model-floor-row">
          {floorOptions.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              className={`model-floor ${focus === option.value ? "is-active" : ""}`}
              onClick={() => toggleFocus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="model-sliders">
        <span className="model-control-label"><SlidersHorizontal /> Scene</span>
        <label>
          <span>Explode <em>{Math.round(explode * 100)}%</em></span>
          <input
            type="range"
            className="range"
            min={0}
            max={1}
            step={0.01}
            value={explode}
            onChange={(event) => setExplode(Number(event.target.value))}
            disabled={focus !== "all"}
            style={{ "--fill": `${explode * 100}%` } as React.CSSProperties}
          />
        </label>
        <label>
          <span><Sun /> Sun <em>{sun}°</em></span>
          <input type="range" className="range" min={0} max={100} value={sun} onChange={(event) => setSun(Number(event.target.value))} style={{ "--fill": `${sun}%` } as React.CSSProperties} />
        </label>
      </div>

      <div className="model-hint"><Sparkles /> Scroll to zoom · right-drag to pan</div>
    </div>
  );
}
