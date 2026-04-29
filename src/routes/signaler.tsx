import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { reportApi, type Report, type HarassmentType, type ActionLevel } from "@/lib/api";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck, KeyRound, Copy, Check, MessageCircle, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signaler")({
  head: () => ({
    meta: [
      { title: "Signaler — Refuge" },
      { name: "description", content: "Démarrer un signalement anonyme et sécurisé. Anonymat garanti." },
    ],
  }),
  component: SignalerPage,
});

const TYPES: { value: HarassmentType; label: string; desc: string }[] = [
  { value: "scolaire", label: "Scolaire", desc: "Au collège, lycée, université…" },
  { value: "professionnel", label: "Professionnel", desc: "Au travail, par un collègue ou supérieur" },
  { value: "moral", label: "Moral", desc: "Pression, dénigrement, isolement répétés" },
  { value: "sexuel", label: "Sexuel", desc: "Propos, gestes, contraintes à caractère sexuel" },
  { value: "cyber", label: "Cyber", desc: "En ligne, réseaux sociaux, messageries" },
  { value: "discriminatoire", label: "Discriminatoire", desc: "Lié à l'origine, l'orientation, la religion…" },
  { value: "familial", label: "Familial", desc: "Au sein du foyer ou de la famille" },
  { value: "autre", label: "Autre situation", desc: "Vous décrirez librement" },
];

type Step = "intro" | "type" | "story" | "context" | "level" | "done";

