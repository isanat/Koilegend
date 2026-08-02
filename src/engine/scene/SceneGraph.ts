/**
 * KOI LEGEND ENGINE — Spatial Scene Graph & Culling Architecture
 * Hierarchical scene nodes, QuadTree spatial partitioning, Frustum Culling, and LOD Evaluator.
 */

export interface BoundingBox3D {
  min: [number, number, number];
  max: [number, number, number];
}

export class SceneNode {
  public id: string;
  public parent: SceneNode | null = null;
  public children: SceneNode[] = [];
  public position: [number, number, number] = [0, 0, 0];
  public scale: [number, number, number] = [1, 1, 1];
  public boundingBox: BoundingBox3D;
  public lodLevel: number = 0; // 0 = High, 1 = Medium, 2 = Low
  public isVisible: boolean = true;

  constructor(id: string, bounds?: BoundingBox3D) {
    this.id = id;
    this.boundingBox = bounds || {
      min: [-1, -1, -1],
      max: [1, 1, 1],
    };
  }

  public addChild(child: SceneNode): void {
    child.parent = this;
    this.children.push(child);
  }

  public removeChild(childId: string): void {
    this.children = this.children.filter((c) => c.id !== childId);
  }

  public updateLOD(cameraPos: [number, number, number]): void {
    const dx = this.position[0] - cameraPos[0];
    const dy = this.position[1] - cameraPos[1];
    const dz = this.position[2] - cameraPos[2];
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < 2500) {
      this.lodLevel = 0; // < 50 units
    } else if (distSq < 10000) {
      this.lodLevel = 1; // < 100 units
    } else {
      this.lodLevel = 2; // > 100 units
    }

    for (const child of this.children) {
      child.updateLOD(cameraPos);
    }
  }
}

export class QuadTreeSpatialPartition {
  public bounds: { x: number; z: number; width: number; height: number };
  public capacity: number;
  public nodes: SceneNode[] = [];
  public divided: boolean = false;
  public northWest?: QuadTreeSpatialPartition;
  public northEast?: QuadTreeSpatialPartition;
  public southWest?: QuadTreeSpatialPartition;
  public southEast?: QuadTreeSpatialPartition;

  constructor(bounds: { x: number; z: number; width: number; height: number }, capacity: number = 16) {
    this.bounds = bounds;
    this.capacity = capacity;
  }

  public insert(node: SceneNode): boolean {
    if (!this.contains(node.position[0], node.position[2])) {
      return false;
    }

    if (this.nodes.length < this.capacity) {
      this.nodes.push(node);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northWest!.insert(node) ||
      this.northEast!.insert(node) ||
      this.southWest!.insert(node) ||
      this.southEast!.insert(node)
    );
  }

  private subdivide(): void {
    const { x, z, width, height } = this.bounds;
    const w2 = width / 2;
    const h2 = height / 2;

    this.northWest = new QuadTreeSpatialPartition({ x: x - w2 / 2, z: z - h2 / 2, width: w2, height: h2 }, this.capacity);
    this.northEast = new QuadTreeSpatialPartition({ x: x + w2 / 2, z: z - h2 / 2, width: w2, height: h2 }, this.capacity);
    this.southWest = new QuadTreeSpatialPartition({ x: x - w2 / 2, z: z + h2 / 2, width: w2, height: h2 }, this.capacity);
    this.southEast = new QuadTreeSpatialPartition({ x: x + w2 / 2, z: z + h2 / 2, width: w2, height: h2 }, this.capacity);

    this.divided = true;
  }

  private contains(x: number, z: number): boolean {
    return (
      x >= this.bounds.x - this.bounds.width / 2 &&
      x <= this.bounds.x + this.bounds.width / 2 &&
      z >= this.bounds.z - this.bounds.height / 2 &&
      z <= this.bounds.z + this.bounds.height / 2
    );
  }

  public queryFrustum(visibleNodes: SceneNode[]): void {
    for (const node of this.nodes) {
      if (node.isVisible) {
        visibleNodes.push(node);
      }
    }
    if (this.divided) {
      this.northWest!.queryFrustum(visibleNodes);
      this.northEast!.queryFrustum(visibleNodes);
      this.southWest!.queryFrustum(visibleNodes);
      this.southEast!.queryFrustum(visibleNodes);
    }
  }
}
