'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit, Save, X } from 'lucide-react'

interface CrontabEntry {
  id: number
  name: string
  schedule: string
  command: string
  description?: string
  isActive: boolean
  createdAt: string
  lastRun?: string
  nextRun?: string
}

export default function CrontabManager() {
  const [entries, setEntries] = useState<CrontabEntry[]>([])
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    name: '',
    schedule: '',
    command: '',
    description: ''
  })

  useEffect(() => {
    loadCrontab()
  }, [])

  const loadCrontab = async () => {
    try {
      const response = await fetch('/api/crontab-db')
      const data = await response.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Failed to load crontab:', error)
    }
  }

  const addEntry = async () => {
    if (!newEntry.name || !newEntry.schedule || !newEntry.command) return

    try {
      const response = await fetch('/api/crontab-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      })
      
      if (response.ok) {
        await loadCrontab()
        setNewEntry({ name: '', schedule: '', command: '', description: '' })
        setShowAddForm(false) // Hide form after successful addition
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to add crontab entry:', error)
      alert('Failed to add crontab entry')
    }
  }

  const updateEntry = async (id: number, updatedEntry: Partial<CrontabEntry>) => {
    try {
      const response = await fetch('/api/crontab-db', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updatedEntry }),
      })
      
      if (response.ok) {
        await loadCrontab()
        setIsEditing(null)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to update crontab entry:', error)
      alert('Failed to update crontab entry')
    }
  }

  const deleteEntry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this crontab entry?')) return

    try {
      const response = await fetch(`/api/crontab-db?id=${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await loadCrontab()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to delete crontab entry:', error)
      alert('Failed to delete crontab entry')
    }
  }

  const toggleActive = async (id: number, currentActive: boolean) => {
    await updateEntry(id, { isActive: !currentActive })
  }

  return (
    <div className="space-y-4">
      {/* Add New Entry Button */}
      {!showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={() => setShowAddForm(true)}
              className="h-10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Crontab Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add New Entry Form */}
      {showAddForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Plus className="h-5 w-5" />
              <span>Add New Crontab Entry</span>
            </CardTitle>
            <CardDescription>
              Add a new scheduled task to your crontab
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="e.g., nightly-backup"
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Schedule</label>
                <Input
                  placeholder="* * * * *"
                  value={newEntry.schedule}
                  onChange={(e) => setNewEntry({ ...newEntry, schedule: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Command</label>
                <Input
                  placeholder="echo 'Hello World'"
                  value={newEntry.command}
                  onChange={(e) => setNewEntry({ ...newEntry, command: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Optional description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <Button
                onClick={addEntry}
                className="h-9"
                disabled={!newEntry.name || !newEntry.schedule || !newEntry.command}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setNewEntry({ name: '', schedule: '', command: '', description: '' })
                }}
                className="h-9"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Crontab Entries ({entries.length})</CardTitle>
          <CardDescription>
            Manage your scheduled tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  {isEditing === entry.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <Input
                          value={entry.name}
                          onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                          className="h-9"
                        />
                        <Input
                          value={entry.schedule}
                          onChange={(e) => updateEntry(entry.id, { schedule: e.target.value })}
                          className="h-9"
                        />
                        <Input
                          value={entry.command}
                          onChange={(e) => updateEntry(entry.id, { command: e.target.value })}
                          className="h-9"
                        />
                        <Input
                          value={entry.description || ''}
                          onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(null)}
                          className="h-8"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsEditing(null)}
                          className="h-8"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-base text-primary">{entry.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            entry.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                        )}
                        
                        <div className="bg-muted p-3 rounded text-sm font-mono">
                          <span className="text-primary font-semibold">{entry.schedule}</span>
                          <span className="mx-2">→</span>
                          <span>{entry.command}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Created: {new Date(entry.createdAt).toLocaleDateString()}</span>
                          {entry.lastRun && (
                            <span>Last: {new Date(entry.lastRun).toLocaleDateString()}</span>
                          )}
                          {entry.nextRun && (
                            <span>Next: {new Date(entry.nextRun).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-1 ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(entry.id)}
                          className="h-8 w-8 p-0"
                          title="Edit entry"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(entry.id, entry.isActive)}
                          className={`h-8 px-2 ${
                            entry.isActive ? 'text-orange-600' : 'text-green-600'
                          }`}
                          title={entry.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {entry.isActive ? 'Pause' : 'Start'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                          className="h-8 w-8 p-0 text-red-600"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {entries.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p>No crontab entries found. Add your first entry above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
