import { NextResponse } from "next/server";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorizedResponse() {
  return errorResponse("Unauthorized", 401);
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse(`${resource} tidak ditemukan`, 404);
}

export function serverErrorResponse(error?: unknown) {
  console.error("[API Error]", error);
  return errorResponse("Terjadi kesalahan server", 500);
}