# HS Crontab Manager

A container-based crontab management system with a modern web interface built in Next.js.

## Features

- **Container-based crontab system** - Runs in Docker containers for easy deployment
- **Web interface** - Modern Next.js UI for managing crontab entries
- **Real-time log viewing** - View and manage log files through the web interface
- **Automatic crontab reloading** - Changes are automatically applied when the crontab file is modified
- **Persistent storage** - Logs are stored on the host machine in the `/logs/` directory

## Architecture

The system consists of two main components:

1. **Crontab Service** (`crontab-service/`) - Ubuntu-based container running cron daemon
2. **Web Interface** (`web-interface/`) - Next.js application for managing crontabs and viewing logs

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Port 3000 available on your host machine

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hs-crontab
```

2. Start the system:
```bash
docker-compose up -d
```

3. Access the web interface:
   - Open your browser and navigate to `http://localhost:3000`
   - You'll see the HS Crontab Manager interface

### Usage

#### Managing Crontab Entries

1. **View Entries**: The current crontab entries are displayed in the "Crontab Management" tab
2. **Add Entry**: Use the form at the top to add new crontab entries
   - **Schedule**: Use standard cron format (e.g., `* * * * *` for every minute)
   - **Command**: The command to execute
   - **Comment**: Optional description for the entry
3. **Edit Entry**: Click the pencil icon next to any entry to edit it
4. **Delete Entry**: Click the trash icon to remove an entry

#### Viewing Logs

1. **Browse Logs**: Switch to the "Log Viewer" tab to see all available log files
2. **View Content**: Click on any log file to view its contents
3. **Delete Logs**: Use the trash icon to remove log files
4. **Refresh**: Click the refresh button to reload the log file list

## File Structure

```
hs-crontab/
├── docker-compose.yml          # Main orchestration file
├── crontab.txt                 # Crontab entries file
├── logs/                       # Log files directory (mounted from host)
├── crontab-service/            # Crontab service container
│   └── Dockerfile             # Ubuntu-based cron container
├── web-interface/             # Next.js web application
│   ├── Dockerfile            # Next.js container
│   ├── package.json          # Node.js dependencies
│   ├── app/                  # Next.js app directory
│   │   ├── page.tsx         # Main page component
│   │   ├── components/      # React components
│   │   └── api/            # API routes
│   └── ...                  # Other Next.js files
└── README.md                # This file
```

## Configuration

### Crontab Format

The system uses standard cron format:
```
minute hour day month day_of_week command
```

Examples:
- `* * * * * echo "Every minute"` - Runs every minute
- `0 * * * * echo "Every hour"` - Runs at the top of every hour
- `0 2 * * * echo "Daily at 2 AM"` - Runs daily at 2:00 AM
- `0 3 * * 0 echo "Weekly on Sunday"` - Runs weekly on Sunday at 3:00 AM

### Environment Variables

You can customize the system by modifying the `docker-compose.yml` file:

- `TZ`: Timezone for the crontab service (default: UTC)
- `NODE_ENV`: Environment for the web interface (default: production)

### Volume Mounts

- `./crontab.txt:/etc/cron.d/crontab.txt` - Crontab file
- `./logs:/logs` - Log files directory
- `./crontab.txt:/app/crontab.txt` - Crontab file for web interface
- `./logs:/app/logs` - Log files for web interface

## Development

### Local Development

To run the web interface in development mode:

```bash
cd web-interface
npm install
npm run dev
```

### Building from Source

```bash
# Build the containers
docker-compose build

# Start the services
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   - Change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

2. **Permission issues with logs directory**
   - Ensure the logs directory has proper permissions:
   ```bash
   chmod 755 logs/
   ```

3. **Crontab not updating**
   - Check if the crontab service is running:
   ```bash
   docker-compose logs crontab-system
   ```

### Logs

View container logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs crontab-system
docker-compose logs web-interface
```

## Security Considerations

- The web interface runs in a container with limited access to the host filesystem
- Log file access is restricted to the `/app/logs` directory
- Crontab file access is restricted to the `/app/crontab.txt` file
- All file operations include path validation to prevent directory traversal attacks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
