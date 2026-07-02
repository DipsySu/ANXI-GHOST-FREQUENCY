import { NextRequest, NextResponse } from 'next/server';
import { generateLog } from '@/lib/gemini';

function formatDevError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const modelMatch = message.match(/models\/([^"\s]+) is not found/);

  if (modelMatch) {
    return `DEV · Gemini 模型不可用:${modelMatch[1]}。请重启 dev server 载入新默认模型;如果 .env.local 里显式设置了 GEMINI_TEXT_MODEL,改成 gemini-2.5-flash。`;
  }

  return `DEV · 生成失败:${message}`;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const body = rawBody && typeof rawBody === 'object' ? rawBody as Record<string, unknown> : {};
    const { query } = body;

    if (typeof query !== 'string' || !query.trim() || query.length > 200) {
      return NextResponse.json({ error: 'Query must be a non-empty string (max 200 chars)' }, { status: 400 });
    }

    const isDev = process.env.NODE_ENV !== 'production';

    // Fail fast on the most common misconfig: no credentials at all. Production keeps the
    // poetic client copy; development gets a concrete config hint (or use ?demo=1 offline).
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.BASE_URL) {
      return NextResponse.json(
        {
          error: 'Failed to generate log',
          ...(isDev && { dev: 'DEV · 缺少 Gemini 凭据:未设置 GEMINI_API_KEY / GOOGLE_API_KEY(或 BASE_URL 代理)。在 .env.local 配置后重启 dev server;或在地址栏加 ?demo=1 离线预览残片。' }),
        },
        { status: 503 },
      );
    }

    // Generate log content
    const logData = await generateLog(query.trim());

    return NextResponse.json({
      ...logData,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate log',
        ...(process.env.NODE_ENV !== 'production' && { dev: formatDevError(error) }),
      },
      { status: 500 },
    );
  }
}
