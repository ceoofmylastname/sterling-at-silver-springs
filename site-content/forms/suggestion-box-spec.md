# Suggestion Box — Google Form Specification

## Setup Instructions
1. Go to forms.google.com and create a new form
2. Title: "Sterling at Silver Springs — Suggestion Box"
3. Description: "Share your ideas for improving our community! Submissions can be anonymous. If you'd like a response, please include your email address."
4. Settings:
   - Collect email addresses: NO (allow anonymous)
   - Limit to 1 response: NO
   - Show progress bar: NO
   - Confirmation message: "Thank you for your suggestion! All suggestions are reviewed by the board. If you requested a response, we'll get back to you soon."

---

## Form Fields

### Field 1: Your Name
- **Type:** Short answer
- **Required:** No
- **Placeholder:** "Optional — leave blank to submit anonymously"

### Field 2: Suggestion Category
- **Type:** Dropdown
- **Required:** Yes
- **Options:**
  1. Community Events & Activities
  2. Maintenance & Grounds
  3. Rules & Policies
  4. Communication & Website
  5. Amenities & Facilities
  6. Safety & Security
  7. Other

### Field 3: Your Suggestion
- **Type:** Paragraph (long answer)
- **Required:** Yes
- **Placeholder:** "Tell us your idea! What would you like to see in our community?"

### Field 4: Would you like a response?
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - Yes, please follow up with me
  - No, just sharing an idea

### Field 5: Email Address
- **Type:** Short answer
- **Required:** No
- **Validation:** Email format
- **Placeholder:** "Required only if you selected 'Yes' above"
- **Description:** "We'll only use this to respond to your suggestion."

> **Google Forms tip:** You can use "Go to section based on answer" to show the email field only when "Yes" is selected for Field 4. This makes the form cleaner.

---

## After Creating the Form

1. Click "Responses" tab → Click the Google Sheets icon → "Create a new spreadsheet"
2. Name the spreadsheet: "Sterling at Silver Springs — Suggestions"
3. In the spreadsheet, go to Extensions → Apps Script
4. Paste the `onSuggestionSubmit` function from email-routing.gs
5. Set up a trigger: Function: onSuggestionSubmit, Event: On form submit
6. Test with a sample submission
7. Copy the form's embed URL for the Google Site
