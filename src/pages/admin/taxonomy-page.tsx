import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImagePicker } from "@/components/image-picker";
import { useRosita } from "@/hooks/use-rosita";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useOperation } from "@/hooks/use-operation";
import { taxonomyInputSchema } from "@/lib/module-operations";
import { AdminHeading } from "@/features/administracion/admin-common";
import { AdminTable } from "@/features/administracion/admin-table";
import type {
  ManagedCategory,
  ManagedSubcategory,
  TaxonomyInput,
} from "@/types/modules";
type Item = ManagedCategory | ManagedSubcategory;
export function TaxonomyPage() {
  const { state } = useRosita(),
    { categories, subcategories, categoryById } = useTaxonomy(),
    [kind, Kind] = useState<"category" | "subcategory">("category"),
    [edit, Edit] = useState<{
      kind: "category" | "subcategory";
      record?: Item;
    } | null>(null),
    [query, Query] = useState("");
  const rows: Item[] = (
    kind === "category" ? categories : subcategories
  ).filter((x) =>
    (x.name + " " + x.slug)
      .toLocaleLowerCase("es")
      .includes(query.toLocaleLowerCase("es")),
  );
  return (
    <div className="admin-page">
      <AdminHeading
        eyebrow="ESTRUCTURA COMERCIAL"
        title="Categorías y subcategorías"
        description="Identificadores estables, orden e imágenes compartidos con la tienda."
      >
        <Button onClick={() => Edit({ kind })}>
          Crear {kind === "category" ? "categoría" : "subcategoría"}
        </Button>
      </AdminHeading>
      <div
        className="module-switch"
        role="group"
        aria-label="Tipo de taxonomía"
      >
        <Button
          variant={kind === "category" ? "default" : "outline"}
          aria-pressed={kind === "category"}
          onClick={() => Kind("category")}
        >
          Categorías
        </Button>
        <Button
          variant={kind === "subcategory" ? "default" : "outline"}
          aria-pressed={kind === "subcategory"}
          onClick={() => Kind("subcategory")}
        >
          Subcategorías
        </Button>
      </div>
      <Label htmlFor="taxonomy-search">Buscar por nombre o slug</Label>
      <Input
        id="taxonomy-search"
        value={query}
        onChange={(e) => Query(e.target.value)}
      />
      <p className="hint">
        {rows.length} registros. Menor orden aparece primero; los empates se
        ordenan por nombre. No se eliminan referencias.
      </p>
      <AdminTable<Item>
        rows={rows}
        label={
          kind === "category"
            ? "Categorías compartidas"
            : "Subcategorías compartidas"
        }
        rowKey={(r) => r.id}
        columns={[
          {
            key: "name",
            label: "Nombre / identificador",
            render: (r) => (
              <>
                <strong>{r.name}</strong>
                <small>
                  {r.id} · /{r.slug}
                </small>
                {"category" in r && (
                  <small>{categoryById(r.category)?.name}</small>
                )}
              </>
            ),
          },
          { key: "order", label: "Orden", render: (r) => r.order },
          {
            key: "active",
            label: "Estado",
            render: (r) => (r.active ? "Activo" : "Inactivo"),
          },
          {
            key: "products",
            label: "Productos asociados",
            render: (r) =>
              state.products.filter((p) =>
                kind === "category"
                  ? p.category === r.id
                  : p.subcategory === r.id,
              ).length,
          },
          {
            key: "action",
            label: "Acciones",
            render: (r) => (
              <Button
                variant="outline"
                aria-label={"Editar " + r.id}
                onClick={() => Edit({ kind, record: r })}
              >
                Editar / ordenar
              </Button>
            ),
          },
        ]}
      />
      {edit && (
        <TaxonomyEditor
          key={edit.record?.id || edit.kind}
          {...edit}
          onClose={() => Edit(null)}
        />
      )}
    </div>
  );
}
function TaxonomyEditor({
  record,
  kind,
  onClose,
}: {
  record?: Item;
  kind: "category" | "subcategory";
  onClose: () => void;
}) {
  const [imageBusy, ImageBusy] = useState(false);
  const [customSlug, CustomSlug] = useState(!!record);
  const { state } = useRosita(),
    { categories } = useTaxonomy(),
    [image, Image] = useState(
      record && "imageKey" in record ? record.imageKey : "none",
    ),
    [discard, Discard] = useState(false);
  const {
      register,
      handleSubmit,
      setError,
      setValue,
      formState: { errors, isDirty },
    } = useForm<TaxonomyInput>({
      defaultValues: {
        id:
          record?.id ||
          (kind === "category" ? "cat-" : "sub-") +
            crypto.randomUUID().slice(0, 8),
        name: record?.name || "",
        slug: record?.slug || "",
        description: record?.description || "",
        active: record?.active ?? true,
        order:
          record?.order ??
          (kind === "category"
            ? categories.length
            : state.subcategories.length),
        imageKey: image,
        category: record && "category" in record ? record.category : "",
      },
    }),
    { run, error, pending } = useOperation(
      onClose,
      "Estructura comercial actualizada",
    );
  const count = state.products.filter((p) =>
    kind === "category"
      ? p.category === record?.id
      : p.subcategory === record?.id,
  ).length;
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) {
          if (
            isDirty ||
            image !==
              (record && "imageKey" in record ? record.imageKey : "none")
          )
            Discard(true);
          else onClose();
        }
      }}
    >
      <DialogContent className="admin-editor">
        <DialogHeader>
          <DialogTitle>
            {record ? "Editar" : "Crear"}{" "}
            {kind === "category" ? "categoría" : "subcategoría"}
          </DialogTitle>
          <DialogDescription>
            {count} productos asociados. Desactivar oculta nuevas compras y
            conserva productos e historial. Cambiar nombre no cambia el
            identificador.
          </DialogDescription>
        </DialogHeader>
        {discard && (
          <div role="alert" className="inline-confirm">
            <p>Hay cambios sin guardar.</p>
            <Button variant="outline" onClick={() => Discard(false)}>
              Seguir editando
            </Button>
            <Button variant="destructive" onClick={onClose}>
              Descartar cambios
            </Button>
          </div>
        )}
        <form
          className="customer-form"
          noValidate
          onSubmit={handleSubmit((v) => {
            const input = {
              ...v,
              id: record?.id || v.id,
              order: Number(v.order),
              imageKey: image,
            };
            const parsed = taxonomyInputSchema.safeParse(input);
            if (!parsed.success) {
              parsed.error.issues.forEach((i, n) =>
                setError(
                  i.path[0] as keyof TaxonomyInput,
                  {
                    message: /^(Invalid|Too)/.test(i.message)
                      ? "Revisa el formato y los límites de este campo."
                      : i.message,
                  },
                  { shouldFocus: n === 0 },
                ),
              );
              return;
            }
            const normalize = (s: string) =>
              s
                .trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLocaleLowerCase("es");
            const others = (
              kind === "category" ? state.categories : state.subcategories
            ).filter((x) => x.id !== record?.id);
            if (
              others.some(
                (x) =>
                  normalize(x.name) === normalize(input.name) &&
                  (kind === "category" ||
                    ("category" in x && x.category === input.category)),
              )
            ) {
              setError(
                "name",
                { message: "Ya existe ese nombre en este grupo." },
                { shouldFocus: true },
              );
              return;
            }
            if (
              others.some((x) =>
                [x.id, x.slug, ...x.aliases].includes(input.slug),
              )
            ) {
              setError(
                "slug",
                {
                  message:
                    "Ese slug está usado, incluso por un enlace anterior.",
                },
                { shouldFocus: true },
              );
              return;
            }
            if (
              kind === "subcategory" &&
              (!categories.some((c) => c.id === input.category) ||
                (record &&
                  "category" in record &&
                  record.category !== input.category &&
                  count > 0))
            ) {
              setError(
                "category",
                {
                  message: count
                    ? "Reasigna primero los productos asociados."
                    : "Selecciona una categoría válida.",
                },
                { shouldFocus: true },
              );
              return;
            }
            run((operationId, at) => ({
              type: "admin/taxonomy-save",
              kind,
              input: parsed.data,
              editing: !!record,
              operationId,
              at,
            }));
          })}
        >
          <div className="admin-form-grid">
            {(["id", "name", "slug", "description", "order"] as const).map(
              (key) => (
                <div className="field" key={key}>
                  <Label htmlFor={"tax-" + key}>
                    {
                      {
                        id: "Identificador estable",
                        name: "Nombre",
                        slug: "Slug",
                        description: "Descripción",
                        order: "Orden",
                      }[key]
                    }
                  </Label>
                  <Input
                    id={"tax-" + key}
                    type={key === "order" ? "number" : "text"}
                    disabled={key === "id" && !!record}
                    {...register(key, {
                      onChange:
                        key === "name" && !record
                          ? (e) => {
                              if (!customSlug)
                                setValue(
                                  "slug",
                                  e.target.value
                                    .normalize("NFD")
                                    .replace(/[\u0300-\u036f]/g, "")
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/^-|-$/g, ""),
                                );
                            }
                          : key === "slug"
                            ? () => {
                                CustomSlug(true);
                              }
                            : undefined,
                    })}
                    aria-invalid={!!errors[key]}
                    aria-describedby={
                      errors[key] ? "tax-" + key + "-error" : undefined
                    }
                  />
                  {errors[key] && (
                    <p
                      role="alert"
                      className="field-error"
                      id={"tax-" + key + "-error"}
                    >
                      ⚠ {errors[key].message}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
          {kind === "subcategory" && (
            <div className="field">
              <Label htmlFor="tax-category">Categoría vinculada</Label>
              <select
                id="tax-category"
                {...register("category")}
                aria-invalid={!!errors.category}
                aria-describedby={
                  errors.category ? "tax-category-error" : undefined
                }
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {!c.active ? " · inactiva" : ""}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p role="alert" className="field-error" id="tax-category-error">
                  ⚠ {errors.category.message}
                </p>
              )}
              <p className="hint">
                Si tiene productos, reasígnalos desde Productos antes de cambiar
                esta relación.
              </p>
            </div>
          )}
          {kind === "category" && (
            <ImagePicker
              value={image}
              onChange={Image}
              resources={false}
              onBusyChange={ImageBusy}
            />
          )}
          <label className="admin-check">
            <input type="checkbox" {...register("active")} />
            Activo en navegación y nuevas compras
          </label>
          {record && (
            <p className="hint">
              Enlaces anteriores: {record.aliases.join(", ") || "sin alias"}. Un
              cambio de slug conserva el anterior.
            </p>
          )}
          {error && (
            <p role="alert" className="field-error">
              ⚠ {error}
            </p>
          )}
          <div className="admin-form-footer">
            <Button
              type="button"
              variant="outline"
              onClick={() => (isDirty ? Discard(true) : onClose())}
            >
              Cancelar edición
            </Button>
            <Button type="submit" disabled={pending || imageBusy}>
              {pending ? "Guardando…" : "Guardar estructura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
