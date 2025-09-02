import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const CRONTAB_FILE = '/etc/cron.d/crontab.txt'

interface CrontabEntry {
  id: string
  schedule: string
  command: string
  comment?: string
  name?: string
}

function parseCrontab(content: string): CrontabEntry[] {
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))
  return lines.map((line, index) => {
    const parts = line.trim().split(/\s+/, 6)
    if (parts.length >= 6) {
      const schedule = parts.slice(0, 5).join(' ')
      const command = parts[5]
      return {
        id: index.toString(),
        schedule,
        command
      }
    }
    return {
      id: index.toString(),
      schedule: '',
      command: line.trim()
    }
  })
}

function sanitizeFilename(name: string): string {
  const trimmed = name.trim().toLowerCase()
  const cleaned = trimmed.replace(/[^a-z0-9._-]+/g, '-')
  return cleaned.replace(/^-+|-+$/g, '') || 'job'
}

function formatCrontab(entries: CrontabEntry[]): string {
  const header = [
    'SHELL=/bin/sh',
    'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
  ].join('\n')

  const body = entries.map(entry => {
    const nameSafe = entry.name ? sanitizeFilename(entry.name) : undefined
    const redirection = nameSafe ? ` >> /app/logs/${nameSafe}.log 2>&1` : ''
    let line = entry.schedule + ' ' + entry.command + redirection
    if (entry.comment) {
      line = '# ' + entry.comment + '\n' + line
    }
    return line
  }).join('\n')

  return header + '\n' + body + '\n'
}

export async function GET() {
  try {
    const content = await fs.readFile(CRONTAB_FILE, 'utf-8')
    const entries = parseCrontab(content)
    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error reading crontab file:', error)
    return NextResponse.json({ entries: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entries } = body

    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid entries format' }, { status: 400 })
    }

    const content = formatCrontab(entries)
    await fs.writeFile(CRONTAB_FILE, content, 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error writing crontab file:', error)
    return NextResponse.json({ error: 'Failed to save crontab' }, { status: 500 })
  }
}
