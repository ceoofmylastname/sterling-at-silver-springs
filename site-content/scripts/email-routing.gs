/**
 * Sterling at Silver Springs — Email Routing Script
 *
 * PURPOSE: Automatically routes "Submit a Request" form submissions to the
 * correct recipient(s) based on the selected topic. Also sends a confirmation
 * email to the resident and BCCs an archive mailbox.
 *
 * HOW IT WORKS:
 * 1. A resident submits the "Submit a Request" Google Form
 * 2. This script triggers automatically on form submission
 * 3. It reads the "Topic" from the submission
 * 4. It looks up the recipient(s) in the "Routing Config" sheet
 * 5. It sends a formatted email to the recipient(s)
 * 6. It sends a confirmation email to the resident
 * 7. It BCCs the archive mailbox for recordkeeping
 *
 * SETUP INSTRUCTIONS:
 * 1. Open the Google Sheet that's linked to your "Submit a Request" form
 * 2. Create a second sheet tab called "Routing Config" (see routing-config-template.md)
 * 3. Go to Extensions → Apps Script
 * 4. Paste this entire script
 * 5. Click the clock icon (Triggers) → Add Trigger:
 *    - Function: onFormSubmit
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 * 6. Authorize the script when prompted
 * 7. Test by submitting a test form entry
 *
 * TO UPDATE ROUTING: Just edit the "Routing Config" sheet tab. No code changes needed.
 */

// ============================================================
// CONFIGURATION — Edit these values for your community
// ============================================================

const CONFIG = {
  // The name of the sheet tab with routing rules
  ROUTING_SHEET_NAME: 'Routing Config',

  // Archive email — receives a BCC of every routed email
  ARCHIVE_EMAIL: 'sterlingatsilversprings+archive@gmail.com',

  // Community name (used in email subject lines and body)
  COMMUNITY_NAME: 'Sterling at Silver Springs',

  // Default recipient if no routing match is found
  FALLBACK_EMAIL: 'sterlingatsilversprings@gmail.com',

  // Property manager email (CC'd on certain topics if desired)
  PROPERTY_MANAGER_EMAIL: '',  // Fill in when available

  // Expected response time (shown in confirmation email)
  RESPONSE_DAYS: 5,
};

// ============================================================
// MAIN FUNCTION — Triggered on every form submission
// ============================================================

function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const response = e.namedValues;

    // Extract form fields — adjust these keys to match your exact form question text
    const residentName = getFieldValue(response, 'Resident Name') || 'Resident';
    const residentEmail = getFieldValue(response, 'Email') || getFieldValue(response, 'Email Address');
    const residentPhone = getFieldValue(response, 'Phone') || '';
    const residentAddress = getFieldValue(response, 'Address') || getFieldValue(response, 'Street Address') || '';
    const topic = getFieldValue(response, 'Topic') || getFieldValue(response, 'Request Topic') || 'Administrative';
    const subject = getFieldValue(response, 'Subject') || getFieldValue(response, 'Subject Line') || topic;
    const description = getFieldValue(response, 'Description') || getFieldValue(response, 'Details') || '';
    const contactPref = getFieldValue(response, 'Preferred Contact Method') || 'Email';

    // Generate a reference number (timestamp-based)
    const refNumber = generateRefNumber();

    // Look up routing for this topic
    const routing = getRouting(sheet, topic);

    // Send the routed email to the appropriate recipient(s)
    sendRoutedEmail(routing, {
      residentName,
      residentEmail,
      residentPhone,
      residentAddress,
      topic,
      subject,
      description,
      contactPref,
      refNumber,
    });

    // Send confirmation email to the resident
    if (residentEmail) {
      sendConfirmationEmail(residentEmail, {
        residentName,
        topic,
        subject,
        refNumber,
      });
    }

    // Log the reference number back to the spreadsheet (optional)
    logRefNumber(sheet, refNumber);

  } catch (error) {
    // Log error and send alert to fallback email
    console.error('Email routing error:', error);
    MailApp.sendEmail({
      to: CONFIG.FALLBACK_EMAIL,
      subject: `[${CONFIG.COMMUNITY_NAME}] Email Routing Error`,
      body: `An error occurred while routing a form submission:\n\n${error.message}\n\nCheck the Apps Script logs for details.`,
    });
  }
}

