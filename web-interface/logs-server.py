#!/usr/bin/env python3
"""
Simple HTTP server to serve logs API endpoint
Bypasses Next.js to directly serve log file information
"""

import os
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Get domain from environment variable, default to localhost
DOMAIN = os.environ.get('DOMAIN', 'localhost')
FRONTEND_URL = f"http://{DOMAIN}:3000"

class LogsAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        
        if parsed_url.path == '/api/logs':
            self.handle_logs_api()
        elif parsed_url.path.startswith('/api/logs/'):
            # Handle individual log file requests
            filename = parsed_url.path.replace('/api/logs/', '')
            if filename:
                self.handle_log_file_api(filename)
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', FRONTEND_URL)
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid filename'}).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', FRONTEND_URL)
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_DELETE(self):
        parsed_url = urlparse(self.path)
        
        if parsed_url.path.startswith('/api/logs/'):
            filename = parsed_url.path.replace('/api/logs/', '')
            if filename:
                self.handle_delete_log_file(filename)
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', FRONTEND_URL)
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid filename'}).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', FRONTEND_URL)
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', FRONTEND_URL)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400')  # 24 hours
        self.end_headers()
    
    def handle_logs_api(self):
        try:
            logs_dir = '/app/logs'  # Changed from /logs to /app/logs
            
            # Check if logs directory exists
            if not os.path.exists(logs_dir):
                self.send_error_response('Logs directory not found', 500)
                return
            
            if not os.path.isdir(logs_dir):
                self.send_error_response('Logs path is not a directory', 500)
                return
            
            # Get list of files
            try:
                files = os.listdir(logs_dir)
            except PermissionError:
                self.send_error_response('Permission denied accessing logs directory', 500)
                return
            
            # Get file stats
            file_stats = []
            for filename in files:
                try:
                    file_path = os.path.join(logs_dir, filename)
                    stat = os.stat(file_path)
                    
                    file_stats.append({
                        'name': filename,
                        'size': stat.st_size,
                        'lastModified': time.ctime(stat.st_mtime)
                    })
                except Exception as e:
                    print(f"Error processing file {filename}: {e}")
                    file_stats.append({
                        'name': filename,
                        'size': 0,
                        'lastModified': time.ctime(),
                        'error': str(e)
                    })
            
            # Sort by last modified (newest first)
            file_stats.sort(key=lambda x: x.get('lastModified', ''), reverse=True)
            
            # Send response
            response_data = {
                'files': file_stats,
                'message': 'Logs served by Python server',
                'timestamp': time.ctime(),
                'total_files': len(file_stats)
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Access-Control-Allow-Origin', FRONTEND_URL)
            self.end_headers()
            
            self.wfile.write(json.dumps(response_data, indent=2).encode())
            
        except Exception as e:
            print(f"Error in logs API: {e}")
            self.send_error_response(f'Internal server error: {str(e)}', 500)
    
    def handle_log_file_api(self, filename):
        """Handle GET request for individual log file content"""
        try:
            logs_dir = '/app/logs'  # Changed from /logs to /app/logs
            file_path = os.path.join(logs_dir, filename)
            
            # Security check: ensure filename doesn't contain path traversal
            if '..' in filename or '/' in filename:
                self.send_error_response('Invalid filename', 400)
                return
            
            # Check if file exists
            if not os.path.exists(file_path):
                self.send_error_response('Log file not found', 404)
                return
            
            if not os.path.isfile(file_path):
                self.send_error_response('Path is not a file', 400)
                return
            
            # Read file content
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                response_data = {
                    'filename': filename,
                    'content': content,
                    'size': len(content),
                    'timestamp': time.ctime()
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Access-Control-Allow-Origin', FRONTEND_URL)
                self.end_headers()
                
                self.wfile.write(json.dumps(response_data, indent=2).encode())
                
            except Exception as e:
                self.send_error_response(f'Error reading file: {str(e)}', 500)
                
        except Exception as e:
            print(f"Error in log file API: {e}")
            self.send_error_response(f'Internal server error: {str(e)}', 500)
    
    def handle_delete_log_file(self, filename):
        """Handle DELETE request for individual log file"""
        try:
            logs_dir = '/app/logs'  # Changed from /logs to /app/logs
            file_path = os.path.join(logs_dir, filename)
            
            # Security check: ensure filename doesn't contain path traversal
            if '..' in filename or '/' in filename:
                self.send_error_response('Invalid filename', 400)
                return
            
            # Check if file exists
            if not os.path.exists(file_path):
                self.send_error_response('Log file not found', 404)
                return
            
            if not os.path.isfile(file_path):
                self.send_error_response('Path is not a file', 400)
                return
            
            # Delete the file
            try:
                os.remove(file_path)
                
                response_data = {
                    'message': f'Log file {filename} deleted successfully',
                    'filename': filename,
                    'timestamp': time.ctime()
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', FRONTEND_URL)
                self.end_headers()
                
                self.wfile.write(json.dumps(response_data, indent=2).encode())
                
            except Exception as e:
                self.send_error_response(f'Error deleting file: {str(e)}', 500)
                
        except Exception as e:
            print(f"Error in delete log file API: {e}")
            self.send_error_response(f'Internal server error: {str(e)}', 500)
    
    def send_error_response(self, message, status_code):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', FRONTEND_URL)
        self.end_headers()
        error_data = {
            'error': message,
            'timestamp': time.ctime()
        }
        self.wfile.write(json.dumps(error_data).encode())
    
    def log_message(self, format, *args):
        # Custom logging to avoid Next.js interference
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def run_server(port=3001):
    server_address = ('', port)
    httpd = HTTPServer(server_address, LogsAPIHandler)
    print(f"🚀 Python Logs Server starting on port {port}")
    print(f"📁 Logs directory: /app/logs")
    print(f"🌐 API endpoint: http://{DOMAIN}:{port}/api/logs")
    print(f"🔗 Frontend URL: {FRONTEND_URL}")
    print(f"⏰ Started at: {time.ctime()}")
    print("=" * 50)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    finally:
        httpd.server_close()

if __name__ == '__main__':
    run_server()
