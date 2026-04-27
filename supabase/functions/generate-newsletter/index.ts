// Sterling at Silver Springs — Edge Function: Newsletter AI Generator (v3)
// Sterling-locked layout. Brand identity, logo, and section list are fixed at the
// edge — admins control content and section *contents*, never section *order* or
// *style*.
//
// Deploy: supabase functions deploy generate-newsletter
// Deno runtime
//
// Input shape (v3):
//   {
//     title: string,                                // DB title only — does NOT appear on the bulletin
//     issue_month_override: string | null,          // optional, e.g. "May 2026". Blank = current month/year LV time.
//     community_updates: string,                    // free-form, AI tightens
//     board_meeting: { date, time, executive_session, location, notes } | null,
//     events: [[date, name, time], ...],
//     events_bulk_reminder: string | null,
//     reminders: [[label, blurb], ...],
//     help_wanted: string,
//     join_the_board: string,
//     contacts: { management: { company, address, phone, after_hours, email, website } | null,
//                 roles: [[role, name, contact], ...] },
//     financials: [[account_name, amount_number], ...]
//   }
//
// Backward-compat: v1 callers (live site) sending {title, topic, audience, description, keywords}
// are accepted — `description` is aliased into `community_updates`, and a flat `contacts` array is
// treated as `roles`. They produce a thinner bulletin (only Community Updates + Contacts populated)
// instead of an empty one. Keeps the live admin form usable during the v3 frontend rollout.
//
// Response shape (unchanged from v2):
//   { html: "<full bulletin HTML>", newsletter: {...legacy structured shape, derived deterministically...} }

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ORG_NAME = "Sterling at Silver Springs";
const BRAND_PRIMARY = "#1f3864";
const LOGO_URL = "https://assets.cdn.filesafe.space/nF7RwerbB5hn27XaM9D2/media/69cc96d9dbd0b5de7b8f0cb4.png";

