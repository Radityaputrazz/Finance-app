import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/features/auth/components/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await requireAuth();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { onboarded: true, name: true },
  });

  // Already onboarded - redirect to dashboard
  if (dbUser?.onboarded) redirect("/dashboard");

  return <OnboardingWizard userName={dbUser?.name ?? "Pengguna"} />;
}