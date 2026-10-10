-- BMHF first-party visitor analytics (접속 통계 · 유입경로)
-- Run after 20261009_bmhf_admin_console.sql in the Supabase SQL Editor. Safe to re-run.
-- Rows are written and read only by the Next.js server with the service role key.
-- No IP addresses are stored; visitor/session ids are random values kept in the visitor's browser.

create table if not exists bmhf.page_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  visitor_id text not null,
  session_id text not null,
  is_landing boolean not null default false,
  path text not null,
  title text,
  channel text not null,          -- search | ad | ai | social | referral | campaign | direct
  source_name text,               -- naver, google, chatgpt, instagram, example.com ...
  referrer text,
  search_term text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  device text,                    -- mobile | tablet | desktop
  browser text,
  os text,
  country text,
  city text,
  lang text
);

create index if not exists page_views_created_idx on bmhf.page_views(created_at desc);
create index if not exists page_views_session_idx on bmhf.page_views(session_id);

alter table bmhf.page_views enable row level security;
grant all on bmhf.page_views to service_role;

-- Which channel brought the visitor who sent an inquiry (first touch + current session).
alter table bmhf.inquiries add column if not exists attribution jsonb;

notify pgrst, 'reload schema';
