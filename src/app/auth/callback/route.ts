import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (data?.user?.email === 'kalimdon07@gmail.com') {
      return NextResponse.redirect(new URL('/admin', url.origin));
    }
  }

  return NextResponse.redirect(new URL('/dashboard', url.origin));
}
