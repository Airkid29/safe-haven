import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-stone-warm/30 mt-24">
      <div className="container-narrow py-12 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-serif text-xl font-bold text-stone-deep">Refuge</div>
          <p className="text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">
            Plateforme indépendante d'aide aux victimes de harcèlement, dédiée au Togo
            et à l'Afrique de l'Ouest. Anonymat garanti, données chiffrées,
            aucun signalement public.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground bg-background border border-border rounded-full px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-sage" /> En cas de danger immédiat au Togo, appelez le <strong className="text-stone-deep ml-1">117</strong> (police) ou le <strong className="text-stone-deep">1014</strong>.
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">Plateforme</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-deep">
            <li><Link to="/comment-ca-marche" className="hover:text-primary">Comment ça marche</Link></li>
            <li><Link to="/annuaire" className="hover:text-primary">Annuaire des spécialistes</Link></li>
            <li><Link to="/securite" className="hover:text-primary">Sécurité & anonymat</Link></li>
            <li><Link to="/recuperer" className="hover:text-primary">Retrouver mon dossier</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">Urgences (Togo)</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-deep">
            <li><span className="text-muted-foreground">Police :</span> <strong>117</strong></li>
            <li><span className="text-muted-foreground">Gendarmerie :</span> <strong>172</strong></li>
            <li><span className="text-muted-foreground">1014</span> — Violences sexuelles</li>
            <li><span className="text-muted-foreground">1011</span> — Enfants en danger</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-narrow py-5 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Refuge — Plateforme à but non lucratif</span>
          <span>Données chiffrées · RGPD</span>
        </div>
      </div>
    </footer>
  );
}
