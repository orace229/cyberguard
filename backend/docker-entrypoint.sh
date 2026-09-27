#!/usr/bin/env sh
set -e

mkdir -p database
touch database/database.sqlite
chmod -R 777 database

php artisan config:clear
php artisan route:clear

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force --no-interaction
    php artisan db:seed --force --no-interaction || true
fi

# Lance le worker de file d'attente en tâche de fond (compatible Render Free Tier)
php artisan queue:work --tries=1 &

exec "$@"
