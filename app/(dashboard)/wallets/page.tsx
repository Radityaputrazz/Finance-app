import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { getUserWallets } from "@/lib/db/queries";
import { WalletsClient } from "./WalletsClient";
import { serializeArray } from "@/lib/utils/serialize";

export const metadata: Metadata = { title: "Dompet" };

export default async function WalletsPage() {
  const user = await requireAuth();
  const wallets = await getUserWallets(user.id);
  return <WalletsClient wallets={serializeArray(wallets)} />;
}