import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'

function runCommand(command: string, timeoutMs: number): Promise<{ stdout: string; stderr: string; code: number | null }>{
  return new Promise((resolve) => {
    const child = exec(command, {
      shell: '/bin/sh',
      timeout: timeoutMs,
      env: { ...process.env },
      maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
      // error may be set for non-zero exit; capture code safely
      // @ts-ignore
      const code = (error && typeof error.code === 'number') ? error.code : 0
      resolve({ stdout, stderr, code })
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const command = typeof body?.command === 'string' ? body.command.trim() : ''
    const timeoutMs = Math.min(Math.max(Number(body?.timeoutMs) || 15000, 1000), 60000)

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 })
    }

    const { stdout, stderr, code } = await runCommand(command, timeoutMs)

    return NextResponse.json({ success: true, code, stdout, stderr })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to run command' }, { status: 500 })
  }
}


