import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { TransactionInput, TransactionFilter } from "@/features/transactions/schemas";
import type { TransactionWithRelations } from "@/features/transactions/types";
import type { PaginatedResponse } from "@/types";

const QUERY_KEY = "transactions";

function buildUrl(filter?: Partial<TransactionFilter>) {
  if (!filter) return "/api/transactions";
  const params = new URLSearchParams();
  Object.entries(filter).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== "ALL") params.set(k, String(v));
  });
  return `/api/transactions?${params.toString()}`;
}

export function useTransactions(filter?: Partial<TransactionFilter>) {
  return useQuery({
    queryKey: [QUERY_KEY, filter],
    queryFn: () =>
      apiClient.get<{
        transactions: TransactionWithRelations[];
        meta: PaginatedResponse<TransactionWithRelations>["meta"];
      }>(buildUrl(filter)),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => apiClient.get<TransactionWithRelations>(`/api/transactions/${id}`),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionInput) =>
      apiClient.post<TransactionWithRelations>("/api/transactions", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateTransaction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionInput) =>
      apiClient.patch<TransactionWithRelations>(`/api/transactions/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ deleted: boolean }>(`/api/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}