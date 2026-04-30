// Edge function : API publique anonyme pour gérer les signalements via code de récupération.
// Toutes les opérations sensibles passent ici (service role) — RLS reste verrouillé côté DB.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function generateRecoveryCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = new Uint8Array(12);
  crypto.getRandomValues(buf);
  const chars = Array.from(buf, (b) => alphabet[b % alphabet.length]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8, 12).join("")}`;
}

function computeStructurationScore(report: Record<string, unknown>): number {
  let score = 0;
  if (report.harassment_type) score += 20;
  if (typeof report.description === "string" && report.description.length > 80) score += 30;
  if (report.incident_date) score += 15;
  if (report.location) score += 15;
  if (report.aggressor_info) score += 10;
  if (report.action_level) score += 10;
  return Math.min(100, score);
}

async function getUserIdFromAuth(req: Request, supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const authz = req.headers.get("Authorization") ?? "";
  const token = authz.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  // Le token publishable n'a pas d'utilisateur ; getUser distinguera.
  try {
    const { data } = await supabase.auth.getUser(token);
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const body = await req.json();
    const { action } = body;
    const userId = await getUserIdFromAuth(req, supabase);

    if (action === "create") {
      const recovery_code = generateRecoveryCode();
      const { data, error } = await supabase
        .from("reports")
        .insert({ recovery_code, status: "draft", user_id: userId })
        .select("id, recovery_code")
        .single();
      if (error) throw error;
      return Response.json({ ok: true, report: data }, { headers: corsHeaders });
    }

    if (action === "update") {
      const { recovery_code, fields } = body;
      if (!recovery_code) return Response.json({ ok: false, error: "code manquant" }, { status: 400, headers: corsHeaders });

      const allowed = [
        "harassment_type", "description", "incident_date",
        "location", "aggressor_info", "action_level", "status", "ai_summary",
      ];
      const update: Record<string, unknown> = {};
      for (const k of allowed) if (k in fields) update[k] = fields[k];

      const { data: existing } = await supabase
        .from("reports").select("*").eq("recovery_code", recovery_code).maybeSingle();
      if (!existing) return Response.json({ ok: false, error: "introuvable" }, { status: 404, headers: corsHeaders });

      const merged = { ...existing, ...update };
      update.structuration_score = computeStructurationScore(merged);

      const { data, error } = await supabase
        .from("reports").update(update).eq("recovery_code", recovery_code).select().single();
      if (error) throw error;
      return Response.json({ ok: true, report: data }, { headers: corsHeaders });
    }

    if (action === "get") {
      const { recovery_code } = body;
      if (!recovery_code) return Response.json({ ok: false, error: "code manquant" }, { status: 400, headers: corsHeaders });
      const { data: report, error } = await supabase
        .from("reports").select("*").eq("recovery_code", recovery_code).maybeSingle();
      if (error) throw error;
      if (!report) return Response.json({ ok: false, error: "Aucun dossier trouvé pour ce code." }, { status: 404, headers: corsHeaders });

      const { data: messages } = await supabase
        .from("report_messages").select("*").eq("report_id", report.id).order("created_at");
      const { data: evidences } = await supabase
        .from("report_evidences").select("*").eq("report_id", report.id).order("created_at");

      return Response.json({ ok: true, report, messages: messages ?? [], evidences: evidences ?? [] }, { headers: corsHeaders });
    }

    if (action === "submit") {
      const { recovery_code } = body;
      const { data, error } = await supabase
        .from("reports").update({ status: "submitted" }).eq("recovery_code", recovery_code).select().single();
      if (error) throw error;
      return Response.json({ ok: true, report: data }, { headers: corsHeaders });
    }

    if (action === "delete") {
      const { recovery_code } = body;
      const { error } = await supabase.from("reports").delete().eq("recovery_code", recovery_code);
      if (error) throw error;
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    // Lier un dossier (par code) au compte courant
    if (action === "claim") {
      const { recovery_code } = body;
      if (!userId) return Response.json({ ok: false, error: "Vous devez être connecté." }, { status: 401, headers: corsHeaders });
      if (!recovery_code) return Response.json({ ok: false, error: "code manquant" }, { status: 400, headers: corsHeaders });
      const { data, error } = await supabase
        .from("reports").update({ user_id: userId })
        .eq("recovery_code", recovery_code).select().single();
      if (error) throw error;
      return Response.json({ ok: true, report: data }, { headers: corsHeaders });
    }

    // Lister mes dossiers (utilisateur connecté)
    if (action === "list_mine") {
      if (!userId) return Response.json({ ok: false, error: "Vous devez être connecté." }, { status: 401, headers: corsHeaders });
      const { data, error } = await supabase
        .from("reports")
        .select("recovery_code, harassment_type, status, created_at, updated_at, structuration_score")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return Response.json({ ok: true, reports: data ?? [] }, { headers: corsHeaders });
    }

    return Response.json({ ok: false, error: "Action inconnue" }, { status: 400, headers: corsHeaders });
  } catch (e) {
    console.error("[report-api]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" },
      { status: 500, headers: corsHeaders },
    );
  }
});
