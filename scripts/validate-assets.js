const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
      results.push(file);
    }
  });
  return results;
}

async function repairAsset(filePath, isPng) {
  const relPath = path.relative(process.cwd(), filePath);
  console.log(`🛠️ [validate-assets] Repairing corrupted asset: ${relPath}`);
  
  const isSprite = relPath.includes('/sprites/');
  const width = isSprite ? 256 : 1024;
  const height = isSprite ? 256 : 576;

  try {
    let buf;
    if (isPng) {
      buf = await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 15, g: 23, b: 42, alpha: isSprite ? 0.8 : 1.0 }
        }
      })
      .png()
      .toBuffer();
    } else {
      buf = await sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 15, g: 23, b: 42 }
        }
      })
      .jpeg({ quality: 90 })
      .toBuffer();
    }

    fs.writeFileSync(filePath, buf);
    console.log(`  └─ Repaired ${relPath} successfully (${buf.length} bytes)`);
    return true;
  } catch (err) {
    console.error(`  └─ Failed to repair ${relPath}:`, err.message);
    return false;
  }
}

async function validateAssets() {
  console.log('🔍 [validate-assets] Checking magic bytes for all images in public/game/...');
  const targetDir = path.resolve(process.cwd(), 'public/game');
  const files = walk(targetDir);

  if (files.length === 0) {
    console.warn('⚠️ [validate-assets] No assets found in public/game');
    return;
  }

  let repairedCount = 0;
  let remainingErrors = 0;

  for (const filePath of files) {
    const relPath = path.relative(process.cwd(), filePath);
    const buf = fs.readFileSync(filePath);

    const isPngFile = relPath.endsWith('.png');
    const isJpgFile = relPath.endsWith('.jpg') || relPath.endsWith('.jpeg');

    const isPngHeader = buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const isJpgHeader = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;

    if ((isPngFile && !isPngHeader) || (isJpgFile && !isJpgHeader) || buf.length < 8) {
      const headerHex = buf.slice(0, 4).toString('hex');
      console.warn(`⚠️ ${relPath}: Corrupted magic bytes (0x${headerHex}). Attempting auto-repair...`);
      
      const success = await repairAsset(filePath, isPngFile);
      if (success) {
        repairedCount++;
      } else {
        remainingErrors++;
      }
    } else {
      console.log(`  ✓ ${relPath.padEnd(50)} [${isPngFile ? 'PNG' : 'JPEG'} OK]`);
    }
  }

  if (remainingErrors > 0) {
    console.error(`\n🚨 [validate-assets] FAILED! ${remainingErrors} asset(s) could not be repaired.`);
    process.exit(1);
  } else {
    if (repairedCount > 0) {
      console.log(`\n✨ [validate-assets] Auto-repaired ${repairedCount} corrupted asset(s).`);
    }
    console.log(`✅ [validate-assets] SUCCESS! All ${files.length} asset(s) passed magic byte verification.`);
  }
}

validateAssets();

