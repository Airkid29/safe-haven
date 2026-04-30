// Helper centralisé pour appeler les edge functions de manière typée et sûre.
import { supabase } from "@/integrations/supabase/client";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function call<T = unknown>(fn: string, body: unknown): Promise<T> {
  // Si l'utilisateur est connecté, on envoie son JWT pour que l'edge function l'identifie.
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  let res: Response;
  try {
    res = await fetch(`${FUNCTIONS_URL}/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Impossible de joindre le service. Vérifiez votre connexion.");
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // Certaines erreurs de gateway/route renvoient du texte/HTML.
    data = null;
  }

  if (!res.ok) {
    const msg =
      (typeof data === "object" && data && "error" in data && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : null) ??
      (res.status === 404
        ? `Service "${fn}" introuvable. Vérifiez le déploiement des Edge Functions Supabase.`
        : null) ??
      `Erreur ${res.status}`;
    throw new Error(msg);
  }

  if (typeof data === "object" && data && "ok" in data && (data as { ok?: boolean }).ok === false) {
    const msg =
      "error" in data && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Une erreur est survenue.";
    throw new Error(msg);
  }

  return data as T;
}

export type HarassmentType =
  | "scolaire" | "professionnel" | "sexuel" | "moral"
  | "cyber" | "discriminatoire" | "familial" | "autre";

export type ActionLevel = "temoignage" | "accompagnement" | "dossier";

export interface Report {
  id: string;
  recovery_code: string;
  harassment_type: HarassmentType | null;
  description: string | null;
  incident_date: string | null;
  location: string | null;
  aggressor_info: string | null;
  action_level: ActionLevel | null;
  status: "draft" | "submitted" | "in_progress" | "closed";
  structuration_score: number;
  ai_summary: string | null;
  summary_context?: string | null;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface MyReportListItem {
  recovery_code: string;
  harassment_type: HarassmentType | null;
  status: string;
  created_at: string;
  updated_at: string;
  structuration_score: number;
}

export const reportApi = {
  create: () => call<{ ok: true; report: { id: string; recovery_code: string } }>("report-api", { action: "create" }),
  get: (recovery_code: string) =>
    call<{ ok: true; report: Report; messages: Message[]; evidences: unknown[] }>("report-api", { action: "get", recovery_code }),
  update: (recovery_code: string, fields: Partial<Report>) =>
    call<{ ok: true; report: Report }>("report-api", { action: "update", recovery_code, fields }),
  submit: (recovery_code: string) =>
    call<{ ok: true; report: Report }>("report-api", { action: "submit", recovery_code }),
  remove: (recovery_code: string) =>
    call<{ ok: true }>("report-api", { action: "delete", recovery_code }),
  claim: (recovery_code: string) =>
    call<{ ok: true; report: Report }>("report-api", { action: "claim", recovery_code }),
  listMine: () =>
    call<{ ok: true; reports: MyReportListItem[] }>("report-api", { action: "list_mine" }),
};

export const aiApi = {
  send: (recovery_code: string, user_message: string) =>
    call<{ ok: true; reply: string }>("ai-assistant", { recovery_code, user_message }),
};

export { supabase };
