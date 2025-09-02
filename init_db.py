#!/usr/bin/env python3
"""
Initialize the SQLite database with proper structure and default user
"""

import sqlite3
import os
import bcrypt

# Database file path
DB_PATH = 'auth.db'

def init_database():
    # Connect to database (will create if doesn't exist)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check if default user exists
    cursor.execute('SELECT * FROM users WHERE username = ?', ('crontab',))
    user = cursor.fetchone()
    
    if not user:
        # Create default user with hashed password
        password = 'crontab123'
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute('''
            INSERT INTO users (username, password) VALUES (?, ?)
        ''', ('crontab', hashed_password.decode('utf-8')))
        
        print(f"Default user created: crontab / {password}")
    else:
        print("Default user already exists")
    
    # Commit changes and close
    conn.commit()
    conn.close()
    
    print(f"Database initialized successfully: {DB_PATH}")

if __name__ == '__main__':
    try:
        init_database()
    except Exception as e:
        print(f"Error initializing database: {e}")
        print("Make sure you have bcrypt installed: pip install bcrypt")
