import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `당신은 팟캐스트 및 정보성 유튜브 영상 전문 요약가입니다.
주어진 트랜스크립트를 분석하여 반드시 아래의 정확한 JSON 형식으로만 응답하세요.
다른 텍스트, 설명, 마크다운 코드블록 없이 순수 JSON만 출력하세요.

{
  "videoTitle": "영상 제목 추측 (짧게)",
  "overallSummary": "전체 내용을 3~5문장으로 한국어 요약",
  "timeline": [
    {
      "timestamp": "mm:ss 또는 h:mm:ss 형식",
      "offsetSeconds": 숫자,
      "title": "해당 구간 주제 제목",
      "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"]
    }
  ]
}

규칙:
- timeline 항목은 3~5분 간격으로 생성
- 각 keyPoints는 2~4개
- 모든 텍스트는 한국어로 작성
- timestamp는 트랜스크립트의 실제 시간 표시 기준`;

import { corsHeaders, handleOptions } from "@/lib/cors";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server";
import { checkUsageLimit, FREE_LIMIT } from "@/lib/usage";

export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  // 사용량 제한 체크 (로그인한 유저만)
  let userId: string | null = null;
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { allowed, count, plan } = await checkUsageLimit(supabase, user.id);
      if (!allowed) {
        return Response.json(
          {
            error: `이번 달 무료 요약 횟수(${FREE_LIMIT}회)를 모두 사용하셨습니다. Pro로 업그레이드하면 무제한으로 이용할 수 있습니다.`,
            code: "USAGE_LIMIT_EXCEEDED",
            count,
            plan,
          },
          { status: 429 }
        );
      }
      userId = user.id;
    }
  } catch {
    // 인증 서버 오류 시 그냥 통과 (비로그인 허용)
  }

  const body = await req.json();
  console.log("summarize body keys:", Object.keys(body));
  console.log("transcriptText length:", body.transcriptText?.length ?? "undefined");
  const { transcriptText } = body;
  if (!transcriptText) {
    return Response.json({ error: "트랜스크립트가 없습니다." }, { status: 400 });
  }

  let stream;
  try {
    stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `다음 트랜스크립트를 요약해주세요:\n\n${transcriptText}`,
        },
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Claude API 오류";
    console.error("Anthropic stream error:", err);
    return Response.json({ error: message }, { status: 500 });
  }

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
              )
            );
          }
        }
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();

        // 사용량 증가 (비동기, 실패해도 무시)
        if (userId) {
          const month = new Date().toISOString().slice(0, 7);
          void createSupabaseServiceClient()
            .rpc("increment_usage", { p_user_id: userId, p_month: month })
            .then(() => {});
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "스트리밍 오류";
        console.error("Streaming error:", err);
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ error: message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...corsHeaders(origin),
    },
  });
}
