import {
  ArrowUpRight,
  Check,
  Download,
  IndianRupee,
  Info,
  Moon,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Wand2,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SettingRow, Switch } from "../components/UI";
import { downloadText } from "../lib/files";
import { useStore } from "../lib/store";
import {
  BUDGET_STEPS,
  FINISH_TIERS,
  inr,
  type PaletteId,
} from "../types";

interface PaletteOption {
  id: PaletteId;
  name: string;
  description: string;
  dark: string[];
  light: string[];
  roles: string[];
}

const palettes: PaletteOption[] = [
  {
    id: "copper",
    name: "Copper & Sage",
    description: "Warm clay, quiet sage, paper and charcoal. The studio as it was drawn.",
    dark: ["#141413", "#22211F", "#F4F1EA", "#A8A49E", "#E08A6E", "#7A9A80"],
    light: ["#F9F8F6", "#EFECE6", "#1A1918", "#6E6A66", "#C86D51", "#3D4F41"],
    roles: ["Canvas", "Surface", "Ink", "Muted", "Accent", "Sage"],
  },
  {
    id: "clay",
    name: "Clay & Olive",
    description: "A drier, earthier read. More potter's clay, less copper; olive replaces sage.",
    dark: ["#151311", "#25211C", "#F5EFE4", "#AFA79B", "#C98A63", "#8A9A72"],
    light: ["#FAF7F1", "#F0EAE0", "#1F1B17", "#736B62", "#A95F3F", "#5A6B45"],
    roles: ["Canvas", "Surface", "Ink", "Muted", "Accent", "Olive"],
  },
  {
    id: "brass",
    name: "Brass & Eucalyptus",
    description: "Cooler and more polished. Brushed brass with a blue-green eucalyptus.",
    dark: ["#131412", "#222320", "#F3F1E8", "#A6A69B", "#D8AE6C", "#89A69B"],
    light: ["#F8F8F4", "#EEEDE5", "#1B1B18", "#6B6B62", "#946F31", "#3F5F56"],
    roles: ["Canvas", "Surface", "Ink", "Muted", "Accent", "Eucalyptus"],
  },
];

