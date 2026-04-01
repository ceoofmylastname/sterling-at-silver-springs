# Routing Config — Google Sheet Template

## Setup Instructions
1. Open the Google Sheet linked to your "Submit a Request" form
2. Click the "+" button at the bottom to add a new sheet tab
3. Rename the new tab to **Routing Config** (must match exactly)
4. Copy the table below into the sheet, starting at cell A1

## Column Layout

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| **Topic** | **Recipient Email(s)** | **CC Email(s)** | **Response Template** | **Expected Response Days** |

## How It Works
- **Topic** (Column A): Must match the form dropdown option EXACTLY (case-insensitive)
- **Recipient Email(s)** (Column B): Who gets the email. For multiple recipients, separate with commas (e.g., `person1@email.com, person2@email.com`)
- **CC Email(s)** (Column C): Optional. Anyone who should get a copy. Leave blank if not needed
- **Response Template** (Column D): Optional. Custom confirmation message sent to the resident. If blank, a generic confirmation is used
- **Expected Response Days** (Column E): Optional. Override the default 5-day response time. Enter a number (e.g., `3` or `10`)

## The 17 Topics (Alphabetical Order)

Copy this into the sheet starting at row 2 (row 1 is the header). Fill in the actual email addresses for your board members and property manager.

```
| Topic              | Recipient Email(s)              | CC                          | Response Template                                                                                   | Days |
|--------------------|---------------------------------|-----------------------------|-----------------------------------------------------------------------------------------------------|------|
| Administrative     | [board-president@email.com]     | [propertymanager@email.com] | Your administrative request has been received and forwarded to the Board President.                   | 5    |
| Amenities          | [propertymanager@email.com]     | [board@email.com]           | Your amenity concern has been received and forwarded to property management.                          | 3    |
| Architectural      | [arc-chair@email.com]           | [propertymanager@email.com] | Your architectural request is under review. The ARC committee reviews submissions within 30 days.    | 30   |
| Clubhouse          | [propertymanager@email.com]     |                             | Your clubhouse request has been received. We will follow up shortly.                                 | 3    |
| Fencing            | [propertymanager@email.com]     | [landscape-chair@email.com] | Your fencing concern has been logged and forwarded for review.                                        | 5    |
| Gates/Security     | [propertymanager@email.com]     | [board-president@email.com] | Your gate/security concern has been received and is being reviewed as a priority.                     | 2    |
| Key/Fob            | [propertymanager@email.com]     |                             | Your key/fob request has been received. Please allow 3 business days for processing.                 | 3    |
| Landscaping        | [landscape-chair@email.com]     | [propertymanager@email.com] | Your landscaping concern has been forwarded to the Landscape Committee.                               | 5    |
| Lighting           | [propertymanager@email.com]     |                             | Your lighting concern has been received and forwarded to property management.                         | 3    |
| Mailboxes          | [propertymanager@email.com]     |                             | Your mailbox request has been received. We will coordinate with the postal service if needed.         | 5    |
| Maintenance        | [propertymanager@email.com]     | [board@email.com]           | Your maintenance request has been logged and forwarded to our property manager.                       | 3    |
| Pavement           | [propertymanager@email.com]     |                             | Your pavement concern has been received and will be assessed.                                        | 5    |
| Pool/Spa           | [propertymanager@email.com]     |                             | Your pool/spa concern has been received and forwarded to property management.                         | 3    |
| Signs              | [propertymanager@email.com]     | [board-president@email.com] | Your signage request has been received and will be reviewed by the board.                             | 5    |
| Trash              | [propertymanager@email.com]     |                             | Your trash/waste concern has been received. We will coordinate with the waste provider if needed.     | 3    |
| Violations         | [propertymanager@email.com]     | [board-president@email.com] | Your report has been received and will be investigated confidentially.                                | 5    |
| Water/Irrigation   | [propertymanager@email.com]     | [landscape-chair@email.com] | Your water/irrigation concern has been received and forwarded for review.                             | 3    |
```

> **NOTE:** Replace all `[bracketed emails]` with actual email addresses. The topics in Column A must match the Google Form dropdown EXACTLY.

## IMPORTANT NOTES FOR THE BOARD

### To Change Who Receives Emails:
1. Open this Google Sheet
2. Go to the "Routing Config" tab
3. Find the topic row you want to change
4. Edit the email address in Column B or C
5. Save — changes take effect immediately. No code changes needed!

### To Add a New Topic:
1. Add a new row at the bottom of the Routing Config tab
2. Fill in the topic name (must also be added to the Google Form dropdown)
3. Fill in the recipient email(s)
4. The script will automatically pick up the new topic

### To Remove a Topic:
1. Delete the row from the Routing Config tab
2. Also remove the option from the Google Form dropdown
3. If someone submits the old topic before you remove it from the form, it will go to the fallback email

### Common Issues:
- **Emails not sending?** Check that the script is authorized (Extensions → Apps Script → Triggers)
- **Wrong person getting emails?** Check the Routing Config tab for typos in email addresses
- **Resident not getting confirmation?** Check their spam folder. The confirmation comes from the Gmail account that owns the spreadsheet
