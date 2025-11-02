// middleware.js

import { NextResponse } from 'next/server';

const MAINTENANCE_MODE = true;

export function middleware(request) {
  if (
    MAINTENANCE_MODE && 
    !request.nextUrl.pathname.startsWith('/maintenance') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};