function SignalerPage() {
  const [step, setStep] = useState<Step>("intro");
  const [report, setReport] = useState<{ id: string; recovery_code: string } | null>(null);
  const [creating, setCreating] = useState(false);

  // form state
  const [type, setType] = useState<HarassmentType | "">("");
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [location, setLocation] = useState("");
  const [aggressor, setAggressor] = useState("");
  const [actionLevel, setActionLevel] = useState<ActionLevel>("accompagnement");
  const [saving, setSaving] = useState(false);

  async function ensureReport() {
    if (report) return report;
    setCreating(true);
    try {
      const r = await reportApi.create();
      setReport(r.report);
      return r.report;
    } finally {
      setCreating(false);
    }
  }

  async function saveAndAdvance(next: Step, fields: Partial<Report>) {
    const r = await ensureReport();
    setSaving(true);
    try {
      await reportApi.update(r.recovery_code, fields);
      setStep(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur d'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-stone-warm/20">
        <div className="container-prose py-12">
          <Stepper current={step} />

          {step === "intro" && (
            <Card>
              <h1 className="font-serif text-3xl font-bold text-stone-deep">Avant de commencer</h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Vous allez débuter un signalement entièrement anonyme. À chaque étape,
                vous pouvez sauter, modifier ou fermer la fenêtre. Rien n'est définitif tant
                que vous ne le décidez pas.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-stone-deep">
                <Bullet>Aucune création de compte n'est requise.</Bullet>
                <Bullet>Un code unique vous sera remis pour retrouver votre dossier.</Bullet>
                <Bullet>Aucun nom ne sera jamais publié, où que ce soit.</Bullet>
                <Bullet>Vous pouvez tout supprimer à tout moment.</Bullet>
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <PrimaryBtn
                  onClick={async () => {
                    await ensureReport();
                    setStep("type");
                  }}
                  loading={creating}
                >
                  Je commence <ArrowRight className="size-4" />
                </PrimaryBtn>
                <Link to="/" className="text-sm text-muted-foreground hover:text-stone-deep self-center">
                  Retour à l'accueil
                </Link>
              </div>
            </Card>
          )}

          {step === "type" && (
            <Card>
              <Heading title="De quel type de situation s'agit-il ?" subtitle="Choisissez ce qui correspond le mieux. Vous pourrez préciser ensuite." />
              <div className="grid sm:grid-cols-2 gap-3 mt-6">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      type === t.value
                        ? "border-primary bg-accent/40 shadow-soft"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="font-semibold text-stone-deep">{t.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
                  </button>
                ))}
              </div>
              <Nav
                onBack={() => setStep("intro")}
                onNext={() => type && saveAndAdvance("story", { harassment_type: type as HarassmentType })}
                nextDisabled={!type}
                loading={saving}
              />
            </Card>
          )}

          {step === "story" && (
            <Card>
              <Heading title="Avec vos mots, que s'est-il passé ?" subtitle="Pas besoin de tout dire maintenant. Quelques phrases suffisent pour commencer." />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={9}
                placeholder="Par exemple : depuis plusieurs semaines, je reçois des messages…"
                className="mt-6 w-full p-4 rounded-lg border border-input bg-background text-stone-deep resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Écho pourra vous aider à structurer ce récit après ce formulaire.
              </p>
              <Nav
                onBack={() => setStep("type")}
                onNext={() => saveAndAdvance("context", { description })}
                nextDisabled={description.trim().length < 10}
                loading={saving}
              />
            </Card>
          )}

          {step === "context" && (
            <Card>
              <Heading title="Quelques précisions, si vous le souhaitez" subtitle="Tout est facultatif. Sautez les champs que vous ne voulez pas remplir." />
              <div className="mt-6 space-y-5">
                <Field label="Date approximative des faits (ou début)">
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-input bg-background text-stone-deep"
                  />
                </Field>
                <Field label="Lieu (ville, contexte)">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex : Lyon, en entreprise"
                    className="w-full p-3 rounded-lg border border-input bg-background text-stone-deep"
                  />
                </Field>
                <Field
                  label="À propos de la personne mise en cause"
                  hint="Cette information ne sera JAMAIS publiée. Elle sert uniquement à étayer votre dossier."
                >
                  <input
                    type="text"
                    value={aggressor}
                    onChange={(e) => setAggressor(e.target.value)}
                    placeholder="Lien, fonction, prénom (facultatif)"
                    className="w-full p-3 rounded-lg border border-input bg-background text-stone-deep"
                  />
                </Field>
              </div>
              <Nav
                onBack={() => setStep("story")}
                onNext={() => saveAndAdvance("level", { incident_date: incidentDate || null, location, aggressor_info: aggressor })}
                loading={saving}
              />
            </Card>
          )}

          {step === "level" && (
            <Card>
              <Heading title="Que souhaitez-vous faire de ce signalement ?" subtitle="Vous pourrez changer d'avis plus tard." />
              <div className="mt-6 space-y-3">
                {([
                  { v: "temoignage", t: "Simplement témoigner", d: "Mettre les mots, conserver une trace pour vous-même." },
                  { v: "accompagnement", t: "Être accompagné·e", d: "Échanger avec Écho, recevoir des recommandations." },
                  { v: "dossier", t: "Constituer un dossier", d: "Générer un rapport structuré, exploitable juridiquement." },
                ] as const).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setActionLevel(o.v)}
                    className={`w-full text-left p-5 rounded-lg border transition-all ${
                      actionLevel === o.v ? "border-primary bg-accent/40 shadow-soft" : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="font-semibold text-stone-deep">{o.t}</div>
                    <div className="text-sm text-muted-foreground mt-1">{o.d}</div>
                  </button>
                ))}
              </div>
              <Nav
                onBack={() => setStep("context")}
                onNext={async () => {
                  if (!report) return;
                  setSaving(true);
                  try {
                    await reportApi.update(report.recovery_code, { action_level: actionLevel });
                    await reportApi.submit(report.recovery_code);
                    setStep("done");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Erreur");
                  } finally {
                    setSaving(false);
                  }
                }}
                loading={saving}
                nextLabel="Valider mon signalement"
              />
            </Card>
          )}

          {step === "done" && report && <DoneCard code={report.recovery_code} />}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const order: Step[] = ["intro", "type", "story", "context", "level", "done"];
  const idx = order.indexOf(current);
  const labels = ["Intro", "Type", "Récit", "Contexte", "Action", "Code"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-2 flex-1">
          <div
            className={`size-7 rounded-full grid place-items-center text-xs font-bold border-2 transition-colors ${
              i < idx ? "bg-primary text-primary-foreground border-primary"
                : i === idx ? "bg-background text-primary border-primary"
                : "bg-background text-muted-foreground border-border"
            }`}
          >{i + 1}</div>
          {i < labels.length - 1 && (
            <div className={`flex-1 h-0.5 rounded ${i < idx ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-soft">{children}</div>;
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-deep text-balance">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <ShieldCheck className="size-4 text-sage mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-stone-deep mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-xs text-muted-foreground mt-1.5">{hint}</div>}
    </label>
  );
}

function PrimaryBtn({ onClick, children, loading, disabled }: { onClick: () => void; children: React.ReactNode; loading?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-river-deep transition-colors disabled:opacity-50 shadow-soft"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

function Nav({ onBack, onNext, nextDisabled, loading, nextLabel = "Continuer" }: {
  onBack: () => void; onNext: () => void; nextDisabled?: boolean; loading?: boolean; nextLabel?: string;
}) {
  return (
    <div className="mt-9 flex items-center justify-between">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-stone-deep">
        <ArrowLeft className="size-4" /> Retour
      </button>
      <PrimaryBtn onClick={onNext} loading={loading} disabled={nextDisabled}>
        {nextLabel} <ArrowRight className="size-4" />
      </PrimaryBtn>
    </div>
  );
}

function DoneCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (copied) { const t = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(t); }
  }, [copied]);
  return (
    <Card>
      <div className="size-12 rounded-full bg-accent text-primary grid place-items-center mb-5">
        <ShieldCheck className="size-6" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-stone-deep">Votre signalement est enregistré.</h1>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        Conservez précieusement votre <strong className="text-stone-deep">code de récupération</strong> ci-dessous.
        C'est la <strong className="text-stone-deep">seule</strong> manière de retrouver votre dossier. Sans compte, sans email — donc sans fuite possible.
      </p>
      <div className="mt-7 bg-stone-warm/60 border border-border rounded-xl p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold flex items-center gap-2">
          <KeyRound className="size-3.5" /> Votre code unique
        </div>
        <div className="font-serif text-3xl md:text-4xl font-black text-primary mt-3 tracking-wider">{code}</div>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); toast.success("Code copié"); }}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-river-deep"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copié" : "Copier le code"}
        </button>
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <button
          onClick={() => navigate({ to: "/dossier/$code", params: { code } })}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-river-deep shadow-soft"
        >
          <MessageCircle className="size-4" /> Continuer avec Écho
        </button>
        <button
          onClick={() => navigate({ to: "/dossier/$code", params: { code } })}
          className="inline-flex items-center gap-2 bg-background border border-border text-stone-deep px-6 py-3 rounded-md font-semibold hover:bg-stone-warm"
        >
          <FileText className="size-4" /> Voir mon dossier
        </button>
      </div>
    </Card>
  );
}
