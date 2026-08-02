#!/bin/bash
# Koi Legend - Art Asset Generator (robust, idempotent)
# Each image is a separate z-ai CLI call, so interruptions don't lose progress.
set +e

ROOT="/home/z/my-project/public/game"
SPRITES="$ROOT/sprites"
CARDS="$ROOT/cards"
SCENES="$ROOT/scenes"
LOG="/home/z/my-project/art-gen.log"

STYLE="digital painting, fantasy game art, vibrant colors, dramatic lighting, highly detailed, cinematic, professional concept art, no text, no watermark"

gen() {
  local name="$1"; local prompt="$2"; local size="$3"; local dir="$4"
  local out="$dir/$name"
  if [ -f "$out" ] && [ -s "$out" ]; then
    echo "✓ skip (exists): $name" >> "$LOG"
    return 0
  fi
  echo "→ generating: $name ($size)" >> "$LOG"
  if z-ai image -p "$prompt" -o "$out" -s "$size" >> "$LOG" 2>&1; then
    echo "✓ done: $name" >> "$LOG"
  else
    echo "✗ failed: $name" >> "$LOG"
  fi
}

echo "=== Art generation started $(date) ===" >> "$LOG"

# Sprites (solid magenta bg for chroma keying)
gen "koi.png" "A majestic koi fish swimming, side view facing right, classic orange and white kohaku pattern with vivid red markings, flowing fins and tail, scales detailed, dynamic pose mid-swim, isolated on pure solid magenta background (#FF00FF), $STYLE" "1024x1024" "$SPRITES"
gen "koi-dragon.png" "A majestic koi fish transforming into a golden celestial dragon, side view facing right, body half fish half dragon, golden scales, flowing whiskers, ethereal glow, water and clouds, isolated on pure solid magenta background (#FF00FF), $STYLE" "1024x1024" "$SPRITES"
gen "rock.png" "A single jagged river rock, mossy, wet, dark grey with green moss patches, game sprite asset, isolated on pure solid magenta background (#FF00FF), $STYLE" "1024x1024" "$SPRITES"
gen "pearl.png" "A glowing golden energy pearl, luminous orb with inner light, sparkles, magical item, game collectible, isolated on pure solid magenta background (#FF00FF), $STYLE" "1024x1024" "$SPRITES"
gen "predator.png" "A fearsome river predator, large heron bird with sharp beak, side view, menacing pose, dark feathers, game enemy sprite, isolated on pure solid magenta background (#FF00FF), $STYLE" "1024x1024" "$SPRITES"
gen "whirlpool.png" "A swirling whirlpool vortex, water spiral, dark blue and teal, menacing water formation, game obstacle, isolated on pure solid magenta background (#FF00FF), $STYLE" "1024x1024" "$SPRITES"
gen "dragon-final.png" "A magnificent golden celestial dragon ascending through clouds, full body side view facing right, majestic, glowing, mythical, Chinese dragon style with flowing whiskers, isolated on pure solid magenta background (#FF00FF), $STYLE" "1024x1024" "$SPRITES"

# Scenes
gen "river-bg-far.png" "Wide panoramic river valley at dawn, misty mountains in background, soft golden light, atmospheric depth, far parallax layer for 2D game, serene, $STYLE" "1440x720" "$SCENES"
gen "river-bg-mid.png" "River banks with trees and rocks, midground parallax layer for 2D side-scrolling game, lush vegetation, no sky, water at bottom, $STYLE" "1440x720" "$SCENES"
gen "river-bg-near.png" "Underwater river scene, flowing water, bubbles, light rays from above, aquatic plants, foreground parallax layer for 2D game, teal blue tones, $STYLE" "1440x720" "$SCENES"
gen "waterfall-bg.png" "Massive vertical waterfall cascading down a cliff, mist, ancient carved dragon gate at the top, epic scale, tall portrait orientation, mystical atmosphere, $STYLE" "720x1440" "$SCENES"
gen "hero-legend.png" "Epic scene of a golden koi fish leaping up a massive waterfall towards a dragon gate in the sky, transformation beginning, clouds parting, golden light rays, celestial, mythic, the legend of the koi, $STYLE" "1440x720" "$SCENES"
gen "sky-realm.png" "Celestial sky realm above the clouds, golden dragon gate, floating islands, divine light, paradise, where the koi becomes a dragon, $STYLE" "1440x720" "$SCENES"

# NFT Cards
gen "card-01-rio-turbulento.png" "NFT collectible card art: a baby koi fish in a turbulent rushing river, sharp rocks, splashing water, survival theme, vibrant, magical card frame border with water motifs, ornate, $STYLE" "1024x1024" "$CARDS"
gen "card-02-predador.png" "NFT collectible card art: a koi fish escaping from a striking heron predator, dramatic chase scene, river reeds, protective shield glow, ornate magical card frame, $STYLE" "1024x1024" "$CARDS"
gen "card-05-redemoinho.png" "NFT collectible card art: a powerful koi resisting a massive whirlpool vortex, swirling water, strength theme, glowing aura, ornate magical card frame, $STYLE" "1024x1024" "$CARDS"
gen "card-07-tempestade.png" "NFT collectible card art: a koi fish braving a violent storm on the river, lightning, giant waves, calm aura around the fish, dramatic, ornate magical card frame, $STYLE" "1024x1024" "$CARDS"
gen "card-10-espirito-rio.png" "NFT collectible card art: the koi meeting a glowing river spirit guardian, mystical encounter, ethereal light, wisdom theme, ornate magical card frame, $STYLE" "1024x1024" "$CARDS"
gen "card-11-cachoeira-dragao.png" "NFT collectible card art: a koi fish leaping up a colossal waterfall towards a dragon gate at the top, legendary leap, determination, golden light, ornate magical card frame, $STYLE" "1024x1024" "$CARDS"
gen "card-12-ascensao-dragao.png" "NFT collectible card art: the koi transforming into a magnificent golden celestial dragon, ascension, clouds parting, divine radiance, the ultimate legendary card, ornate golden card frame, $STYLE" "1024x1024" "$CARDS"

echo "=== Art generation complete $(date) ===" >> "$LOG"
