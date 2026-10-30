import type { DemoUser } from "@/types/commerce";
export function withDemoCashier(users: DemoUser[]): DemoUser[] {
  if (users.some((u) => u.cashierDemo && u.role === "cashier")) return users;
  let n = 0,
    email = "caja@rosita.test",
    id = "demo-cashier";
  while (users.some((u) => u.email === email || u.id === id)) {
    n++;
    email = "caja+" + n + "@rosita.test";
    id = "demo-cashier-" + n;
  }
  return [
    ...users,
    {
      id,
      name: "Agente de caja demo",
      email,
      role: "cashier",
      active: true,
      cashierDemo: true,
      salt: "fdf4d93faa3e8b9ecb101a5984fa0506",
      verifier:
        "09ff0ed047d84b45e5503eefb2921bd139605945d74e607c14692318559e1751",
      iterations: 210000,
      createdAt: "2026-10-30T00:00:00.000Z",
    },
  ];
}
