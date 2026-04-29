import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShieldCheck, Lock, MessageCircle, FileText, KeyRound, ArrowRight, Scale, Heart, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Refuge — Plateforme d'aide aux victimes de harcèlement" },
      { name: "description", content: "Signalez en toute confidentialité. Accompagnement par un assistant d'écoute, mise en relation avec des spécialistes, génération d'un dossier. Anonymat garanti, sans création de compte." },
      { property: "og:title", content: "Refuge — Plateforme d'aide aux victimes de harcèlement" },
      { property: "og:description", content: "Une plateforme institutionnelle pour s'exprimer, structurer son témoignage et accéder à de l'aide. Anonymat garanti." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ReassuranceBar />
        <HowItWorks />
        <AISection />
        <Specialists />
        <SecuritySection />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Texture papier subtile */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-stone-warm/40 via-background to-background" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(50 60 80) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="container-narrow pt-20 md:pt-28 pb-20 md:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary font-semibold bg-accent/60 px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-primary" /> Plateforme institutionnelle indépendante
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-black mt-6 leading-[1.05] tracking-tight text-balance text-stone-deep">
              Vous traversez du harcèlement.<br />
              <span className="text-primary">Ici, vous êtes écouté·e.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-xl leading-relaxed">
              Un espace sécurisé pour mettre des mots sur ce que vous vivez,
              constituer un dossier solide, et trouver les bons interlocuteurs —
              sans inscription, sans pression.
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link
                to="/signaler"
                className="group inline-flex items-center gap-2.5 bg-primary text-primary-foreground px-7 py-4 rounded-md text-base font-semibold hover:bg-river-deep transition-colors shadow-elevated"
              >
                Signaler en toute sécurité
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/recuperer"
                className="inline-flex items-center gap-2.5 bg-background border border-border text-stone-deep px-7 py-4 rounded-md text-base font-semibold hover:bg-stone-warm transition-colors"
              >
                <KeyRound className="size-4" />
                J'ai déjà un code
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-sage" /> Anonymat garanti</span>
              <span className="inline-flex items-center gap-1.5"><Lock className="size-4 text-sage" /> Données chiffrées</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-sage" /> Aucune publication publique</span>
            </div>
          </div>

          {/* Carte témoignage / engagement */}
          <div className="lg:col-span-5 lg:pl-6">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-elevated relative overflow-hidden">
              <div className="absolute top-0 right-0 size-40 bg-accent/40 rounded-full blur-3xl -translate-y-12 translate-x-12" />
              <div className="relative">
                <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Notre engagement</div>
                <blockquote className="mt-5 font-serif text-xl text-stone-deep leading-relaxed">
                  « Personne ne devrait avoir à choisir entre se taire et s'exposer.
                  Cette plateforme existe pour vous offrir une troisième voie. »
                </blockquote>
                <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
                  <Pillar icon={<MessageCircle className="size-4" />} text="Un assistant d'écoute, jamais un juge" />
                  <Pillar icon={<FileText className="size-4" />} text="Un dossier structuré, exploitable légalement" />
                  <Pillar icon={<Users className="size-4" />} text="Mise en relation avec des spécialistes" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pillar({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-7 rounded-md bg-accent text-primary grid place-items-center shrink-0 mt-0.5">{icon}</div>
      <span className="text-stone-deep">{text}</span>
    </div>
  );
}

function ReassuranceBar() {
  const items = [
    "Aucun compte requis",
    "Code de récupération unique",
    "Vous gardez le contrôle de vos données",
    "Suppression à tout moment",
  ];
  return (
    <div className="border-y border-border bg-stone-warm/40">
      <div className="container-narrow py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-stone-deep">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="size-1 rounded-full bg-sage" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Vous racontez, à votre rythme",
      desc: "Un formulaire bienveillant, en plusieurs étapes. Rien n'est obligatoire. Vous pouvez fermer la fenêtre et reprendre plus tard avec votre code.",
    },
    {
      n: "02",
      title: "Écho vous accompagne",
      desc: "Un assistant d'écoute reformule, pose les bonnes questions et structure votre récit. Sans jamais juger, ni accuser.",
    },
    {
      n: "03",
      title: "Vous recevez un dossier",
      desc: "Un rapport clair et structuré, exploitable pour des démarches juridiques, médicales ou associatives. Rien n'est partagé sans votre accord.",
    },
    {
      n: "04",
      title: "Vous êtes orienté·e",
      desc: "Vers des avocats spécialisés, psychologues, ou associations de confiance. Vous choisissez. Vous gardez la main.",
    },
  ];
  return (
    <section className="container-narrow py-24">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Le parcours</div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 text-stone-deep text-balance">
          Quatre étapes pensées avec des professionnels de l'écoute.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {steps.map((s) => (
          <div key={s.n} className="bg-card border border-border rounded-xl p-7 hover:border-primary/40 hover:shadow-elevated transition-all duration-300">
            <div className="font-serif text-3xl font-black text-primary/30">{s.n}</div>
            <h3 className="font-serif text-xl font-bold text-stone-deep mt-4">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section className="bg-stone-warm/40 border-y border-border">
      <div className="container-narrow py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">L'assistant Écho</div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 text-stone-deep text-balance">
            Une présence patiente, pas un robot.
          </h2>
          <p className="text-muted-foreground mt-5 leading-relaxed">
            Écho est un assistant d'écoute conçu avec des spécialistes du psychotraumatisme.
            Il ne juge pas, n'affirme rien, ne diagnostique pas. Il vous aide simplement à
            mettre des mots, à structurer ce qui s'est passé, et à comprendre les options
            qui s'offrent à vous.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-stone-deep">
            <Li>Reformulation bienveillante de votre témoignage</Li>
            <Li>Questions guidées pour préciser les faits sans pression</Li>
            <Li>Suggestions concrètes, jamais d'injonction</Li>
            <Li>Rappel constant que vous gardez le contrôle</Li>
          </ul>
        </div>
        <div className="relative">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-elevated">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="size-9 rounded-full bg-accent text-primary grid place-items-center font-serif font-bold">É</div>
              <div>
                <div className="font-semibold text-sm text-stone-deep">Écho</div>
                <div className="text-xs text-muted-foreground">Assistant d'écoute</div>
              </div>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <div className="bg-stone-warm/60 rounded-lg p-4 text-stone-deep leading-relaxed">
                Bonjour. Prenez le temps qu'il vous faut. Vous pouvez commencer
                par me dire, avec vos mots à vous, ce qui vous amène ici aujourd'hui.
              </div>
              <div className="bg-primary/8 border border-primary/15 rounded-lg p-4 text-stone-deep leading-relaxed ml-6">
                Je ne sais pas par où commencer…
              </div>
              <div className="bg-stone-warm/60 rounded-lg p-4 text-stone-deep leading-relaxed">
                C'est très bien de l'avoir écrit. On peut commencer simplement :
                quand est-ce que cela a commencé, à peu près ?
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="size-5 rounded-full bg-accent text-primary grid place-items-center text-xs font-bold mt-0.5 shrink-0">✓</span>
      <span>{children}</span>
    </li>
  );
}

