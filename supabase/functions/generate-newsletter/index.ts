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
    const KIE_KEY = Deno.env.get("KIE_API_KEY");

    // === 1. Generate newsletter copy via Claude ===
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
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
      "body": "section paragraph content (2-4 sentences, warm and informative community tone)",
      "imagePrompt": "detailed image generation prompt for this section's visual (describe a photorealistic community/neighborhood image)"
    }
  ],
  "callToAction": {
    "text": "action button text",
    "instruction": "what residents should do"
  },
  "closingMessage": "warm closing paragraph from the Board of Directors",
  "imagePrompts": {
    "hero": "detailed hero image generation prompt (photorealistic community entrance or neighborhood scene, golden hour, Sterling Standard aesthetic)",
    "accent": "secondary decorative image prompt"
  }
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

    // === 2. Generate hero image via Kie.ai Nano Banana 2 ===
    let heroImageUrl = null;
    let accentImageUrl = null;

    // Note: Images will be generated asynchronously via webhook callback
    // For now, return null and images will be added later via callback
    console.log("Image generation will be handled asynchronously");
    heroImageUrl = null;
    accentImageUrl = null;

    return new Response(
      JSON.stringify({
        newsletter,
        heroImageUrl,
        accentImageUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
