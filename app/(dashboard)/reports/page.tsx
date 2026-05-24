import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ReportsClient } from "./ReportsClient";
import { serializeArray } from "@/lib/utils/serialize";
import { transactionWithRelations } from "@/lib/db/types";

export const metadata: Metadata = { title: "Laporan" };

export default async function ReportsPage() {
  const user = await requireAuth();

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: twelveMonthsAgo } },
    include: transactionWithRelations,
    orderBy: { date: "desc" },
  });

  return <ReportsClient transactions={serializeArray(transactions)} />;
}