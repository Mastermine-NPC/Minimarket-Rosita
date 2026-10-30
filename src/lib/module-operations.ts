import { stateSchema } from "./state-schema";
import { z } from "zod";
import type { RositaState } from "@/types/state";
import type { ModuleAction } from "@/types/modules";
import { isAdmin } from "./admin-operations";
import { productImages } from "@/data/product-images";
const text = (value: string) =>
  value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
const inputSchema = z.object({
  id: z
    .string()
    .regex(
      /^[a-z0-9][a-z0-9-]{1,79}$/,
      "Identificador: minúsculas, números y guiones (2–80).",
    ),
  name: z
    .string()
    .trim()
    .min(2, "Escribe un nombre de al menos 2 caracteres.")
    .max(70),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug: palabras en minúsculas separadas por guiones.",
    )
    .max(80),
  description: z
    .string()
    .trim()
    .min(5, "Describe el grupo con al menos 5 caracteres.")
    .max(500),
  active: z.boolean(),
  order: z.number().int().min(0).max(9999),
  imageKey: z.string(),
  category: z.string(),
});
export const taxonomyInputSchema = inputSchema;
export function moduleOperation(
  state: RositaState,
  action: ModuleAction,
): RositaState {
  const fail = (error: string) => ({
    ...state,
    adminResult: { operationId: action.operationId, ok: false, error },
  });
  if (state.processedAdminOperations.includes(action.operationId)) return state;
  if (!action.operationId || !Number.isFinite(Date.parse(action.at)))
    return fail("Operación inválida.");
  const ok = (next: RositaState): RositaState => {
    const checked = stateSchema.safeParse(next);
    if (!checked.success)
      return fail(
        "La operación dejaría referencias o datos inválidos. Revisa el formulario.",
      );
    return {
      ...checked.data,
      processedAdminOperations: [
        ...state.processedAdminOperations,
        action.operationId,
      ],
      adminResult: { operationId: action.operationId, ok: true, error: "" },
    };
  };
  if (action.type === "profile/save") {
    const profile = z
      .object({
        name: z.string().trim().min(2).max(80),
        email: z.email().max(200),
      })
      .safeParse({
        name: action.name,
        email: action.email.trim().toLowerCase(),
      });
    if (
      !profile.success ||
      state.sessionUserId !== action.id ||
      !state.users.some((u) => u.id === action.id)
    )
      return fail("No puedes modificar este perfil.");
    if (
      state.users.some(
        (u) => u.id !== action.id && u.email === profile.data.email,
      )
    )
      return fail("Ese correo ya pertenece a otra cuenta local.");
    return ok({
      ...state,
      users: state.users.map((u) =>
        u.id === action.id ? { ...u, ...profile.data } : u,
      ),
    });
  }
  if (!isAdmin(state))
    return fail("Solo el administrador puede realizar esta acción.");
  if (action.type === "admin/media-register") {
    const a = action.asset;
    if (
      !/^[a-f0-9-]{36}$/.test(a.id) ||
      !["image/webp", "image/jpeg", "image/png"].includes(a.mime) ||
      a.bytes < 1 ||
      a.bytes > 1250000 ||
      a.width < 1 ||
      a.height < 1 ||
      a.width > 1600 ||
      a.height > 1600 ||
      Object.keys(state.media).length >= 1000
    )
      return fail("Imagen fuera de los límites de Rosita.");
    return ok({ ...state, media: { ...state.media, [a.id]: a } });
  }
  const parsed = inputSchema.safeParse(action.input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const v = parsed.data,
    list = action.kind === "category" ? state.categories : state.subcategories,
    existing = list.find((x) => x.id === v.id);
  if ((action.editing && !existing) || (!action.editing && existing))
    return fail("Identificador inexistente o duplicado.");
  const sameScope = list.filter(
    (x) =>
      x.id !== v.id &&
      (action.kind === "category" ||
        ("category" in x && x.category === v.category)),
  );
  if (sameScope.some((x) => text(x.name) === text(v.name)))
    return fail("Ya existe ese nombre en este grupo.");
  if (
    list.some(
      (x) =>
        x.id !== v.id &&
        [x.id, x.slug, ...x.aliases].some(
          (key) => key === v.slug || key === v.id,
        ),
    )
  )
    return fail(
      "Identificador o slug ya usado, incluso por un enlace anterior.",
    );
  const aliases = [
    ...new Set([
      ...(existing?.aliases || []),
      ...(existing && existing.slug !== v.slug ? [existing.slug] : []),
    ]),
  ];
  if (action.kind === "category") {
    if (
      !productImages.some((i) => i.key === v.imageKey) &&
      !(v.imageKey.startsWith("upload:") && state.media[v.imageKey.slice(7)])
    )
      return fail("Imagen de categoría no válida.");
    const row = {
      id: v.id,
      name: v.name,
      slug: v.slug,
      description: v.description,
      active: v.active,
      order: v.order,
      imageKey: v.imageKey,
      aliases,
      tone: state.categories.find((c) => c.id === v.id)?.tone || "food",
      imageProductId:
        state.categories.find((c) => c.id === v.id)?.imageProductId || "",
    };
    return ok({
      ...state,
      categories: existing
        ? state.categories.map((c) => (c.id === v.id ? row : c))
        : [...state.categories, row],
    });
  }
  if (!state.categories.some((c) => c.id === v.category))
    return fail("Selecciona una categoría válida.");
  if (
    existing &&
    "category" in existing &&
    existing.category !== v.category &&
    state.products.some((p) => p.subcategory === v.id)
  )
    return fail(
      "Reasigna primero los productos asociados antes de cambiar esta subcategoría de categoría.",
    );
  const row = {
    id: v.id,
    name: v.name,
    slug: v.slug,
    description: v.description,
    active: v.active,
    order: v.order,
    category: v.category,
    aliases,
    pending: state.subcategories.find((s) => s.id === v.id)?.pending,
  };
  return ok({
    ...state,
    subcategories: existing
      ? state.subcategories.map((s) => (s.id === v.id ? row : s))
      : [...state.subcategories, row],
  });
}
