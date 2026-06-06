import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { ADMIN_LOGIN_PATH } from "@/lib/auth/constants";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

export default async function SecureAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return (
    <>
      <div className="fixed top-5 right-5 sm:top-6 sm:right-8 z-50">
        <AdminLogoutButton displayName={user.displayName} />
      </div>
      {children}
    </>
  );
}
