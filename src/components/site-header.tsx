import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "./auth-provider";

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="container-narrow flex items-center justify-between h-16 gap-4">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
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
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-deep">
          <Link to="/comment-ca-marche" className="hover:text-primary transition-colors">Comment ça marche</Link>
          <Link to="/temoignages" className="hover:text-primary transition-colors">Témoignages</Link>
          <Link to="/annuaire" className="hover:text-primary transition-colors">Annuaire</Link>
          <Link to="/securite" className="hover:text-primary transition-colors">Sécurité</Link>
          <Link to="/recuperer" className="hover:text-primary transition-colors">Mon code</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-border bg-background text-stone-deep hover:bg-stone-warm">
                  <LayoutDashboard className="size-4" /> Admin
                </Link>
              )}
              <Link to="/mes-dossiers" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-stone-deep hover:bg-stone-warm">
                <UserIcon className="size-4" /> Mes dossiers
              </Link>
              <button
                onClick={() => { signOut(); navigate({ to: "/" }); }}
                aria-label="Se déconnecter"
                className="size-9 grid place-items-center rounded-md border border-border bg-background text-stone-deep hover:bg-stone-warm"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link to="/connexion" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-stone-deep hover:bg-stone-warm">
              Connexion
            </Link>
          )}
          <Link
            to="/signaler"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-river-deep transition-colors shadow-soft"
          >
            Signaler
          </Link>
        </div>
      </div>
    </header>
  );
}
