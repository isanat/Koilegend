import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SPRITES_DIR = path.resolve(process.cwd(), 'public/game/sprites');

async function processSprite(filename: string, targetSize: { w: number; h: number }) {
  const filePath = path.join(SPRITES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[generate-art] Skipping ${filename} (file not found)`);
    return;
  }

  console.log(`[generate-art] Processing ${filename}...`);

  // Load image binary buffer
  const fileBuffer = fs.readFileSync(filePath);

  // Load image metadata
  const image = sharp(fileBuffer);
  const { data, info } = await image
    .ensureAlpha()
    .resize(targetSize.w, targetSize.h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Sample corner pixel color (background color)
  const cornerIdx = 0;
  const bgR = data[cornerIdx];
  const bgG = data[cornerIdx + 1];
  const bgB = data[cornerIdx + 2];

  // If corner is already transparent, keep alpha
  const cornerAlpha = data[cornerIdx + 3];
  const needsChroma = cornerAlpha > 128;

  const outBuffer = Buffer.alloc(width * height * 4);

  const THRESHOLD = 100;
  const FEATHER = 40;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let a = data[i + 3];

    if (needsChroma) {
      const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
      if (dist < THRESHOLD) {
        a = 0;
      } else if (dist < THRESHOLD + FEATHER) {
        a = Math.round(((dist - THRESHOLD) / FEATHER) * 255);
      }
    }

    outBuffer[i] = r;
    outBuffer[i + 1] = g;
    outBuffer[i + 2] = b;
    outBuffer[i + 3] = a;
  }

  // Generate crisp, optimized PNG buffer directly
  const pngBuffer = await sharp(outBuffer, {
    raw: { width, height, channels: 4 },
  })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  // Ensure magic bytes header check
  if (pngBuffer[0] !== 0x89 || pngBuffer[1] !== 0x50 || pngBuffer[2] !== 0x4e || pngBuffer[3] !== 0x47) {
    throw new Error(`Invalid PNG header generated for ${filename}`);
  }

  // Write pure binary buffer to disk
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`[generate-art] Successfully saved ${filename} (${pngBuffer.length} bytes, ${width}x${height} PNG)`);
}

async function main() {
  console.log('=== KOI LEGEND ART GENERATOR & OPTIMIZER ===');
  await processSprite('koi.png', { w: 512, h: 512 });
  await processSprite('pearl.png', { w: 256, h: 256 });
  await processSprite('rock.png', { w: 256, h: 256 });
  console.log('=== ART GENERATION COMPLETE ===');
}

main().catch((err) => {
  console.error('Art generation error:', err);
  process.exit(1);
});
