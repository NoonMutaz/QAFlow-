import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/contactus", "/aboutUs"];
const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = ["/my-projects", "/account"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  //   No token => redirect auth pages to login
  if (!token && PROTECTED_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  //   Has token  => redirect auth pages to dashboard
  if (token && AUTH_ROUTES.includes(path)) {
    return NextResponse.redirect(new URL("/my-projects", request.url));
  }

  //   Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};