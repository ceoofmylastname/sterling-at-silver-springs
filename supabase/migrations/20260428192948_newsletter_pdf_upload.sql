-- Newsletter PDF Upload — schema additions and storage RLS policies
-- Run this once in the Supabase Dashboard SQL Editor (Project: vffcbovlwaqdbyezydjm)
-- or via `supabase db push` if Docker is running locally.

-- ============================================================
-- 1. Add columns to the newsletters table.
-- ai_content remains for legacy v1/v2/v3 rows. New PDF rows store URL +
-- storage path + a human-readable issue date and a `type` discriminator.
-- ============================================================
alter table newsletters add column if not exists pdf_url text;
alter table newsletters add column if not exists pdf_path text;
alter table newsletters add column if not exists issue_date text;
alter table newsletters add column if not exists type text default 'pdf';

-- ============================================================
-- 2. Backfill so old AI-generated rows are tagged 'legacy' and hidden
-- from public renderers (which filter on type = 'pdf').
-- New rows inserted by the upload form will use the column default 'pdf'.
-- ============================================================
update newsletters set type = 'legacy' where type is null or pdf_url is null;
update newsletters set type = 'pdf'    where pdf_url is not null;

-- ============================================================
-- 3. Storage RLS for the newsletter-pdfs bucket.
-- The bucket itself was created out-of-band via the Storage Admin API.
-- These policies gate per-row access on storage.objects.
-- Public read so anyone can fetch the PDF for inline display.
-- Authenticated insert / update / delete so admins (logged-in via Supabase
-- Auth in the frontend) can upload, replace, and remove files.
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public read newsletter PDFs') then
    create policy "Public read newsletter PDFs"
      on storage.objects for select
      using (bucket_id = 'newsletter-pdfs');
  end if;

  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Authenticated upload newsletter PDFs') then
    create policy "Authenticated upload newsletter PDFs"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'newsletter-pdfs');
  end if;

  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Authenticated update newsletter PDFs') then
    create policy "Authenticated update newsletter PDFs"
      on storage.objects for update to authenticated
      using (bucket_id = 'newsletter-pdfs');
  end if;

  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Authenticated delete newsletter PDFs') then
    create policy "Authenticated delete newsletter PDFs"
      on storage.objects for delete to authenticated
      using (bucket_id = 'newsletter-pdfs');
  end if;
end $$;

-- ============================================================
-- 4. Newsletters table RLS — already in place from the original
-- schema.sql. Confirming, not re-creating, so this migration is idempotent
-- whether run once or repeatedly.
--   Public can read published newsletters: SELECT USING (is_published = true)
--   Admin full access newsletters: ALL USING (auth.role() = 'authenticated')
-- The public renderers in the frontend filter additionally on type='pdf'
-- so legacy AI-generated rows are not visible to the public.
-- ============================================================
