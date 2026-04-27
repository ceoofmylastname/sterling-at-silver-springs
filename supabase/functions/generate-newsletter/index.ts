// Sterling at Silver Springs — Edge Function: Newsletter AI Generator (v3.1)
// Sterling-locked layout. Brand identity, logo, and section list are fixed at the
// edge — admins control content and section *contents*, never section *order* or
// *style*.
//
// Deploy: supabase functions deploy generate-newsletter
// Deno runtime
//
// Input shape (v3.1 — financials split + currency-friendly inputs):
//   {
//     title: string,
//     issue_month_override: string | null,
//     community_updates: string,
//     board_meeting: { date, time, executive_session, location, notes } | null,
//     events: [[date, name, time], ...],
//     events_bulk_reminder: string | null,
//     reminders: [[label, blurb], ...],
//     help_wanted: string,
//     join_the_board: string,
//     contacts: { management: {...} | null, roles: [[role, name, contact], ...] },
//     financials: {
//       operating: [[account_name, amount_number], ...],
//       reserve: [[account_name, amount_number], ...]
//     }
//   }
//
// Backward-compat shims:
// 1. v1 callers (live site) sending {title, topic, audience, description, keywords}
//    have `description` aliased into `community_updates` and a flat `contacts` array
//    treated as `roles`.
// 2. v3 callers sending `financials` as a flat array `[[account, amount], ...]` are
//    treated as `{operating: <that>, reserve: []}` so the existing v3 frontend
//    keeps working through the v3 → v3.1 deploy gap.
//
// Response shape (unchanged from v2/v3):
//   { html: "<full bulletin HTML>", newsletter: {...legacy structured shape...} }

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

Return one self-contained HTML document, starting with <!DOCTYPE html>. Inline <style> in <head>. No external CSS or JS except the single Google Font link below. No <script> tags.

Page size: A4 / Letter equivalent. The bulletin can run any number of pages — the print engine handles natural page breaks via the REQUIRED PRINT CSS below. Do not force page breaks or render a "Continued" header.

# REQUIRED HEAD CONTENT

Include this in <head> verbatim, alongside your <style> and <title> elements:

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

