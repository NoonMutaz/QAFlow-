import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// const PUBLIC_ROUTES = ["/", "/contactus", "/aboutUs"];
// const AUTH_ROUTES = ["/login", "/register"];
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const token = request.cookies.get("token")?.value;

  const isAuthPage = ["/login", "/register"].includes(path);

  if (!token && path.startsWith("/my-projects") || path.startsWith("/account")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/my-projects", request.url));
  }

  return NextResponse.next();
}