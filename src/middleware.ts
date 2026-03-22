// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    console.log("MIDDLEWARE TOKEN:", JSON.stringify(token));

    const { pathname } = req.nextUrl;
    const role = token?.role as string | undefined;

    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        console.log("AUTHORIZED CHECK:", pathname, !!token);

        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
