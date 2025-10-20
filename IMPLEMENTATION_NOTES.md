# Summary Generation Wizard - Implementation Notes

## What Was Implemented

A complete MVP flow for generating personalized book summaries with user preference overrides.

### Components Created

1. **GenerateSummaryModal** (`components/summary/GenerateSummaryModal.tsx`)
   - Modal wizard for summary generation
   - Loads user's saved preferences by default
   - Allows override of style and length preferences
   - Matches the design of the Preferences page
   - Shows success notification on generation start

2. **API Endpoint** (`app/api/v1/summary/route.ts`)
   - POST endpoint that accepts `book_id` and `preferences`
   - Calls n8n webhook with the payload
   - Skips auth check (as requested, since auth is TBD)
   - Returns detailed error messages for debugging

3. **Library Integration** (`app/dashboard/library/page.tsx`)
   - "Generate Summary" button opens the wizard modal
   - Passes selected book to the modal

## Webhook Payload Structure

When a user clicks "Generate Summary", the following JSON payload is sent to the n8n webhook:

```json
{
  "book_id": "string",
  "preferences": {
    "style": "narrative" | "bullet_points" | "workbook",
    "length": "1pg" | "5pg" | "15pg"
  },
  "user_id": "anonymous",
  "timestamp": "2025-10-19T23:55:00.000Z"
}
```

## Environment Variable Required

Make sure `.env.local` has the n8n webhook URL configured:

```bash
N8N_WEBHOOK_URL=https://n8n.megyk.com/webhook-test/get_book_summary
```

## Testing the Flow

### 1. Start the Development Server
```bash
yarn dev
```

### 2. Navigate to Library
- Go to `http://localhost:3001/dashboard/library`
- You should see the book library table

### 3. Click "Generate Summary"
- Click the "Generate Summary" button on any book row
- The wizard modal will open

### 4. Adjust Preferences (Optional)
- The sliders will be pre-populated with your saved preferences
- You can adjust the style and length for this specific generation
- See the real-time preview of your selections

### 5. Generate
- Click the "Generate Summary" button in the modal
- The app will call `/api/v1/summary` which forwards to n8n
- A success notification will appear (green toast)
- The modal will close automatically

## Current Behavior - Synchronous PDF Download

The app now supports **immediate PDF download** for the best demo experience:

1. User clicks "Generate Summary" in the wizard
2. Modal shows loading state with message: "This may take a few moments..."
3. Next.js API calls n8n webhook and **waits** for the response
4. n8n generates the PDF and returns it as binary data
5. Next.js streams the PDF to the browser
6. Browser automatically downloads the PDF
7. Success notification shows: "Summary Generated!"

### n8n Configuration Required

For this to work, your n8n workflow must:

1. **Accept POST requests** at the webhook URL ✅
2. **Return PDF binary** with `Content-Type: application/pdf` header
3. **Respond synchronously** (don't use async processing)

Currently, n8n is returning JSON `{}` instead of PDF. To fix:

- In your n8n workflow, make sure the final node returns the PDF file directly
- Set the response content type to `application/pdf`
- The workflow should NOT return JSON if generating synchronously

### Fallback Behavior

If n8n returns JSON instead of PDF, the app will:
- Show "Summary Generation Started" notification
- Work as async (user would need to check back later)
- This maintains backward compatibility

## Testing with curl

You can test the API endpoint directly:

```bash
curl -X POST http://localhost:3001/api/v1/summary \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "test-book-123",
    "preferences": {
      "style": "narrative",
      "length": "5pg"
    }
  }'
```

## Next Steps for Client

1. **Set up n8n workflow** at `https://n8n.megyk.com/webhook-test/get_book_summary`
   - Configure it to accept POST requests
   - Process the `book_id` and `preferences` from the payload
   - Return a JSON response (structure TBD)

2. **Test with real books** once books are added to the database

3. **Optional enhancements** (for future sprints):
   - Add loading states/progress indicators
   - Store summary requests in database
   - Add summary status tracking
   - Implement real-time notifications when summary is ready
   - Add authentication flow

## Files Modified

- ✅ `components/summary/GenerateSummaryModal.tsx` (NEW)
- ✅ `app/api/v1/summary/route.ts` (UPDATED - webhook integration)
- ✅ `app/dashboard/library/page.tsx` (UPDATED - modal integration)

## Dev Server

Currently running on: http://localhost:3001
