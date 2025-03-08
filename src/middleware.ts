import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define the paths that require authentication
const protectedPaths = [
  "/dashboard",
  "/bmi-calculator",
  "/diet-planner",
  "/fitness-tracker",
];

// Define the paths that should be accessible only for non-authenticated users
const authPaths = [
  "/auth/login",
  "/auth/register",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Check if the path is auth path (login/register)
  const isAuthPath = authPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Get the token and verify the user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  const isAuthenticated = !!token;
  
  // Redirect to login if accessing protected path without authentication
  if (isProtectedPath && !isAuthenticated) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect to dashboard if accessing auth paths while authenticated
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/bmi-calculator/:path*',
    '/diet-planner/:path*',
    '/fitness-tracker/:path*',
    '/auth/login',
    '/auth/register',
  ],
}; 