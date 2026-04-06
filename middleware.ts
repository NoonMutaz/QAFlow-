import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register","/","/contact","/aboutUs"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isPublic = PUBLIC_ROUTES.includes(request.nextUrl.pathname);

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL("/my-projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};