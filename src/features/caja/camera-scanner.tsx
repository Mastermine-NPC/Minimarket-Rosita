import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
interface Detector {
  detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
}
type DetectorClass = {
  new (options: { formats: string[] }): Detector;
  getSupportedFormats: () => Promise<string[]>;
};
export function CameraScanner({ onRead }: { onRead: (code: string) => void }) {
  const [open, Open] = useState(false);
  return (
    <Dialog open={open} onOpenChange={Open}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          Escanear con cámara
        </Button>
      </DialogTrigger>
      <DialogContent className="camera-dialog">
        <DialogHeader>
          <DialogTitle>Lector de cámara opcional</DialogTitle>
          <DialogDescription>
            Requiere localhost o HTTPS y compatibilidad con BarcodeDetector.
            Puedes usar siempre el campo manual.
          </DialogDescription>
        </DialogHeader>
        {open && <CameraBody onRead={onRead} />}
      </DialogContent>
    </Dialog>
  );
}
function CameraBody({ onRead }: { onRead: (code: string) => void }) {
  const video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    session = useRef(0),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    read = useRef(onRead),
    lastSeen = useRef(""),
    [devices, Devices] = useState<MediaDeviceInfo[]>([]),
    [device, Device] = useState(""),
    [message, Message] = useState("La cámara está apagada."),
    [busy, Busy] = useState(false);
  useEffect(() => {
    read.current = onRead;
  }, [onRead]);
  function stop() {
    session.current++;
    if (timer.current) clearTimeout(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    lastSeen.current = "";
  }
  useEffect(() => () => stop(), []);
  async function start() {
    stop();
    const version = session.current;
    const Detector = (window as unknown as { BarcodeDetector?: DetectorClass })
      .BarcodeDetector;
    if (
      !window.isSecureContext ||
      !Detector ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      Message(
        "Cámara no compatible en este navegador. Usa el código manual o un lector de teclado.",
      );
      return;
    }
    Busy(true);
    try {
      const supported = await Detector.getSupportedFormats();
      if (version !== session.current) return;
      const formats = ["ean_13", "ean_8", "code_128", "upc_a"].filter((f) =>
        supported.includes(f),
      );
      if (!formats.length)
        throw new Error(
          "No se admiten los formatos necesarios. Usa el campo manual.",
        );
      const next = await navigator.mediaDevices.getUserMedia({
        video: device
          ? { deviceId: { exact: device } }
          : { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (version !== session.current) {
        next.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = next;
      Devices(
        (await navigator.mediaDevices.enumerateDevices()).filter(
          (d) => d.kind === "videoinput",
        ),
      );
      if (!video.current) return;
      video.current.srcObject = next;
      await video.current.play();
      Message(
        "Cámara activa. Retira el código del cuadro antes de volver a leerlo.",
      );
      const detector = new Detector({ formats });
      const detect = async () => {
        if (version !== session.current || !video.current) return;
        try {
          const values = await detector.detect(video.current);
          if (version !== session.current) return;
          const code = values[0]?.rawValue || "";
          if (code && code !== lastSeen.current) read.current(code);
          lastSeen.current = code;
        } catch {
          if (version === session.current)
            Message(
              "No se pudo leer la imagen. Prueba acercar el código o usa el campo manual.",
            );
        }
        if (version === session.current)
          timer.current = setTimeout(() => void detect(), 500);
      };
      void detect();
    } catch (e) {
      if (version === session.current)
        Message(
          e instanceof DOMException && e.name === "NotAllowedError"
            ? "Permiso de cámara denegado. Usa el campo manual."
            : e instanceof DOMException && e.name === "NotFoundError"
              ? "No se encontró una cámara. Usa el campo manual."
              : "No se pudo iniciar la cámara o sus formatos. Usa el campo manual.",
        );
    } finally {
      if (version === session.current) Busy(false);
    }
  }
  return (
    <div className="customer-form">
      <video
        ref={video}
        muted
        playsInline
        className="camera-video"
        aria-label="Vista de cámara para códigos"
      />
      {devices.length > 0 && (
        <label>
          Cámara
          <select
            value={device}
            onChange={(e) => {
              stop();
              Device(e.target.value);
              Message("Pulsa Iniciar cámara para usar la seleccionada.");
            }}
          >
            <option value="">Automática</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Cámara disponible"}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="customer-actions">
        <Button onClick={() => void start()} disabled={busy} aria-busy={busy}>
          Iniciar cámara
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            stop();
            Busy(false);
            Message("Cámara detenida.");
          }}
        >
          Detener cámara
        </Button>
      </div>
      <p role="status">{message}</p>
    </div>
  );
}
