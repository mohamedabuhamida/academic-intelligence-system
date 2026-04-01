// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { defaultLocale, isSupportedLocale, localeCookieName } from '@/lib/i18n/config'
import { localizePath } from '@/lib/i18n/routing'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(localeCookieName)?.value
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : defaultLocale

  const response = NextResponse.redirect(new URL(localizePath('/dashboard', locale), request.url))
  response.cookies.set({
    name: localeCookieName,
    value: locale,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
