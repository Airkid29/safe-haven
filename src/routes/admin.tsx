import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2, ShieldCheck, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Refuge" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

interface Specialist {
  id: string; name: string; type: string; country: string; city: string | null;
  phone: string | null; email: string | null; website: string | null;
  description: string | null; is_published: boolean; is_verified: boolean;
  is_free: boolean; is_24_7: boolean;
}

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Specialist[]>([]);
  const [stats, setStats] = useState<{ month: string; total: number; harassment_type: string; status: string }[]>([]);
  const [editing, setEditing] = useState<Partial<Specialist> | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/connexion" }); return; }
    if (!isAdmin) { return; }
    reload();
  }, [user, isAdmin, loading, navigate]);

  async function reload() {
    const [{ data: list }, { data: st }] = await Promise.all([
      supabase.from("specialists").select("*").order("country").order("name"),
      supabase.rpc("get_admin_stats"),
    ]);
    setItems((list ?? []) as Specialist[]);
    setStats((st ?? []) as { month: string; total: number; harassment_type: string; status: string }[]);
  }

  async function save(s: Partial<Specialist>) {
    try {
      if (s.id) {
        const { id, ...rest } = s;
        const { error } = await supabase.from("specialists").update(rest as never).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("specialists").insert([s as never]);
        if (error) throw error;
      }
      toast.success("Enregistré");
      setEditing(null);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette structure ?")) return;
    const { error } = await supabase.from("specialists").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Supprimé"); reload(); }
  }

  async function togglePublish(s: Specialist) {
    await supabase.from("specialists").update({ is_published: !s.is_published }).eq("id", s.id);
    reload();
  }

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 bg-stone-warm/20">
          <div className="container-prose py-14">
            <div className="bg-card border border-border rounded-xl p-7">
              <h1 className="font-serif text-3xl font-bold text-stone-deep">Accès administrateur requis</h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Votre compte est bien connecté, mais n'a pas encore le rôle <code>admin</code>.
                Demandez à un administrateur existant d'activer votre accès.
              </p>
              <div className="mt-6">
                <div className="text-sm font-semibold text-stone-deep">Commande SQL à exécuter dans Supabase SQL Editor :</div>
                <pre className="mt-2 rounded-lg border border-border bg-background p-4 text-xs overflow-x-auto text-stone-deep">
{`insert into public.user_roles (user_id, role)
values ('VOTRE_USER_ID', 'admin')
on conflict (user_id, role) do nothing;`}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  Vous trouverez votre user id dans Supabase &gt; Authentication &gt; Users.
                </p>
              </div>
              <div className="mt-6">
                <Link to="/" className="text-sm text-primary hover:underline">Retour à l'accueil</Link>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const totalReports = stats.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-stone-warm/20">
        <div className="container-narrow py-10">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Tableau de bord</div>
              <h1 className="font-serif text-3xl font-bold text-stone-deep mt-1">Administration</h1>
            </div>
            <button onClick={() => setEditing({ type: "association", country: "TG", is_published: true, is_free: true, is_24_7: false, is_verified: false })}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md font-semibold hover:bg-river-deep">
              <Plus className="size-4" /> Nouvelle structure
            </button>
          </div>

          {/* Stats anonymisées */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <StatCard label="Signalements (total)" value={totalReports} />
            <StatCard label="Structures publiées" value={items.filter(i => i.is_published).length} />
            <StatCard label="Pays couverts" value={new Set(items.map(i => i.country)).size} />
          </div>

          <div className="mt-6 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-stone-deep font-semibold">
              <BarChart3 className="size-4 text-primary" /> Répartition (anonymisée)
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              {Object.entries(stats.reduce<Record<string, number>>((acc, s) => {
                const k = s.harassment_type ?? "non précisé"; acc[k] = (acc[k] ?? 0) + s.total; return acc;
              }, {})).sort(([, a], [, b]) => b - a).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <div className="w-32 text-stone-deep">{k}</div>
                  <div className="flex-1 h-2 rounded bg-stone-warm overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.max(4, (v / Math.max(1, totalReports)) * 100)}%` }} />
                  </div>
                  <div className="w-10 text-right text-muted-foreground tabular-nums">{v}</div>
                </div>
              ))}
              {stats.length === 0 && <p className="text-muted-foreground">Aucune donnée pour le moment.</p>}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              <ShieldCheck className="size-3 inline mr-1 text-sage" />
              Les administrateurs n'ont jamais accès au contenu des dossiers individuels.
            </p>
          </div>

          {/* Liste annuaire */}
          <div className="mt-10">
            <h2 className="font-serif text-xl font-bold text-stone-deep mb-3">Annuaire — {items.length} structures</h2>
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {items.map((s) => (
                <div key={s.id} className="p-4 flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold text-stone-deep">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.country} · {s.type} {s.city ? `· ${s.city}` : ""}</div>
                  </div>
                  <button onClick={() => togglePublish(s)} className={`text-xs px-2 py-1 rounded ${s.is_published ? "bg-sage/20 text-sage" : "bg-stone-warm text-muted-foreground"}`}>
                    {s.is_published ? "Publié" : "Caché"}
                  </button>
                  <button title="Modifier la structure" onClick={() => setEditing(s)} className="size-8 grid place-items-center rounded border border-border hover:bg-stone-warm"><Pencil className="size-3.5" /></button>
                  <button title="Supprimer la structure" onClick={() => remove(s.id)} className="size-8 grid place-items-center rounded border border-destructive/30 text-destructive hover:bg-destructive/5"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-stone-deep">← Retour au site</Link>
          </div>
        </div>
      </main>

      {editing && <EditDialog initial={editing} onClose={() => setEditing(null)} onSave={save} />}
      <SiteFooter />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-serif text-3xl font-bold text-stone-deep mt-2">{value}</div>
    </div>
  );
}

