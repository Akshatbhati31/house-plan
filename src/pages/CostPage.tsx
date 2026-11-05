import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  IndianRupee,
  Info,
  Layers3,
  MapPin,
  Printer,
  Sparkles,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { AnimatedNumber } from "../components/UI";
import { downloadText, safeFileStem, toCsv } from "../lib/files";
import { getBudgetReadout, getCosts, suggestedTier } from "../lib/plan";
import { useStore } from "../lib/store";
import {
  BUDGET_STEPS,
  FINISH_TIERS,
  inr,
  num,
  sqft,
  type CostLine,
  type FinishTier,
  type Project,
} from "../types";

export function CostPage({ project }: { project: Project }) {
  const { updateProject, toast } = useStore();
  const [showAll, setShowAll] = useState(false);
  const costs = getCosts(project);
  const readout = getBudgetReadout(project);
  const nearestIndex = BUDGET_STEPS.reduce(
    (best, value, index) => (Math.abs(value - project.budget) < Math.abs(BUDGET_STEPS[best] - project.budget) ? index : best),
    0,
  );
  const budget = project.budget;
  const gap = budget - costs.total;
  const ratio = Math.min(120, (costs.total / budget) * 100);
  const suggestion = suggestedTier(project, budget);
  const currentTier = FINISH_TIERS.find((tier) => tier.id === project.settings.finish) ?? FINISH_TIERS[2];
  const tierIndex = FINISH_TIERS.findIndex((tier) => tier.id === currentTier.id);
  const suggestionIndex = FINISH_TIERS.findIndex((tier) => tier.id === suggestion.tier.id);

  const groups = [
    { id: "core", label: "Core build", lines: costs.lines.filter((line) => line.group === "Core build"), color: "var(--accent)" },
    { id: "design", label: "Design & statutory", lines: costs.lines.filter((line) => line.group === "Design & statutory"), color: "var(--sage)" },
    { id: "extras", label: "Enhancements", lines: costs.lines.filter((line) => line.group === "Enhancements"), color: "var(--warning)" },
    { id: "interiors", label: "Interiors", lines: costs.lines.filter((line) => line.group === "Interiors"), color: "var(--muted)" },
  ];
  const groupTotal = (lines: CostLine[]) => lines.reduce((sum, line) => sum + line.amount, 0);
  const setBudget = (index: number) => updateProject(project.id, { budget: BUDGET_STEPS[index] });
  const setFinish = (tier: FinishTier) => {
    updateProject(project.id, { settings: { finish: tier } });
    toast(`Finish package set to ${FINISH_TIERS.find((item) => item.id === tier)?.name}`, "success");
  };
  const toggle = (key: "furnishing" | "automation" | "solar" | "evCharger" | "landscaping" | "terraceGarden") =>
    updateProject(project.id, { settings: { [key]: !project.settings[key] } });

  const donut = (() => {
    let cursor = 0;
    return groups
      .map((group) => {
        const amount = groupTotal(group.lines);
        const share = costs.total > 0 ? (amount / costs.total) * 100 : 0;
        const start = cursor;
        cursor += share;
        return `${group.color} ${start}% ${start + share}%`;
      })
      .join(", ");
  })();

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ["Bhoomi Studio — Indicative cost sheet"],
      ["Project", project.name],
      ["Location", project.location],
      ["Plot", `${num(project.plot.width, 1)} m x ${num(project.plot.depth, 1)} m`],
      ["Built-up area", `${Math.round(costs.areaSqft)} sq ft`],
      ["Finish package", costs.tierName],
      ["Budget", budget],
      ["Estimate", Math.round(costs.total)],
      ["Budget gap", Math.round(gap)],
      [],
      ["Group", "Line item", "Amount (INR)", "Note"],
      ...costs.lines.map((line) => [line.group, line.label, Math.round(line.amount), line.note ?? ""]),
      [],
      ["Rate basis (INR per sq ft)"],
      ...FINISH_TIERS.map((tier) => [tier.name, tier.rate]),
      [],
      ["Disclaimer", "Indicative Meerut turnkey rates. Excludes land, stamp duty, registration, taxes and financing."],
    ];
    downloadText(`${safeFileStem(project.name)}-cost-sheet.csv`, `\ufeff${toCsv(rows)}`, "text/csv;charset=utf-8");
    toast("Cost sheet downloaded as CSV", "success");
  };

  const quickTrims = [
    {
      key: "finish" as const,
      label: suggestionIndex < tierIndex ? `Use ${suggestion.tier.name} finish` : "Finish package is already lean",
      note: suggestionIndex < tierIndex ? `Saves about ${inr(costs.construction - getCosts({ ...project, settings: { ...project.settings, finish: suggestion.tier.id } }).construction, true)}` : "Try a lower package",
      enabled: suggestionIndex < tierIndex,
      action: () => setFinish(suggestion.tier.id),
    },
    {
      key: "furnishing" as const,
      label: "Pause furnishing package",
      note: "Keep loose furniture and styling for later",
      enabled: project.settings.furnishing,
      action: () => toggle("furnishing"),
    },
    {
      key: "solar" as const,
      label: "Pause rooftop solar",
      note: "Add after handover without changing structure",
      enabled: project.settings.solar,
      action: () => toggle("solar"),
    },
    {
      key: "automation" as const,
      label: "Pause smart home",
      note: "Pre-wire now, fit the modules later",
      enabled: project.settings.automation,
      action: () => toggle("automation"),
    },
  ];

  return (
    <div className="page cost-page">
      <PageHeader
        eyebrow={`${project.name} · costing`}
        title={<>A real Meerut number, <em>not a range</em></>}
        lead="Turnkey averages for the city, adjusted for your finish, flooring, façade and extras. Move the budget to see the conversation change."
        actions={
          <>
            <button className="btn btn-secondary btn-sm" type="button" onClick={exportCsv}><Download /> CSV sheet</button>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => window.print()}><Printer /> Print</button>
          </>
        }
      />

      <section className="budget-hero">
        <div className="budget-hero-main">
          <div className="budget-hero-head">
            <span className="eyebrow no-rule">Set your build budget</span>
            <span className="chip"><MapPin /> Meerut rates · 2026</span>
          </div>
          <div className="budget-value-row">
            <div className="budget-value">
              <span className="budget-currency">₹</span>
              <AnimatedNumber value={budget} format={(value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)} />
            </div>
            <div className={`budget-state ${gap < 0 ? "is-over" : "is-under"}`}>
              {gap < 0 ? <TriangleAlert /> : <Check />}
              <span>{gap < 0 ? `${inr(Math.abs(gap), true)} over estimate` : `${inr(gap, true)} of headroom`}</span>
            </div>
          </div>
          <p className="budget-caption">
            {budget >= costs.total
              ? "The current brief fits inside this budget. Room to add finishes, furniture or a little more landscape."
              : "The current brief is over this budget. Use the quick trims below or step the budget up. Nothing has been lost — it is all editable."}
          </p>

          <div className="budget-slider">
            <div className="budget-slider-track">
              <span className="budget-slider-fill" style={{ width: `${(nearestIndex / (BUDGET_STEPS.length - 1)) * 100}%` }} />
              <span className="budget-slider-estimate" style={{ left: `${Math.min(100, (costs.total / BUDGET_STEPS[BUDGET_STEPS.length - 1]) * 100)}%` }} title="Current estimate" />
            </div>
            <input
              className="range budget-range"
              type="range"
              min={0}
              max={BUDGET_STEPS.length - 1}
              step={1}
              value={nearestIndex}
              onChange={(event) => setBudget(Number(event.target.value))}
              style={{ "--fill": `${(nearestIndex / (BUDGET_STEPS.length - 1)) * 100}%` } as React.CSSProperties}
              aria-label="Budget in lakhs"
            />
            <div className="budget-steps">
              {BUDGET_STEPS.map((value, index) => (
                <button
                  key={value}
                  type="button"
                  className={`budget-step ${index === nearestIndex ? "is-active" : ""} ${value >= costs.total ? "is-solvent" : ""}`}
                  onClick={() => setBudget(index)}
                >
                  <span>₹{value / 100000} L</span>
                </button>
              ))}
            </div>
          </div>

          <div className="budget-hero-facts">
            <HeroFact label="Estimate" value={inr(costs.total, true)} note={`₹${Math.round(costs.perSqft).toLocaleString("en-IN")}/ft² all-in`} />
            <HeroFact label="Build area" value={sqft(costs.areaSqft)} note={`${num(costs.areaSqft / 10.7639, 1)} m² across levels`} />
            <HeroFact label="Finish" value={costs.tierName} note={`₹${costs.rate.toLocaleString("en-IN")}/ft² base`} />
          </div>
        </div>

        <div className="budget-hero-gauge">
          <div className="cost-donut" style={{ background: `conic-gradient(${donut})` }}>
            <div className="cost-donut-hole">
              <span>Estimate</span>
              <strong className="mono">{inr(costs.total, true)}</strong>
              <span className="tiny">{Math.round(ratio)}% of budget</span>
            </div>
          </div>
          <div className="cost-legend">
            {groups.map((group) => (
              <span key={group.id}><i style={{ background: group.color }} />{group.label}<strong>{Math.round((groupTotal(group.lines) / costs.total) * 100)}%</strong></span>
            ))}
          </div>
        </div>
      </section>

      {gap < 0 && (
        <section className="over-budget-panel">
          <div className="over-budget-head">
            <span className="over-budget-icon"><TriangleAlert /></span>
            <div>
              <h2 className="section-title">Trim {inr(Math.abs(gap), true)} without losing the home</h2>
              <p className="section-sub">A package change, or pausing one add-on, usually brings the number back. Every choice stays reversible.</p>
            </div>
          </div>
          <div className="trim-grid">
            {quickTrims.filter((trim) => trim.enabled).map((trim) => (
              <button type="button" className="trim-card" key={trim.key} onClick={trim.action}>
                <span className="trim-icon"><ArrowDownRight /></span>
                <span className="trim-copy"><strong>{trim.label}</strong><span>{trim.note}</span></span>
                <ChevronRight />
              </button>
            ))}
            {quickTrims.every((trim) => !trim.enabled) && (
              <div className="trim-card is-empty">
                <span className="trim-icon"><Check /></span>
                <span className="trim-copy"><strong>The brief is already lean.</strong><span>Raise the budget one step to unlock the next comfort.</span></span>
              </div>
            )}
          </div>
          <div className="trim-suggestion">
            <Sparkles />
            <span>
              Closest fit at this budget: <strong>{suggestion.tier.name}</strong> package.{" "}
              {suggestionIndex < tierIndex ? <button className="link-arrow" type="button" onClick={() => setFinish(suggestion.tier.id)}>Apply {suggestion.tier.name} <ArrowUpRight /></button> : "You are already there."}
            </span>
          </div>
        </section>
      )}

      <div className="cost-layout">
        <section className="cost-breakdown">
          <div className="section-head">
            <div>
              <span className="eyebrow no-rule">Cost breakdown</span>
              <h2 className="section-title" style={{ marginTop: 5 }}>Where the money goes</h2>
              <p className="section-sub">{costs.lines.length} line items · all rates in INR · GST and municipal charges as noted</p>
            </div>
            <span className="chip"><IndianRupee /> {inr(costs.perSqft)}/ft²</span>
          </div>

          <div className="cost-groups">
            {groups.filter((group) => group.lines.length > 0).map((group) => {
              const amount = groupTotal(group.lines);
              const visibleLines = showAll ? group.lines : group.lines.slice(0, group.id === "core" ? 5 : 99);
              return (
                <article className="cost-group" key={group.id}>
                  <header className="cost-group-head">
                    <div className="row gap-8">
                      <span className="cost-group-dot" style={{ background: group.color }} />
                      <h3>{group.label}</h3>
                      <span className="tiny">{group.lines.length} item{group.lines.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="cost-group-amount">
                      <strong className="mono">{inr(amount)}</strong>
                      <span>{Math.round((amount / costs.total) * 100)}%</span>
                    </div>
                  </header>
                  <div className="cost-group-bar"><span style={{ width: `${(amount / costs.total) * 100}%`, background: group.color }} /></div>
                  <div className="cost-lines">
                    {visibleLines.map((line) => (
                      <div className="cost-line" key={line.id}>
                        <div className="cost-line-copy">
                          <strong>{line.label}</strong>
                          {line.note && <span>{line.note}</span>}
                        </div>
                        <span className="mono cost-line-amount">{inr(line.amount)}</span>
                      </div>
                    ))}
                  </div>
                  {group.id === "core" && group.lines.length > 5 && (
                    <button type="button" className="cost-more" onClick={() => setShowAll((value) => !value)}>
                      {showAll ? "Show fewer line items" : `Show all ${group.lines.length} core line items`}
                      <ChevronRight style={{ transform: showAll ? "rotate(-90deg)" : "rotate(90deg)" }} />
                    </button>
                  )}
                </article>
              );
            })}
          </div>

          <div className="cost-total-row">
            <div><span className="eyebrow no-rule">All-in estimate</span><strong className="display">{inr(costs.total)}</strong></div>
            <div><span className="tiny">Budget</span><strong className="mono">{inr(budget)}</strong></div>
            <div><span className="tiny">Difference</span><strong className={`mono ${gap < 0 ? "is-over" : "is-under"}`}>{gap < 0 ? "−" : "+"}{inr(Math.abs(gap))}</strong></div>
          </div>

          <div className="cost-disclaimer">
            <Info />
            <p>
              <strong>What this includes.</strong> Structure, envelope, finishes, standard services, the design fee, approvals and a 5% contingency. It excludes land, stamp duty, registration, home loans, borewell and any society charges. Rates are indicative Meerut averages for 2026 — get three local quotes before you commit.
            </p>
          </div>
        </section>

        <aside className="cost-aside">
          <section className="cost-side-card">
            <div className="row gap-8" style={{ marginBottom: 12 }}>
              <Layers3 />
              <h3 className="section-title" style={{ fontSize: 21 }}>Package rate card</h3>
            </div>
            <p className="section-sub" style={{ marginTop: -6, marginBottom: 12 }}>Average turnkey rates per square foot, Meerut.</p>
            <div className="rate-list">
              {FINISH_TIERS.map((tier) => (
                <button key={tier.id} type="button" className={`rate-row ${project.settings.finish === tier.id ? "is-active" : ""}`} onClick={() => setFinish(tier.id)}>
                  <span className="finish-radio" />
                  <span className="rate-copy"><strong>{tier.name}</strong><span>{tier.summary}</span></span>
                  <span className="rate-value mono">₹{tier.rate.toLocaleString("en-IN")}<small>/ft²</small></span>
                </button>
              ))}
            </div>
            <div className="callout-sage" style={{ marginTop: 12 }}>
              <Sparkles size={15} />
              <p>Signature is selected. It adds stone counters, veneer accents and better fittings without tipping into full luxury.</p>
            </div>
          </section>

          <section className="cost-side-card">
            <div className="row gap-8" style={{ marginBottom: 12 }}>
              <Wallet />
              <h3 className="section-title" style={{ fontSize: 21 }}>Can it fit?</h3>
            </div>
            <div className="fits-row">
              <span className="fits-label">{budget >= costs.total ? "Fits the budget" : "Over budget"}</span>
              <span className={`fits-badge ${budget >= costs.total ? "is-under" : "is-over"}`}>{budget >= costs.total ? <Check /> : <TriangleAlert />}</span>
            </div>
            <p className="section-sub">
              {budget >= costs.total
                ? `At ₹${(budget / 100000).toFixed(0)} lakh, the ${costs.tierName.toLowerCase()} package and all selected extras fit. You could re-add the ${project.settings.furnishing ? "furnishing" : "landscape"} budget line.`
                : `Move to ${suggestion.tier.name} and trim one add-on to land closer. The quick trims above are a starting point.`}
            </p>
            <div className="fits-scale">
              <span className="fits-marker" style={{ left: `${Math.min(100, ratio)}%` }} />
            </div>
            <div className="budget-mini-rows">
              <div className="mini-row"><span>Money left per month?</span><strong>Plan separately</strong></div>
              <div className="mini-row"><span>Approx. construction months</span><strong>{project.settings.floors === 1 ? "8–10" : project.settings.floors === 2 ? "12–15" : "16–20"}</strong></div>
            </div>
          </section>

          <section className="cost-side-card">
            <div className="row gap-8" style={{ marginBottom: 12 }}>
              <IndianRupee />
              <h3 className="section-title" style={{ fontSize: 21 }}>Budget phases</h3>
            </div>
            <p className="section-sub" style={{ marginTop: -6, marginBottom: 12 }}>Where your ₹{(budget / 100000).toFixed(0)} lakh is committed.</p>
            <div className="phase-list">
              {readout.phases.map((phase) => (
                <div className="phase-row" key={phase.name}>
                  <div className="phase-top">
                    <span>{phase.name}</span>
                    <strong className="mono">{inr(phase.amount, true)}</strong>
                  </div>
                  <div className="phase-bar"><span style={{ width: `${phase.progress * 100}%` }} /></div>
                  <div className="phase-foot">
                    <span>{phase.detail}</span>
                    <span className={phase.covered ? "is-under" : phase.partial ? "is-partial" : "is-over"}>
                      {phase.covered ? <Check /> : phase.partial ? <TriangleAlert /> : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="cost-side-card cost-side-note">
            <span className="eyebrow no-rule">Good to know</span>
            <h3 className="display">Rates move. The plan stays.</h3>
            <p>Steel, cement and labour vary through the year. A 5% contingency is already in the sheet. Revisit this estimate every quarter while the drawings progress.</p>
            <button className="btn btn-secondary btn-sm" type="button" onClick={exportCsv}><Download /> Save the sheet</button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function HeroFact({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="budget-hero-fact">
      <span>{label}</span>
      <strong className="mono">{value}</strong>
      <span>{note}</span>
    </div>
  );
}