Body font stack: \`'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\`. Tighten typography slightly: body line-height ~1.5, body font-size ~14px, section title bars ~15-16px, header band org name ~28-32px with letter-spacing ~-0.01em. The bulletin should feel modern and clean — not loud.

# LOCKED BRAND IDENTITY

- Org name: Sterling at Silver Springs
- Brand color: ${BRAND_PRIMARY} (header band logo color, all section title bars, financials table header rows)
- Logo: render this image at the top-left of the header band, approximately 80px tall:
  ${LOGO_URL}
- Header band: white background, centered:
    Logo top-left, the rest centered.
    Line 1: "Sterling at Silver Springs" in ${BRAND_PRIMARY}, large bold (~28-32px).
    Line 2: "[ISSUE_DATE] HOA Newsletter" in smaller medium-weight gray (~14-15px).
- Thin horizontal rule under the header band.

# FOOTER (every page)

- Left: "Sterling at Silver Springs Community - [ISSUE_DATE]"
- Right: "Page [page-number]"
- Subtle 1px top border in light gray (#e0e0e0). Smaller, lighter than the body text. ~11-12px gray.
- For print, use CSS counter-increment to auto-number pages. For on-screen rendering inside an iframe, "Page 1" is acceptable as a static value if multi-page numbering would be unreliable.

# LOCKED SECTION ORDER

These eight sections, in this exact order. SKIP any section whose input is empty/null/zero-rows. Do NOT render an empty title bar. Do NOT render placeholder text like "TBD" or "None at this time."

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
- Subtle border-radius on top corners only: \`border-radius: 4px 4px 0 0\`.
- Body area below the bar with light-gray (#e0e0e0) top and bottom 1px borders, padded ~14-16px.

# SECTION RULES

1) Community Updates
   - Input: community_updates (free-form text). If empty, skip section.
   - 2-column layout: LEFT ~60% — 2 to 4 short labeled updates (bold sub-heading + 1-3 sentence blurb each). RIGHT ~40% — any email addresses or web links extracted verbatim from the input, as a labeled list ("Email:", "Website:"). If no links/emails, the right column may be empty or omitted (single-column body).
   - AI may rewrite the prose into clearer, tighter blurbs. AI MUST preserve every name, date, dollar amount, email address, URL, and named action verbatim.

2) Board of Directors Meeting
   - Input: board_meeting object { date, time, executive_session, location, notes }. If null, skip.
   - 1-column body. Single inline labeled line, fields separated by " · ":
       "Date: <date>" then if executive_session present: "Executive Session: <executive_session>" then "Open Meeting: <time>" then "Location: <location>".
   - If notes provided, AI tightens to 1-2 sentence paragraph beneath the inline line. Preserve facts verbatim.

3) Events at a Glance (title bar reads "[ISSUE_MONTH] Events at a Glance")
   - Input: events array of [date, name, time] tuples + events_bulk_reminder optional string. If events array empty, skip.
   - Title bar literal: substitute the actual month name (e.g. "May Events at a Glance").
   - 3-column table, columns "Date | Event | Time", with alternating very-light-gray row shading. Borders: 1px solid #e0e0e0. Cell padding ~10-12px.
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

8) Monthly HOA Financials (split into two parallel accounts)
   - Input: financials object { operating: [[account, amount], ...], reserve: [[account, amount], ...] }.
   - If BOTH operating and reserve are empty, skip the section entirely.
   - Body uses a flexbox row container with two equal-width tables side-by-side (\`display: flex; gap: 16px\`). On print, fall back to vertical stacking — see REQUIRED PRINT CSS.
   - LEFT TABLE: header row "Operating Account" / "Amount" (header background ${BRAND_PRIMARY}, white text). Body rows from the operating array (account name, amount). Bold final row "Total Operating" with the value of TOTAL_OPERATING from the user message — pre-computed, just render it. Format every amount as "$X,XXX.XX" with comma thousands separators and 2 decimals.
   - RIGHT TABLE: identical structure, header "Reserve Account" / "Amount", rows from the reserve array, bold final row "Total Cash, Reserves, and CDs" with TOTAL_RESERVE.
   - If only one side is populated, render only that side's table at full width — do not render an empty placeholder for the other side.
   - Tables use 1px solid #e0e0e0 borders, alternating row shading on body rows, right-aligned amount column, ~10-12px cell padding.

# REQUIRED PRINT CSS

Include the following @media print rules verbatim inside the <style> block (adjust class names to match your actual markup):

  @media print {
    body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section { page-break-inside: auto; }
    .section-bar { page-break-after: avoid; break-after: avoid; }
    .section table tr { page-break-inside: avoid; }
    .section table thead { display: table-header-group; }
    .financials-row { display: block; }
    .financials-row > * { width: 100% !important; }
    @page { margin: 0.5in; }
  }

The intent: sections may break across pages naturally; section title bars never get orphaned at the bottom of a page; table rows stay intact; table headers repeat on each page; the side-by-side financials stack vertically when printed.

# DENSITY RULES

- No paragraph longer than 4 sentences. Cut to 2 when the content allows.
- No emojis. No icons. The logo image is the only graphic.
- No marketing fluff, no hype words, no exclamation points unless the input had them.
- News-bulletin voice: factual, scannable, dated, named.

# FORBIDDEN

- Inventing contacts, names, dates, dollar amounts, events, or section content not in the input.
- Adding generic intros or sentimental sign-offs.
- Rearranging the section order.
- Adding sections that aren't in the locked list above.
- Padding empty sections with placeholder text.
- Changing brand colors, brand name, or identity.
- Including <script> tags or external CSS/JS references except the Google Fonts <link>.
- Forcing page breaks or rendering a "Continued" header.
- Computing financials totals yourself — TOTAL_OPERATING and TOTAL_RESERVE are pre-computed in the user message; render them as given.

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
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const r = raw as Record<string, any>;
    return {
      management: r.management && typeof r.management === "object" ? r.management : null,
      roles: Array.isArray(r.roles) ? r.roles : [],
    };
  }
  if (Array.isArray(raw)) {
    return { management: null, roles: raw };
  }
  return { management: null, roles: [] };
}

// v3.1 financials shape: { operating: [[name, amount], ...], reserve: [[name, amount], ...] }
// Backward-compat: a flat array (v3 shape) is treated as operating-only.
function normalizeFinancials(raw: unknown): {
  operating: any[];
  reserve: any[];
} {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const r = raw as Record<string, any>;
    return {
      operating: Array.isArray(r.operating) ? r.operating : [],
      reserve: Array.isArray(r.reserve) ? r.reserve : [],
    };
  }
  if (Array.isArray(raw)) {
    return { operating: raw, reserve: [] };
  }
  return { operating: [], reserve: [] };
}

function sumAmounts(rows: any[]): number {
  if (!Array.isArray(rows)) return 0;
  let total = 0;
  for (const row of rows) {
    let amt: any;
    if (Array.isArray(row)) amt = row[1];
    else if (row && typeof row === "object") amt = (row as any).amount ?? (row as any)[1];
    const n = typeof amt === "number" ? amt : parseFloat(String(amt ?? "").replace(/[$,\s]/g, ""));
    if (Number.isFinite(n)) total += n;
  }
  return total;
}

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

    const title: string = body.title || "";
    const issue_month_override: string | null = body.issue_month_override || null;
    const community_updates: string = (body.community_updates ?? body.description ?? "").toString();
    const board_meeting = body.board_meeting && typeof body.board_meeting === "object" ? body.board_meeting : null;
    const events = Array.isArray(body.events) ? body.events : [];
    const events_bulk_reminder: string | null = body.events_bulk_reminder || null;
    const reminders = Array.isArray(body.reminders) ? body.reminders : [];
    const help_wanted: string = (body.help_wanted ?? "").toString();
    const join_the_board: string = (body.join_the_board ?? "").toString();
    const contacts = normalizeContacts(body.contacts);
    const financials = normalizeFinancials(body.financials);

    // Pre-compute totals so the model never does math.
    const totalOperating = sumAmounts(financials.operating);
    const totalReserve = sumAmounts(financials.reserve);
    const totalOperatingFmt = formatUSD(totalOperating);
    const totalReserveFmt = formatUSD(totalReserve);

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

Pre-computed financial totals (render these verbatim, do not recalculate):
TOTAL_OPERATING: ${totalOperatingFmt}
TOTAL_RESERVE: ${totalReserveFmt}

Apply the section visibility rule: skip any section whose input below is empty/null/zero-rows. For Monthly HOA Financials, skip only if BOTH operating AND reserve are empty.

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

    const newsletter = buildLegacyNewsletter(intake, title, issueDate, issueMonth, totalOperatingFmt, totalReserveFmt);

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

function buildLegacyNewsletter(
  intake: Record<string, any>,
  title: string,
  issueDate: string,
  issueMonth: string,
  totalOperatingFmt: string,
  totalReserveFmt: string,
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

  // v3.1 financials — operating and reserve become two named blocks inside one legacy section.
  const opRows = Array.isArray(intake.financials?.operating) ? intake.financials.operating : [];
  const rsRows = Array.isArray(intake.financials?.reserve) ? intake.financials.reserve : [];
  if (opRows.length || rsRows.length) {
    const blocks: string[] = [];
    const formatRow = (r: any) => {
      const name = Array.isArray(r) ? r[0] : (r?.name || r?.account || "");
      const amt = Array.isArray(r) ? r[1] : (r?.amount ?? "");
      const num = typeof amt === "number" ? amt : parseFloat(String(amt ?? "").replace(/[$,\s]/g, ""));
      const fmt = Number.isFinite(num) ? formatUSD(num) : String(amt);
      return `${name}: ${fmt}`.trim();
    };
    if (opRows.length) {
      const lines = opRows.map(formatRow).filter(Boolean);
      lines.push(`Total Operating: ${totalOperatingFmt}`);
      blocks.push("Operating Account\n" + lines.join("\n"));
    }
    if (rsRows.length) {
      const lines = rsRows.map(formatRow).filter(Boolean);
      lines.push(`Total Cash, Reserves, and CDs: ${totalReserveFmt}`);
      blocks.push("Reserve Account\n" + lines.join("\n"));
    }
    sections.push({ heading: "Monthly HOA Financials", body: blocks.join("\n\n") });
  }

  return {
    headline: title || ORG_NAME,
    tagline: `${issueDate} HOA Newsletter`,
    sections,
    callToAction: { text: "", instruction: "" },
    closingMessage: "From the Sterling at Silver Springs Board of Directors",
  };
}
