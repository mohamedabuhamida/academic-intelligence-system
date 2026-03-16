// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
  
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

  const { data: { session } } = await supabase.auth.getSession()

  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = pathname === '/login' || req.nextUrl.pathname.startsWith('/auth')
  const isOnboardingRoute = req.nextUrl.pathname.startsWith('/dashboard/onboarding')
  const isVerifyEmailRoute = req.nextUrl.pathname.startsWith('/auth/verify-email')

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  let needsOnboarding = false

  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name,total_required_hours')
      .eq('id', session.user.id)
      .maybeSingle()

    const { count: studentCoursesCount } = await supabase
      .from('student_courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    needsOnboarding = !profile?.full_name || !profile?.total_required_hours || !studentCoursesCount
  }

  if (session && needsOnboarding && isProtectedRoute && !isOnboardingRoute) {
    const redirectUrl = new URL('/dashboard/onboarding', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && !needsOnboarding && isOnboardingRoute) {
    const redirectUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && session && !req.nextUrl.pathname.includes('callback') && !isVerifyEmailRoute) {
    const redirectUrl = new URL(needsOnboarding ? '/dashboard/onboarding' : '/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/login', '/dashboard/:path*', '/auth/:path*']
}
