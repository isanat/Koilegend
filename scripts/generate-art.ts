/**
 * Koi Legend - Art Asset Generator
 * Generates all game + NFT card art via z-ai-web-dev-sdk.
 * Run with: bun run scripts/generate-art.ts
 */
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd(), 'public/game');
const SPRITES = path.join(ROOT, 'sprites');
const CARDS = path.join(ROOT, 'cards');
const SCENES = path.join(ROOT, 'scenes');

// Shared style suffix for visual consistency
const STYLE = 'digital painting, fantasy game art, vibrant colors, dramatic lighting, highly detailed, cinematic, professional concept art, no text, no watermark';

type Asset = {
  name: string;
  prompt: string;
  size: '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440';
  outDir: string;
  chromaKey?: { r: number; g: number; b: number }; // color to make transparent
};

const assets: Asset[] = [
  // === SPRITES (need transparency) ===
  {
    name: 'koi.png',
    prompt: `A majestic koi fish swimming, side view facing right, classic orange and white kohaku pattern with vivid red markings, flowing fins and tail, scales detailed, dynamic pose mid-swim, isolated on pure solid magenta background (#FF00FF), ${STYLE}`,
    size: '1024x1024',
    outDir: SPRITES,
    chromaKey: { r: 255, g: 0, b: 255 },
  },
  {
    name: 'koi-dragon.png',
    prompt: `A majestic koi fish transforming into a golden celestial dragon, side view facing right, body half fish half dragon, golden scales, flowing whiskers, ethereal glow, water and clouds, isolated on pure solid magenta background (#FF00FF), ${STYLE}`,
    size: '1024x1024',
    outDir: SPRITES,
    chromaKey: { r: 255, g: 0, b: 255 },
  },
  {
    name: 'rock.png',
    prompt: `A single jagged river rock, mossy, wet, dark grey with green moss patches, game sprite asset, isolated on pure solid magenta background (#FF00FF), ${STYLE}`,
    size: '1024x1024',
    outDir: SPRITES,
    chromaKey: { r: 255, g: 0, b: 255 },
  },
  {
    name: 'pearl.png',
    prompt: `A glowing golden energy pearl, luminous orb with inner light, sparkles, magical item, game collectible, isolated on pure solid magenta background (#FF00FF), ${STYLE}`,
    size: '1024x1024',
    outDir: SPRITES,
    chromaKey: { r: 255, g: 0, b: 255 },
  },
  {
    name: 'predator.png',
    prompt: `A fearsome river predator, large heron bird with sharp beak, side view, menacing pose, dark feathers, game enemy sprite, isolated on pure solid magenta background (#FF00FF), ${STYLE}`,
    size: '1024x1024',
    outDir: SPRITES,
    chromaKey: { r: 255, g: 0, b: 255 },
  },
  {
    name: 'whirlpool.png',
    prompt: `A swirling whirlpool vortex, water spiral, dark blue and teal, menacing water formation, game obstacle, isolated on pure solid magenta background (#FF00FF), ${STYLE}`,
    size: '1024x1024',
    outDir: SPRITES,
    chromaKey: { r: 255, g: 0, b: 255 },
  },
  {
    name: 'dragon-final.png',
    prompt: `A magnificent golden celestial dragon ascending through clouds, full body side view facing right, majestic, glowing, mythical, Chinese dragon style with flowing whiskers, isolated on pure solid magenta background (#FF00FF), ${STYLE}`,
    size: '1024x1024',
    outDir: SPRITES,
    chromaKey: { r: 255, g: 0, b: 255 },
  },

  // === SCENES (backgrounds, no transparency) ===
  {
    name: 'river-bg-far.png',
    prompt: `Wide panoramic river valley at dawn, misty mountains in background, soft golden light, atmospheric depth, far parallax layer for 2D game, serene, ${STYLE}`,
    size: '1440x720',
    outDir: SCENES,
  },
  {
    name: 'river-bg-mid.png',
    prompt: `River banks with trees and rocks, midground parallax layer for 2D side-scrolling game, lush vegetation, no sky, water at bottom, ${STYLE}`,
    size: '1440x720',
    outDir: SCENES,
  },
  {
    name: 'river-bg-near.png',
    prompt: `Underwater river scene, flowing water, bubbles, light rays from above, aquatic plants, foreground parallax layer for 2D game, teal blue tones, ${STYLE}`,
    size: '1440x720',
    outDir: SCENES,
  },
  {
    name: 'waterfall-bg.png',
    prompt: `Massive vertical waterfall cascading down a cliff, mist, ancient carved dragon gate at the top, epic scale, tall portrait orientation, mystical atmosphere, ${STYLE}`,
    size: '720x1440',
    outDir: SCENES,
  },
  {
    name: 'hero-legend.png',
    prompt: `Epic scene of a golden koi fish leaping up a massive waterfall towards a dragon gate in the sky, transformation beginning, clouds parting, golden light rays, celestial, mythic, the legend of the koi, ${STYLE}`,
    size: '1440x720',
    outDir: SCENES,
  },
  {
    name: 'sky-realm.png',
    prompt: `Celestial sky realm above the clouds, golden dragon gate, floating islands, divine light, paradise, where the koi becomes a dragon, ${STYLE}`,
    size: '1440x720',
    outDir: SCENES,
  },

  // === NFT CARDS (square, full art) ===
  {
    name: 'card-01-rio-turbulento.png',
    prompt: `NFT collectible card art: a baby koi fish in a turbulent rushing river, sharp rocks, splashing water, survival theme, vibrant, magical card frame border with water motifs, ornate, ${STYLE}`,
    size: '1024x1024',
    outDir: CARDS,
  },
  {
    name: 'card-02-predador.png',
    prompt: `NFT collectible card art: a koi fish escaping from a striking heron predator, dramatic chase scene, river reeds, protective shield glow, ornate magical card frame, ${STYLE}`,
    size: '1024x1024',
    outDir: CARDS,
  },
  {
    name: 'card-05-redemoinho.png',
    prompt: `NFT collectible card art: a powerful koi resisting a massive whirlpool vortex, swirling water, strength theme, glowing aura, ornate magical card frame, ${STYLE}`,
    size: '1024x1024',
    outDir: CARDS,
  },
  {
    name: 'card-07-tempestade.png',
    prompt: `NFT collectible card art: a koi fish braving a violent storm on the river, lightning, giant waves, calm aura around the fish, dramatic, ornate magical card frame, ${STYLE}`,
    size: '1024x1024',
    outDir: CARDS,
  },
  {
    name: 'card-10-espirito-rio.png',
    prompt: `NFT collectible card art: the koi meeting a glowing river spirit guardian, mystical encounter, ethereal light, wisdom theme, ornate magical card frame, ${STYLE}`,
    size: '1024x1024',
    outDir: CARDS,
  },
  {
    name: 'card-11-cachoeira-dragao.png',
    prompt: `NFT collectible card art: a koi fish leaping up a colossal waterfall towards a dragon gate at the top, legendary leap, determination, golden light, ornate magical card frame, ${STYLE}`,
    size: '1024x1024',
    outDir: CARDS,
  },
  {
    name: 'card-12-ascensao-dragao.png',
    prompt: `NFT collectible card art: the koi transforming into a magnificent golden celestial dragon, ascension, clouds parting, divine radiance, the ultimate legendary card, ornate golden card frame, ${STYLE}`,
    size: '1024x1024',
    outDir: CARDS,
  },
];

