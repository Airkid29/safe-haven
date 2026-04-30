// Assistant IA empathique optimisé pour économie de crédits.
// - Modèle léger par défaut (gemini-2.5-flash-lite)
// - Historique limité aux 8 derniers messages
// - Résumé périodique stocké quand le seuil est dépassé
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_RECENT = 8;             // garder les 8 derniers messages bruts
const SUMMARY_TRIGGER = 12;       // résumer si plus de 12 messages
const MODEL_CHAT = "google/gemini-2.5-flash-lite";
const MODEL_SUMMARY = "google/gemini-2.5-flash-lite";

const SYSTEM_PROMPT = `Tu es Écho, assistant d'écoute pour victimes de harcèlement sur la plateforme Refuge.

POSTURE :
- Bienveillant, posé, à la deuxième personne ("vous"). Jamais robotique.
- Ne juge jamais, n'accuse personne, ne diagnostique pas, ne qualifie pas juridiquement.
- Pas de "je comprends ce que vous ressentez". Réagis spécifiquement au texte.
- Réponses courtes (3-6 phrases max), naturelles, pas d'emojis.

MISSION :
1. Aider à mettre des mots.
2. UNE question à la fois pour préciser : faits, dates, lieux, témoins, preuves.
3. Reformuler brièvement quand utile.
4. Quand le récit est clair, suggérer des pistes concrètes (associations, ligne d'écoute, dossier).
5. Rappeler que la personne garde le contrôle, qu'aucune info n'est publiée.

INTERDITS : "vous devez", "vous auriez dû", diagnostic, qualification juridique tranchée.`;

async function callAI(messages: unknown[], model: string) {
  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });
  return aiResp;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { recovery_code, user_message } = await req.json();
    if (!recovery_code || !user_message) {
      return Response.json({ ok: false, error: "Paramètres manquants" }, { status: 400, headers: corsHeaders });
    }

    // Limite de longueur pour éviter abus / gaspillage de tokens
    const safeMessage = String(user_message).slice(0, 2000);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: report } = await supabase
      .from("reports").select("*").eq("recovery_code", recovery_code).maybeSingle();
    if (!report) return Response.json({ ok: false, error: "Dossier introuvable" }, { status: 404, headers: corsHeaders });

    // Historique complet (pour décider de résumer)
    const { data: history } = await supabase
      .from("report_messages").select("role, content, created_at")
      .eq("report_id", report.id).order("created_at");

    const all = history ?? [];
    const recent = all.slice(-MAX_RECENT);

    // Contexte court à injecter dans le prompt système
    const ctxParts = [
      report.harassment_type && `Type: ${report.harassment_type}`,
      report.incident_date && `Date: ${report.incident_date}`,
      report.location && `Lieu: ${report.location}`,
    ].filter(Boolean).join(" · ");

    const summaryBlock = report.summary_context
      ? `\n\nRÉSUMÉ DES ÉCHANGES PRÉCÉDENTS (à utiliser comme mémoire, ne pas réciter) :\n${report.summary_context}`
      : "";

    const systemContent = `${SYSTEM_PROMPT}\n\nDOSSIER : ${ctxParts || "non précisé"}${summaryBlock}`;

    const messages = [
      { role: "system", content: systemContent },
      ...recent.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: safeMessage },
    ];

    // Persister le message utilisateur
    await supabase.from("report_messages").insert({
      report_id: report.id, role: "user", content: safeMessage,
    });

    const aiResp = await callAI(messages, MODEL_CHAT);

    if (aiResp.status === 429) {
      return Response.json({ ok: false, error: "Trop de demandes — merci de patienter quelques instants." }, { status: 429, headers: corsHeaders });
    }
    if (aiResp.status === 402) {
      return Response.json({ ok: false, error: "Crédits IA épuisés. Merci de réessayer plus tard." }, { status: 402, headers: corsHeaders });
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

    const newCount = all.length + 2;
    const updates: Record<string, unknown> = { message_count: newCount };

    // Déclencher un résumé si on dépasse le seuil et qu'on n'a pas résumé récemment
    const shouldSummarize =
      newCount >= SUMMARY_TRIGGER &&
      (!report.last_summarized_at || newCount - (report.message_count || 0) >= 6);

    if (shouldSummarize) {
      try {
        const olderToSummarize = all.slice(0, Math.max(0, all.length - MAX_RECENT));
        if (olderToSummarize.length > 0) {
          const sumResp = await callAI([
            { role: "system", content: "Tu résumes en français un échange entre un assistant d'écoute (Écho) et une victime. Maximum 8 phrases. Capture : faits déclarés, dates/lieux, personnes mentionnées (sans accusation), émotions exprimées, pistes évoquées. Pas de jugement, pas de diagnostic." },
            { role: "user", content: olderToSummarize.map((m) => `${m.role === "user" ? "Victime" : "Écho"}: ${m.content}`).join("\n") },
          ], MODEL_SUMMARY);
          if (sumResp.ok) {
            const sd = await sumResp.json();
            const summary = sd.choices?.[0]?.message?.content ?? "";
            if (summary) {
              updates.summary_context = summary;
              updates.last_summarized_at = new Date().toISOString();
            }
          }
        }
      } catch (e) {
        console.error("Résumé échoué", e);
      }
    }

    await supabase.from("reports").update(updates).eq("id", report.id);

    return Response.json({ ok: true, reply }, { headers: corsHeaders });
  } catch (e) {
    console.error("[ai-assistant]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" },
      { status: 500, headers: corsHeaders },
    );
  }
});
