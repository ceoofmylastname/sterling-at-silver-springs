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
        model: "claude-haiku-4-5",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `You are an expert community newsletter writer for Sterling at Silver Springs HOA, a premium residential community in Arizona. Your goal is to take the rough input details provided and creatively enhance them into a polished, deeply engaging, and beautifully written newsletter.

Do not just repeat the input information. Expand on it thoughtfully, making it sound very human, highly professional, warm, and crystal clear. The content should be compelling and feel like it was written by a caring, top-tier community manager.

Input Details:
Title: ${title}
Topic: ${topic}
Target Audience: ${audience}
Description/Context: ${description}
Keywords: ${keywords}

Requirements:
- Make sure EVERY piece of input context is utilized and expanded upon.
- Write natural, beautifully flowing paragraphs that captivate the reader.
- Tone: Premium, welcoming, clear, and highly engaging.

Return a JSON object with this exact structure (NO OTHER TEXT):
{
  "headline": "A highly compelling, magazine-style newsletter headline",
  "tagline": "An engaging one-line subheading that hooks the reader",
  "sections": [
    {
      "heading": "Clear, appealing section title",
      "body": "Beautifully written, fully fleshed-out paragraph (3-5 sentences) that expands on the input details and flows naturally."
    }
  ],
  "callToAction": {
    "text": "Strong, exciting action button text",
    "instruction": "Clear, encouraging instructions on what to do next"
  },
  "closingMessage": "A very warm, professional sign-off from the Board of Directors"
}`
        }]
      })
    });

    const claudeData = await claudeRes.json();
    
    if (!claudeRes.ok || claudeData.type === "error") {
      throw new Error(`Anthropic Error: ${claudeData.error?.message || JSON.stringify(claudeData)}`);
    }

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
