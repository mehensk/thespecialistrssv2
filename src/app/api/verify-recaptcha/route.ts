import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route to verify reCAPTCHA token server-side
 * POST /api/verify-recaptcha
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA token is required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify token with Google's API
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (data.success) {
      // Check score (v3 returns a score from 0.0 to 1.0)
      // 1.0 is very likely a good interaction, 0.0 is very likely a bot
      // Typically, scores above 0.5 are considered legitimate
      const score = data.score || 0;
      const threshold = 0.5;

      if (score >= threshold) {
        return NextResponse.json({
          success: true,
          score: score,
          message: 'reCAPTCHA verification successful',
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            score: score,
            error: 'reCAPTCHA score too low. Please try again.',
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'reCAPTCHA verification failed',
          'error-codes': data['error-codes'] || [],
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