function EditDialog({ initial, onClose, onSave }: { initial: Partial<Specialist>; onClose: () => void; onSave: (s: Partial<Specialist>) => void }) {
  const [s, setS] = useState<Partial<Specialist>>(initial);
  function set<K extends keyof Specialist>(k: K, v: Specialist[K]) { setS((p) => ({ ...p, [k]: v })); }
  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-xl font-bold text-stone-deep">{s.id ? "Modifier" : "Ajouter"}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Input label="Nom" value={s.name ?? ""} onChange={(v) => set("name", v)} full />
          <Select label="Type" value={s.type ?? ""} onChange={(v) => set("type", v)} options={["helpline","association","authority","legal","health","shelter"]} />
          <Select label="Pays" value={s.country ?? ""} onChange={(v) => set("country", v)} options={["TG","CI","BJ","SN","BF","ML","GH","NE","INT"]} />
          <Input label="Ville" value={s.city ?? ""} onChange={(v) => set("city", v)} />
          <Input label="Téléphone" value={s.phone ?? ""} onChange={(v) => set("phone", v)} />
          <Input label="Email" value={s.email ?? ""} onChange={(v) => set("email", v)} />
          <Input label="Site web" value={s.website ?? ""} onChange={(v) => set("website", v)} full />
          <div className="col-span-2">
            <label htmlFor="specialist-description" className="text-xs font-medium text-stone-deep">Description</label>
            <textarea id="specialist-description" value={s.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3}
              className="mt-1 w-full p-2 rounded border border-input bg-background" />
          </div>
          <Check label="Publié" v={!!s.is_published} on={(v) => set("is_published", v)} />
          <Check label="Vérifié" v={!!s.is_verified} on={(v) => set("is_verified", v)} />
          <Check label="Gratuit" v={!!s.is_free} on={(v) => set("is_free", v)} />
          <Check label="24h/24" v={!!s.is_24_7} on={(v) => set("is_24_7", v)} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded border border-border">Annuler</button>
          <button onClick={() => onSave(s)} className="px-4 py-2 text-sm font-semibold rounded bg-primary text-primary-foreground hover:bg-river-deep">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, full }: { label: string; value: string; onChange: (v: string) => void; full?: boolean }) {
  const inputId = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className={full ? "col-span-2" : ""}>
      <label htmlFor={inputId} className="text-xs font-medium text-stone-deep">{label}</label>
      <input id={inputId} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full p-2 rounded border border-input bg-background" />
    </div>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const selectId = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <label htmlFor={selectId} className="text-xs font-medium text-stone-deep">{label}</label>
      <select id={selectId} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full p-2 rounded border border-input bg-background">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Check({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-stone-deep">
      <input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} /> {label}
    </label>
  );
}
