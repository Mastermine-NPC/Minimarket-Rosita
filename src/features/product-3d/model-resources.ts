import { Box3, Mesh, MeshPhysicalMaterial, Texture, Vector3, type Object3D, type Material } from "three";
import type { ProductModelConfig } from "./types";
/** Owned resources, no global loader cache: safe to release when the canvas unmounts. */
export function disposeModel(root: Object3D) {
  const textures = new Set<Texture>();
  const materials = new Set<Material>();
  root.traverse(node => {
    if (!(node instanceof Mesh)) return;
    node.geometry.dispose();
    const list = Array.isArray(node.material) ? node.material : [node.material];
    list.forEach(material => {
      materials.add(material);
      Object.values(material).forEach(value => { if (value instanceof Texture) textures.add(value); });
    });
  });
  const images = new Set<ImageBitmap>();
  textures.forEach(texture => {
    if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) images.add(texture.image);
    texture.dispose();
  });
  images.forEach(image => image.close());
  materials.forEach(material => material.dispose());
}
export function prepareModel(root: Object3D, config: ProductModelConfig["model"]) {
  root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(root);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const scale = config.height / Math.max(size.y, size.x * 0.55, size.z * 0.55, 0.001);
  root.position.sub(center);
  root.traverse(node => {
    if (!(node instanceof Mesh)) return;
    node.castShadow = true; node.receiveShadow = true;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach(material => {
      if (!(material instanceof MeshPhysicalMaterial) && !("roughness" in material)) return;
      if (config.roughness !== undefined) material.roughness = config.roughness;
      if (config.metalness !== undefined) material.metalness = config.metalness;
      if (material instanceof MeshPhysicalMaterial && config.transmission !== undefined) material.transmission = config.transmission;
    });
  });
  return scale;
}

/** Resize embedded bitmaps before GPU upload on smaller devices, preserving UVs and PBR maps. */
export async function limitModelTextures(root: Object3D, maximum: number) {
  if (typeof createImageBitmap !== "function" || typeof ImageBitmap === "undefined") return;
  const textures = new Set<Texture>();
  root.traverse(node => {
    if (!(node instanceof Mesh)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach(material => Object.values(material).forEach(value => { if (value instanceof Texture) textures.add(value); }));
  });
  const resized = new Map<ImageBitmap, ImageBitmap>();
  for (const texture of textures) {
    const image = texture.image;
    if (!(image instanceof ImageBitmap) || Math.max(image.width, image.height) <= maximum) continue;
    let replacement = resized.get(image);
    if (!replacement) {
      const scale = maximum / Math.max(image.width, image.height);
      replacement = await createImageBitmap(image, { resizeWidth: Math.max(1, Math.round(image.width * scale)), resizeHeight: Math.max(1, Math.round(image.height * scale)), resizeQuality: "high" });
      resized.set(image, replacement);
    }
    texture.image = replacement;
    texture.needsUpdate = true;
  }
  resized.forEach((_, original) => original.close());
}
