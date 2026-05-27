"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { TransactionWithRelations } from "@/features/transactions/types";

const PAGE_SIZE = 20;

export function useInfiniteTransactions(filter?: {
  type?: string;
  search?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["transactions-infinite", filter],
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(PAGE_SIZE),
        ...(filter?.type && filter.type !== "ALL" && { type: filter.type }),
        ...(filter?.search && { search: filter.search }),
      });
      return apiClient.get<{
        transactions: TransactionWithRelations[];
        meta: { page: number; totalPages: number; total: number };
      }>(`/api/transactions?${params}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 1000 * 30,
  });
}