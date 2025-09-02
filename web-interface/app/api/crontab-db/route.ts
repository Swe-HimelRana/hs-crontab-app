import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'auth.db', 'auth.sqlite')

interface CrontabEntry {
  id?: number
  name: string
  schedule: string
  command: string
  description?: string
  isActive: boolean
  createdAt: string
  lastRun?: string
  nextRun?: string
}

// Initialize database with crontab table
async function initCrontabDatabase() {
  const Database = (await import('better-sqlite3')).default
  const db = new Database(DB_PATH)
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS crontab_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      schedule TEXT NOT NULL,
      command TEXT NOT NULL,
      description TEXT,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastRun DATETIME,
      nextRun DATETIME
    )
  `)
  
  console.log('Crontab database initialized')
  return db
}

// Generate crontab.txt content from database entries
async function generateCrontabFile(): Promise<string> {
  const Database = (await import('better-sqlite3')).default
  const db = new Database(DB_PATH)
  
  const rows = db.prepare('SELECT * FROM crontab_entries WHERE isActive = 1 ORDER BY createdAt').all()
  
  let crontabContent = 'SHELL=/bin/sh\n'
  crontabContent += 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n\n'

  rows.forEach((row: any) => {
    if (row.description) {
      crontabContent += `# ${row.description}\n`
    }
    crontabContent += `${row.schedule} ${row.command} >> /app/logs/${row.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.log 2>&1\n\n`
  })

  db.close()
  return crontabContent
}

// Write crontab content to file
async function writeCrontabFile(content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile('/etc/cron.d/crontab.txt', content, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export async function GET() {
  try {
    const db = await initCrontabDatabase()
    
    const rows = db.prepare('SELECT * FROM crontab_entries ORDER BY createdAt DESC').all()
    
    db.close()
    return NextResponse.json({ entries: rows })
  } catch (error: any) {
    console.error('Error getting crontab entries:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await initCrontabDatabase()
    
    const { name, schedule, command, description } = await request.json()
    
    if (!name || !schedule || !command) {
      db.close()
      return NextResponse.json(
        { error: 'Name, schedule, and command are required' },
        { status: 400 }
      )
    }

    try {
      const stmt = db.prepare('INSERT INTO crontab_entries (name, schedule, command, description) VALUES (?, ?, ?, ?)')
      const result = stmt.run(name, schedule, command, description || '')
      
      // Generate and write new crontab file
      try {
        const content = await generateCrontabFile()
        await writeCrontabFile(content)
        
        db.close()
        return NextResponse.json({ 
          success: true, 
          message: 'Crontab entry created successfully',
          id: result.lastInsertRowid 
        })
      } catch (writeErr) {
        console.error('Error writing crontab file:', writeErr)
        db.close()
        return NextResponse.json({ 
          success: true, 
          message: 'Entry created but crontab file update failed',
          id: result.lastInsertRowid 
        })
      }
    } catch (err: any) {
      db.close()
      if (err.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { error: 'A crontab entry with this name already exists' },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        )
      }
    }
  } catch (error: any) {
    console.error('Error creating crontab entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await initCrontabDatabase()
    
    const { id, name, schedule, command, description, isActive } = await request.json()
    
    if (!id) {
      db.close()
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const stmt = db.prepare('UPDATE crontab_entries SET name = ?, schedule = ?, command = ?, description = ?, isActive = ? WHERE id = ?')
    const result = stmt.run(name, schedule, command, description || '', isActive ? 1 : 0, id)
    
    if (result.changes === 0) {
      db.close()
      return NextResponse.json(
        { error: 'Crontab entry not found' },
        { status: 404 }
      )
    }
    
    // Regenerate crontab file
    try {
      const content = await generateCrontabFile()
      await writeCrontabFile(content)
      
      db.close()
      return NextResponse.json({ 
        success: true, 
        message: 'Crontab entry updated successfully' 
      })
    } catch (writeErr) {
      console.error('Error writing crontab file:', writeErr)
      db.close()
      return NextResponse.json({ 
        success: true, 
        message: 'Entry updated but crontab file update failed' 
      })
    }
  } catch (error: any) {
    console.error('Error updating crontab entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await initCrontabDatabase()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      db.close()
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const stmt = db.prepare('DELETE FROM crontab_entries WHERE id = ?')
    const result = stmt.run(id)
    
    if (result.changes === 0) {
      db.close()
      return NextResponse.json(
        { error: 'Crontab entry not found' },
        { status: 404 }
      )
    }
    
    // Regenerate crontab file
    try {
      const content = await generateCrontabFile()
      await writeCrontabFile(content)
      
      db.close()
      return NextResponse.json({ 
        success: true, 
        message: 'Crontab entry deleted successfully' 
      })
    } catch (writeErr) {
      console.error('Error writing crontab file:', writeErr)
      db.close()
      return NextResponse.json({ 
        success: true, 
        message: 'Entry deleted but crontab file update failed' 
      })
    }
  } catch (error: any) {
    console.error('Error deleting crontab entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
