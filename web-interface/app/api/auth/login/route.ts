import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, initDatabase } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Initialize database
    await initDatabase()

    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const result = await authenticateUser(username, password)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Login successful'
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
