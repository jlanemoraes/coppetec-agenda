#!/bin/sh
set -eu

DATABASE_FILE="/app/data/agenda.db"
SEED_FILE="/app/seed/agenda.db"

if [ ! -f "$DATABASE_FILE" ]; then
    cp "$SEED_FILE" "$DATABASE_FILE"
fi

exec java -jar /app/app.jar "$@"
