import { useState, type ReactNode } from "react";
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
import { Button } from "@/components/ui/button";
import { useOperation } from "@/hooks/use-operation";
import type { RositaAction } from "@/types/state";
export function ConfirmAction({
  trigger,
  title,
  description,
  label,
  success,
  build,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  label: string;
  success: string;
  build: (
    id: string,
    at: string,
  ) => Extract<RositaAction, { type: `admin/${string}` | "order/advance" }>;
}) {
  const [open, Open] = useState(false),
    { run, error, pending } = useOperation(() => Open(false), success);
  return (
    <Dialog open={open} onOpenChange={Open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="field-error">
            ⚠ {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button disabled={pending} onClick={() => run(build)}>
            {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
