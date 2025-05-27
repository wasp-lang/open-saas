#!/usr/bin/env bash
set -e

# Validate DB connectivity
psql "$DATABASE_URL" -c '\q' 2>/dev/null || { echo "ERROR: Cannot connect to DB"; exit 1; }

TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
BACKUP_DIR="/mnt/data/backups"
RETENTION_DAYS=7
mkdir -p "$BACKUP_DIR"

echo "→ Dumping DB"
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db_$TIMESTAMP.sql"

echo "→ Archiving code"
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='backups' \
    --exclude='debug-output' \
    --exclude='playwright-report' \
    --exclude='attached_assets' \
    --exclude='temp' \
    -czf "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" .

echo "→ Validating archive"
tar -tzf "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" >/dev/null || { echo "ERROR: Tar validation failed"; exit 1; }

echo "→ Cleaning old backups"
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup finished: $TIMESTAMP"
