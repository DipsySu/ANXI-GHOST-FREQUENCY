import { NextRequest, NextResponse } from 'next/server';
import { generateLog, generateImage } from '@/lib/gemini';

const ENABLE_IMAGE_GENERATION = process.env.ENABLE_IMAGE_GENERATION === 'true';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query } = body;

    if (typeof query !== 'string' || !query.trim() || query.length > 200) {
      return NextResponse.json({ error: 'Query must be a non-empty string (max 200 chars)' }, { status: 400 });
    }

    const isDev = process.env.NODE_ENV !== 'production';

    // Fail fast on the most common misconfig: no credentials at all. Production keeps the
    // poetic client copy; development gets a concrete config hint (or use ?demo=1 offline).
    if (!process.env.GEMINI_API_KEY && !process.env.BASE_URL) {
      return NextResponse.json(
        {
          error: 'Failed to generate log',
          ...(isDev && { dev: 'DEV · 缺少 Gemini 凭据:未设置 GEMINI_API_KEY(或 BASE_URL 代理)。在 .env.local 配置后重启 dev server;或在地址栏加 ?demo=1 离线预览残片。' }),
        },
        { status: 503 },
      );
    }

    // Generate log content
    const logData = await generateLog(query.trim());

    if (process.env.NODE_ENV !== 'production') {
      console.log('[generate] image prompt:', logData.imagePrompt, '| imageGen:', ENABLE_IMAGE_GENERATION ? 'on' : 'off');
    }

    // Generate image URL only if enabled via env var
    let imageUrl = '';
    if (ENABLE_IMAGE_GENERATION) {
      imageUrl = await generateImage(logData.imagePrompt);
    }

    return NextResponse.json({
      ...logData,
      imageUrl,
    });
  } catch (error) {
    console.error('Generate error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to generate log',
        ...(process.env.NODE_ENV !== 'production' && { dev: `DEV · 生成失败:${msg}` }),
      },
      { status: 500 },
    );
  }
}
