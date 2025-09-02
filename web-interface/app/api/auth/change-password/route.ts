import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token
    const result = verifyToken(token)
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 })
    }

    // Import the auth functions dynamically
    const { authenticateUser, changePassword } = await import('../../../../lib/auth')

    // Verify current password
    const authResult = await authenticateUser(result.user.username, currentPassword)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Change the password
    const changeResult = await changePassword(result.user.username, newPassword)
    if (!changeResult.success) {
      return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully' 
    })

  } catch (error: any) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
