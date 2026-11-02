import { operationsOperation } from "@/lib/operations";
import type { OperationsAction } from "@/types/operations";
import { priceCart } from "@/lib/cart-pricing";
import { moduleOperation } from "@/lib/module-operations";
import { adminOperation, advanceOrder, isAdmin } from "@/lib/admin-operations";
import { initialState, demoProduct, emptyCheckout } from "@/data/demo";
import { deliverySchema } from "@/lib/checkout-validation";
import { prepareQuote, confirmOrder } from "@/lib/order-transaction";
import type { RositaAction, RositaState } from "@/types/state";
export function rositaReducer(
  state: RositaState,
  action: RositaAction,
): RositaState {
  if (
    [
      "agent/save",
      "store/location",
      "shift/open",
      "shift/close",
      "cash/cart",
      "cash/confirm",
      "tracking/save",
    ].includes(action.type)
  )
    return operationsOperation(state, action as OperationsAction);
  if (
    action.type === "admin/taxonomy-save" ||
    action.type === "admin/media-register" ||
    action.type === "profile/save"
  )
    return moduleOperation(state, action);
  const changedCart = (cart: RositaState["cart"]): RositaState => ({
    ...state,
    cart,
    checkout: {
      ...state.checkout,
      quote: null,
      error: state.checkout.token
        ? "Tu carrito cambió. Revisa los importes; la tarjeta requiere una nueva simulación."
        : "",
    },
  });
  switch (action.type) {
    case "demo/increment":
      return {
        ...state,
        demoQuantity: Math.min(demoProduct.stock, state.demoQuantity + 1),
      };
    case "demo/decrement":
      return { ...state, demoQuantity: Math.max(0, state.demoQuantity - 1) };
    case "app/reset":
      if (!isAdmin(state))
        return {
          ...state,
          adminResult: {
            operationId: "reset",
            ok: false,
            error: "Solo el administrador puede restablecer la demostración.",
          },
        };
      return {
        ...initialState,
        cart: {},
        users: initialState.users.map((u) => ({ ...u })),
        products: initialState.products.map((p) => ({ ...p })),
        inventory: Object.fromEntries(
          Object.entries(initialState.inventory).map(([id, v]) => [
            id,
            { ...v },
          ]),
        ),
        movements: [],
        processedAdminOperations: [],
        recordingSince: action.at || state.recordingSince,
        adminResult: { operationId: "", ok: false, error: "" },
        orders: [],
        checkout: emptyCheckout(),
      };
    case "cart/clear":
      return changedCart({});
    case "cart/remove": {
      const cart = { ...state.cart };
      delete cart[action.id];
      return changedCart(cart);
    }
    case "cart/add":
    case "cart/set": {
      const p = state.products.find((p) => p.id === action.id),
        stock = state.inventory[action.id]?.stock ?? 0;
      if (
        !p ||
        !p.active ||
        stock < 1 ||
        !Number.isSafeInteger(action.quantity) ||
        action.quantity < 1
      )
        return state;
      const wanted =
        action.type === "cart/add"
          ? (state.cart[action.id] || 0) + action.quantity
          : action.quantity;
      if (state.cart[action.id] === Math.min(stock, wanted)) return state;
      const candidate = {
        ...state,
        cart: { ...state.cart, [action.id]: Math.min(stock, wanted) },
      };
      return priceCart({
        ...candidate,
        cart: { [action.id]: Math.min(stock, wanted) },
      }).error
        ? state
        : changedCart(candidate.cart);
    }
    case "auth/register": {
      if (
        state.users.some(
          (u) =>
            u.email === action.user.email.trim().toLowerCase() ||
            u.id === action.user.id,
        )
      )
        return {
          ...state,
          authError:
            "Ya existe una cuenta de demostración con este correo. Inicia sesión.",
        };
      return {
        ...state,
        users: [
          ...state.users,
          {
            ...action.user,
            demoAccess: false,
            email: action.user.email.trim().toLowerCase(),
            role: "customer",
          },
        ],
        sessionUserId: action.user.id,
        authError: "",
        checkout: emptyCheckout(),
      };
    }
    case "auth/login":
      return state.users.some(
        (u) => u.id === action.userId && u.active !== false,
      )
        ? {
            ...state,
            sessionUserId: action.userId,
            authError: "",
            checkout:
              state.sessionUserId === action.userId
                ? state.checkout
                : emptyCheckout(),
          }
        : state;
    case "auth/logout":
      return {
        ...state,
        sessionUserId: null,
        authError: "",
        checkout: emptyCheckout(),
      };
    case "checkout/start":
      return state.checkout.token
        ? state
        : { ...state, checkout: { ...state.checkout, token: action.token } };
    case "checkout/draft-delivery":
      return {
        ...state,
        checkout: {
          ...state.checkout,
          delivery: action.delivery,
          quote: null,
          error: "",
        },
      };
    case "checkout/delivery": {
      const delivery = deliverySchema.safeParse(action.delivery);
      return delivery.success
        ? {
            ...state,
            checkout: {
              ...state.checkout,
              delivery: delivery.data,
              step: 1,
              quote: null,
              error: "",
            },
          }
        : state;
    }
    case "checkout/draft-payment":
      return {
        ...state,
        checkout: {
          ...state.checkout,
          payment: action.payment,
          quote: null,
          error: "",
        },
      };
    case "checkout/payment": {
      const next = {
        ...state,
        checkout: { ...state.checkout, payment: action.payment },
      };
      const result = prepareQuote(next);
      return {
        ...next,
        checkout: {
          ...next.checkout,
          step: result.quote ? 2 : 1,
          quote: result.quote,
          error: result.error,
        },
      };
    }
    case "checkout/review": {
      const result = prepareQuote(state);
      return {
        ...state,
        checkout: {
          ...state.checkout,
          quote: result.quote,
          error: result.error,
        },
      };
    }
    case "checkout/step":
      return action.step >= 0 && action.step < state.checkout.step
        ? {
            ...state,
            checkout: { ...state.checkout, step: action.step, error: "" },
          }
        : state;
    case "order/confirm":
      return confirmOrder(state, action);
    case "order/advance":
      return advanceOrder(state, action);
    case "admin/product-archive":
    case "admin/product-save":
    case "admin/product-active":
    case "admin/stock":
      return adminOperation(state, action);
    default:
      return state;
  }
}
