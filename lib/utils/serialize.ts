import { parseDecimal } from "@/lib/utils";

// Recursively convert Decimal fields to numbers in any object
export function serializeDecimal<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "object" && "toNumber" in (obj as object)) {
    return parseDecimal(obj) as unknown as T;
  }

  if (obj instanceof Date) return obj;

  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal) as unknown as T;
  }

  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k,
        serializeDecimal(v),
      ])
    ) as T;
  }

  return obj;
}

// Serialize array of objects
export function serializeArray<T>(arr: T[]): T[] {
  return arr.map(serializeDecimal);
}