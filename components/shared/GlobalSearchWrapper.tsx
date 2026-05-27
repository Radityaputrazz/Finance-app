import { getCurrentUser } from "@/lib/auth/session";
import { getUserTransactions } from "@/lib/db/queries";
import { serializeArray } from "@/lib/utils/serialize";
import { GlobalSearch } from "./GlobalSearch";

export async function GlobalSearchWrapper() {
  const user = await getCurrentUser();
  if (!user?.id) return null;

  const transactions = await getUserTransactions(user.id, { limit: 500 });

  return <GlobalSearch transactions={serializeArray(transactions)} />;
}