const fs = require('fs');
const path = require('path');

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

function validateAssets() {
  console.log('🔍 [validate-assets] Checking magic bytes for all images in public/game/...');
  const targetDir = path.resolve(process.cwd(), 'public/game');
  const files = walk(targetDir);

  if (files.length === 0) {
    console.warn('⚠️ [validate-assets] No assets found in public/game');
    return;
  }

  let errors = 0;

  files.forEach((filePath) => {
    const relPath = path.relative(process.cwd(), filePath);
    const buf = fs.readFileSync(filePath);

    if (buf.length < 8) {
      console.error(`❌ ${relPath}: File is too small (${buf.length} bytes)`);
      errors++;
      return;
    }

    const isPngFile = relPath.endsWith('.png');
    const isJpgFile = relPath.endsWith('.jpg') || relPath.endsWith('.jpeg');

    const isPngHeader = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const isJpgHeader = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;

    if (isPngFile && !isPngHeader) {
      const headerHex = buf.slice(0, 4).toString('hex');
      console.error(
        `❌ ${relPath}: Expected PNG header (89504e47), but got 0x${headerHex}. File may be corrupted or a misnamed JPEG!`
      );
      errors++;
    } else if (isJpgFile && !isJpgHeader) {
      const headerHex = buf.slice(0, 3).toString('hex');
      console.error(
        `❌ ${relPath}: Expected JPEG header (ffd8ff), but got 0x${headerHex}. File may be corrupted or misnamed!`
      );
      errors++;
    } else {
      console.log(`  ✓ ${relPath.padEnd(50)} [${isPngFile ? 'PNG' : 'JPEG'} OK]`);
    }
  });

  if (errors > 0) {
    console.error(`\n🚨 [validate-assets] FAILED! Found ${errors} corrupted or misnamed asset(s).`);
    process.exit(1);
  } else {
    console.log(`\n✅ [validate-assets] SUCCESS! All ${files.length} asset(s) passed magic byte verification.`);
  }
}

validateAssets();
