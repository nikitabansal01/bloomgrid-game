/**
 * Generates soft pastel BloomGrid icons + splash (no external image dependencies).
 * Uses minimal uncompressed PNG writer.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '../assets');

const CREAM = [255, 248, 243];
const BLUSH = [245, 213, 216];
const LAVENDER = [201, 184, 224];
const SAGE = [168, 196, 164];
const INK = [74, 63, 85];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function writePng(filePath, width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const o = rowStart + 1 + x * 4;
      raw[o] = rgba[i];
      raw[o + 1] = rgba[i + 1];
      raw[o + 2] = rgba[i + 2];
      raw[o + 3] = rgba[i + 3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(filePath, png);
}

function fill(size, draw) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const [r, g, b, a = 255] = draw(x, y, size);
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = a;
    }
  }
  return rgba;
}

function dist(x, y, cx, cy) {
  return Math.hypot(x - cx, y - cy);
}

/** Cycle ring + crescent center — pastel BloomGrid branding (no characters). */
function drawBloomIcon(size) {
  return fill(size, (x, y, s) => {
    const cx = s / 2;
    const cy = s / 2;
    const r = dist(x, y, cx, cy);
    if (r > s * 0.48) return [...CREAM, 0];
    if (r > s * 0.44 && r < s * 0.47) return [...LAVENDER, 220];
    const phaseDot = (px, py, rad, col) => {
      const d = dist(x, y, px, py);
      return d < rad ? col : null;
    };
    const ringR = s * 0.34;
    const dotR = s * 0.045;
    const dots = [
      [cx, cy - ringR, SAGE],
      [cx + ringR, cy, LAVENDER],
      [cx, cy + ringR, BLUSH],
      [cx - ringR, cy, SAGE],
    ];
    for (const [px, py, col] of dots) {
      const hit = phaseDot(px, py, dotR, [...col, 255]);
      if (hit) return hit;
    }
    const moonR = s * 0.14;
    const moonCx = cx + s * 0.03;
    if (dist(x, y, moonCx, cy) < moonR) return [...LAVENDER, 255];
    if (dist(x, y, cx + s * 0.08, cy) < moonR * 0.88) return [...BLUSH, 255];
    if (r < s * 0.1) return [...BLUSH, 180];
    return [...CREAM, 255];
  });
}

function drawSplash(size) {
  return fill(size, (x, y, s) => {
    const cx = s / 2;
    const cy = s / 2;
    const r = dist(x, y, cx, cy);
    const base = [...CREAM, 255];
    if (r < s * 0.22) return [...LAVENDER, 255];
    if (r < s * 0.28) return [...BLUSH, 255];
    if (r > s * 0.42 && r < s * 0.44) return [...SAGE, 200];
    return base;
  });
}

function drawAndroidForeground(size) {
  return drawBloomIcon(size);
}

function drawAndroidBackground(size) {
  return fill(size, () => [...BLUSH, 255]);
}

function drawMonochrome(size) {
  return fill(size, (x, y, s) => {
    const cx = s / 2;
    const cy = s / 2;
    const r = dist(x, y, cx, cy);
    if (r > s * 0.48) return [0, 0, 0, 0];
    if (r > s * 0.44 && r < s * 0.47) return [255, 255, 255, 255];
    if (dist(x, y, cx, cy - s * 0.34) < s * 0.045) return [255, 255, 255, 255];
    if (dist(x, y, cx + s * 0.34, cy) < s * 0.045) return [255, 255, 255, 255];
    if (dist(x, y, cx, cy + s * 0.34) < s * 0.045) return [255, 255, 255, 255];
    if (dist(x, y, cx - s * 0.34, cy) < s * 0.045) return [255, 255, 255, 255];
    if (dist(x, y, cx + s * 0.03, cy) < s * 0.14) return [255, 255, 255, 255];
    return [0, 0, 0, 0];
  });
}

function drawFavicon(size) {
  return drawBloomIcon(size);
}

fs.mkdirSync(assetsDir, { recursive: true });
writePng(path.join(assetsDir, 'icon.png'), 1024, 1024, drawBloomIcon(1024));
writePng(path.join(assetsDir, 'splash-icon.png'), 512, 512, drawSplash(512));
writePng(path.join(assetsDir, 'android-icon-foreground.png'), 432, 432, drawAndroidForeground(432));
writePng(path.join(assetsDir, 'android-icon-background.png'), 432, 432, drawAndroidBackground(432));
writePng(path.join(assetsDir, 'android-icon-monochrome.png'), 432, 432, drawMonochrome(432));
writePng(path.join(assetsDir, 'favicon.png'), 48, 48, drawFavicon(48));
console.log('Brand assets written to', assetsDir);
