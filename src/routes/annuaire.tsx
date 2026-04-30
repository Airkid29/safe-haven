import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Globe, MapPin, Clock, ShieldCheck, Search, Mail } from "lucide-react";
import { toast } from "sonner";

interface Specialist {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  is_free: boolean;
  is_24_7: boolean;
  is_verified: boolean;
}

const FALLBACK_TOGO_SPECIALISTS: Specialist[] = [
  {
    id: "fallback-gf2d",
    name: "GF2D (Groupe de réflexion et d'action Femme, Démocratie et Développement)",
    type: "helpline",
    country: "TG",
    city: "Lomé",
    phone: "+228 93 96 89 89 / +228 22 61 49 25",
    email: null,
    website: null,
    description: "WhatsApp disponible. Violences domestiques, sexuelles, soutien psychologique. Lun-Ven (8h-17h30). Gratuit et confidentiel.",
    is_free: true,
    is_24_7: false,
    is_verified: true,
  },
  {
    id: "fallback-rapaa",
    name: "RAPAA (Recherche Action Prévention Accompagnement des Addictions)",
    type: "helpline",
    country: "TG",
    city: null,
    phone: "+228 90 70 50 82 / +228 99 40 71 13",
    email: null,
    website: null,
    description: "Ecoute psychologique (trauma, addictions). Lun-Sam. Gratuit.",
    is_free: true,
    is_24_7: false,
    is_verified: true,
  },
  {
    id: "fallback-smvm",
    name: "SMVM (Santé Meilleure Vie Meilleure)",
    type: "health",
    country: "TG",
    city: "Lomé",
    phone: "+228 90 47 44 95",
    email: null,
    website: null,
    description: "Prise en charge des victimes de violences sexuelles.",
    is_free: true,
    is_24_7: false,
    is_verified: true,
  },
  {
    id: "fallback-asvitto",
    name: "ASVITTO (Association des Victimes de la Torture au Togo)",
    type: "association",
    country: "TG",
    city: null,
    phone: "+228 99 67 81 30",
    email: null,
    website: null,
    description: "Victimes de torture, violences institutionnelles, assistance juridique et accompagnement.",
    is_free: true,
    is_24_7: false,
    is_verified: true,
  },
  {
    id: "fallback-cacit",
    name: "CACIT (Collectif des Associations Contre l'Impunité au Togo)",
    type: "legal",
    country: "TG",
    city: null,
    phone: "+228 22 21 70 29",
    email: null,
    website: null,
    description: "Assistance juridique, judiciaire, psychologique. Pont important vers la justice.",
    is_free: true,
    is_24_7: false,
    is_verified: true,
  },
  {
    id: "fallback-police",
    name: "Police nationale — Urgences",
    type: "authority",
    country: "TG",
    city: null,
    phone: "117",
    email: null,
    website: null,
    description: "Numéro d'urgence national.",
    is_free: true,
    is_24_7: true,
    is_verified: true,
  },
];

const COUNTRIES: Record<string, string> = {
  TG: "🇹🇬 Togo", CI: "🇨🇮 Côte d'Ivoire", BJ: "🇧🇯 Bénin",
  SN: "🇸🇳 Sénégal", BF: "🇧🇫 Burkina Faso", ML: "🇲🇱 Mali",
  GH: "🇬🇭 Ghana", NE: "🇳🇪 Niger", INT: "🌍 International",
};

const TYPES: Record<string, string> = {
  helpline: "Ligne d'écoute", association: "Association",
  authority: "Autorité", legal: "Aide juridique",
  health: "Santé", shelter: "Refuge",
};

export const Route = createFileRoute("/annuaire")({
  head: () => ({
    meta: [
      { title: "Annuaire des spécialistes — Refuge" },
      { name: "description", content: "Annuaire vérifié d'associations, lignes d'écoute et autorités au Togo et en Afrique de l'Ouest pour victimes de harcèlement et de violences." },
      { property: "og:title", content: "Annuaire des spécialistes — Refuge" },
      { property: "og:description", content: "Trouvez de l'aide près de chez vous : associations, numéros verts, autorités." },
    ],
  }),
  component: DirectoryPage,
});

function DirectoryPage() {
  const [items, setItems] = useState<Specialist[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [country, setCountry] = useState<string>("ALL");
  const [type, setType] = useState<string>("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("specialists").select("*")
      .eq("is_published", true)
      .order("country").order("type")
      .then(({ data, error }) => {
        if (error) {
          setItems(FALLBACK_TOGO_SPECIALISTS);
          setIsFallback(true);
          toast.error("Annuaire indisponible temporairement. Affichage d'une version de secours.");
          return;
        }
        const rows = (data ?? []) as Specialist[];
        if (rows.length === 0) {
          setItems(FALLBACK_TOGO_SPECIALISTS);
          setIsFallback(true);
          return;
        }
        setItems(rows);
        setIsFallback(false);
      });
  }, []);

  const filtered = useMemo(() => items.filter((s) =>
    (country === "ALL" || s.country === country) &&
    (type === "ALL" || s.type === type) &&
    (!q || s.name.toLowerCase().includes(q.toLowerCase()) || (s.description ?? "").toLowerCase().includes(q.toLowerCase()))
  ), [items, country, type, q]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-stone-warm/40 border-b border-border">
          <div className="container-narrow py-14">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Annuaire vérifié</div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-stone-deep mt-3 text-balance">
              Trouvez de l'aide près de chez vous.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              Lignes d'écoute, associations, autorités, juristes — sélectionnés pour le Togo et l'Afrique de l'Ouest.
              Toutes les structures listées sont gratuites ou à coût symbolique.
            </p>
          </div>
        </section>

        <div className="container-narrow py-10">
          {isFallback && (
            <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-stone-deep">
              L'annuaire principal est vide pour le moment. Une liste de structures essentielles (Togo) est affichee en attendant.
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-3 mb-8">
            <div className="md:col-span-1 relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-background text-stone-deep" />
            </div>
            <select title="Filtrer par pays" value={country} onChange={(e) => setCountry(e.target.value)} className="px-3 py-2.5 rounded-lg border border-input bg-background text-stone-deep">
              <option value="ALL">Tous les pays</option>
              {Object.entries(COUNTRIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select title="Filtrer par type" value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2.5 rounded-lg border border-input bg-background text-stone-deep">
              <option value="ALL">Tous les types</option>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div className="text-sm text-muted-foreground mb-4">{filtered.length} structure{filtered.length > 1 ? "s" : ""}</div>

          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((s) => (
              <article key={s.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-soft transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-accent text-primary font-medium">{TYPES[s.type] ?? s.type}</span>
                      <span className="text-xs text-muted-foreground">{COUNTRIES[s.country] ?? s.country}</span>
                      {s.is_verified && <span className="inline-flex items-center gap-1 text-xs text-sage"><ShieldCheck className="size-3" /> vérifié</span>}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-deep mt-2 leading-snug">{s.name}</h3>
                  </div>
                </div>
                {s.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.description}</p>}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  {s.phone && <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"><Phone className="size-3.5" /> {s.phone}</a>}
                  {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-stone-deep hover:text-primary"><Globe className="size-3.5" /> Site</a>}
                  {s.email && <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 text-stone-deep hover:text-primary"><Mail className="size-3.5" /> Email</a>}
                  {s.city && <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="size-3.5" /> {s.city}</span>}
                  {s.is_24_7 && <span className="inline-flex items-center gap-1 text-sage"><Clock className="size-3.5" /> 24h/24</span>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
