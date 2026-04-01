# Submit a Request — Google Form Specification

## Setup Instructions
1. Go to forms.google.com and create a new form
2. Title: "Sterling at Silver Springs — Submit a Request"
3. Description: "Use this form to submit questions, concerns, or requests to the Sterling at Silver Springs Board of Directors. You will receive a confirmation email with a reference number."
4. Settings:
   - Collect email addresses: YES (required)
   - Limit to 1 response: NO (allow multiple submissions)
   - Show progress bar: NO
   - Confirmation message: "Thank you! Your request has been submitted. You will receive a confirmation email shortly with your reference number. For emergencies, call [property manager phone] immediately."

---

## Form Fields

### Field 1: Resident Name
- **Type:** Short answer
- **Required:** Yes
- **Validation:** None
- **Placeholder:** "Your full name"

### Field 2: Email Address
- **Type:** Collected automatically via Google Forms "Collect email addresses" setting
- **Required:** Yes (automatic)

### Field 3: Phone Number
- **Type:** Short answer
- **Required:** No
- **Validation:** None
- **Placeholder:** "Optional — in case we need to call you"

### Field 4: Street Address
- **Type:** Short answer
- **Required:** Yes
- **Validation:** None
- **Placeholder:** "Your street address within Sterling at Silver Springs"

### Field 5: Request Topic
- **Type:** Dropdown
- **Required:** Yes
- **Options (17 items — alphabetical order, MUST match Routing Config sheet exactly):**
  1. Administrative
  2. Amenities
  3. Architectural
  4. Clubhouse
  5. Fencing
  6. Gates/Security
  7. Key/Fob
  8. Landscaping
  9. Lighting
  10. Mailboxes
  11. Maintenance
  12. Pavement
  13. Pool/Spa
  14. Signs
  15. Trash
  16. Violations
  17. Water/Irrigation

> **IMPORTANT:** These topics must be entered in the Google Form dropdown in this exact alphabetical order. They must also EXACTLY match the topics in the "Routing Config" sheet tab (case-insensitive).

### Field 6: Subject Line
- **Type:** Short answer
- **Required:** Yes
- **Validation:** None
- **Placeholder:** "Brief summary of your request"

### Field 7: Description
- **Type:** Paragraph (long answer)
- **Required:** Yes
- **Validation:** None
- **Placeholder:** "Please provide details about your request, question, or concern. Include relevant dates, locations, and any other helpful information."

### Field 8: File Upload
- **Type:** File upload
- **Required:** No
- **File types:** Image, PDF, Document
- **Max files:** 3
- **Max file size:** 10 MB
- **Description:** "Optional — attach photos, documents, or other files related to your request"

### Field 9: Preferred Contact Method
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - Email
  - Phone
  - Either

---

## After Creating the Form

1. Click "Responses" tab → Click the Google Sheets icon → "Create a new spreadsheet"
2. Name the spreadsheet: "Sterling at Silver Springs — Requests"
3. In the spreadsheet, create a second tab called "Routing Config" (see routing-config-template.md)
4. Go to Extensions → Apps Script → paste the email-routing.gs script
5. Set up the trigger (see script instructions)
6. Test with a sample submission
7. Copy the form's embed URL for the Google Site
