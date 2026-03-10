import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/auth/login?error=kakao_no_code`);
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET ?? "";
    const redirectUri = `${siteUrl}/api/auth/kakao/callback`;

    // 1. Exchange code for access token
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        ...(clientSecret ? { client_secret: clientSecret } : {}),
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) throw new Error("No access token from Kakao");

    // 2. Get user profile
    const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileData = await profileRes.json();
    const kakaoAccount = profileData.kakao_account;
    const email = kakaoAccount?.email;
    const name =
      kakaoAccount?.profile?.nickname ||
      profileData.properties?.nickname ||
      "Kakao User";

    if (!email) {
      // Kakao doesn't always provide email — use kakao id as unique identifier
      throw new Error("No email from Kakao profile. Enable email scope in Kakao Developer Console.");
    }

    // 3. Create or find Supabase user
    const supabase = createSupabaseServiceClient();
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (!existingUser) {
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, provider: "kakao", kakao_id: String(profileData.id) },
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
    console.error("[Kakao OAuth callback error]", e);
    return NextResponse.redirect(`${siteUrl}/auth/login?error=kakao_failed`);
  }
}
