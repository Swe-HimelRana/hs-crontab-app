'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, FileText, LogOut, User, Settings } from 'lucide-react'
import CrontabManager from './components/CrontabManager'
import LogViewer from './components/LogViewer'
import TestCommand from './components/TestCommand'
import PasswordChange from './components/PasswordChange'
import ErrorBoundary from './components/ErrorBoundary'
import ThemeToggle from './components/ThemeToggle'

export default function Home() {
  const { user, loading, logout } = useAuth()

  // Immediate redirect if no user and not loading
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user detected, redirecting to login...')
      window.location.href = '/login'
    }
  }, [user, loading])

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Loading...</p>
            <p className="text-sm text-muted-foreground">Checking authentication</p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading screen if no user (will redirect to login)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Redirecting to login...</p>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">HS Crontab Manager</h1>
                  <p className="text-sm text-muted-foreground">Manage your scheduled tasks</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                Manage your crontab entries and monitor system logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="crontab" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="crontab" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Crontab Management</span>
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Log Viewer</span>
                  </TabsTrigger>
                  <TabsTrigger value="test" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Test Commands</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="crontab" className="mt-6">
                  <CrontabManager />
                </TabsContent>
                
                <TabsContent value="logs" className="mt-6">
                  <LogViewer />
                </TabsContent>

                <TabsContent value="test" className="mt-6">
                  <TestCommand />
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <div className="max-w-md mx-auto">
                    <PasswordChange />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </ErrorBoundary>
  )
}
