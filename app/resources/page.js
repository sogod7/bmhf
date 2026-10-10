import { connection } from 'next/server';
import { formatBytes, resourceTypeLabel } from '../../lib/admin-constants';
import { listPublicResources } from '../../lib/resources';
import './resources.css';

const fileLabel = (doc) => `${(doc.file_name || doc.file_url).split('.').pop().toUpperCase()}${doc.file_size ? ` · ${formatBytes(doc.file_size)}` : ''}`;

export default async function ResourcesPage() {
  await connection();
  const documents = await listPublicResources().catch(() => []);
  return (
    <main className="resources-page">
      <header className="resources-hero">
        <p>TECHNICAL RESOURCES</p>
        <h1>기술 자료실</h1>
        <span>카탈로그, 기술 사양서, 회사 소개서를 내려받으세요.</span>
      </header>
      <section className="resources-list">
        {documents.map((doc) => (
          <article key={doc.id}>
            <div>
              <span className="resource-type">{resourceTypeLabel(doc.type)}</span>
              <h2>{doc.title_ko}</h2>
              {doc.description_ko && <p>{doc.description_ko}</p>}
            </div>
            <footer>
              <span>{fileLabel(doc)}</span>
              <a href={`/api/resources/${doc.id}/download`} target="_blank" rel="noreferrer">다운로드 ↓</a>
            </footer>
          </article>
        ))}
        {!documents.length && <p className="resources-empty">등록된 자료가 없습니다.</p>}
      </section>
      <aside className="resources-cta">
        <strong>도면 검토나 맞춤 코일 설계 자료가 필요하신가요?</strong>
        <span>워크피스 사양을 보내주시면 담당 엔지니어가 직접 검토해 드립니다.</span>
        <a href="/contact.html">기술 상담 문의</a>
      </aside>
    </main>
  );
}
