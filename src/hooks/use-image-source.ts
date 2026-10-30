import { useEffect, useState } from "react";
import { getImage } from "@/lib/image-store";
export function useImageSource(id?: string) {
  const [value, setValue] = useState<{
    id?: string;
    src?: string;
    error?: string;
  }>({});
  useEffect(() => {
    if (!id) return;
    let alive = true,
      url: string | undefined;
    getImage(id)
      .then((blob) => {
        if (!blob)
          throw new Error("Imagen local no disponible en este navegador.");
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setValue({ id, src: url });
      })
      .catch(() => {
        if (alive)
          setValue({
            id,
            error:
              "Imagen local no disponible. Vuelve a subirla desde administración.",
          });
      });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  return value.id === id ? value : { id };
}
