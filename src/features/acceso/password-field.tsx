import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function PasswordField({
  label = "contraseña",
  ...props
}: ComponentProps<typeof Input> & { label?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-control">
      <Input {...props} type={visible ? "text" : "password"} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={(visible ? "Ocultar " : "Mostrar ") + label}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  );
}
