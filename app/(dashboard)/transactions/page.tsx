import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { getUserTransactions, getUserCategories, getUserWallets } from "@/lib/db/queries";
import { TransactionsClient } from "./TransactionsClient";
import { serializeArray } from "@/lib/utils/serialize";

export const metadata: Metadata = { title: "Transaksi" };

export default async function TransactionsPage() {
  const user = await requireAuth();

  const [transactions, categories, wallets] = await Promise.all([
    getUserTransactions(user.id),
    getUserCategories(user.id),
    getUserWallets(user.id),
  ]);

  return (
    <TransactionsClient
      transactions={serializeArray(transactions)}
      categories={serializeArray(categories)}
      wallets={serializeArray(wallets)}
    />
  );
}