const SYSTEM_PROMPT = `You generate Sterling at Silver Springs HOA newsletters. The visual layout is locked. Your only job is enhancing prose inside named sections — never inventing layout, never changing brand identity, never adding sections that don't appear in the locked list below.

# OUTPUT FORMAT

Return one self-contained HTML document, starting with <!DOCTYPE html>. Inline <style> in <head>. No external CSS, no external JS, no <script> tags.

Page size: A4 / Letter equivalent. Target one page, max two. The print engine handles natural page breaks via @media print rules (see REQUIRED PRINT CSS below). Do not force a page break or render a "Continued" header.

# LOCKED BRAND IDENTITY

- Org name: Sterling at Silver Springs
- Brand color: ${BRAND_PRIMARY} (header band logo color, all section title bars, table header rows)
- Logo: render this image at the top-left of the header band, approximately 80px tall:
  ${LOGO_URL}
- Header band layout: white background, centered. Logo top-left, the rest centered:
    Line 1: "Sterling at Silver Springs" in ${BRAND_PRIMARY}, large bold serif or strong sans-serif (~28-32px)
    Line 2: "[ISSUE_DATE] HOA Newsletter" in smaller medium-weight gray (~14-15px)
- Thin horizontal rule under the header band.

# FOOTER (every page)

- Left: "Sterling at Silver Springs Community - [ISSUE_DATE]"
- Right: "Page [page-number]"
- Thin top border, small gray text.
- For print, use CSS counter-increment to auto-number pages. For on-screen rendering inside an iframe, "Page 1" is acceptable as a static value if multi-page numbering would be unreliable.

# LOCKED SECTION ORDER

These eight sections, in this exact order. SKIP any section whose input is empty/null/zero-rows. Do NOT render an empty title bar. Do NOT render placeholder text like "TBD" or "None at this time." If skipped, the section is invisible — the next populated section's title bar comes immediately after the previous populated section's body.

  1. Community Updates
  2. Board of Directors Meeting
  3. [ISSUE_MONTH] Events at a Glance
  4. Community Reminders
  5. Help Wanted
  6. Join the Board
  7. Contacts and Management
  8. Monthly HOA Financials

Each populated section starts with a colored title bar:
- Full-width, background ${BRAND_PRIMARY}, white bold text, ~6px vertical padding, left-aligned title.
- Body area below the bar with light-gray top and bottom 1px borders, padded ~12-16px.

# SECTION RULES

1) Community Updates
   - Input: community_updates (free-form text). If empty, skip section.
   - 2-column layout: LEFT ~60% — 2 to 4 short labeled updates (bold sub-heading + 1-3 sentence blurb each). RIGHT ~40% — any email addresses or web links extracted verbatim from the input, as a labeled list ("Email:", "Website:", etc.). If no links/emails, the right column may be empty or omitted (single-column body).
   - AI may rewrite the prose into clearer, tighter blurbs. AI MUST preserve every name, date, dollar amount, email address, URL, and named action verbatim.

2) Board of Directors Meeting
   - Input: board_meeting object { date, time, executive_session, location, notes }. If null, skip.
   - 1-column body. Single inline labeled line, fields separated by " · ":
       "Date: <date>" then if executive_session present: "Executive Session: <executive_session>" then "Open Meeting: <time>" then "Location: <location>".
   - If notes provided, AI tightens to 1-2 sentence paragraph beneath the inline line. Preserve facts verbatim.

3) Events at a Glance (title bar reads "[ISSUE_MONTH] Events at a Glance")
   - Input: events array of [date, name, time] tuples + events_bulk_reminder optional string. If events array empty, skip.
   - Title bar literal: substitute the actual month name (e.g. "May Events at a Glance").
   - 3-column table, columns "Date | Event | Time", with alternating very-light-gray row shading.
   - Pass through tuple values VERBATIM. Do not paraphrase, reformat, or "improve" event names, dates, or times.
   - If events_bulk_reminder provided, render it as a small italic line beneath the table at ~85% body font size in gray.

4) Community Reminders
   - Input: reminders array of [label, blurb] tuples. If empty, skip.
   - 2-column blurb grid (drop to 1-column if only 1-2 items). Each item: bold label + AI-tightened blurb (1-2 sentences). Labels pass through VERBATIM.

5) Help Wanted
   - Input: help_wanted (free-form text). If empty, skip.
   - 1-column body. AI tightens to 1-2 short paragraphs. Preserve every fact, name, contact, and action verbatim.

6) Join the Board
   - Input: join_the_board (free-form text). If empty, skip.
   - 1-column body. AI tightens to 1 short paragraph. If input mentions an email or contact, end with that contact line. Preserve all facts verbatim.

7) Contacts and Management
   - Input: contacts object { management, roles }. If both management is null AND roles is empty, skip.
   - 2-column layout (drop to 1-column if only one of the two is populated):
       LEFT — Management block: Company name (bold), then Address, Phone (with label), After-hours emergency (label, only if provided), Email, Website. Each on its own line.
       RIGHT — heading "Who to Contact" then role list, one per line: "Role: Name - email-or-phone".
   - Pass through all contact data VERBATIM. Do not invent or paraphrase.

8) Monthly HOA Financials
   - Input: financials array of [account_name, amount_number] tuples. If empty, skip.
   - Full-width data table. Header row background ${BRAND_PRIMARY}, white text. Two columns: Account | Amount. Right-align the Amount column. Format amounts with a leading "$" and 2 decimals (e.g. "$10,322.16").
   - Bold any row whose account_name contains "Total" (case-insensitive).

# REQUIRED PRINT CSS

Include the following @media print rules verbatim inside the <style> block (adjust class names to match your actual markup):

  @media print {
    .section, .events-table, .financials-table { page-break-inside: avoid; }
    .section-bar { page-break-after: avoid; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }

# DENSITY RULES

- No paragraph longer than 4 sentences. Cut to 2 when the content allows.
- No emojis. No icons. The logo image is the only graphic.
- No marketing fluff, no hype words, no exclamation points unless the input had them.
- News-bulletin voice: factual, scannable, dated, named. Real people, real numbers, real dates.

# FORBIDDEN

- Inventing contacts, names, dates, dollar amounts, events, or section content not present in the input.
- Adding generic intros ("In this newsletter we'll cover...") or sentimental sign-offs.
- Rearranging the section order.
- Adding sections that aren't in the locked list above.
- Padding empty sections with placeholder text. Empty input = section absent.
- Changing brand colors, brand name, or identity.
- Including <script> tags or external CSS/JS references.
- Forcing page breaks or rendering a "Continued" header on page 2 — let CSS handle pagination.

# RETURN

Return ONLY the HTML, starting with <!DOCTYPE html>. No commentary, no markdown wrapper, no explanation.`;

