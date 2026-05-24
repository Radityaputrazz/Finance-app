import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user || !user.id) redirect("/login");
  return user as { id: string; name?: string | null; email?: string | null; image?: string | null };
}

export async function requireGuest() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
}