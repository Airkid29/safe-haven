import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Lock, ShieldCheck, KeyRound, Trash2, Eye, Server } from "lucide-react";

export const Route = createFileRoute("/securite")({
  head: () => ({
    meta: [
      { title: "Sécurité & anonymat — Refuge" },
      { name: "description", content: "Chiffrement, anonymat, hébergement européen, droit à l'oubli. Notre engagement de sécurité." },
    ],
  }),
  component: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-16">
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Sécurité & anonymat</div>
          <h1 className="font-serif text-4xl font-bold mt-3 text-stone-deep text-balance">Votre voix mérite un coffre-fort.</h1>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Chaque décision technique a été prise pour qu'aucune information ne fuite, jamais.
            Voici concrètement ce que cela signifie.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-5">
            {[
              { icon: <Lock className="size-5" />, t: "Chiffrement bout-en-bout", d: "Vos données sont chiffrées en transit (TLS 1.3) et au repos." },
              { icon: <ShieldCheck className="size-5" />, t: "Anonymat par défaut", d: "Aucune donnée identifiante n'est collectée pour utiliser la plateforme." },
              { icon: <KeyRound className="size-5" />, t: "Code unique non récupérable", d: "Seul vous détenez votre code. Nous ne pouvons pas le retrouver à votre place." },
              { icon: <Trash2 className="size-5" />, t: "Droit à l'oubli", d: "Suppression définitive en un clic, sans justification ni délai." },
              { icon: <Eye className="size-5" />, t: "Aucune publication", d: "Aucun nom, aucune description, aucune information n'est jamais rendue publique." },
              { icon: <Server className="size-5" />, t: "Hébergement européen", d: "Infrastructure conforme au RGPD, hébergée en Europe." },
            ].map((b) => (
              <div key={b.t} className="bg-card border border-border rounded-xl p-6">
                <div className="size-10 rounded-md bg-accent text-primary grid place-items-center">{b.icon}</div>
                <h2 className="font-serif text-lg font-bold text-stone-deep mt-4">{b.t}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-stone-warm/40 border border-border rounded-xl p-6 text-sm text-stone-deep leading-relaxed">
            <strong className="font-serif">Important.</strong> Cette plateforme ne se substitue pas aux autorités compétentes.
            En cas de danger immédiat, composez le <strong>17</strong> (police-secours) ou le <strong>112</strong>.
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  ),
});
