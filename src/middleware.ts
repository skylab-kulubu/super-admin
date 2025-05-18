import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import type { DecodedToken } from "@/types";

const TEAM_PATHS: Record<string, string> = {
  ROLE_BIZBIZE_ADMIN: "/bizbize",
  ROLE_GECEKODU_ADMIN: "/gecekodu",
  ROLE_AGC_ADMIN: "/agc",
};
const ALL_TEAM_PATHS = Object.values(TEAM_PATHS);
const ADMIN_ROLE = "ROLE_ADMIN";
const SUPERADMIN_PATH = "/superadmin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  const isAuthPage = pathname === "/login";

  if (!token) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists
  let decodedToken: DecodedToken;
  try {
    decodedToken = jwtDecode<DecodedToken>(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      // Token expired
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  } catch (error) {
    // Invalid token
    console.error("Invalid token in middleware:", error);
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("token");
    return response;
  }

  // User is authenticated
  const userRoles = decodedToken.roles || [];
  const isSuperAdmin = userRoles.includes(ADMIN_ROLE);

  if (isAuthPage) {
    // If user is authenticated and tries to access login page, redirect them
    let redirectPath = "/"; // Default dashboard or home
    if (isSuperAdmin) {
      redirectPath = SUPERADMIN_PATH; // Super admin goes to superadmin dashboard
    } else {
      for (const role of userRoles) {
        if (TEAM_PATHS[role]) {
          redirectPath = TEAM_PATHS[role];
          break;
        }
      }
    }
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Role-based access for team sections
  const isAccessingTeamPath = ALL_TEAM_PATHS.some(teamPath => pathname.startsWith(teamPath));

  if (isAccessingTeamPath && !isSuperAdmin) {
    const canAccessCurrentPath = userRoles.some(role => {
        const allowedPath = TEAM_PATHS[role];
        return allowedPath && pathname.startsWith(allowedPath);
    });

    if (!canAccessCurrentPath) {
      let userTeamPath = "/"; 
      for (const role of userRoles) {
        if (TEAM_PATHS[role]) {
          userTeamPath = TEAM_PATHS[role];
          break;
        }
      }
      // If user has no specific team path but tries to access one, or tries to access a path they don't own
      if (pathname !== userTeamPath || (userTeamPath === "/" && isAccessingTeamPath)) {
         return NextResponse.redirect(new URL("/403", request.url));
      }
    }
  }
  
  // If user is authenticated and trying to access root path, redirect appropriately
  if (pathname === "/") {
    if (isSuperAdmin) {
      return NextResponse.redirect(new URL(SUPERADMIN_PATH, request.url));
    }
    for (const role of userRoles) {
      if (TEAM_PATHS[role]) {
        return NextResponse.redirect(new URL(TEAM_PATHS[role], request.url));
      }
    }
    // If not super admin and no specific team path, they can stay on "/" 
    // which will be handled by src/app/(dashboard)/page.tsx
  }
  
  // Prevent non-superadmin from accessing /superadmin directly
  if (pathname === SUPERADMIN_PATH && !isSuperAdmin) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

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
     * - images (public/images folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
