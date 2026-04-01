# Sterling at Silver Springs — Website Admin Guide

**For Board Members & Property Manager**
Last Updated: March 30, 2026

---

## Table of Contents
1. [Quick Reference — Who Does What](#1-quick-reference)
2. [How to Post an Announcement](#2-post-announcement)
3. [How to Upload a Newsletter](#3-upload-newsletter)
4. [How to Add a Calendar Event](#4-calendar-event)
5. [How to Toggle the Emergency Banner](#5-emergency-banner)
6. [How to Update Email Routing](#6-email-routing)
7. [How to Add/Remove Board Members & Editors](#7-manage-access)
8. [How to Update the FAQ](#8-update-faq)
9. [How to Manage the Board-Only Section](#9-board-only)
10. [How to Upload Documents to Resources](#10-upload-docs)
11. [How to Update Contact Information](#11-update-contacts)
12. [Troubleshooting Common Issues](#12-troubleshooting)
13. [Account Credentials & Recovery](#13-credentials)
14. [Architecture Overview — How Everything Connects](#14-architecture)

---

## 1. Quick Reference — Who Does What {#1-quick-reference}

| Task | Who Can Do It | How Often |
|------|--------------|-----------|
| Post announcements | Any site editor (board member) | As needed |
| Upload newsletters | Any site editor | Monthly |
| Add calendar events | Any calendar editor (board + committee chairs) | As needed |
| Toggle emergency banner | Any site editor | Emergency only |
| Change email routing | Anyone with spreadsheet access | Rarely |
| Add/remove site editors | Site owner (admin account) | When board changes |
| Upload governing documents | Any site editor | Rarely |
| Update FAQ | Any site editor | As needed |

---

## 2. How to Post an Announcement {#2-post-announcement}

**Time needed:** 2-3 minutes

1. Go to [your Google Sites URL]
2. Click the **pencil icon** (Edit) in the top right
3. Navigate to the **Announcements** page
4. Click at the **TOP** of the announcements list (newest goes first)
5. Type or paste your announcement using this format:

```
---
**[Month Day, Year] — [Title]**

[Your announcement text here. Keep it clear and concise.]

**Action Required:** [Yes/No]
**Deadline:** [Date if applicable]
**Questions?** Contact [name] at [email] or use Submit a Request.
---
```

6. To attach a PDF: Click **Insert** → **Drive** → select your file
7. Click **Publish** (top right, blue button)
8. **(Optional)** Update the "Latest Announcement" preview on the Home page

---

## 3. How to Upload a Newsletter {#3-upload-newsletter}

**Time needed:** 1-2 minutes

### Method A: Upload to Google Drive (Recommended)
1. Open Google Drive → Navigate to **03-Newsletters** folder
2. Click **+ New** → **File upload** → Select the PDF
3. Name the file consistently: `Newsletter-2026-04-April.pdf`
4. The file will automatically appear on the Newsletters page (embedded folder)

### Method B: Also update the "Latest Issue" on the website
1. Go to the site → Edit → Newsletters page
2. Update the "Latest Issue" section with the new month, summary, and download link
3. Click **Publish**

---

## 4. How to Add a Calendar Event {#4-calendar-event}

**Time needed:** 1-2 minutes

**You do NOT need to edit the website to add calendar events.** The calendar is embedded — any changes in Google Calendar automatically appear on the site.

1. Open **Google Calendar** (calendar.google.com)
2. Make sure you're signed into the community account or your authorized account
3. Click on the date you want
4. Fill in:
   - **Title:** Clear, descriptive name (e.g., "Board Meeting — April")
   - **Date & Time**
   - **Location** (optional)
   - **Description:** Include any details, links, or agendas
5. Set the **color** based on event type:
   - Blue = Board Meeting
   - Green = Committee Meeting
   - Orange = Community Event
   - Yellow = Maintenance/Landscaping
   - Red = Deadline/Due Date
6. Click **Save**

The event immediately shows up on the website — no publishing needed.

---

## 5. How to Toggle the Emergency Banner {#5-emergency-banner}

**Time needed:** 30 seconds

### To SHOW the banner:
1. Go to the site → Click **Edit** (pencil icon)
2. Go to the **Home** page
3. At the very top, you should see a red/orange section
4. Click into it and type your alert message:
   ```
   COMMUNITY ALERT: [Your message here]
   ```
5. Click **Publish**

### To HIDE the banner:
1. Edit the Home page
2. Delete the text inside the red section (or delete the entire section)
3. Click **Publish**

**Tip:** Keep an empty red section as a "template" — when you need it, just add text. When you don't, delete the text and the section collapses.

---

## 6. How to Update Email Routing {#6-email-routing}

**Time needed:** 1 minute

**Scenario:** A board member changes, a committee chair rotates, or you need to update who receives certain request types.

1. Open the **"Sterling at Silver Springs — Requests"** Google Sheet
2. Click the **"Routing Config"** tab at the bottom
3. Find the row for the topic you want to change
4. Edit the email address in **Column B** (recipient) or **Column C** (CC)
5. Save — changes take effect **immediately**

**No code changes, no website editing, no tech skills needed.**

### Example:
If the Landscaping Committee gets a new chair:
- Find the "Landscaping & Grounds" row
- Change the email in Column B from the old chair's email to the new one
- Done

---

## 7. How to Add/Remove Board Members & Editors {#7-manage-access}

### Add a New Site Editor:
1. Sign into the community Google account
2. Open Google Sites → Open the community site
3. Click the **share icon** (person with +) in the top right
4. Enter the new person's email address
5. Set permission to **Editor**
6. Click **Send**

### Remove a Site Editor:
1. Same share menu → find the person → click the dropdown next to their name
2. Select **Remove**

### Add a Calendar Editor:
1. Open Google Calendar → Settings (gear icon)
2. Click on the community calendar name
3. Scroll to "Share with specific people or groups"
4. Click **+ Add people and groups**
5. Enter their email → set to **"Make changes to events"**

### Update Google Drive Access:
1. Open Google Drive → Right-click the shared folder
2. Click **Share** → add/remove people as needed

---

## 8. How to Update the FAQ {#8-update-faq}

**Time needed:** 2-3 minutes

1. Go to the site → Click **Edit**
2. Navigate to the **FAQ** page
3. To add a new Q&A:
   - Click where you want to add it (within the correct category)
   - Type the question in **bold**
   - Type the answer below it
4. To edit an existing answer: Click on it and modify
5. To remove a Q&A: Select it and delete
6. Click **Publish**

**Tip:** If a question gets asked 3+ times via the Submit a Request form, add it to the FAQ.

---

## 9. How to Manage the Board-Only Section {#9-board-only}

The Board-Only section is a **restricted sub-page** under Resources. Only authorized Google accounts can view it.

### Upload a Board Document:
1. Open Google Drive → Navigate to **05-Board-Only** folder
2. Upload the file (budget, legal doc, insurance cert, etc.)
3. It automatically appears on the Board-Only page (embedded folder)

### Add/Remove Access:
1. Open Google Sites → go to the Board-Only page
2. Click the **share/settings** for that page
3. Set page visibility to **"Restricted"**
4. Add/remove specific Google accounts

**Important:** When a board member's term ends, remove their access to this section.

---

## 10. How to Upload Documents to Resources {#10-upload-docs}

1. Open Google Drive
2. Navigate to the appropriate folder:
   - **01-Governing Documents** — CC&Rs, Bylaws, Rules
   - **04-Forms** — Downloadable forms for residents
3. Click **+ New** → **File upload**
4. Upload the PDF
5. The document automatically appears on the Resources page

**Tip:** When updating a document (e.g., new version of Rules & Regs):
- Rename the old file to include "_SUPERSEDED" or move it to an archive subfolder
- Upload the new version with the same name
- This avoids broken links

---

## 11. How to Update Contact Information {#11-update-contacts}

1. Go to the site → Click **Edit**
2. Navigate to the **Contact Us** page
3. Click on the text you need to change (name, email, phone)
4. Make your edits
5. Also update contact info on:
   - **Home** page (footer, Quick Info Bar)
   - **New Residents** page (Who to Contact table)
6. Click **Publish**

**When a board member changes:** Update Contact Us, Home footer, and the email routing spreadsheet (Section 6).

---

## 12. Troubleshooting Common Issues {#12-troubleshooting}

### "Residents aren't getting confirmation emails"
- Check the Apps Script trigger is still active:
  1. Open the Requests spreadsheet
  2. Extensions → Apps Script → Clock icon (Triggers)
  3. Verify the trigger exists and hasn't failed
- Check the resident's spam/junk folder
- Check the Gmail daily sending limit (500/day for free Gmail)

### "The form isn't showing on the website"
- The form embed URL may have changed
- Re-embed: Edit the page → delete the old embed → Insert → Embed → paste the form URL

### "Calendar events aren't showing on the site"
- Make sure the event is on the **community calendar**, not a personal calendar
- Check that the calendar embed URL hasn't changed

### "I can't edit the website"
- Make sure you're signed into the correct Google account
- Check that your account has Editor permissions (see Section 7)

### "The routing script stopped working"
- Open the spreadsheet → Extensions → Apps Script
- Check the **Executions** tab for errors
- Re-authorize the script if Google revoked permissions (this can happen periodically)

### "I accidentally deleted something"
- Google Sites has version history: Edit → three dots menu → **Version history**
- Google Drive files can be recovered from Trash within 30 days

---

## 13. Account Credentials & Recovery {#13-credentials}

### Community Google Account
- **Email:** [sterlingatsilversprings@gmail.com]
- **Password:** [stored securely — see board president]
- **Recovery email:** [board president's personal email]
- **Recovery phone:** [board president's phone]

### Connected Services
| Service | Login | Notes |
|---------|-------|-------|
| Google Sites | Community Google account | The website itself |
| Google Drive | Community Google account | All documents, forms, photos |
| Google Calendar | Community Google account | Shared calendar |
| Google Forms | Community Google account | Request form + Suggestion Box |
| Google Sheets | Community Google account | Form responses + routing config |
| Domain Registrar | [TBD] | Only if a custom domain is purchased |

### When Leadership Changes
1. Change the Google account password
2. Update the recovery email and phone
3. Remove former board members from site editors, Drive, and Calendar
4. Add new board members
5. Update the Routing Config spreadsheet
6. Update the Contact Us page
7. Update the Home page footer

---

## 14. Architecture Overview — How Everything Connects {#14-architecture}

```
RESIDENT VISITS WEBSITE (Google Sites)
         │
         ├── Views pages (Announcements, FAQ, Meetings, etc.)
         │     └── Content managed by: Board editors via Google Sites
         │
         ├── Views Calendar (embedded)
         │     └── Managed by: Board + Committee chairs via Google Calendar
         │
         ├── Downloads Documents (embedded Google Drive folders)
         │     └── Managed by: Upload PDFs to Google Drive folders
         │
         ├── Submits a Request (embedded Google Form)
         │     │
         │     ├── Response logged → Google Sheet ("Requests" tab)
         │     │
         │     ├── Google Apps Script triggers:
         │     │     ├── Reads "Topic" from submission
         │     │     ├── Looks up recipient in "Routing Config" tab
         │     │     ├── Sends formatted email → correct board member/committee
         │     │     ├── BCCs → archive mailbox
         │     │     └── Sends confirmation → resident (with reference #)
         │     │
         │     └── Board updates routing by editing the spreadsheet
         │
         └── Submits a Suggestion (embedded Google Form)
               │
               ├── Response logged → Google Sheet ("Suggestions" tab)
               │
               └── Apps Script sends notification → board email
                     └── If response requested → sends acknowledgment to resident
```

### Key Principle
**Everything runs through Google.** One account, one ecosystem. No external services, no paid subscriptions, no dependencies that can break. If someone can use Gmail, they can manage this website.
