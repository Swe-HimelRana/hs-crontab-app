#!/bin/bash

# Start cron service
crond -f -d 8 &

# Function to reload crontab
reload_crontab() {
    echo "Reloading crontab..."
    if [ -f "/app/crontab.txt" ]; then
        cp /app/crontab.txt /etc/cron.d/crontab.txt
        crontab /etc/cron.d/crontab.txt
        echo "Crontab reloaded at $(date)"
    else
        echo "No crontab.txt found"
    fi
}

# Initial crontab load
reload_crontab

# Watch for changes in crontab.txt and reload
echo "Starting crontab file watcher..."
inotifywait -m -e modify,create,delete /app/crontab.txt | while read path action file; do
    echo "Crontab file changed: $action $file"
    sleep 1  # Wait a bit for file to be fully written
    reload_crontab
done
