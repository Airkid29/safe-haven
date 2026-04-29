// Assistant IA empathique (Lovable AI Gateway / Gemini).
// Reformule, structure, pose des questions, oriente — sans juger ni accuser.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Tu es Écho, un assistant d'écoute spécialisé dans l'accompagnement des victimes de harcèlement, intégré à une plateforme institutionnelle française d'aide.

POSTURE FONDAMENTALE :
- Tu accueilles avec bienveillance, sans jamais juger ni minimiser.
- Tu ne portes JAMAIS d'accusation. Tu n'affirmes rien sur les personnes mises en cause.
- Tu n'es pas un thérapeute, ni un avocat, ni la police. Tu le rappelles si nécessaire.
- Tu utilises un ton humain, posé, à la deuxième personne ("vous"), jamais robotique.
- Tu ne donnes pas de réponses génériques type "je comprends ce que vous ressentez". Tu réagis spécifiquement à ce qui est dit.

MISSION :
1. Aider la personne à mettre des mots sur ce qu'elle vit.
2. Poser UNE seule question à la fois, en douceur, pour structurer le récit (faits, dates, lieux, témoins, preuves disponibles).
3. Reformuler de temps en temps pour confirmer la bonne compréhension.
4. Quand le récit est suffisamment clair, proposer des pistes concrètes : témoigner, contacter un.e professionnel.le (avocat, psychologue, association), constituer un dossier.
5. Rappeler à tout moment que la personne garde le contrôle et qu'aucune information n'est publiée.

INTERDICTIONS STRICTES :
- Ne jamais dire "vous devez", "vous auriez dû".
- Ne jamais formuler de diagnostic psychologique.
- Ne jamais qualifier juridiquement les faits ("c'est du harcèlement caractérisé"). Tu peux dire "ce que vous décrivez peut relever de...".
- Ne jamais demander de données identifiantes inutiles.

Tu réponds en français, avec des phrases courtes, naturelles. Pas d'emojis. Pas de listes à puces sauf pour clarifier des étapes pratiques.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { recovery_code, user_message } = await req.json();
    if (!recovery_code || !user_message) {
      return Response.json({ ok: false, error: "Paramètres manquants" }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: report } = await supabase
      .from("reports").select("*").eq("recovery_code", recovery_code).maybeSingle();
    if (!report) return Response.json({ ok: false, error: "Dossier introuvable" }, { status: 404, headers: corsHeaders });

    // Charger l'historique
    const { data: history } = await supabase
      .from("report_messages").select("role, content")
      .eq("report_id", report.id).order("created_at");

    // Contexte du signalement injecté au système
    const contextNote = `\n\nCONTEXTE DU DOSSIER ACTUEL (à utiliser discrètement, sans le réciter) :
- Type déclaré : ${report.harassment_type ?? "non précisé"}
- Date des faits : ${report.incident_date ?? "non précisée"}
- Lieu : ${report.location ?? "non précisé"}
- Description initiale : ${report.description ? report.description.slice(0, 400) : "non remplie"}`;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + contextNote },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: user_message },
    ];

    // Persister le message utilisateur
    await supabase.from("report_messages").insert({
      report_id: report.id, role: "user", content: user_message,
    });

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (aiResp.status === 429) {
      return Response.json({ ok: false, error: "Trop de demandes — merci de patienter quelques instants." }, { status: 429, headers: corsHeaders });
    }
    if (aiResp.status === 402) {
      return Response.json({ ok: false, error: "Service IA momentanément indisponible." }, { status: 402, headers: corsHeaders });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      throw new Error("Erreur IA");
    }

    const aiData = await aiResp.json();
    const reply: string = aiData.choices?.[0]?.message?.content ?? "";

    await supabase.from("report_messages").insert({
      report_id: report.id, role: "assistant", content: reply,
    });

    return Response.json({ ok: true, reply }, { headers: corsHeaders });
  } catch (e) {
    console.error("[ai-assistant]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" },
      { status: 500, headers: corsHeaders },
    );
  }
});