async function removeChroma(inputPath: string, outputPath: string, chroma: { r: number; g: number; b: number }) {
  // Remove near-magenta pixels by making them transparent
  const { r, g, b } = chroma;
  await sharp(inputPath)
    .resize(512, 512, { fit: 'contain' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const channels = info.channels;
      const out = Buffer.alloc(data.length * 4 / channels);
      const threshold = 90;
      for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
        const R = data[i];
        const G = data[i + 1];
        const B = data[i + 2];
        // distance from chroma color
        const dr = R - r;
        const dg = G - g;
        const db = B - b;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist < threshold) {
          out[j] = r; out[j + 1] = g; out[j + 2] = b; out[j + 3] = 0;
        } else {
          out[j] = R; out[j + 1] = G; out[j + 2] = B;
          // feather edges: partial alpha near threshold
          if (dist < threshold + 30) {
            out[j + 3] = Math.round(((dist - threshold) / 30) * 255);
          } else {
            out[j + 3] = 255;
          }
        }
      }
      return sharp(out, {
        raw: { width: info.width, height: info.height, channels: 4 },
      }).png().toFile(outputPath);
    });
}

async function generateOne(zai: any, asset: Asset): Promise<boolean> {
  const outPath = path.join(asset.outDir, asset.name);
  if (fs.existsSync(outPath)) {
    console.log(`✓ skip (exists): ${asset.name}`);
    return true;
  }
  try {
    console.log(`→ generating: ${asset.name} (${asset.size})`);
    const t0 = Date.now();
    const response = await zai.images.generations.create({
      prompt: asset.prompt,
      size: asset.size,
    });
    const base64 = response.data[0].base64;
    const buffer = Buffer.from(base64, 'base64');
    const rawPath = outPath.replace(/\.png$/, '.raw.png');
    fs.writeFileSync(rawPath, buffer);

    if (asset.chromaKey) {
      await removeChroma(rawPath, outPath, asset.chromaKey);
      fs.unlinkSync(rawPath);
    } else {
      fs.renameSync(rawPath, outPath);
    }
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✓ done (${dt}s): ${asset.name}`);
    return true;
  } catch (err: any) {
    console.error(`✗ failed: ${asset.name} — ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(`Generating ${assets.length} art assets...`);
  const zai = await ZAI.create();
  let ok = 0;
  for (const asset of assets) {
    const success = await generateOne(zai, asset);
    if (success) ok++;
  }
  console.log(`\n=== ${ok}/${assets.length} assets ready ===`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
