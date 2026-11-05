import { useEffect, useState } from "react";
import {
  BedDouble,
  Box,
  ChevronRight,
  CircleDollarSign,
  Columns3,
  DoorOpen,
  Layers2,
  Lamp,
  Minus,
  Palette,
  Plus,
  RotateCcw,
  Ruler,
  Sofa,
  Sparkles,
  Sun,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import {
  APPLIANCE_CATALOG,
  FACADES,
  FINISH_TIERS,
  FLOORING,
  FURNITURE_CATALOG,
  FURNITURE_PACKS,
  inr,
  type CustomFurnitureItem,
  type Project,
  type ProjectSettings,
} from "../types";
import { getCosts } from "../lib/plan";
import { defaultSettings } from "../lib/seed";
import { useStore } from "../lib/store";
import { SettingRow, Switch } from "./UI";

type PanelTab = "layout" | "finish" | "extras";

export function Customizer({
  project,
  open = true,
  onClose,
  compact = false,
  onStoreySelect,
}: {
  project: Project;
  open?: boolean;
  onClose?: () => void;
  compact?: boolean;
  onStoreySelect?: (floors: 1 | 2 | 3) => void;
}) {
  const { updateProject, toast } = useStore();
  const [tab, setTab] = useState<PanelTab>("layout");
  const [pickOpen, setPickOpen] = useState(false);
  const [pickQuery, setPickQuery] = useState("");
  const [applianceOpen, setApplianceOpen] = useState(false);
  const [applianceQuery, setApplianceQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [applianceName, setApplianceName] = useState("");
  const [appliancePrice, setAppliancePrice] = useState("");

  const set = (patch: Partial<ProjectSettings>) => updateProject(project.id, { settings: patch });
  const costs = getCosts(project);
  const gap = project.budget - costs.total;

  // legacy saved projects predate the spend layer
  const furnitureBudget = project.settings.furnitureBudget ?? 600000;
  const furniturePack = project.settings.furniturePack ?? "comfort";
  const customFurniture = project.settings.customFurniture ?? [];
  const customAppliances = project.settings.customAppliances ?? [];
  const addAppliance = (catalogId: string) => {
    const entry = APPLIANCE_CATALOG.find((item) => item.id === catalogId);
    if (!entry) return;
    const existing = customAppliances.find((item) => item.id === catalogId);
    if (existing) set({ customAppliances: customAppliances.map((item) => (item.id === catalogId ? { ...item, qty: item.qty + 1 } : item)) });
    else set({ customAppliances: [...customAppliances, { id: entry.id, name: entry.name, qty: 1, cost: entry.cost, note: entry.category }] });
  };
  const changeApplianceQty = (id: string, delta: number) => {
    set({ customAppliances: customAppliances.map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item)) });
  };
  const removeAppliance = (id: string) => set({ customAppliances: customAppliances.filter((item) => item.id !== id) });
  const addCustomAppliance = () => {
    const name = applianceName.trim();
    const price = Number(appliancePrice.replace(/[^0-9]/g, ""));
    if (!name || !Number.isFinite(price) || price <= 0) return;
    const id = `appliance-${Math.random().toString(36).slice(2, 8)}`;
    set({ customAppliances: [...customAppliances, { id, name, qty: 1, cost: price, note: "Your appliance" }] });
    setApplianceName("");
    setAppliancePrice("");
  };
  const appliancesTotal = customAppliances.reduce((sum, item) => sum + item.cost * item.qty, 0);
  const addPicked = (catalogId: string) => {
    const entry = FURNITURE_CATALOG.find((item) => item.id === catalogId);
    if (!entry) return;
    const existing = customFurniture.find((item) => item.id === catalogId);
    if (existing) set({ customFurniture: customFurniture.map((item) => (item.id === catalogId ? { ...item, qty: item.qty + 1 } : item)) });
    else set({ customFurniture: [...customFurniture, { id: entry.id, name: entry.name, qty: 1, cost: entry.cost, note: entry.category }] });
  };
  const changeQty = (id: string, delta: number) => {
    set({ customFurniture: customFurniture.map((item: CustomFurnitureItem) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item)) });
  };
  const removeItem = (id: string) => set({ customFurniture: customFurniture.filter((item) => item.id !== id) });
  const addCustom = () => {
    const name = customName.trim();
    const price = Number(customPrice.replace(/[^0-9]/g, ""));
    if (!name || !Number.isFinite(price) || price <= 0) return;
    const id = `custom-${Math.random().toString(36).slice(2, 8)}`;
    set({ customFurniture: [...customFurniture, { id, name, qty: 1, cost: price, note: "Your piece" }] });
    setCustomName("");
    setCustomPrice("");
  };
  const pickedTotal = customFurniture.reduce((sum, item) => sum + item.cost * item.qty, 0);

  return (
    <aside className={`customizer ${open ? "is-open" : ""} ${compact ? "is-compact" : ""}`} aria-label="Home customizer">
      <div className="customizer-head">
        <div>
          <span className="eyebrow">Design studio</span>
          <h3 className="customizer-title">Make it yours</h3>
        </div>
        <div className="row gap-4">
          <button
            type="button"
            className="icon-btn"
            title="Reset customizations"
            aria-label="Reset customizations"
            onClick={() => {
              updateProject(project.id, { settings: defaultSettings() });
              toast("Design reset to the studio starting point");
            }}
          >
            <RotateCcw />
          </button>
          {onClose && (
            <button type="button" className="icon-btn customizer-close" onClick={onClose} aria-label="Close customizer">
              <X />
            </button>
          )}
        </div>
      </div>

      <div className="customizer-tabs segmented" role="tablist">
        <button type="button" className={`seg ${tab === "layout" ? "is-active" : ""}`} onClick={() => setTab("layout")} role="tab" aria-selected={tab === "layout"}>
          <Ruler /> Layout
        </button>
        <button type="button" className={`seg ${tab === "finish" ? "is-active" : ""}`} onClick={() => setTab("finish")} role="tab" aria-selected={tab === "finish"}>
          <Palette /> Finish
        </button>
        <button type="button" className={`seg ${tab === "extras" ? "is-active" : ""}`} onClick={() => setTab("extras")} role="tab" aria-selected={tab === "extras"}>
          <Sparkles /> Extras
        </button>
      </div>

      <div className="customizer-body">
        {tab === "layout" && (
          <div className="customizer-section">
            <div className="control-group">
              <span className="control-label">Storeys <span className="label-note">build height</span></span>
              <div className="option-row three">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`option-tile ${project.settings.floors === n ? "is-active" : ""}`}
                    onClick={() => {
                      set({ floors: n as 1 | 2 | 3 });
                      onStoreySelect?.(n as 1 | 2 | 3);
                    }}
                  >
                    <span className="tile-icon"><Layers2 /></span>
                    <strong>{n === 1 ? "Ground" : `G + ${n - 1}`}</strong>
                    <span>{n === 1 ? "Ground only" : `${n} live levels`}</span>
                  </button>
                ))}
              </div>
              <p className="control-hint">
                {onStoreySelect
                  ? "Picking a storey turns the sheet to that level. Use G / F / S / R above the drawing to look again."
                  : "Sets how many live levels the home has. The plan, model and estimate follow."}
              </p>
            </div>

            <div className="control-group">
              <span className="control-label">Plot dimensions</span>
              <div className="inline-fields">
                <MeterInput
                  label="Width"
                  value={project.plot.width}
                  min={5}
                  max={18}
                  onChange={(value) => updateProject(project.id, { plot: { width: value } })}
                />
                <MeterInput
                  label="Depth"
                  value={project.plot.depth}
                  min={8}
                  max={35}
                  onChange={(value) => updateProject(project.id, { plot: { depth: value } })}
                />
              </div>
              <p className="control-hint">
                {(project.plot.width * project.plot.depth).toFixed(1)} m² plot · {Math.round(project.plot.width * project.plot.depth * 10.7639)} ft²
              </p>
            </div>

            <div className="control-group">
              <span className="control-label">Setbacks <span className="label-note">room for light & air</span></span>
              <div className="setback-controls">
                <SliderRow label="Front" value={project.settings.frontSetback} min={0} max={3} step={0.1} onChange={(v) => set({ frontSetback: v })} />
                <SliderRow label="Rear" value={project.settings.rearSetback} min={0} max={3} step={0.1} onChange={(v) => set({ rearSetback: v })} />
                <SliderRow label="Sides" value={project.settings.sideSetback} min={0} max={1.5} step={0.05} onChange={(v) => set({ sideSetback: v })} />
              </div>
            </div>

            <SettingRow
              title="Garage"
              description="Covered bay with shutter"
              control={<Switch checked={project.settings.garage} onChange={(v) => set({ garage: v })} label="Toggle garage" />}
            />
            {project.settings.garage && (
              <div className="sub-options">
                <div className="segmented">
                  <button type="button" className={`seg ${project.settings.garageType === "covered" ? "is-active" : ""}`} onClick={() => set({ garageType: "covered" })}>
                    <DoorOpen /> Covered
                  </button>
                  <button type="button" className={`seg ${project.settings.garageType === "carport" ? "is-active" : ""}`} onClick={() => set({ garageType: "carport" })}>
                    <Columns3 /> Carport
                  </button>
                </div>
                <div className="segmented">
                  <button type="button" className={`seg ${project.settings.garageDoor === "wood" ? "is-active" : ""}`} onClick={() => set({ garageDoor: "wood" })}>
                    Wood shutter
                  </button>
                  <button type="button" className={`seg ${project.settings.garageDoor === "metal" ? "is-active" : ""}`} onClick={() => set({ garageDoor: "metal" })}>
                    Metal shutter
                  </button>
                </div>
              </div>
            )}

            <SettingRow
              title="Roof room"
              description="Guest suite, studio or quiet retreat"
              control={<Switch checked={project.settings.roofRoom} onChange={(v) => set({ roofRoom: v })} label="Toggle roof room" />}
            />
            <SettingRow
              title="First-floor balcony"
              description="A shaded pocket over the entry"
              control={<Switch checked={project.settings.balcony} onChange={(v) => set({ balcony: v })} label="Toggle balcony" />}
            />
            <SettingRow
              title="Study nook"
              description="A desk and shelf wall off the lounge"
              control={<Switch checked={project.settings.studyNook} onChange={(v) => set({ studyNook: v })} label="Toggle study nook" />}
            />
            <SettingRow
              title="Pooja niche"
              description="Vastu-aligned, north-east corner"
              control={<Switch checked={project.settings.pooja} onChange={(v) => set({ pooja: v })} label="Toggle pooja niche" />}
            />
            <SettingRow
              title="Open kitchen"
              description="Island counter, shared with dining"
              control={<Switch checked={project.settings.openKitchen} onChange={(v) => set({ openKitchen: v })} label="Toggle open kitchen" />}
            />
            <SettingRow
              title="Terrace garden"
              description="Pergola, planters and sky deck"
              control={<Switch checked={project.settings.terraceGarden} onChange={(v) => set({ terraceGarden: v })} label="Toggle terrace garden" />}
            />
            <SettingRow
              title="Vastu guidance"
              description="East entry · north-east water · south-west master"
              control={<Switch checked={project.settings.vastu} onChange={(v) => set({ vastu: v })} label="Toggle vastu guidance" />}
            />

            <div className="control-group">
              <span className="control-label">Stair between floors <span className="label-note">connects the stack</span></span>
              <div className="option-row three">
                {(["straight", "l-shaped", "spiral"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`option-tile ${project.settings.stairType === type ? "is-active" : ""}`}
                    onClick={() => set({ stairType: type })}
                  >
                    <span className="tile-icon"><Layers2 /></span>
                    <strong>{type === "straight" ? "Straight" : type === "l-shaped" ? "L-shaped" : "Spiral"}</strong>
                    <span>{type === "straight" ? "Fast, compact" : type === "l-shaped" ? "Landing + turn" : "Space saver"}</span>
                  </button>
                ))}
              </div>
              <SliderRow label="Stair width" value={project.settings.stairWidth ?? 1.05} min={0.85} max={1.6} step={0.05} onChange={(v) => set({ stairWidth: v })} />
            </div>

            <div className="control-group">
              <span className="control-label">Openings <span className="label-note">windows & doors</span></span>
              <div className="option-row three">
                {(["standard", "arched", "full-height"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`option-tile ${project.settings.windowStyle === type ? "is-active" : ""}`}
                    onClick={() => set({ windowStyle: type })}
                  >
                    <span className="tile-icon"><Box /></span>
                    <strong>{type === "standard" ? "Standard" : type === "arched" ? "Arched" : "Full-height"}</strong>
                    <span>Windows</span>
                  </button>
                ))}
              </div>
              <div className="option-row three">
                {(["flush", "panelled", "glass"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`option-tile ${project.settings.doorStyle === type ? "is-active" : ""}`}
                    onClick={() => set({ doorStyle: type })}
                  >
                    <span className="tile-icon"><DoorOpen /></span>
                    <strong>{type === "flush" ? "Flush" : type === "panelled" ? "Panelled" : "Glass"}</strong>
                    <span>Doors</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "finish" && (
          <div className="customizer-section">
            <div className="control-group">
              <span className="control-label">Build package <span className="label-note">turnkey, Meerut</span></span>
              <div className="finish-list">
                {FINISH_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    className={`finish-row ${project.settings.finish === tier.id ? "is-active" : ""}`}
                    onClick={() => set({ finish: tier.id })}
                  >
                    <span className="finish-radio" />
                    <span className="finish-row-copy">
                      <strong>{tier.name}</strong>
                      <span>{tier.summary}</span>
                    </span>
                    <span className="finish-rate">₹{tier.rate.toLocaleString("en-IN")}<small>/ft²</small></span>
                  </button>
                ))}
              </div>
              <p className="control-hint">{FINISH_TIERS.find((t) => t.id === project.settings.finish)?.details}</p>
            </div>

            <div className="control-group">
              <span className="control-label">Flooring</span>
              <div className="swatch-grid">
                {(Object.keys(FLOORING) as (keyof typeof FLOORING)[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`swatch-option ${project.settings.flooring === key ? "is-active" : ""}`}
                    onClick={() => set({ flooring: key })}
                  >
                    <span className="floor-swatch" style={{ background: FLOORING[key].color }} />
                    <span>{FLOORING[key].name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <span className="control-label">Façade character</span>
              <div className="facade-grid">
                {(Object.keys(FACADES) as (keyof typeof FACADES)[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`facade-option ${project.settings.facade === key ? "is-active" : ""}`}
                    onClick={() => set({ facade: key })}
                  >
                    <span className="facade-swatch">
                      <span style={{ background: FACADES[key].wall }} />
                      <span style={{ background: FACADES[key].accent }} />
                      <span style={{ background: FACADES[key].trim }} />
                    </span>
                    <span>{FACADES[key].name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="callout-sage">
              <Sun size={15} />
              <p>
                <strong>Passive by design.</strong> Deep front porch, cross ventilation and a light well at the stair. East light in the morning, shaded terrace in the evening.
              </p>
            </div>
          </div>
        )}

        {tab === "extras" && (
          <div className="customizer-section">
            <div className="feature-head">
              <span className="eyebrow no-rule">Add-ons</span>
              <span className="tiny">Tap to add to estimate</span>
            </div>
            <FeatureRow icon={<Sun />} title="Rooftop solar" price="₹1.65 L" checked={project.settings.solar} onChange={(v) => set({ solar: v })} note="3 kW · cuts ~₹42k/yr" />
            <FeatureRow icon={<Sparkles />} title="Rainwater harvesting" price="₹42 k" checked={project.settings.rainwater} onChange={(v) => set({ rainwater: v })} note="Two recharge pits" />
            <FeatureRow icon={<Box />} title="EV charger point" price="₹48 k" checked={project.settings.evCharger} onChange={(v) => set({ evCharger: v })} note="7.4 kW wallbox provision" />
            <FeatureRow icon={<Columns3 />} title="Lift shaft provision" price="₹1.75 L" checked={project.settings.liftProvision} onChange={(v) => set({ liftProvision: v })} note="Future-ready · 4-person" />
            <FeatureRow icon={<Layers2 />} title="False ceiling & cove" price="₹38/ft²" checked={project.settings.falseCeiling} onChange={(v) => set({ falseCeiling: v })} note="Living, dining, bedrooms" />
            <FeatureRow icon={<CircleDollarSign />} title="AC provision" price="₹90 k" checked={project.settings.acProvision} onChange={(v) => set({ acProvision: v })} note="5 points + outdoor platforms" />
            <FeatureRow icon={<Sparkles />} title="Smart home" price="₹1.35 L" checked={project.settings.automation} onChange={(v) => set({ automation: v })} note="Lights, fans, locks" />
            <FeatureRow icon={<Sun />} title="Landscape & planting" price="₹85 k" checked={project.settings.landscaping} onChange={(v) => set({ landscaping: v })} note="Pots, drip lines, lighting" />

            {/* ---- Furniture: spend it your way ---- */}
            <div className="control-group furniture-stdio">
              <span className="control-label">Furniture & spend <span className="label-note">your budget, your pieces</span></span>
              <SettingRow
                title="Furnish the home"
                description="Turn on to see furniture in the model and plan"
                control={<Switch checked={project.settings.furnishing} onChange={(v) => set({ furnishing: v })} label="Toggle furnishing" />}
              />
              {project.settings.furnishing && (
                <>
                  <div className="option-row three">
                    {FURNITURE_PACKS.map((pack) => (
                      <button
                        key={pack.id}
                        type="button"
                        className={`option-tile ${furniturePack === pack.id ? "is-active" : ""}`}
                        onClick={() => set({ furniturePack: pack.id })}
                      >
                        <span className="tile-icon"><Sofa /></span>
                        <strong>{pack.name}</strong>
                        <span>₹{pack.rate}/ft²</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`option-tile ${furniturePack === "custom" ? "is-active" : ""}`}
                      onClick={() => set({ furniturePack: "custom" })}
                    >
                      <span className="tile-icon"><CircleDollarSign /></span>
                      <strong>Pick my own</strong>
                      <span>Set the ₹ total</span>
                    </button>
                  </div>

                  {furniturePack === "custom" ? (
                    <div className="money-box">
                      <label className="field">
                        <span className="field-label">Your furniture budget</span>
                        <span className="input-suffix">
                          <input
                            className="input mono"
                            inputMode="numeric"
                            value={furnitureBudget.toLocaleString("en-IN")}
                            onChange={(event) => {
                              const parsed = Number(event.target.value.replace(/[^0-9]/g, ""));
                              set({ furnitureBudget: Math.min(5000000, Math.max(0, parsed || 0)) });
                            }}
                            aria-label="Furniture budget in rupees"
                          />
                          <span>₹</span>
                        </span>
                      </label>
                      <input
                        type="range"
                        className="range"
                        min={0}
                        max={1500000}
                        step={15000}
                        value={furnitureBudget}
                        onChange={(event) => set({ furnitureBudget: Number(event.target.value) })}
                        style={{ "--fill": `${(furnitureBudget / 1500000) * 100}%` } as React.CSSProperties}
                        aria-label="Furniture budget slider"
                      />
                      <div className="money-scale"><span>₹0</span><span>₹15 L</span></div>
                    </div>
                  ) : (
                    <p className="control-hint">
                      {FURNITURE_PACKS.find((pack) => pack.id === furniturePack)?.includes.join(" · ")}
                    </p>
                  )}

                  <div className="furniture-list">
                    <div className="furniture-list-head">
                      <span>Your pieces</span>
                      <strong>{pickedTotal > 0 ? `+ ${inr(pickedTotal, true)}` : "none yet"}</strong>
                    </div>
                    {customFurniture.length === 0 && (
                      <p className="control-hint">Add pieces below — sofas, beds, dining, rugs — each one lands on the cost sheet.</p>
                    )}
                    {customFurniture.map((item: CustomFurnitureItem) => (
                      <div className="furniture-row" key={item.id}>
                        <span className="furniture-copy">
                          <strong>{item.name}</strong>
                          <span>{item.note ?? ""}</span>
                        </span>
                        <span className="furniture-cost mono">{inr(item.cost, true)}</span>
                        <span className="qty-stepper">
                          <button type="button" onClick={() => changeQty(item.id, -1)} aria-label={`Less ${item.name}`}><Minus /></button>
                          <span className="mono">{item.qty}</span>
                          <button type="button" onClick={() => changeQty(item.id, 1)} aria-label={`More ${item.name}`}><Plus /></button>
                        </span>
                        <button type="button" className="icon-btn furniture-remove" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 /></button>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="btn btn-secondary btn-sm pick-toggle" onClick={() => setPickOpen(!pickOpen)}>
                    <Plus /> {pickOpen ? "Close picker" : "Add furniture"}
                  </button>
                  {pickOpen && (
                    <div className="pick-panel">
                      <input
                        className="input pick-search"
                        placeholder="Search sofas, beds, dining…"
                        value={pickQuery}
                        onChange={(event) => setPickQuery(event.target.value)}
                        aria-label="Search furniture"
                      />
                      <div className="pick-grid">
                        {FURNITURE_CATALOG.filter((entry) => `${entry.name} ${entry.category}`.toLowerCase().includes(pickQuery.trim().toLowerCase())).map((entry) => (
                          <button key={entry.id} type="button" className="pick-tile" onClick={() => addPicked(entry.id)}>
                            <span className="pick-copy">
                              <strong>{entry.name}</strong>
                              <span>{entry.category} · {inr(entry.cost, true)}</span>
                            </span>
                            <Plus />
                          </button>
                        ))}
                      </div>
                      <div className="pick-custom">
                        <input className="input" placeholder="Name your own piece" value={customName} onChange={(event) => setCustomName(event.target.value)} aria-label="Custom furniture name" />
                        <span className="input-suffix">
                          <input className="input mono" inputMode="numeric" placeholder="₹" value={customPrice} onChange={(event) => setCustomPrice(event.target.value.replace(/[^0-9]/g, ""))} aria-label="Custom furniture price" />
                          <span>₹</span>
                        </span>
                        <button type="button" className="btn btn-primary btn-sm" onClick={addCustom} disabled={!customName.trim() || !customPrice}>Add</button>
                      </div>
                    </div>
                  )}

                  {/* ---- Appliances ---- */}
                  <div className="furniture-list">
                    <div className="furniture-list-head">
                      <span>Appliances</span>
                      <strong>{appliancesTotal > 0 ? `+ ${inr(appliancesTotal, true)}` : "none yet"}</strong>
                    </div>
                    {customAppliances.length === 0 && (
                      <p className="control-hint">Add appliances — fridge, AC, geyser, TV — each lands on the cost sheet as an enhancement.</p>
                    )}
                    {customAppliances.map((item: CustomFurnitureItem) => (
                      <div className="furniture-row" key={item.id}>
                        <span className="furniture-copy">
                          <strong>{item.name}</strong>
                          <span>{item.note ?? ""}</span>
                        </span>
                        <span className="furniture-cost mono">{inr(item.cost, true)}</span>
                        <span className="qty-stepper">
                          <button type="button" onClick={() => changeApplianceQty(item.id, -1)} aria-label={`Less ${item.name}`}><Minus /></button>
                          <span className="mono">{item.qty}</span>
                          <button type="button" onClick={() => changeApplianceQty(item.id, 1)} aria-label={`More ${item.name}`}><Plus /></button>
                        </span>
                        <button type="button" className="icon-btn furniture-remove" onClick={() => removeAppliance(item.id)} aria-label={`Remove ${item.name}`}><Trash2 /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm pick-toggle" onClick={() => setApplianceOpen(!applianceOpen)}>
                    <Plus /> {applianceOpen ? "Close picker" : "Add appliance"}
                  </button>
                  {applianceOpen && (
                    <div className="pick-panel">
                      <input
                        className="input pick-search"
                        placeholder="Search fridge, AC, geyser…"
                        value={applianceQuery}
                        onChange={(event) => setApplianceQuery(event.target.value)}
                        aria-label="Search appliances"
                      />
                      <div className="pick-grid">
                        {APPLIANCE_CATALOG.filter((entry: { id: string; name: string; cost: number; category: string }) => `${entry.name} ${entry.category}`.toLowerCase().includes(applianceQuery.trim().toLowerCase())).map((entry: { id: string; name: string; cost: number; category: string }) => (
                          <button key={entry.id} type="button" className="pick-tile" onClick={() => addAppliance(entry.id)}>
                            <span className="pick-copy">
                              <strong>{entry.name}</strong>
                              <span>{entry.category} · {inr(entry.cost, true)}</span>
                            </span>
                            <Plus />
                          </button>
                        ))}
                      </div>
                      <div className="pick-custom">
                        <input className="input" placeholder="Name your own appliance" value={applianceName} onChange={(event) => setApplianceName(event.target.value)} aria-label="Custom appliance name" />
                        <span className="input-suffix">
                          <input className="input mono" inputMode="numeric" placeholder="₹" value={appliancePrice} onChange={(event) => setAppliancePrice(event.target.value.replace(/[^0-9]/g, ""))} aria-label="Custom appliance price" />
                          <span>₹</span>
                        </span>
                        <button type="button" className="btn btn-primary btn-sm" onClick={addCustomAppliance} disabled={!applianceName.trim() || !appliancePrice}>Add</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="callout-copper">
              <Sparkles size={15} />
              <p>
                <strong>Vastu, in spirit.</strong> Master bedroom sits south-west; kitchen in the south-east; water and pooja in the north-east. Light guides the plan.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="customizer-foot">
        <div className="mini-cost">
          <span className="tiny">Live estimate · {costs.tierName}</span>
          <strong>{inr(costs.total, true)}</strong>
        </div>
        <div className={`mini-gap ${gap < 0 ? "is-over" : "is-under"}`}>
          {gap >= 0 ? `${inr(gap, true)} budget headroom` : `${inr(Math.abs(gap), true)} over budget`}
        </div>
        <a className="btn btn-secondary btn-sm" href={`#/p/${project.id}/cost`}>
          Open costing <ChevronRight size={13} />
        </a>
      </div>
    </aside>
  );
}

function MeterInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
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
    const clamped = Math.min(max, Math.max(min, Math.round(parsed * 100) / 100));
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
          aria-label={`${label} in metres`}
        />
        <span>m</span>
      </span>
    </label>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-row">
      <span className="field-label">
        {label} <span className="value">{value.toFixed(step < 0.1 ? 2 : 1)} m</span>
      </span>
      <input
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
      />
    </label>
  );
}

function FeatureRow({
  icon,
  title,
  price,
  note,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  price: string;
  note: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={`feature-row ${checked ? "is-on" : ""}`}>
      <span className="feature-icon">{icon}</span>
      <span className="feature-copy">
        <strong>{title}</strong>
        <span>{note}</span>
      </span>
      <span className="feature-price">{price}</span>
      <Switch checked={checked} onChange={onChange} label={`Toggle ${title}`} />
    </div>
  );
}
