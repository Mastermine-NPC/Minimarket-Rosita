export type ProductModelConfig = {
  modelUrl: string | null;
  label: string;
  fallbackMessage: string;
  camera: { position: [number, number, number]; fov: number; minDistance: number; maxDistance: number; minPolarAngle: number; maxPolarAngle: number };
  model: { height: number; rotation: [number, number, number]; position?: [number, number, number]; roughness?: number; metalness?: number; transmission?: number };
  lighting: { ambient: number; fill?: number; key: number; rim: number; exposure: number };
  background: { color: string; accent: string; distortion: number; speed: number; parallax: number };
  interaction: { rotateSpeed: number; zoomSpeed: number; damping: number };
  animation: { duration: number; cameraTravel: number; modelTravel: number };
  attribution?: { author: string; url: string; license: string; licenseUrl: string };
};
