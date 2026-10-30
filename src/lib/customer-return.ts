export function safeCustomerReturn(value: string | null): string {
  if (
    value &&
    (["/checkout", "/cuenta", "/mis-pedidos", "/carrito"].includes(value) ||
      /^\/pedido\/[A-Za-z0-9-]+(?:\/(?:confirmacion|seguimiento))?$/.test(
        value,
      ))
  )
    return value;
  return "/cuenta";
}
