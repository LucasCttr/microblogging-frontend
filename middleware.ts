import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/api/auth", "/_next", "/favicon.ico", "/public"];

export async function middleware(request: import("next/server").NextRequest) {
  const { pathname } = request.nextUrl;
  // Permitir acceso a rutas públicas
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"]
};
