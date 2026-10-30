import { useTaxonomy } from "@/hooks/use-taxonomy";
import { ImagePicker } from "@/components/image-picker";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { productInputSchema } from "@/lib/admin-validation";
import { solesToCents } from "@/lib/checkout-validation";
import { useRosita } from "@/hooks/use-rosita";
import { useOperation } from "@/hooks/use-operation";
import type { CatalogRecord, ProductInput } from "@/types/catalog";
interface Values {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  presentation: string;
  price: string;
  imageKey: string;
  active: boolean;
  threshold: string;
  stock: string;
}
export function ProductEditor({
  product,
  trigger,
}: {
  product?: CatalogRecord;
  trigger: ReactNode;
}) {
  const [open, Open] = useState(false),
    [dirty, Dirty] = useState(false),
    [discard, Discard] = useState(false),
    warning = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (discard) warning.current?.focus();
  }, [discard]);
  useEffect(() => {
    if (!open || !dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [open, dirty]);
  const close = () => {
    Dirty(false);
    Discard(false);
    Open(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && dirty) {
          Discard(true);
          return;
        }
        Discard(false);
        Open(value);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="admin-editor">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar producto" : "Crear producto"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "El identificador se conserva. Ajusta existencias desde Inventario."
              : "Un registro nuevo se comparte con tienda e inventario. Usa datos de prueba."}
          </DialogDescription>
        </DialogHeader>
        {discard && (
          <div
            className="admin-discard"
            role="alert"
            tabIndex={-1}
            ref={warning}
          >
            <strong>Tienes cambios sin guardar.</strong>
            <p>¿Quieres descartarlos o seguir editando?</p>
            <div className="customer-actions">
              <Button variant="outline" onClick={() => Discard(false)}>
                Seguir editando
              </Button>
              <Button variant="destructive" onClick={close}>
                Descartar cambios
              </Button>
            </div>
          </div>
        )}
        {open && (
          <ProductForm
            key={product?.id || "new"}
            product={product}
            onDirty={() => Dirty(true)}
            onClose={close}
            onCancel={() => {
              if (dirty) Discard(true);
              else close();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
function ProductForm({
  product,
  onDirty,
  onClose,
  onCancel,
}: {
  product?: CatalogRecord;
  onDirty: () => void;
  onClose: () => void;
  onCancel: () => void;
}) {
  const { categories, subcategoriesFor } = useTaxonomy();
  const { state } = useRosita(),
    [expectedUpdatedAt] = useState(product?.updatedAt || null),
    item = product ? state.inventory[product.id] : null,
    {
      register,
      control,
      setValue,
      clearErrors,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm<Values>({
      defaultValues: {
        id:
          product?.id || "ROS-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
        name: product?.name || "",
        brand: product?.brand || "",
        category: product?.category || "",
        subcategory: product?.subcategory || "",
        description: product?.description || "",
        presentation: product?.presentation || "",
        price: item ? (item.priceCents / 100).toFixed(2) : "",
        imageKey: product?.imageKey || "none",
        active: product?.active ?? true,
        threshold: String(product?.lowStockThreshold ?? 5),
        stock: String(item?.stock ?? 0),
      },
    }),
    { run, error, pending } = useOperation(
      onClose,
      product ? "Producto actualizado" : "Producto creado",
    );
  const [imageBusy, ImageBusy] = useState(false);
  const selectedCategory = useWatch({ control, name: "category" });
  const useWatchImage = useWatch({ control, name: "imageKey" });
  function submit(v: Values) {
    const integer = (s: string) => (/^\d+$/.test(s) ? Number(s) : NaN);
    const input = {
      ...v,
      id: product?.id || v.id,
      priceCents: solesToCents(v.price) ?? NaN,
      lowStockThreshold: integer(v.threshold),
      initialStock: product
        ? state.inventory[product.id].stock
        : integer(v.stock),
    };
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) {
      const map: Record<string, keyof Values> = {
        priceCents: "price",
        lowStockThreshold: "threshold",
        initialStock: "stock",
      };
      parsed.error.issues.forEach((issue, i) => {
        const field =
          map[String(issue.path[0])] || (issue.path[0] as keyof Values);
        const message =
          field === "price"
            ? "Indica un precio mayor que cero, con hasta dos decimales (máximo S/ 1 000 000)."
            : field === "stock" || field === "threshold"
              ? "Usa un número entero entre 0 y 1 000 000."
              : issue.message.startsWith("Too") ||
                  issue.message.startsWith("Invalid")
                ? "Revisa el valor y los límites de este campo."
                : issue.message;
        setError(field, { message }, { shouldFocus: i === 0 });
      });
      return;
    }
    if (!product && state.products.some((p) => p.id === v.id)) {
      setError(
        "id",
        { message: "Ese identificador ya existe." },
        { shouldFocus: true },
      );
      return;
    }
    run((operationId, at) => ({
      type: "admin/product-save",
      operationId,
      at,
      input: parsed.data as ProductInput,
      editing: !!product,
      expectedUpdatedAt,
    }));
  }
  const field = (
    key: keyof Values,
    label: string,
    options: { disabled?: boolean; inputMode?: "decimal" | "numeric" } = {},
  ) => (
    <div className="field" key={key}>
      <Label htmlFor={"product-" + key}>{label}</Label>
      <Input
        id={"product-" + key}
        {...register(key)}
        {...options}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? "product-" + key + "-error" : undefined}
      />
      {errors[key] && (
        <p
          role="alert"
          className="field-error"
          id={"product-" + key + "-error"}
        >
          ⚠ {errors[key].message}
        </p>
      )}
    </div>
  );
  return (
    <form
      className="customer-form admin-product-form"
      noValidate
      onChange={onDirty}
      onSubmit={handleSubmit(submit)}
    >
      <div className="admin-form-grid">
        {field("id", "Identificador", { disabled: !!product })}
        {field("name", "Nombre")}
        {field("brand", "Marca")}
        <div className="field">
          <Label htmlFor="product-category">Categoría</Label>
          <select
            id="product-category"
            {...register("category", {
              onChange: () => {
                setValue("subcategory", "", { shouldDirty: true });
                clearErrors("subcategory");
              },
            })}
            aria-invalid={!!errors.category}
            aria-describedby={
              errors.category ? "product-category-error" : undefined
            }
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p role="alert" className="field-error" id="product-category-error">
              ⚠ {errors.category.message}
            </p>
          )}
        </div>
        <div className="field">
          <Label htmlFor="product-subcategory">Subcategoría</Label>
          <select
            id="product-subcategory"
            {...register("subcategory")}
            disabled={!selectedCategory}
            aria-invalid={!!errors.subcategory}
            aria-describedby={
              errors.subcategory
                ? "product-subcategory-error"
                : "product-subcategory-help"
            }
          >
            <option value="">Selecciona una subcategoría</option>
            {subcategoriesFor(selectedCategory).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.pending ? " · revisar clasificación" : ""}
              </option>
            ))}
          </select>
          {errors.subcategory ? (
            <p
              role="alert"
              className="field-error"
              id="product-subcategory-error"
            >
              ⚠ {errors.subcategory.message}
            </p>
          ) : (
            <p className="hint" id="product-subcategory-help">
              Elige primero la categoría. Usa Por clasificar solo si ningún
              grupo describe el producto.
            </p>
          )}
        </div>
        {field("presentation", "Presentación o unidad")}
        {field("price", "Precio en soles", { inputMode: "decimal" })}
        {field("threshold", "Umbral de stock bajo", { inputMode: "numeric" })}
        {field(
          "stock",
          product ? "Stock actual · editar en Inventario" : "Stock inicial",
          { disabled: !!product, inputMode: "numeric" },
        )}
      </div>
      <div className="field">
        <Label htmlFor="product-description">Descripción</Label>
        <textarea
          id="product-description"
          rows={3}
          {...register("description")}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "product-description-error" : undefined
          }
        />
        {errors.description && (
          <p
            role="alert"
            className="field-error"
            id="product-description-error"
          >
            ⚠ {errors.description.message}
          </p>
        )}
      </div>
      <ImagePicker
        onBusyChange={ImageBusy}
        value={useWatchImage}
        onChange={(value) => {
          setValue("imageKey", value, { shouldDirty: true });
          onDirty();
        }}
      />
      <label className="admin-check">
        <input type="checkbox" {...register("active")} />
        Activo para nuevas compras
      </label>
      {error && (
        <p role="alert" className="field-error">
          ⚠ {error}
        </p>
      )}
      <div className="admin-form-footer">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar edición
        </Button>
        <Button type="submit" disabled={pending || imageBusy}>
          Guardar producto
        </Button>
      </div>
    </form>
  );
}
