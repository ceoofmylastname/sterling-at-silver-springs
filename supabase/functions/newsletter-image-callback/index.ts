// Sterling at Silver Springs — Edge Function: Newsletter Image Callback
// Receives webhook callbacks from Kie.ai when image generation completes
// Deploy: supabase functions deploy newsletter-image-callback

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received callback from Kie.ai:", payload);

    // Extract image URL and task metadata
    const taskId = payload.data?.taskId;
    const status = payload.data?.status;
    const imageUrl = payload.data?.result?.[0]?.url;
    const metadata = payload.data?.metadata; // We'll store which newsletter this belongs to

    if (status === "success" && imageUrl && metadata) {
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Update the newsletter with the generated image
      const { newsletterId, imageType } = JSON.parse(metadata);

      if (imageType === 'hero') {
        await supabase
          .from('newsletters')
          .update({ hero_image_url: imageUrl })
          .eq('id', newsletterId);
        console.log(`Updated newsletter ${newsletterId} with hero image`);
      } else if (imageType === 'accent') {
        // Get current extra_image_urls and append
        const { data: newsletter } = await supabase
          .from('newsletters')
          .select('extra_image_urls')
          .eq('id', newsletterId)
          .single();

        const currentUrls = newsletter?.extra_image_urls || [];
        await supabase
          .from('newsletters')
          .update({ extra_image_urls: [...currentUrls, imageUrl] })
          .eq('id', newsletterId);
        console.log(`Updated newsletter ${newsletterId} with accent image`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Callback error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
