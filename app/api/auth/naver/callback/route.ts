import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/auth/login?error=naver_no_code`);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        code,
        state: searchParams.get("state") ?? "",
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) throw new Error("No access token from Naver");

    // 2. Get user profile
    const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileData = await profileRes.json();
    const naverUser = profileData.response;
    const email = naverUser?.email;
    const name = naverUser?.name || naverUser?.nickname || "Naver User";

    if (!email) throw new Error("No email from Naver profile");

    // 3. Create or find Supabase user
    const supabase = createSupabaseServiceClient();
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (!existingUser) {
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, provider: "naver", naver_id: naverUser.id },
      });
    }

    // 4. Generate magic link to establish browser session
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${siteUrl}/` },
    });

    const actionLink = linkData?.properties?.action_link;
    if (!actionLink) throw new Error("Failed to generate magic link");

    return NextResponse.redirect(actionLink);
  } catch (e: unknown) {
    console.error("[Naver OAuth callback error]", e);
    return NextResponse.redirect(`${siteUrl}/auth/login?error=naver_failed`);
  }
}
