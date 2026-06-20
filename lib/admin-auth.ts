import { cookies } from "next/headers";

const COOKIE = "admin_session";

export async function getAdminUser(): Promise<{ email: null } | null> {
  const jar = await cookies();
  const val = jar.get(COOKIE)?.value;
  const password = process.env.ADMIN_PASSWORD;
  if (!password || val !== password) return null;
  return { email: null };
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export const ADMIN_COOKIE = COOKIE;
