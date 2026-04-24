/**
 * Rasterize the ZentraScore mark to:
 * - app/favicon.ico (32 + 16 PNG inside ICO)
 * - public/icon.png (32×32 PNG for browsers that prefer PNG favicons)
 * Run: npm run favicon
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outIco = path.join(root, "app", "favicon.ico");
const outPng = path.join(root, "public", "icon.png");

/** Same design as the previous app/icon.svg */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#0f1412" />
  <rect x="6" y="19" width="5" height="7" rx="1.5" fill="#00c98d" />
  <rect x="13.5" y="13" width="5" height="13" rx="1.5" fill="#00c98d" />
  <rect x="21" y="7" width="5" height="19" rx="1.5" fill="#00c98d" />
</svg>`;

function pngDimensions(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) {
    throw new Error("Invalid PNG buffer");
  }
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

/** Windows Vista+ ICO containing embedded PNG images */
function icoFromPngs(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let dataOffset = 6 + 16 * count;
  const parts = [header];

  for (const png of pngBuffers) {
    const { w, h } = pngDimensions(png);
    if (w > 256 || h > 256) {
      throw new Error("ICO PNG entries must be at most 256px per side");
    }
    const entry = Buffer.alloc(16);
    entry.writeUInt8(w === 256 ? 0 : w, 0);
    entry.writeUInt8(h === 256 ? 0 : h, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(dataOffset, 12);
    parts.push(entry);
    dataOffset += png.length;
  }

  for (const png of pngBuffers) {
    parts.push(png);
  }

  return Buffer.concat(parts);
}

const [png32, png16] = await Promise.all([
  sharp(Buffer.from(SVG)).resize(32, 32).png().toBuffer(),
  sharp(Buffer.from(SVG)).resize(16, 16).png().toBuffer(),
]);

const ico = icoFromPngs([png32, png16]);
fs.mkdirSync(path.dirname(outPng), { recursive: true });
fs.writeFileSync(outIco, ico);
console.log("Wrote", path.relative(root, outIco), `(${ico.length} bytes)`);

fs.writeFileSync(outPng, png32);
console.log("Wrote", path.relative(root, outPng), `(${png32.length} bytes)`);
