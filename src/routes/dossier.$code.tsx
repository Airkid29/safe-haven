import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useEffect, useRef, useState } from "react";
import { aiApi, reportApi, type Message, type Report } from "@/lib/api";
import { Loader2, Send, FileDown, Trash2, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dossier/$code")({
  head: () => ({
    meta: [
      { title: "Mon dossier — Refuge" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DossierPage,
});

function DossierPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function reload() {
    try {
      const r = await reportApi.get(code);
      setReport(r.report);
      setMessages(r.messages);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, [code]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }); }, [messages.length]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    setMessages((m) => [...m, { id: "tmp", role: "user", content: text, created_at: new Date().toISOString() }]);
    try {
      const r = await aiApi.send(code, text);
      setMessages((m) => [...m.filter(x => x.id !== "tmp"), 
        { id: crypto.randomUUID(), role: "user", content: text, created_at: new Date().toISOString() },
        { id: crypto.randomUUID(), role: "assistant", content: r.reply, created_at: new Date().toISOString() }
      ]);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
      setMessages((m) => m.filter(x => x.id !== "tmp"));
    } finally {
      setSending(false);
    }
  }

  async function generateReport() {
    if (!report) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const html = buildReportHtml(report, messages);
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }

  async function deleteReport() {
    if (!confirm("Supprimer définitivement ce dossier ? Cette action est irréversible.")) return;
    try {
      await reportApi.remove(code);
      toast.success("Dossier supprimé");
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!report) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-stone-warm/20">
        <div className="container-narrow py-10 grid lg:grid-cols-3 gap-8">
          {/* Sidebar dossier */}
          <aside className="lg:col-span-1 space-y-5">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold flex items-center gap-2">
                <KeyRound className="size-3.5" /> Code du dossier
              </div>
              <div className="font-mono text-lg font-bold text-stone-deep mt-2 tracking-wider">{code}</div>
              <div className="mt-4 text-xs text-muted-foreground inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-sage" /> Conservé localement, chiffré côté serveur.
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="font-serif font-bold text-stone-deep">Synthèse</div>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Type">{report.harassment_type ?? "—"}</Row>
                <Row label="Date">{report.incident_date ?? "—"}</Row>
                <Row label="Lieu">{report.location ?? "—"}</Row>
                <Row label="Intention">{report.action_level ?? "—"}</Row>
                <Row label="Statut">{report.status}</Row>
              </dl>
              <div className="mt-5">
                <div className="text-xs text-muted-foreground mb-1.5">Niveau de structuration</div>
                <div className="h-2 rounded-full bg-stone-warm overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${report.structuration_score}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{report.structuration_score}/100</div>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={generateReport} className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md font-semibold hover:bg-river-deep shadow-soft">
                <FileDown className="size-4" /> Générer mon rapport (PDF)
              </button>
              <button onClick={deleteReport} className="w-full inline-flex items-center justify-center gap-2 text-destructive border border-destructive/30 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-destructive/5">
                <Trash2 className="size-4" /> Supprimer mon dossier
              </button>
            </div>

            <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-stone-deep">
              ← Quitter (votre dossier reste en sécurité)
            </Link>
          </aside>

          {/* Chat IA */}
          <section className="lg:col-span-2 bg-card border border-border rounded-xl flex flex-col h-[calc(100vh-12rem)] min-h-[600px]">
            <header className="px-6 py-4 border-b border-border flex items-center gap-3">
              <div className="size-9 rounded-full bg-accent text-primary grid place-items-center font-serif font-bold">É</div>
              <div>
                <div className="font-semibold text-stone-deep">Écho</div>
                <div className="text-xs text-muted-foreground">Assistant d'écoute · ne juge pas, n'accuse pas</div>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="bg-stone-warm/60 rounded-lg p-4 text-stone-deep text-sm leading-relaxed">
                  Bonjour. Je suis là pour vous écouter et vous aider à mettre des mots sur ce que vous traversez.
                  Prenez le temps qu'il vous faut. Quand vous voulez, dites-moi avec vos propres mots ce qui vous amène ici.
                </div>
              )}
              {messages.filter(m => m.role !== "system").map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div className={`max-w-[85%] rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary/10 border border-primary/20 text-stone-deep"
                      : "bg-stone-warm/60 text-stone-deep"
                  }`}>{m.content}</div>
                </div>
              ))}
              {sending && (
                <div className="bg-stone-warm/60 rounded-lg p-4 text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" /> Écho réfléchit…
                </div>
              )}
            </div>

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={2}
                  placeholder="Écrivez à Écho…"
                  className="flex-1 p-3 rounded-lg border border-input bg-background text-stone-deep resize-none text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button onClick={send} disabled={sending || !input.trim()} className="bg-primary text-primary-foreground px-4 rounded-md hover:bg-river-deep disabled:opacity-50">
                  <Send className="size-4" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Écho est un assistant d'écoute. Il ne remplace ni un médecin, ni un avocat, ni la police.
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-stone-deep font-medium text-right">{children}</dd>
    </div>
  );
}

