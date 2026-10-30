import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { Link } from "react-router";
import { ArrowRight, Bell, Component, MousePointer2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DemoCounter } from "@/components/demo-counter";
import { ValidationForm } from "@/features/comprobacion/validation-form";
import { motionTokens } from "@/lib/motion";
export function CheckPage() {
  const heading = useHeadingFocus();
  const reduced = useMotionPreference();
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">ETAPA 01 / PREPARACIÓN</p>
          <h1 ref={heading} tabIndex={-1}>
            La base de Rosita,
            <br />
            en funcionamiento.
          </h1>
          <p className="lead">
            Un espacio pequeño para comprobar las piezas antes de construir la
            tienda.
          </p>
        </div>
        <div className="stage-marker">
          <Component size={28} aria-hidden="true" />
          <span>
            Infraestructura
            <br />
            <strong>lista para continuar</strong>
          </span>
        </div>
      </section>
      <div className="check-grid">
        <Card>
          <CardHeader>
            <Badge variant="secondary" className="section-badge">
              01 · Formularios
            </Badge>
            <CardTitle>Una respuesta clara, en cada campo.</CardTitle>
            <CardDescription>
              React Hook Form + Zod, con errores junto al campo y confirmación
              visible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ValidationForm />
          </CardContent>
        </Card>
        <div className="stack">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="section-badge">
                02 · Persistencia
              </Badge>
              <CardTitle>El mismo dato, donde vayas.</CardTitle>
            </CardHeader>
            <CardContent>
              <DemoCounter />
              <Button asChild variant="outline" className="full-width">
                <Link to="/estado">
                  Ver en la segunda ruta <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="section-badge">
                03 · Interacción
              </Badge>
              <CardTitle>Modal, aviso y movimiento.</CardTitle>
              <CardDescription>
                Controles por teclado y una transición breve que respeta
                movimiento reducido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="demo-actions">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <MousePointer2 aria-hidden="true" />
                      Probar modal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Un modal de Rosita</DialogTitle>
                      <DialogDescription>
                        Prueba Tab, Shift + Tab y Escape. Al cerrar, el foco
                        vuelve al botón de origen.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="field">
                      <Label htmlFor="nota-modal">
                        Nota de prueba (opcional)
                      </Label>
                      <Input
                        id="nota-modal"
                        placeholder="No se guardará esta nota"
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button>Cerrar modal</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="secondary"
                  onClick={() =>
                    toast.success("Notificación de prueba", {
                      description:
                        "El sistema de avisos está listo. No se ejecutó una compra.",
                    })
                  }
                >
                  <Bell aria-hidden="true" />
                  Probar notificación
                </Button>
              </div>
              <motion.p
                key={reduced ? "reduced" : "normal"}
                data-testid="motion-sample"
                className="motion-sample"
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduced ? 0 : motionTokens.panel,
                  ease: motionTokens.ease,
                }}
              >
                ✓ Transición breve ·{" "}
                {reduced ? "Movimiento reducido activo" : "240 ms"}
              </motion.p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
