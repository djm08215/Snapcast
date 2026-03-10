import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Skip dynamic rendering in Toss static export
export const dynamic = process.env.TOSS_BUILD === "1" ? "error" : "force-dynamic";

export async function GET(request: Request) {
  if (process.env.TOSS_BUILD === "1") {
    return NextResponse.redirect("https://snapcast.kr/");
  }
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/`);
}
