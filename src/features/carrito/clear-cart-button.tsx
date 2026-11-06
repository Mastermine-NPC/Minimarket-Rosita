import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

export function ClearCartButton({ compact = false }: { compact?: boolean }) {
  const { clear, cart } = useCart();
  return <Dialog>
    <DialogTrigger asChild><Button variant="ghost" className="cart-clear-action" disabled={!Object.keys(cart).length}><Trash2 size={16} aria-hidden="true" />{compact ? "Vaciar" : "Vaciar carrito"}</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader><DialogTitle>¿Vaciar tu carrito?</DialogTitle><DialogDescription>Se quitarán todos los productos de tu selección. El inventario y los pedidos no se modifican.</DialogDescription></DialogHeader>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Conservar productos</Button></DialogClose>
        <DialogClose asChild><Button variant="destructive" onClick={() => { clear(); toast.info("Carrito vacío. Tu selección se ha eliminado."); }}>Sí, vaciar carrito</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
