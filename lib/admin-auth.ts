import { createClient } from "@/lib/supabase/server";

// Returns the signed-in admin user, or null. If ADMIN_EMAIL is set, only that
// address is treated as an admin (defense-in-depth on top of the proxy guard
// and Supabase Auth — disable public sign-ups in Supabase for best security).
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const allowed = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (allowed && user.email?.toLowerCase() !== allowed) return null;

  return user;
}
