import { isAdmin } from "@/lib/admin-operations";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { Link } from "react-router";
import { ArrowLeft, RotateCcw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DemoCounter } from "@/components/demo-counter";
import { useRosita } from "@/hooks/use-rosita";
import { demoProduct } from "@/data/demo";
import { formatPEN } from "@/lib/currency";
import { STATE_KEY, STORAGE_VERSION } from "@/lib/storage";
export function StatePage() {
  const heading = useHeadingFocus();
  const { state, reset } = useRosita();
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">ETAPA 01 / ESTADO COMPARTIDO</p>
          <h1 ref={heading} tabIndex={-1}>
            Cambia la ruta.
            <br />
            El estado continúa.
          </h1>
          <p className="lead">
            Context y useReducer comparten los datos. localStorage conserva el
            estado de demostración; IndexedDB conserva las imágenes subidas.
          </p>
        </div>
      </section>
      <div className="check-grid">
        <Card>
          <CardHeader>
            <CardTitle>La misma cantidad</CardTitle>
            <CardDescription>
              Aumenta aquí y vuelve a Comprobación para comprobarlo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemoCounter />
            <Button asChild variant="outline">
              <Link to="/comprobacion">
                <ArrowLeft aria-hidden="true" />
                Volver a comprobación
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Datos locales, controlados</CardTitle>
            <CardDescription>
              Formato versionado, validación al leer y restablecimiento limitado
              a Rosita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dato</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Versión</TableCell>
                  <TableCell>{STORAGE_VERSION}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Unidades de prueba</TableCell>
                  <TableCell>{state.demoQuantity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Precio unitario</TableCell>
                  <TableCell>{formatPEN(demoProduct.price)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>
                    {formatPEN(state.demoQuantity * demoProduct.price)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="hint storage-key">
              Clave: <code>{STATE_KEY}</code>. El formulario técnico no se
              guarda. Las cuentas, direcciones y pedidos ficticios sí se
              conservan localmente.
            </p>
            {!isAdmin(state) && (
              <p className="hint">
                Solo el administrador de demostración puede restablecer datos.{" "}
                <Link to="/personal">Acceso de personal</Link>
              </p>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!isAdmin(state)}>
                  <RotateCcw aria-hidden="true" />
                  Restablecer datos de Rosita
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Restablecer esta demostración?</DialogTitle>
                  <DialogDescription>
                    Se eliminarán cuentas de prueba, sesión, carrito, pedidos e
                    inventario modificado de Rosita y se restaurarán los datos
                    iniciales y se quitarán las imágenes subidas de Rosita. Solo
                    se eliminan las claves con prefijo minimarket-rosita: y los
                    archivos de su almacén de imágenes. Los datos de otras
                    aplicaciones se conservan.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={reset}>Sí, restablecer Rosita</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
