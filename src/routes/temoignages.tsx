import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight, HeartHandshake, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/temoignages")({
  head: () => ({
    meta: [
      { title: "Témoignages & conseils — Refuge" },
      { name: "description", content: "Retours d'expérience anonymisés et conseils concrets pour surmonter les épreuves liées au harcèlement." },
    ],
  }),
  component: TestimonialsPage,
});

const TESTIMONIALS = [
  {
    title: "J'ai repris le contrôle étape par étape",
    context: "Harcèlement moral au travail, isolement progressif.",
    whatHelped: [
      "Noter les faits avec dates précises, même quand je doutais.",
      "Choisir un proche référent pour relire mes notes.",
      "Bloquer un créneau hebdomadaire pour mon dossier.",
    ],
    advice: "N'attendez pas d'avoir un dossier parfait. Commencez par des traces simples, puis structurez.",
  },
  {
    title: "Sortir du silence m'a soulagée",
    context: "Cyberharcèlement avec menaces répétées.",
    whatHelped: [
      "Capturer les preuves (captures, URL, pseudonymes).",
      "Désactiver les notifications pour limiter la charge mentale.",
      "Faire accompagner la plainte par une association.",
    ],
    advice: "Protégez d'abord votre sécurité psychologique, puis avancez sur les démarches avec aide.",
  },
  {
    title: "J'ai osé demander de l'aide juridique",
    context: "Violences verbales et pressions dans le cadre scolaire.",
    whatHelped: [
      "Prendre rendez-vous avec une structure d'écoute locale.",
      "Clarifier mon objectif: être protégé, pas convaincre tout le monde.",
      "Préparer une chronologie avant chaque entretien.",
    ],
    advice: "Une chronologie claire vaut mieux qu'un récit confus. Gardez vos documents centralisés.",
  },
];

function TestimonialsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-stone-warm/40 border-b border-border">
          <div className="container-narrow py-14">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Paroles anonymisées</div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-stone-deep mt-3 text-balance">
              Témoignages et conseils pour avancer.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              Ces retours sont rédigés et anonymisés pour partager des stratégies utiles.
              Chaque parcours est différent, mais vous pouvez y piocher des repères concrets.
            </p>
          </div>
        </section>

        <section className="container-narrow py-10 space-y-5">
          {TESTIMONIALS.map((t) => (
            <article key={t.title} className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-serif text-2xl font-bold text-stone-deep">{t.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 inline-flex items-center gap-2">
                <HeartHandshake className="size-4 text-primary" /> {t.context}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-stone-deep">
                {t.whatHelped.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-sage shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg bg-accent/40 border border-accent px-4 py-3 text-sm text-stone-deep inline-flex items-start gap-2">
                <Lightbulb className="size-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Conseil :</strong> {t.advice}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="container-narrow pb-14">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-serif text-2xl font-bold text-stone-deep">Besoin d'un accompagnement maintenant ?</h3>
            <p className="text-muted-foreground mt-2">
              Vous pouvez démarrer un signalement anonyme ou consulter l'annuaire de spécialistes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/signaler" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md font-semibold hover:bg-river-deep">
                Commencer un signalement <ArrowRight className="size-4" />
              </Link>
              <Link to="/annuaire" className="inline-flex items-center gap-2 border border-border bg-background text-stone-deep px-5 py-3 rounded-md font-semibold hover:bg-stone-warm">
                Ouvrir l'annuaire
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
