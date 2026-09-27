#!/usr/bin/env sh
set -e

mkdir -p database
touch database/database.sqlite
chmod 777 database database/database.sqlite

php artisan config:cache

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force
    php artisan db:seed --force || true
fi

# Lance le worker de file d'attente en tâche de fond (compatible Render Free Tier)
php artisan queue:work --tries=1 &

exec "$@"