// ============================================================
// ROUTING LOOKUP
// ============================================================

/**
 * Looks up the routing configuration for a given topic.
 * Reads from the "Routing Config" sheet tab.
 *
 * Expected columns in Routing Config sheet:
 * A: Topic (must match form dropdown exactly)
 * B: Recipient Email(s) (comma-separated for multiple)
 * C: CC Email(s) (optional, comma-separated)
 * D: Response Template (custom confirmation message, optional)
 * E: Expected Response Days (optional override)
 */
function getRouting(sheet, topic) {
  const routingSheet = sheet.getSheetByName(CONFIG.ROUTING_SHEET_NAME);

  if (!routingSheet) {
    console.error('Routing Config sheet not found!');
    return {
      to: CONFIG.FALLBACK_EMAIL,
      cc: '',
      template: '',
      responseDays: CONFIG.RESPONSE_DAYS,
    };
  }

  const data = routingSheet.getDataRange().getValues();

  // Skip header row (row 0), search for matching topic
  for (let i = 1; i < data.length; i++) {
    const sheetTopic = String(data[i][0]).trim().toLowerCase();
    const submittedTopic = String(topic).trim().toLowerCase();

    if (sheetTopic === submittedTopic) {
      return {
        to: String(data[i][1]).trim() || CONFIG.FALLBACK_EMAIL,
        cc: String(data[i][2]).trim() || '',
        template: String(data[i][3]).trim() || '',
        responseDays: data[i][4] || CONFIG.RESPONSE_DAYS,
      };
    }
  }

  // No match found — use fallback
  console.warn(`No routing found for topic: "${topic}". Using fallback.`);
  return {
    to: CONFIG.FALLBACK_EMAIL,
    cc: '',
    template: '',
    responseDays: CONFIG.RESPONSE_DAYS,
  };
}

// ============================================================
// EMAIL FUNCTIONS
// ============================================================

/**
 * Sends the routed email to the appropriate board member/committee.
 */
function sendRoutedEmail(routing, data) {
  const emailBody = `
New ${data.topic} Request — ${CONFIG.COMMUNITY_NAME}
${'='.repeat(55)}

Reference #: ${data.refNumber}
Submitted: ${new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })}

RESIDENT INFORMATION
---------------------
Name:     ${data.residentName}
Email:    ${data.residentEmail}
Phone:    ${data.residentPhone || 'Not provided'}
Address:  ${data.residentAddress}
Preferred Contact: ${data.contactPref}

REQUEST DETAILS
---------------------
Topic:    ${data.topic}
Subject:  ${data.subject}

Description:
${data.description}

---------------------
This request was submitted through the ${CONFIG.COMMUNITY_NAME} website.
A confirmation email has been sent to the resident.
Reference #${data.refNumber} — please include this in your reply.
  `.trim();

  const emailOptions = {
    to: routing.to,
    subject: `[${CONFIG.COMMUNITY_NAME}] ${data.topic}: ${data.subject}`,
    body: emailBody,
    bcc: CONFIG.ARCHIVE_EMAIL,
    replyTo: data.residentEmail,
  };

  // Add CC if specified
  if (routing.cc) {
    emailOptions.cc = routing.cc;
  }

  MailApp.sendEmail(emailOptions);
}

/**
 * Sends a confirmation email to the resident.
 */
