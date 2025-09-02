'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Trash2, RefreshCw, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface LogFile {
  name: string
  size: number
  lastModified: string
}

export default function LogViewer() {
  const [logFiles, setLogFiles] = useState<LogFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [logContent, setLogContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadLogFiles()
  }, [])

  const loadLogFiles = async () => {
    try {
      console.log('🔄 Refreshing log files from Python server...')
      setIsRefreshing(true)
      
      // Use relative URL since both services are in the same container
      const response = await fetch('/api/logs')
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText)
        return
      }
      
      const data = await response.json()
      console.log('✅ Log files data from Python server:', data)
      setLogFiles(data.files || [])
      console.log(`✅ Loaded ${data.files?.length || 0} log files`)
    } catch (error) {
      console.error('❌ Failed to load log files from Python server:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadLogContent = async (filename: string) => {
    setIsLoading(true)
    try {
      // Use relative URL since both services are in the same container
      const response = await fetch(`/api/logs/${encodeURIComponent(filename)}`)
      const data = await response.json()
      setLogContent(data.content || '')
      setSelectedFile(filename)
    } catch (error) {
      console.error('Failed to load log content from Python server:', error)
      setLogContent('Error loading log file')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteLogFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return

    try {
      // Use relative URL since both services are in the same container
      const response = await fetch(`/api/logs/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await loadLogFiles()
        if (selectedFile === filename) {
          setSelectedFile(null)
          setLogContent('')
        }
      }
    } catch (error) {
      console.error('Failed to delete log file from Python server:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Log Files</span>
              </CardTitle>
              <CardDescription>
                View and manage system log files
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={loadLogFiles}
              disabled={isRefreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Log Files List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Logs ({logFiles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {logFiles.map((file) => (
                      <Card
                        key={file.name}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedFile === file.name ? 'bg-primary/10 border-primary' : ''
                        }`}
                        onClick={() => loadLogContent(file.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                                <span>{formatFileSize(file.size)}</span>
                                <span>{format(new Date(file.lastModified), 'MMM dd, yyyy HH:mm')}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  loadLogContent(file.name)
                                }}
                                title="View log"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteLogFile(file.name)
                                }}
                                title="Delete log"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {logFiles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No log files found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Log Content Viewer */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedFile ? `Log: ${selectedFile}` : 'Select a log file to view'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : selectedFile ? (
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{logContent}</pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Select a log file from the list to view its contents</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
