import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { WalletInput } from "@/features/wallets/schemas";
import type { Wallet } from "@prisma/client";

const QUERY_KEY = "wallets";

export function useWallets() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient.get<{ wallets: Wallet[]; totalBalance: number }>("/api/wallets"),
  });
}

export function useWallet(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => apiClient.get<Wallet>(`/api/wallets/${id}`),
    enabled: !!id,
  });
}

export function useCreateWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WalletInput) =>
      apiClient.post<Wallet>("/api/wallets", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateWallet(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WalletInput>) =>
      apiClient.patch<Wallet>(`/api/wallets/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ deleted: boolean }>(`/api/wallets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}