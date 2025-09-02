import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Play, X } from 'lucide-react'

export default function TestCommand() {
  const [command, setCommand] = useState('echo hello from cron-test')
  const [timeoutMs, setTimeoutMs] = useState(15000)
  const [running, setRunning] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [result, setResult] = useState<{ code: number | null; stdout: string; stderr: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onRun() {
    setRunning(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/test-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, timeoutMs }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to run command')
      } else {
        setResult({ code: data.code, stdout: data.stdout || '', stderr: data.stderr || '' })
      }
    } catch (e: any) {
      setError(e?.message || 'Request failed')
    } finally {
      setRunning(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setCommand('echo hello from cron-test')
    setTimeoutMs(15000)
    setResult(null)
    setError(null)
  }

  return (
    <>
      {/* Test Command Button */}
      {!showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Button
              onClick={() => setShowForm(true)}
              className="h-10"
            >
              <Play className="h-4 w-4 mr-2" />
              Test a Command
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Command Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test a Command</CardTitle>
            <CardDescription>Try a command and preview its output before adding to crontab.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="e.g., curl -s https://example.com"
                />
                <Button onClick={onRun} disabled={running || !command.trim()}>
                  {running ? 'Running…' : 'Run'}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="h-10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Timeout (ms):</span>
                <Input
                  type="number"
                  className="w-32"
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(parseInt(e.target.value || '0', 10))}
                  min={1000}
                  max={60000}
                  step={1000}
                />
              </div>
              {error && (
                <pre className="bg-red-950/30 text-red-200 p-3 rounded whitespace-pre-wrap break-words overflow-auto">
                  {error}
                </pre>
              )}
              {result && (
                <div className="space-y-2">
                  <div className="text-sm">Exit code: {result.code}</div>
                  {result.stdout && (
                    <div>
                      <div className="text-sm font-medium mb-1">Stdout</div>
                      <pre className="bg-muted p-3 rounded whitespace-pre-wrap break-words overflow-auto">{result.stdout}</pre>
                    </div>
                  )}
                  {result.stderr && (
                    <div>
                      <div className="text-sm font-medium mb-1">Stderr</div>
                      <pre className="bg-muted p-3 rounded whitespace-pre-wrap break-words overflow-auto">{result.stderr}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
