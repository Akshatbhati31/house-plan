import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  ImagePlus,
  Images,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SiteSketch } from "../components/SiteSketch";
import { fileToOptimizedDataUrl } from "../lib/files";
import { useStore } from "../lib/store";
import type { Project, ReferenceImage } from "../types";

export function ReferencesPage({ project }: { project: Project }) {
  const { updateProject, toast } = useStore();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState<ReferenceImage | null>(null);

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (list.length === 0) return;
    setBusy(true);
    try {
      const additions: ReferenceImage[] = [];
      for (const file of list) {
        const dataUrl = await fileToOptimizedDataUrl(file, 1500, 0.82);
        additions.push({
          id: `ref-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " "),
          dataUrl,
          note: "",
        });
      }
      updateProject(project.id, { references: [...project.references, ...additions] });
      toast(`${additions.length} reference${additions.length === 1 ? "" : "s"} added to the board`, "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not add those images.", "warning");
    } finally {
      setBusy(false);
    }
  };

  const removeReference = (reference: ReferenceImage) => {
    updateProject(project.id, { references: project.references.filter((item) => item.id !== reference.id) });
    if (lightbox?.id === reference.id) setLightbox(null);
    toast("Reference removed", "warning");
  };

  const setNote = (id: string, note: string) => {
    updateProject(project.id, {
      references: project.references.map((item) => (item.id === id ? { ...item, note } : item)),
    });
  };

  return (
    <div className="page refs-page">
      <PageHeader
        eyebrow={`${project.name} · reference shelf`}
        title={<>Collect the <em>feeling</em> first</>}
        lead="Drop in rooms, façades, materials or a detail you cannot stop thinking about. The studio keeps them beside the drawings, so every choice has a source."
        actions={
          <>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
              <Upload /> {busy ? "Adding…" : "Upload images"}
            </button>
            <a className="btn btn-secondary btn-sm" href={`#/p/${project.id}/plan`}>Back to plan <ArrowUpRight /></a>
          </>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) void addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="refs-top">
        <section
          className={`upload-zone ${dragging ? "is-dragging" : ""} ${busy ? "is-busy" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void addFiles(event.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
        >
          <span className="upload-zone-icon"><ImagePlus /></span>
          <div>
            <strong className="display">{dragging ? "Let go — we have it." : busy ? "Shaping the board…" : "Drop a reference here"}</strong>
            <p>JPG, PNG or WebP. We softly compress each image before saving it on this device.</p>
          </div>
          <span className="btn btn-secondary btn-sm"><Plus /> Choose files</span>
        </section>

        <aside className="refs-context">
          <div className="refs-context-head">
            <span className="eyebrow no-rule">The site so far</span>
            <span className="badge">{project.mapSource === "upload" ? "Uploaded map" : "Studio sketch"}</span>
          </div>
          <div className="refs-site-thumb">
            {project.mapImage ? <img src={project.mapImage} alt="Uploaded land map" /> : <SiteSketch compact />}
          </div>
          <div className="refs-site-meta">
            <strong><MapPin /> {project.location}</strong>
            <span>{project.plot.width} × {project.plot.depth} m · {project.orientation}-facing · {Math.round(project.plot.width * project.plot.depth)} m²</span>
          </div>
          <div className="refs-direction">
            <span>Direction</span>
            <div className="row gap-4 wrap">
              <span className="chip">Warm contemporary</span>
              <span className="chip">Earth + sage</span>
              <span className="chip">Matte finishes</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="ref-board">
        <div className="section-head">
          <div>
            <span className="eyebrow no-rule">Inspiration board</span>
            <h2 className="section-title" style={{ marginTop: 5 }}>{project.references.length} image{project.references.length === 1 ? "" : "s"} in the brief</h2>
            <p className="section-sub">Add a note under each image so the idea survives the site meeting.</p>
          </div>
          <span className="chip"><Images /> {project.references.length} saved</span>
        </div>

        {project.references.length === 0 ? (
          <div className="empty refs-empty">
            <ImagePlus size={28} />
            <strong>The board is waiting for its first image</strong>
            <p>An arched doorway, a stone counter, a courtyard with one tree. Start with what you already love.</p>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => inputRef.current?.click()}><Upload /> Upload a reference</button>
          </div>
        ) : (
          <div className="ref-grid">
            {project.references.map((reference, index) => (
              <article className="ref-card" key={reference.id}>
                <button className="ref-card-image" type="button" onClick={() => setLightbox(reference)} aria-label={`View ${reference.name}`}>
                  <img src={reference.dataUrl} alt={reference.name} />
                  <span className="ref-index mono">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ref-zoom">View</span>
                </button>
                <div className="ref-card-body">
                  <div className="ref-card-head">
                    <strong>{reference.name || `Reference ${index + 1}`}</strong>
                    <button className="icon-btn" type="button" onClick={() => removeReference(reference)} aria-label={`Remove ${reference.name}`}><Trash2 /></button>
                  </div>
                  <textarea
                    className="input ref-note-input"
                    rows={2}
                    placeholder="What should we borrow from this?"
                    value={reference.note ?? ""}
                    onChange={(event) => setNote(reference.id, event.target.value)}
                    aria-label={`Note for ${reference.name}`}
                  />
                  <div className="ref-card-foot">
                    <span className="tiny">{reference.note ? <><Check /> Note saved</> : "Add a note"}</span>
                    <span className="tiny">Reference {index + 1}</span>
                  </div>
                </div>
              </article>
            ))}
            <button type="button" className="ref-add-tile" onClick={() => inputRef.current?.click()}>
              <span className="ref-add-icon"><Plus /></span>
              <strong className="display">Add another</strong>
              <span>Drop in a room, material or façade you love.</span>
            </button>
          </div>
        )}
      </section>

      <div className="refs-footer">
        <div className="refs-footer-copy">
          <span className="eyebrow no-rule">From reference to drawing</span>
          <h3 className="display">The board becomes a brief.</h3>
          <p>Façade, palette and interior cues flow into the 2D plan and 3D model. If an image is only a feeling, tell us that too — it still belongs.</p>
        </div>
        <div className="row gap-8 wrap">
          <a className="btn btn-secondary btn-sm" href={`#/p/${project.id}/model`}><Sparkles /> See the model</a>
          <a className="btn btn-primary btn-sm" href={`#/p/${project.id}/plan`}>Return to drawings <ArrowUpRight /></a>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <>
            <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} />
            <motion.div
              className="ref-lightbox"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.24 }}
              role="dialog"
              aria-modal="true"
              aria-label={lightbox.name}
            >
              <div className="ref-lightbox-head">
                <div>
                  <span className="eyebrow no-rule">Reference</span>
                  <h3 className="display">{lightbox.name}</h3>
                </div>
                <button className="icon-btn" type="button" onClick={() => setLightbox(null)} aria-label="Close image"><X /></button>
              </div>
              <img src={lightbox.dataUrl} alt={lightbox.name} />
              {lightbox.note && <p className="ref-lightbox-note">{lightbox.note}</p>}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
