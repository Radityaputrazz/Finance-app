import type { ActionResult } from "@/lib/db/types";

export function isActionError(
  result: ActionResult
): result is { success: false; error: string } {
  return !result.success;
}

export function getActionError(result: ActionResult): string | null {
  return result.success ? null : result.error;
}