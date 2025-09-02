# HS Crontab Manager

A modern, containerized crontab management system with a beautiful web interface built in Next.js. All services run in a single Docker container for easy deployment and management.

## ✨ Features

- **🔐 Secure Authentication** - JWT-based login system with password management
- **🎨 Modern UI/UX** - Beautiful, responsive interface with dark/light mode support
- **📱 Single Container** - All services consolidated into one Docker image
- **⏰ Crontab Management** - Add, edit, delete, and test cron jobs through the web interface
- **📊 Real-time Logs** - View and manage log files with live updates
- **🔄 Auto-reload** - Crontab changes are automatically applied
- **🧪 Command Testing** - Test commands before adding them to crontab
- **🔧 Settings Management** - Change passwords and manage user preferences
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices

## 🏗️ Architecture

The system is now **consolidated into a single container** that runs multiple services using Supervisor:

- **Next.js Web Interface** - React-based frontend with API routes
- **Python Logs Server** - HTTP server for log file access
- **Crontab Service** - Cron daemon with file watching capabilities
- **Supervisor** - Process manager coordinating all services

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Ports 3000 and 3001 available on your host machine

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd hs-crontab
```

2. **Start the system:**
```bash
docker-compose up -d
```

3. **Access the web interface:**
   - Open your browser and navigate to `http://localhost:3000`
   - Login with default credentials:
     - **Username:** `crontab`
     - **Password:** `crontab123`

## 📖 Usage Guide

### 🔐 Authentication

- **First Time:** Use default credentials `crontab/crontab123`
- **Change Password:** Go to Settings tab after login
- **Secure:** JWT tokens with 24-hour expiration

### ⏰ Crontab Management

1. **View Entries** - See all current cron jobs in the "Crontab Management" tab
2. **Add New Entry** - Click "Add New Crontab Entry" button to expand the form
3. **Edit Entries** - Click the pencil icon to modify existing jobs
4. **Delete Entries** - Click the trash icon to remove jobs
5. **Auto-save** - Changes are automatically applied to the system

### 🧪 Command Testing

1. **Test Commands** - Switch to "Test Commands" tab
2. **Execute Commands** - Run commands safely before adding to crontab
3. **View Output** - See command results and any errors

### 📊 Log Management

1. **Browse Logs** - Switch to "Log Viewer" tab
2. **View Content** - Click on log files to see contents
3. **Delete Logs** - Remove old log files as needed
4. **Real-time Updates** - Logs are updated automatically

### 🎨 Theme & Settings

1. **Dark/Light Mode** - Toggle theme using the switch in the header
2. **Password Change** - Update your password in the Settings tab
3. **Responsive Layout** - Interface adapts to your screen size

## 📁 File Structure

```
hs-crontab/
├── docker-compose.yml              # Container orchestration
├── auth.db                         # SQLite authentication database
├── crontab.txt                     # Crontab entries file
├── logs/                           # Log files directory
├── web-interface/                  # Main application directory
│   ├── Dockerfile                  # Single container definition
│   ├── supervisord.conf            # Process manager configuration
│   ├── start-cron.sh              # Cron service startup script
│   ├── logs-server.py             # Python logs HTTP server
│   ├── package.json               # Node.js dependencies
│   ├── app/                       # Next.js application
│   │   ├── page.tsx              # Main dashboard
│   │   ├── login/page.tsx        # Authentication page
│   │   ├── components/           # React components
│   │   ├── contexts/             # React contexts (Auth, Theme)
│   │   ├── api/                  # API routes
│   │   └── globals.css           # Global styles with CSS variables
│   └── lib/                      # Utility libraries
│       └── auth.ts               # Authentication functions
└── README.md                      # This file
```

## ⚙️ Configuration

### Environment Variables

Configure the system via `docker-compose.yml`:

```yaml
environment:
  - TZ=UTC                    # Timezone for cron jobs
  - DOMAIN=localhost          # Domain for API calls
  - JWT_SECRET=your-secret    # JWT signing secret
```

### Volume Mounts

```yaml
volumes:
  - ./crontab.txt:/app/crontab.txt    # Crontab file
  - ./logs:/app/logs                  # Log files
  - ./auth.db:/app/auth.db            # Authentication database
```

### Ports

- **3000** - Web interface (Next.js)
- **3001** - Logs server (Python HTTP server)

## 🛠️ Development

### Local Development

```bash
cd web-interface
npm install
npm run dev
```

### Building & Testing

```bash
# Build the container
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🔧 Troubleshooting

### Common Issues

1. **Login not working**
   - Ensure `auth.db` file exists and has correct permissions
   - Check container logs: `docker logs hs-crontab-all-in-one`

2. **Port conflicts**
   - Change ports in `docker-compose.yml` if needed
   - Stop conflicting services: `docker ps` then `docker stop <container-id>`

3. **Database errors**
   - Verify `auth.db` file is properly mounted
   - Check file permissions: `chmod 666 auth.db`

4. **Crontab not updating**
   - Check cron service logs: `docker exec hs-crontab-all-in-one supervisorctl status`

### Log Locations

```bash
# Container logs
docker logs hs-crontab-all-in-one

# Service-specific logs
docker exec hs-crontab-all-in-one cat /app/nextjs.err.log
docker exec hs-crontab-all-in-one cat /app/logs-server.err.log
docker exec hs-crontab-all-in-one cat /app/crontab-service.err.log
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - All user inputs are validated and sanitized
- **Path Validation** - Prevents directory traversal attacks
- **Container Isolation** - Limited host filesystem access

## 🎯 Crontab Format

Standard cron syntax:
```
minute hour day month day_of_week command
```

**Examples:**
- `* * * * * echo "Every minute"`
- `0 * * * * echo "Every hour"`
- `0 2 * * * echo "Daily at 2 AM"`
- `0 3 * * 0 echo "Weekly on Sunday at 3 AM"`

## 🚀 Performance Features

- **Single Container** - Reduced resource usage and complexity
- **Process Management** - Supervisor ensures all services stay running
- **Auto-restart** - Services automatically restart on failure
- **Efficient Logging** - Structured logging with rotation support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔄 Recent Updates

- **v2.0** - Consolidated to single container architecture
- **v1.5** - Added authentication system and user management
- **v1.4** - Implemented dark mode and improved UI/UX
- **v1.3** - Added command testing functionality
- **v1.2** - Enhanced log management and real-time updates
- **v1.1** - Initial release with basic crontab management

---

**Built with ❤️ using Next.js, React, Docker, and Python**
