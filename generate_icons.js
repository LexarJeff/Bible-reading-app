// Generate PWA icons using Playwright browser canvas
// This script is meant to be run via the Playwright MCP browser tool
// Instead, we'll generate simple but valid PNG icons using pure Node.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size) {
  // Create raw RGBA pixel data
  const pixels = Buffer.alloc(size * size * 4);

  const bg = [26, 22, 18, 255]; // #1a1612
  const gold = [212, 165, 116, 255]; // #d4a574
  const dimGold = [212, 165, 116, 77]; // #d4a574 at 30%
  const fillGold = [212, 165, 116, 38]; // #d4a574 at 15%

  function setPixel(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    // Alpha blending
    const a = color[3] / 255;
    const oldA = pixels[i + 3] / 255;
    pixels[i] = Math.round(color[0] * a + pixels[i] * (1 - a));
    pixels[i + 1] = Math.round(color[1] * a + pixels[i + 1] * (1 - a));
    pixels[i + 2] = Math.round(color[2] * a + pixels[i + 2] * (1 - a));
    pixels[i + 3] = Math.min(255, Math.round((a + oldA * (1 - a)) * 255));
  }

  function fillRect(x1, y1, x2, y2, color) {
    for (let y = Math.max(0, Math.floor(y1)); y < Math.min(size, Math.ceil(y2)); y++) {
      for (let x = Math.max(0, Math.floor(x1)); x < Math.min(size, Math.ceil(x2)); x++) {
        setPixel(x, y, color);
      }
    }
  }

  function drawLine(x1, y1, x2, y2, color, thickness) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(Math.ceil(len * 2), 1);
    const halfT = thickness / 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x1 + dx * t;
      const cy = y1 + dy * t;
      fillRect(cx - halfT, cy - halfT, cx + halfT, cy + halfT, color);
    }
  }

  function drawCircle(cx, cy, r, color, thickness) {
    const steps = Math.ceil(r * 8);
    const halfT = thickness / 2;
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      fillRect(x - halfT, y - halfT, x + halfT, y + halfT, color);
    }
  }

  function fillCircle(cx, cy, r, color) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r * r) {
          setPixel(x, y, color);
        }
      }
    }
  }

  // Fill background
  fillRect(0, 0, size, size, bg);

  const s = size;
  const cx = s * 0.5;
  const lineW = Math.max(2, Math.round(s * 0.02));

  // Open book - centered vertically
  const bookCX = cx;
  const bookY = s * 0.28;
  const bookW = s * 0.32;
  const bookH = s * 0.28;

  // Left page fill
  for (let row = 0; row < bookH; row++) {
    const t = row / bookH;
    const curveOffset = Math.sin(t * Math.PI) * s * 0.02;
    const leftEdge = bookCX - bookW + curveOffset;
    const rightEdge = bookCX - 1;
    fillRect(leftEdge, bookY + row, rightEdge, bookY + row + 1, fillGold);
  }

  // Right page fill
  for (let row = 0; row < bookH; row++) {
    const t = row / bookH;
    const curveOffset = Math.sin(t * Math.PI) * s * 0.02;
    const leftEdge = bookCX + 1;
    const rightEdge = bookCX + bookW - curveOffset;
    fillRect(leftEdge, bookY + row, rightEdge, bookY + row + 1, fillGold);
  }

  // Book outlines
  // Left page border
  drawLine(bookCX - bookW, bookY, bookCX - bookW, bookY + bookH, gold, lineW);
  drawLine(bookCX - bookW, bookY, bookCX, bookY - s*0.01, gold, lineW);
  drawLine(bookCX - bookW, bookY + bookH, bookCX, bookY + bookH - s*0.01, gold, lineW);

  // Right page border
  drawLine(bookCX + bookW, bookY, bookCX + bookW, bookY + bookH, gold, lineW);
  drawLine(bookCX + bookW, bookY, bookCX, bookY - s*0.01, gold, lineW);
  drawLine(bookCX + bookW, bookY + bookH, bookCX, bookY + bookH - s*0.01, gold, lineW);

  // Spine
  drawLine(bookCX, bookY - s*0.01, bookCX, bookY + bookH - s*0.01, gold, lineW);

  // Page lines on left page
  const lineCount = 4;
  for (let i = 1; i <= lineCount; i++) {
    const ly = bookY + bookH * (i / (lineCount + 1));
    drawLine(bookCX - bookW + s*0.04, ly, bookCX - s*0.03, ly, dimGold, Math.max(1, Math.round(s * 0.005)));
  }

  // Page lines on right page
  for (let i = 1; i <= lineCount; i++) {
    const ly = bookY + bookH * (i / (lineCount + 1));
    drawLine(bookCX + s*0.03, ly, bookCX + bookW - s*0.04, ly, dimGold, Math.max(1, Math.round(s * 0.005)));
  }

  // "2026" text - draw using simple block digits
  const textY = s * 0.72;
  const digitH = Math.round(s * 0.08);
  const digitW = Math.round(digitH * 0.6);
  const digitGap = Math.round(digitH * 0.3);
  const digitT = Math.max(1, Math.round(s * 0.015));
  const totalW = digitW * 4 + digitGap * 3;
  const startX = cx - totalW / 2;

  // Draw "2"
  drawDigit2(startX, textY, digitW, digitH, digitT, gold);
  // Draw "0"
  drawDigit0(startX + digitW + digitGap, textY, digitW, digitH, digitT, gold);
  // Draw "2" again
  drawDigit2(startX + (digitW + digitGap) * 2, textY, digitW, digitH, digitT, gold);
  // Draw "6"
  drawDigit6(startX + (digitW + digitGap) * 3, textY, digitW, digitH, digitT, gold);

  // Decorative border
  const borderInset = Math.round(s * 0.05);
  const borderT = Math.max(1, Math.round(s * 0.008));
  drawLine(borderInset, borderInset, s - borderInset, borderInset, dimGold, borderT);
  drawLine(s - borderInset, borderInset, s - borderInset, s - borderInset, dimGold, borderT);
  drawLine(s - borderInset, s - borderInset, borderInset, s - borderInset, dimGold, borderT);
  drawLine(borderInset, s - borderInset, borderInset, borderInset, dimGold, borderT);

  function drawDigit2(x, y, w, h, t, col) {
    drawLine(x, y, x + w, y, col, t);
    drawLine(x + w, y, x + w, y + h/2, col, t);
    drawLine(x + w, y + h/2, x, y + h/2, col, t);
    drawLine(x, y + h/2, x, y + h, col, t);
    drawLine(x, y + h, x + w, y + h, col, t);
  }

  function drawDigit0(x, y, w, h, t, col) {
    drawLine(x, y, x + w, y, col, t);
    drawLine(x + w, y, x + w, y + h, col, t);
    drawLine(x + w, y + h, x, y + h, col, t);
    drawLine(x, y + h, x, y, col, t);
  }

  function drawDigit6(x, y, w, h, t, col) {
    drawLine(x, y, x + w, y, col, t);
    drawLine(x, y, x, y + h, col, t);
    drawLine(x, y + h, x + w, y + h, col, t);
    drawLine(x + w, y + h/2, x + w, y + h, col, t);
    drawLine(x, y + h/2, x + w, y + h/2, col, t);
  }

  return encodePNG(size, size, pixels);
}

function encodePNG(width, height, pixels) {
  // PNG file format encoder
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crc32Table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc32Table[i] = c >>> 0;
  }

  function makeChunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const combined = Buffer.concat([typeBytes, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(combined));
    return Buffer.concat([len, combined, crc]);
  }

  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT - raw pixel data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const srcI = (y * width + x) * 4;
      const dstI = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstI] = pixels[srcI];
      rawData[dstI + 1] = pixels[srcI + 1];
      rawData[dstI + 2] = pixels[srcI + 2];
      rawData[dstI + 3] = pixels[srcI + 3];
    }
  }
  const compressed = zlib.deflateSync(rawData);

  // IEND
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', iend)
  ]);
}

// Generate all three sizes
const sizes = [
  { size: 180, name: 'icon-180.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' }
];

for (const { size, name } of sizes) {
  const png = createPNG(size);
  const outPath = path.join(__dirname, 'www', name);
  fs.writeFileSync(outPath, png);
  console.log(`Created ${name} (${size}x${size}, ${png.length} bytes)`);
}
