import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, initDatabase } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initDatabase()
    
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const result = verifyToken(token)

    if (!result.valid) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: result.user
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
