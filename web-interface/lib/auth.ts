import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Allow overriding DB path via env; default to /app/auth.db (direct file mount)
const DEFAULT_DB_FILE = path.join(process.cwd(), 'auth.db')
const DB_PATH = process.env.DB_PATH || DEFAULT_DB_FILE

interface UserRow {
  id: number
  username: string
  password: string
  created_at: string
}

// Initialize database
export async function initDatabase() {
  const Database = (await import('better-sqlite3')).default
  
  // Ensure parent directory exists
  try {
    const parentDir = path.dirname(DB_PATH)
    fs.mkdirSync(parentDir, { recursive: true })
  } catch (e) {
    // ignore; sqlite open may still surface a clearer error
  }

  const db = new Database(DB_PATH)
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Check if default user exists
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get('crontab') as UserRow | undefined
  
  if (!row) {
    // Create default user
    const hashedPassword = bcrypt.hashSync('crontab123', 10)
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('crontab', hashedPassword)
    console.log('Default user created: crontab / crontab123')
  }
  
  return db
}

export async function authenticateUser(username: string, password: string) {
  const Database = (await import('better-sqlite3')).default
  const db = new Database(DB_PATH)
  
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined
  
  if (!row) {
    db.close()
    return { success: false }
  }

  const isValid = bcrypt.compareSync(password, row.password)
  if (!isValid) {
    db.close()
    return { success: false }
  }

  const token = jwt.sign(
    { userId: row.id, username: row.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  db.close()
  return {
    success: true,
    user: { id: row.id, username: row.username },
    token
  }
}

export async function changePassword(username: string, newPassword: string) {
  const Database = (await import('better-sqlite3')).default
  const db = new Database(DB_PATH)
  
  try {
    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    
    // Update the password in the database
    const stmt = db.prepare('UPDATE users SET password = ? WHERE username = ?')
    const result = stmt.run(hashedPassword, username)
    
    db.close()
    
    if (result.changes === 0) {
      return { success: false, error: 'User not found' }
    }
    
    return { success: true }
  } catch (error) {
    db.close()
    return { success: false, error: 'Database error' }
  }
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { valid: true, user: decoded }
  } catch (error) {
    return { valid: false, user: null }
  }
}
