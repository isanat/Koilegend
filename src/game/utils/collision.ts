/**
 * Collision utilities — single source of truth for hit detection.
 *
 * We use AABB (axis-aligned bounding box) exclusively for damage collision.
 * It's cheaper than distance-based checks and easier to debug visually.
 *
 * Convention: hitboxes are derived from the koi's display size via a single
 * HITBOX_FRACTION constant, so visual scale changes automatically update
 * the collision box. No more three different numbers for the same object.
 */
import Phaser from 'phaser';

export type Box = { x: number; y: number; w: number; h: number };

/**
 * Build a hitbox centered on a container, with given width/height.
 */
export function hitbox(obj: Phaser.GameObjects.Container, w: number, h: number): Box {
  return { x: obj.x, y: obj.y, w, h };
}

/**
 * AABB overlap test between two boxes. Returns true if they intersect.
 */
export function aabbOverlap(a: Box, b: Box): boolean {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2
  );
}

/**
 * Distance between two points. Used only for pearl magnetism (which needs
 * radial falloff), never for damage collision.
 */
export function distance(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}
