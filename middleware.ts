import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALWAYS_PUBLIC = ["/", "/contact", "/aboutUs"];
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const isAlwaysPublic = ALWAYS_PUBLIC.includes(path);
  const isAuthRoute = AUTH_ROUTES.includes(path);

  //   Allow always public routes for everyone
  if (isAlwaysPublic) {
    return NextResponse.next();
  }

  //   Block logged-in users from login/register
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/my-projects", request.url));
  }

  //   Protect private routes
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};