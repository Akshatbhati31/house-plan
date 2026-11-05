import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Home,
  ImagePlus,
  Layers3,
  MapPin,
  Ruler,
  ScanLine,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SiteSketch } from "../components/SiteSketch";
import { fileToOptimizedDataUrl } from "../lib/files";
import { createProject } from "../lib/seed";
import { useStore } from "../lib/store";
import {
  BUDGET_STEPS,
  FINISH_TIERS,
  inr,
  num,
  sqft,
  type FinishTier,
  type Project,
  type ReferenceImage,
} from "../types";

type Orientation = Project["orientation"];
type StyleId = Project["style"];
type Step = 1 | 2 | 3;
type ScanState = "idle" | "scanning" | "complete";

const styles: { id: StyleId; note: string }[] = [
  { id: "Warm contemporary", note: "Earth, timber, soft light" },
  { id: "Quiet minimal", note: "Pale surfaces, precise edges" },
  { id: "Modern Indian", note: "Stone, jaali, deep shade" },
  { id: "Soft brutalist", note: "Board concrete, warm wood" },
];

const generatingSteps = [
  { label: "Reading the site record", icon: <MapPin /> },
  { label: "Testing setbacks & levels", icon: <Layers3 /> },
  { label: "Placing rooms & openings", icon: <Home /> },
  { label: "Pricing the Meerut build", icon: <Sparkles /> },
];

