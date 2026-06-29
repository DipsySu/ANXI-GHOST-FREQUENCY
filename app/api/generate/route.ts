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
    return NextResponse.json(
      { error: 'Failed to generate log' },
      { status: 500 }
    );
  }
}
