// Proxy — refresca la sesión de Supabase en cada request y protege /app y /admin en el
// SERVIDOR (reemplaza el guard de cliente de app/app/layout.tsx, que cualquiera podía esquivar
// viendo el bundle — ver ESTADO.md "Problemas conocidos"). 09-SEGURIDAD.md / 26-AUTH-MODERNO.md.
// Renombrado de middleware.ts a proxy.ts (Next 16: "middleware" queda deprecado).
//
// /admin exige además que el correo de la sesión esté en ADMIN_EMAILS (variable SOLO de
// servidor, nunca NEXT_PUBLIC_) — ocultar la ruta en el cliente NO alcanza (eso es IDOR); la
// verificación real vive aquí y se repite en app/admin/layout.tsx (defensa en profundidad).

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function esCorreoAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && (request.nextUrl.pathname.startsWith('/app') || request.nextUrl.pathname.startsWith('/admin'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname.startsWith('/admin') && !esCorreoAdmin(user?.email)) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*'],
};
