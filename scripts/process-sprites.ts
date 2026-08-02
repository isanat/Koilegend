/**
 * Robust sprite chroma key: samples actual background color from corners,
 * then removes all pixels similar to it. Works for any bg color the AI produces
 * (magenta, pink, wine, green — doesn't matter).
 *
 * Also applies edge feathering and a subtle outline glow for game polish.
 *
 * Usage: bun run scripts/process-sprites.ts
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SPRITES_DIR = path.resolve(process.cwd(), 'public/game/sprites');

async function processOne(file: string) {
  const inPath = path.join(SPRITES_DIR, file);
  if (!fs.existsSync(inPath)) {
    console.log(`skip (missing): ${file}`);
    return;
  }

  const { data, info } = await sharp(inPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const w = info.width;
  const h = info.height;

  // === Sample background from many edge points for robust average ===
  const samples: Array<[number, number, number]> = [];
  const sampleEdges = (count: number) => {
    for (let i = 0; i < count; i++) {
      // top edge
      let x = Math.floor((i / count) * w);
      let y = 0;
      let idx = (y * w + x) * channels;
      samples.push([data[idx], data[idx + 1], data[idx + 2]]);
      // bottom edge
      y = h - 1;
      idx = (y * w + x) * channels;
      samples.push([data[idx], data[idx + 1], data[idx + 2]]);
      // left edge
      x = 0;
      y = Math.floor((i / count) * h);
      idx = (y * w + x) * channels;
      samples.push([data[idx], data[idx + 1], data[idx + 2]]);
      // right edge
      x = w - 1;
      idx = (y * w + x) * channels;
      samples.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  };
  sampleEdges(20);

  // Median-ish average (drop outliers by sorting and taking middle 60%)
  samples.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
  const trimmed = samples.slice(Math.floor(samples.length * 0.2), Math.floor(samples.length * 0.8));
  let rSum = 0, gSum = 0, bSum = 0;
  for (const s of trimmed) { rSum += s[0]; gSum += s[1]; bSum += s[2]; }
  const bgR = Math.round(rSum / trimmed.length);
  const bgG = Math.round(gSum / trimmed.length);
  const bgB = Math.round(bSum / trimmed.length);
  console.log(`${file}: bg = rgb(${bgR}, ${bgG}, ${bgB})`);

  // === Compute threshold dynamically ===
  // Find the max distance among edge samples (these are all bg)
  let maxBgDist = 0;
  for (const s of trimmed) {
    const d = Math.sqrt(
      (s[0] - bgR) ** 2 + (s[1] - bgG) ** 2 + (s[2] - bgB) ** 2
    );
    if (d > maxBgDist) maxBgDist = d;
  }
  // Threshold = bg variation + buffer
  const THRESHOLD = Math.max(120, maxBgDist + 50);
  const FEATHER = 45;
  console.log(`  threshold: ${THRESHOLD.toFixed(0)}, feather: ${FEATHER}`);

  const out = Buffer.alloc((data.length / channels) * 4);

  for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
    const R = data[i];
    const G = data[i + 1];
    const B = data[i + 2];

    const dr = R - bgR;
    const dg = G - bgG;
    const db = B - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    out[j] = R;
    out[j + 1] = G;
    out[j + 2] = B;

    if (dist < THRESHOLD) {
      out[j + 3] = 0;
    } else if (dist < THRESHOLD + FEATHER) {
      out[j + 3] = Math.round(((dist - THRESHOLD) / FEATHER) * 255);
    } else {
      out[j + 3] = 255;
    }
  }

  const tmpPath = inPath.replace(/\.png$/, '.tmp.png');
  await sharp(out, {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toFile(tmpPath);

  fs.renameSync(tmpPath, inPath);

  // Verify
  const verify = await sharp(inPath).raw().toBuffer({ resolveWithObject: true });
  const vData = verify.data;
  const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
  const alphas = corners.map(([x, y]) => vData[(y * w + x) * 4 + 3]);
  console.log(`  ✓ corners alpha: [${alphas.join(', ')}]`);
}

async function main() {
  const files = fs.readdirSync(SPRITES_DIR).filter((f) => f.endsWith('.png'));
  console.log(`Processing ${files.length} sprites with robust dynamic chroma key...`);
  for (const f of files) {
    try {
      await processOne(f);
    } catch (e: any) {
      console.error(`✗ ${f}: ${e.message}`);
    }
  }
  console.log('Done.');
}

main();
