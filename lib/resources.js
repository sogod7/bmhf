import { RESOURCE_TYPES } from './admin-constants';
import { get, insert, list, registerSeed, remove, seedRows, update } from './store';
import { isSupabaseConfigured, rpc } from './supabase';
import { PUBLIC_BUCKET, publicFileUrl, removeFiles } from './uploads';

const TABLE = 'resources';
const TYPE_IDS = RESOURCE_TYPES.map((type) => type.id);
registerSeed(TABLE, [
  ['catalog', 'BMHF 종합 카탈로그', 'BMHF Comprehensive Catalogue', '고주파 열처리, 브레이징, 유도가열기, 맞춤 코일 솔루션 전체 개요', 'Overview of all induction heat treatment, brazing, induction heaters, and custom coil solutions.', 'BMHF-General-Catalogue.pdf'],
  ['technical_data', '고주파 열처리 기술 사양서', 'Induction Heat Treatment Technical Specifications', '샤프트·기어 경화층 깊이, 다축 자동화 등 엔지니어링 파라미터', 'Engineering parameters, multi-axis automation, and metallurgical hardening case depths for shafts and gears.', 'BMHF-Heat-Treatment-Specs.pdf'],
  ['manual', '정밀 브레이징 시스템 적용 가이드', 'Precision Brazing Systems Application Guide', '초경 공구, PCD 팁, 배관과 지그 설계 고려사항', 'Carbide tool, PCD tip, pipe and fixture design considerations for repeatable brazing production lines.', 'BMHF-Brazing-Systems-Guide.pdf'],
  ['technical_data', '고주파 유도가열기 사양서', 'High Frequency Induction Heaters Specifications', '모터 케이스 가열, 열박음, 단조, 코일 매칭 기술 개요', 'Motor case heating, shrink fitting, forging, and coil matching technical overview.', 'BMHF-Induction-Heaters-Specs.pdf'],
  ['profile', 'BMHF 회사 소개서', 'BMHF Corporate Profile & Engineering Capabilities', '백마고주파 설비, 엔지니어링 역량, 품질 관리 소개', 'Introduction to Baek-Ma High Frequency facilities, engineering background, and quality management.', 'BMHF-Company-Profile.pdf'],
].map(([type, title_ko, title_en, description_ko, description_en, file], index) => ({ type, status: 'published', title_ko, title_en, description_ko, description_en, file_url: `/assets/docs/${file}`, file_path: null, file_name: file, file_size: null, download_count: 0, sort_order: index + 1 })));

function clean(input) {
  const values = {};
  if (input.title_ko !== undefined) { values.title_ko = String(input.title_ko).trim().slice(0, 200); if (!values.title_ko) throw new Error('국문 제목을 입력하세요.'); }
  for (const key of ['title_en', 'description_ko', 'description_en']) if (input[key] !== undefined) values[key] = String(input[key]).trim().slice(0, key.startsWith('title') ? 200 : 1000);
  if (input.type !== undefined) { if (!TYPE_IDS.includes(input.type)) throw new Error('자료 분류가 올바르지 않습니다.'); values.type = input.type; }
  if (input.status !== undefined) values.status = input.status === 'published' ? 'published' : 'draft';
  if (input.sort_order !== undefined) values.sort_order = Number(input.sort_order) || 0;
  return values;
}

function fileValues(file) {
  if (!file) return {};
  if (!file.path || !String(file.path).startsWith('resources/')) throw new Error('업로드한 파일 정보가 올바르지 않습니다.');
  return { file_path: file.path, file_url: publicFileUrl(file.path), file_name: String(file.name || '').slice(0, 200), file_size: Number(file.size) || null };
}

export async function listResources() { return list(TABLE, { order: [{ column: 'sort_order' }, { column: 'created_at', desc: true }] }); }
export async function listPublicResources() { return (await listResources().catch(() => seedRows(TABLE))).filter((item) => item.status === 'published'); }
export async function getResource(id) { return get(TABLE, id).catch(() => seedRows(TABLE).find((row) => row.id === id) || null); }

export async function createResource(input) {
  if (!input.file) throw new Error('파일을 업로드하세요.');
  const rows = await listResources();
  return insert(TABLE, { status: 'draft', type: 'catalog', title_en: '', description_ko: '', description_en: '', download_count: 0, ...clean(input), ...fileValues(input.file), sort_order: rows.reduce((max, row) => Math.max(max, row.sort_order || 0), 0) + 1 });
}

export async function updateResource(id, input) {
  const current = await get(TABLE, id);
  if (!current) return null;
  const updated = await update(TABLE, id, { ...clean(input), ...fileValues(input.file) });
  if (input.file && current.file_path && current.file_path !== input.file.path) await removeFiles(PUBLIC_BUCKET, [current.file_path]).catch(() => {});
  return updated;
}

export async function deleteResource(id) {
  const removed = await remove(TABLE, id);
  if (removed?.file_path) await removeFiles(PUBLIC_BUCKET, [removed.file_path]).catch(() => {});
  return removed;
}

export async function recordDownload(resource) {
  if (isSupabaseConfigured()) return rpc('increment_resource_download', { resource_id: resource.id });
  return update(TABLE, resource.id, { download_count: (resource.download_count || 0) + 1 });
}
