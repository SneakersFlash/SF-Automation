import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_COOKIE } from './lib/api';

// Guard rute (IA §5, UF-01). Cek keberadaan token; validitas token asli
// diverifikasi backend tiap request (401 → AuthProvider mengeluarkan sesi).
export function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname } = req.nextUrl;
  const isLogin = pathname === '/login';

  // Belum login & bukan halaman publik → ke /login.
  if (!token && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Sudah login tapi buka /login → ke halaman kerja utama.
  if (token && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/content/carousel';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Jalankan di semua rute kecuali aset internal & file statis.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
