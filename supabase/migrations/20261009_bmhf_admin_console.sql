-- BMHF admin console storage
-- Run after 20261004_bmhf_schema.sql in the Supabase SQL Editor.
-- All access goes through the Next.js server with the service role key, so these
-- tables enable RLS without anon/authenticated policies.

create extension if not exists pgcrypto;
create schema if not exists bmhf;
grant usage on schema bmhf to service_role;

-- Inquiries: extra columns used by the website quote form.
alter table bmhf.inquiries add column if not exists product_slug text;
alter table bmhf.inquiries add column if not exists product_title text;
alter table bmhf.inquiries add column if not exists files jsonb not null default '[]'::jsonb;
alter table bmhf.inquiries add column if not exists ip_hash text;

create table if not exists bmhf.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default '공지',
  body text not null default '',
  notice_date date not null default current_date,
  pinned boolean not null default false,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bmhf.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text not null,
  thumbnail text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bmhf.resources (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'catalog' check (type in ('catalog', 'technical_data', 'certificate', 'manual', 'profile')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  title_ko text not null,
  title_en text,
  description_ko text,
  description_en text,
  file_url text not null,
  file_path text,
  file_name text,
  file_size bigint,
  download_count integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bmhf.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists bmhf.activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists bmhf.login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists notices_visible_date_idx on bmhf.notices(visible, pinned desc, notice_date desc);
create index if not exists videos_sort_idx on bmhf.videos(sort_order);
create index if not exists resources_status_sort_idx on bmhf.resources(status, sort_order);
create index if not exists activity_log_created_idx on bmhf.activity_log(created_at desc);
create index if not exists login_attempts_ip_created_idx on bmhf.login_attempts(ip_hash, created_at desc);

alter table bmhf.notices enable row level security;
alter table bmhf.videos enable row level security;
alter table bmhf.resources enable row level security;
alter table bmhf.site_settings enable row level security;
alter table bmhf.activity_log enable row level security;
alter table bmhf.login_attempts enable row level security;

grant all on all tables in schema bmhf to service_role;

-- Atomic download counter used by /api/resources/[id]/download.
create or replace function bmhf.increment_resource_download(resource_id uuid)
returns void language sql security definer set search_path = bmhf
as $$ update bmhf.resources set download_count = download_count + 1 where id = resource_id $$;
revoke all on function bmhf.increment_resource_download(uuid) from public, anon, authenticated;
grant execute on function bmhf.increment_resource_download(uuid) to service_role;

-- Seed current site content once (skipped when rows already exist).
insert into bmhf.notices (title, category, body, notice_date, pinned, visible)
select * from (values
  ('BMHF 고주파 시스템 기술 상담 및 현장 지원 안내', '공지', '워크피스 재질, 형상, 목표 공정과 생산량을 알려주시면 담당 엔지니어가 직접 도면 검토 및 최적 고주파 시스템 구성을 제안해 드립니다.', date '2026-10-05', true, true),
  ('제품소개 라인업 및 고주파 가열 공정 영상자료 업데이트', '소식', '열처리, 브레이징, 가열기 29종 전 제품군과 실제 구동 공정 영상 자료실이 오픈되었습니다.', date '2026-10-01', false, true),
  ('고주파 맞춤 코일 설계 및 수리·개선 서비스 지원', '기술', '기존 사용 중이신 고주파 코일의 균일 가열 개선, 냉각 효율 증대, 수명 연장을 위한 형상 재설계 및 제작을 지원합니다.', date '2026-09-20', false, true)
) as seed(title, category, body, notice_date, pinned, visible)
where not exists (select 1 from bmhf.notices);

insert into bmhf.videos (title, video_url, thumbnail, visible, sort_order)
select * from (values
  ('FRANGE HUB 고주파 열처리·템퍼링 M/C', 'https://www.youtube.com/watch?v=SntxRhX0OtU&t=10s', '/assets/images/video-flange-hub.png', true, 1),
  ('ROTOR-SHAFT 고주파 열처리·템퍼링 M/C', 'https://www.youtube.com/watch?v=7pR7pIq6DHg&t=70s', '/assets/images/video-rotor-shaft-machine.png', true, 2),
  ('SHAFT 고주파 열처리·템퍼링 M/C', 'https://www.youtube.com/watch?v=gerFkSXs7ds&t=4s', '/assets/images/video-shaft-machine.png', true, 3),
  ('조향장치 고주파 열처리·템퍼링 M/C', 'https://www.youtube.com/watch?v=r_JSCj9AZCY', '/assets/images/video-steering-machine.png', true, 4),
  ('CAM-SHAFT 고주파 열처리·템퍼링 M/C', 'https://www.youtube.com/watch?v=7w88lY43hL8&t=5s', '/assets/images/video-cam-shaft-machine.png', true, 5)
) as seed(title, video_url, thumbnail, visible, sort_order)
where not exists (select 1 from bmhf.videos);

insert into bmhf.resources (type, status, title_ko, title_en, description_ko, description_en, file_url, file_name, sort_order)
select * from (values
  ('catalog', 'published', 'BMHF 종합 카탈로그', 'BMHF Comprehensive Catalogue', '고주파 열처리, 브레이징, 유도가열기, 맞춤 코일 솔루션 전체 개요', 'Overview of all induction heat treatment, brazing, induction heaters, and custom coil solutions.', '/assets/docs/BMHF-General-Catalogue.pdf', 'BMHF-General-Catalogue.pdf', 1),
  ('technical_data', 'published', '고주파 열처리 기술 사양서', 'Induction Heat Treatment Technical Specifications', '샤프트·기어 경화층 깊이, 다축 자동화 등 엔지니어링 파라미터', 'Engineering parameters, multi-axis automation, and metallurgical hardening case depths for shafts and gears.', '/assets/docs/BMHF-Heat-Treatment-Specs.pdf', 'BMHF-Heat-Treatment-Specs.pdf', 2),
  ('manual', 'published', '정밀 브레이징 시스템 적용 가이드', 'Precision Brazing Systems Application Guide', '초경 공구, PCD 팁, 배관과 지그 설계 고려사항', 'Carbide tool, PCD tip, pipe and fixture design considerations for repeatable brazing production lines.', '/assets/docs/BMHF-Brazing-Systems-Guide.pdf', 'BMHF-Brazing-Systems-Guide.pdf', 3),
  ('technical_data', 'published', '고주파 유도가열기 사양서', 'High Frequency Induction Heaters Specifications', '모터 케이스 가열, 열박음, 단조, 코일 매칭 기술 개요', 'Motor case heating, shrink fitting, forging, and coil matching technical overview.', '/assets/docs/BMHF-Induction-Heaters-Specs.pdf', 'BMHF-Induction-Heaters-Specs.pdf', 4),
  ('profile', 'published', 'BMHF 회사 소개서', 'BMHF Corporate Profile & Engineering Capabilities', '백마고주파 설비, 엔지니어링 역량, 품질 관리 소개', 'Introduction to Baek-Ma High Frequency facilities, engineering background, and quality management.', '/assets/docs/BMHF-Company-Profile.pdf', 'BMHF-Company-Profile.pdf', 5)
) as seed(type, status, title_ko, title_en, description_ko, description_en, file_url, file_name, sort_order)
where not exists (select 1 from bmhf.resources);

insert into bmhf.site_settings (key, value) values ('language_visible', 'true'::jsonb)
on conflict (key) do nothing;
