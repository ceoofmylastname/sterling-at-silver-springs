// Sterling at Silver Springs — Edge Function: Create Admin User
// Uses service role key to create auth users (not possible from frontend)
// Deploy: supabase functions deploy create-admin-user

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Extract JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      console.error('No auth token provided');
      return new Response(
        JSON.stringify({ error: 'Not authenticated — no token provided' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client to verify the caller's token
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user: caller }, error: callerError } = await adminClient.auth.getUser(token);
    if (callerError || !caller) {
      console.error('Token verification failed:', callerError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid session — please log out and log back in' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Verified caller:', caller.email);

    // Parse request
    const { email, displayName } = await req.json();
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Creating admin user:', email);

    // Create the new user with service role privileges
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: email,
      password: 'Password123!',
      email_confirm: true
    });

    if (createError) {
      console.error('Create user error:', createError.message);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Auth user created:', newUser.user?.id);

    // Insert into admin_users table
    const { error: dbError } = await adminClient.from('admin_users').insert([{
      email: email,
      display_name: displayName || null,
      added_by: caller.email
    }]);

    if (dbError) {
      console.warn('admin_users insert warning:', dbError.message);
    }

    // Log the activity
    await adminClient.from('admin_activity_log').insert([{
      admin_email: caller.email,
      action: 'Added admin',
      table_name: 'admin_users',
      details: 'Added ' + email
    }]);

    console.log('Admin user created successfully:', email);

    return new Response(
      JSON.stringify({ success: true, userId: newUser.user?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Create admin error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
