const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const crc32Table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crc32Table[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crc32Table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcBuf);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(width, height, getPixel) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const assets = [
  {
    path: 'public/game/sprites/koi-dragon.png',
    width: 96,
    height: 56,
    getPixel: (x, y) => {
      // Golden dragon gradient
      const factor = x / 96;
      return [Math.floor(251 * (1 - factor * 0.2)), 191, 36, 255];
    }
  },
  {
    path: 'public/game/sprites/predator.png',
    width: 80,
    height: 80,
    getPixel: (x, y) => {
      const dx = x - 40;
      const dy = y - 40;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 36) return [71, 85, 105, 255];
      return [0, 0, 0, 0];
    }
  },
  {
    path: 'public/game/sprites/whirlpool.png',
    width: 80,
    height: 80,
    getPixel: (x, y) => {
      const dx = x - 40;
      const dy = y - 40;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 38) {
        const ring = Math.floor(dist) % 8;
        const alpha = Math.floor(220 * (1 - dist / 40));
        return ring < 4 ? [14, 116, 144, alpha] : [6, 182, 212, alpha];
      }
      return [0, 0, 0, 0];
    }
  },
  {
    path: 'public/game/scenes/sky-realm.png',
    width: 1344,
    height: 768,
    getPixel: (x, y) => {
      const factor = y / 768;
      const r = Math.floor(251 * (1 - factor) + 254 * factor);
      const g = Math.floor(191 * (1 - factor) + 243 * factor);
      const b = Math.floor(36 * (1 - factor) + 199 * factor);
      return [r, g, b, 255];
    }
  }
];

assets.forEach(a => {
  const fullPath = path.join(__dirname, '..', a.path);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const pngBuf = createPng(a.width, a.height, a.getPixel);
  fs.writeFileSync(fullPath, pngBuf);
  console.log('Generated:', a.path, `(${pngBuf.length} bytes)`);
});
