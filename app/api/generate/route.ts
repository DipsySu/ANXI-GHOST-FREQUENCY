import { NextRequest, NextResponse } from 'next/server';
import { generateLog, generateImage } from '@/lib/gemini';

const ENABLE_IMAGE_GENERATION = process.env.ENABLE_IMAGE_GENERATION === 'true';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Generate log content
    const logData = await generateLog(query);

    // Debug: log the image prompt
    console.log('=== IMAGE PROMPT ===');
    console.log(logData.imagePrompt);
    console.log('====================');
    console.log(`Image generation: ${ENABLE_IMAGE_GENERATION ? 'ENABLED' : 'DISABLED'}`);

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
