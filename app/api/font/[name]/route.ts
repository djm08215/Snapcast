import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const allowed = ["NanumGothic-Regular.ttf", "NanumGothic-Bold.ttf"];
  const { name } = params;

  if (!allowed.includes(name)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "fonts", name);
  const data = await readFile(filePath);

  return new Response(data, {
    headers: {
      "Content-Type": "font/truetype",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
