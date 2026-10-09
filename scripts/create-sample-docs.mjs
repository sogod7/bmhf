import fs from 'node:fs';
import path from 'node:path';

function createMinimalPdf(title, subtitle) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 22 Tf
50 750 Td
(${title}) Tj
/F1 12 Tf
0 -40 Td
(${subtitle}) Tj
0 -30 Td
(BAEK-MA HIGH FREQUENCY - BMHF ENGINEERING) Tj
0 -20 Td
(Contact: master@bmhf.co.kr | Tel: +82-31-498-1292) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000059 00000 n 
0000000116 00000 n 
0000000224 00000 n 
0000000475 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
548
%%EOF`;
  return Buffer.from(content);
}

const docs = [
  { name: 'BMHF-General-Catalogue.pdf', title: 'BMHF Induction Systems General Catalogue', sub: 'Comprehensive Guide to Induction Heat Treatment, Brazing & Heating Equipment' },
  { name: 'BMHF-Heat-Treatment-Specs.pdf', title: 'BMHF Induction Heat Treatment Technical Specifications', sub: 'Shaft, Hub, Cam-Shaft and Gear Surface Hardening Solutions' },
  { name: 'BMHF-Brazing-Systems-Guide.pdf', title: 'BMHF Induction Brazing Systems Guide', sub: 'Precision Tooling and Pipe Joining Application Technical Data' },
  { name: 'BMHF-Induction-Heaters-Specs.pdf', title: 'BMHF Induction Heaters Specification Sheet', sub: 'Motor Case, Shrink Fitting and Forging System Overview' },
  { name: 'BMHF-Company-Profile.pdf', title: 'BMHF Company Profile & Technical Capabilities', sub: 'Baek-Ma High Frequency Engineering Overview' },
];

const targetDir = path.join(process.cwd(), 'public', 'assets', 'docs');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

for (const doc of docs) {
  const filePath = path.join(targetDir, doc.name);
  fs.writeFileSync(filePath, createMinimalPdf(doc.title, doc.sub));
  console.log(`Created: ${doc.name}`);
}
