import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/', // Landing page (public)
  '/sign-in(.*)', // Clerk sign-in pages
  '/sign-up(.*)', // Clerk sign-up pages
  '/results(.*)', // Public competition results
  '/api/webhooks/clerk' // Clerk webhooks
]);

const isSignInOrSignUpRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;

  console.log(`Middleware: ${url.pathname}, userId: ${userId ? 'present' : 'none'}`);

  // User is authenticated
  if (userId) {
    // Redirect authenticated users away from auth pages
    if (isSignInOrSignUpRoute(req)) {
      console.log('Redirecting authenticated user from auth page to dashboard');
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Redirect authenticated users from landing page to dashboard
    if (url.pathname === '/') {
      console.log('Redirecting authenticated user from landing page to dashboard');
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Allow authenticated users to access all other routes
    return NextResponse.next();
  }

  // User is NOT authenticated
  if (!userId) {
    // Redirect unauthenticated users from protected routes to sign-in
    if (!isPublicRoute(req)) {
      console.log(`Redirecting unauthenticated user from ${url.pathname} to /sign-in`);
      const signInUrl = new URL('/sign-in', req.url);
      // Preserve the intended destination for post-login redirect
      if (url.pathname !== '/') {
        signInUrl.searchParams.set('redirect_url', url.pathname + url.search);
      }
      return NextResponse.redirect(signInUrl);
    }

    // Allow unauthenticated users to access public routes
    return NextResponse.next();
  }

  // Default: allow the request to continue
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
