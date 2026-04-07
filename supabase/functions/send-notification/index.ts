// Sterling at Silver Springs — Edge Function: Email Notification via Resend
// Sends branded email notifications to all admins when forms are submitted
// Deploy: supabase functions deploy send-notification
// Env: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function esc(s: string): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles'
  });
}

function detailRow(label: string, value: string, isLink?: string): string {
  const val = isLink
    ? `<a href="${isLink}${esc(value)}" style="color:#3D5A80;text-decoration:none;">${esc(value)}</a>`
    : esc(value);
  return `<tr>
    <td style="padding:10px 0;color:#8D8FA3;font-size:14px;width:140px;vertical-align:top;border-bottom:1px solid #F0EDE5;">${label}</td>
    <td style="padding:10px 0;color:#2B2D42;font-size:14px;font-weight:500;border-bottom:1px solid #F0EDE5;">${val}</td>
  </tr>`;
}

function emailShell(title: string, subtitle: string, badge: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAFAF7;font-family:'Inter',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#FAFAF7;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(135deg,#3D5A80 0%,#2C4460 100%);padding:36px 40px 32px;text-align:center;">
    <img src="https://assets.cdn.filesafe.space/nF7RwerbB5hn27XaM9D2/media/69cc96d9dbd0b5de7b8f0cb4.png"
         alt="Sterling at Silver Springs" width="180" style="display:block;margin:0 auto 20px;max-width:180px;height:auto;">
    <h1 style="margin:0;color:#FFFFFF;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;letter-spacing:-0.02em;">
      ${title}
    </h1>
    <p style="margin:10px 0 0;color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:0.3px;">
      ${subtitle}
    </p>
  </td></tr>

  <!-- GOLD ACCENT BAR -->
  <tr><td style="background:linear-gradient(90deg,#D4A843,#E4C06A);height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- BADGE -->
  <tr><td style="background:#FFFFFF;padding:28px 40px 0;">
    <table cellpadding="0" cellspacing="0" role="presentation"><tr>
      <td style="background:#D4A843;color:#FFFFFF;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:6px 18px;border-radius:20px;">
        ${esc(badge)}
      </td>
    </tr></table>
  </td></tr>

  <!-- BODY -->
  ${bodyContent}

  <!-- CTA -->
  <tr><td style="background:#FFFFFF;padding:8px 40px 36px;text-align:center;">
    <a href="https://www.sterlinglasvegas.com/#admin"
       style="display:inline-block;background:#3D5A80;color:#FFFFFF;padding:14px 36px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
      View in Admin Dashboard &rarr;
    </a>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#FAFAF7;padding:28px 40px;text-align:center;border-top:1px solid #E2DFD6;">
    <p style="margin:0 0 4px;color:#8D8FA3;font-size:12px;line-height:1.6;">
      <strong style="color:#5A5C6F;">Sterling at Silver Springs</strong> &bull; Community Board of Directors
    </p>
    <p style="margin:0;color:#8D8FA3;font-size:11px;">
      This is an automated notification. Please do not reply to this email.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildRequestEmail(data: Record<string, string>): { subject: string; html: string } {
  const subject = `New Request: ${data.topic} — ${data.subject}`;
  const ts = fmtDate();

  const bodyContent = `
  <!-- SUBJECT LINE -->
  <tr><td style="background:#FFFFFF;padding:20px 40px 0;">
    <h2 style="margin:0;color:#2B2D42;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;line-height:1.3;">
      ${esc(data.subject)}
    </h2>
  </td></tr>

  <!-- DESCRIPTION -->
  <tr><td style="background:#FFFFFF;padding:16px 40px 24px;">
    <div style="background:#FAFAF7;border-left:4px solid #D4A843;padding:16px 20px;border-radius:0 8px 8px 0;">
      <p style="margin:0;color:#5A5C6F;font-size:15px;line-height:1.75;white-space:pre-wrap;">${esc(data.description)}</p>
    </div>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="background:#FFFFFF;padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
      <td style="border-bottom:1px solid #E2DFD6;font-size:0;line-height:0;height:1px;">&nbsp;</td>
    </tr></table>
  </td></tr>

  <!-- DETAILS -->
  <tr><td style="background:#FFFFFF;padding:20px 40px 28px;">
    <p style="margin:0 0 14px;color:#8D8FA3;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Resident Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${detailRow('Name', data.resident_name)}
      ${detailRow('Email', data.email, 'mailto:')}
      ${data.phone ? detailRow('Phone', data.phone, 'tel:') : ''}
      ${detailRow('Address', data.address)}
      ${detailRow('Contact Via', data.contact_method)}
      ${detailRow('Submitted', ts)}
    </table>
  </td></tr>`;

  return { subject, html: emailShell('New Resident Request', 'A resident has submitted a new request', data.topic, bodyContent) };
}

function buildSuggestionEmail(data: Record<string, any>): { subject: string; html: string } {
  const isAnonymous = !data.name;
  const subject = `New Suggestion: ${data.category}` + (isAnonymous ? ' (Anonymous)' : ` from ${data.name}`);
  const ts = fmtDate();

  const bodyContent = `
  <!-- SUGGESTION TEXT -->
  <tr><td style="background:#FFFFFF;padding:24px 40px;">
    <div style="background:#FAFAF7;border-left:4px solid #D4A843;padding:16px 20px;border-radius:0 8px 8px 0;">
      <p style="margin:0;color:#5A5C6F;font-size:15px;line-height:1.75;white-space:pre-wrap;">${esc(data.suggestion)}</p>
    </div>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="background:#FFFFFF;padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
      <td style="border-bottom:1px solid #E2DFD6;font-size:0;line-height:0;height:1px;">&nbsp;</td>
    </tr></table>
  </td></tr>

  <!-- DETAILS -->
  <tr><td style="background:#FFFFFF;padding:20px 40px 28px;">
    <p style="margin:0 0 14px;color:#8D8FA3;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Submission Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${detailRow('Submitted By', isAnonymous ? 'Anonymous' : data.name)}
      ${detailRow('Category', data.category)}
      ${detailRow('Wants Response', data.wants_response ? 'Yes' : 'No')}
      ${data.email ? detailRow('Email', data.email, 'mailto:') : ''}
      ${detailRow('Submitted', ts)}
    </table>
  </td></tr>`;

  return { subject, html: emailShell('New Community Suggestion', 'A resident has shared an idea', data.category, bodyContent) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    if (!type || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing type or data' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query all admin emails
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: admins, error: adminError } = await adminClient
      .from('admin_users')
      .select('email');

    if (adminError || !admins || admins.length === 0) {
      console.error('No admins found or error:', adminError?.message);
      return new Response(
        JSON.stringify({ error: 'No admin recipients found' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminEmails = admins.map((a: { email: string }) => a.email).filter(Boolean);

    // Build email
    const { subject, html } = type === 'request'
      ? buildRequestEmail(data)
      : buildSuggestionEmail(data);

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sterling at Silver Springs <noreply@sterlinglasvegas.com>',
        to: adminEmails,
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend API error:', resendData);
      return new Response(
        JSON.stringify({ error: 'Email send failed', details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Notification sent to', adminEmails.length, 'admins. Resend ID:', resendData.id);

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Send notification error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
