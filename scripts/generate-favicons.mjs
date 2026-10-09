import sharp from 'sharp';
import fs from 'fs';

const srcPath = 'C:/Users/DELL/.gemini/antigravity-ide/brain/fc40d586-b9a7-4644-8bcd-4964f44596fa/.user_uploaded/media_1791535956354.png';

async function generateFavicons() {
  const trimmed = await sharp(srcPath).trim().toBuffer();

  const resizedInner = await sharp(trimmed)
    .resize(460, 460, { fit: 'inside' })
    .toBuffer();

  const base512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: resizedInner, gravity: 'center' }])
  .png()
  .toBuffer();

  const sizes = [16, 32, 48, 64, 180, 192, 512];
  const buffers = {};
  for (const size of sizes) {
    buffers[size] = await sharp(base512).resize(size, size).png().toBuffer();
  }

  const dirs = ['public', 'public/assets/images', 'assets/images', 'app'];
  for (const d of dirs) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }

  fs.writeFileSync('public/favicon.png', buffers[64]);
  fs.writeFileSync('public/favicon-32x32.png', buffers[32]);
  fs.writeFileSync('public/favicon-16x16.png', buffers[16]);
  fs.writeFileSync('public/apple-touch-icon.png', buffers[180]);
  fs.writeFileSync('public/android-chrome-192x192.png', buffers[192]);
  fs.writeFileSync('public/android-chrome-512x512.png', buffers[512]);

  fs.writeFileSync('public/assets/images/favicon.png', buffers[64]);
  fs.writeFileSync('assets/images/favicon.png', buffers[64]);

  const b64 = buffers[512].toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><image width="512" height="512" href="data:image/png;base64,${b64}"/></svg>`;

  fs.writeFileSync('public/assets/images/favicon.svg', svgContent);
  fs.writeFileSync('assets/images/favicon.svg', svgContent);
  fs.writeFileSync('public/favicon.svg', svgContent);

  // Simple standard ICO with 32x32 PNG payload
  const png32 = buffers[32];
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(32, 0);
  icoEntry.writeUInt8(32, 1);
  icoEntry.writeUInt8(0, 2);
  icoEntry.writeUInt8(0, 3);
  icoEntry.writeUInt16LE(1, 4);
  icoEntry.writeUInt16LE(32, 6);
  icoEntry.writeUInt32LE(png32.length, 8);
  icoEntry.writeUInt32LE(22, 12);

  const icoBuffer = Buffer.concat([icoHeader, icoEntry, png32]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('app/favicon.ico', icoBuffer);

  console.log('All favicons successfully generated!');
}

generateFavicons().catch(console.error);
