// Web Crypto API — works in both Node.js 18+ and Edge Runtime
export async function computeAdminToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`la-smokes-admin:${password}`);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const ADMIN_COOKIE = "admin_token";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
