import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { getUserCategories } from "@/lib/db/queries";
import { CategoriesClient } from "./CategoriesClient";
import { serializeArray } from "@/lib/utils/serialize";

export const metadata: Metadata = { title: "Kategori" };

export default async function CategoriesPage() {
  const user = await requireAuth();
  const categories = await getUserCategories(user.id);
  return <CategoriesClient categories={serializeArray(categories)} />;
}