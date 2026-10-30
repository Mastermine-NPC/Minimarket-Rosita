const ITERATIONS = 210000;
const hex = (bytes: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
function bytes(value: string) {
  return new Uint8Array(value.match(/../g)!.map((b) => parseInt(b, 16)));
}
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
) {
  if (!globalThis.crypto?.subtle)
    throw new Error(
      "Abre el prototipo en localhost para usar Web Crypto. No utilices credenciales reales.",
    );
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations },
      key,
      256,
    ),
  );
}
export async function createVerifier(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    salt: hex(salt),
    verifier: await derive(password, salt, ITERATIONS),
    iterations: ITERATIONS,
  };
}
export async function verifyPassword(
  password: string,
  user: { salt: string; verifier: string; iterations: number },
) {
  const actual = await derive(password, bytes(user.salt), user.iterations);
  let difference = 0;
  for (let i = 0; i < actual.length; i++)
    difference |= actual.charCodeAt(i) ^ user.verifier.charCodeAt(i);
  return difference === 0;
}
