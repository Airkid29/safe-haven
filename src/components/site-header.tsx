import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="container-narrow flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-md bg-primary text-primary-foreground grid place-items-center shadow-soft">
            <ShieldCheck className="size-5" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="font-serif font-bold text-stone-deep tracking-tight">Refuge</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">
              Plateforme d'aide
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-deep">
          <Link to="/comment-ca-marche" className="hover:text-primary transition-colors">Comment ça marche</Link>
          <Link to="/securite" className="hover:text-primary transition-colors">Sécurité & anonymat</Link>
          <Link to="/recuperer" className="hover:text-primary transition-colors">Retrouver mon dossier</Link>
        </nav>
        <Link
          to="/signaler"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-river-deep transition-colors shadow-soft"
        >
          Signaler
        </Link>
      </div>
    </header>
  );
}
