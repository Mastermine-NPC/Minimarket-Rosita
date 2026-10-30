import { useEffect, useRef, useState } from "react";
import { Upload, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRosita } from "@/hooks/use-rosita";
import { useImageSource } from "@/hooks/use-image-source";
import { productImages } from "@/data/product-images";
import { prepareImage } from "@/lib/image-store";
import { toast } from "sonner";
export function MediaImage({
  imageKey,
  alt,
  className = "",
}: {
  imageKey: string;
  alt: string;
  className?: string;
}) {
  const id = imageKey.startsWith("upload:") ? imageKey.slice(7) : undefined,
    { src, error } = useImageSource(id);
  const local = productImages.find((i) => i.key === imageKey)?.src;
  return src || local ? (
    <img className={className} src={src || local} alt={alt} loading="lazy" />
  ) : (
    <span className={"media-placeholder " + className}>
      <ImageOff aria-hidden="true" />
      <span>{error ? "Imagen no disponible" : "Sin fotografía"}</span>
    </span>
  );
}
export function ImagePicker({
  value,
  onChange,
  resources = true,
  onBusyChange,
}: {
  value: string;
  onChange: (value: string) => void;
  resources?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { state, dispatch } = useRosita(),
    [busy, Busy] = useState(false),
    [error, setError] = useState(""),
    [confirm, Confirm] = useState<"replace" | "remove" | null>(null),
    input = useRef<HTMLInputElement>(null),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function upload(file?: File) {
    if (!file) return;
    Busy(true);
    onBusyChange?.(true);
    setError("");
    try {
      if (Object.keys(state.media).length >= 1000)
        throw new Error(
          "Se alcanzó el límite de 1000 imágenes de demostración.",
        );
      const asset = await prepareImage(file);
      if (!alive.current) return;
      dispatch({
        type: "admin/media-register",
        asset,
        operationId: crypto.randomUUID(),
        at: new Date().toISOString(),
      });
      onChange("upload:" + asset.id);
      toast.success("Imagen preparada y guardada en este navegador", {
        description: "Guarda el formulario para asociarla al registro.",
      });
    } catch (e) {
      if (alive.current)
        setError(
          (e instanceof Error ? e.message : "No se pudo guardar la imagen.") +
            " Se conserva la selección anterior.",
        );
    } finally {
      if (alive.current) {
        Busy(false);
        onBusyChange?.(false);
      }
      if (input.current) input.current.value = "";
    }
  }
  return (
    <section className="image-picker" aria-label="Imagen del registro">
      <Label htmlFor="image-file">Subir imagen desde tu computadora</Label>
      <input
        ref={input}
        id="image-file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(e) => void upload(e.target.files?.[0])}
      />
      <p className="hint">
        JPG, PNG o WebP · máximo 8 MB. Se prepara hasta 1600 px y 1.25 MB; no se
        sube a un servidor.
      </p>
      {value.startsWith("upload:") && (
        <MediaImage
          imageKey={value}
          alt="Vista previa de imagen seleccionada"
          className="upload-preview"
        />
      )}
      <div className="customer-actions">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() =>
            value !== "none" ? Confirm("replace") : input.current?.click()
          }
        >
          <Upload size={16} aria-hidden="true" />
          {busy ? "Preparando imagen…" : "Elegir / reemplazar imagen"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy || value === "none"}
          onClick={() => Confirm("remove")}
        >
          Quitar imagen
        </Button>
      </div>
      {confirm && (
        <div role="alert" className="inline-confirm">
          <p>
            {confirm === "remove"
              ? "¿Quitar la imagen de este registro? El archivo compartido se conserva."
              : "¿Elegir otra imagen? La actual no se eliminará de otros registros."}
          </p>
          <Button type="button" variant="outline" onClick={() => Confirm(null)}>
            Conservar imagen
          </Button>
          <Button
            type="button"
            onClick={() => {
              const action = confirm;
              Confirm(null);
              if (action === "remove") onChange("none");
              else input.current?.click();
            }}
          >
            Confirmar {confirm === "remove" ? "quitar" : "reemplazo"}
          </Button>
        </div>
      )}
      <Label htmlFor="image-library">Recurso local o imagen ya preparada</Label>
      <select
        id="image-library"
        value={value}
        disabled={busy}
        onChange={(e) => onChange(e.target.value)}
      >
        {(resources ? productImages : [productImages[0]]).map((i) => (
          <option value={i.key} key={i.key}>
            {i.label}
          </option>
        ))}
        {Object.values(state.media).map((m) => (
          <option key={m.id} value={"upload:" + m.id}>
            Imagen local {m.id.slice(0, 8)} · {m.width}×{m.height}
          </option>
        ))}
      </select>
      {busy && <p role="status">Procesando y guardando imagen…</p>}
      {error && (
        <p role="alert" className="field-error">
          ⚠ {error}
        </p>
      )}
    </section>
  );
}
