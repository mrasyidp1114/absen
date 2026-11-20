import { NextRequest, NextResponse } from "next/server";

const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "admin",
  "/guru": "guru",
  "/siswa": "siswa",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPrefix = Object.keys(ROLE_PREFIXES).find((p) => pathname.startsWith(p));

  if (!protectedPrefix) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  if (!token || !role) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (role !== ROLE_PREFIXES[protectedPrefix]) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/guru/:path*", "/siswa/:path*"],
};
