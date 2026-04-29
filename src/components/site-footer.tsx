import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-stone-warm/30 mt-24">
      <div className="container-narrow py-12 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-serif text-xl font-bold text-stone-deep">Refuge</div>
          <p className="text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">
            Plateforme indépendante d'aide aux victimes de harcèlement. Anonymat garanti.
            Données chiffrées. Aucun signalement n'est jamais rendu public.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground bg-background border border-border rounded-full px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-sage" /> Cette plateforme ne remplace pas les autorités. En cas de danger immédiat, appelez le <strong className="text-stone-deep">17</strong>.
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">Plateforme</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-deep">
            <li><Link to="/comment-ca-marche" className="hover:text-primary">Comment ça marche</Link></li>
            <li><Link to="/securite" className="hover:text-primary">Sécurité & anonymat</Link></li>
            <li><Link to="/recuperer" className="hover:text-primary">Retrouver mon dossier</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">Urgences</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-deep">
            <li><span className="text-muted-foreground">Police-secours :</span> <strong>17</strong></li>
            <li><span className="text-muted-foreground">3919</span> — Violences femmes</li>
            <li><span className="text-muted-foreground">3018</span> — Cyberharcèlement</li>
            <li><span className="text-muted-foreground">3020</span> — Harcèlement scolaire</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-narrow py-5 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Refuge — Plateforme à but non lucratif</span>
          <span>Données chiffrées · Hébergement européen · RGPD</span>
        </div>
      </div>
    </footer>
  );
}
