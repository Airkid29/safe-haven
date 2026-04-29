import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useState } from "react";
import { KeyRound, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { reportApi } from "@/lib/api";

export const Route = createFileRoute("/recuperer")({
  head: () => ({
    meta: [
      { title: "Retrouver mon dossier — Refuge" },
      { name: "description", content: "Retrouver votre dossier de signalement avec votre code unique." },
    ],
  }),
  component: RecuperPage,
});

function RecuperPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    setLoading(true);
    try {
      await reportApi.get(c);
      navigate({ to: "/dossier/$code", params: { code: c } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-stone-warm/20">
        <div className="container-prose py-16">
          <div className="bg-card border border-border rounded-2xl p-10 shadow-soft">
            <div className="size-12 rounded-full bg-accent text-primary grid place-items-center mb-5">
              <KeyRound className="size-6" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-deep">Retrouver mon dossier</h1>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Saisissez le code unique qui vous a été remis lors de votre premier signalement.
              Il est de la forme <code className="font-mono text-stone-deep">XXXX-XXXX-XXXX</code>.
            </p>
            <form onSubmit={submit} className="mt-8">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
                className="w-full p-4 text-center font-mono text-xl tracking-[0.2em] rounded-lg border border-input bg-background text-stone-deep uppercase focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || code.length < 8}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-md font-semibold hover:bg-river-deep disabled:opacity-50 shadow-soft"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <>Accéder à mon dossier <ArrowRight className="size-4" /></>}
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
              Vous avez perdu votre code ? Pour des raisons de sécurité, il n'est pas récupérable.
              Vous pouvez <Link to="/signaler" className="text-primary font-medium hover:underline">commencer un nouveau dossier</Link>.
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