function computeIssueLabels(override: string | null | undefined): { issueDate: string; issueMonth: string } {
  if (override && override.trim()) {
    const date = override.trim();
    const month = date.split(/\s+/)[0] || date;
    return { issueDate: date, issueMonth: month };
  }
  const now = new Date();
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
    year: "numeric",
  });
  const monthFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
  });
  return { issueDate: dateFmt.format(now), issueMonth: monthFmt.format(now) };
}

function normalizeContacts(raw: unknown): {
  management: Record<string, any> | null;
  roles: any[];
} {
  // v3 shape: { management, roles }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const r = raw as Record<string, any>;
    return {
      management: r.management && typeof r.management === "object" ? r.management : null,
      roles: Array.isArray(r.roles) ? r.roles : [],
    };
  }
  // v1/v2 shape: flat array of role tuples — treat as roles, no management.
  if (Array.isArray(raw)) {
    return { management: null, roles: raw };
  }
  return { management: null, roles: [] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured on the function");
    }

    // v3 fields, with backward-compat shim for v1/v2 callers.
    const title: string = body.title || "";
    const issue_month_override: string | null = body.issue_month_override || null;
    // v1/v2 sent free text in `description`; alias into `community_updates` if v3 field is absent.
    const community_updates: string = (body.community_updates ?? body.description ?? "").toString();
    const board_meeting = body.board_meeting && typeof body.board_meeting === "object" ? body.board_meeting : null;
    const events = Array.isArray(body.events) ? body.events : [];
    const events_bulk_reminder: string | null = body.events_bulk_reminder || null;
    const reminders = Array.isArray(body.reminders) ? body.reminders : [];
    const help_wanted: string = (body.help_wanted ?? "").toString();
    const join_the_board: string = (body.join_the_board ?? "").toString();
    const contacts = normalizeContacts(body.contacts);
    const financials = Array.isArray(body.financials) ? body.financials : [];

    const { issueDate, issueMonth } = computeIssueLabels(issue_month_override);

    const intake = {
      community_updates,
      board_meeting,
      events,
      events_bulk_reminder,
      reminders,
      help_wanted,
      join_the_board,
      contacts,
      financials,
    };

    const userMessage = `Generate the newsletter HTML now using the locked layout from your system prompt.

ISSUE_DATE: ${issueDate}
ISSUE_MONTH: ${issueMonth}

Use ISSUE_DATE in the header band ("[ISSUE_DATE] HOA Newsletter") and footer.
Use ISSUE_MONTH in the events title bar ("[ISSUE_MONTH] Events at a Glance").

Apply the section visibility rule: skip any section whose input below is empty/null/zero-rows.

INTAKE:
${JSON.stringify(intake, null, 2)}`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 8000,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const claudeData = await claudeRes.json();

    if (!claudeRes.ok || claudeData.type === "error") {
      throw new Error(
        `Anthropic ${claudeRes.status}: ${claudeData.error?.message || JSON.stringify(claudeData)}`
      );
    }

    let html = claudeData.content[0].text.trim();
    if (html.startsWith("```")) {
      html = html.replace(/^```(?:html)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    const newsletter = buildLegacyNewsletter(intake, title, issueDate, issueMonth);

    return new Response(
      JSON.stringify({ html, newsletter }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Deterministic mapper from v3 intake -> legacy { headline, tagline, sections, callToAction, closingMessage }
// shape so any older v1/v2 frontend that reads ai.headline / ai.sections still has something to render.
function buildLegacyNewsletter(
  intake: Record<string, any>,
  title: string,
  issueDate: string,
  issueMonth: string,
) {
  const sections: Array<{ heading: string; body: string }> = [];

  if (intake.community_updates) {
    sections.push({ heading: "Community Updates", body: intake.community_updates });
  }

  if (intake.board_meeting) {
    const bm = intake.board_meeting;
    const parts: string[] = [];
    if (bm.date) parts.push(`Date: ${bm.date}`);
    if (bm.executive_session) parts.push(`Executive Session: ${bm.executive_session}`);
    if (bm.time) parts.push(`Open Meeting: ${bm.time}`);
    if (bm.location) parts.push(`Location: ${bm.location}`);
    let body = parts.join(" · ");
    if (bm.notes) body += (body ? "\n\n" : "") + bm.notes;
    if (body) sections.push({ heading: "Board of Directors Meeting", body });
  }

  if (Array.isArray(intake.events) && intake.events.length) {
    const lines = intake.events
      .map((e: any) => {
        if (Array.isArray(e)) {
          const [date, name, time] = e;
          return `${date || ""} — ${name || ""}${time ? ` (${time})` : ""}`.trim();
        }
        return `${e.date || ""} — ${e.name || e.event || ""}${e.time ? ` (${e.time})` : ""}`.trim();
      })
      .filter(Boolean)
      .join("\n");
    if (lines) {
      let body = lines;
      if (intake.events_bulk_reminder) body += `\n\n${intake.events_bulk_reminder}`;
      sections.push({ heading: `${issueMonth} Events at a Glance`, body });
    }
  }

  if (Array.isArray(intake.reminders) && intake.reminders.length) {
    const lines = intake.reminders
      .map((r: any) => {
        if (Array.isArray(r)) return `${r[0] || ""}: ${r[1] || ""}`.trim();
        return `${r.label || ""}: ${r.blurb || r.body || ""}`.trim();
      })
      .filter(Boolean)
      .join("\n");
    if (lines) sections.push({ heading: "Community Reminders", body: lines });
  }

  if (intake.help_wanted) {
    sections.push({ heading: "Help Wanted", body: intake.help_wanted });
  }

  if (intake.join_the_board) {
    sections.push({ heading: "Join the Board", body: intake.join_the_board });
  }

  const cm = intake.contacts && intake.contacts.management;
  const cr = intake.contacts && Array.isArray(intake.contacts.roles) ? intake.contacts.roles : [];
  if (cm || cr.length) {
    const blocks: string[] = [];
    if (cm) {
      const lines = [
        cm.company,
        cm.address,
        cm.phone ? `Phone: ${cm.phone}` : "",
        cm.after_hours ? `After-hours: ${cm.after_hours}` : "",
        cm.email,
        cm.website,
      ].filter(Boolean);
      if (lines.length) blocks.push(lines.join("\n"));
    }
    if (cr.length) {
      const roleLines = cr
        .map((r: any) => {
          if (Array.isArray(r)) {
            const [role, name, contact] = r;
            return `${role || ""} — ${name || ""}${contact ? ` (${contact})` : ""}`.trim();
          }
          const role = r.role || "";
          const name = r.name || "";
          const contact = r.email || r.phone || "";
          return `${role} — ${name}${contact ? ` (${contact})` : ""}`.trim();
        })
        .filter(Boolean)
        .join("\n");
      if (roleLines) blocks.push("Who to Contact:\n" + roleLines);
    }
    if (blocks.length) sections.push({ heading: "Contacts and Management", body: blocks.join("\n\n") });
  }

  if (Array.isArray(intake.financials) && intake.financials.length) {
    const lines = intake.financials
      .map((f: any) => {
        if (Array.isArray(f)) return `${f[0] || ""}: ${f[1] ?? ""}`.trim();
        return `${f.name || f.account || ""}: ${f.amount ?? ""}`.trim();
      })
      .filter(Boolean)
      .join("\n");
    if (lines) sections.push({ heading: "Monthly HOA Financials", body: lines });
  }

  return {
    headline: title || ORG_NAME,
    tagline: `${issueDate} HOA Newsletter`,
    sections,
    callToAction: { text: "", instruction: "" },
    closingMessage: "From the Sterling at Silver Springs Board of Directors",
  };
}