function sendConfirmationEmail(residentEmail, data) {
  const routing = getRouting(SpreadsheetApp.getActiveSpreadsheet(), data.topic);
  const customTemplate = routing.template;
  const responseDays = routing.responseDays || CONFIG.RESPONSE_DAYS;

  const confirmationBody = `
Dear ${data.residentName},

Thank you for contacting the ${CONFIG.COMMUNITY_NAME} Board of Directors.

${customTemplate || `We have received your request regarding "${data.topic}" and it has been forwarded to the appropriate person for review.`}

YOUR REFERENCE NUMBER: ${data.refNumber}
Please include this number in any follow-up communications.

WHAT HAPPENS NEXT:
- Your request has been received and logged
- The appropriate board member or committee has been notified
- You can expect a response within ${responseDays} business days

If your matter is urgent or an emergency, please contact the property manager directly:
[Property Manager Name]
[Property Manager Phone]
[Property Manager Email]

Thank you for being an active part of our community.

Best regards,
${CONFIG.COMMUNITY_NAME} Board of Directors

---
This is an automated confirmation. Please do not reply to this email.
To submit a new request, visit our website.
  `.trim();

  MailApp.sendEmail({
    to: residentEmail,
    subject: `[${CONFIG.COMMUNITY_NAME}] Request Received — Ref #${data.refNumber}`,
    body: confirmationBody,
    noReply: true,
  });
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generates a reference number from timestamp.
 * Format: SS-YYYYMMDD-HHMM (e.g., SS-20260330-1425)
 */
function generateRefNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `SS-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Safely extracts a field value from the form response.
 * Google Forms returns arrays for each field — this gets the first value.
 */
function getFieldValue(response, fieldName) {
  // Try exact match first
  if (response[fieldName] && response[fieldName][0]) {
    return response[fieldName][0].trim();
  }

  // Try case-insensitive partial match
  const keys = Object.keys(response);
  for (const key of keys) {
    if (key.toLowerCase().includes(fieldName.toLowerCase())) {
      if (response[key] && response[key][0]) {
        return response[key][0].trim();
      }
    }
  }

  return '';
}

/**
 * Logs the reference number to the last column of the most recent form submission row.
 */
function logRefNumber(sheet, refNumber) {
  const formSheet = sheet.getSheets()[0]; // First sheet = form responses
  const lastRow = formSheet.getLastRow();
  const lastCol = formSheet.getLastColumn();

  // Check if a "Reference #" header exists; if not, create it
  const headerRow = formSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  let refCol = headerRow.indexOf('Reference #');

  if (refCol === -1) {
    // Add "Reference #" header in the next column
    refCol = lastCol; // 0-indexed, so this becomes lastCol + 1 in Sheets
    formSheet.getRange(1, refCol + 1).setValue('Reference #');
  }

  // Write the reference number
  formSheet.getRange(lastRow, refCol + 1).setValue(refNumber);
}

// ============================================================
// SUGGESTION BOX SCRIPT (optional — add to the Suggestion Box sheet)
// ============================================================

/**
 * Handles Suggestion Box form submissions.
 * Set up a separate trigger on the Suggestion Box spreadsheet.
 *
 * This function:
 * 1. Logs the suggestion
 * 2. Sends a response email IF the resident requested one
 * 3. Sends a notification to the board
 */
function onSuggestionSubmit(e) {
  try {
    const response = e.namedValues;

    const name = getFieldValue(response, 'Name') || 'Anonymous';
    const category = getFieldValue(response, 'Category') || getFieldValue(response, 'Suggestion Category') || 'General';
    const suggestion = getFieldValue(response, 'Suggestion') || getFieldValue(response, 'Your Suggestion') || '';
    const wantsResponse = getFieldValue(response, 'Would you like a response') || 'No';
    const email = getFieldValue(response, 'Email') || '';

    // Notify the board
    MailApp.sendEmail({
      to: CONFIG.FALLBACK_EMAIL, // Board general email
      subject: `[${CONFIG.COMMUNITY_NAME}] New Suggestion: ${category}`,
      body: `
New Suggestion Received
========================

From: ${name}
Category: ${category}
Wants Response: ${wantsResponse}
${email ? `Email: ${email}` : ''}

Suggestion:
${suggestion}

---
Submitted via the ${CONFIG.COMMUNITY_NAME} Suggestion Box.
      `.trim(),
      bcc: CONFIG.ARCHIVE_EMAIL,
    });

    // Send acknowledgment if requested
    if (wantsResponse.toLowerCase().includes('yes') && email) {
      MailApp.sendEmail({
        to: email,
        subject: `[${CONFIG.COMMUNITY_NAME}] Thank You for Your Suggestion`,
        body: `
Dear ${name},

Thank you for your suggestion regarding "${category}." We appreciate you taking the time to share your ideas for improving our community.

Your suggestion will be reviewed by the board at the next scheduled meeting. If your idea is selected for implementation, we'll follow up with you directly.

Best regards,
${CONFIG.COMMUNITY_NAME} Board of Directors

---
This is an automated acknowledgment. If you need to follow up, please use the Submit a Request form on our website.
        `.trim(),
        noReply: true,
      });
    }

  } catch (error) {
    console.error('Suggestion Box error:', error);
  }
}
