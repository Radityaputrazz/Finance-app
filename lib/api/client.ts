type Method = "GET" | "POST" | "PATCH" | "DELETE";

async function apiFetch<T>(
  path: string,
  method: Method = "GET",
  body?: unknown
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error ?? "Terjadi kesalahan");
  }

  return json.data as T;
}

export const apiClient = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) => apiFetch<T>(path, "POST", body),
  patch: <T>(path: string, body: unknown) => apiFetch<T>(path, "PATCH", body),
  delete: <T>(path: string) => apiFetch<T>(path, "DELETE"),
};