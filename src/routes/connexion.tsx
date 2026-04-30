import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/connexion")({
  head: () => ({ meta: [{ title: "Connexion — Refuge" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/mes-dossiers` },
        });
        if (error) throw error;
        toast.success("Compte créé. Vérifiez votre email pour confirmer.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/mes-dossiers" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/mes-dossiers` });
    if (r.error) toast.error(r.error.message ?? "Erreur Google");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-stone-warm/20">
        <div className="container-prose py-16">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-soft">
            <div className="size-11 rounded-full bg-accent text-primary grid place-items-center mb-5">
              <ShieldCheck className="size-5" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-stone-deep">
              {mode === "login" ? "Se connecter" : "Créer un compte"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Optionnel. Un compte vous permet de retrouver vos dossiers sans avoir à conserver chaque code.
              Vos signalements restent confidentiels.
            </p>

            <button onClick={google} className="mt-6 w-full inline-flex items-center justify-center gap-2 border border-border bg-background text-stone-deep px-4 py-3 rounded-md text-sm font-semibold hover:bg-stone-warm">
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.32A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.04l3.02-2.32z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .95 4.96L3.97 7.28C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
              Continuer avec Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" /> ou <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-deep">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full p-3 rounded-lg border border-input bg-background text-stone-deep" />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-deep">Mot de passe</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full p-3 rounded-lg border border-input bg-background text-stone-deep" />
                {mode === "signup" && <p className="text-xs text-muted-foreground mt-1">8 caractères minimum.</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md font-semibold hover:bg-river-deep disabled:opacity-50">
                {loading && <Loader2 className="size-4 animate-spin" />}
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
              </button>
            </form>

            <div className="mt-5 text-sm text-muted-foreground text-center">
              {mode === "login" ? (
                <>Pas encore de compte ? <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Créer un compte</button></>
              ) : (
                <>Déjà inscrit·e ? <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Se connecter</button></>
              )}
            </div>
            <div className="mt-3 text-center">
              <Link to="/" className="text-xs text-muted-foreground hover:text-stone-deep">← Continuer sans compte</Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
