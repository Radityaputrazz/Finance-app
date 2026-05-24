import { NextRequest } from "next/server";
import { PAGINATION } from "@/config/app";

export function getSearchParams(req: NextRequest): URLSearchParams {
  return new URL(req.url).searchParams;
}

export function parsePagination(params: URLSearchParams) {
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const limit = Math.min(
    PAGINATION.maxLimit,
    Math.max(1, Number(params.get("limit") ?? PAGINATION.defaultLimit))
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function parseOptionalString(
  params: URLSearchParams,
  key: string
): string | undefined {
  return params.get(key) ?? undefined;
}

export function parseOptionalDate(
  params: URLSearchParams,
  key: string
): Date | undefined {
  const val = params.get(key);
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}