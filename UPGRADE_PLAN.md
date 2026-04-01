# Sterling CMS - File Storage & Calendar Upgrade Plan

## What's Being Added

### 1. **Community Calendar System**
**Admin Side:**
- New "Events" tab in admin dashboard
- Create/edit/delete events with:
  - Title, description, date/time
  - Category (Board Meeting, Community Event, Maintenance, Deadline)
  - Location, recurrence options

**Frontend Side:**
- Activities page shows full calendar with:
  - Board meetings from `board_meetings` table
  - Community events from `events` table
  - Color-coded by category
  - Chronological list view with filtering

### 2. **Document Storage & Management**
**Storage Bucket Created:**
- `documents` bucket (public, 10MB limit)
- Accepts: PDF, DOC, DOCX, XLS, XLSX, TXT, PNG, JPG

**Admin Side:**
- Documents panel gets file upload button
- Upload files directly to Supabase Storage
- Set document name, category (Governing, Forms, Templates, Other)
- Files stored with unique paths
- Delete removes file from storage + database

**Frontend Side:**
- Resources page displays ALL uploaded documents by category:
  - **Governing Documents** section
  - **Forms & Applications** section
  - **Board & Committee Documents** section (auth-protected)
- Each document shows:
  - Name, file type icon, file size
  - "View" button (opens in new tab)
  - "Download" button
- Replaces placeholder Google Drive embeds

### 3. **Service Providers** (Already Working)
- Admin can add/edit/delete vendors
- Already shows on Resources page dynamically

## Technical Changes

**HTML Changes:**
1. Add `<button class="admin-tab" data-tab="events">Events</button>`
2. Add Events admin panel HTML
3. Add file upload input to Documents panel
4. Update Resources page document sections
5. Update Activities page to show events

**JavaScript Changes:**
1. Add `events` to `tabMap` in `Admin.loadTab()`
2. Add `events` to `tableFields` for modal forms
3. Add file upload handlers: `SSS.uploadDocument()`, `SSS.deleteDocument()`
4. Add `DS.getEvents()` and `R.eventsCalendar()` functions
5. Update `loadActivities()` to combine meetings + events
6. Add `loadDocuments()` for Resources page

**Database:**
- Storage bucket already created ✅
- `events` table already exists ✅
- `documents` table already exists ✅

## Files to Modify
- `/Users/johnmelvin/Sterling at Silver Springs/site-content/preview/index.html` (all changes)

## Estimated Impact
- **Admin tabs:** 15 → 16 (adding Events)
- **New functions:** ~300 lines of JavaScript
- **HTML additions:** ~200 lines
- **Zero breaking changes** - all existing functionality preserved

---

**Ready to proceed with full implementation?**
