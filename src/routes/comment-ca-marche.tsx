import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — Refuge" },
      { name: "description", content: "Le parcours étape par étape : signalement, accompagnement par l'IA Écho, génération de dossier, mise en relation." },
    ],
  }),
  component: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-16">
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Le parcours</div>
          <h1 className="font-serif text-4xl font-bold mt-3 text-stone-deep text-balance">Comment ça marche, étape par étape.</h1>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            La plateforme a été pensée pour être traversée à votre rythme. Aucune étape n'est obligatoire,
            tout est révocable, et rien n'est jamais publié sans votre accord explicite.
          </p>
          {[
            { n: "1", t: "Vous arrivez, anonymement", d: "Pas d'inscription. Pas de cookie de tracking. Vous cliquez sur « Signaler » et vous arrivez directement sur le formulaire." },
            { n: "2", t: "Vous décrivez la situation", d: "Type de harcèlement, récit libre, contexte (date, lieu). Tout est facultatif. Vous pouvez fermer la fenêtre à tout moment." },
            { n: "3", t: "Vous recevez votre code unique", d: "Un code de la forme XXXX-XXXX-XXXX vous est remis. C'est le seul moyen de retrouver votre dossier. Conservez-le précieusement." },
            { n: "4", t: "Écho vous accompagne", d: "L'assistant d'écoute reformule, pose les bonnes questions, et vous aide à structurer votre récit." },
            { n: "5", t: "Vous générez votre rapport", d: "Un document PDF clair, structuré, exploitable pour des démarches juridiques ou médicales." },
            { n: "6", t: "Vous décidez de la suite", d: "Témoigner uniquement, contacter un spécialiste, déposer plainte. Vous restez aux commandes." },
          ].map((s) => (
            <div key={s.n} className="mt-8 flex gap-5">
              <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-serif font-bold shrink-0">{s.n}</div>
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-deep">{s.t}</h2>
                <p className="text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
          <div className="mt-12 pt-8 border-t border-border">
            <Link to="/signaler" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-river-deep shadow-soft">
              Commencer un signalement <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  ),
});
