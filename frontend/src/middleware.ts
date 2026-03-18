import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED = ["www", "app", "admin", "api", "localhost"];

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url  = req.nextUrl.clone();

  const hostWithoutPort = host.split(":")[0];
  const parts           = hostWithoutPort.split(".");
  const subdomain       = parts.length > 1 && !RESERVED.includes(parts[0])
    ? parts[0]
    : null;

  if (subdomain) {
    url.pathname = `/store/${subdomain}${url.pathname}`;

    const res = NextResponse.rewrite(url);
    res.headers.set("x-vendor-subdomain", subdomain);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
