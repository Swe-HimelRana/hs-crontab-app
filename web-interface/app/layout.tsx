import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HS Crontab Manager',
  description: 'Container-based crontab management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Suppress browser extension errors globally
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('bootstrap-autofill-overlay') || 
                      message.includes('insertBefore') ||
                      message.includes('NotFoundError') ||
                      message.includes('Failed to execute')) {
                    console.log('Suppressed browser extension error:', ...args);
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('bootstrap-autofill-overlay') || 
                      message.includes('insertBefore') ||
                      message.includes('NotFoundError') ||
                      message.includes('Failed to execute')) {
                    console.log('Suppressed browser extension warning:', ...args);
                    return;
                  }
                  originalWarn.apply(console, args);
                };
                
                // Handle unhandled promise rejections
                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason;
                  if (reason && typeof reason === 'object' && reason.message) {
                    if (reason.message.includes('bootstrap-autofill-overlay') || 
                        reason.message.includes('insertBefore') ||
                        reason.message.includes('NotFoundError') ||
                        reason.message.includes('Failed to execute')) {
                      console.log('Suppressed browser extension error (unhandled rejection):', reason);
                      event.preventDefault();
                      return;
                    }
                  }
                });
                
                // Handle unhandled errors
                window.addEventListener('error', function(event) {
                  if (event.error && typeof event.error === 'object' && event.error.message) {
                    if (event.error.message.includes('bootstrap-autofill-overlay') || 
                        event.error.message.includes('insertBefore') ||
                        event.error.message.includes('NotFoundError') ||
                        event.error.message.includes('Failed to execute')) {
                      console.log('Suppressed browser extension error (unhandled error):', event.error);
                      event.preventDefault();
                      return;
                    }
                  }
                });
              })();
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
