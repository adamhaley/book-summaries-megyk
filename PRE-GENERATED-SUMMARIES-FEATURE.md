Goal

Implement a new “Get Summary” default behavior that downloads a pre-generated summary PDF stored in Supabase Storage.
Move the existing custom-summary modal to a new button “Get Customized Summary.”

Database Update

Add a column to link each book to the pre-generated PDF URL.

ALTER TABLE books
ADD COLUMN default_summary_pdf_url text;


This column will store a public or signed Supabase Storage URL like:

https://<project>.supabase.co/storage/v1/object/public/summaries/<book_id>/default.pdf

Storage Convention

Use a predictable storage path:

summaries/{book_id}/default.pdf


Bucket: summaries
Make the file public or generate signed URLs server-side.

n8n Workflow (Summary Generator)

Modify your summary-generation pipeline to:

Generate default AI summary text.

Generate PDF via your existing PDF generation node.

Upload to Supabase Storage at:

summaries/${book_id}/default.pdf


Capture returned public URL.

Update the default_summary_pdf_url field in the books table.

This is effectively one additional node at the end of your existing workflow.

Frontend (Library Page UI Changes)
1. Replace existing “Get Summary” button behavior

Instead of opening the customization modal:

Fetch book.default_summary_pdf_url

Initiate a file download

Example in Next.js (Client component):

const handleGetSummary = () => {
  if (!book.default_summary_pdf_url) return;
  window.open(book.default_summary_pdf_url, "_blank");
};

2. Add new button “Get Customized Summary”

This triggers the existing modal + custom summary workflow.

<button onClick={() => setCustomizeModalOpen(true)}>
  Get Customized Summary
</button>

Admin / Maintenance

(Optional) Create n8n maintenance workflow:

Fetch each book’s stored text summary

Re-render PDF with updated template

Re-upload to the same Storage path

Update URL in DB if needed

This lets you iterate on your PDF template without re-ingesting books.

Files Likely to Update in Codebase

components/LibraryBookItem.tsx or wherever the “Get Summary” button lives

components/CustomizeSummaryModal.tsx (rename trigger source)

supabase/migrations/<timestamp>_add_default_summary_pdf_url.sql

Any API helpers where book objects are returned to the UI

n8n summary-generation workflow (not in repo, but architecture change)

Acceptance Criteria

“Get Summary” instantly downloads the PDF (no modal).

“Get Customized Summary” opens the existing customization modal.

Each book has a valid default_summary_pdf_url in the DB.

No changes needed to ingestion or summarization logic.

PDFs are easy to re-generate via batch workflow later.
