import type { ImageAsset } from "@/types/modules";
export const IMAGE_DB = "minimarket-rosita-assets";
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(IMAGE_DB, 1);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains("images"))
        r.result.createObjectStore("images", { keyPath: "id" });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () =>
      reject(new Error("No se pudo abrir el almacenamiento de imágenes."));
    r.onblocked = () =>
      reject(new Error("Cierra otras pestañas de Rosita para usar imágenes."));
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  request: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    let tx: IDBTransaction;
    const fail = () => {
      db.close();
      reject(
        new Error(
          "No se pudo guardar o leer la imagen. Comprueba permisos y espacio disponible; la selección anterior se conserva.",
        ),
      );
    };
    try {
      tx = db.transaction("images", mode);
      const r = request(tx.objectStore("images"));
      let value: T;
      r.onsuccess = () => {
        value = r.result;
      };
      tx.oncomplete = () => {
        db.close();
        resolve(value);
      };
      tx.onerror = tx.onabort = fail;
    } catch {
      fail();
    }
  });
}
export async function getImage(id: string): Promise<Blob | null> {
  const row = await transaction("readonly", (s) => s.get(id));
  return row?.blob || null;
}
export async function clearImages() {
  await transaction("readwrite", (s) => s.clear());
}
export async function prepareImage(file: File): Promise<ImageAsset> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error(
      "Usa una fotografía JPG, PNG o WebP. SVG, GIF y otros formatos no se aceptan.",
    );
  if (file.size > 8 * 1024 * 1024)
    throw new Error("La imagen debe pesar como máximo 8 MB.");
  const url = URL.createObjectURL(file);
  let image: HTMLImageElement;
  try {
    image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(
          new Error(
            "No se pudo leer la imagen. El archivo puede estar dañado.",
          ),
        );
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
  if (image.naturalWidth * image.naturalHeight > 40000000)
    throw new Error(
      "La imagen supera 40 megapíxeles. Elige una versión más pequeña.",
    );
  const ratio = Math.min(
      1,
      1600 / Math.max(image.naturalWidth, image.naturalHeight),
    ),
    width = Math.max(1, Math.round(image.naturalWidth * ratio)),
    height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("El navegador no permite preparar esta imagen.");
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error("No se pudo comprimir la imagen.")),
      "image/webp",
      0.82,
    ),
  );
  if (blob.size > 1250000)
    throw new Error(
      "La imagen preparada sigue pesando más de 1.25 MB. Elige una fotografía menos compleja.",
    );
  const asset = {
    id: crypto.randomUUID(),
    width,
    height,
    bytes: blob.size,
    mime: blob.type,
    createdAt: new Date().toISOString(),
  };
  await transaction("readwrite", (s) => s.put({ ...asset, blob }));
  return asset;
}
