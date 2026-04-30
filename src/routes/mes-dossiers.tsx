import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { reportApi, type MyReportListItem } from "@/lib/api";
import { Loader2, FileText, Plus, KeyRound } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mes-dossiers")({
  head: () => ({ meta: [{ title: "Mes dossiers — Refuge" }, { name: "robots", content: "noindex" }] }),
  component: MyReportsPage,
});

function MyReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<MyReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimCode, setClaimCode] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/connexion" }); return; }
    reportApi.listMine()
      .then((r) => setReports(r.reports))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  async function claim() {
    const code = claimCode.trim().toUpperCase();
    if (!code) return;
    try {
      await reportApi.claim(code);
      toast.success("Dossier rattaché à votre compte.");
      setClaimCode("");
      const r = await reportApi.listMine();
      setReports(r.reports);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  if (authLoading || loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-stone-warm/20">
        <div className="container-narrow py-12">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-3xl font-bold text-stone-deep">Mes dossiers</h1>
              <p className="text-muted-foreground mt-1 text-sm">Connecté·e en tant que {user?.email}</p>
            </div>
            <Link to="/signaler" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md font-semibold hover:bg-river-deep">
              <Plus className="size-4" /> Nouveau signalement
            </Link>
          </div>

          <div className="mt-8 bg-card border border-border rounded-xl p-6">
            <div className="text-sm font-semibold text-stone-deep">Rattacher un dossier existant</div>
            <p className="text-xs text-muted-foreground mt-1">Si vous avez déjà un code de récupération, ajoutez-le à votre compte.</p>
            <div className="mt-3 flex gap-2">
              <input value={claimCode} onChange={(e) => setClaimCode(e.target.value)} placeholder="XXXX-XXXX-XXXX"
                className="flex-1 p-3 rounded-lg border border-input bg-background text-stone-deep font-mono" />
              <button onClick={claim} className="px-4 rounded-md bg-stone-deep text-primary-foreground hover:opacity-90">
                <KeyRound className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {reports.length === 0 && (
              <div className="bg-card border border-border rounded-xl p-10 text-center">
                <FileText className="size-8 mx-auto text-muted-foreground" />
                <div className="font-serif text-lg text-stone-deep mt-3">Aucun dossier pour le moment</div>
                <p className="text-sm text-muted-foreground mt-1">Commencez un signalement quand vous serez prêt·e.</p>
              </div>
            )}
            {reports.map((r) => (
              <Link key={r.recovery_code} to="/dossier/$code" params={{ code: r.recovery_code }}
                className="block bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-soft transition-all">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-mono text-sm font-bold text-stone-deep">{r.recovery_code}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {r.harassment_type ?? "non précisé"} · maj {new Date(r.updated_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground">{r.structuration_score}/100</div>
                    <span className="text-xs px-2 py-1 rounded bg-accent text-primary font-medium">{r.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
