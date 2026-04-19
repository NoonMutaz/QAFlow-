import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/contactus", "/aboutUs"];
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublic = PUBLIC_ROUTES.includes(path);
  const isAuthPage = AUTH_ROUTES.includes(path);

  // Allow public pages
  if (isPublic) {
    return NextResponse.next();
  }

  // Read token from Authorization header OR cookie fallback
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("token")?.value;

  // Redirect logged-in users away from auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/my-projects", request.url));
  }

  // Block protected routes if no token
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};