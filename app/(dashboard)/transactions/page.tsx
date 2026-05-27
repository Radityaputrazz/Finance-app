import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { getUserCategories, getUserWallets } from "@/lib/db/queries";
import { TransactionsClient } from "./TransactionsClient";
import { serializeArray } from "@/lib/utils/serialize";

export const metadata: Metadata = { title: "Transaksi" };

export default async function TransactionsPage() {
  const user = await requireAuth();

  const [categories, wallets] = await Promise.all([
    getUserCategories(user.id),
    getUserWallets(user.id),
  ]);

  return (
    <TransactionsClient
      categories={serializeArray(categories)}
      wallets={serializeArray(wallets)}
    />
  );
}