function buildReportHtml(report: Report, messages: Message[]): string {
  const esc = (s: string | null | undefined) =>
    String(s ?? "—").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const exchanges = messages
    .filter(m => m.role !== "system")
    .map(m => `<div class="msg ${m.role}"><strong>${m.role === "user" ? "Témoignage" : "Écho (assistant)"}</strong><p>${esc(m.content)}</p></div>`)
    .join("");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Rapport de signalement — ${report.recovery_code}</title>
<style>
  @page { size: A4; margin: 22mm 18mm; }
  body { font-family: Georgia, serif; color: #2a2a2a; line-height: 1.55; max-width: 720px; margin: 0 auto; }
  h1 { font-size: 24px; border-bottom: 2px solid #4A5E61; padding-bottom: 8px; }
  h2 { font-size: 16px; margin-top: 24px; color: #4A5E61; text-transform: uppercase; letter-spacing: 0.1em; }
  .meta { background: #f5f1ea; padding: 14px 18px; border-radius: 6px; font-size: 13px; }
  .meta div { margin: 4px 0; }
  .desc { white-space: pre-wrap; background: #fafaf7; padding: 14px; border-left: 3px solid #4A5E61; }
  .msg { margin: 14px 0; padding: 10px 14px; border-radius: 6px; }
  .msg.user { background: #eef2f3; }
  .msg.assistant { background: #f5f1ea; }
  .msg p { white-space: pre-wrap; margin: 6px 0 0; font-size: 13px; }
  .footer { margin-top: 40px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
</style></head><body>
<h1>Rapport de signalement</h1>
<div class="meta">
  <div><strong>Code dossier :</strong> ${esc(report.recovery_code)}</div>
  <div><strong>Émis le :</strong> ${date}</div>
  <div><strong>Type :</strong> ${esc(report.harassment_type)}</div>
  <div><strong>Date des faits :</strong> ${esc(report.incident_date)}</div>
  <div><strong>Lieu :</strong> ${esc(report.location)}</div>
  <div><strong>Personne mise en cause :</strong> ${esc(report.aggressor_info)} <em>(non publié)</em></div>
  <div><strong>Niveau de structuration :</strong> ${report.structuration_score}/100</div>
</div>
<h2>Description initiale</h2>
<div class="desc">${esc(report.description)}</div>
${exchanges ? `<h2>Échanges avec l'assistant d'écoute</h2>${exchanges}` : ""}
<div class="footer">
  Document confidentiel généré par la plateforme Refuge. Aucune information n'est publique.
  Ce rapport peut être présenté à un avocat, un médecin, une association ou les autorités à votre seule initiative.
  Cette plateforme ne se substitue pas aux autorités compétentes.
</div></body></html>`;
}
