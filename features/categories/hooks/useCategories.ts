import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { CategoryInput } from "@/features/categories/schemas";
import type { CategoryWithCount } from "@/features/categories/types";

const QUERY_KEY = "categories";

export function useCategories(type?: "INCOME" | "EXPENSE") {
  const url = type
    ? `/api/categories?type=${type}`
    : "/api/categories";

  return useQuery({
    queryKey: [QUERY_KEY, type],
    queryFn: () => apiClient.get<CategoryWithCount[]>(url),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => apiClient.get<CategoryWithCount>(`/api/categories/${id}`),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) =>
      apiClient.post<CategoryWithCount>("/api/categories", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) =>
      apiClient.patch<CategoryWithCount>(`/api/categories/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ deleted: boolean }>(`/api/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}