export function NewProjectPage() {
  const { projects, addProject, toast } = useStore();
  const [step, setStep] = useState<Step>(1);
  const [source, setSource] = useState<"sample" | "upload">("sample");
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("Site sketch · hand-drawn");
  const [mapBusy, setMapBusy] = useState(false);
  const [scan, setScan] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [name, setName] = useState(`Project ${String(projects.length + 1).padStart(2, "0")}`);
  const [location, setLocation] = useState("Meerut, Uttar Pradesh");
  const [width, setWidth] = useState(7.5);
  const [depth, setDepth] = useState(15);
  const [orientation, setOrientation] = useState<Orientation>("East");
  const [style, setStyle] = useState<StyleId>("Warm contemporary");
  const [floors, setFloors] = useState<1 | 2 | 3>(2);
  const [finish, setFinish] = useState<FinishTier>("signature");
  const [budget, setBudget] = useState(6000000);
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [refBusy, setRefBusy] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [generatingIndex, setGeneratingIndex] = useState(0);
  const mapInput = useRef<HTMLInputElement | null>(null);
  const refInput = useRef<HTMLInputElement | null>(null);
  const making = useRef(false);

  const budgetIndex = Math.max(0, BUDGET_STEPS.indexOf(budget));
  const area = width * depth;
  const plotLabel = `${num(width, 2)} × ${num(depth, 2)} m`;

  const detectedNotes = useMemo(
    () => [
      `Closed boundary · ${num(width * 2 + depth * 2, 1)} m perimeter`,
      `Frontage ${num(width, 2)} m · depth ${num(depth, 2)} m`,
      `Total area ${num(area, 1)} m² (≈ ${sqft(area)})`,
      `${orientation}-facing frontage · 9 m approach road inferred`,
      "Clear setbacks · single-ownership plot · studio verified",
    ],
    [width, depth, orientation, area],
  );

  useEffect(() => {
    if (scan !== "scanning") return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const next = Math.min(100, ((Date.now() - started) / 1700) * 100);
      setProgress(next);
      if (next >= 100) {
        window.clearInterval(timer);
        setScan("complete");
      }
    }, 60);
    return () => window.clearInterval(timer);
  }, [scan]);

  useEffect(() => {
    if (step !== 3 || !generatedId) return;
    const timer = window.setTimeout(() => {
      toast("Your home concept is ready to explore", "success");
      window.location.hash = `#/p/${generatedId}/overview`;
    }, 3100);
    return () => window.clearTimeout(timer);
  }, [step, generatedId, toast]);

  useEffect(() => {
    if (step !== 3) return;
    const timer = window.setInterval(() => setGeneratingIndex((index) => Math.min(generatingSteps.length - 1, index + 1)), 660);
    return () => window.clearInterval(timer);
  }, [step]);

  const startScan = () => {
    setProgress(0);
    setGeneratingIndex(0);
    setScan("scanning");
  };

  const chooseSource = (next: "sample" | "upload") => {
    setSource(next);
    setScan("idle");
    setProgress(0);
    if (next === "sample") {
      setMapImage(null);
      setFileName("Site sketch · hand-drawn");
      if (mapInput.current) mapInput.current.value = "";
    }
  };

  const handleMap = async (file: File) => {
    setMapBusy(true);
    try {
      const dataUrl = await fileToOptimizedDataUrl(file, 1800, 0.86);
      setMapImage(dataUrl);
      setFileName(file.name);
      setScan("idle");
      setProgress(0);
      toast("Map received — scan it when you are ready", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not read that map.", "warning");
    } finally {
      setMapBusy(false);
    }
  };

  const handleReferences = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, 8 - references.length);
    if (list.length === 0) return;
    setRefBusy(true);
    try {
      const next: ReferenceImage[] = [];
      for (const file of list) {
        const dataUrl = await fileToOptimizedDataUrl(file, 1400, 0.8);
        next.push({
          id: `ref-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " "),
          dataUrl,
          note: "",
        });
      }
      setReferences((list) => [...list, ...next].slice(0, 8));
      toast(`${next.length} reference${next.length === 1 ? "" : "s"} added`, "success");
    } catch {
      toast("Some images could not be added.", "warning");
    } finally {
      setRefBusy(false);
    }
  };

  const generate = () => {
    if (making.current) return;
    if (!name.trim() || width < 4 || depth < 6) {
      toast("Add a project name and confirm the plot size.", "warning");
      return;
    }
    making.current = true;
    const project = createProject({
      name: name.trim(),
      location: location.trim() || "Meerut, Uttar Pradesh",
      plot: { width, depth },
      orientation,
      style,
      budget,
      mapSource: source === "upload" && mapImage ? "upload" : "sketch",
      mapImage: mapImage ?? undefined,
      detectedNotes: scan === "complete" ? detectedNotes : [`Plot confirmed manually · ${plotLabel}`],
      references,
      settings: {
        floors,
        finish,
        roofRoom: true,
        garage: true,
        balcony: true,
        vastu: true,
        terraceGarden: true,
      },
    });
    addProject(project);
    setGeneratedId(project.id);
    setGeneratingIndex(0);
    setStep(3);
  };

  const canContinue = scan === "complete";
  const scanStage =
    progress < 24 ? "Finding the plot boundary" : progress < 52 ? "Reading measurements" : progress < 80 ? "Checking road, compass & setbacks" : "Preparing the site record";

  return (
    <div className="page new-page">
      <PageHeader
        eyebrow="New site scan"
        title={<>Start with the <em>land</em></>}
        lead="Bring a phone photo, a builder's drawing or the studio sketch. We will read the boundary, confirm the numbers with you, then draft the home."
        actions={<span className="chip"><ScanLine /> {projects.length} project{projects.length === 1 ? "" : "s"} on the shelf</span>}
      />

      <div className="wizard-shell">
        <aside className="wizard-rail">
          <div className="wizard-rail-head">
            <span className="eyebrow no-rule">Site to home</span>
            <strong className="display">Three quiet steps</strong>
          </div>
          <ol className="wizard-steps">
            <WizardStep index={1} active={step === 1} done={step > 1} label="Read the land" note="Upload & scan" />
            <WizardStep index={2} active={step === 2} done={step > 2} label="Shape the brief" note="Size, style, budget" />
            <WizardStep index={3} active={step === 3} label="Draft the home" note="Plan, model, costs" />
          </ol>
          <div className="wizard-rail-note">
            <span className="wizard-rail-icon"><Sparkles /></span>
            <p><strong>No account, no upload.</strong> Images are compressed and kept in this browser only. Your plot never leaves this device.</p>
          </div>
          <div className="wizard-rail-summary">
            <span className="eyebrow no-rule">Your site</span>
            <strong className="mono">{plotLabel}</strong>
            <span>{num(area, 1)} m² · {orientation}-facing</span>
            <span>{floors === 1 ? "Ground floor" : `G+${floors - 1}`} · {FINISH_TIERS.find((tier) => tier.id === finish)?.name}</span>
          </div>
        </aside>

        <section className="wizard-panel">
          {step === 1 && (
            <div className="wizard-section">
              <div className="wizard-section-head">
                <span className="eyebrow no-rule">Step 01 · land</span>
                <h2 className="display">What does the plot look like?</h2>
                <p>Pick the hand-drawn sketch to try the flow, or upload your own site drawing. You can correct every dimension in the next step.</p>
              </div>

              <div className="source-switch">
                <button type="button" className={`source-tile ${source === "sample" ? "is-active" : ""}`} onClick={() => chooseSource("sample")}>
                  <span className="source-icon"><Ruler /></span>
                  <span><strong>Use the studio sketch</strong><em>7.5 × 15 m · Meerut sample</em></span>
                  {source === "sample" && <Check className="source-check" />}
                </button>
                <button type="button" className={`source-tile ${source === "upload" ? "is-active" : ""}`} onClick={() => chooseSource("upload")}>
                  <span className="source-icon"><Upload /></span>
                  <span><strong>Upload your land map</strong><em>Photo, scan or builder drawing</em></span>
                  {source === "upload" && <Check className="source-check" />}
                </button>
              </div>

              <input
                ref={mapInput}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleMap(file);
                  event.target.value = "";
                }}
              />

              <div className="scan-layout">
                <div className="scan-preview-card">
                  <div className="scan-preview-head">
                    <div>
                      <span className="eyebrow no-rule">Source image</span>
                      <strong>{source === "upload" ? fileName : "Site sketch · hand-drawn"}</strong>
                    </div>
                    {source === "upload" && <button className="icon-btn" type="button" onClick={() => mapInput.current?.click()} title="Replace map" aria-label="Replace map"><Upload /></button>}
                  </div>

                  {source === "upload" && !mapImage ? (
                    <button
                      type="button"
                      className="map-dropzone"
                      onClick={() => mapInput.current?.click()}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const file = event.dataTransfer.files?.[0];
                        if (file) void handleMap(file);
                      }}
                    >
                      <span className="upload-zone-icon"><ImagePlus /></span>
                      <strong className="display">{mapBusy ? "Reading the drawing…" : "Drop your land map here"}</strong>
                      <p>A clear photo works. Crooked is fine — we only need the boundary and the numbers.</p>
                      <span className="btn btn-secondary btn-sm"><Upload /> Choose a file</span>
                    </button>
                  ) : (
                    <div className={`scan-map ${scan === "scanning" ? "is-scanning" : ""} ${scan === "complete" ? "is-complete" : ""}`}>
                      {mapImage ? <img src={mapImage} alt="Uploaded land map preview" /> : <SiteSketch />}
                      {scan === "scanning" && (
                        <>
                          <span className="scan-line" />
                          <div className="scan-progress">
                            <span>{scanStage}</span>
                            <div className="scan-progress-bar"><span style={{ width: `${progress}%` }} /></div>
                            <span className="mono">{Math.round(progress)}%</span>
                          </div>
                        </>
                      )}
                      {scan === "complete" && (
                        <div className="scan-complete">
                          <span><Check /> Boundary found</span>
                          <strong className="mono">{plotLabel}</strong>
                        </div>
                      )}
                      <span className="scan-corner top-left" />
                      <span className="scan-corner top-right" />
                      <span className="scan-corner bottom-left" />
                      <span className="scan-corner bottom-right" />
                    </div>
                  )}

                  <div className="scan-preview-foot">
                    <span className="tiny">{scan === "complete" ? "Scan complete · confirm the brief next" : scan === "scanning" ? "Hold still — reading the drawing" : "One image is enough to begin"}</span>
                    <button className="btn btn-primary btn-sm" type="button" onClick={startScan} disabled={scan === "scanning" || (source === "upload" && !mapImage) || mapBusy}>
                      <ScanLine /> {scan === "complete" ? "Scan again" : "Scan this map"}
                    </button>
                  </div>
                </div>

                <aside className="scan-results">
                  <div className="scan-results-head">
                    <span className="eyebrow no-rule">Studio reading</span>
                    <span className={`badge ${scan === "complete" ? "" : "neutral"}`}>{scan === "complete" ? "Read" : scan === "scanning" ? "Scanning" : "Waiting"}</span>
                  </div>
                  {scan === "complete" ? (
                    <>
                      <ul className="detected-list">
                        {detectedNotes.map((note) => <li key={note}><Check /> {note}</li>)}
                      </ul>
                      <div className="scan-dims">
                        <div><span>Width</span><strong className="mono">{num(width, 2)} m</strong></div>
                        <span>×</span>
                        <div><span>Depth</span><strong className="mono">{num(depth, 2)} m</strong></div>
                      </div>
                      <p className="scan-disclaimer">Dimensions are an initial studio reading. Confirm them in the brief — everything downstream follows that number.</p>
                      <button className="btn btn-primary" type="button" onClick={() => setStep(2)} disabled={!canContinue}>
                        Shape the brief <ArrowRight />
                      </button>
                    </>
                  ) : (
                    <div className="scan-waiting">
                      <span className="scan-waiting-icon"><ScanLine /></span>
                      <strong className="display">{scan === "scanning" ? scanStage : "The studio will read"}</strong>
                      <ul>
                        <li>Closed boundary & perimeter</li>
                        <li>Frontage, depth and total area</li>
                        <li>Road side and compass direction</li>
                        <li>Setback lines and buildable envelope</li>
                      </ul>
                      <p>Nothing is saved until you generate the home. You can correct every number.</p>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-section">
              <div className="wizard-section-head">
                <span className="eyebrow no-rule">Step 02 · brief</span>
                <h2 className="display">Confirm the plot. Set the tone.</h2>
                <p>The plan, model and cost sheet all follow these values. Your budget can move later — the design should still make sense without it.</p>
              </div>

              <div className="brief-grid">
                <div className="brief-main">
                  <div className="brief-block">
                    <div className="brief-block-head"><span className="brief-number mono">01</span><div><strong>The record</strong><span>Name it, place it, measure it.</span></div></div>
                    <div className="inline-fields">
                      <label className="field"><span className="field-label">Project name</span><input className="input" value={name} onChange={(event) => setName(event.target.value)} /></label>
                      <label className="field"><span className="field-label">Location</span><input className="input" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
                    </div>
                    <div className="inline-fields" style={{ marginTop: 10 }}>
                      <NumericField label="Frontage" value={width} min={4} max={30} step={0.1} suffix="m" onChange={setWidth} />
                      <NumericField label="Depth" value={depth} min={6} max={45} step={0.1} suffix="m" onChange={setDepth} />
                    </div>
                    <div className="plot-readout"><span>{num(area, 2)} m² plot</span><span>{sqft(area)}</span><span>{((width * depth) > 0 ? `${orientation} road` : "")}</span></div>
                  </div>

                  <div className="brief-block">
                    <div className="brief-block-head"><span className="brief-number mono">02</span><div><strong>How it meets the street</strong><span>Orientation and the studio look.</span></div></div>
                    <div className="inline-fields">
                      <label className="field">
                        <span className="field-label">Frontage faces</span>
                        <select className="input select" value={orientation} onChange={(event) => setOrientation(event.target.value as Orientation)}>
                          {(["East", "West", "North", "South"] as Orientation[]).map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </label>
                      <label className="field">
                        <span className="field-label">Design language</span>
                        <select className="input select" value={style} onChange={(event) => setStyle(event.target.value as StyleId)}>
                          {styles.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="style-notes">
                      {styles.map((item) => (
                        <button type="button" key={item.id} className={`style-note ${style === item.id ? "is-active" : ""}`} onClick={() => setStyle(item.id)}>
                          <strong>{item.id}</strong><span>{item.note}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="brief-block">
                    <div className="brief-block-head"><span className="brief-number mono">03</span><div><strong>The home</strong><span>Levels and finish, before the budget.</span></div></div>
                    <div className="option-row three">
                      {[1, 2, 3].map((count) => (
                        <button type="button" key={count} className={`option-tile ${floors === count ? "is-active" : ""}`} onClick={() => setFloors(count as 1 | 2 | 3)}>
                          <span className="tile-icon"><Layers3 /></span>
                          <strong>{count === 1 ? "Ground" : `G + ${count - 1}`}</strong>
                          <span>{count === 1 ? "Single level" : `${count} live levels + roof`}</span>
                        </button>
                      ))}
                    </div>
                    <div className="finish-list" style={{ marginTop: 12 }}>
                      {FINISH_TIERS.map((tier) => (
                        <button type="button" key={tier.id} className={`finish-row ${finish === tier.id ? "is-active" : ""}`} onClick={() => setFinish(tier.id)}>
                          <span className="finish-radio" />
                          <span className="finish-row-copy"><strong>{tier.name}</strong><span>{tier.summary}</span></span>
                          <span className="finish-rate mono">₹{tier.rate.toLocaleString("en-IN")}<small>/ft²</small></span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="brief-block">
                    <div className="brief-block-head"><span className="brief-number mono">04</span><div><strong>A budget to test</strong><span>Indicative. You can move it anytime.</span></div></div>
                    <div className="wizard-budget-head">
                      <strong className="display">{inr(budget, true)}</strong>
                      <span className="chip">Meerut turnkey</span>
                    </div>
                    <input
                      className="range"
                      type="range"
                      min={0}
                      max={BUDGET_STEPS.length - 1}
                      step={1}
                      value={budgetIndex}
                      onChange={(event) => setBudget(BUDGET_STEPS[Number(event.target.value)])}
                      style={{ "--fill": `${(budgetIndex / (BUDGET_STEPS.length - 1)) * 100}%` } as React.CSSProperties}
                      aria-label="Starting budget in lakhs"
                    />
                    <div className="budget-steps">
                      {BUDGET_STEPS.map((value, index) => (
                        <button key={value} type="button" className={`budget-step ${index === budgetIndex ? "is-active" : ""}`} onClick={() => setBudget(value)}><span>₹{value / 100000} L</span></button>
                      ))}
                    </div>
                    <p className="plot-readout" style={{ marginTop: 8 }}><span>Indicative estimate follows at ₹{FINISH_TIERS.find((tier) => tier.id === finish)?.rate.toLocaleString("en-IN")}/ft²</span><span>Excludes land & taxes</span></p>
                  </div>

                  <div className="brief-block">
                    <div className="brief-block-head"><span className="brief-number mono">05</span><div><strong>Reference images</strong><span>Optional — up to eight.</span></div></div>
                    <input
                      ref={refInput}
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        if (event.target.files) void handleReferences(event.target.files);
                        event.target.value = "";
                      }}
                    />
                    <div className="wizard-refs">
                      {references.map((reference) => (
                        <div className="wizard-ref" key={reference.id}>
                          <img src={reference.dataUrl} alt={reference.name} />
                          <button type="button" onClick={() => setReferences((list) => list.filter((item) => item.id !== reference.id))} aria-label={`Remove ${reference.name}`}><X /></button>
                        </div>
                      ))}
                      {references.length < 8 && (
                        <button type="button" className="wizard-ref-add" onClick={() => refInput.current?.click()} disabled={refBusy}>
                          <ImagePlus /><span>{refBusy ? "Adding…" : "Add image"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="brief-summary">
                  <span className="eyebrow no-rule">Brief summary</span>
                  <h3 className="display">{name || "Untitled home"}</h3>
                  <p className="brief-summary-location"><MapPin /> {location || "Meerut, Uttar Pradesh"}</p>
                  <div className="brief-summary-rows">
                    <div><span>Plot</span><strong className="mono">{plotLabel}</strong></div>
                    <div><span>Area</span><strong className="mono">{num(area, 1)} m²</strong></div>
                    <div><span>Orientation</span><strong>{orientation} frontage</strong></div>
                    <div><span>Levels</span><strong>{floors === 1 ? "Ground" : `G + ${floors - 1}`} + roof</strong></div>
                    <div><span>Finish</span><strong>{FINISH_TIERS.find((tier) => tier.id === finish)?.name}</strong></div>
                    <div><span>Budget</span><strong className="mono">{inr(budget, true)}</strong></div>
                    <div><span>References</span><strong>{references.length} image{references.length === 1 ? "" : "s"}</strong></div>
                  </div>
                  <div className="brief-summary-map">
                    {mapImage ? <img src={mapImage} alt="Land map" /> : <SiteSketch compact />}
                  </div>
                  <button className="btn btn-primary btn-lg" type="button" onClick={generate}>
                    <Sparkles /> Generate my home
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setStep(1)}><ArrowLeft /> Back to the map</button>
                  <p className="scan-disclaimer">Generates a 2D plan, live 3D dollhouse and a Meerut cost sheet. Everything stays editable.</p>
                </aside>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="generating-screen">
              <div className="generating-art" aria-hidden="true">
                <span className="generating-ring ring-one" />
                <span className="generating-ring ring-two" />
                <span className="generating-core"><Compass /></span>
              </div>
              <span className="eyebrow">Drafting · {name}</span>
              <h2 className="display">A home, taking <em>shape</em>.</h2>
              <p className="generating-lead">Reading the {plotLabel} plot in {location}. Placing rooms, checking light, adding the Meerut rates.</p>
              <div className="generating-steps">
                {generatingSteps.map((item, index) => (
                  <div key={item.label} className={`generating-step ${index < generatingIndex ? "is-done" : index === generatingIndex ? "is-active" : ""}`}>
                    <span className="generating-step-icon">{index < generatingIndex ? <Check /> : item.icon}</span>
                    <span>{item.label}</span>
                    {index === generatingIndex && <span className="generating-dots"><i /><i /><i /></span>}
                  </div>
                ))}
              </div>
              <div className="generating-bar"><span /></div>
              <p className="scan-disclaimer">Your browser is saving this project locally. If you leave now, it will still be on the shelf.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function WizardStep({ index, label, note, active, done }: { index: number; label: string; note: string; active?: boolean; done?: boolean }) {
  return (
    <li className={`wizard-step ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}>
      <span className="wizard-step-index mono">{done ? <Check /> : String(index).padStart(2, "0")}</span>
      <span className="wizard-step-copy"><strong>{label}</strong><span>{note}</span></span>
    </li>
  );
}

function NumericField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const parsed = Number.parseFloat(draft.replace(",", "."));
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.round(Math.min(max, Math.max(min, parsed)) * 100) / 100;
    onChange(clamped);
    setDraft(String(clamped));
  };
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="input-suffix">
        <input
          className="input mono"
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit();
              (event.target as HTMLInputElement).blur();
            }
          }}
        />
        <span>{suffix}</span>
      </span>
      <span className="field-label" style={{ justifyContent: "flex-start", fontSize: 9.5, color: "var(--faint)" }}>{step === 0.1 ? "One decimal place" : ""}</span>
    </label>
  );
}

function WizardMini({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="wizard-mini">
      <span>{icon}</span>
      <div><span>{label}</span><strong className="mono">{value}</strong></div>
    </div>
  );
}

// Keep the compact icon tile exported for future wizard steps without adding another file.
export const NewWizardMini = WizardMini;
