// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, localeCookieName } from '@/lib/i18n/config'
import { localizePath, resolveLocale, stripLocalePrefix } from '@/lib/i18n/routing'

function withLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set({
    name: localeCookieName,
    value: locale,
    path: '/',
    sameSite: 'lax',
  })

  return response
}

export async function middleware(req: NextRequest) {
  const locale = resolveLocale(req.nextUrl.pathname, defaultLocale)
  const pathname = stripLocalePrefix(req.nextUrl.pathname)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-aether-locale', locale)

  const internalUrl = req.nextUrl.clone()
  internalUrl.pathname = pathname

  const res =
    pathname !== req.nextUrl.pathname
      ? withLocaleCookie(
          NextResponse.rewrite(internalUrl, {
            request: {
              headers: requestHeaders,
            },
          }),
          locale,
        )
      : withLocaleCookie(
          NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          }),
          locale,
        )
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const sessionUser = userError ? null : user

  const isProtectedRoute = pathname.startsWith('/dashboard')
  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth')
  const isOnboardingRoute = pathname.startsWith('/dashboard/onboarding')
  const isVerifyEmailRoute = pathname.startsWith('/auth/verify-email')

  const createRedirect = (targetPath: string) => {
    const redirectUrl = new URL(localizePath(targetPath, locale), req.url)
    return withLocaleCookie(NextResponse.redirect(redirectUrl), locale)
  }

  if (isProtectedRoute && !sessionUser) {
    return createRedirect('/login')
  }

  let needsOnboarding = false

  if (sessionUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name,total_required_hours')
      .eq('id', sessionUser.id)
      .maybeSingle()

    const { count: studentCoursesCount } = await supabase
      .from('student_courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', sessionUser.id)

    needsOnboarding = !profile?.full_name || !profile?.total_required_hours || !studentCoursesCount
  }

  if (sessionUser && needsOnboarding && isProtectedRoute && !isOnboardingRoute) {
    return createRedirect('/dashboard/onboarding')
  }

  if (sessionUser && !needsOnboarding && isOnboardingRoute) {
    return createRedirect('/dashboard')
  }

  if (isAuthRoute && sessionUser && !pathname.includes('callback') && !isVerifyEmailRoute) {
    return createRedirect(needsOnboarding ? '/dashboard/onboarding' : '/dashboard')
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/auth/:path*',
    '/:locale(en|ar)',
    '/:locale(en|ar)/login',
    '/:locale(en|ar)/signup',
    '/:locale(en|ar)/dashboard/:path*',
    '/:locale(en|ar)/auth/:path*',
  ]
}
