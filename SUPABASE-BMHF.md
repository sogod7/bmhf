# BMHF Supabase 운영 구조

`thegtbio`와 같은 Supabase 프로젝트를 사용하더라도 BMHF 데이터는 반드시 `bmhf` 스키마에만 둡니다. `public` 스키마의 `gtbio_*` 테이블을 참조하거나 수정하지 않습니다.

## 적용 순서

1. Supabase SQL Editor에서 `supabase/migrations/20261004_bmhf_schema.sql`을 실행합니다.
2. Supabase Dashboard의 API 설정에서 노출 스키마(Exposed schemas)에 `bmhf`를 추가합니다.
3. Supabase Auth에서 관리자 계정을 만든 뒤, 해당 UUID를 `bmhf.admin_users`에 `admin` 역할로 등록합니다.
4. Vercel 환경 변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`를 등록합니다.
5. Vercel에는 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`도 등록합니다. `SUPABASE_SERVICE_ROLE_KEY`와 `TURNSTILE_SECRET_KEY`는 서버 전용입니다.

## 보안 원칙

- 관리자 권한은 localStorage 플래그가 아니라 Supabase Auth와 `bmhf.admin_users` RLS로 판별합니다.
- 문의는 공개 DB INSERT가 아니라 Turnstile 검증 후 서버 API가 저장합니다.
- 자료실 공개 파일은 `bmhf-public-assets`, 문의 첨부는 private `bmhf-private-inquiries` 버킷을 사용합니다.
- 사용자 공개 페이지는 발행 상태(`published`)와 발행 시간 조건을 통과한 데이터만 읽습니다.