export function SettingsPage() {
  const { settings, setTheme, setPalette, setReducedMotion, approvePalette, resetDemo, projects, toast } = useStore();
  const active = palettes.find((item) => item.id === settings.palette) ?? palettes[0];
  const activeName = active.name;

  const downloadData = () => {
    downloadText(
      "bhoomi-studio-backup.json",
      JSON.stringify({ exportedAt: new Date().toISOString(), settings, projects }, null, 2),
      "application/json",
    );
    toast("Studio data downloaded", "success");
  };

  const reset = () => {
    if (!window.confirm("Reset the studio to the sample project and default preferences? Your added projects and references will be removed from this browser.")) return;
    resetDemo();
    toast("Studio reset to the sample project", "warning");
  };

  return (
    <div className="page settings-page">
      <PageHeader
        eyebrow="Studio settings"
        title={<>Set the studio's <em>temperature</em></>}
        lead="The interface is built on Copper & Sage. Please approve the palette below — or preview Clay & Olive and Brass & Eucalyptus first. Your choice is remembered on this device."
        actions={<span className={`badge ${settings.paletteApproved ? "" : "amber"}`}>{settings.paletteApproved ? <Check /> : <Sparkles />}{settings.paletteApproved ? "Palette approved" : "Approval requested"}</span>}
      />

      <section className="palette-approval">
        <div className="palette-approval-head">
          <div>
            <span className="eyebrow no-rule">Palette approval</span>
            <h2 className="display">Live with it for a moment.</h2>
            <p>
              Every card, drawing sheet and model backdrop is tinted by this palette. The home materials stay project-specific;
              the studio around them should feel like one place.
            </p>
          </div>
          <div className="palette-current">
            <span className="tiny">Currently previewing</span>
            <strong>{activeName}</strong>
            <div className="palette-current-strip">
              {active.dark.slice(2).map((hex) => <span key={hex} style={{ background: hex }} title={hex} />)}
            </div>
          </div>
        </div>

        <div className="palette-grid">
          {palettes.map((palette) => {
            const selected = settings.palette === palette.id;
            return (
              <article className={`palette-option ${selected ? "is-active" : ""}`} key={palette.id}>
                <div className="palette-option-head">
                  <div>
                    <span className="eyebrow no-rule">{selected ? "Previewing now" : "Alternative"}</span>
                    <h3 className="display">{palette.name}</h3>
                  </div>
                  {selected && <span className="palette-check"><Check /></span>}
                </div>
                <p className="palette-description">{palette.description}</p>
                <div className="palette-preview-rows">
                  <PaletteRow label="Dark" swatches={palette.dark} roles={palette.roles} />
                  <PaletteRow label="Light" swatches={palette.light} roles={palette.roles} />
                </div>
                <div className="palette-option-foot">
                  <button type="button" className={`btn ${selected ? "btn-secondary" : "btn-ghost"} btn-sm`} onClick={() => setPalette(palette.id)}>
                    {selected ? <><Check /> Previewing</> : <><Wand2 /> Preview palette</>}
                  </button>
                  {selected && <span className="tiny">Accent {palette.dark[4]}</span>}
                </div>
              </article>
            );
          })}
        </div>

        <div className="palette-approval-foot">
          <div className="palette-approval-note">
            <Info />
            <p>
              <strong>{activeName} is selected.</strong> Approving signs off the interface colours, not the home's materials.
              Changing palette later asks for approval again — nothing is locked to the project.
            </p>
          </div>
          <div className="palette-approval-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setPalette("copper"); toast("Copper & Sage selected"); }}>
              <RotateCcw /> Default palette
            </button>
            <button
              type="button"
              className={`btn ${settings.paletteApproved ? "btn-sage" : "btn-primary"}`}
              onClick={() => {
                approvePalette();
                toast(`${activeName} approved for the studio`, "success");
              }}
              disabled={settings.paletteApproved}
            >
              {settings.paletteApproved ? <><Check /> {activeName} approved</> : <><Sparkles /> Approve {activeName}</>}
            </button>
          </div>
        </div>
      </section>

      <div className="settings-columns">
        <section className="settings-card appearance-card">
          <div className="settings-card-head">
            <div>
              <span className="eyebrow no-rule">Appearance</span>
              <h2 className="section-title" style={{ marginTop: 5 }}>Light or dark studio</h2>
              <p className="section-sub">The palette has a tuned answer for both. The theme switch lives in the sidebar too.</p>
            </div>
            <Palette />
          </div>
          <div className="theme-cards">
            <button type="button" className={`theme-card ${settings.theme === "dark" ? "is-active" : ""}`} onClick={() => setTheme("dark")}>
              <span className="theme-thumb theme-thumb-dark">
                <span className="theme-thumb-side" />
                <span className="theme-thumb-card" />
                <span className="theme-thumb-line" />
                <span className="theme-thumb-accent" />
              </span>
              <span className="theme-card-copy"><strong><Moon /> Dark studio</strong><span>Warm charcoal, paper ink and copper.</span></span>
              {settings.theme === "dark" && <span className="palette-check"><Check /></span>}
            </button>
            <button type="button" className={`theme-card ${settings.theme === "light" ? "is-active" : ""}`} onClick={() => setTheme("light")}>
              <span className="theme-thumb theme-thumb-light">
                <span className="theme-thumb-side" />
                <span className="theme-thumb-card" />
                <span className="theme-thumb-line" />
                <span className="theme-thumb-accent" />
              </span>
              <span className="theme-card-copy"><strong><Sun /> Light studio</strong><span>Warm paper, soft borders and clay.</span></span>
              {settings.theme === "light" && <span className="palette-check"><Check /></span>}
            </button>
          </div>

          <div className="theme-preview">
            <div className="theme-preview-bar">
              <span className="theme-preview-dot" />
              <span className="tiny">bhoomi studio · preview</span>
              <span className="theme-preview-pill">G + 1</span>
            </div>
            <div className="theme-preview-body">
              <div className="theme-preview-nav">
                <span /><span /><span />
              </div>
              <div className="theme-preview-content">
                <span className="theme-preview-eyebrow" />
                <span className="theme-preview-title" />
                <span className="theme-preview-sub" />
                <div className="theme-preview-tiles"><span /><span /><span /></div>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card settings-side">
          <div>
            <span className="eyebrow no-rule">Motion & comfort</span>
            <h2 className="section-title" style={{ marginTop: 5 }}>A calm interface</h2>
          </div>
          <SettingRow
            title="Reduce motion"
            description="Disables page and theme transitions, animated numbers and model auto-rotate."
            control={<Switch checked={settings.reducedMotion} onChange={setReducedMotion} label="Reduce motion" />}
          />
          <div className="settings-divider" />
          <div>
            <span className="eyebrow no-rule">Your data</span>
            <h2 className="section-title" style={{ marginTop: 5 }}>Local, by design</h2>
            <p className="section-sub">Projects, uploads and preferences live in this browser. No account, no server, no map leaves the device.</p>
          </div>
          <div className="settings-data-row">
            <span className="settings-data-icon"><ShieldCheck /></span>
            <div><strong>{projects.length} project{projects.length === 1 ? "" : "s"} stored</strong><span>Kept in this browser's local storage, private to this device</span></div>
          </div>
          <div className="row gap-8 wrap">
            <button type="button" className="btn btn-secondary btn-sm" onClick={downloadData}><Download /> Download data</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={reset}><RotateCcw /> Reset studio</button>
          </div>
          <div className="settings-divider" />
          <div className="settings-shortcuts">
            <a href="#/projects">Projects <ArrowUpRight /></a>
            <a href="#/new">New site scan <ArrowUpRight /></a>
            <a href="#/p/project1/cost">Cost sheet <ArrowUpRight /></a>
          </div>
        </section>
      </div>

      <div className="settings-bottom">
        <section className="settings-rate-card">
          <div className="row gap-8" style={{ marginBottom: 12 }}>
            <IndianRupee />
            <h3 className="section-title" style={{ fontSize: 21 }}>Meerut rate basis</h3>
          </div>
          <p className="section-sub" style={{ marginTop: -6, marginBottom: 12 }}>Turnkey averages used across every project. Adjust the finish inside each home.</p>
          <div className="rate-list">
            {FINISH_TIERS.map((tier) => (
              <div className="rate-row is-readonly" key={tier.id}>
                <span className="finish-radio" />
                <span className="rate-copy"><strong>{tier.name}</strong><span>{tier.summary}</span></span>
                <span className="rate-value mono">₹{tier.rate.toLocaleString("en-IN")}<small>/ft²</small></span>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-bottom-card">
          <span className="eyebrow no-rule">Budget ladder</span>
          <h3 className="display">Ten to eighty lakh.</h3>
          <p>The cost page uses a discrete ladder so conversations stay concrete. You can always step the budget in ₹10 lakh increments.</p>
          <div className="settings-budget-strip">
            {BUDGET_STEPS.map((step) => <span key={step} title={inr(step)}>₹{step / 100000}L</span>)}
          </div>
        </section>

        <section className="settings-bottom-card settings-bottom-sage">
          <span className="eyebrow no-rule">A note from the studio</span>
          <h3 className="display">The house should feel older than its furniture.</h3>
          <p>Warm materials, honest structure and rooms that take light seriously. The palette is only the wrapper — the plan is the promise.</p>
          <a className="link-arrow" href="#/projects">Back to the shelf <ArrowUpRight /></a>
        </section>
      </div>
    </div>
  );
}

function PaletteRow({ label, swatches, roles }: { label: string; swatches: string[]; roles: string[] }) {
  return (
    <div className="palette-row">
      <span className="palette-row-label">{label}</span>
      <div className="palette-swatches">
        {swatches.map((hex, index) => (
          <span key={`${label}-${hex}`} style={{ background: hex }} title={`${roles[index]} · ${hex}`}>
            <em>{hex}</em>
          </span>
        ))}
      </div>
    </div>
  );
}