function Specialists() {
  const cats = [
    { icon: <Scale className="size-5" />, title: "Avocats spécialisés", desc: "Conseil juridique, dépôt de plainte, procédure." },
    { icon: <Heart className="size-5" />, title: "Psychologues", desc: "Soutien émotionnel, prise en charge du trauma." },
    { icon: <Users className="size-5" />, title: "Associations", desc: "Accompagnement sur la durée, écoute, médiation." },
  ];
  return (
    <section className="container-narrow py-24">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Réseau de spécialistes</div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 text-stone-deep text-balance">
          Vous n'êtes pas seul·e à porter cela.
        </h2>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          Quand vous l'aurez décidé — et seulement quand vous l'aurez décidé — nous pouvons
          vous orienter vers des professionnels formés à votre situation.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {cats.map((c) => (
          <div key={c.title} className="bg-card border border-border rounded-xl p-7 hover:shadow-elevated transition-shadow">
            <div className="size-11 rounded-md bg-primary text-primary-foreground grid place-items-center">{c.icon}</div>
            <h3 className="font-serif text-xl font-bold text-stone-deep mt-5">{c.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className="bg-stone-deep text-stone-warm">
      <div className="container-narrow py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-sage font-semibold">Notre engagement de sécurité</div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 text-stone-warm text-balance" style={{ color: "oklch(0.95 0.008 85)" }}>
            Votre voix mérite un coffre-fort, pas une vitrine.
          </h2>
          <p className="text-stone-warm/70 mt-5 leading-relaxed max-w-lg">
            Tout est conçu pour qu'aucune information ne fuite. Pas de tracking publicitaire,
            pas de revente de données, pas de divulgation à des tiers.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <SecBox title="Chiffrement bout-en-bout" desc="Vos données sensibles sont chiffrées au repos et en transit." />
          <SecBox title="Anonymat par défaut" desc="Aucune donnée identifiante n'est requise pour utiliser la plateforme." />
          <SecBox title="Code unique" desc="Vous seul·e détenez le code permettant de retrouver votre dossier." />
          <SecBox title="Droit à l'oubli" desc="Suppression définitive sur simple demande, sans justification." />
        </div>
      </div>
    </section>
  );
}

function SecBox({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-stone-deep border border-stone-warm/15 rounded-lg p-5" style={{ background: "oklch(0.27 0.022 80)" }}>
      <div className="font-serif text-base font-bold text-stone-warm" style={{ color: "oklch(0.95 0.008 85)" }}>{title}</div>
      <div className="text-sm text-stone-warm/70 mt-1.5 leading-relaxed">{desc}</div>
    </div>
  );
}

function CtaBanner() {
  return (
    <section className="container-narrow py-24">
      <div className="bg-card border border-border rounded-2xl p-10 md:p-14 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-72 bg-accent/40 rounded-full blur-3xl" />
        <div className="relative max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-deep text-balance">
            Quand vous serez prêt·e — pas avant.
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Il n'y a pas de bon ou de mauvais moment. Vous pouvez commencer par quelques mots,
            sauvegarder votre code, et revenir dans quelques jours, semaines, ou mois.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/signaler" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-md font-semibold hover:bg-river-deep transition-colors shadow-soft">
              Commencer un signalement <ArrowRight className="size-4" />
            </Link>
            <Link to="/recuperer" className="inline-flex items-center gap-2 bg-background border border-border text-stone-deep px-6 py-3.5 rounded-md font-semibold hover:bg-stone-warm transition-colors">
              Reprendre avec mon code
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
