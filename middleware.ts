import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];
const AUTH_ROUTES = ["/login", "/register"];
const API_AUTH_ROUTES = ["/api/auth"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Skip rate limiting for static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/public")) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users away from protected routes
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  if (!isLoggedIn && !isPublic && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};