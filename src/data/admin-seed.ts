import type { DemoUser } from "@/types/commerce";
export const demoAdminEmail = "admin@rosita.test";
export function withDemoAdmin(users: DemoUser[]): DemoUser[] {
  if (users.some((u) => u.role === "admin")) return users;
  let email = demoAdminEmail,
    id = "rosita-admin-demo",
    n = 1;
  while (users.some((u) => u.email === email))
    email = `admin+${n++}@rosita.test`;
  n = 1;
  while (users.some((u) => u.id === id)) id = `rosita-admin-demo-${n++}`;
  return [
    ...users,
    {
      id,
      name: "Administración Rosita",
      email,
      role: "admin",
      salt: "62d7285c00697152a5afdf46928bb83c",
      verifier:
        "d38f8c642ae7f0fb4fb701d0ea858f8d99fcf21568d731247424fe08d4a7a144",
      iterations: 210000,
      createdAt: "2026-10-29T00:00:00.000Z",
    },
  ];
}
