import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-linen-100">
      <AdminNav email={user.email ?? null} />
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
    </div>
  );
}
