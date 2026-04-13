// Sterling at Silver Springs — Edge Function: Newsletter AI Generator
// Deploy: supabase functions deploy generate-newsletter
// Deno runtime

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, topic, description, audience, keywords } = await req.json();

    const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    // === Generate newsletter copy via Claude ===
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `You are a professional community newsletter writer for Sterling at Silver Springs HOA, a residential community in Arizona.

Write a complete, engaging community newsletter with the following details:

Title: ${title}
Topic: ${topic}
Target Audience: ${audience}
Description/Context: ${description}
Keywords to include: ${keywords}

Return a JSON object with this exact structure:
{
  "headline": "compelling newsletter headline",
  "tagline": "one-line subheading",
  "sections": [
    {
      "heading": "section title",
      "body": "section paragraph content (2-4 sentences, warm and informative community tone)"
    }
  ],
  "callToAction": {
    "text": "action button text",
    "instruction": "what residents should do"
  },
  "closingMessage": "warm closing paragraph from the Board of Directors"
}

Write in a warm, professional, community-focused tone. Assume this goes to all homeowners at Sterling at Silver Springs. Make it feel premium and welcoming. Return only the JSON object, no other text.`
        }]
      })
    });

    const claudeData = await claudeRes.json();
    const rawContent = claudeData.content[0].text;
    
    let newsletter;
    try {
      newsletter = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      newsletter = JSON.parse(jsonMatch[0]);
    }

    return new Response(
      JSON.stringify({ newsletter }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
