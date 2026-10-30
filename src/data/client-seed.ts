import type { DemoUser } from "@/types/commerce";
export function withDemoClient(users: DemoUser[]): DemoUser[] {
  if (users.some((u) => u.role === "customer" && u.demoAccess)) return users;
  let email = "cliente@rosita.test",
    id = "rosita-cliente-demo",
    n = 1;
  while (users.some((u) => u.email === email))
    email = `cliente+${n++}@rosita.test`;
  n = 1;
  while (users.some((u) => u.id === id)) id = `rosita-cliente-demo-${n++}`;
  return [
    ...users,
    {
      id,
      email,
      name: "Cliente Rosita",
      role: "customer",
      demoAccess: true,
      salt: "cef8cfe615745a12c5f6c1db72eda812",
      verifier:
        "cd6a7f99b4f6061ae4155294055dd87dad128543aba62ce98b37fa8815148ff9",
      iterations: 210000,
      createdAt: "2026-10-29T00:00:00.000Z",
    },
  ];
}
