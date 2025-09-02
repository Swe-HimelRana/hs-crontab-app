import { NextResponse } from 'next/server'
import fs from 'fs'

export async function GET() {
  try {
    console.log('=== TEST API CALLED ===')
    console.log('Current working directory:', process.cwd())
    console.log('__dirname:', __dirname)
    
    // Test file system access
    const testPaths = ['/logs', '/app/logs', '/', '/app']
    const pathTests: Record<string, any> = {}
    
    for (const testPath of testPaths) {
      try {
        const exists = fs.existsSync(testPath)
        const isDir = exists ? fs.statSync(testPath).isDirectory() : false
        pathTests[testPath] = { exists, isDir }
        console.log(`Path ${testPath}: exists=${exists}, isDir=${isDir}`)
      } catch (e: any) {
        pathTests[testPath] = { exists: false, isDir: false, error: e.message }
        console.log(`Path ${testPath}: error=${e.message}`)
      }
    }
    
    // Test reading logs directory
    let logsContent: string[] = []
    try {
      if (fs.existsSync('/logs')) {
        logsContent = fs.readdirSync('/logs')
        console.log('Files in /logs:', logsContent)
      }
    } catch (e: any) {
      console.log('Error reading /logs:', e.message)
    }
    
    return NextResponse.json({ 
      success: true, 
      workingDir: process.cwd(),
      pathTests,
      logsContent
    })
  } catch (error: any) {
    console.error('Test API error:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
