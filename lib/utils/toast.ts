import { toast } from "sonner";

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),

  // Domain-specific
  created: (resource: string) => toast.success(`${resource} berhasil ditambahkan`),
  updated: (resource: string) => toast.success(`${resource} berhasil diperbarui`),
  deleted: (resource: string) => toast.success(`${resource} berhasil dihapus`),
  failed: (message?: string) => toast.error(message ?? "Terjadi kesalahan, coba lagi"),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),
};