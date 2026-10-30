import { AmbientVideo } from "@/features/inicio/ambient-video";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { useRosita } from "@/hooks/use-rosita";
import { ImagePicker } from "@/components/image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function ModulePatterns() {
  const { state } = useRosita(),
    admin =
      state.users.find((u) => u.id === state.sessionUserId)?.role === "admin",
    [image, Image] = useState("none"),
    [variant, Variant] = useState("normal"),
    field = useRef<HTMLInputElement>(null);
  return (
    <section className="system-section">
      <h2>Patrones de información y gestión · 2.6.0</h2>
      <p>
        La información corporativa y ayuda usan la misma tipografía y
        superficies. La gestión comparte formularios, estados, foco y tablas;
        sus datos se reflejan en tienda y reportes.
      </p>
      <div className="module-switch">
        <Button asChild variant="outline">
          <Link to="/ayuda">Ayuda y acordeones</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/contacto">Validación de contacto</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/categorias">Gestión de taxonomía</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/reportes">Reportes e impresión</Link>
        </Button>
      </div>
      <h3>Estados de campo · muestra interna</h3>
      <p>
        Este selector demuestra estados del UI Kit; no representa una operación
        del negocio.
      </p>
      <Label htmlFor="pattern-state">Estado de muestra</Label>
      <select
        id="pattern-state"
        value={variant}
        onChange={(e) => Variant(e.target.value)}
      >
        {[
          ["normal", "Normal"],
          ["loading", "Procesamiento / deshabilitado"],
          ["error", "Error"],
          ["success", "Éxito"],
        ].map(([v, t]) => (
          <option value={v} key={v}>
            {t}
          </option>
        ))}
      </select>
      <div className="field">
        <Label htmlFor="pattern-input">Nombre del grupo · muestra</Label>
        <Input
          ref={field}
          id="pattern-input"
          defaultValue="Grupo de muestra"
          disabled={variant === "loading"}
          aria-invalid={variant === "error"}
          aria-describedby="pattern-feedback"
        />
        <p
          id="pattern-feedback"
          role={variant === "error" ? "alert" : "status"}
          className={variant === "error" ? "field-error" : "hint"}
        >
          {variant === "error"
            ? "⚠ Ejemplo: ya existe ese nombre. Elige otro."
            : variant === "loading"
              ? "Procesando · ejemplo de estado."
              : variant === "success"
                ? "✓ Ejemplo de confirmación: cambios guardados."
                : "Etiqueta visible y orientación cerca del campo."}
        </p>
        <Button
          variant="outline"
          disabled={variant === "loading"}
          onClick={() => field.current?.focus()}
        >
          Probar foco del campo
        </Button>
      </div>
      <details>
        <summary>Regla de interacción compartida</summary>
        <p>
          Foco visible, error junto al campo, controles de al menos 44 px y
          confirmación textual. Los paneles permiten Escape y conservan el
          contexto; el movimiento se reduce según preferencia.
        </p>
      </details>
      <h3>Video suplementario · componente real</h3>
      <p>
        Sin carga ni reproducción automática en esta muestra. Pausa al salir de
        pantalla o al ocultar la pestaña. El contenido y las acciones funcionan
        con el poster. Movimiento reducido empieza con imagen estática.
      </p>
      <AmbientVideo
        src="/images/video/web/video-intro.mp4"
        poster="/images/video/web/video-intro-poster.jpg"
        label="muestra del sistema de diseño"
        automatic={false}
      />
      <h3>Tarjeta simulada y jerarquía de tareas</h3>
      <p>
        Compra: acción principal. Cantidades: controles equivalentes.
        Eliminar/vaciar: destructivo con icono o etiqueta; volver/cancelar:
        secundario. La tarjeta ofrece validación, procesamiento, rechazo, error
        y aprobación textual. El permiso de aprobar vive solo en memoria y se
        invalida al cambiar la compra.
      </p>
      <Button asChild variant="outline">
        <Link to="/ayuda#entregas-pagos">
          Consultar escenarios ficticios de pago
        </Link>
      </Button>
      <h3>Preparación de imagen · componente real</h3>
      {admin ? (
        <>
          <p className="hint">
            Se guardan recursos de demostración reales en este navegador; no se
            asignan a un producto desde esta muestra. Restablecer Rosita limpia
            estos recursos.
          </p>
          <ImagePicker value={image} onChange={Image} />
        </>
      ) : (
        <p>
          Inicia una sesión administrativa para probar la subida real.{" "}
          <Link to="/personal">Accesos de demostración</Link>
        </p>
      )}
      <p>
        El UI Kit contiene piezas y variantes. El Design System define cuándo
        usarlas, sus tokens, permisos, validación, persistencia y reglas de
        colaboración. Versión 2.6.0: información/ayuda, perfil, taxonomía
        editable, imágenes locales y reportes compartidos.
      </p>
    </section>
  );
}
