-- BMHF shared Supabase project isolation
-- Run in the Supabase SQL Editor with a database owner account.
-- This project uses the dedicated `bmhf` schema; do not create BMHF tables in public.

create extension if not exists pgcrypto;
create schema if not exists bmhf;
grant usage on schema bmhf to anon, authenticated, service_role;

create table if not exists bmhf.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function bmhf.is_admin()
returns boolean language sql stable security definer set search_path = bmhf, public
as $$ select exists (select 1 from bmhf.admin_users where user_id = auth.uid()) $$;

create table if not exists bmhf.inquiries (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text,
  phone text not null,
  category text not null,
  message text,
  locale text not null default 'ko' check (locale in ('ko', 'en')),
  status text not null default 'new' check (status in ('new', 'in_progress', 'answered', 'closed')),
  admin_memo text,
  privacy_consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bmhf.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('notice', 'board')),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bmhf.post_translations (
  post_id uuid not null references bmhf.posts(id) on delete cascade,
  locale text not null check (locale in ('ko', 'en')),
  title text not null,
  excerpt text,
  content text not null,
  seo_description text,
  primary key (post_id, locale)
);

create table if not exists bmhf.documents (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('catalog', 'technical_data', 'certificate', 'manual')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  file_path text not null,
  file_size bigint,
  download_count integer not null default 0,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bmhf.document_translations (
  document_id uuid not null references bmhf.documents(id) on delete cascade,
  locale text not null check (locale in ('ko', 'en')),
  title text not null,
  description text,
  primary key (document_id, locale)
);

create table if not exists bmhf.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  cover_image_path text,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bmhf.project_translations (
  project_id uuid not null references bmhf.projects(id) on delete cascade,
  locale text not null check (locale in ('ko', 'en')),
  title text not null,
  summary text,
  content text,
  primary key (project_id, locale)
);

create index if not exists inquiries_status_created_at_idx on bmhf.inquiries(status, created_at desc);
create index if not exists posts_type_status_published_at_idx on bmhf.posts(type, status, published_at desc);
create index if not exists documents_type_status_published_at_idx on bmhf.documents(type, status, published_at desc);
create index if not exists projects_category_status_published_at_idx on bmhf.projects(category, status, published_at desc);

alter table bmhf.admin_users enable row level security;
alter table bmhf.inquiries enable row level security;
alter table bmhf.posts enable row level security;
alter table bmhf.post_translations enable row level security;
alter table bmhf.documents enable row level security;
alter table bmhf.document_translations enable row level security;
alter table bmhf.projects enable row level security;
alter table bmhf.project_translations enable row level security;

-- Remove only policies owned by this schema migration so it can be re-run safely.
drop policy if exists bmhf_admin_users_self_read on bmhf.admin_users;
drop policy if exists bmhf_admin_inquiries on bmhf.inquiries;
drop policy if exists bmhf_admin_posts on bmhf.posts;
drop policy if exists bmhf_public_posts on bmhf.posts;
drop policy if exists bmhf_admin_post_translations on bmhf.post_translations;
drop policy if exists bmhf_public_post_translations on bmhf.post_translations;
drop policy if exists bmhf_admin_documents on bmhf.documents;
drop policy if exists bmhf_public_documents on bmhf.documents;
drop policy if exists bmhf_admin_document_translations on bmhf.document_translations;
drop policy if exists bmhf_public_document_translations on bmhf.document_translations;
drop policy if exists bmhf_admin_projects on bmhf.projects;
drop policy if exists bmhf_public_projects on bmhf.projects;
drop policy if exists bmhf_admin_project_translations on bmhf.project_translations;
drop policy if exists bmhf_public_project_translations on bmhf.project_translations;

create policy bmhf_admin_users_self_read on bmhf.admin_users for select to authenticated using (user_id = auth.uid());
create policy bmhf_admin_inquiries on bmhf.inquiries for all to authenticated using (bmhf.is_admin()) with check (bmhf.is_admin());
create policy bmhf_admin_posts on bmhf.posts for all to authenticated using (bmhf.is_admin()) with check (bmhf.is_admin());
create policy bmhf_public_posts on bmhf.posts for select to anon, authenticated using (status = 'published' and published_at <= now());
create policy bmhf_admin_post_translations on bmhf.post_translations for all to authenticated using (bmhf.is_admin()) with check (bmhf.is_admin());
create policy bmhf_public_post_translations on bmhf.post_translations for select to anon, authenticated using (exists (select 1 from bmhf.posts p where p.id = post_id and p.status = 'published' and p.published_at <= now()));
create policy bmhf_admin_documents on bmhf.documents for all to authenticated using (bmhf.is_admin()) with check (bmhf.is_admin());
create policy bmhf_public_documents on bmhf.documents for select to anon, authenticated using (status = 'published' and published_at <= now());
create policy bmhf_admin_document_translations on bmhf.document_translations for all to authenticated using (bmhf.is_admin()) with check (bmhf.is_admin());
create policy bmhf_public_document_translations on bmhf.document_translations for select to anon, authenticated using (exists (select 1 from bmhf.documents d where d.id = document_id and d.status = 'published' and d.published_at <= now()));
create policy bmhf_admin_projects on bmhf.projects for all to authenticated using (bmhf.is_admin()) with check (bmhf.is_admin());
create policy bmhf_public_projects on bmhf.projects for select to anon, authenticated using (status = 'published' and published_at <= now());
create policy bmhf_admin_project_translations on bmhf.project_translations for all to authenticated using (bmhf.is_admin()) with check (bmhf.is_admin());
create policy bmhf_public_project_translations on bmhf.project_translations for select to anon, authenticated using (exists (select 1 from bmhf.projects p where p.id = project_id and p.status = 'published' and p.published_at <= now()));

-- The inquiry API runs server-side with the service role after Turnstile validation.
-- Do not add an anon INSERT policy to bmhf.inquiries.

insert into storage.buckets (id, name, public)
values ('bmhf-public-assets', 'bmhf-public-assets', true), ('bmhf-private-inquiries', 'bmhf-private-inquiries', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists bmhf_public_asset_read on storage.objects;
drop policy if exists bmhf_admin_asset_write on storage.objects;
drop policy if exists bmhf_admin_inquiry_file_read on storage.objects;
drop policy if exists bmhf_admin_inquiry_file_write on storage.objects;
create policy bmhf_public_asset_read on storage.objects for select using (bucket_id = 'bmhf-public-assets');
create policy bmhf_admin_asset_write on storage.objects for all to authenticated using (bucket_id = 'bmhf-public-assets' and bmhf.is_admin()) with check (bucket_id = 'bmhf-public-assets' and bmhf.is_admin());
create policy bmhf_admin_inquiry_file_read on storage.objects for select to authenticated using (bucket_id = 'bmhf-private-inquiries' and bmhf.is_admin());
create policy bmhf_admin_inquiry_file_write on storage.objects for all to authenticated using (bucket_id = 'bmhf-private-inquiries' and bmhf.is_admin()) with check (bucket_id = 'bmhf-private-inquiries' and bmhf.is_admin());
