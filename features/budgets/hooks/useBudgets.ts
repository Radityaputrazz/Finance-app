import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { BudgetInput } from "@/features/budgets/schemas";
import type { BudgetWithRelations } from "@/features/budgets/types";

const QUERY_KEY = "budgets";

export function useBudgets() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => apiClient.get<BudgetWithRelations[]>("/api/budgets"),
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => apiClient.get<BudgetWithRelations>(`/api/budgets/${id}`),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetInput) =>
      apiClient.post<BudgetWithRelations>("/api/budgets", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateBudget(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BudgetInput>) =>
      apiClient.patch<BudgetWithRelations>(`/api/budgets/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ deleted: boolean }>(`/api/budgets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}